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
}
