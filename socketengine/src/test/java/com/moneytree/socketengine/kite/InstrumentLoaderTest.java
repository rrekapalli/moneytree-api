package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for InstrumentLoader.
 * Tests cache loading, database fallback, and lookup methods.
 */
@ExtendWith(MockitoExtension.class)
class InstrumentLoaderTest {
    
    @Mock
    private JdbcTemplate jdbcTemplate;
    
    @Mock
    private RedisTemplate<String, String> redisTemplate;
    
    @Mock
    private ListOperations<String, String> listOperations;
    
    private ObjectMapper objectMapper;
    private InstrumentLoader instrumentLoader;
    
    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        instrumentLoader = new InstrumentLoader(jdbcTemplate, redisTemplate, objectMapper);
        
        // Setup Redis template to return list operations
        when(redisTemplate.opsForList()).thenReturn(listOperations);
    }
    
    @Test
    void shouldLoadIndicesFromCacheWhenAvailable() throws Exception {
        // Given: Indices are cached in Redis
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        InstrumentInfo bankNifty = InstrumentInfo.builder()
            .instrumentToken(260105L)
            .exchangeToken(1016L)
            .tradingSymbol("NIFTY BANK")
            .type(InstrumentType.INDEX)
            .build();
        
        String niftyJson = objectMapper.writeValueAsString(nifty);
        String bankNiftyJson = objectMapper.writeValueAsString(bankNifty);
        
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(List.of(niftyJson, bankNiftyJson));
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(List.of()); // Empty stocks cache (will load from DB)
        
        // Mock database query for stocks (since stocks cache is empty)
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        // When: Load all instruments
        List<InstrumentInfo> instruments = instrumentLoader.loadAllInstruments();
        
        // Then: Should load indices from cache
        assertThat(instruments).hasSize(2);
        assertThat(instrumentLoader.isIndexToken(256265L)).isTrue();
        assertThat(instrumentLoader.isIndexToken(260105L)).isTrue();
        
        // Verify database was not queried for indices (loaded from cache)
        verify(jdbcTemplate, never()).query(contains("INDICES"), any(RowMapper.class));
        // But was queried for stocks (cache was empty)
        verify(jdbcTemplate, times(1)).query(contains("instrument_type = 'EQ'"), any(RowMapper.class));
    }
    
    @Test
    void shouldFallbackToDatabaseOnCacheMiss() {
        // Given: Cache is empty
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(null);
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(null);
        
        // Database returns indices
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenAnswer(invocation -> {
                RowMapper<InstrumentInfo> mapper = invocation.getArgument(1);
                // Simulate database result set
                return List.of(
                    InstrumentInfo.builder()
                        .instrumentToken(256265L)
                        .exchangeToken(1024L)
                        .tradingSymbol("NIFTY 50")
                        .type(InstrumentType.INDEX)
                        .build()
                );
            });
        
        // Database returns stocks
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenAnswer(invocation -> {
                return List.of(
                    InstrumentInfo.builder()
                        .instrumentToken(738561L)
                        .exchangeToken(2885L)
                        .tradingSymbol("RELIANCE")
                        .type(InstrumentType.STOCK)
                        .build()
                );
            });
        
        // When: Load all instruments
        List<InstrumentInfo> instruments = instrumentLoader.loadAllInstruments();
        
        // Then: Should load from database
        assertThat(instruments).hasSize(2);
        assertThat(instrumentLoader.isIndexToken(256265L)).isTrue();
        assertThat(instrumentLoader.isStockToken(738561L)).isTrue();
        
        // Verify database was queried
        verify(jdbcTemplate, times(1)).query(contains("INDICES"), any(RowMapper.class));
        verify(jdbcTemplate, times(1)).query(contains("instrument_type = 'EQ'"), any(RowMapper.class));
    }
    
    @Test
    void shouldLoadStocksFromCacheWhenAvailable() throws Exception {
        // Given: Stocks are cached in Redis
        InstrumentInfo reliance = InstrumentInfo.builder()
            .instrumentToken(738561L)
            .exchangeToken(2885L)
            .tradingSymbol("RELIANCE")
            .type(InstrumentType.STOCK)
            .build();
        
        InstrumentInfo infy = InstrumentInfo.builder()
            .instrumentToken(408065L)
            .exchangeToken(1594L)
            .tradingSymbol("INFY")
            .type(InstrumentType.STOCK)
            .build();
        
        String relianceJson = objectMapper.writeValueAsString(reliance);
        String infyJson = objectMapper.writeValueAsString(infy);
        
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(List.of()); // Empty indices cache (will load from DB)
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(List.of(relianceJson, infyJson));
        
        // Mock database query for indices (since indices cache is empty)
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        // When: Load all instruments
        List<InstrumentInfo> instruments = instrumentLoader.loadAllInstruments();
        
        // Then: Should load stocks from cache
        assertThat(instruments).hasSize(2);
        assertThat(instrumentLoader.isStockToken(738561L)).isTrue();
        assertThat(instrumentLoader.isStockToken(408065L)).isTrue();
        
        // Verify database was not queried for stocks (loaded from cache)
        verify(jdbcTemplate, never()).query(contains("instrument_type = 'EQ'"), any(RowMapper.class));
        // But was queried for indices (cache was empty)
        verify(jdbcTemplate, times(1)).query(contains("INDICES"), any(RowMapper.class));
    }
    
    @Test
    void shouldCacheInstrumentsWithCorrectTTL() throws Exception {
        // Given: Cache is empty, database returns instruments
        when(listOperations.range(anyString(), anyLong(), anyLong()))
            .thenReturn(null);
        
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of(
                InstrumentInfo.builder()
                    .instrumentToken(256265L)
                    .exchangeToken(1024L)
                    .tradingSymbol("NIFTY 50")
                    .type(InstrumentType.INDEX)
                    .build()
            ));
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        // When: Load instruments (which will cache them)
        instrumentLoader.loadAllInstruments();
        
        // Then: Should cache with 1-day TTL
        verify(redisTemplate).delete("instruments:nse:indices");
        verify(listOperations).rightPushAll(eq("instruments:nse:indices"), anyList());
        verify(redisTemplate).expire("instruments:nse:indices", Duration.ofDays(1));
    }
    
    @Test
    void shouldReturnTrueForIndexToken() {
        // Given: Indices loaded
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(null);
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(null);
        
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of(
                InstrumentInfo.builder()
                    .instrumentToken(256265L)
                    .exchangeToken(1024L)
                    .tradingSymbol("NIFTY 50")
                    .type(InstrumentType.INDEX)
                    .build()
            ));
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        instrumentLoader.loadAllInstruments();
        
        // When/Then: Check if token is an index
        assertThat(instrumentLoader.isIndexToken(256265L)).isTrue();
        assertThat(instrumentLoader.isIndexToken(999999L)).isFalse();
    }
    
    @Test
    void shouldReturnTrueForStockToken() {
        // Given: Stocks loaded
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(null);
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(null);
        
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of(
                InstrumentInfo.builder()
                    .instrumentToken(738561L)
                    .exchangeToken(2885L)
                    .tradingSymbol("RELIANCE")
                    .type(InstrumentType.STOCK)
                    .build()
            ));
        
        instrumentLoader.loadAllInstruments();
        
        // When/Then: Check if token is a stock
        assertThat(instrumentLoader.isStockToken(738561L)).isTrue();
        assertThat(instrumentLoader.isStockToken(999999L)).isFalse();
    }
    
    @Test
    void shouldReturnInstrumentInfoForValidToken() {
        // Given: Instruments loaded
        when(listOperations.range("instruments:nse:indices", 0, -1))
            .thenReturn(null);
        when(listOperations.range("instruments:nse:stocks", 0, -1))
            .thenReturn(null);
        
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of(nifty));
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        instrumentLoader.loadAllInstruments();
        
        // When: Get instrument info
        InstrumentInfo info = instrumentLoader.getInstrumentInfo(256265L);
        
        // Then: Should return correct info
        assertThat(info).isNotNull();
        assertThat(info.getTradingSymbol()).isEqualTo("NIFTY 50");
        assertThat(info.getType()).isEqualTo(InstrumentType.INDEX);
    }
    
    @Test
    void shouldReturnNullForInvalidToken() {
        // Given: Instruments loaded
        when(listOperations.range(anyString(), anyLong(), anyLong()))
            .thenReturn(null);
        
        when(jdbcTemplate.query(anyString(), any(RowMapper.class)))
            .thenReturn(List.of());
        
        instrumentLoader.loadAllInstruments();
        
        // When: Get instrument info for invalid token
        InstrumentInfo info = instrumentLoader.getInstrumentInfo(999999L);
        
        // Then: Should return null
        assertThat(info).isNull();
    }
    
    @Test
    void shouldRefreshCacheFromDatabase() {
        // Given: Initial load from cache
        when(listOperations.range(anyString(), anyLong(), anyLong()))
            .thenReturn(List.of());
        
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of(nifty));
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        instrumentLoader.loadAllInstruments();
        
        // When: Refresh cache
        instrumentLoader.refreshCache();
        
        // Then: Should reload from database and update cache
        verify(jdbcTemplate, times(2)).query(contains("INDICES"), any(RowMapper.class));
        verify(jdbcTemplate, times(2)).query(contains("instrument_type = 'EQ'"), any(RowMapper.class));
        verify(redisTemplate, times(2)).delete("instruments:nse:indices");
        verify(redisTemplate, times(2)).delete("instruments:nse:stocks");
    }
    
    @Test
    void shouldHandleRedisCacheFailureGracefully() {
        // Given: Redis throws exception
        when(listOperations.range(anyString(), anyLong(), anyLong()))
            .thenThrow(new RuntimeException("Redis connection failed"));
        
        // Database returns instruments
        when(jdbcTemplate.query(contains("INDICES"), any(RowMapper.class)))
            .thenReturn(List.of(
                InstrumentInfo.builder()
                    .instrumentToken(256265L)
                    .exchangeToken(1024L)
                    .tradingSymbol("NIFTY 50")
                    .type(InstrumentType.INDEX)
                    .build()
            ));
        
        when(jdbcTemplate.query(contains("instrument_type = 'EQ'"), any(RowMapper.class)))
            .thenReturn(List.of());
        
        // When: Load instruments (should fallback to database)
        List<InstrumentInfo> instruments = instrumentLoader.loadAllInstruments();
        
        // Then: Should still load from database
        assertThat(instruments).hasSize(1);
        assertThat(instrumentLoader.isIndexToken(256265L)).isTrue();
    }
}
