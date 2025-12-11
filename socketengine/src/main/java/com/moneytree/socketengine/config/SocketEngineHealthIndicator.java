package com.moneytree.socketengine.config;

import com.moneytree.socketengine.broadcast.SessionManager;
import com.moneytree.socketengine.kite.KiteWebSocketClient;
import com.moneytree.socketengine.persistence.TickBatchBuffer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Custom health indicator for SocketEngine module.
 * Monitors critical components and reports overall health status.
 * 
 * Health checks:
 * - Kite WebSocket connection status
 * - Tick buffer size (warns if > maxBufferSize, marks DOWN only if critically high)
 * - Active WebSocket sessions count
 */
@Component
@Slf4j
public class SocketEngineHealthIndicator implements HealthIndicator {
    
    // Warning threshold: 2x the configured max buffer size (normal operation can exceed max temporarily)
    private static final double BUFFER_WARNING_MULTIPLIER = 2.0;
    
    // Critical threshold: 10x the configured max buffer size (indicates serious issue - database persistence likely failing)
    // Increased from 5x to 10x to account for normal accumulation during market hours and slow persistence
    private static final double BUFFER_CRITICAL_MULTIPLIER = 10.0;
    
    private final KiteWebSocketClient kiteClient;
    private final TickBatchBuffer tickBuffer;
    private final SessionManager sessionManager;
    private final SocketEngineProperties properties;
    
    public SocketEngineHealthIndicator(
            KiteWebSocketClient kiteClient,
            TickBatchBuffer tickBuffer,
            SessionManager sessionManager,
            SocketEngineProperties properties) {
        this.kiteClient = kiteClient;
        this.tickBuffer = tickBuffer;
        this.sessionManager = sessionManager;
        this.properties = properties;
    }
    
    @Override
    public Health health() {
        try {
            boolean kiteConnected = kiteClient.isConnected();
            long bufferSize = tickBuffer.getBufferSize();
            int activeSessions = sessionManager.getActiveSessionCount();
            long maxBufferSize = properties.getPersistence().getMaxBufferSize();
            
            // Calculate thresholds based on configured max buffer size
            long warningThreshold = (long) (maxBufferSize * BUFFER_WARNING_MULTIPLIER);
            long criticalThreshold = (long) (maxBufferSize * BUFFER_CRITICAL_MULTIPLIER);
            
            // Build health details
            var healthBuilder = Health.up()
                .withDetail("kiteConnected", kiteConnected)
                .withDetail("bufferSize", bufferSize)
                .withDetail("maxBufferSize", maxBufferSize)
                .withDetail("activeSessions", activeSessions)
                .withDetail("usingOfficialKiteTicker", true);
            
            // Kite connection status - warn but don't mark DOWN
            // Kite may disconnect during market closure, but websocket service should remain UP
            if (!kiteConnected) {
                log.info("Health check: Kite WebSocket is not connected (may be normal during market closure)");
                healthBuilder.withDetail("warning", "Kite WebSocket connection is down - service is UP but no data flow")
                    .withDetail("note", "This is normal when market is closed");
            }
            
            // Check buffer size thresholds
            if (bufferSize > criticalThreshold) {
                // Critical: Buffer is extremely large - likely database persistence is failing
                log.error("Health check: Buffer size {} critically exceeds threshold {} ({}x max buffer size)", 
                    bufferSize, criticalThreshold, BUFFER_CRITICAL_MULTIPLIER);
                healthBuilder.down()
                    .withDetail("issue", "Buffer size critically exceeds threshold: " + bufferSize)
                    .withDetail("criticalThreshold", criticalThreshold);
            } else if (bufferSize > warningThreshold) {
                // Warning: Buffer is large but not critical - log warning but don't mark as DOWN
                log.warn("Health check: Buffer size {} exceeds warning threshold {} ({}x max buffer size) - monitoring", 
                    bufferSize, warningThreshold, BUFFER_WARNING_MULTIPLIER);
                healthBuilder.withDetail("warning", "Buffer size exceeds warning threshold: " + bufferSize)
                    .withDetail("warningThreshold", warningThreshold);
            } else if (bufferSize > maxBufferSize) {
                // Info: Buffer exceeds configured max but is within normal operation range
                log.info("Health check: Buffer size {} exceeds configured max {} (normal during accumulation phase)", 
                    bufferSize, maxBufferSize);
            }
            
            return healthBuilder.build();
            
        } catch (Exception e) {
            log.error("Error performing health check", e);
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
