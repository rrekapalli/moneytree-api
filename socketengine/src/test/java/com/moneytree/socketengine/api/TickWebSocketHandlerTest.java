package com.moneytree.socketengine.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.SubscriptionRequestDto;
import com.moneytree.socketengine.broadcast.SessionManager;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TickWebSocketHandler.
 */
@ExtendWith(MockitoExtension.class)
class TickWebSocketHandlerTest {

    @Mock
    private SessionManager sessionManager;

    @Mock
    private Validator validator;

    @Mock
    private WebSocketSession webSocketSession;

    private ObjectMapper objectMapper;
    private TickWebSocketHandler handler;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        handler = new TickWebSocketHandler(sessionManager, objectMapper, validator);
    }

    @Test
    void shouldRegisterSessionOnConnectionEstablished() throws Exception {
        // Given: A WebSocket session connecting to /ws/indices
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/indices"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with SessionManager
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/indices"), eq(webSocketSession));
    }

    @Test
    void shouldRegisterSessionForIndicesAllEndpoint() throws Exception {
        // Given: A WebSocket session connecting to /ws/indices/all
        String sessionId = "test-session-2";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/indices/all"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with correct endpoint
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/indices/all"), eq(webSocketSession));
    }

    @Test
    void shouldRegisterSessionForStocksEndpoint() throws Exception {
        // Given: A WebSocket session connecting to /ws/stocks
        String sessionId = "test-session-3";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/stocks"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with correct endpoint
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/stocks"), eq(webSocketSession));
    }

    @Test
    void shouldRegisterSessionForStocksNseAllEndpoint() throws Exception {
        // Given: A WebSocket session connecting to /ws/stocks/nse/all
        String sessionId = "test-session-4";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/stocks/nse/all"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with correct endpoint
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/stocks/nse/all"), eq(webSocketSession));
    }

    @Test
    void shouldProcessValidSubscribeMessage() throws Exception {
        // Given: A valid SUBSCRIBE message
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "SUBSCRIBE", "INDEX", Arrays.asList("NIFTY 50", "BANKNIFTY")
        );
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);
        
        // Mock validator to return no violations
        when(validator.validate(any(SubscriptionRequestDto.class))).thenReturn(Collections.emptySet());

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Subscriptions should be added
        verify(sessionManager).addSubscriptions(eq(sessionId), eq(Arrays.asList("NIFTY 50", "BANKNIFTY")));
        
        // And: Confirmation message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"success\":true");
        assertThat(sentMessage).contains("\"action\":\"SUBSCRIBE\"");
        assertThat(sentMessage).contains("NIFTY 50");
        assertThat(sentMessage).contains("BANKNIFTY");
    }

    @Test
    void shouldProcessValidUnsubscribeMessage() throws Exception {
        // Given: A valid UNSUBSCRIBE message
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "UNSUBSCRIBE", "INDEX", Arrays.asList("NIFTY 50")
        );
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);
        
        // Mock validator to return no violations
        when(validator.validate(any(SubscriptionRequestDto.class))).thenReturn(Collections.emptySet());

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Subscriptions should be removed
        verify(sessionManager).removeSubscriptions(eq(sessionId), eq(Arrays.asList("NIFTY 50")));
        
        // And: Confirmation message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"success\":true");
        assertThat(sentMessage).contains("\"action\":\"UNSUBSCRIBE\"");
        assertThat(sentMessage).contains("NIFTY 50");
    }

    @Test
    void shouldSendErrorForInvalidMessage() throws Exception {
        // Given: An invalid message (missing required fields)
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "", "", Collections.emptyList()  // Invalid: empty action, type, and symbols
        );
        
        // Mock validator to return violations
        @SuppressWarnings("unchecked")
        ConstraintViolation<SubscriptionRequestDto> violation1 = mock(ConstraintViolation.class);
        when(violation1.getMessage()).thenReturn("Action is required");
        
        @SuppressWarnings("unchecked")
        ConstraintViolation<SubscriptionRequestDto> violation2 = mock(ConstraintViolation.class);
        when(violation2.getMessage()).thenReturn("Type is required");
        
        when(validator.validate(any(SubscriptionRequestDto.class)))
            .thenReturn(new HashSet<>(Arrays.asList(violation1, violation2)));
        
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);

        // When: Handling the invalid message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Subscriptions should NOT be modified
        verify(sessionManager, never()).addSubscriptions(any(), any());
        verify(sessionManager, never()).removeSubscriptions(any(), any());
        
        // And: Error message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"error\":true");
        assertThat(sentMessage).contains("Invalid subscription request");
    }

    @Test
    void shouldSendErrorForMalformedJson() throws Exception {
        // Given: A malformed JSON message
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        TextMessage message = new TextMessage("{invalid json}");

        // When: Handling the malformed message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Subscriptions should NOT be modified
        verify(sessionManager, never()).addSubscriptions(any(), any());
        verify(sessionManager, never()).removeSubscriptions(any(), any());
        
        // And: Error message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"error\":true");
        assertThat(sentMessage).contains("Failed to process subscription message");
    }

    @Test
    void shouldSendErrorForInvalidAction() throws Exception {
        // Given: A message with invalid action
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "INVALID_ACTION", "INDEX", Arrays.asList("NIFTY 50")
        );
        
        // Mock validator to return violation for invalid action
        @SuppressWarnings("unchecked")
        ConstraintViolation<SubscriptionRequestDto> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Action must be SUBSCRIBE or UNSUBSCRIBE");
        
        when(validator.validate(any(SubscriptionRequestDto.class)))
            .thenReturn(Collections.singleton(violation));
        
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Error message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"error\":true");
        assertThat(sentMessage).contains("Action must be SUBSCRIBE or UNSUBSCRIBE");
    }

    @Test
    void shouldSendErrorForInvalidType() throws Exception {
        // Given: A message with invalid type
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "SUBSCRIBE", "INVALID_TYPE", Arrays.asList("NIFTY 50")
        );
        
        // Mock validator to return violation for invalid type
        @SuppressWarnings("unchecked")
        ConstraintViolation<SubscriptionRequestDto> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Type must be INDEX or STOCK");
        
        when(validator.validate(any(SubscriptionRequestDto.class)))
            .thenReturn(Collections.singleton(violation));
        
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Error message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"error\":true");
        assertThat(sentMessage).contains("Type must be INDEX or STOCK");
    }

    @Test
    void shouldSendErrorForEmptySymbolsList() throws Exception {
        // Given: A message with empty symbols list
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "SUBSCRIBE", "INDEX", Collections.emptyList()
        );
        
        // Mock validator to return violation for empty symbols
        @SuppressWarnings("unchecked")
        ConstraintViolation<SubscriptionRequestDto> violation = mock(ConstraintViolation.class);
        when(violation.getMessage()).thenReturn("Symbols list cannot be empty");
        
        when(validator.validate(any(SubscriptionRequestDto.class)))
            .thenReturn(Collections.singleton(violation));
        
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Error message should be sent
        ArgumentCaptor<TextMessage> messageCaptor = ArgumentCaptor.forClass(TextMessage.class);
        verify(webSocketSession).sendMessage(messageCaptor.capture());
        
        String sentMessage = messageCaptor.getValue().getPayload();
        assertThat(sentMessage).contains("\"error\":true");
        assertThat(sentMessage).contains("Symbols list cannot be empty");
    }

    @Test
    void shouldCleanupSessionOnConnectionClosed() throws Exception {
        // Given: A connected session
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        CloseStatus closeStatus = CloseStatus.NORMAL;

        // When: Connection is closed
        handler.afterConnectionClosed(webSocketSession, closeStatus);

        // Then: Session should be removed from SessionManager
        verify(sessionManager).removeSession(eq(sessionId));
    }

    @Test
    void shouldCleanupSessionOnAbnormalClose() throws Exception {
        // Given: A connected session
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        CloseStatus closeStatus = CloseStatus.SERVER_ERROR;

        // When: Connection is closed abnormally
        handler.afterConnectionClosed(webSocketSession, closeStatus);

        // Then: Session should still be removed from SessionManager
        verify(sessionManager).removeSession(eq(sessionId));
    }

    @Test
    void shouldHandleConnectionWithTrailingSlash() throws Exception {
        // Given: A WebSocket session with trailing slash in URI
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/indices/"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with correct endpoint (without trailing slash)
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/indices"), eq(webSocketSession));
    }

    @Test
    void shouldHandleConnectionWithQueryParameters() throws Exception {
        // Given: A WebSocket session with query parameters
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(new URI("ws://localhost:8081/ws/indices?token=abc123"));

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with correct endpoint (without query params)
        verify(sessionManager).registerSession(eq(sessionId), eq("/ws/indices"), eq(webSocketSession));
    }

    @Test
    void shouldHandleNullUri() throws Exception {
        // Given: A WebSocket session with null URI
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(webSocketSession.getUri()).thenReturn(null);

        // When: Connection is established
        handler.afterConnectionEstablished(webSocketSession);

        // Then: Session should be registered with empty string endpoint
        verify(sessionManager).registerSession(eq(sessionId), eq(""), eq(webSocketSession));
    }

    @Test
    void shouldProcessMultipleSubscriptionsInSequence() throws Exception {
        // Given: A session that sends multiple subscription messages
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(validator.validate(any(SubscriptionRequestDto.class))).thenReturn(Collections.emptySet());

        // When: Processing first subscription
        SubscriptionRequestDto request1 = new SubscriptionRequestDto(
            "SUBSCRIBE", "INDEX", Arrays.asList("NIFTY 50")
        );
        handler.handleTextMessage(webSocketSession, new TextMessage(objectMapper.writeValueAsString(request1)));

        // And: Processing second subscription
        SubscriptionRequestDto request2 = new SubscriptionRequestDto(
            "SUBSCRIBE", "INDEX", Arrays.asList("BANKNIFTY")
        );
        handler.handleTextMessage(webSocketSession, new TextMessage(objectMapper.writeValueAsString(request2)));

        // Then: Both subscriptions should be added
        verify(sessionManager).addSubscriptions(eq(sessionId), eq(Arrays.asList("NIFTY 50")));
        verify(sessionManager).addSubscriptions(eq(sessionId), eq(Arrays.asList("BANKNIFTY")));
    }

    @Test
    void shouldProcessSubscribeFollowedByUnsubscribe() throws Exception {
        // Given: A session that subscribes then unsubscribes
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        when(validator.validate(any(SubscriptionRequestDto.class))).thenReturn(Collections.emptySet());

        // When: Processing subscribe
        SubscriptionRequestDto subscribeRequest = new SubscriptionRequestDto(
            "SUBSCRIBE", "INDEX", Arrays.asList("NIFTY 50", "BANKNIFTY")
        );
        handler.handleTextMessage(webSocketSession, new TextMessage(objectMapper.writeValueAsString(subscribeRequest)));

        // And: Processing unsubscribe
        SubscriptionRequestDto unsubscribeRequest = new SubscriptionRequestDto(
            "UNSUBSCRIBE", "INDEX", Arrays.asList("NIFTY 50")
        );
        handler.handleTextMessage(webSocketSession, new TextMessage(objectMapper.writeValueAsString(unsubscribeRequest)));

        // Then: Both operations should be performed
        verify(sessionManager).addSubscriptions(eq(sessionId), eq(Arrays.asList("NIFTY 50", "BANKNIFTY")));
        verify(sessionManager).removeSubscriptions(eq(sessionId), eq(Arrays.asList("NIFTY 50")));
    }

    @Test
    void shouldHandleStockSubscriptions() throws Exception {
        // Given: A valid SUBSCRIBE message for stocks
        String sessionId = "test-session-1";
        when(webSocketSession.getId()).thenReturn(sessionId);
        
        SubscriptionRequestDto request = new SubscriptionRequestDto(
            "SUBSCRIBE", "STOCK", Arrays.asList("RELIANCE", "INFY", "TCS")
        );
        String messagePayload = objectMapper.writeValueAsString(request);
        TextMessage message = new TextMessage(messagePayload);
        
        when(validator.validate(any(SubscriptionRequestDto.class))).thenReturn(Collections.emptySet());

        // When: Handling the message
        handler.handleTextMessage(webSocketSession, message);

        // Then: Subscriptions should be added
        verify(sessionManager).addSubscriptions(eq(sessionId), eq(Arrays.asList("RELIANCE", "INFY", "TCS")));
    }
}
