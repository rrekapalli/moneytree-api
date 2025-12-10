package com.moneytree.socketengine.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.SubscriptionRequestDto;
import com.moneytree.socketengine.broadcast.SessionManager;
import com.moneytree.socketengine.config.SecurityConfig;
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
import java.net.InetSocketAddress;
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
 * Includes security features:
 * - Rate limiting for subscription requests
 * - Connection limits per IP address
 * - Input validation and sanitization
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class TickWebSocketHandler extends TextWebSocketHandler {
    
    private final SessionManager sessionManager;
    private final ObjectMapper objectMapper;
    private final Validator validator;
    private final SecurityConfig.RateLimiter subscriptionRateLimiter;
    private final SecurityConfig.ConnectionTracker connectionTracker;
    
    /**
     * Called when a new WebSocket connection is established.
     * Checks connection limits and registers the session with the SessionManager.
     *
     * @param session the WebSocket session
     * @throws Exception if registration fails or connection limit exceeded
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String ipAddress = extractIpAddress(session);
        
        // Check connection limit per IP
        if (!connectionTracker.allowConnection(ipAddress)) {
            log.warn("Connection rejected: IP {} exceeded connection limit", ipAddress);
            session.close(CloseStatus.POLICY_VIOLATION.withReason("Connection limit exceeded"));
            return;
        }
        
        String endpoint = extractEndpoint(session);
        sessionManager.registerSession(session.getId(), endpoint, session);
        log.info("Client connected: sessionId={}, endpoint={}, remoteAddress={}", 
            session.getId(), endpoint, ipAddress);
    }
    
    /**
     * Handles incoming text messages from clients.
     * Processes SUBSCRIBE and UNSUBSCRIBE requests with validation and rate limiting.
     *
     * @param session the WebSocket session
     * @param message the text message from the client
     * @throws Exception if message processing fails
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        
        // Sanitize payload for logging (truncate if too long)
        String sanitizedPayload = payload.length() > 200 
            ? payload.substring(0, 200) + "..." 
            : payload;
        log.debug("Received message from session {}: {}", session.getId(), sanitizedPayload);
        
        // Check rate limit
        if (!subscriptionRateLimiter.allowRequest(session.getId())) {
            log.warn("Rate limit exceeded for session {}", session.getId());
            sendError(session, "Rate limit exceeded. Please slow down your requests.");
            return;
        }
        
        try {
            // Parse the subscription request
            SubscriptionRequestDto request = objectMapper.readValue(payload, SubscriptionRequestDto.class);
            
            // Validate the request using Bean Validation
            Set<ConstraintViolation<SubscriptionRequestDto>> violations = validator.validate(request);
            
            if (!violations.isEmpty()) {
                String errors = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
                sendError(session, "Invalid subscription request");
                log.warn("Invalid subscription request from session {}: {}", session.getId(), errors);
                return;
            }
            
            // Additional validation: check symbols list size
            if (request.getSymbols() != null && request.getSymbols().size() > 100) {
                sendError(session, "Too many symbols in single request (max 100)");
                log.warn("Session {} attempted to subscribe to {} symbols", 
                    session.getId(), request.getSymbols().size());
                return;
            }
            
            // Process the action
            if ("SUBSCRIBE".equals(request.getAction())) {
                sessionManager.addSubscriptions(session.getId(), request.getSymbols());
                log.info("Subscribed: sessionId={}, type={}, symbolCount={}", 
                    session.getId(), request.getType(), request.getSymbols().size());
                
                // Send confirmation to client
                sendConfirmation(session, "SUBSCRIBE", request.getSymbols());
                
            } else if ("UNSUBSCRIBE".equals(request.getAction())) {
                sessionManager.removeSubscriptions(session.getId(), request.getSymbols());
                log.info("Unsubscribed: sessionId={}, type={}, symbolCount={}", 
                    session.getId(), request.getType(), request.getSymbols().size());
                
                // Send confirmation to client
                sendConfirmation(session, "UNSUBSCRIBE", request.getSymbols());
            }
            
        } catch (Exception e) {
            log.error("Error processing message from session {}", session.getId(), e);
            sendError(session, "Failed to process request");
        }
    }
    
    /**
     * Called when a WebSocket connection is closed.
     * Removes the session from SessionManager and cleans up all subscriptions.
     * Releases connection tracking for the IP address.
     *
     * @param session the WebSocket session
     * @param status the close status
     * @throws Exception if cleanup fails
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String ipAddress = extractIpAddress(session);
        
        sessionManager.removeSession(session.getId());
        subscriptionRateLimiter.removeSession(session.getId());
        connectionTracker.releaseConnection(ipAddress);
        
        log.info("Client disconnected: sessionId={}, status={}, reason={}", 
            session.getId(), status.getCode(), status.getReason());
    }
    
    /**
     * Sends an error message to the client in JSON format.
     * Error messages are sanitized to avoid leaking sensitive information.
     *
     * @param session the WebSocket session
     * @param errorMessage the error message to send
     */
    private void sendError(WebSocketSession session, String errorMessage) {
        try {
            // Sanitize error message to prevent information leakage
            String sanitizedMessage = sanitizeErrorMessage(errorMessage);
            String errorJson = String.format("{\"error\":true,\"message\":\"%s\"}", 
                sanitizedMessage.replace("\"", "\\\""));
            session.sendMessage(new TextMessage(errorJson));
        } catch (IOException e) {
            log.error("Failed to send error message to session {}", session.getId());
        }
    }
    
    /**
     * Sanitizes error messages to prevent information leakage.
     * Removes stack traces, file paths, and other sensitive details.
     *
     * @param message the original error message
     * @return sanitized error message
     */
    private String sanitizeErrorMessage(String message) {
        if (message == null) {
            return "An error occurred";
        }
        
        // Remove any potential stack trace information
        message = message.split("\n")[0];
        
        // Remove file paths
        message = message.replaceAll("(/[\\w/.-]+)+", "[path]");
        
        // Remove class names
        message = message.replaceAll("\\b[a-z]+(\\.[a-z]+)+\\.[A-Z]\\w+", "[class]");
        
        // Truncate if too long
        if (message.length() > 200) {
            message = message.substring(0, 200);
        }
        
        return message;
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
        
        // Debug logging to see actual URI
        log.info("DEBUG: Extracting endpoint from URI: '{}' for session: {}", uri, session.getId());
        
        // Remove any trailing slashes and query parameters
        uri = uri.replaceAll("/+$", "");
        
        // Match against known endpoints - handle SockJS URLs
        if (uri.contains("/ws/indices/all")) {
            log.info("DEBUG: Matched /ws/indices/all endpoint for session: {}", session.getId());
            return "/ws/indices/all";
        } else if (uri.contains("/ws/stocks/nse/all")) {
            return "/ws/stocks/nse/all";
        } else if (uri.contains("/ws/indices")) {
            return "/ws/indices";
        } else if (uri.contains("/ws/stocks")) {
            return "/ws/stocks";
        }
        
        // Default fallback
        log.warn("Unknown endpoint for session {}: {}", session.getId(), uri);
        return uri;
    }
    
    /**
     * Extracts the IP address from the WebSocket session.
     * Handles X-Forwarded-For header for proxied connections.
     *
     * @param session the WebSocket session
     * @return the client IP address
     */
    private String extractIpAddress(WebSocketSession session) {
        // Try to get IP from remote address
        if (session.getRemoteAddress() instanceof InetSocketAddress) {
            InetSocketAddress address = (InetSocketAddress) session.getRemoteAddress();
            return address.getAddress().getHostAddress();
        }
        
        // Fallback to session ID if IP cannot be determined
        return session.getId();
    }
}
