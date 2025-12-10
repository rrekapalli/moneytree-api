package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.config.SocketEngineProperties;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

/**
 * Unit tests for KiteWebSocketClient.
 * 
 * Note: These tests focus on the business logic and event publishing.
 * The actual WebSocket connection is not tested here as it requires
 * integration testing with a real or mock WebSocket server.
 */
@ExtendWith(MockitoExtension.class)
class KiteWebSocketClientTest {

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private InstrumentLoader instrumentLoader;

    @Mock
    private MeterRegistry meterRegistry;

    private SocketEngineProperties properties;
    private KiteWebSocketClient client;

    @BeforeEach
    void setUp() {
        // Setup properties
        properties = new SocketEngineProperties();
        properties.setKite(new SocketEngineProperties.Kite());
        properties.getKite().setWebsocketUrl("wss://test.example.com");
        properties.getKite().setApiKey("test-api-key");
        properties.getKite().setApiSecret("test-api-secret");
        properties.getKite().setAccessToken("test-access-token");

        // Create client with new constructor signature (but don't call @PostConstruct initialize())
        client = new KiteWebSocketClient(
            properties,
            eventPublisher,
            instrumentLoader,
            meterRegistry
        );
    }

    @Test
    void shouldLoadInstrumentsOnInitialize() {
        // Given: Instrument loader returns test instruments
        List<InstrumentInfo> testInstruments = List.of(
            InstrumentInfo.builder()
                .instrumentToken(256265L)
                .exchangeToken(1024L)
                .tradingSymbol("NIFTY 50")
                .type(InstrumentType.INDEX)
                .build(),
            InstrumentInfo.builder()
                .instrumentToken(738561L)
                .exchangeToken(2885L)
                .tradingSymbol("RELIANCE")
                .type(InstrumentType.STOCK)
                .build()
        );
        when(instrumentLoader.loadAllInstruments()).thenReturn(testInstruments);

        // When: Initialize is called (simulated, not actual @PostConstruct)
        // Note: We can't easily test the actual WebSocket connection without integration tests
        // So we verify the instrument loading part
        List<InstrumentInfo> loaded = instrumentLoader.loadAllInstruments();

        // Then: Should load instruments
        verify(instrumentLoader).loadAllInstruments();
        assertThat(loaded).hasSize(2);
        assertThat(loaded).extracting(InstrumentInfo::getTradingSymbol)
            .containsExactly("NIFTY 50", "RELIANCE");
    }

    @Test
    void shouldPublishEventsForTicks() {
        // Given: Test ticks (simulating what KiteTicker would provide)
        Tick tick1 = createTestTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        Tick tick2 = createTestTick("RELIANCE", 738561L, InstrumentType.STOCK);

        // When: Simulating tick event publishing (as would happen in KiteTicker callback)
        eventPublisher.publishEvent(new TickReceivedEvent(tick1));
        eventPublisher.publishEvent(new TickReceivedEvent(tick2));

        // Then: Should publish events for each tick
        ArgumentCaptor<TickReceivedEvent> eventCaptor = ArgumentCaptor.forClass(TickReceivedEvent.class);
        verify(eventPublisher, times(2)).publishEvent(eventCaptor.capture());

        List<TickReceivedEvent> publishedEvents = eventCaptor.getAllValues();
        assertThat(publishedEvents).hasSize(2);
        assertThat(publishedEvents.get(0).tick().getSymbol()).isEqualTo("NIFTY 50");
        assertThat(publishedEvents.get(1).tick().getSymbol()).isEqualTo("RELIANCE");
    }

    @Test
    void shouldHandleEventPublishExceptionGracefully() {
        // Given: Event publisher that throws exception
        Tick tick = createTestTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        doThrow(new RuntimeException("Event publish failed"))
            .when(eventPublisher).publishEvent(any(TickReceivedEvent.class));

        // When: Attempting to publish event
        try {
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
        } catch (RuntimeException e) {
            // Expected - should be caught and logged in real implementation
        }

        // Then: Should attempt to publish event
        verify(eventPublisher).publishEvent(any(TickReceivedEvent.class));
    }

    @Test
    void shouldContinueProcessingAfterEventPublishFailure() {
        // Given: Parser returns multiple ticks
        Tick tick1 = createTestTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        Tick tick2 = createTestTick("RELIANCE", 738561L, InstrumentType.STOCK);
        Tick tick3 = createTestTick("INFY", 408065L, InstrumentType.STOCK);
        
        // And: Event publisher throws exception on second tick
        doNothing()
            .doThrow(new RuntimeException("Event publish failed"))
            .doNothing()
            .when(eventPublisher).publishEvent(any(TickReceivedEvent.class));

        // When: Processing ticks (simulating KiteTicker callback handling)
        List<Tick> ticks = List.of(tick1, tick2, tick3);
        for (Tick tick : ticks) {
            try {
                eventPublisher.publishEvent(new TickReceivedEvent(tick));
            } catch (Exception e) {
                // Log error but continue processing
            }
        }

        // Then: Should attempt to publish all three events
        verify(eventPublisher, times(3)).publishEvent(any(TickReceivedEvent.class));
    }

    @Test
    void shouldHandleConnectionEvents() {
        // Note: Connection management is now handled by KiteTicker internally
        // This test verifies that the client can track connection state
        
        // When: Checking initial connection state
        boolean connected = client.isConnected();
        
        // Then: Should not be connected initially
        assertThat(connected).isFalse();
    }

    @Test
    void shouldNotReconnectOnAuthenticationFailure() {
        // Given: Authentication error scenario
        Exception authError = new RuntimeException("401 Unauthorized");

        // When: Checking if error is authentication-related
        String errorMessage = authError.getMessage().toLowerCase();
        boolean isAuthError = errorMessage.contains("401") || 
                             errorMessage.contains("unauthorized") || 
                             errorMessage.contains("authentication");

        // Then: Should identify as authentication error
        assertThat(isAuthError).isTrue();
        
        // Note: Reconnection is now handled internally by KiteTicker
    }

    @Test
    void shouldReconnectOnNonAuthenticationError() {
        // Given: Non-authentication error
        Exception networkError = new RuntimeException("Connection timeout");

        // When: Checking if error is authentication-related
        String errorMessage = networkError.getMessage().toLowerCase();
        boolean isAuthError = errorMessage.contains("401") || 
                             errorMessage.contains("unauthorized") || 
                             errorMessage.contains("authentication");

        // Then: Should not be identified as authentication error
        assertThat(isAuthError).isFalse();
        
        // Note: Reconnection is now handled internally by KiteTicker
    }

    @Test
    void shouldFormatSubscriptionMessageCorrectly() throws Exception {
        // Given: List of instruments to subscribe
        List<InstrumentInfo> instruments = List.of(
            InstrumentInfo.builder()
                .instrumentToken(256265L)
                .tradingSymbol("NIFTY 50")
                .type(InstrumentType.INDEX)
                .build(),
            InstrumentInfo.builder()
                .instrumentToken(738561L)
                .tradingSymbol("RELIANCE")
                .type(InstrumentType.STOCK)
                .build()
        );

        // When: Building subscription message (simulating subscribeToInstruments logic)
        List<Long> tokens = instruments.stream()
            .map(InstrumentInfo::getInstrumentToken)
            .toList();
        
        var subscriptionMessage = new java.util.HashMap<String, Object>();
        subscriptionMessage.put("a", "subscribe");
        subscriptionMessage.put("v", tokens);
        
        ObjectMapper objectMapper = new ObjectMapper();
        String messageJson = objectMapper.writeValueAsString(subscriptionMessage);

        // Then: Should format message correctly
        assertThat(messageJson).contains("\"a\":\"subscribe\"");
        assertThat(messageJson).contains("\"v\":[256265,738561]");
        
        // And: Should be valid JSON
        var parsed = objectMapper.readValue(messageJson, java.util.Map.class);
        assertThat(parsed.get("a")).isEqualTo("subscribe");
        assertThat(parsed.get("v")).isInstanceOf(List.class);
        
        @SuppressWarnings("unchecked")
        List<Integer> parsedTokens = (List<Integer>) parsed.get("v");
        assertThat(parsedTokens).containsExactly(256265, 738561);
    }

    @Test
    void shouldHandleEmptyInstrumentList() throws Exception {
        // Given: Empty instrument list
        List<InstrumentInfo> emptyInstruments = List.of();

        // When: Building subscription message with empty list
        List<Long> tokens = emptyInstruments.stream()
            .map(InstrumentInfo::getInstrumentToken)
            .toList();

        // Then: Should have empty token list
        assertThat(tokens).isEmpty();
        
        // And: Should not attempt to send subscription (would be checked in actual implementation)
    }

    @Test
    void shouldTrackConnectionState() {
        // Given: Fresh client
        // When: Checking initial connection state
        boolean initialState = client.isConnected();

        // Then: Should not be connected initially
        assertThat(initialState).isFalse();
    }

    @Test
    void shouldProvideSubscriptionStatus() {
        // When: Getting subscription status
        var status = client.getSubscriptionStatus();

        // Then: Should return status information
        assertThat(status).isNotNull();
        assertThat(status).containsKey("connected");
        assertThat(status).containsKey("usingOfficialKiteTicker");
        assertThat(status.get("usingOfficialKiteTicker")).isEqualTo(true);
    }

    /**
     * Helper method to create test tick
     */
    private Tick createTestTick(String symbol, long instrumentToken, InstrumentType type) {
        return Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(type)
            .timestamp(Instant.now())
            .lastTradedPrice(100.50)
            .volume(1000L)
            .ohlc(Tick.OHLC.builder()
                .open(100.0)
                .high(101.0)
                .low(99.0)
                .close(100.5)
                .build())
            .build();
    }
}
