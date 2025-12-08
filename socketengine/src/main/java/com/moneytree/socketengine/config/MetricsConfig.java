package com.moneytree.socketengine.config;

import com.moneytree.socketengine.broadcast.SessionManager;
import com.moneytree.socketengine.kite.KiteWebSocketClient;
import com.moneytree.socketengine.persistence.TickBatchBuffer;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Micrometer metrics in SocketEngine.
 * Registers gauges for monitoring key system metrics.
 */
@Configuration
@Slf4j
public class MetricsConfig {
    
    private final MeterRegistry meterRegistry;
    private final KiteWebSocketClient kiteClient;
    private final TickBatchBuffer tickBuffer;
    private final SessionManager sessionManager;
    
    public MetricsConfig(
            MeterRegistry meterRegistry,
            KiteWebSocketClient kiteClient,
            TickBatchBuffer tickBuffer,
            SessionManager sessionManager) {
        this.meterRegistry = meterRegistry;
        this.kiteClient = kiteClient;
        this.tickBuffer = tickBuffer;
        this.sessionManager = sessionManager;
    }
    
    /**
     * Registers all custom metrics on application startup.
     */
    @PostConstruct
    public void registerMetrics() {
        log.info("Registering SocketEngine metrics");
        
        // Gauge for Kite connection status (1 = connected, 0 = disconnected)
        Gauge.builder("socketengine.kite.connection.status", kiteClient, 
                client -> client.isConnected() ? 1.0 : 0.0)
            .description("Kite WebSocket connection status (1=connected, 0=disconnected)")
            .register(meterRegistry);
        
        // Gauge for buffer size
        Gauge.builder("socketengine.buffer.size", tickBuffer, 
                buffer -> buffer.getBufferSize())
            .description("Number of ticks buffered for persistence")
            .register(meterRegistry);
        
        // Gauge for active WebSocket sessions
        Gauge.builder("socketengine.sessions.active", sessionManager, 
                manager -> manager.getActiveSessionCount())
            .description("Number of active WebSocket client sessions")
            .register(meterRegistry);
        
        // Gauge for reconnection attempts
        Gauge.builder("socketengine.kite.reconnection.attempts", kiteClient, 
                client -> client.getReconnectionAttempts())
            .description("Number of Kite reconnection attempts since last successful connection")
            .register(meterRegistry);
        
        log.info("SocketEngine metrics registered successfully");
    }
}
