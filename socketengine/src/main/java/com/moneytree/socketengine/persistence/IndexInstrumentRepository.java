package com.moneytree.socketengine.persistence;

import com.moneytree.socketengine.domain.IndexInstrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for querying instruments by index membership.
 * Uses native SQL queries to join kite_instrument_master with nse_eq_sector_index.
 */
@Repository
public interface IndexInstrumentRepository extends JpaRepository<TickEntity, TickEntityId> {
    
    /**
     * Retrieves all instruments that belong to a specific index.
     * 
     * This query joins the kite_instrument_master table with nse_eq_sector_index
     * to find all equity instruments that are part of the specified index.
     * 
     * Filters applied:
     * - Exchange: NSE
     * - Segment: NSE  
     * - Instrument Type: EQ (equity)
     * - Expiry: null (no expiry date)
     * - Lot Size: 1 (standard equity lot size)
     * - Name: not null and not containing 'LOAN'
     * - Index: matches the specified index name
     * 
     * @param indexName the name of the index (e.g., "NIFTY 50", "NIFTY BANK")
     * @return list of IndexInstrument objects containing instrument details
     */
    @Query(value = """
        SELECT DISTINCT 
            kim.exchange,
            kim.segment,
            kim.instrument_type as instrumentType,
            nesi.pd_sector_index as indexName,
            kim.tradingsymbol as tradingSymbol,
            kim.instrument_token as instrumentToken
        FROM kite_instrument_master kim 
        INNER JOIN nse_eq_sector_index nesi ON kim.tradingsymbol = nesi.symbol
        WHERE kim.exchange = 'NSE' 
            AND kim.segment = 'NSE' 
            AND kim.instrument_type = 'EQ' 
            AND kim.expiry IS NULL 
            AND kim.lot_size = 1 
            AND kim.name IS NOT NULL 
            AND kim.name NOT LIKE '%LOAN%'
            AND nesi.pd_sector_index = :indexName
        ORDER BY kim.tradingsymbol
        """, nativeQuery = true)
    List<Object[]> findInstrumentsByIndexNative(@Param("indexName") String indexName);
    
    /**
     * Retrieves all available index names from the nse_eq_sector_index table.
     * This can be used to validate index names and provide a list of available indices.
     * 
     * @return list of distinct index names
     */
    @Query(value = """
        SELECT DISTINCT nesi.pd_sector_index
        FROM nse_eq_sector_index nesi
        ORDER BY nesi.pd_sector_index
        """, nativeQuery = true)
    List<String> findAllIndexNames();
    
    /**
     * Converts the raw Object[] result from the native query to IndexInstrument objects.
     * This is a default method to handle the conversion since JPA doesn't directly
     * support mapping native query results to non-entity classes.
     * 
     * @param indexName the name of the index to query
     * @return list of IndexInstrument objects
     */
    default List<IndexInstrument> findInstrumentsByIndex(String indexName) {
        List<Object[]> results = findInstrumentsByIndexNative(indexName);
        return results.stream()
            .map(row -> new IndexInstrument(
                (String) row[0],  // exchange
                (String) row[1],  // segment
                (String) row[2],  // instrumentType
                (String) row[3],  // indexName
                (String) row[4],  // tradingSymbol
                convertToLong(row[5])  // instrumentToken - handle both String and Number
            ))
            .toList();
    }
    
    /**
     * Safely converts an Object to Long, handling both String and Number types.
     * 
     * @param value the value to convert
     * @return the Long value
     */
    private static Long convertToLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return 0L;
            }
        }
        return 0L;
    }
}