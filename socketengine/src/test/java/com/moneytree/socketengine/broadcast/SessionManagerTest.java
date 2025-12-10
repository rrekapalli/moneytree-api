package com.moneytree.socketengine.broadcast;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SessionManager.
 */
class SessionManagerTest {

    private SessionManager sessionManager;

    @BeforeEach
    void setUp() {
        sessionManager = new SessionManager();
    }

    @Test
    void shouldRegisterSession() {
        // Given: A mock WebSocket session
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        String endpoint = "/ws/indices";

        // When: Registering the session
        sessionManager.registerSession(sessionId, endpoint, session);

        // Then: Session should be registered
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(1);
        assertThat(sessionManager.getAllSessionIds()).contains(sessionId);
        assertThat(sessionManager.getSessionEndpoint(sessionId)).isEqualTo(endpoint);
        assertThat(sessionManager.getSessionSubscriptions(sessionId)).isEmpty();
    }

    @Test
    void shouldAddSubscriptions() {
        // Given: A registered session
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        // When: Adding subscriptions
        List<String> symbols = Arrays.asList("NIFTY 50", "BANKNIFTY");
        sessionManager.addSubscriptions(sessionId, symbols);

        // Then: Subscriptions should be added
        Set<String> subscriptions = sessionManager.getSessionSubscriptions(sessionId);
        assertThat(subscriptions).containsExactlyInAnyOrder("NIFTY 50", "BANKNIFTY");
    }

    @Test
    void shouldUpdateReverseIndexWhenAddingSubscriptions() {
        // Given: A registered session
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        // When: Adding subscriptions
        List<String> symbols = Arrays.asList("NIFTY 50", "BANKNIFTY");
        sessionManager.addSubscriptions(sessionId, symbols);

        // Then: Reverse index should be updated
        assertThat(sessionManager.getSessionsSubscribedTo("NIFTY 50")).contains(sessionId);
        assertThat(sessionManager.getSessionsSubscribedTo("BANKNIFTY")).contains(sessionId);
    }

    @Test
    void shouldRemoveSubscriptions() {
        // Given: A session with subscriptions
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);
        List<String> symbols = Arrays.asList("NIFTY 50", "BANKNIFTY", "FINNIFTY");
        sessionManager.addSubscriptions(sessionId, symbols);

        // When: Removing some subscriptions
        sessionManager.removeSubscriptions(sessionId, Arrays.asList("BANKNIFTY"));

        // Then: Only specified subscriptions should be removed
        Set<String> subscriptions = sessionManager.getSessionSubscriptions(sessionId);
        assertThat(subscriptions).containsExactlyInAnyOrder("NIFTY 50", "FINNIFTY");
        assertThat(subscriptions).doesNotContain("BANKNIFTY");
    }

    @Test
    void shouldCleanupReverseIndexWhenRemovingSubscriptions() {
        // Given: A session with subscriptions
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);
        sessionManager.addSubscriptions(sessionId, Arrays.asList("NIFTY 50", "BANKNIFTY"));

        // When: Removing subscriptions
        sessionManager.removeSubscriptions(sessionId, Arrays.asList("BANKNIFTY"));

        // Then: Reverse index should be cleaned up
        assertThat(sessionManager.getSessionsSubscribedTo("NIFTY 50")).contains(sessionId);
        assertThat(sessionManager.getSessionsSubscribedTo("BANKNIFTY")).isEmpty();
    }

    @Test
    void shouldRemoveSession() {
        // Given: A registered session with subscriptions
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);
        sessionManager.addSubscriptions(sessionId, Arrays.asList("NIFTY 50", "BANKNIFTY"));

        // When: Removing the session
        sessionManager.removeSession(sessionId);

        // Then: Session should be completely removed
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(0);
        assertThat(sessionManager.getAllSessionIds()).doesNotContain(sessionId);
        assertThat(sessionManager.getSessionEndpoint(sessionId)).isNull();
        assertThat(sessionManager.getSessionSubscriptions(sessionId)).isEmpty();
    }

    @Test
    void shouldPerformFullCleanupWhenRemovingSession() {
        // Given: A session with subscriptions
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);
        sessionManager.addSubscriptions(sessionId, Arrays.asList("NIFTY 50", "BANKNIFTY"));

        // When: Removing the session
        sessionManager.removeSession(sessionId);

        // Then: Reverse index should be cleaned up
        assertThat(sessionManager.getSessionsSubscribedTo("NIFTY 50")).isEmpty();
        assertThat(sessionManager.getSessionsSubscribedTo("BANKNIFTY")).isEmpty();
    }

    @Test
    void shouldGetSessionsSubscribedToSymbol() {
        // Given: Multiple sessions subscribed to different symbols
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        WebSocketSession session3 = mock(WebSocketSession.class);
        
        sessionManager.registerSession("session-1", "/ws/indices", session1);
        sessionManager.registerSession("session-2", "/ws/indices", session2);
        sessionManager.registerSession("session-3", "/ws/indices", session3);
        
        sessionManager.addSubscriptions("session-1", Arrays.asList("NIFTY 50", "BANKNIFTY"));
        sessionManager.addSubscriptions("session-2", Arrays.asList("NIFTY 50"));
        sessionManager.addSubscriptions("session-3", Arrays.asList("BANKNIFTY"));

        // When: Getting sessions subscribed to a symbol
        Set<String> niftySessions = sessionManager.getSessionsSubscribedTo("NIFTY 50");
        Set<String> bankNiftySessions = sessionManager.getSessionsSubscribedTo("BANKNIFTY");
        Set<String> finNiftySessions = sessionManager.getSessionsSubscribedTo("FINNIFTY");

        // Then: Should return correct sessions
        assertThat(niftySessions).containsExactlyInAnyOrder("session-1", "session-2");
        assertThat(bankNiftySessions).containsExactlyInAnyOrder("session-1", "session-3");
        assertThat(finNiftySessions).isEmpty();
    }

    @Test
    void shouldGetIndicesAllSessions() {
        // Given: Sessions on different endpoints
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        WebSocketSession session3 = mock(WebSocketSession.class);
        WebSocketSession session4 = mock(WebSocketSession.class);
        
        sessionManager.registerSession("session-1", "/ws/indices/all", session1);
        sessionManager.registerSession("session-2", "/ws/indices", session2);
        sessionManager.registerSession("session-3", "/ws/indices/all", session3);
        sessionManager.registerSession("session-4", "/ws/stocks/nse/all", session4);

        // When: Getting indices/all sessions
        Set<String> indicesAllSessions = sessionManager.getIndicesAllSessions();

        // Then: Should return only /ws/indices/all sessions
        assertThat(indicesAllSessions).containsExactlyInAnyOrder("session-1", "session-3");
    }

    @Test
    void shouldGetStocksAllSessions() {
        // Given: Sessions on different endpoints
        WebSocketSession session1 = mock(WebSocketSession.class);
        WebSocketSession session2 = mock(WebSocketSession.class);
        WebSocketSession session3 = mock(WebSocketSession.class);
        WebSocketSession session4 = mock(WebSocketSession.class);
        
        sessionManager.registerSession("session-1", "/ws/stocks/nse/all", session1);
        sessionManager.registerSession("session-2", "/ws/stocks", session2);
        sessionManager.registerSession("session-3", "/ws/stocks/nse/all", session3);
        sessionManager.registerSession("session-4", "/ws/indices/all", session4);

        // When: Getting stocks/nse/all sessions
        Set<String> stocksAllSessions = sessionManager.getStocksAllSessions();

        // Then: Should return only /ws/stocks/nse/all sessions
        assertThat(stocksAllSessions).containsExactlyInAnyOrder("session-1", "session-3");
    }

    @Test
    void shouldSendMessageToOpenSession() throws IOException {
        // Given: An open WebSocket session
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.isOpen()).thenReturn(true);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        // When: Sending a message
        String message = "{\"symbol\":\"NIFTY 50\"}";
        sessionManager.sendMessage(sessionId, message);

        // Then: Message should be sent
        verify(session).sendMessage(any(TextMessage.class));
    }

    @Test
    void shouldHandleIOExceptionWhenSendingMessage() throws IOException {
        // Given: A session that throws IOException when sending
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.isOpen()).thenReturn(true);
        doThrow(new IOException("Connection closed")).when(session).sendMessage(any(TextMessage.class));
        
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        // When: Sending a message
        String message = "{\"symbol\":\"NIFTY 50\"}";

        // Then: Should throw IOException and remove session
        assertThatThrownBy(() -> sessionManager.sendMessage(sessionId, message))
            .isInstanceOf(IOException.class);
        
        // And: Session should be removed
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(0);
    }

    @Test
    void shouldRemoveClosedSessionWhenSendingMessage() throws IOException {
        // Given: A closed WebSocket session
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.isOpen()).thenReturn(false);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        // When: Attempting to send a message
        String message = "{\"symbol\":\"NIFTY 50\"}";
        sessionManager.sendMessage(sessionId, message);

        // Then: Session should be removed
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(0);
        verify(session, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void shouldBeThreadSafeForConcurrentRegistrations() throws InterruptedException {
        // Given: Multiple threads registering sessions concurrently
        int threadCount = 10;
        int sessionsPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger sessionCounter = new AtomicInteger(0);

        // When: Multiple threads register sessions concurrently
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < sessionsPerThread; j++) {
                        WebSocketSession session = mock(WebSocketSession.class);
                        String sessionId = "session-" + sessionCounter.incrementAndGet();
                        sessionManager.registerSession(sessionId, "/ws/indices", session);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: All sessions should be registered
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(threadCount * sessionsPerThread);
    }

    @Test
    void shouldBeThreadSafeForConcurrentSubscriptions() throws InterruptedException {
        // Given: A registered session and multiple threads adding subscriptions
        WebSocketSession session = mock(WebSocketSession.class);
        String sessionId = "session-1";
        sessionManager.registerSession(sessionId, "/ws/indices", session);

        int threadCount = 10;
        int subscriptionsPerThread = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // When: Multiple threads add subscriptions concurrently
        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < subscriptionsPerThread; j++) {
                        String symbol = "SYMBOL-" + threadIndex + "-" + j;
                        sessionManager.addSubscriptions(sessionId, Arrays.asList(symbol));
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: All subscriptions should be added
        Set<String> subscriptions = sessionManager.getSessionSubscriptions(sessionId);
        assertThat(subscriptions).hasSize(threadCount * subscriptionsPerThread);
    }

    @Test
    void shouldBeThreadSafeForConcurrentOperations() throws InterruptedException {
        // Given: Multiple threads performing different operations
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // When: Threads register, subscribe, unsubscribe, and remove sessions concurrently
        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                try {
                    WebSocketSession session = mock(WebSocketSession.class);
                    String sessionId = "session-" + threadIndex;
                    
                    // Register
                    sessionManager.registerSession(sessionId, "/ws/indices", session);
                    
                    // Add subscriptions
                    sessionManager.addSubscriptions(sessionId, Arrays.asList("SYMBOL-A", "SYMBOL-B"));
                    
                    // Remove some subscriptions
                    sessionManager.removeSubscriptions(sessionId, Arrays.asList("SYMBOL-A"));
                    
                    // Query
                    sessionManager.getSessionsSubscribedTo("SYMBOL-B");
                    
                    // Remove session
                    if (threadIndex % 2 == 0) {
                        sessionManager.removeSession(sessionId);
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Should complete without exceptions
        // Half the sessions should remain (odd thread indices)
        assertThat(sessionManager.getActiveSessionCount()).isEqualTo(threadCount / 2);
    }

    @Test
    void shouldHandleAddSubscriptionsForUnknownSession() {
        // Given: No registered session
        String sessionId = "unknown-session";

        // When: Attempting to add subscriptions
        sessionManager.addSubscriptions(sessionId, Arrays.asList("NIFTY 50"));

        // Then: Should handle gracefully (no exception)
        assertThat(sessionManager.getSessionSubscriptions(sessionId)).isEmpty();
    }

    @Test
    void shouldHandleRemoveSubscriptionsForUnknownSession() {
        // Given: No registered session
        String sessionId = "unknown-session";

        // When: Attempting to remove subscriptions
        sessionManager.removeSubscriptions(sessionId, Arrays.asList("NIFTY 50"));

        // Then: Should handle gracefully (no exception)
        assertThat(sessionManager.getSessionSubscriptions(sessionId)).isEmpty();
    }

    @Test
    void shouldReturnEmptySetForUnknownSymbol() {
        // When: Getting sessions for a symbol with no subscriptions
        Set<String> sessions = sessionManager.getSessionsSubscribedTo("UNKNOWN_SYMBOL");

        // Then: Should return empty set
        assertThat(sessions).isEmpty();
    }

    @Test
    void shouldReturnEmptySetWhenNoIndicesAllSessions() {
        // Given: Sessions on other endpoints
        WebSocketSession session = mock(WebSocketSession.class);
        sessionManager.registerSession("session-1", "/ws/indices", session);

        // When: Getting indices/all sessions
        Set<String> indicesAllSessions = sessionManager.getIndicesAllSessions();

        // Then: Should return empty set
        assertThat(indicesAllSessions).isEmpty();
    }

    @Test
    void shouldReturnEmptySetWhenNoStocksAllSessions() {
        // Given: Sessions on other endpoints
        WebSocketSession session = mock(WebSocketSession.class);
        sessionManager.registerSession("session-1", "/ws/stocks", session);

        // When: Getting stocks/nse/all sessions
        Set<String> stocksAllSessions = sessionManager.getStocksAllSessions();

        // Then: Should return empty set
        assertThat(stocksAllSessions).isEmpty();
    }
}
