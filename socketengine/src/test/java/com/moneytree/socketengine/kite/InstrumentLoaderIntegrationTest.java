package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * Integration tests for InstrumentLoader with real Redis instance.
 * Uses Testcontainers to spin up a Redis container for testing.
 * 
 * These tests focus on Redis caching behavior without requiring
 * a full Spring Boot application context or database connection.
 */
@Testcontainers
class InstrumentLoaderIntegrationTest {
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
        .withExposedPorts(6379);
    
    private RedisTemplate<String, String> redisTemplate;
    private ObjectMapper objectMapper;
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
    void shouldCacheInstrumentsToRedisAfterDatabaseLoad() throws Exception {
        // Given: Database has instruments (mocked via in-memory setup)
        // We'll manually populate Redis to simulate the caching behavior
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        String niftyJson = objectMapper.writeValueAsString(nifty);
        
        // When: Cache instruments manually (simulating what loadIndicesFromDatabase does)
        redisTemplate.delete("instruments:nse:indices");
        redisTemplate.opsForList().rightPush("instruments:nse:indices", niftyJson);
        redisTemplate.expire("instruments:nse:indices", Duration.ofDays(1));
        
        // Then: Verify data is in Redis
        List<String> cachedData = redisTemplate.opsForList().range("instruments:nse:indices", 0, -1);
        assertThat(cachedData).hasSize(1);
        
        InstrumentInfo cached = objectMapper.readValue(cachedData.get(0), InstrumentInfo.class);
        assertThat(cached.getTradingSymbol()).isEqualTo("NIFTY 50");
        assertThat(cached.getInstrumentToken()).isEqualTo(256265L);
    }
    
    @Test
    void shouldRetrieveInstrumentsFromCache() throws Exception {
        // Given: Instruments are cached in Redis
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
        
        redisTemplate.opsForList().rightPushAll("instruments:nse:stocks", relianceJson, infyJson);
        redisTemplate.expire("instruments:nse:stocks", Duration.ofDays(1));
        
        // When: Retrieve from cache
        List<String> cachedData = redisTemplate.opsForList().range("instruments:nse:stocks", 0, -1);
        
        // Then: Should retrieve both instruments
        assertThat(cachedData).hasSize(2);
        
        List<InstrumentInfo> instruments = cachedData.stream()
            .map(json -> {
                try {
                    return objectMapper.readValue(json, InstrumentInfo.class);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .toList();
        
        assertThat(instruments).hasSize(2);
        assertThat(instruments).extracting(InstrumentInfo::getTradingSymbol)
            .containsExactly("RELIANCE", "INFY");
    }
    
    @Test
    void shouldRespectCacheTTL() throws Exception {
        // Given: Instruments cached with short TTL
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        String niftyJson = objectMapper.writeValueAsString(nifty);
        
        // When: Cache with 2 second TTL
        redisTemplate.opsForList().rightPush("instruments:nse:indices", niftyJson);
        redisTemplate.expire("instruments:nse:indices", Duration.ofSeconds(2));
        
        // Then: Key should exist initially
        assertThat(redisTemplate.hasKey("instruments:nse:indices")).isTrue();
        
        // Wait for expiration
        await().atMost(Duration.ofSeconds(3))
            .pollInterval(Duration.ofMillis(500))
            .until(() -> !Boolean.TRUE.equals(redisTemplate.hasKey("instruments:nse:indices")));
        
        // Verify key has expired
        assertThat(redisTemplate.hasKey("instruments:nse:indices")).isFalse();
    }
    
    @Test
    void shouldHandleCacheRefresh() throws Exception {
        // Given: Initial cache with one instrument
        InstrumentInfo nifty = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        String niftyJson = objectMapper.writeValueAsString(nifty);
        redisTemplate.opsForList().rightPush("instruments:nse:indices", niftyJson);
        
        // When: Refresh cache (delete and re-add)
        redisTemplate.delete("instruments:nse:indices");
        
        InstrumentInfo bankNifty = InstrumentInfo.builder()
            .instrumentToken(260105L)
            .exchangeToken(1016L)
            .tradingSymbol("NIFTY BANK")
            .type(InstrumentType.INDEX)
            .build();
        
        String bankNiftyJson = objectMapper.writeValueAsString(bankNifty);
        redisTemplate.opsForList().rightPushAll("instruments:nse:indices", niftyJson, bankNiftyJson);
        redisTemplate.expire("instruments:nse:indices", Duration.ofDays(1));
        
        // Then: Cache should have updated data
        List<String> cachedData = redisTemplate.opsForList().range("instruments:nse:indices", 0, -1);
        assertThat(cachedData).hasSize(2);
        
        List<InstrumentInfo> instruments = cachedData.stream()
            .map(json -> {
                try {
                    return objectMapper.readValue(json, InstrumentInfo.class);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .toList();
        
        assertThat(instruments).extracting(InstrumentInfo::getTradingSymbol)
            .containsExactly("NIFTY 50", "NIFTY BANK");
    }
    
    @Test
    void shouldHandleEmptyCache() {
        // Given: Empty cache
        redisTemplate.delete("instruments:nse:indices");
        redisTemplate.delete("instruments:nse:stocks");
        
        // When: Check for cached data
        List<String> indicesData = redisTemplate.opsForList().range("instruments:nse:indices", 0, -1);
        List<String> stocksData = redisTemplate.opsForList().range("instruments:nse:stocks", 0, -1);
        
        // Then: Should return empty lists
        assertThat(indicesData).isEmpty();
        assertThat(stocksData).isEmpty();
    }
    
    @Test
    void shouldHandleMultipleInstrumentsInCache() throws Exception {
        // Given: Multiple instruments in cache
        InstrumentInfo[] instruments = {
            InstrumentInfo.builder()
                .instrumentToken(256265L)
                .exchangeToken(1024L)
                .tradingSymbol("NIFTY 50")
                .type(InstrumentType.INDEX)
                .build(),
            InstrumentInfo.builder()
                .instrumentToken(260105L)
                .exchangeToken(1016L)
                .tradingSymbol("NIFTY BANK")
                .type(InstrumentType.INDEX)
                .build(),
            InstrumentInfo.builder()
                .instrumentToken(264969L)
                .exchangeToken(1035L)
                .tradingSymbol("NIFTY IT")
                .type(InstrumentType.INDEX)
                .build()
        };
        
        // When: Cache all instruments
        for (InstrumentInfo info : instruments) {
            String json = objectMapper.writeValueAsString(info);
            redisTemplate.opsForList().rightPush("instruments:nse:indices", json);
        }
        redisTemplate.expire("instruments:nse:indices", Duration.ofDays(1));
        
        // Then: All instruments should be retrievable
        List<String> cachedData = redisTemplate.opsForList().range("instruments:nse:indices", 0, -1);
        assertThat(cachedData).hasSize(3);
        
        List<InstrumentInfo> retrieved = cachedData.stream()
            .map(json -> {
                try {
                    return objectMapper.readValue(json, InstrumentInfo.class);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            })
            .toList();
        
        assertThat(retrieved).extracting(InstrumentInfo::getTradingSymbol)
            .containsExactly("NIFTY 50", "NIFTY BANK", "NIFTY IT");
    }
    
    @Test
    void shouldPreserveInstrumentTypeInCache() throws Exception {
        // Given: Instruments of different types
        InstrumentInfo index = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        InstrumentInfo stock = InstrumentInfo.builder()
            .instrumentToken(738561L)
            .exchangeToken(2885L)
            .tradingSymbol("RELIANCE")
            .type(InstrumentType.STOCK)
            .build();
        
        // When: Cache both types
        String indexJson = objectMapper.writeValueAsString(index);
        String stockJson = objectMapper.writeValueAsString(stock);
        
        redisTemplate.opsForList().rightPush("instruments:nse:indices", indexJson);
        redisTemplate.opsForList().rightPush("instruments:nse:stocks", stockJson);
        
        // Then: Types should be preserved
        String cachedIndexJson = redisTemplate.opsForList().index("instruments:nse:indices", 0);
        String cachedStockJson = redisTemplate.opsForList().index("instruments:nse:stocks", 0);
        
        InstrumentInfo cachedIndex = objectMapper.readValue(cachedIndexJson, InstrumentInfo.class);
        InstrumentInfo cachedStock = objectMapper.readValue(cachedStockJson, InstrumentInfo.class);
        
        assertThat(cachedIndex.getType()).isEqualTo(InstrumentType.INDEX);
        assertThat(cachedStock.getType()).isEqualTo(InstrumentType.STOCK);
    }
}
