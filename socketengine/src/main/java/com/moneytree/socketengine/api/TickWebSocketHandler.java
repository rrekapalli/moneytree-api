package com.moneytree.socketengine.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.SubscriptionRequestDto;
import com.moneytree.socketengine.broadcast.SessionManager;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Handles WebSocket connections and subscription management for all four endpoints:
 * - /ws/indices (selective index subscriptions)
 * - /ws/stocks (selective stock subscriptions)
 * - /ws/indices/all (automatic streaming of all indices)
 * - /ws/stocks/nse/all (automatic streaming of all NSE stocks)
 * 
 * Processes SUBSCRIBE/UNSUBSCRIBE messages from clients and manages session lifecycle.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class TickWebSocketHandler extends TextWebSocketHandler {
    
    private final SessionManager sessionManager;
    private final ObjectMapper objectMapper;
    private final Validator validator;
    
    /**
     * Called when a new WebSocket connection is established.
     * Registers the session with the SessionManager and logs the connection.
     *
     * @param session the WebSocket session
     * @throws Exception if registration fails
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String endpoint = extractEndpoint(session);
        sessionManager.registerSession(session.getId(), endpoint, session);
        log.info("Client connected: sessionId={}, endpoint={}, remoteAddress={}", 
            session.getId(), endpoint, session.getRemoteAddress());
    }
    
    /**
     * Handles incoming text messages from clients.
     * Processes SUBSCRIBE and UNSUBSCRIBE requests with validation.
     *
     * @param session the WebSocket session
     * @param message the text message from the client
     * @throws Exception if message processing fails
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        log.debug("Received message from session {}: {}", session.getId(), payload);
        
        try {
            // Parse the subscription request
            SubscriptionRequestDto request = objectMapper.readValue(payload, SubscriptionRequestDto.class);
            
            // Validate the request using Bean Validation
            Set<ConstraintViolation<SubscriptionRequestDto>> violations = validator.validate(request);
            
            if (!violations.isEmpty()) {
                String errors = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
                sendError(session, "Invalid subscription request: " + errors);
                log.warn("Invalid subscription request from session {}: {}", session.getId(), errors);
                return;
            }
            
            // Process the action
            if ("SUBSCRIBE".equals(request.getAction())) {
                sessionManager.addSubscriptions(session.getId(), request.getSymbols());
                log.info("Subscribed: sessionId={}, type={}, symbols={}", 
                    session.getId(), request.getType(), request.getSymbols());
                
                // Send confirmation to client
                sendConfirmation(session, "SUBSCRIBE", request.getSymbols());
                
            } else if ("UNSUBSCRIBE".equals(request.getAction())) {
                sessionManager.removeSubscriptions(session.getId(), request.getSymbols());
                log.info("Unsubscribed: sessionId={}, type={}, symbols={}", 
                    session.getId(), request.getType(), request.getSymbols());
                
                // Send confirmation to client
                sendConfirmation(session, "UNSUBSCRIBE", request.getSymbols());
            }
            
        } catch (Exception e) {
            log.error("Error processing message from session {}: {}", session.getId(), e.getMessage(), e);
            sendError(session, "Failed to process subscription message: " + e.getMessage());
        }
    }
    
    /**
     * Called when a WebSocket connection is closed.
     * Removes the session from SessionManager and cleans up all subscriptions.
     *
     * @param session the WebSocket session
     * @param status the close status
     * @throws Exception if cleanup fails
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessionManager.removeSession(session.getId());
        log.info("Client disconnected: sessionId={}, status={}, reason={}", 
            session.getId(), status.getCode(), status.getReason());
    }
    
    /**
     * Sends an error message to the client in JSON format.
     *
     * @param session the WebSocket session
     * @param errorMessage the error message to send
     */
    private void sendError(WebSocketSession session, String errorMessage) {
        try {
            String errorJson = String.format("{\"error\":true,\"message\":\"%s\"}", 
                errorMessage.replace("\"", "\\\""));
            session.sendMessage(new TextMessage(errorJson));
        } catch (IOException e) {
            log.error("Failed to send error message to session {}: {}", session.getId(), e.getMessage());
        }
    }
    
    /**
     * Sends a confirmation message to the client in JSON format.
     *
     * @param session the WebSocket session
     * @param action the action that was performed (SUBSCRIBE or UNSUBSCRIBE)
     * @param symbols the list of symbols affected
     */
    private void sendConfirmation(WebSocketSession session, String action, java.util.List<String> symbols) {
        try {
            String symbolsJson = objectMapper.writeValueAsString(symbols);
            String confirmationJson = String.format(
                "{\"success\":true,\"action\":\"%s\",\"symbols\":%s}", 
                action, symbolsJson);
            session.sendMessage(new TextMessage(confirmationJson));
        } catch (IOException e) {
            log.error("Failed to send confirmation message to session {}: {}", session.getId(), e.getMessage());
        }
    }
    
    /**
     * Extracts the endpoint path from the WebSocket session URI.
     * Determines which of the four endpoints the client connected to.
     *
     * @param session the WebSocket session
     * @return the endpoint path (e.g., "/ws/indices", "/ws/indices/all")
     */
    private String extractEndpoint(WebSocketSession session) {
        String uri = session.getUri() != null ? session.getUri().getPath() : "";
        
        // Remove any trailing slashes and query parameters
        uri = uri.replaceAll("/+$", "");
        
        // Match against known endpoints
        if (uri.endsWith("/ws/indices/all")) {
            return "/ws/indices/all";
        } else if (uri.endsWith("/ws/stocks/nse/all")) {
            return "/ws/stocks/nse/all";
        } else if (uri.endsWith("/ws/indices")) {
            return "/ws/indices";
        } else if (uri.endsWith("/ws/stocks")) {
            return "/ws/stocks";
        }
        
        // Default fallback
        log.warn("Unknown endpoint for session {}: {}", session.getId(), uri);
        return uri;
    }
}
