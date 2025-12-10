package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Component responsible for loading instrument metadata from the database
 * and caching it in Redis for fast access. Maintains in-memory maps for
 * quick lookups during tick processing.
 * 
 * Instruments are loaded on startup and cached in Redis with 1-day TTL.
 * The cache can be manually refreshed via the admin endpoint.
 */
@Component
@Slf4j
public class InstrumentLoader {
    
    private static final String INDICES_CACHE_KEY = "instruments:nse:indices";
    private static final String STOCKS_CACHE_KEY = "instruments:nse:stocks";
    private static final Duration CACHE_TTL = Duration.ofDays(1);
    
    private final JdbcTemplate jdbcTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    // In-memory maps for fast lookups during tick processing
    private final Map<Long, InstrumentInfo> indicesMap = new ConcurrentHashMap<>();
    private final Map<Long, InstrumentInfo> stocksMap = new ConcurrentHashMap<>();
    
    public InstrumentLoader(
            JdbcTemplate jdbcTemplate,
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Loads all instruments (indices and stocks) from cache or database.
     * This method is called on application startup.
     * 
     * @return List of all loaded instruments
     */
    public List<InstrumentInfo> loadAllInstruments() {
        loadIndices();
        loadStocks();
        
        List<InstrumentInfo> all = new ArrayList<>();
        all.addAll(indicesMap.values());
        all.addAll(stocksMap.values());
        return all;
    }
    
    /**
     * Loads NSE indices from Redis cache or database.
     * Populates the indicesMap for fast lookups.
     */
    private void loadIndices() {
        // Try to load from Redis cache first
        List<InstrumentInfo> indices = loadFromCache(INDICES_CACHE_KEY);
        
        if (indices == null || indices.isEmpty()) {
            log.info("Indices not found in cache, loading from database");
            indices = loadIndicesFromDatabase();
            cacheInstruments(INDICES_CACHE_KEY, indices);
        } else {
            log.info("Loaded {} NSE indices from cache", indices.size());
        }
        
        // Populate in-memory map
        indices.forEach(info -> indicesMap.put(info.getInstrumentToken(), info));
    }
    
    /**
     * Loads NSE indices from the database.
     * Query: SELECT instrument_token, exchange_token, tradingsymbol
     *        FROM kite_instrument_master
     *        WHERE exchange = 'NSE' AND segment = 'INDICES'
     * 
     * @return List of index instruments
     */
    private List<InstrumentInfo> loadIndicesFromDatabase() {
        String sql = """
            SELECT instrument_token, exchange_token, tradingsymbol
            FROM kite_instrument_master
            WHERE exchange = 'NSE' AND segment = 'INDICES'
            """;
        
        List<InstrumentInfo> indices = jdbcTemplate.query(sql, (rs, rowNum) ->
            InstrumentInfo.builder()
                .instrumentToken(rs.getLong("instrument_token"))
                .exchangeToken(rs.getLong("exchange_token"))
                .tradingSymbol(rs.getString("tradingsymbol"))
                .type(InstrumentType.INDEX)
                .build()
        );
        
        log.info("Loaded {} NSE indices from database", indices.size());
        return indices;
    }
    
    /**
     * Loads NSE equity stocks from Redis cache or database.
     * Populates the stocksMap for fast lookups.
     */
    private void loadStocks() {
        // Try to load from Redis cache first
        List<InstrumentInfo> stocks = loadFromCache(STOCKS_CACHE_KEY);
        
        if (stocks == null || stocks.isEmpty()) {
            log.info("Stocks not found in cache, loading from database");
            stocks = loadStocksFromDatabase();
            cacheInstruments(STOCKS_CACHE_KEY, stocks);
        } else {
            log.info("Loaded {} NSE equity stocks from cache", stocks.size());
        }
        
        // Populate in-memory map
        stocks.forEach(info -> stocksMap.put(info.getInstrumentToken(), info));
    }
    
    /**
     * Loads NSE equity stocks from the database, excluding LOAN instruments.
     * Query: SELECT instrument_token, exchange_token, tradingsymbol
     *        FROM kite_instrument_master
     *        WHERE exchange = 'NSE' 
     *          AND segment = 'NSE'
     *          AND instrument_type = 'EQ'
     *          AND expiry IS NULL
     *          AND lot_size = 1
     *          AND name IS NOT NULL
     *          AND name NOT LIKE '%LOAN%'
     *        ORDER BY tradingsymbol
     * 
     * @return List of stock instruments
     */
    private List<InstrumentInfo> loadStocksFromDatabase() {
        String sql = """
            SELECT instrument_token, exchange_token, tradingsymbol
            FROM kite_instrument_master
            WHERE exchange = 'NSE' 
              AND segment = 'NSE'
              AND instrument_type = 'EQ'
              AND expiry IS NULL
              AND lot_size = 1
              AND name IS NOT NULL
              AND name NOT LIKE '%LOAN%'
            ORDER BY tradingsymbol
            """;
        
        List<InstrumentInfo> stocks = jdbcTemplate.query(sql, (rs, rowNum) ->
            InstrumentInfo.builder()
                .instrumentToken(rs.getLong("instrument_token"))
                .exchangeToken(rs.getLong("exchange_token"))
                .tradingSymbol(rs.getString("tradingsymbol"))
                .type(InstrumentType.STOCK)
                .build()
        );
        
        log.info("Loaded {} NSE equity stocks from database", stocks.size());
        return stocks;
    }
    
    /**
     * Loads instruments from Redis cache.
     * 
     * @param cacheKey Redis key for the instrument list
     * @return List of instruments, or null if cache miss or error
     */
    private List<InstrumentInfo> loadFromCache(String cacheKey) {
        try {
            List<String> cachedJson = redisTemplate.opsForList().range(cacheKey, 0, -1);
            if (cachedJson == null || cachedJson.isEmpty()) {
                return null;
            }
            
            return cachedJson.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, InstrumentInfo.class);
                    } catch (JsonProcessingException e) {
                        log.warn("Failed to deserialize instrument from cache", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.warn("Failed to load instruments from cache: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Caches instruments to Redis with TTL.
     * 
     * @param cacheKey Redis key for the instrument list
     * @param instruments List of instruments to cache
     */
    private void cacheInstruments(String cacheKey, List<InstrumentInfo> instruments) {
        try {
            // Delete existing cache
            redisTemplate.delete(cacheKey);
            
            // Cache each instrument as JSON
            List<String> jsonList = instruments.stream()
                .map(info -> {
                    try {
                        return objectMapper.writeValueAsString(info);
                    } catch (JsonProcessingException e) {
                        log.warn("Failed to serialize instrument", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            
            if (!jsonList.isEmpty()) {
                redisTemplate.opsForList().rightPushAll(cacheKey, jsonList);
                redisTemplate.expire(cacheKey, CACHE_TTL);
                log.info("Cached {} instruments to Redis with {} TTL", 
                    jsonList.size(), CACHE_TTL);
            }
            
        } catch (Exception e) {
            log.error("Failed to cache instruments to Redis", e);
            // Don't throw - caching failure shouldn't prevent startup
        }
    }
    
    /**
     * Manually refresh instrument cache from database.
     * Can be called via admin endpoint or scheduled job.
     * Clears existing in-memory maps and reloads from database.
     */
    public void refreshCache() {
        log.info("Manually refreshing instrument cache");
        
        // Reload indices
        List<InstrumentInfo> indices = loadIndicesFromDatabase();
        cacheInstruments(INDICES_CACHE_KEY, indices);
        indicesMap.clear();
        indices.forEach(info -> indicesMap.put(info.getInstrumentToken(), info));
        
        // Reload stocks
        List<InstrumentInfo> stocks = loadStocksFromDatabase();
        cacheInstruments(STOCKS_CACHE_KEY, stocks);
        stocksMap.clear();
        stocks.forEach(info -> stocksMap.put(info.getInstrumentToken(), info));
        
        log.info("Instrument cache refreshed successfully");
    }
    
    /**
     * Checks if the given instrument token is an index.
     * 
     * @param instrumentToken Instrument token to check
     * @return true if the token represents an index, false otherwise
     */
    public boolean isIndexToken(long instrumentToken) {
        return indicesMap.containsKey(instrumentToken);
    }
    
    /**
     * Checks if the given instrument token is a stock.
     * 
     * @param instrumentToken Instrument token to check
     * @return true if the token represents a stock, false otherwise
     */
    public boolean isStockToken(long instrumentToken) {
        return stocksMap.containsKey(instrumentToken);
    }
    
    /**
     * Retrieves instrument information for the given token.
     * Searches both indices and stocks maps.
     * 
     * @param instrumentToken Instrument token to look up
     * @return InstrumentInfo if found, null otherwise
     */
    public InstrumentInfo getInstrumentInfo(long instrumentToken) {
        InstrumentInfo info = indicesMap.get(instrumentToken);
        if (info == null) {
            info = stocksMap.get(instrumentToken);
        }
        return info;
    }
}
