package com.moneytree.socketengine.broadcast;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Manages WebSocket sessions and their subscriptions with thread-safe collections.
 * Maintains bidirectional mappings between sessions and their subscribed symbols.
 */
@Component
@Slf4j
public class SessionManager {
    
    // Thread-safe collections for concurrent access
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionEndpoints = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> sessionSubscriptions = new ConcurrentHashMap<>();
    
    // Reverse index: symbol -> sessions subscribed to it
    private final ConcurrentHashMap<String, Set<String>> symbolToSessions = new ConcurrentHashMap<>();
    
    /**
     * Registers a new WebSocket session with its endpoint.
     *
     * @param sessionId unique session identifier
     * @param endpoint the WebSocket endpoint path (e.g., /ws/indices, /ws/indices/all)
     * @param session the WebSocketSession object
     */
    public void registerSession(String sessionId, String endpoint, WebSocketSession session) {
        sessions.put(sessionId, session);
        sessionEndpoints.put(sessionId, endpoint);
        sessionSubscriptions.put(sessionId, ConcurrentHashMap.newKeySet());
        log.info("Registered session: {} on endpoint: {}", sessionId, endpoint);
    }
    
    /**
     * Adds subscriptions for a session and updates the reverse index.
     *
     * @param sessionId the session identifier
     * @param symbols list of symbols to subscribe to
     */
    public void addSubscriptions(String sessionId, List<String> symbols) {
        Set<String> subs = sessionSubscriptions.get(sessionId);
        if (subs != null) {
            subs.addAll(symbols);
            
            // Update reverse index: symbol -> sessions
            symbols.forEach(symbol -> 
                symbolToSessions.computeIfAbsent(symbol, k -> ConcurrentHashMap.newKeySet())
                    .add(sessionId)
            );
            
            log.debug("Added subscriptions for session {}: {}", sessionId, symbols);
        } else {
            log.warn("Attempted to add subscriptions for unknown session: {}", sessionId);
        }
    }
    
    /**
     * Removes subscriptions for a session and cleans up the reverse index.
     *
     * @param sessionId the session identifier
     * @param symbols list of symbols to unsubscribe from
     */
    public void removeSubscriptions(String sessionId, List<String> symbols) {
        Set<String> subs = sessionSubscriptions.get(sessionId);
        if (subs != null) {
            subs.removeAll(symbols);
            
            // Update reverse index: remove session from symbol mappings
            symbols.forEach(symbol -> {
                Set<String> sessions = symbolToSessions.get(symbol);
                if (sessions != null) {
                    sessions.remove(sessionId);
                    // Clean up empty sets
                    if (sessions.isEmpty()) {
                        symbolToSessions.remove(symbol);
                    }
                }
            });
            
            log.debug("Removed subscriptions for session {}: {}", sessionId, symbols);
        } else {
            log.warn("Attempted to remove subscriptions for unknown session: {}", sessionId);
        }
    }
    
    /**
     * Removes a session and performs full cleanup of all associated data.
     *
     * @param sessionId the session identifier to remove
     */
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        sessionEndpoints.remove(sessionId);
        
        // Clean up subscriptions and reverse index
        Set<String> subs = sessionSubscriptions.remove(sessionId);
        if (subs != null) {
            subs.forEach(symbol -> {
                Set<String> sessions = symbolToSessions.get(symbol);
                if (sessions != null) {
                    sessions.remove(sessionId);
                    // Clean up empty sets
                    if (sessions.isEmpty()) {
                        symbolToSessions.remove(symbol);
                    }
                }
            });
        }
        
        log.info("Removed session: {}", sessionId);
    }
    
    /**
     * Gets all sessions that are subscribed to a specific symbol.
     *
     * @param symbol the symbol to query
     * @return set of session IDs subscribed to the symbol (empty set if none)
     */
    public Set<String> getSessionsSubscribedTo(String symbol) {
        Set<String> sessions = symbolToSessions.get(symbol);
        return sessions != null ? new HashSet<>(sessions) : Collections.emptySet();
    }
    
    /**
     * Gets all sessions connected to the /ws/indices/all endpoint.
     * These sessions receive all index ticks automatically.
     *
     * @return set of session IDs on the /ws/indices/all endpoint
     */
    public Set<String> getIndicesAllSessions() {
        return sessionEndpoints.entrySet().stream()
            .filter(e -> "/ws/indices/all".equals(e.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }
    
    /**
     * Gets all sessions connected to the /ws/stocks/nse/all endpoint.
     * These sessions receive all NSE stock ticks automatically.
     *
     * @return set of session IDs on the /ws/stocks/nse/all endpoint
     */
    public Set<String> getStocksAllSessions() {
        return sessionEndpoints.entrySet().stream()
            .filter(e -> "/ws/stocks/nse/all".equals(e.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }
    
    /**
     * Gets all sessions connected to index-specific endpoints.
     * These sessions receive ticks for stocks belonging to a specific index.
     *
     * @param indexName the name of the index (e.g., "NIFTY 50")
     * @return set of session IDs on the index-specific endpoint
     */
    public Set<String> getIndexSpecificSessions(String indexName) {
        String targetEndpoint = "/ws/stocks/nse/index/" + indexName;
        return sessionEndpoints.entrySet().stream()
            .filter(e -> targetEndpoint.equals(e.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }
    
    /**
     * Gets all sessions connected to any index-specific endpoint.
     * Returns a map of index name to session IDs.
     *
     * @return map of index names to their session IDs
     */
    public Map<String, Set<String>> getAllIndexSpecificSessions() {
        return sessionEndpoints.entrySet().stream()
            .filter(e -> e.getValue().startsWith("/ws/stocks/nse/index/"))
            .collect(Collectors.groupingBy(
                e -> e.getValue().substring("/ws/stocks/nse/index/".length()),
                Collectors.mapping(Map.Entry::getKey, Collectors.toSet())
            ));
    }
    
    /**
     * Sends a message to a specific session.
     * Handles IOException gracefully by logging and removing dead sessions.
     *
     * @param sessionId the session identifier
     * @param message the message to send
     * @throws IOException if the message cannot be sent
     */
    public void sendMessage(String sessionId, String message) throws IOException {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                log.warn("Failed to send message to session {}, removing: {}", sessionId, e.getMessage());
                removeSession(sessionId);
                throw e;
            }
        } else {
            log.debug("Session {} is not open or does not exist, removing", sessionId);
            removeSession(sessionId);
        }
    }
    
    /**
     * Gets the total number of active sessions.
     *
     * @return count of active sessions
     */
    public int getActiveSessionCount() {
        return sessions.size();
    }
    
    /**
     * Gets all active session IDs.
     *
     * @return set of all active session IDs
     */
    public Set<String> getAllSessionIds() {
        return new HashSet<>(sessions.keySet());
    }
    
    /**
     * Gets the endpoint for a specific session.
     *
     * @param sessionId the session identifier
     * @return the endpoint path, or null if session doesn't exist
     */
    public String getSessionEndpoint(String sessionId) {
        return sessionEndpoints.get(sessionId);
    }
    
    /**
     * Gets all subscriptions for a specific session.
     *
     * @param sessionId the session identifier
     * @return set of subscribed symbols (empty set if session doesn't exist)
     */
    public Set<String> getSessionSubscriptions(String sessionId) {
        Set<String> subs = sessionSubscriptions.get(sessionId);
        return subs != null ? new HashSet<>(subs) : Collections.emptySet();
    }
}
