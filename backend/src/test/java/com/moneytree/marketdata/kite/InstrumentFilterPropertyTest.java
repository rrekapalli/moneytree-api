package com.moneytree.marketdata.kite;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for instrument filter operations.
 * 
 * Feature: dashboard-instrument-filters
 * Tests correctness properties for distinct value queries.
 * 
 * Note: These tests run 100 times to verify properties hold across multiple executions,
 * simulating property-based testing behavior.
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/moneytree",
    "spring.datasource.username=postgres",
    "spring.datasource.password=postgres"
})
class InstrumentFilterPropertyTest {

    @Autowired
    private KiteMarketDataRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Feature: dashboard-instrument-filters, Property 4: Distinct values exclude nulls and empty strings
     * 
     * Property 4: Distinct values exclude nulls and empty strings
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should not contain null values or empty strings.
     * 
     * Validates: Requirements 2.4
     */
    @Test
    void distinctExchangesExcludeNullsAndEmptyStrings() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> exchanges = repository.getDistinctExchanges();
            
            // Verify no null values
            assertThat(exchanges)
                .as("Distinct exchanges should not contain null values (iteration " + i + ")")
                .doesNotContainNull();
            
            // Verify no empty strings
            assertThat(exchanges)
                .as("Distinct exchanges should not contain empty strings (iteration " + i + ")")
                .allMatch(exchange -> exchange != null && !exchange.isEmpty() && !exchange.isBlank(),
                         "All exchanges should be non-empty strings");
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 4: Distinct values exclude nulls and empty strings
     * 
     * Property 4: Distinct values exclude nulls and empty strings
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should not contain null values or empty strings.
     * 
     * Validates: Requirements 2.4
     */
    @Test
    void distinctIndicesExcludeNullsAndEmptyStrings() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> indices = repository.getDistinctIndices();
            
            // Verify no null values
            assertThat(indices)
                .as("Distinct indices should not contain null values (iteration " + i + ")")
                .doesNotContainNull();
            
            // Verify no empty strings
            assertThat(indices)
                .as("Distinct indices should not contain empty strings (iteration " + i + ")")
                .allMatch(index -> index != null && !index.isEmpty() && !index.isBlank(),
                         "All indices should be non-empty strings");
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 4: Distinct values exclude nulls and empty strings
     * 
     * Property 4: Distinct values exclude nulls and empty strings
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should not contain null values or empty strings.
     * 
     * Validates: Requirements 2.4
     */
    @Test
    void distinctSegmentsExcludeNullsAndEmptyStrings() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> segments = repository.getDistinctSegments();
            
            // Verify no null values
            assertThat(segments)
                .as("Distinct segments should not contain null values (iteration " + i + ")")
                .doesNotContainNull();
            
            // Verify no empty strings
            assertThat(segments)
                .as("Distinct segments should not contain empty strings (iteration " + i + ")")
                .allMatch(segment -> segment != null && !segment.isEmpty() && !segment.isBlank(),
                         "All segments should be non-empty strings");
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 5: Distinct values are sorted alphabetically
     * 
     * Property 5: Distinct values are sorted alphabetically
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should be sorted in alphabetical order.
     * 
     * Validates: Requirements 2.5
     */
    @Test
    void distinctExchangesAreSortedAlphabetically() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> exchanges = repository.getDistinctExchanges();
            
            // Verify alphabetical sorting
            assertThat(exchanges)
                .as("Distinct exchanges should be sorted alphabetically (iteration " + i + ")")
                .isSorted();
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 5: Distinct values are sorted alphabetically
     * 
     * Property 5: Distinct values are sorted alphabetically
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should be sorted in alphabetical order.
     * 
     * Validates: Requirements 2.5
     */
    @Test
    void distinctIndicesAreSortedAlphabetically() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> indices = repository.getDistinctIndices();
            
            // Verify alphabetical sorting
            assertThat(indices)
                .as("Distinct indices should be sorted alphabetically (iteration " + i + ")")
                .isSorted();
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 5: Distinct values are sorted alphabetically
     * 
     * Property 5: Distinct values are sorted alphabetically
     * For any distinct value query (exchanges, indices, segments), 
     * the returned list should be sorted in alphabetical order.
     * 
     * Validates: Requirements 2.5
     */
    @Test
    void distinctSegmentsAreSortedAlphabetically() {
        // Run 100 times to verify property holds consistently
        for (int i = 0; i < 100; i++) {
            // Execute the query
            List<String> segments = repository.getDistinctSegments();
            
            // Verify alphabetical sorting
            assertThat(segments)
                .as("Distinct segments should be sorted alphabetically (iteration " + i + ")")
                .isSorted();
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 7: Query includes all provided filters
     * 
     * Property 7: Query includes all provided filters
     * For any combination of filter parameters provided to the filtered instruments endpoint,
     * the database query should include WHERE clauses for all non-null parameters.
     * 
     * Validates: Requirements 4.2
     */
    @Test
    void filteredInstrumentsIncludesAllProvidedFilters() {
        // Get sample values from the database
        List<String> exchanges = repository.getDistinctExchanges();
        List<String> segments = repository.getDistinctSegments();
        
        // Skip test if no data available
        if (exchanges.isEmpty() || segments.isEmpty()) {
            return;
        }
        
        // Test with single filter (exchange only)
        String testExchange = exchanges.get(0);
        List<java.util.Map<String, Object>> resultsExchangeOnly = 
            repository.getFilteredInstruments(testExchange, null, null);
        
        // Verify all results match the exchange filter
        assertThat(resultsExchangeOnly)
            .as("All instruments should match the exchange filter")
            .allMatch(instrument -> {
                String exchange = (String) instrument.get("exchange");
                return exchange != null && exchange.equalsIgnoreCase(testExchange);
            });
        
        // Test with single filter (segment only)
        String testSegment = segments.get(0);
        List<java.util.Map<String, Object>> resultsSegmentOnly = 
            repository.getFilteredInstruments(null, null, testSegment);
        
        // Verify all results match the segment filter
        assertThat(resultsSegmentOnly)
            .as("All instruments should match the segment filter")
            .allMatch(instrument -> {
                String segment = (String) instrument.get("segment");
                return segment != null && segment.equalsIgnoreCase(testSegment);
            });
        
        // Test with multiple filters (exchange and segment)
        List<java.util.Map<String, Object>> resultsMultiple = 
            repository.getFilteredInstruments(testExchange, null, testSegment);
        
        // Verify all results match both filters
        assertThat(resultsMultiple)
            .as("All instruments should match both exchange and segment filters")
            .allMatch(instrument -> {
                String exchange = (String) instrument.get("exchange");
                String segment = (String) instrument.get("segment");
                return exchange != null && exchange.equalsIgnoreCase(testExchange) &&
                       segment != null && segment.equalsIgnoreCase(testSegment);
            });
    }

    /**
     * Feature: dashboard-instrument-filters, Property 3: AND logic for multiple filters
     * 
     * Property 3: AND logic for multiple filters
     * For any combination of exchange, index, and segment filter values,
     * the returned instruments should satisfy all three filter conditions simultaneously (AND logic, not OR).
     * 
     * Validates: Requirements 4.3
     */
    @Test
    void filteredInstrumentsApplyAndLogic() {
        // Get sample values from the database
        List<String> exchanges = repository.getDistinctExchanges();
        List<String> segments = repository.getDistinctSegments();
        
        // Skip test if no data available
        if (exchanges.isEmpty() || segments.isEmpty()) {
            return;
        }
        
        // Run 100 times with different filter combinations
        for (int i = 0; i < 100; i++) {
            // Select random filters
            String testExchange = exchanges.get(i % exchanges.size());
            String testSegment = segments.get(i % segments.size());
            
            // Get filtered results with both filters
            List<java.util.Map<String, Object>> results = 
                repository.getFilteredInstruments(testExchange, null, testSegment);
            
            // Verify AND logic: all results must match BOTH filters
            assertThat(results)
                .as("All instruments should match BOTH exchange AND segment filters (iteration " + i + ")")
                .allMatch(instrument -> {
                    String exchange = (String) instrument.get("exchange");
                    String segment = (String) instrument.get("segment");
                    return exchange != null && exchange.equalsIgnoreCase(testExchange) &&
                           segment != null && segment.equalsIgnoreCase(testSegment);
                });
            
            // Additional verification: results should be a subset of each individual filter
            List<java.util.Map<String, Object>> exchangeResults = 
                repository.getFilteredInstruments(testExchange, null, null);
            List<java.util.Map<String, Object>> segmentResults = 
                repository.getFilteredInstruments(null, null, testSegment);
            
            // The combined result size should be <= each individual filter result size
            assertThat(results.size())
                .as("Combined filter results should be subset of individual filters (iteration " + i + ")")
                .isLessThanOrEqualTo(exchangeResults.size())
                .isLessThanOrEqualTo(segmentResults.size());
        }
    }

    /**
     * Feature: dashboard-instrument-filters, Property 8: Response includes required fields
     * 
     * Property 8: Response includes required fields
     * For any instrument returned by the filtered instruments endpoint,
     * the response should include all required fields: instrument_token, tradingsymbol, name,
     * segment, exchange, instrument_type, last_price, lot_size, tick_size.
     * 
     * Validates: Requirements 4.4
     */
    @Test
    void filteredInstrumentsIncludeRequiredFields() {
        // Get sample values from the database
        List<String> exchanges = repository.getDistinctExchanges();
        
        // Skip test if no data available
        if (exchanges.isEmpty()) {
            return;
        }
        
        // Run 100 times with different filters
        for (int i = 0; i < 100; i++) {
            // Select random exchange
            String testExchange = exchanges.get(i % exchanges.size());
            
            // Get filtered results
            List<java.util.Map<String, Object>> results = 
                repository.getFilteredInstruments(testExchange, null, null);
            
            // Skip if no results
            if (results.isEmpty()) {
                continue;
            }
            
            // Verify all required fields are present in each result
            assertThat(results)
                .as("All instruments should contain required fields (iteration " + i + ")")
                .allMatch(instrument -> 
                    instrument.containsKey("instrument_token") &&
                    instrument.containsKey("tradingsymbol") &&
                    instrument.containsKey("name") &&
                    instrument.containsKey("segment") &&
                    instrument.containsKey("exchange") &&
                    instrument.containsKey("instrument_type") &&
                    instrument.containsKey("last_price") &&
                    instrument.containsKey("lot_size") &&
                    instrument.containsKey("tick_size")
                );
            
            // Verify key fields are not null (instrument_token, tradingsymbol, exchange, segment)
            assertThat(results)
                .as("Key fields should not be null (iteration " + i + ")")
                .allMatch(instrument -> 
                    instrument.get("instrument_token") != null &&
                    instrument.get("tradingsymbol") != null &&
                    instrument.get("exchange") != null &&
                    instrument.get("segment") != null
                );
        }
    }
}
