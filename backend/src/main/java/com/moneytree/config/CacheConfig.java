package com.moneytree.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Cache configuration for application-level caching.
 * Uses Redis for distributed caching with configurable TTL.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache name for indices by exchange and segment
     */
    public static final String INDICES_BY_EXCHANGE_SEGMENT_CACHE = "indicesByExchangeSegment";

    /**
     * Cache name for distinct exchange values from instrument master
     * v2: Changed to cache List instead of ResponseEntity
     */
    public static final String INSTRUMENT_FILTERS_EXCHANGES = "instrumentFilters:v2:exchanges";

    /**
     * Cache name for distinct index values from instrument master
     * v2: Changed to cache List instead of ResponseEntity
     */
    public static final String INSTRUMENT_FILTERS_INDICES = "instrumentFilters:v2:indices";

    /**
     * Cache name for distinct segment values from instrument master
     * v2: Changed to cache List instead of ResponseEntity
     */
    public static final String INSTRUMENT_FILTERS_SEGMENTS = "instrumentFilters:v2:segments";

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration: 9 hours TTL
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(9))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Specific configuration for indices cache (9 hours)
        RedisCacheConfiguration indicesCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(9))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Specific configuration for instrument filters cache (7 days TTL)
        // Filter metadata rarely changes, so we cache for a week
        RedisCacheConfiguration filtersCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofDays(7))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration(INDICES_BY_EXCHANGE_SEGMENT_CACHE, indicesCacheConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_EXCHANGES, filtersCacheConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_INDICES, filtersCacheConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_SEGMENTS, filtersCacheConfig)
                .build();
    }
}

