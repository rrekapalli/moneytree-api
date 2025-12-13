package com.moneytree.socketengine.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cache configuration for the SocketEngine module.
 * Enables caching for index instrument queries to improve performance.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Creates a cache manager for index instrument data.
     * Uses in-memory concurrent maps for simplicity and performance.
     * 
     * Cache names:
     * - indexInstruments: Caches instrument lists by index name
     * - indexInstrumentTokens: Caches instrument token sets by index name
     * - indexTradingSymbols: Caches trading symbol sets by index name
     * - allIndexNames: Caches the list of all available index names
     * 
     * @return CacheManager instance
     */
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
            "indexInstruments",
            "indexInstrumentTokens", 
            "indexTradingSymbols",
            "allIndexNames"
        );
    }
}