package com.moneytree.socketengine.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Security configuration for the SocketEngine module.
 * 
 * Provides rate limiting and connection tracking to prevent abuse:
 * - Rate limiting for subscription requests per session
 * - Connection limits per IP address
 * - Request tracking for monitoring
 */
@Configuration
@Slf4j
public class SecurityConfig {
    
    /**
     * Creates a rate limiter for subscription requests.
     * Limits the number of subscription/unsubscription requests per session.
     * 
     * @return RateLimiter instance
     */
    @Bean
    public RateLimiter subscriptionRateLimiter() {
        return new RateLimiter(100, 60); // 100 requests per 60 seconds per session
    }
    
    /**
     * Creates a connection tracker for monitoring connections per IP.
     * Helps detect and prevent connection flooding attacks.
     * 
     * @return ConnectionTracker instance
     */
    @Bean
    public ConnectionTracker connectionTracker() {
        return new ConnectionTracker(50); // Max 50 connections per IP
    }
    
    /**
     * Simple rate limiter implementation using token bucket algorithm.
     * Thread-safe for concurrent access.
     */
    public static class RateLimiter {
        private final int maxRequests;
        private final int windowSeconds;
        private final Map<String, RequestWindow> windows = new ConcurrentHashMap<>();
        
        public RateLimiter(int maxRequests, int windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowSeconds = windowSeconds;
        }
        
        /**
         * Checks if a request is allowed for the given session.
         * 
         * @param sessionId the session identifier
         * @return true if request is allowed, false if rate limit exceeded
         */
        public boolean allowRequest(String sessionId) {
            RequestWindow window = windows.computeIfAbsent(sessionId, 
                k -> new RequestWindow(maxRequests, windowSeconds));
            
            return window.allowRequest();
        }
        
        /**
         * Removes rate limit tracking for a session (on disconnect).
         * 
         * @param sessionId the session identifier
         */
        public void removeSession(String sessionId) {
            windows.remove(sessionId);
        }
        
        /**
         * Gets current request count for a session.
         * 
         * @param sessionId the session identifier
         * @return current request count in the window
         */
        public int getCurrentCount(String sessionId) {
            RequestWindow window = windows.get(sessionId);
            return window != null ? window.getCurrentCount() : 0;
        }
        
        private static class RequestWindow {
            private final int maxRequests;
            private final int windowSeconds;
            private final AtomicInteger count = new AtomicInteger(0);
            private volatile Instant windowStart = Instant.now();
            
            RequestWindow(int maxRequests, int windowSeconds) {
                this.maxRequests = maxRequests;
                this.windowSeconds = windowSeconds;
            }
            
            synchronized boolean allowRequest() {
                Instant now = Instant.now();
                
                // Reset window if expired
                if (now.isAfter(windowStart.plusSeconds(windowSeconds))) {
                    windowStart = now;
                    count.set(0);
                }
                
                // Check if under limit
                if (count.get() < maxRequests) {
                    count.incrementAndGet();
                    return true;
                }
                
                return false;
            }
            
            int getCurrentCount() {
                return count.get();
            }
        }
    }
    
    /**
     * Tracks connections per IP address to prevent connection flooding.
     * Thread-safe for concurrent access.
     */
    public static class ConnectionTracker {
        private final int maxConnectionsPerIp;
        private final Map<String, AtomicInteger> connectionCounts = new ConcurrentHashMap<>();
        
        public ConnectionTracker(int maxConnectionsPerIp) {
            this.maxConnectionsPerIp = maxConnectionsPerIp;
        }
        
        /**
         * Checks if a new connection from the given IP is allowed.
         * 
         * @param ipAddress the client IP address
         * @return true if connection is allowed, false if limit exceeded
         */
        public boolean allowConnection(String ipAddress) {
            if (ipAddress == null || ipAddress.isEmpty()) {
                log.warn("Cannot track connection: IP address is null or empty");
                return true; // Allow if we can't determine IP
            }
            
            AtomicInteger count = connectionCounts.computeIfAbsent(ipAddress, 
                k -> new AtomicInteger(0));
            
            int currentCount = count.get();
            if (currentCount >= maxConnectionsPerIp) {
                log.warn("Connection limit exceeded for IP: {} (current: {}, max: {})", 
                    ipAddress, currentCount, maxConnectionsPerIp);
                return false;
            }
            
            count.incrementAndGet();
            log.debug("Connection allowed for IP: {} (count: {})", ipAddress, count.get());
            return true;
        }
        
        /**
         * Decrements connection count for an IP when a connection closes.
         * 
         * @param ipAddress the client IP address
         */
        public void releaseConnection(String ipAddress) {
            if (ipAddress == null || ipAddress.isEmpty()) {
                return;
            }
            
            AtomicInteger count = connectionCounts.get(ipAddress);
            if (count != null) {
                int newCount = count.decrementAndGet();
                log.debug("Connection released for IP: {} (remaining: {})", ipAddress, newCount);
                
                // Clean up if no more connections
                if (newCount <= 0) {
                    connectionCounts.remove(ipAddress);
                }
            }
        }
        
        /**
         * Gets current connection count for an IP.
         * 
         * @param ipAddress the client IP address
         * @return current connection count
         */
        public int getConnectionCount(String ipAddress) {
            if (ipAddress == null || ipAddress.isEmpty()) {
                return 0;
            }
            
            AtomicInteger count = connectionCounts.get(ipAddress);
            return count != null ? count.get() : 0;
        }
        
        /**
         * Gets total number of unique IPs with active connections.
         * 
         * @return number of unique IPs
         */
        public int getUniqueIpCount() {
            return connectionCounts.size();
        }
    }
}
