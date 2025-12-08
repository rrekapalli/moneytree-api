package com.moneytree.socketengine.config;

import com.moneytree.socketengine.api.TickWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket configuration for the SocketEngine module.
 * 
 * Registers WebSocket endpoints for real-time market data streaming:
 * - /ws/indices: Selective index instrument subscriptions
 * - /ws/stocks: Selective stock instrument subscriptions
 * - /ws/indices/all: Automatic streaming of all NSE indices
 * - /ws/stocks/nse/all: Automatic streaming of all NSE equity stocks
 * 
 * Enables SockJS fallback for browsers without native WebSocket support.
 * Configures CORS allowed origins from application properties.
 */
@Configuration
@EnableWebSocket
@Slf4j
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final TickWebSocketHandler tickWebSocketHandler;
    
    @Value("${socketengine.websocket.allowed-origins:*}")
    private String allowedOrigins;
    
    /**
     * Registers WebSocket handlers for all four market data streaming endpoints.
     * 
     * Endpoints:
     * - /ws/indices: Clients can subscribe to specific index instruments
     * - /ws/stocks: Clients can subscribe to specific stock instruments
     * - /ws/indices/all: Automatically streams all NSE INDICES segment instruments
     * - /ws/stocks/nse/all: Automatically streams all NSE equity stocks
     * 
     * Configuration:
     * - Allowed origins: Configurable via socketengine.websocket.allowed-origins property
     * - SockJS fallback: Enabled for browser compatibility
     * 
     * Security:
     * - CORS origins should be restricted in production (not "*")
     * - Rate limiting and connection limits are enforced by TickWebSocketHandler
     * 
     * @param registry the WebSocket handler registry
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Parse allowed origins (supports comma-separated list)
        String[] origins = parseAllowedOrigins(allowedOrigins);
        
        log.info("Registering WebSocket handlers with allowed origins: {}", 
            String.join(", ", origins));
        
        // Warn if using wildcard in production
        if ("*".equals(allowedOrigins)) {
            log.warn("SECURITY WARNING: WebSocket CORS is configured to allow all origins (*). " +
                    "This should be restricted in production environments.");
        }
        
        registry.addHandler(tickWebSocketHandler, 
                "/ws/indices",           // Selective index subscriptions
                "/ws/stocks",            // Selective stock subscriptions
                "/ws/indices/all",       // All indices auto-stream
                "/ws/stocks/nse/all")    // All NSE stocks auto-stream
            .setAllowedOrigins(origins)  // Configure for production security
            .withSockJS();  // Enable SockJS fallback for older browsers
        
        log.info("WebSocket endpoints registered successfully:");
        log.info("  - /ws/indices (selective index subscriptions)");
        log.info("  - /ws/stocks (selective stock subscriptions)");
        log.info("  - /ws/indices/all (auto-stream all NSE indices)");
        log.info("  - /ws/stocks/nse/all (auto-stream all NSE equity stocks)");
    }
    
    /**
     * Parses allowed origins configuration.
     * Supports comma-separated list or single value.
     *
     * @param originsConfig the origins configuration string
     * @return array of allowed origins
     */
    private String[] parseAllowedOrigins(String originsConfig) {
        if (originsConfig == null || originsConfig.trim().isEmpty()) {
            return new String[]{"*"};
        }
        
        // Split by comma and trim whitespace
        return originsConfig.split(",\\s*");
    }
}
