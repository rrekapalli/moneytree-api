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
 * - Tick buffer size (alerts if > 100,000)
 * - Active WebSocket sessions count
 */
@Component
@Slf4j
public class SocketEngineHealthIndicator implements HealthIndicator {
    
    private static final long BUFFER_SIZE_WARNING_THRESHOLD = 100_000;
    
    private final KiteWebSocketClient kiteClient;
    private final TickBatchBuffer tickBuffer;
    private final SessionManager sessionManager;
    
    public SocketEngineHealthIndicator(
            KiteWebSocketClient kiteClient,
            TickBatchBuffer tickBuffer,
            SessionManager sessionManager) {
        this.kiteClient = kiteClient;
        this.tickBuffer = tickBuffer;
        this.sessionManager = sessionManager;
    }
    
    @Override
    public Health health() {
        try {
            boolean kiteConnected = kiteClient.isConnected();
            long bufferSize = tickBuffer.getBufferSize();
            int activeSessions = sessionManager.getActiveSessionCount();
            
            // Build health details
            var healthBuilder = Health.up()
                .withDetail("kiteConnected", kiteConnected)
                .withDetail("bufferSize", bufferSize)
                .withDetail("activeSessions", activeSessions)
                .withDetail("usingOfficialKiteTicker", true);
            
            // Check for critical issues
            if (!kiteConnected) {
                log.warn("Health check: Kite WebSocket is not connected");
                healthBuilder.down()
                    .withDetail("issue", "Kite WebSocket connection is down");
            }
            
            // Check buffer size threshold
            if (bufferSize > BUFFER_SIZE_WARNING_THRESHOLD) {
                log.warn("Health check: Buffer size {} exceeds threshold {}", 
                    bufferSize, BUFFER_SIZE_WARNING_THRESHOLD);
                healthBuilder.down()
                    .withDetail("issue", "Buffer size exceeds threshold: " + bufferSize);
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
