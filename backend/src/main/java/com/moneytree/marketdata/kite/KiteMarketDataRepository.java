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
 * For now this exposes generic methods returning maps; dedicated
 * entity mappings can be introduced in later phases.
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
        // Placeholder query; will be refined once exact kite_* schema is known.
        String sql = """
                SELECT *
                FROM kite_candles
                WHERE instrument_token = ?
                  AND ts >= ?
                  AND ts <= ?
                  AND interval = ?
                ORDER BY ts
                """;
        return jdbcTemplate.queryForList(sql, instrumentToken, from, to, interval);
    }
}


