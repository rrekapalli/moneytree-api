package com.moneytree.marketdata.kite;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Repository façade over TimescaleDB kite_* tables.
 *
 * This repository provides methods to query kite_ohlcv_historic, kite_instrument_ticks,
 * and kite_instrument_master tables for market data operations.
 */
@Repository
public class KiteMarketDataRepository {

    private static final Logger log = LoggerFactory.getLogger(KiteMarketDataRepository.class);

    private final JdbcTemplate jdbcTemplate;
    private final RedisCacheService redisCacheService;

    public KiteMarketDataRepository(JdbcTemplate jdbcTemplate, RedisCacheService redisCacheService) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisCacheService = redisCacheService;
    }

    public List<Map<String, Object>> loadHistoricalCandles(String instrumentToken,
                                                           Instant from,
                                                           Instant to,
                                                           String interval) {
        log.debug("Loading historical candles instrumentToken={}, from={}, to={}, interval={}",
                instrumentToken, from, to, interval);
        // Optimized for TimescaleDB: filter by time first (enables chunk exclusion), then by instrument
        String sql = """
                SELECT date, open, high, low, close, volume, candle_interval
                FROM kite_ohlcv_historic
                WHERE date >= ?
                  AND date <= ?
                  AND instrument_token = ?
                  AND exchange = 'NSE'
                  AND candle_interval = ?
                ORDER BY date ASC
                """;
        return jdbcTemplate.queryForList(sql, from, to, instrumentToken, interval);
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null) {
            return "";
        }
        return symbol.toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    /**
     * List instruments by exchange and segment filters with previous day's close price.
     * Optimized for performance: filters master table first, then joins with hypertable.
     */
    public List<Map<String, Object>> getInstrumentsByExchangeAndSegment(String exchange, String segment) {
        String normalizedExchange = exchange != null && !exchange.isBlank() ? exchange.trim().toUpperCase() : null;
        String normalizedSegment = segment != null && !segment.isBlank() ? segment.trim().toUpperCase() : null;

        log.info("Listing instruments by exchange={}, segment={}", normalizedExchange, normalizedSegment);
        long startTime = System.currentTimeMillis();

        // Ultra-optimized: Pre-calculate previous date, then efficient indexed join
        // Reduced to 500 rows max for better performance
        String sql = """
                WITH prev_date AS (
                    SELECT MAX(date) as prev_date
                    FROM kite_ohlcv_historic
                    WHERE date < CURRENT_DATE
                      AND candle_interval = 'day'
                      AND exchange IN ('NSE', 'NSE_INDEX')
                    LIMIT 1
                ),
                filtered_instruments AS (
                    SELECT 
                        kim.instrument_token,
                        kim.tradingsymbol,
                        kim."name",
                        kim.exchange,
                        kim.segment
                    FROM kite_instrument_master kim
                    WHERE ( ? IS NULL
                            OR kim.exchange = ?
                            OR (? = 'NSE' AND kim.exchange IN ('NSE', 'NSE_INDEX'))
                            OR (? = 'NSE_INDEX' AND kim.exchange IN ('NSE', 'NSE_INDEX')) )
                      AND ( ? IS NULL OR kim.segment = ? )
                      AND kim.instrument_type = 'EQ'
                      AND kim.expiry IS NULL
                      AND kim.name IS NOT NULL
                    LIMIT 500
                )
                SELECT 
                    fi.instrument_token,
                    fi.tradingsymbol,
                    fi."name",
                    fi.exchange,
                    fi.segment,
                    curr.date,
                    curr."close",
                    NULL::float8 AS previous_close
                FROM filtered_instruments fi
                CROSS JOIN prev_date pd
                INNER JOIN kite_ohlcv_historic curr
                    ON curr.instrument_token = fi.instrument_token
                   AND curr.exchange = fi.exchange
                   AND curr.date = pd.prev_date
                   AND curr.candle_interval = 'day'
                ORDER BY fi.tradingsymbol ASC
                """;

        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql,
                normalizedExchange, normalizedExchange,
                normalizedExchange, normalizedExchange,
                normalizedSegment, normalizedSegment
        );
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Retrieved {} instruments in {} ms", results.size(), duration);
        return results;
    }

    /**
     * Get instrument info by name from kite_instrument_master
     */
    public Map<String, Object> getInstrumentByName(String name) {
        log.debug("Getting instrument by name: {}", name);
        String normalized = normalizeSymbol(name);
        String sql = """
                SELECT instrument_token, exchange_token, tradingsymbol, name, last_price,
                       expiry, strike, tick_size, lot_size, instrument_type, segment, exchange
                FROM kite_instrument_master
                WHERE (
                        UPPER(TRIM(name)) = UPPER(TRIM(?))
                     OR UPPER(TRIM(tradingsymbol)) = UPPER(TRIM(?))
                     OR REGEXP_REPLACE(UPPER(name), '[^A-Z0-9]', '', 'g') = ?
                     OR REGEXP_REPLACE(UPPER(tradingsymbol), '[^A-Z0-9]', '', 'g') = ?
                  )
                ORDER BY
                    CASE WHEN UPPER(segment) = 'INDICES' THEN 0 ELSE 1 END,
                    CASE WHEN UPPER(exchange) IN ('NSE', 'NSE_INDEX') THEN 0 ELSE 1 END,
                    CASE WHEN UPPER(TRIM(tradingsymbol)) = UPPER(TRIM(?)) THEN 0 ELSE 1 END,
                    CASE WHEN UPPER(TRIM(name)) = UPPER(TRIM(?)) THEN 0 ELSE 1 END
                LIMIT 1
                """;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql,
                name, name,
                normalized, normalized,
                name, name
        );
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Get previous day's data for an index from kite_ohlcv_historic
     */
    public Map<String, Object> getPreviousDayData(String tradingsymbol) {
        log.debug("Getting previous day data for tradingsymbol: {}", tradingsymbol);
        
        // First, get instrument_token to avoid complex regex joins
        Map<String, Object> instrument = getInstrumentByName(tradingsymbol);
        if (instrument == null) {
            log.warn("Instrument not found for: {}", tradingsymbol);
            return null;
        }
        
        String instrumentToken = (String) instrument.get("instrument_token");
        String exchange = (String) instrument.get("exchange");
        
        if (instrumentToken == null) {
            log.warn("Instrument token not found for: {}", tradingsymbol);
            return null;
        }
        
        // Optimized for TimescaleDB: filter by time first (enables chunk exclusion), then by instrument_token
        // Get the most recent day's data before today
        String sql = """
                SELECT o.date, o.open, o.high, o.low, o.close, o.volume,
                       m.name, m.tradingsymbol, m.last_price
                FROM kite_ohlcv_historic o
                JOIN kite_instrument_master m ON o.instrument_token = m.instrument_token 
                    AND o.exchange = m.exchange
                WHERE o.instrument_token = ?
                  AND o.exchange = ?
                  AND o.candle_interval = 'day'
                  AND o.date < CURRENT_DATE
                ORDER BY o.date DESC
                LIMIT 1
                """;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql,
                instrumentToken,
                exchange != null ? exchange : "NSE"
        );
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Get historical data for an index from kite_ohlcv_historic
     * For indices, prioritize volume from nse_idx_ohlcv_historic as it has accurate volume data
     * This method checks Redis cache first, then falls back to database if cache miss.
     */
    public List<Map<String, Object>> getHistoricalData(String tradingsymbol, int days) {
        log.info("Getting historical data for tradingsymbol: {}, days: {}", tradingsymbol, days);
        
        // Try Redis cache first - use tradingsymbol from DB as the key
        try {
            // First, get the actual tradingsymbol from database - this is what's used as the Redis key
            Map<String, Object> instrument = getInstrumentByName(tradingsymbol);
            String redisKey = null;
            
            if (instrument != null) {
                redisKey = (String) instrument.get("tradingsymbol");
                if (redisKey == null || redisKey.isEmpty()) {
                    // Fallback to name if tradingsymbol is not available
                    redisKey = (String) instrument.get("name");
                }
            }
            
            // If we couldn't get from DB, try the input directly (might already be a tradingsymbol)
            if (redisKey == null || redisKey.isEmpty()) {
                redisKey = tradingsymbol;
            }
            
            // Normalize the key (uppercase, trimmed)
            redisKey = redisKey != null ? redisKey.toUpperCase().trim() : tradingsymbol.toUpperCase().trim();
            
            log.debug("Using tradingsymbol '{}' as Redis key for lookup", redisKey);
            
            // Check Redis cache using the tradingsymbol
            if (redisCacheService.isSymbolCached(redisKey)) {
                log.info("Found symbol in Redis cache with key: {}", redisKey);
                List<Map<String, Object>> cachedData = redisCacheService.getHistoricalDataByDaysFromCache(redisKey, days);
                if (!cachedData.isEmpty()) {
                    log.info("✅ Retrieved {} records from Redis cache for symbol: {} ({} days)", 
                        cachedData.size(), redisKey, days);
                    // Add name and tradingsymbol fields if missing (for compatibility with existing code)
                    String finalName = instrument != null ? (String) instrument.get("name") : tradingsymbol;
                    String finalTradingsymbol = redisKey;
                    for (Map<String, Object> record : cachedData) {
                        if (!record.containsKey("name")) {
                            record.put("name", finalName);
                        }
                        if (!record.containsKey("tradingsymbol")) {
                            record.put("tradingsymbol", finalTradingsymbol);
                        }
                    }
                    return cachedData;
                } else {
                    log.warn("Symbol {} found in Redis but no data for {} days", redisKey, days);
                }
            } else {
                log.warn("Symbol '{}' not found in Redis cache", redisKey);
            }
        } catch (Exception ex) {
            log.error("Error retrieving from Redis cache, falling back to database: {}", ex.getMessage(), ex);
        }
        
        // Fallback to database - Optimized for TimescaleDB
        log.warn("⚠️ Cache miss - querying database for symbol: {} (this will be slower)", tradingsymbol);
        
        // First, get instrument_token to avoid complex regex joins
        Map<String, Object> instrument = getInstrumentByName(tradingsymbol);
        if (instrument == null) {
            log.warn("Instrument not found for: {}", tradingsymbol);
            return List.of();
        }
        
        String instrumentToken = (String) instrument.get("instrument_token");
        String exchange = (String) instrument.get("exchange");
        String instrumentName = (String) instrument.get("name");
        String instrumentTradingsymbol = (String) instrument.get("tradingsymbol");
        
        if (instrumentToken == null) {
            log.warn("Instrument token not found for: {}", tradingsymbol);
            return List.of();
        }
        
        // Calculate date range for TimescaleDB chunk exclusion
        java.time.LocalDate endDate = java.time.LocalDate.now();
        java.time.LocalDate startDate = endDate.minusDays(days);
        
        // Optimized query: filter by time first (enables TimescaleDB chunk exclusion), then by instrument_token
        // Use direct instrument_token lookup instead of complex joins with regex
        String sql = """
                SELECT o.date, o.open, o.high, o.low, o.close, 
                       COALESCE(
                           NULLIF(nidx.volume, 0),  -- Use nse_idx_ohlcv_historic volume if not 0
                           NULLIF(o.volume, 0),      -- Fallback to kite_ohlcv_historic volume if not 0
                           0                         -- Default to 0 if both are 0 or NULL
                       ) as volume,
                       ? as name,
                       ? as tradingsymbol
                FROM kite_ohlcv_historic o
                LEFT JOIN nse_idx_ohlcv_historic nidx ON 
                    nidx.index_name = ?
                    AND nidx.date = DATE(o.date)
                WHERE o.instrument_token = ?
                  AND o.exchange = ?
                  AND o.candle_interval = 'day'
                  AND o.date >= ?
                  AND o.date <= ?
                ORDER BY o.date ASC
                """;
        return jdbcTemplate.queryForList(
                sql,
                instrumentName != null ? instrumentName : tradingsymbol,
                instrumentTradingsymbol != null ? instrumentTradingsymbol : tradingsymbol,
                instrumentName != null ? instrumentName : instrumentTradingsymbol, // For nidx join
                instrumentToken,
                exchange != null ? exchange : "NSE",
                startDate,
                endDate
        );
    }

    /**
     * Get historical data for an index from kite_ohlcv_historic using date range
     * For indices, prioritize volume from nse_idx_ohlcv_historic as it has accurate volume data
     * This method checks Redis cache first, then falls back to database if cache miss.
     */
    public List<Map<String, Object>> getHistoricalDataByDateRange(String tradingsymbol, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        log.info("Getting historical data for tradingsymbol: {}, startDate: {}, endDate: {}", tradingsymbol, startDate, endDate);
        
        // Try Redis cache first - use tradingsymbol from DB as the key
        try {
            // First, get the actual tradingsymbol from database - this is what's used as the Redis key
            Map<String, Object> instrument = getInstrumentByName(tradingsymbol);
            String redisKey = null;
            
            if (instrument != null) {
                redisKey = (String) instrument.get("tradingsymbol");
                if (redisKey == null || redisKey.isEmpty()) {
                    // Fallback to name if tradingsymbol is not available
                    redisKey = (String) instrument.get("name");
                }
            }
            
            // If we couldn't get from DB, try the input directly (might already be a tradingsymbol)
            if (redisKey == null || redisKey.isEmpty()) {
                redisKey = tradingsymbol;
            }
            
            // Normalize the key (uppercase, trimmed)
            redisKey = redisKey != null ? redisKey.toUpperCase().trim() : tradingsymbol.toUpperCase().trim();
            
            log.debug("Using tradingsymbol '{}' as Redis key for lookup", redisKey);
            
            // Check Redis cache using the tradingsymbol
            if (redisCacheService.isSymbolCached(redisKey)) {
                log.info("Found symbol in Redis cache with key: {}", redisKey);
                List<Map<String, Object>> cachedData = redisCacheService.getHistoricalDataFromCache(redisKey, startDate, endDate);
                if (!cachedData.isEmpty()) {
                    log.info("✅ Retrieved {} records from Redis cache for symbol: {} (date range: {} to {})", 
                        cachedData.size(), redisKey, startDate, endDate);
                    // Add name and tradingsymbol fields if missing (for compatibility with existing code)
                    String finalName = instrument != null ? (String) instrument.get("name") : tradingsymbol;
                    String finalTradingsymbol = redisKey;
                    for (Map<String, Object> record : cachedData) {
                        if (!record.containsKey("name")) {
                            record.put("name", finalName);
                        }
                        if (!record.containsKey("tradingsymbol")) {
                            record.put("tradingsymbol", finalTradingsymbol);
                        }
                    }
                    return cachedData;
                } else {
                    log.warn("Symbol {} found in Redis but no data in date range {} to {}", redisKey, startDate, endDate);
                }
            } else {
                log.debug("Symbol '{}' not found in Redis cache", redisKey);
                // Don't call getCachedSymbols() on every request - it's slow!
                // Only log available symbols in debug mode or when explicitly needed
                if (log.isDebugEnabled()) {
                    try {
                        Set<Object> cachedSymbols = redisCacheService.getCachedSymbols();
                        log.debug("Available cached symbols in Redis (first 20): {}", 
                            cachedSymbols.stream().limit(20).map(Object::toString).collect(java.util.stream.Collectors.joining(", ")));
                    } catch (Exception ex) {
                        log.debug("Could not retrieve cached symbols list: {}", ex.getMessage());
                    }
                }
            }
            
        } catch (Exception ex) {
            log.error("Error retrieving from Redis cache, falling back to database: {}", ex.getMessage(), ex);
        }
        
        // Fallback to database - Optimized for TimescaleDB
        log.warn("⚠️ Cache miss - querying database for symbol: {} (this will be slower)", tradingsymbol);
        
        // First, get instrument_token to avoid complex regex joins
        Map<String, Object> instrument = getInstrumentByName(tradingsymbol);
        if (instrument == null) {
            log.warn("Instrument not found for: {}", tradingsymbol);
            return List.of();
        }
        
        String instrumentToken = (String) instrument.get("instrument_token");
        String exchange = (String) instrument.get("exchange");
        String instrumentName = (String) instrument.get("name");
        String instrumentTradingsymbol = (String) instrument.get("tradingsymbol");
        
        if (instrumentToken == null) {
            log.warn("Instrument token not found for: {}", tradingsymbol);
            return List.of();
        }
        
        // Optimized query: filter by time first (enables TimescaleDB chunk exclusion), then by instrument_token
        // Use direct instrument_token lookup instead of complex joins with regex
        String sql = """
                SELECT o.date, o.open, o.high, o.low, o.close, 
                       COALESCE(
                           NULLIF(nidx.volume, 0),  -- Use nse_idx_ohlcv_historic volume if not 0
                           NULLIF(o.volume, 0),      -- Fallback to kite_ohlcv_historic volume if not 0
                           0                         -- Default to 0 if both are 0 or NULL
                       ) as volume,
                       ? as name,
                       ? as tradingsymbol
                FROM kite_ohlcv_historic o
                LEFT JOIN nse_idx_ohlcv_historic nidx ON 
                    nidx.index_name = ?
                    AND nidx.date = DATE(o.date)
                WHERE o.instrument_token = ?
                  AND o.exchange = ?
                  AND o.candle_interval = 'day'
                  AND o.date >= ?
                  AND o.date <= ?
                ORDER BY o.date ASC
                """;
        return jdbcTemplate.queryForList(
                sql,
                instrumentName != null ? instrumentName : tradingsymbol,
                instrumentTradingsymbol != null ? instrumentTradingsymbol : tradingsymbol,
                instrumentName != null ? instrumentName : instrumentTradingsymbol, // For nidx join
                instrumentToken,
                exchange != null ? exchange : "NSE",
                startDate,
                endDate
        );
    }

    /**
     * Get latest tick data for stocks in an index from kite_instrument_ticks
     */
    public List<Map<String, Object>> getStockTicksByIndex(String indexTradingsymbol) {
        log.debug("Getting stock ticks for index: {}", indexTradingsymbol);
        // Get the latest tick for each stock (assuming stocks are identified by tradingsymbol)
        // This is a simplified query - in reality, you'd need to join with index constituents
        // Filter by instrument_type = 'EQ' AND segment != 'INDICES' to get only equity stocks
        String sql = """
                SELECT DISTINCT ON (t.tradingsymbol)
                       t.tradingsymbol, t.last_price, t.open, t.high, t.low, t.close,
                       t.volume, t.change_pct, t.timestamp,
                       m.name, m.instrument_token
                FROM kite_instrument_ticks t
                JOIN kite_instrument_master m ON t.instrument_token::text = m.instrument_token 
                    AND t.exchange = m.exchange
                WHERE t.exchange = 'NSE'
                  AND m.instrument_type = 'EQ'
                  AND m.segment != 'INDICES'
                ORDER BY t.tradingsymbol, t.timestamp DESC
                LIMIT 100
                """;
        return jdbcTemplate.queryForList(sql);
    }

    /**
     * Fetch stocks by filters on kite_instrument_master.
     */
    public List<Map<String, Object>> getStocksByFilters(String exchange, String segment, String instrumentType) {
        log.debug("Getting stocks by exchange={}, segment={}, instrumentType={}", exchange, segment, instrumentType);

        String sql = """
                SELECT instrument_token, tradingsymbol, name, segment, exchange, instrument_type,
                       last_price, lot_size, tick_size
                FROM kite_instrument_master
                WHERE ( ? IS NULL OR UPPER(exchange) = UPPER(?)
                        OR (? = 'NSE' AND UPPER(exchange) IN ('NSE', 'NSE_EQ'))
                        OR (? = 'NSE_EQ' AND UPPER(exchange) IN ('NSE', 'NSE_EQ')) )
                  AND ( ? IS NULL OR UPPER(segment) = UPPER(?) )
                  AND ( ? IS NULL OR UPPER(instrument_type) = UPPER(?) )
                ORDER BY tradingsymbol
                """;

        return jdbcTemplate.queryForList(
                sql,
                exchange, exchange,
                exchange, exchange,
                segment, segment,
                instrumentType, instrumentType
        );
    }

    /**
     * Get latest tick data for a specific instrument
     */
    public Map<String, Object> getLatestTick(String tradingsymbol) {
        log.debug("Getting latest tick for tradingsymbol: {}", tradingsymbol);
        String sql = """
                SELECT t.tradingsymbol, t.last_price, t.open, t.high, t.low, t.close,
                       t.volume, t.change_pct, t.timestamp, t.average_price,
                       m.name, m.instrument_token
                FROM kite_instrument_ticks t
                JOIN kite_instrument_master m ON t.instrument_token::text = m.instrument_token 
                    AND t.exchange = m.exchange
                WHERE m.tradingsymbol = ?
                  AND t.exchange = 'NSE'
                ORDER BY t.timestamp DESC
                LIMIT 1
                """;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, tradingsymbol);
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Get distinct exchange values from kite_instrument_master.
     * Excludes NULL and empty strings, returns results sorted alphabetically.
     */
    public List<String> getDistinctExchanges() {
        log.debug("Getting distinct exchanges from kite_instrument_master");
        String sql = """
                SELECT DISTINCT exchange 
                FROM kite_instrument_master 
                WHERE exchange IS NOT NULL AND exchange != ''
                ORDER BY exchange
                """;
        return jdbcTemplate.queryForList(sql, String.class);
    }

    /**
     * Get distinct index tradingsymbols where segment = 'INDICES'.
     * Excludes NULL and empty strings, returns results sorted alphabetically.
     */
    public List<String> getDistinctIndices() {
        log.debug("Getting distinct indices from kite_instrument_master");
        String sql = """
                SELECT DISTINCT tradingsymbol 
                FROM kite_instrument_master 
                WHERE segment = 'INDICES' 
                  AND tradingsymbol IS NOT NULL 
                  AND tradingsymbol != ''
                ORDER BY tradingsymbol
                """;
        return jdbcTemplate.queryForList(sql, String.class);
    }

    /**
     * Get distinct segment values from kite_instrument_master.
     * Excludes NULL and empty strings, returns results sorted alphabetically.
     */
    public List<String> getDistinctSegments() {
        log.debug("Getting distinct segments from kite_instrument_master");
        String sql = """
                SELECT DISTINCT segment 
                FROM kite_instrument_master 
                WHERE segment IS NOT NULL AND segment != ''
                ORDER BY segment
                """;
        return jdbcTemplate.queryForList(sql, String.class);
    }
}



