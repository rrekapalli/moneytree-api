package com.moneytree.socketengine.broadcast;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.kite.InstrumentLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TickBroadcaster.
 * Tests the hot path broadcasting logic including:
 * - Broadcasting to explicitly subscribed sessions
 * - Broadcasting to /ws/indices/all sessions for index ticks
 * - Broadcasting to /ws/stocks/nse/all sessions for stock ticks
 * - Graceful handling of send failures
 * - Correct DTO conversion
 */
class TickBroadcasterTest {

    private TickBroadcaster tickBroadcaster;
    private SessionManager sessionManager;
    private InstrumentLoader instrumentLoader;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        sessionManager = mock(SessionManager.class);
        instrumentLoader = mock(InstrumentLoader.class);
        objectMapper = new ObjectMapper();
        
        tickBroadcaster = new TickBroadcaster(sessionManager, instrumentLoader, objectMapper);
    }

    @Test
    void shouldBroadcastToSubscribedSessions() throws IOException {
        // Given: A tick and sessions subscribed to it
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1", "session-2"));
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(true);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should send to both subscribed sessions
        verify(sessionManager, times(2)).sendMessage(anyString(), anyString());
        verify(sessionManager).sendMessage(eq("session-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-2"), anyString());
    }

    @Test
    void shouldBroadcastIndexTicksToIndicesAllSessions() throws IOException {
        // Given: An index tick and /ws/indices/all sessions
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> indicesAllSessions = new HashSet<>(Arrays.asList("session-all-1", "session-all-2"));
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(new HashSet<>());
        when(sessionManager.getIndicesAllSessions()).thenReturn(indicesAllSessions);
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(true);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should send to all /ws/indices/all sessions
        verify(sessionManager, times(2)).sendMessage(anyString(), anyString());
        verify(sessionManager).sendMessage(eq("session-all-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-all-2"), anyString());
    }

    @Test
    void shouldBroadcastStockTicksToStocksAllSessions() throws IOException {
        // Given: A stock tick and /ws/stocks/nse/all sessions
        Tick tick = createSampleTick("RELIANCE", 738561L, InstrumentType.STOCK);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> stocksAllSessions = new HashSet<>(Arrays.asList("session-stocks-1", "session-stocks-2"));
        when(sessionManager.getSessionsSubscribedTo("RELIANCE")).thenReturn(new HashSet<>());
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(stocksAllSessions);
        when(instrumentLoader.isIndexToken(738561L)).thenReturn(false);
        when(instrumentLoader.isStockToken(738561L)).thenReturn(true);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should send to all /ws/stocks/nse/all sessions
        verify(sessionManager, times(2)).sendMessage(anyString(), anyString());
        verify(sessionManager).sendMessage(eq("session-stocks-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-stocks-2"), anyString());
    }

    @Test
    void shouldBroadcastToAllRelevantSessions() throws IOException {
        // Given: An index tick with explicit subscriptions AND /ws/indices/all sessions
        Tick tick = createSampleTick("BANKNIFTY", 260105L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1"));
        Set<String> indicesAllSessions = new HashSet<>(Arrays.asList("session-all-1", "session-all-2"));
        
        when(sessionManager.getSessionsSubscribedTo("BANKNIFTY")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(indicesAllSessions);
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(260105L)).thenReturn(true);
        when(instrumentLoader.isStockToken(260105L)).thenReturn(false);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should send to all 3 sessions (1 subscribed + 2 indices/all)
        verify(sessionManager, times(3)).sendMessage(anyString(), anyString());
        verify(sessionManager).sendMessage(eq("session-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-all-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-all-2"), anyString());
    }

    @Test
    void shouldHandleFailedSendsGracefully() throws IOException {
        // Given: A tick and sessions where one send fails
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1", "session-2", "session-3"));
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(true);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);
        
        // Simulate failure for session-2
        doThrow(new IOException("Connection closed")).when(sessionManager).sendMessage(eq("session-2"), anyString());

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should still send to other sessions despite one failure
        verify(sessionManager, times(3)).sendMessage(anyString(), anyString());
        verify(sessionManager).sendMessage(eq("session-1"), anyString());
        verify(sessionManager).sendMessage(eq("session-2"), anyString());
        verify(sessionManager).sendMessage(eq("session-3"), anyString());
    }

    @Test
    void shouldNotBroadcastWhenNoTargetSessions() throws IOException {
        // Given: A tick with no subscribed sessions
        Tick tick = createSampleTick("UNKNOWN", 999999L, InstrumentType.STOCK);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        when(sessionManager.getSessionsSubscribedTo("UNKNOWN")).thenReturn(new HashSet<>());
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(999999L)).thenReturn(false);
        when(instrumentLoader.isStockToken(999999L)).thenReturn(false);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should not send any messages
        verify(sessionManager, never()).sendMessage(anyString(), anyString());
    }

    @Test
    void shouldConvertTickToDtoCorrectly() throws Exception {
        // Given: A tick with all fields populated
        Tick tick = createSampleTick("RELIANCE", 738561L, InstrumentType.STOCK);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1"));
        when(sessionManager.getSessionsSubscribedTo("RELIANCE")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(738561L)).thenReturn(false);
        when(instrumentLoader.isStockToken(738561L)).thenReturn(true);

        // Capture the JSON sent
        final String[] capturedJson = new String[1];
        doAnswer(invocation -> {
            capturedJson[0] = invocation.getArgument(1);
            return null;
        }).when(sessionManager).sendMessage(eq("session-1"), anyString());

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: JSON should contain all tick fields
        assertThat(capturedJson[0]).isNotNull();
        TickDto dto = objectMapper.readValue(capturedJson[0], TickDto.class);
        
        assertThat(dto.getSymbol()).isEqualTo("RELIANCE");
        assertThat(dto.getInstrumentToken()).isEqualTo(738561L);
        assertThat(dto.getType()).isEqualTo("STOCK");
        assertThat(dto.getTimestamp()).isNotNull();
        assertThat(dto.getLastTradedPrice()).isEqualTo(2450.75);
        assertThat(dto.getVolume()).isEqualTo(1000000L);
        assertThat(dto.getOhlc()).isNotNull();
        assertThat(dto.getOhlc().getOpen()).isEqualTo(2440.00);
        assertThat(dto.getOhlc().getHigh()).isEqualTo(2455.50);
        assertThat(dto.getOhlc().getLow()).isEqualTo(2435.25);
        assertThat(dto.getOhlc().getClose()).isEqualTo(2450.75);
    }

    @Test
    void shouldSerializeToJsonOnce() throws IOException {
        // Given: A tick and multiple target sessions
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1", "session-2"));
        Set<String> indicesAllSessions = new HashSet<>(Arrays.asList("session-all-1"));
        
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(indicesAllSessions);
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(true);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);

        // Capture all JSON messages sent
        Set<String> capturedJsonMessages = new HashSet<>();
        doAnswer(invocation -> {
            capturedJsonMessages.add(invocation.getArgument(1));
            return null;
        }).when(sessionManager).sendMessage(anyString(), anyString());

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: All sessions should receive the same JSON string (serialized once)
        assertThat(capturedJsonMessages).hasSize(1);
        verify(sessionManager, times(3)).sendMessage(anyString(), anyString());
    }

    @Test
    void shouldHandleDuplicateSessionsInTargetSet() throws IOException {
        // Given: A session that appears in both subscribed and indices/all
        // (This shouldn't happen in practice, but we should handle it gracefully)
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        Set<String> subscribedSessions = new HashSet<>(Arrays.asList("session-1"));
        Set<String> indicesAllSessions = new HashSet<>(Arrays.asList("session-1"));
        
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(subscribedSessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(indicesAllSessions);
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(true);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(event);

        // Then: Should only send once to session-1 (Set deduplication)
        verify(sessionManager, times(1)).sendMessage(eq("session-1"), anyString());
    }

    @Test
    void shouldConvertEnumTypeToString() throws Exception {
        // Given: Ticks with different instrument types
        Tick indexTick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        Tick stockTick = createSampleTick("RELIANCE", 738561L, InstrumentType.STOCK);
        
        Set<String> sessions = new HashSet<>(Arrays.asList("session-1"));
        when(sessionManager.getSessionsSubscribedTo(anyString())).thenReturn(sessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(anyLong())).thenReturn(false);
        when(instrumentLoader.isStockToken(anyLong())).thenReturn(false);

        final String[] capturedJson = new String[2];
        doAnswer(invocation -> {
            capturedJson[0] = invocation.getArgument(1);
            return null;
        }).when(sessionManager).sendMessage(eq("session-1"), anyString());

        // When: Broadcasting index tick
        tickBroadcaster.onTickReceived(new TickReceivedEvent(indexTick));
        TickDto indexDto = objectMapper.readValue(capturedJson[0], TickDto.class);

        // Then: Type should be "INDEX" string
        assertThat(indexDto.getType()).isEqualTo("INDEX");

        // When: Broadcasting stock tick
        tickBroadcaster.onTickReceived(new TickReceivedEvent(stockTick));
        TickDto stockDto = objectMapper.readValue(capturedJson[0], TickDto.class);

        // Then: Type should be "STOCK" string
        assertThat(stockDto.getType()).isEqualTo("STOCK");
    }

    @Test
    void shouldFormatTimestampAsIso8601() throws Exception {
        // Given: A tick with a specific timestamp
        Instant timestamp = Instant.parse("2025-12-08T10:15:03.123Z");
        Tick tick = Tick.builder()
            .symbol("NIFTY 50")
            .instrumentToken(256265L)
            .type(InstrumentType.INDEX)
            .timestamp(timestamp)
            .lastTradedPrice(23754.25)
            .volume(5000000L)
            .ohlc(Tick.OHLC.builder()
                .open(23750.00)
                .high(23760.50)
                .low(23745.75)
                .close(23754.25)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
        
        Set<String> sessions = new HashSet<>(Arrays.asList("session-1"));
        when(sessionManager.getSessionsSubscribedTo("NIFTY 50")).thenReturn(sessions);
        when(sessionManager.getIndicesAllSessions()).thenReturn(new HashSet<>());
        when(sessionManager.getStocksAllSessions()).thenReturn(new HashSet<>());
        when(instrumentLoader.isIndexToken(256265L)).thenReturn(false);
        when(instrumentLoader.isStockToken(256265L)).thenReturn(false);

        final String[] capturedJson = new String[1];
        doAnswer(invocation -> {
            capturedJson[0] = invocation.getArgument(1);
            return null;
        }).when(sessionManager).sendMessage(eq("session-1"), anyString());

        // When: Broadcasting the tick
        tickBroadcaster.onTickReceived(new TickReceivedEvent(tick));

        // Then: Timestamp should be in ISO 8601 format
        TickDto dto = objectMapper.readValue(capturedJson[0], TickDto.class);
        assertThat(dto.getTimestamp()).isEqualTo("2025-12-08T10:15:03.123Z");
    }

    /**
     * Helper method to create a sample tick for testing
     */
    private Tick createSampleTick(String symbol, long instrumentToken, InstrumentType type) {
        return Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(type)
            .timestamp(Instant.now())
            .lastTradedPrice(2450.75)
            .volume(1000000L)
            .ohlc(Tick.OHLC.builder()
                .open(2440.00)
                .high(2455.50)
                .low(2435.25)
                .close(2450.75)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
    }
}
