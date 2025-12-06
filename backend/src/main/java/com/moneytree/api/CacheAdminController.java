package com.moneytree.api;

import com.moneytree.config.CacheConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Admin controller for cache management operations.
 */
@RestController
@RequestMapping("/api/v1/admin/cache")
@Tag(name = "Cache Admin", description = "Cache management operations")
public class CacheAdminController {

    private static final Logger log = LoggerFactory.getLogger(CacheAdminController.class);

    private final CacheManager cacheManager;

    public CacheAdminController(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Clear all instrument filter caches.
     * Use this after updating the cache structure or when encountering serialization issues.
     */
    @DeleteMapping("/instrument-filters")
    @Operation(
        summary = "Clear instrument filter caches",
        description = "Clears all instrument filter caches (exchanges, indices, segments). " +
                     "Use this after code changes that affect cache structure."
    )
    public ResponseEntity<?> clearInstrumentFilterCaches() {
        try {
            log.info("Clearing instrument filter caches");
            
            int clearedCount = 0;
            
            // Clear exchanges cache
            var exchangesCache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_EXCHANGES);
            if (exchangesCache != null) {
                exchangesCache.clear();
                clearedCount++;
                log.info("Cleared cache: {}", CacheConfig.INSTRUMENT_FILTERS_EXCHANGES);
            }
            
            // Clear indices cache
            var indicesCache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_INDICES);
            if (indicesCache != null) {
                indicesCache.clear();
                clearedCount++;
                log.info("Cleared cache: {}", CacheConfig.INSTRUMENT_FILTERS_INDICES);
            }
            
            // Clear segments cache
            var segmentsCache = cacheManager.getCache(CacheConfig.INSTRUMENT_FILTERS_SEGMENTS);
            if (segmentsCache != null) {
                segmentsCache.clear();
                clearedCount++;
                log.info("Cleared cache: {}", CacheConfig.INSTRUMENT_FILTERS_SEGMENTS);
            }
            
            log.info("Successfully cleared {} instrument filter caches", clearedCount);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully cleared instrument filter caches",
                "cachesCleared", clearedCount
            ));
        } catch (Exception ex) {
            log.error("Error clearing instrument filter caches", ex);
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Failed to clear caches: " + ex.getMessage())
            );
        }
    }

    /**
     * Clear all application caches.
     */
    @DeleteMapping("/all")
    @Operation(
        summary = "Clear all caches",
        description = "Clears all application caches. Use with caution."
    )
    public ResponseEntity<?> clearAllCaches() {
        try {
            log.info("Clearing all application caches");
            
            int clearedCount = 0;
            for (String cacheName : cacheManager.getCacheNames()) {
                var cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.clear();
                    clearedCount++;
                    log.info("Cleared cache: {}", cacheName);
                }
            }
            
            log.info("Successfully cleared {} caches", clearedCount);
            return ResponseEntity.ok(Map.of(
                "message", "Successfully cleared all caches",
                "cachesCleared", clearedCount
            ));
        } catch (Exception ex) {
            log.error("Error clearing all caches", ex);
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Failed to clear caches: " + ex.getMessage())
            );
        }
    }
}
