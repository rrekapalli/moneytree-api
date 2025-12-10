package com.moneytree.socketengine.config;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for SecurityConfig components.
 */
class SecurityConfigTest {
    
    @Test
    void rateLimiter_shouldAllowRequestsUnderLimit() {
        SecurityConfig.RateLimiter rateLimiter = new SecurityConfig.RateLimiter(10, 60);
        String sessionId = "test-session";
        
        // First 10 requests should be allowed
        for (int i = 0; i < 10; i++) {
            assertThat(rateLimiter.allowRequest(sessionId))
                .as("Request %d should be allowed", i + 1)
                .isTrue();
        }
        
        // 11th request should be denied
        assertThat(rateLimiter.allowRequest(sessionId))
            .as("Request 11 should be denied")
            .isFalse();
    }
    
    @Test
    void rateLimiter_shouldResetAfterWindowExpires() throws InterruptedException {
        SecurityConfig.RateLimiter rateLimiter = new SecurityConfig.RateLimiter(5, 1);
        String sessionId = "test-session";
        
        // Use up the limit
        for (int i = 0; i < 5; i++) {
            rateLimiter.allowRequest(sessionId);
        }
        
        // Should be denied
        assertThat(rateLimiter.allowRequest(sessionId)).isFalse();
        
        // Wait for window to expire
        Thread.sleep(1100);
        
        // Should be allowed again
        assertThat(rateLimiter.allowRequest(sessionId)).isTrue();
    }
    
    @Test
    void rateLimiter_shouldTrackSessionsSeparately() {
        SecurityConfig.RateLimiter rateLimiter = new SecurityConfig.RateLimiter(5, 60);
        String session1 = "session-1";
        String session2 = "session-2";
        
        // Use up limit for session1
        for (int i = 0; i < 5; i++) {
            rateLimiter.allowRequest(session1);
        }
        
        // session1 should be denied
        assertThat(rateLimiter.allowRequest(session1)).isFalse();
        
        // session2 should still be allowed
        assertThat(rateLimiter.allowRequest(session2)).isTrue();
    }
    
    @Test
    void rateLimiter_shouldRemoveSessionTracking() {
        SecurityConfig.RateLimiter rateLimiter = new SecurityConfig.RateLimiter(5, 60);
        String sessionId = "test-session";
        
        // Use up the limit
        for (int i = 0; i < 5; i++) {
            rateLimiter.allowRequest(sessionId);
        }
        
        // Should be denied
        assertThat(rateLimiter.allowRequest(sessionId)).isFalse();
        
        // Remove session
        rateLimiter.removeSession(sessionId);
        
        // Should be allowed again (fresh session)
        assertThat(rateLimiter.allowRequest(sessionId)).isTrue();
    }
    
    @Test
    void rateLimiter_shouldBeThreadSafe() throws InterruptedException {
        SecurityConfig.RateLimiter rateLimiter = new SecurityConfig.RateLimiter(100, 60);
        String sessionId = "test-session";
        int threadCount = 10;
        int requestsPerThread = 20;
        
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < requestsPerThread; j++) {
                        rateLimiter.allowRequest(sessionId);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await(5, TimeUnit.SECONDS);
        executor.shutdown();
        
        // Total requests = 200, limit = 100
        // Current count should be 100
        assertThat(rateLimiter.getCurrentCount(sessionId)).isEqualTo(100);
    }
    
    @Test
    void connectionTracker_shouldAllowConnectionsUnderLimit() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(5);
        String ipAddress = "192.168.1.1";
        
        // First 5 connections should be allowed
        for (int i = 0; i < 5; i++) {
            assertThat(tracker.allowConnection(ipAddress))
                .as("Connection %d should be allowed", i + 1)
                .isTrue();
        }
        
        // 6th connection should be denied
        assertThat(tracker.allowConnection(ipAddress))
            .as("Connection 6 should be denied")
            .isFalse();
    }
    
    @Test
    void connectionTracker_shouldReleaseConnections() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(3);
        String ipAddress = "192.168.1.1";
        
        // Use up the limit
        for (int i = 0; i < 3; i++) {
            tracker.allowConnection(ipAddress);
        }
        
        // Should be denied
        assertThat(tracker.allowConnection(ipAddress)).isFalse();
        
        // Release one connection
        tracker.releaseConnection(ipAddress);
        
        // Should be allowed again
        assertThat(tracker.allowConnection(ipAddress)).isTrue();
    }
    
    @Test
    void connectionTracker_shouldTrackIpsSeparately() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(2);
        String ip1 = "192.168.1.1";
        String ip2 = "192.168.1.2";
        
        // Use up limit for ip1
        tracker.allowConnection(ip1);
        tracker.allowConnection(ip1);
        
        // ip1 should be denied
        assertThat(tracker.allowConnection(ip1)).isFalse();
        
        // ip2 should still be allowed
        assertThat(tracker.allowConnection(ip2)).isTrue();
    }
    
    @Test
    void connectionTracker_shouldGetConnectionCount() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(10);
        String ipAddress = "192.168.1.1";
        
        assertThat(tracker.getConnectionCount(ipAddress)).isEqualTo(0);
        
        tracker.allowConnection(ipAddress);
        assertThat(tracker.getConnectionCount(ipAddress)).isEqualTo(1);
        
        tracker.allowConnection(ipAddress);
        assertThat(tracker.getConnectionCount(ipAddress)).isEqualTo(2);
        
        tracker.releaseConnection(ipAddress);
        assertThat(tracker.getConnectionCount(ipAddress)).isEqualTo(1);
    }
    
    @Test
    void connectionTracker_shouldHandleNullIpAddress() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(5);
        
        // Should allow (can't track null IP)
        assertThat(tracker.allowConnection(null)).isTrue();
        assertThat(tracker.allowConnection("")).isTrue();
        
        // Should not affect tracking
        assertThat(tracker.getConnectionCount(null)).isEqualTo(0);
        assertThat(tracker.getConnectionCount("")).isEqualTo(0);
    }
    
    @Test
    void connectionTracker_shouldCleanUpWhenCountReachesZero() {
        SecurityConfig.ConnectionTracker tracker = new SecurityConfig.ConnectionTracker(5);
        String ipAddress = "192.168.1.1";
        
        // Add and remove connection
        tracker.allowConnection(ipAddress);
        tracker.releaseConnection(ipAddress);
        
        // Should be cleaned up (unique IP count should be 0)
        assertThat(tracker.getUniqueIpCount()).isEqualTo(0);
    }
}
