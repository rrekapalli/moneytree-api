package com.moneytree.socketengine.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository interface for querying tick data from TimescaleDB.
 * Provides custom query methods for efficient time-series data retrieval.
 */
@Repository
public interface TickRepository extends JpaRepository<TickEntity, TickEntityId> {
    
    /**
     * Find all ticks for a specific trading symbol within a time range.
     * Results are ordered by timestamp in ascending order.
     *
     * @param tradingSymbol the trading symbol to query (e.g., "NIFTY 50", "RELIANCE")
     * @param startTime start of the time range (inclusive)
     * @param endTime end of the time range (inclusive)
     * @return list of tick entities matching the criteria
     */
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.tradingSymbol = :tradingSymbol 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByTradingSymbolAndTimestampBetween(
        @Param("tradingSymbol") String tradingSymbol,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    /**
     * Find all ticks for a specific instrument token within a time range.
     * Results are ordered by timestamp in ascending order.
     *
     * @param instrumentToken the Kite instrument token
     * @param startTime start of the time range (inclusive)
     * @param endTime end of the time range (inclusive)
     * @return list of tick entities matching the criteria
     */
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.instrumentToken = :instrumentToken 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByInstrumentTokenAndTimestampBetween(
        @Param("instrumentToken") Long instrumentToken,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    /**
     * Find all ticks for a specific exchange within a time range.
     * Results are ordered by timestamp in ascending order.
     *
     * @param exchange the exchange code (e.g., "NSE", "BSE")
     * @param startTime start of the time range (inclusive)
     * @param endTime end of the time range (inclusive)
     * @return list of tick entities matching the criteria
     */
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.exchange = :exchange 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByExchangeAndTimestampBetween(
        @Param("exchange") String exchange,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    /**
     * Find all ticks within a time range across all instruments.
     * Results are ordered by timestamp in ascending order.
     * Use with caution as this can return large result sets.
     *
     * @param startTime start of the time range (inclusive)
     * @param endTime end of the time range (inclusive)
     * @return list of tick entities matching the criteria
     */
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByTimestampBetween(
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
}
