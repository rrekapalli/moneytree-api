package com.moneytree.socketengine.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * Integration tests for TickCacheService with real Redis instance.
 * Uses Testcontainers to spin up a Redis container for testing.
 * 
 * Tests verify:
 * - Ticks are cached to Redis asynchronously
 * - TTL is set correctly (2 days)
 * - getTodayTicks() retrieves cached ticks
 * - Time-window filtering works correctly
 * - Redis errors don't crash the service
 */
@Testcontainers
class TickCacheServiceIntegrationTest {
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
        .withExposedPorts(6379);
    
    private RedisTemplate<String, String> redisTemplate;
    private ObjectMapper objectMapper;
    private MeterRegistry meterRegistry;
    private TickCacheService tickCacheService;
    private LettuceConnectionFactory connectionFactory;
    
    @BeforeEach
    void setUp() {
        // Setup Redis connection
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redis.getHost());
        config.setPort(redis.getFirstMappedPort());
        
        connectionFactory = new LettuceConnectionFactory(config);
        connectionFactory.afterPropertiesSet();
        
        // Setup RedisTemplate
        redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(connectionFactory);
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new StringRedisSerializer());
        redisTemplate.afterPropertiesSet();
        
        // Setup ObjectMapper
        objectMapper = new ObjectMapper();
        
        // Setup MeterRegistry
        meterRegistry = new SimpleMeterRegistry();
        
        // Create TickCacheService instance
        tickCacheService = new TickCacheService(redisTemplate, objectMapper, meterRegistry);
        
        // Clear Redis before each test
        redisTemplate.getConnectionFactory().getConnection().serverCommands().flushAll();
    }
    
    @AfterEach
    void tearDown() {
        if (connectionFactory != null) {
            connectionFactory.destroy();
        }
    }
    
    @Test
    void shouldCacheTickToRedis() throws Exception {
        // Given: A tick event
        Tick tick = createSampleTick("NIFTY 50", 256265L, InstrumentType.INDEX);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // When: Cache the tick (simulate async processing by calling directly)
        CompletableFuture.runAsync(() -> tickCacheService.onTickReceived(event))
            .get(2, TimeUnit.SECONDS);
        
        // Then: Tick should be in Redis
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:NIFTY 50", tradingDate);
        
        await().atMost(Duration.ofSeconds(2))
            .until(() -> Boolean.TRUE.equals(redisTemplate.hasKey(key)));
        
        List<String> cachedTicks = redisTemplate.opsForList().range(key, 0, -1);
        assertThat(cachedTicks).hasSize(1);
        
        // Verify tick data
        TickDto cachedDto = objectMapper.readValue(cachedTicks.get(0), TickDto.class);
        assertThat(cachedDto.getSymbol()).isEqualTo("NIFTY 50");
        assertThat(cachedDto.getInstrumentToken()).isEqualTo(256265L);
        assertThat(cachedDto.getLastTradedPrice()).isEqualTo(23754.25);
    }
    
    @Test
    void shouldSetTTLCorrectly() throws Exception {
        // Given: A tick event
        Tick tick = createSampleTick("RELIANCE", 738561L, InstrumentType.STOCK);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // When: Cache the tick
        CompletableFuture.runAsync(() -> tickCacheService.onTickReceived(event))
            .get(2, TimeUnit.SECONDS);
        
        // Then: TTL should be set to 2 days
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:RELIANCE", tradingDate);
        
        await().atMost(Duration.ofSeconds(2))
            .until(() -> Boolean.TRUE.equals(redisTemplate.hasKey(key)));
        
        Long ttl = redisTemplate.getExpire(key);
        assertThat(ttl).isNotNull();
        // TTL should be close to 2 days (172800 seconds), allow some margin
        assertThat(ttl).isGreaterThan(172700L).isLessThanOrEqualTo(172800L);
    }
    
    @Test
    void shouldRetrieveTodayTicksFromCache() throws Exception {
        // Given: Multiple ticks cached in Redis
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:INFY", tradingDate);
        
        for (int i = 0; i < 10; i++) {
            Tick tick = createSampleTickWithTimestamp("INFY", 408065L, 
                Instant.now().minusSeconds(i * 60));
            TickDto dto = toDto(tick);
            String json = objectMapper.writeValueAsString(dto);
            redisTemplate.opsForList().rightPush(key, json);
        }
        
        // When: Retrieve today's ticks
        List<Tick> ticks = tickCacheService.getTodayTicks("INFY", null);
        
        // Then: Should return all cached ticks
        assertThat(ticks).hasSize(10);
        assertThat(ticks).allMatch(t -> t.getSymbol().equals("INFY"));
    }
    
    @Test
    void shouldFilterTicksByTimeWindow() throws Exception {
        // Given: Ticks from last 30 minutes
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:TCS", tradingDate);
        
        Instant now = Instant.now();
        
        // Add ticks at different times
        for (int i = 0; i < 30; i++) {
            Tick tick = createSampleTickWithTimestamp("TCS", 2953217L, 
                now.minusSeconds(i * 60)); // One tick per minute
            TickDto dto = toDto(tick);
            String json = objectMapper.writeValueAsString(dto);
            redisTemplate.opsForList().rightPush(key, json);
        }
        
        // When: Retrieve last 5 minutes
        List<Tick> ticks = tickCacheService.getTodayTicks("TCS", 5);
        
        // Then: Should return only recent ticks (approximately 5-6 ticks)
        assertThat(ticks).hasSizeLessThanOrEqualTo(6);
        assertThat(ticks).allMatch(tick -> 
            tick.getTimestamp().isAfter(now.minus(Duration.ofMinutes(5))));
    }
    
    @Test
    void shouldHandleEmptyCache() {
        // Given: Empty cache for a symbol
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:WIPRO", tradingDate);
        redisTemplate.delete(key);
        
        // When: Retrieve ticks
        List<Tick> ticks = tickCacheService.getTodayTicks("WIPRO", null);
        
        // Then: Should return empty list
        assertThat(ticks).isEmpty();
    }
    
    @Test
    void shouldHandleRedisConnectionErrors() {
        // Given: A tick event
        Tick tick = createSampleTick("HDFC", 341249L, InstrumentType.STOCK);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // When: Destroy connection to simulate Redis error
        connectionFactory.destroy();
        
        // Then: Should not throw exception (errors are logged)
        try {
            tickCacheService.onTickReceived(event);
            // If we get here, the service handled the error gracefully
            assertThat(true).isTrue();
        } catch (Exception e) {
            // Should not throw
            throw new AssertionError("TickCacheService should handle Redis errors gracefully", e);
        }
    }
    
    @Test
    void shouldHandleMalformedCachedData() throws Exception {
        // Given: Malformed JSON in cache
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:ICICI", tradingDate);
        
        // Add valid tick
        Tick validTick = createSampleTick("ICICI", 1270529L, InstrumentType.STOCK);
        TickDto dto = toDto(validTick);
        String validJson = objectMapper.writeValueAsString(dto);
        redisTemplate.opsForList().rightPush(key, validJson);
        
        // Add malformed JSON
        redisTemplate.opsForList().rightPush(key, "{invalid json}");
        
        // Add another valid tick
        redisTemplate.opsForList().rightPush(key, validJson);
        
        // When: Retrieve ticks
        List<Tick> ticks = tickCacheService.getTodayTicks("ICICI", null);
        
        // Then: Should return only valid ticks (malformed ones are filtered out)
        assertThat(ticks).hasSize(2);
        assertThat(ticks).allMatch(t -> t.getSymbol().equals("ICICI"));
    }
    
    @Test
    void shouldCacheMultipleTicksForSameSymbol() throws Exception {
        // Given: Multiple tick events for same symbol
        String symbol = "SBIN";
        long instrumentToken = 779521L;
        
        // When: Cache multiple ticks
        for (int i = 0; i < 5; i++) {
            Tick tick = createSampleTickWithTimestamp(symbol, instrumentToken, 
                Instant.now().minusSeconds(i * 10));
            TickReceivedEvent event = new TickReceivedEvent(tick);
            CompletableFuture.runAsync(() -> tickCacheService.onTickReceived(event))
                .get(2, TimeUnit.SECONDS);
        }
        
        // Then: All ticks should be in cache
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:%s", tradingDate, symbol);
        
        await().atMost(Duration.ofSeconds(3))
            .until(() -> {
                List<String> cached = redisTemplate.opsForList().range(key, 0, -1);
                return cached != null && cached.size() == 5;
            });
        
        List<Tick> ticks = tickCacheService.getTodayTicks(symbol, null);
        assertThat(ticks).hasSize(5);
    }
    
    @Test
    void shouldPreserveOHLCDataInCache() throws Exception {
        // Given: A tick with OHLC data
        Tick tick = Tick.builder()
            .symbol("TATAMOTORS")
            .instrumentToken(884737L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(450.50)
            .volume(1000000L)
            .ohlc(Tick.OHLC.builder()
                .open(445.00)
                .high(452.00)
                .low(444.50)
                .close(450.50)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
        
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // When: Cache the tick
        CompletableFuture.runAsync(() -> tickCacheService.onTickReceived(event))
            .get(2, TimeUnit.SECONDS);
        
        // Then: OHLC data should be preserved
        List<Tick> ticks = tickCacheService.getTodayTicks("TATAMOTORS", null);
        assertThat(ticks).hasSize(1);
        
        Tick cached = ticks.get(0);
        assertThat(cached.getOhlc()).isNotNull();
        assertThat(cached.getOhlc().getOpen()).isEqualTo(445.00);
        assertThat(cached.getOhlc().getHigh()).isEqualTo(452.00);
        assertThat(cached.getOhlc().getLow()).isEqualTo(444.50);
        assertThat(cached.getOhlc().getClose()).isEqualTo(450.50);
    }
    
    // Helper methods
    
    private Tick createSampleTick(String symbol, long instrumentToken, InstrumentType type) {
        return createSampleTickWithTimestamp(symbol, instrumentToken, Instant.now());
    }
    
    private Tick createSampleTickWithTimestamp(String symbol, long instrumentToken, Instant timestamp) {
        return Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(InstrumentType.STOCK)
            .timestamp(timestamp)
            .lastTradedPrice(23754.25)
            .volume(1000000L)
            .ohlc(Tick.OHLC.builder()
                .open(23750.00)
                .high(23800.00)
                .low(23700.00)
                .close(23754.25)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
    }
    
    private String getTradingDate() {
        return ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
            .toLocalDate()
            .toString();
    }
    
    private TickDto toDto(Tick tick) {
        return TickDto.builder()
            .symbol(tick.getSymbol())
            .instrumentToken(tick.getInstrumentToken())
            .type(tick.getType().name())
            .timestamp(tick.getTimestamp().toString())
            .lastTradedPrice(tick.getLastTradedPrice())
            .volume(tick.getVolume())
            .ohlc(new TickDto.OHLCDto(
                tick.getOhlc().getOpen(),
                tick.getOhlc().getHigh(),
                tick.getOhlc().getLow(),
                tick.getOhlc().getClose()
            ))
            .build();
    }
}
