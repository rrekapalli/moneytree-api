package com.moneytree.marketdata.kite;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Map;

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

    public KiteMarketDataRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> loadHistoricalCandles(String instrumentToken,
                                                           Instant from,
                                                           Instant to,
                                                           String interval) {
        log.debug("Loading historical candles instrumentToken={}, from={}, to={}, interval={}",
                instrumentToken, from, to, interval);
        String sql = """
                SELECT date, open, high, low, close, volume, candle_interval
                FROM kite_ohlcv_historic
                WHERE instrument_token = ?
                  AND exchange IN ('NSE')
                  AND date >= ?
                  AND date <= ?
                  AND candle_interval = ?
                ORDER BY date
                """;
        return jdbcTemplate.queryForList(sql, instrumentToken, from, to, interval);
    }

    private String normalizeSymbol(String symbol) {
        if (symbol == null) {
            return "";
        }
        return symbol.toUpperCase().replaceAll("[^A-Z0-9]", "");
    }

    /**
     * List instruments by exchange and segment filters.
     */
    public List<Map<String, Object>> getInstrumentsByExchangeAndSegment(String exchange, String segment) {
        String normalizedExchange = exchange != null && !exchange.isBlank() ? exchange.trim().toUpperCase() : null;
        String normalizedSegment = segment != null && !segment.isBlank() ? segment.trim().toUpperCase() : null;

        log.debug("Listing instruments by exchange={}, segment={}", normalizedExchange, normalizedSegment);

        String sql = """
                SELECT instrument_token, exchange_token, tradingsymbol, name, last_price,
                       expiry, strike, tick_size, lot_size, instrument_type, segment, exchange
                FROM kite_instrument_master
                WHERE ( ? IS NULL
                        OR UPPER(exchange) = ?
                        OR (? = 'NSE' AND UPPER(exchange) IN ('NSE', 'NSE_INDEX'))
                        OR (? = 'NSE_INDEX' AND UPPER(exchange) IN ('NSE', 'NSE_INDEX')) )
                  AND ( ? IS NULL OR UPPER(segment) = ? )
                ORDER BY tradingsymbol ASC
                """;

        return jdbcTemplate.queryForList(
                sql,
                normalizedExchange, normalizedExchange,
                normalizedExchange, normalizedExchange,
                normalizedSegment, normalizedSegment
        );
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
        // Get the most recent day's data before today
        String normalized = normalizeSymbol(tradingsymbol);
        String sql = """
                SELECT o.date, o.open, o.high, o.low, o.close, o.volume,
                       m.name, m.tradingsymbol, m.last_price
                FROM kite_ohlcv_historic o
                JOIN kite_instrument_master m ON o.instrument_token = m.instrument_token 
                    AND o.exchange = m.exchange
                WHERE (
                        UPPER(TRIM(m.tradingsymbol)) = UPPER(TRIM(?))
                     OR UPPER(TRIM(m.name)) = UPPER(TRIM(?))
                     OR REGEXP_REPLACE(UPPER(m.tradingsymbol), '[^A-Z0-9]', '', 'g') = ?
                     OR REGEXP_REPLACE(UPPER(m.name), '[^A-Z0-9]', '', 'g') = ?
                  )
                  AND o.exchange IN ('NSE', 'NSE_INDEX')
                  AND o.candle_interval = 'day'
                  AND o.date < CURRENT_DATE
                ORDER BY o.date DESC
                LIMIT 1
                """;
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql,
                tradingsymbol, tradingsymbol,
                normalized, normalized
        );
        return results.isEmpty() ? null : results.get(0);
    }

    /**
     * Get historical data for an index from kite_ohlcv_historic
     */
    public List<Map<String, Object>> getHistoricalData(String tradingsymbol, int days) {
        log.debug("Getting historical data for tradingsymbol: {}, days: {}", tradingsymbol, days);
        String normalized = normalizeSymbol(tradingsymbol);
        String sql = """
                SELECT o.date, o.open, o.high, o.low, o.close, o.volume,
                       m.name, m.tradingsymbol
                FROM kite_ohlcv_historic o
                JOIN kite_instrument_master m ON o.instrument_token = m.instrument_token 
                    AND o.exchange = m.exchange
                WHERE (
                        UPPER(TRIM(m.tradingsymbol)) = UPPER(TRIM(?))
                     OR UPPER(TRIM(m.name)) = UPPER(TRIM(?))
                     OR REGEXP_REPLACE(UPPER(m.tradingsymbol), '[^A-Z0-9]', '', 'g') = ?
                     OR REGEXP_REPLACE(UPPER(m.name), '[^A-Z0-9]', '', 'g') = ?
                  )
                  AND o.exchange IN ('NSE', 'NSE_INDEX')
                  AND o.candle_interval = 'day'
                  AND o.date >= CURRENT_DATE - (? || ' days')::interval
                ORDER BY o.date ASC
                """;
        return jdbcTemplate.queryForList(
                sql,
                tradingsymbol, tradingsymbol,
                normalized, normalized,
                String.valueOf(days)
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
}


