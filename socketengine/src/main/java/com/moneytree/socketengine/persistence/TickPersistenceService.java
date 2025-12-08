package com.moneytree.socketengine.persistence;

import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

/**
 * Scheduled service that batch-persists ticks to TimescaleDB every 15 minutes.
 * This is part of the cold path - asynchronous processing that doesn't block
 * the hot path (WebSocket broadcasting).
 * 
 * Ticks are accumulated in TickBatchBuffer and periodically flushed to the database
 * using JDBC batch operations for efficient bulk inserts.
 * 
 * Key features:
 * - Scheduled batch persistence every 15 minutes
 * - End-of-day flush at 4 PM IST on weekdays
 * - Automatic retry on failure (failed batches are re-added to buffer)
 * - Alert when buffer size exceeds 100,000 ticks
 * - Uses JDBC batch operations with batch size of 1000 for optimal performance
 */
@Service
@Slf4j
public class TickPersistenceService {
    
    private final TickBatchBuffer buffer;
    private final JdbcTemplate jdbcTemplate;
    
    public TickPersistenceService(TickBatchBuffer buffer, JdbcTemplate jdbcTemplate) {
        this.buffer = buffer;
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Scheduled batch persistence job that runs every 15 minutes.
     * Drains the buffer and persists all accumulated ticks to TimescaleDB.
     * 
     * On failure, the batch is re-added to the buffer for retry on the next execution.
     * Alerts are logged if the buffer size exceeds 100,000 ticks.
     */
    @Scheduled(cron = "0 */15 * * * *")  // Every 15 minutes
    public void persistBatch() {
        long startTime = System.currentTimeMillis();
        
        // Drain all buffered ticks
        List<TickEntity> batch = buffer.drainBuffer();
        
        if (batch.isEmpty()) {
            log.debug("No ticks to persist");
            return;
        }
        
        try {
            // Batch insert to TimescaleDB
            int rowsInserted = batchInsert(batch);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Persisted {} ticks to TimescaleDB in {}ms", rowsInserted, duration);
            
        } catch (Exception e) {
            log.error("Failed to persist batch of {} ticks - will retry on next execution", batch.size(), e);
            
            // Re-add failed batch to buffer for retry on next scheduled execution
            // We need to add a method to TickBatchBuffer to support this
            buffer.reAddBatch(batch);
            
            // Alert if buffer size is growing too large
            long bufferSize = buffer.getBufferSize();
            if (bufferSize > 100000) {
                log.error("ALERT: Tick buffer size exceeded 100,000 ({} ticks) - database may be down or slow", 
                    bufferSize);
            }
        }
    }
    
    /**
     * End-of-day flush job that runs at 4 PM IST on weekdays (Monday-Friday).
     * Ensures all remaining buffered ticks are persisted before market close.
     */
    @Scheduled(cron = "0 0 16 * * MON-FRI")  // 4 PM IST on weekdays
    public void endOfDayFlush() {
        log.info("Executing end-of-day flush");
        persistBatch();
    }
    
    /**
     * Performs batch insert of tick entities to TimescaleDB using JDBC batch operations.
     * Uses a batch size of 1000 for optimal performance.
     * 
     * @param entities List of tick entities to insert
     * @return Number of rows inserted
     */
    private int batchInsert(List<TickEntity> entities) {
        String sql = """
            INSERT INTO kite_ticks_data 
            (instrument_token, tradingsymbol, exchange, tick_timestamp, raw_tick_data)
            VALUES (?, ?, ?, ?, ?)
            """;
        
        // Use JDBC batch update with batch size of 1000
        // Returns int[][] where each int[] represents a batch
        int[][] updateCounts = jdbcTemplate.batchUpdate(sql, entities, 1000, (ps, entity) -> {
            ps.setLong(1, entity.getInstrumentToken());
            ps.setString(2, entity.getTradingSymbol());
            ps.setString(3, entity.getExchange());
            ps.setTimestamp(4, Timestamp.from(entity.getTickTimestamp()));
            ps.setBytes(5, entity.getRawTickData());
        });
        
        // Count total rows inserted across all batches
        int totalRows = 0;
        for (int[] batchCounts : updateCounts) {
            totalRows += batchCounts.length;
        }
        
        return totalRows;
    }
}
