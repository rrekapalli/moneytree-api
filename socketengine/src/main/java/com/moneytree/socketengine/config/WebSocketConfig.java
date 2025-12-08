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
     * @param registry the WebSocket handler registry
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        log.info("Registering WebSocket handlers with allowed origins: {}", allowedOrigins);
        
        registry.addHandler(tickWebSocketHandler, 
                "/ws/indices",           // Selective index subscriptions
                "/ws/stocks",            // Selective stock subscriptions
                "/ws/indices/all",       // All indices auto-stream
                "/ws/stocks/nse/all")    // All NSE stocks auto-stream
            .setAllowedOrigins(allowedOrigins)  // Configure for production security
            .withSockJS();  // Enable SockJS fallback for older browsers
        
        log.info("WebSocket endpoints registered successfully:");
        log.info("  - /ws/indices (selective index subscriptions)");
        log.info("  - /ws/stocks (selective stock subscriptions)");
        log.info("  - /ws/indices/all (auto-stream all NSE indices)");
        log.info("  - /ws/stocks/nse/all (auto-stream all NSE equity stocks)");
    }
}
