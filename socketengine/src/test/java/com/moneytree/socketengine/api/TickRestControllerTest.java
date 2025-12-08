package com.moneytree.socketengine.api;

import com.moneytree.socketengine.api.dto.SubscriptionResponseDto;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.broadcast.SessionManager;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.kite.InstrumentLoader;
import com.moneytree.socketengine.kite.KiteTickParser;
import com.moneytree.socketengine.persistence.TickEntity;
import com.moneytree.socketengine.persistence.TickRepository;
import com.moneytree.socketengine.redis.TickCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TickRestController.
 */
@ExtendWith(MockitoExtension.class)
class TickRestControllerTest {

    @Mock
    private TickCacheService cacheService;

    @Mock
    private TickRepository tickRepository;

    @Mock
    private SessionManager sessionManager;

    @Mock
    private InstrumentLoader instrumentLoader;

    @Mock
    private KiteTickParser tickParser;

    @InjectMocks
    private TickRestController controller;

    private Tick sampleTick;
    private TickEntity sampleEntity;

    @BeforeEach
    void setUp() {
        // Create sample tick for testing
        sampleTick = Tick.builder()
            .symbol("NIFTY 50")
            .instrumentToken(256265L)
            .type(InstrumentType.INDEX)
            .timestamp(Instant.parse("2025-12-08T10:15:00Z"))
            .lastTradedPrice(23754.25)
            .volume(1234567L)
            .ohlc(Tick.OHLC.builder()
                .open(23450.0)
                .high(23800.0)
                .low(23320.0)
                .close(23500.0)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();

        // Create sample entity for testing
        sampleEntity = TickEntity.builder()
            .instrumentToken(256265L)
            .tradingSymbol("NIFTY 50")
            .exchange("NSE")
            .tickTimestamp(Instant.parse("2025-12-08T10:15:00Z"))
            .rawTickData(new byte[]{0x01, 0x02, 0x03})
            .build();
    }

    @Test
    void shouldGetTodayTicksSuccessfully() {
        // Given: Cache service returns ticks
        List<Tick> ticks = Arrays.asList(sampleTick);
        when(cacheService.getTodayTicks("NIFTY 50", null)).thenReturn(ticks);

        // When: Getting today's ticks
        ResponseEntity<List<TickDto>> response = controller.getTodayTicks("NIFTY 50", null);

        // Then: Should return OK with tick data
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        
        TickDto dto = response.getBody().get(0);
        assertThat(dto.getSymbol()).isEqualTo("NIFTY 50");
        assertThat(dto.getInstrumentToken()).isEqualTo(256265L);
        assertThat(dto.getLastTradedPrice()).isEqualTo(23754.25);
        
        verify(cacheService).getTodayTicks("NIFTY 50", null);
    }

    @Test
    void shouldGetTodayTicksWithLastMinutesFilter() {
        // Given: Cache service returns filtered ticks
        List<Tick> ticks = Arrays.asList(sampleTick);
        when(cacheService.getTodayTicks("RELIANCE", 5)).thenReturn(ticks);

        // When: Getting today's ticks with time filter
        ResponseEntity<List<TickDto>> response = controller.getTodayTicks("RELIANCE", 5);

        // Then: Should return OK with filtered tick data
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        
        verify(cacheService).getTodayTicks("RELIANCE", 5);
    }

    @Test
    void shouldReturnBadRequestForInvalidLastMinutes() {
        // When: Getting today's ticks with invalid lastMinutes (zero)
        ResponseEntity<List<TickDto>> response1 = controller.getTodayTicks("NIFTY 50", 0);

        // Then: Should return BAD_REQUEST
        assertThat(response1.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        
        // When: Getting today's ticks with invalid lastMinutes (negative)
        ResponseEntity<List<TickDto>> response2 = controller.getTodayTicks("NIFTY 50", -5);

        // Then: Should return BAD_REQUEST
        assertThat(response2.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        
        verify(cacheService, never()).getTodayTicks(anyString(), anyInt());
    }

    @Test
    void shouldReturnEmptyListWhenNoTicksInCache() {
        // Given: Cache service returns empty list
        when(cacheService.getTodayTicks("UNKNOWN", null)).thenReturn(Collections.emptyList());

        // When: Getting today's ticks for unknown symbol
        ResponseEntity<List<TickDto>> response = controller.getTodayTicks("UNKNOWN", null);

        // Then: Should return OK with empty list
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void shouldHandleExceptionWhenGettingTodayTicks() {
        // Given: Cache service throws exception
        when(cacheService.getTodayTicks(anyString(), any()))
            .thenThrow(new RuntimeException("Redis connection failed"));

        // When: Getting today's ticks
        ResponseEntity<List<TickDto>> response = controller.getTodayTicks("NIFTY 50", null);

        // Then: Should return INTERNAL_SERVER_ERROR
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void shouldGetHistoricalTicksSuccessfully() {
        // Given: Repository returns tick entities
        Instant startTime = Instant.parse("2025-12-08T09:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T15:00:00Z");
        
        List<TickEntity> entities = Arrays.asList(sampleEntity);
        when(tickRepository.findByTradingSymbolAndTimestampBetween("NIFTY 50", startTime, endTime))
            .thenReturn(entities);
        
        // Mock parser to return tick
        when(tickParser.parse(any(byte[].class))).thenReturn(Arrays.asList(sampleTick));

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", startTime, endTime);

        // Then: Should return OK with tick data
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        
        TickDto dto = response.getBody().get(0);
        assertThat(dto.getSymbol()).isEqualTo("NIFTY 50");
        assertThat(dto.getInstrumentToken()).isEqualTo(256265L);
        
        verify(tickRepository).findByTradingSymbolAndTimestampBetween("NIFTY 50", startTime, endTime);
        verify(tickParser).parse(sampleEntity.getRawTickData());
    }

    @Test
    void shouldReturnBadRequestWhenStartTimeAfterEndTime() {
        // Given: Invalid time range (start after end)
        Instant startTime = Instant.parse("2025-12-08T15:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T09:00:00Z");

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", startTime, endTime);

        // Then: Should return BAD_REQUEST
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        
        verify(tickRepository, never()).findByTradingSymbolAndTimestampBetween(anyString(), any(), any());
    }

    @Test
    void shouldReturnBadRequestWhenStartTimeEqualsEndTime() {
        // Given: Invalid time range (start equals end)
        Instant time = Instant.parse("2025-12-08T10:00:00Z");

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", time, time);

        // Then: Should return BAD_REQUEST
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        
        verify(tickRepository, never()).findByTradingSymbolAndTimestampBetween(anyString(), any(), any());
    }

    @Test
    void shouldFilterOutFailedParsingInHistoricalTicks() {
        // Given: Repository returns multiple entities, but one fails to parse
        Instant startTime = Instant.parse("2025-12-08T09:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T15:00:00Z");
        
        TickEntity entity1 = sampleEntity;
        TickEntity entity2 = TickEntity.builder()
            .instrumentToken(738561L)
            .tradingSymbol("RELIANCE")
            .exchange("NSE")
            .tickTimestamp(Instant.parse("2025-12-08T10:20:00Z"))
            .rawTickData(new byte[]{0x04, 0x05, 0x06})
            .build();
        
        List<TickEntity> entities = Arrays.asList(entity1, entity2);
        when(tickRepository.findByTradingSymbolAndTimestampBetween(anyString(), any(), any()))
            .thenReturn(entities);
        
        // First parse succeeds, second fails
        when(tickParser.parse(entity1.getRawTickData())).thenReturn(Arrays.asList(sampleTick));
        when(tickParser.parse(entity2.getRawTickData())).thenThrow(new RuntimeException("Parse error"));

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", startTime, endTime);

        // Then: Should return OK with only successfully parsed ticks
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);  // Only one tick parsed successfully
    }

    @Test
    void shouldReturnEmptyListWhenNoHistoricalTicks() {
        // Given: Repository returns empty list
        Instant startTime = Instant.parse("2025-12-08T09:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T15:00:00Z");
        
        when(tickRepository.findByTradingSymbolAndTimestampBetween(anyString(), any(), any()))
            .thenReturn(Collections.emptyList());

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("UNKNOWN", startTime, endTime);

        // Then: Should return OK with empty list
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void shouldHandleExceptionWhenGettingHistoricalTicks() {
        // Given: Repository throws exception
        Instant startTime = Instant.parse("2025-12-08T09:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T15:00:00Z");
        
        when(tickRepository.findByTradingSymbolAndTimestampBetween(anyString(), any(), any()))
            .thenThrow(new RuntimeException("Database connection failed"));

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", startTime, endTime);

        // Then: Should return INTERNAL_SERVER_ERROR
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void shouldGetActiveSubscriptionsSuccessfully() {
        // Given: Session manager has active sessions
        Set<String> sessionIds = new HashSet<>(Arrays.asList("session-1", "session-2"));
        when(sessionManager.getAllSessionIds()).thenReturn(sessionIds);
        
        when(sessionManager.getSessionEndpoint("session-1")).thenReturn("/ws/indices");
        when(sessionManager.getSessionEndpoint("session-2")).thenReturn("/ws/stocks/nse/all");
        
        when(sessionManager.getSessionSubscriptions("session-1"))
            .thenReturn(new HashSet<>(Arrays.asList("NIFTY 50", "BANKNIFTY")));
        when(sessionManager.getSessionSubscriptions("session-2"))
            .thenReturn(Collections.emptySet());

        // When: Getting active subscriptions
        ResponseEntity<Map<String, SubscriptionResponseDto>> response = controller.getActiveSubscriptions();

        // Then: Should return OK with subscription data
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(2);
        
        SubscriptionResponseDto dto1 = response.getBody().get("session-1");
        assertThat(dto1).isNotNull();
        assertThat(dto1.getSessionId()).isEqualTo("session-1");
        assertThat(dto1.getEndpoint()).isEqualTo("/ws/indices");
        assertThat(dto1.getSubscribedSymbols()).containsExactlyInAnyOrder("NIFTY 50", "BANKNIFTY");
        
        SubscriptionResponseDto dto2 = response.getBody().get("session-2");
        assertThat(dto2).isNotNull();
        assertThat(dto2.getSessionId()).isEqualTo("session-2");
        assertThat(dto2.getEndpoint()).isEqualTo("/ws/stocks/nse/all");
        assertThat(dto2.getSubscribedSymbols()).isEmpty();
        
        verify(sessionManager).getAllSessionIds();
        verify(sessionManager, times(2)).getSessionEndpoint(anyString());
        verify(sessionManager, times(2)).getSessionSubscriptions(anyString());
    }

    @Test
    void shouldReturnEmptyMapWhenNoActiveSessions() {
        // Given: No active sessions
        when(sessionManager.getAllSessionIds()).thenReturn(Collections.emptySet());

        // When: Getting active subscriptions
        ResponseEntity<Map<String, SubscriptionResponseDto>> response = controller.getActiveSubscriptions();

        // Then: Should return OK with empty map
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEmpty();
    }

    @Test
    void shouldHandleExceptionWhenGettingActiveSubscriptions() {
        // Given: Session manager throws exception
        when(sessionManager.getAllSessionIds()).thenThrow(new RuntimeException("Internal error"));

        // When: Getting active subscriptions
        ResponseEntity<Map<String, SubscriptionResponseDto>> response = controller.getActiveSubscriptions();

        // Then: Should return INTERNAL_SERVER_ERROR
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void shouldRefreshInstrumentCacheSuccessfully() {
        // Given: Instrument loader can refresh cache
        doNothing().when(instrumentLoader).refreshCache();

        // When: Refreshing instrument cache
        ResponseEntity<String> response = controller.refreshInstrumentCache();

        // Then: Should return OK with success message
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Instrument cache refreshed successfully");
        
        verify(instrumentLoader).refreshCache();
    }

    @Test
    void shouldHandleExceptionWhenRefreshingInstrumentCache() {
        // Given: Instrument loader throws exception
        doThrow(new RuntimeException("Database connection failed"))
            .when(instrumentLoader).refreshCache();

        // When: Refreshing instrument cache
        ResponseEntity<String> response = controller.refreshInstrumentCache();

        // Then: Should return INTERNAL_SERVER_ERROR with error message
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).contains("Failed to refresh cache");
        assertThat(response.getBody()).contains("Database connection failed");
    }

    @Test
    void shouldConvertTickToDtoCorrectly() {
        // Given: A tick with all fields populated
        Tick tick = Tick.builder()
            .symbol("RELIANCE")
            .instrumentToken(738561L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.parse("2025-12-08T11:30:00Z"))
            .lastTradedPrice(2456.75)
            .volume(9876543L)
            .ohlc(Tick.OHLC.builder()
                .open(2450.0)
                .high(2460.0)
                .low(2445.0)
                .close(2455.0)
                .build())
            .build();

        when(cacheService.getTodayTicks("RELIANCE", null)).thenReturn(Arrays.asList(tick));

        // When: Getting today's ticks (which internally converts to DTO)
        ResponseEntity<List<TickDto>> response = controller.getTodayTicks("RELIANCE", null);

        // Then: DTO should have all fields correctly mapped
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        TickDto dto = response.getBody().get(0);
        
        assertThat(dto.getSymbol()).isEqualTo("RELIANCE");
        assertThat(dto.getInstrumentToken()).isEqualTo(738561L);
        assertThat(dto.getType()).isEqualTo("STOCK");
        assertThat(dto.getTimestamp()).isEqualTo("2025-12-08T11:30:00Z");
        assertThat(dto.getLastTradedPrice()).isEqualTo(2456.75);
        assertThat(dto.getVolume()).isEqualTo(9876543L);
        
        assertThat(dto.getOhlc()).isNotNull();
        assertThat(dto.getOhlc().getOpen()).isEqualTo(2450.0);
        assertThat(dto.getOhlc().getHigh()).isEqualTo(2460.0);
        assertThat(dto.getOhlc().getLow()).isEqualTo(2445.0);
        assertThat(dto.getOhlc().getClose()).isEqualTo(2455.0);
    }

    @Test
    void shouldHandleParserReturningEmptyList() {
        // Given: Repository returns entity but parser returns empty list
        Instant startTime = Instant.parse("2025-12-08T09:00:00Z");
        Instant endTime = Instant.parse("2025-12-08T15:00:00Z");
        
        List<TickEntity> entities = Arrays.asList(sampleEntity);
        when(tickRepository.findByTradingSymbolAndTimestampBetween(anyString(), any(), any()))
            .thenReturn(entities);
        
        when(tickParser.parse(any(byte[].class))).thenReturn(Collections.emptyList());

        // When: Getting historical ticks
        ResponseEntity<List<TickDto>> response = controller.getHistoricalTicks("NIFTY 50", startTime, endTime);

        // Then: Should return OK with empty list (filtered out null)
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).isEmpty();
    }
}
