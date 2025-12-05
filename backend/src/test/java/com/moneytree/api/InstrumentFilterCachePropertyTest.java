package com.moneytree.api;

import com.moneytree.config.CacheConfig;
import com.moneytree.marketdata.kite.KiteMarketDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.TestPropertySource;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Property-based test for cache hit behavior in InstrumentFilterController.
 * 
 * Feature: dashboard-instrument-filters
 * Tests that cached filter values avoid database access on subsequent requests.
 * 
 * Note: This test runs 100 times to verify the property holds consistently,
 * simulating property-based testing behavior.
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/moneytree",
    "spring.datasource.username=postgres",
    "spring.datasource.password=postgres",
    "spring.cache.type=simple"  // Use simple in-memory cache for testing
})
class InstrumentFilterCachePropertyTest {

    @Autowired
    private InstrumentFilterController controller;

    @SpyBean
    private KiteMarketDataRepository repository;

    @Autowired
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        // Clear all caches before each test
        if (cacheManager != null) {
            cacheManager.getCacheNames().forEach(cacheName -> {
                var cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.clear();
                }
            });
        }
        
        // Reset mock invocation counts
        clearInvocations(repository);
    }

    /**
     * Feature: dashboard-instrument-filters, Property 6: Cache hit avoids database access
     * 
     * Property 6: Cache hit avoids database access
     * For any cached filter value that has not expired,
     * subsequent requests should return the cached data without querying the database.
     * 
     * Validates: Requirements 3.2
     */
    @Test
    void cacheHitAvoidsExchangesDatabaseAccess() {
        // Run 100 times to verify property holds consistently
        for (int iteration = 0; iteration < 100; iteration++) {
            // Clear cache and reset mock for this iteration
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_EXCHANGES);
                if (cache != null) {
                    cache.clear();
                }
            }
            clearInvocations(repository);
            
            // First call - should hit database
            controller.getDistinctExchanges();
            
            // Verify database was called exactly once
            verify(repository, times(1)).getDistinctExchanges();
            
            // Second call - should hit cache
            controller.getDistinctExchanges();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctExchanges();
            
            // Third call - should still hit cache
            controller.getDistinctExchanges();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctExchanges();
            
            // Log progress every 10 iterations
            if ((iteration + 1) % 10 == 0) {
                System.out.println("✓ Cache hit property verified for exchanges: " + (iteration + 1) + "/100 iterations");
            }
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 6: Cache hit avoids database access
     * 
     * Property 6: Cache hit avoids database access
     * For any cached filter value that has not expired,
     * subsequent requests should return the cached data without querying the database.
     * 
     * Validates: Requirements 3.2
     */
    @Test
    void cacheHitAvoidsIndicesDatabaseAccess() {
        // Run 100 times to verify property holds consistently
        for (int iteration = 0; iteration < 100; iteration++) {
            // Clear cache and reset mock for this iteration
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_INDICES);
                if (cache != null) {
                    cache.clear();
                }
            }
            clearInvocations(repository);
            
            // First call - should hit database
            controller.getDistinctIndices();
            
            // Verify database was called exactly once
            verify(repository, times(1)).getDistinctIndices();
            
            // Second call - should hit cache
            controller.getDistinctIndices();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctIndices();
            
            // Third call - should still hit cache
            controller.getDistinctIndices();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctIndices();
            
            // Log progress every 10 iterations
            if ((iteration + 1) % 10 == 0) {
                System.out.println("✓ Cache hit property verified for indices: " + (iteration + 1) + "/100 iterations");
            }
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 6: Cache hit avoids database access
     * 
     * Property 6: Cache hit avoids database access
     * For any cached filter value that has not expired,
     * subsequent requests should return the cached data without querying the database.
     * 
     * Validates: Requirements 3.2
     */
    @Test
    void cacheHitAvoidsSegmentsDatabaseAccess() {
        // Run 100 times to verify property holds consistently
        for (int iteration = 0; iteration < 100; iteration++) {
            // Clear cache and reset mock for this iteration
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_SEGMENTS);
                if (cache != null) {
                    cache.clear();
                }
            }
            clearInvocations(repository);
            
            // First call - should hit database
            controller.getDistinctSegments();
            
            // Verify database was called exactly once
            verify(repository, times(1)).getDistinctSegments();
            
            // Second call - should hit cache
            controller.getDistinctSegments();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctSegments();
            
            // Third call - should still hit cache
            controller.getDistinctSegments();
            
            // Verify database was still called only once (cache hit)
            verify(repository, times(1)).getDistinctSegments();
            
            // Log progress every 10 iterations
            if ((iteration + 1) % 10 == 0) {
                System.out.println("✓ Cache hit property verified for segments: " + (iteration + 1) + "/100 iterations");
            }
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 6: Cache hit avoids database access
     * 
     * Additional test: Verify cache returns same data as database
     * For any cached filter value, the cached data should be identical to the database data.
     * 
     * Validates: Requirements 3.2
     */
    @Test
    void cacheReturnsIdenticalDataToDatabase() {
        // Test exchanges
        for (int i = 0; i < 100; i++) {
            // Clear cache
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_EXCHANGES);
                if (cache != null) {
                    cache.clear();
                }
            }
            
            // First call - from database
            var response1 = controller.getDistinctExchanges();
            @SuppressWarnings("unchecked")
            List<String> dbData = (List<String>) response1.getBody();
            
            // Second call - from cache
            var response2 = controller.getDistinctExchanges();
            @SuppressWarnings("unchecked")
            List<String> cachedData = (List<String>) response2.getBody();
            
            // Verify data is identical
            assertThat(cachedData)
                .as("Cached data should be identical to database data (iteration " + i + ")")
                .isEqualTo(dbData);
        }
        
        // Test indices
        for (int i = 0; i < 100; i++) {
            // Clear cache
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_INDICES);
                if (cache != null) {
                    cache.clear();
                }
            }
            
            // First call - from database
            var response1 = controller.getDistinctIndices();
            @SuppressWarnings("unchecked")
            List<String> dbData = (List<String>) response1.getBody();
            
            // Second call - from cache
            var response2 = controller.getDistinctIndices();
            @SuppressWarnings("unchecked")
            List<String> cachedData = (List<String>) response2.getBody();
            
            // Verify data is identical
            assertThat(cachedData)
                .as("Cached data should be identical to database data (iteration " + i + ")")
                .isEqualTo(dbData);
        }
        
        // Test segments
        for (int i = 0; i < 100; i++) {
            // Clear cache
            if (cacheManager != null) {
                var cache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_SEGMENTS);
                if (cache != null) {
                    cache.clear();
                }
            }
            
            // First call - from database
            var response1 = controller.getDistinctSegments();
            @SuppressWarnings("unchecked")
            List<String> dbData = (List<String>) response1.getBody();
            
            // Second call - from cache
            var response2 = controller.getDistinctSegments();
            @SuppressWarnings("unchecked")
            List<String> cachedData = (List<String>) response2.getBody();
            
            // Verify data is identical
            assertThat(cachedData)
                .as("Cached data should be identical to database data (iteration " + i + ")")
                .isEqualTo(dbData);
        }
    }
}
