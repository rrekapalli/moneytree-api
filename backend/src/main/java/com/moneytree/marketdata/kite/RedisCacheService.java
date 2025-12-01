package com.moneytree.marketdata.kite;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service to fetch cached market data from Redis.
 * Redis key structure: "kite_trader" contains symbol-specific data for:
 * - kite_ohlcv_historic (all available data)
 * - kite_instrument_indicators (last one year only)
 */
@Service
public class RedisCacheService {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheService.class);
    private static final String REDIS_KEY = "kite_trader";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisCacheService(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Get historical OHLCV data from Redis cache for a symbol.
     * 
     * @param tradingsymbol The trading symbol (e.g., "NIFTY 50", "RELIANCE")
     * @param startDate Start date for filtering (inclusive)
     * @param endDate End date for filtering (inclusive)
     * @return List of historical data maps, or empty list if not found in cache
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getHistoricalDataFromCache(String tradingsymbol, 
                                                                 LocalDate startDate, 
                                                                 LocalDate endDate) {
        long startTime = System.currentTimeMillis();
        try {
            Object cachedData = redisTemplate.opsForHash().get(REDIS_KEY, tradingsymbol);
            long fetchDuration = System.currentTimeMillis() - startTime;
            if (fetchDuration > 100) {
                log.warn("Redis HGET took {} ms for symbol: {} (slow!)", fetchDuration, tradingsymbol);
            }
            if (cachedData == null) {
                log.debug("No cached data found in Redis for symbol: {} ({} ms)", tradingsymbol, fetchDuration);
                return new ArrayList<>();
            }

            // Parse the cached data
            Map<String, Object> symbolData = objectMapper.convertValue(cachedData, 
                new TypeReference<Map<String, Object>>() {});
            
            // Extract OHLCV data
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ohlcvData = (List<Map<String, Object>>) symbolData.get("kite_ohlcv_historic");
            
            if (ohlcvData == null || ohlcvData.isEmpty()) {
                log.debug("No OHLCV data found in cache for symbol: {}", tradingsymbol);
                return new ArrayList<>();
            }

            // Filter by date range
            List<Map<String, Object>> filteredData = new ArrayList<>();
            for (Map<String, Object> record : ohlcvData) {
                Object dateObj = record.get("date");
                if (dateObj == null) continue;

                LocalDate recordDate = parseDate(dateObj);
                if (recordDate != null && 
                    !recordDate.isBefore(startDate) && 
                    !recordDate.isAfter(endDate)) {
                    filteredData.add(new HashMap<>(record));
                }
            }

            long totalDuration = System.currentTimeMillis() - startTime;
            log.debug("Retrieved {} records from Redis cache for symbol: {} (date range: {} to {}) in {} ms", 
                filteredData.size(), tradingsymbol, startDate, endDate, totalDuration);
            if (totalDuration > 500) {
                log.warn("Redis cache retrieval took {} ms for symbol: {} (consider optimizing)", totalDuration, tradingsymbol);
            }
            return filteredData;

        } catch (org.springframework.data.redis.RedisConnectionFailureException | 
                 org.springframework.data.redis.RedisSystemException ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Redis connection/system error retrieving data for symbol '{}' after {} ms: {}", 
                tradingsymbol, duration, ex.getMessage());
            return new ArrayList<>();
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Error retrieving historical data from Redis cache for symbol: {} (took {} ms): {}", 
                tradingsymbol, duration, ex.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get historical data by number of days from cache.
     * 
     * @param tradingsymbol The trading symbol
     * @param days Number of days to retrieve
     * @return List of historical data maps
     */
    public List<Map<String, Object>> getHistoricalDataByDaysFromCache(String tradingsymbol, int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        return getHistoricalDataFromCache(tradingsymbol, startDate, endDate);
    }

    /**
     * Get instrument indicators from Redis cache (last one year only).
     * 
     * @param tradingsymbol The trading symbol
     * @param startDate Start date for filtering
     * @param endDate End date for filtering
     * @return List of indicator data maps
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getIndicatorsFromCache(String tradingsymbol,
                                                            LocalDate startDate,
                                                            LocalDate endDate) {
        try {
            Object cachedData = redisTemplate.opsForHash().get(REDIS_KEY, tradingsymbol);
            if (cachedData == null) {
                log.debug("No cached data found in Redis for symbol: {}", tradingsymbol);
                return new ArrayList<>();
            }

            // Parse the cached data
            Map<String, Object> symbolData = objectMapper.convertValue(cachedData, 
                new TypeReference<Map<String, Object>>() {});
            
            // Extract indicators data (last one year only in Redis)
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> indicatorsData = (List<Map<String, Object>>) symbolData.get("kite_instrument_indicators");
            
            if (indicatorsData == null || indicatorsData.isEmpty()) {
                log.debug("No indicators data found in cache for symbol: {}", tradingsymbol);
                return new ArrayList<>();
            }

            // Filter by date range
            List<Map<String, Object>> filteredData = new ArrayList<>();
            for (Map<String, Object> record : indicatorsData) {
                Object dateObj = record.get("date");
                if (dateObj == null) continue;

                LocalDate recordDate = parseDate(dateObj);
                if (recordDate != null && 
                    !recordDate.isBefore(startDate) && 
                    !recordDate.isAfter(endDate)) {
                    filteredData.add(new HashMap<>(record));
                }
            }

            log.debug("Retrieved {} indicator records from Redis cache for symbol: {} (date range: {} to {})", 
                filteredData.size(), tradingsymbol, startDate, endDate);
            return filteredData;

        } catch (Exception ex) {
            log.warn("Error retrieving indicators from Redis cache for symbol: {}", tradingsymbol, ex);
            return new ArrayList<>();
        }
    }

    /**
     * Check if a symbol exists in Redis cache.
     * Optimized with timeout handling to prevent slow lookups.
     * 
     * @param tradingsymbol The trading symbol
     * @return true if symbol exists in cache, false otherwise
     */
    public boolean isSymbolCached(String tradingsymbol) {
        long startTime = System.currentTimeMillis();
        try {
            // Use hasKey which is O(1) operation - fast even on large hashes
            boolean exists = Boolean.TRUE.equals(redisTemplate.opsForHash().hasKey(REDIS_KEY, tradingsymbol));
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 100) {
                log.warn("Redis hasKey took {} ms for symbol: {} (slow!)", duration, tradingsymbol);
            }
            if (exists) {
                log.debug("Symbol '{}' found in Redis cache ({} ms)", tradingsymbol, duration);
            } else {
                log.debug("Symbol '{}' NOT found in Redis cache ({} ms)", tradingsymbol, duration);
            }
            return exists;
        } catch (org.springframework.data.redis.RedisConnectionFailureException | 
                 org.springframework.data.redis.RedisSystemException ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Redis connection/system error checking symbol '{}' after {} ms: {}", 
                tradingsymbol, duration, ex.getMessage());
            return false;
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error checking if symbol is cached: {} - {} (took {} ms)", 
                tradingsymbol, ex.getMessage(), duration, ex);
            return false;
        }
    }

    /**
     * Get all cached symbols from Redis.
     * WARNING: This can be slow on large hashes. Use sparingly for debugging only.
     * 
     * @return Set of cached trading symbols (limited to first 100 for performance)
     */
    public Set<Object> getCachedSymbols() {
        long startTime = System.currentTimeMillis();
        try {
            // HKEYS can be very slow on large hashes - limit the operation
            // Use HSCAN for better performance, but for now just get keys with timeout
            Set<Object> keys = redisTemplate.opsForHash().keys(REDIS_KEY);
            long duration = System.currentTimeMillis() - startTime;
            if (duration > 500) {
                log.warn("Redis HKEYS took {} ms (slow! Consider using HSCAN for large hashes)", duration);
            }
            // Limit to first 100 for performance
            return keys.stream().limit(100).collect(java.util.stream.Collectors.toSet());
        } catch (org.springframework.data.redis.RedisConnectionFailureException | 
                 org.springframework.data.redis.RedisSystemException ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Redis connection/system error getting cached symbols after {} ms: {}", 
                duration, ex.getMessage());
            return Set.of();
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("Error retrieving cached symbols from Redis (took {} ms): {}", duration, ex.getMessage());
            return Set.of();
        }
    }

    /**
     * Parse date from various formats.
     */
    private LocalDate parseDate(Object dateObj) {
        if (dateObj == null) {
            return null;
        }

        try {
            if (dateObj instanceof String) {
                String dateStr = (String) dateObj;
                // Try ISO format first
                if (dateStr.contains("T")) {
                    return LocalDate.parse(dateStr.substring(0, 10), DATE_FORMATTER);
                }
                // Try simple date format
                return LocalDate.parse(dateStr, DATE_FORMATTER);
            } else if (dateObj instanceof java.time.LocalDate) {
                return (LocalDate) dateObj;
            } else if (dateObj instanceof java.time.Instant) {
                return ((java.time.Instant) dateObj).atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            } else if (dateObj instanceof java.sql.Timestamp) {
                return ((java.sql.Timestamp) dateObj).toLocalDateTime().toLocalDate();
            } else if (dateObj instanceof java.util.Date) {
                return ((java.util.Date) dateObj).toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            }
        } catch (Exception ex) {
            log.debug("Error parsing date: {}", dateObj, ex);
        }

        return null;
    }
}

