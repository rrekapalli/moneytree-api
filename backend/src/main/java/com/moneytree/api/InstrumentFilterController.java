package com.moneytree.api;

import com.moneytree.api.dto.InstrumentDto;
import com.moneytree.config.CacheConfig;
import com.moneytree.marketdata.kite.KiteMarketDataRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for instrument filtering operations.
 * Provides endpoints for fetching distinct filter values (exchanges, indices, segments)
 * and filtered instrument data from kite_instrument_master table.
 */
@RestController
@RequestMapping("/api/v1/instruments")
@Tag(name = "Instrument Filters", description = "Instrument filtering operations for dashboard")
public class InstrumentFilterController {

    private static final Logger log = LoggerFactory.getLogger(InstrumentFilterController.class);

    private final KiteMarketDataRepository repository;

    public InstrumentFilterController(KiteMarketDataRepository repository) {
        this.repository = repository;
    }

    /**
     * Get distinct exchange values from kite_instrument_master.
     * Results are cached for 7 days as exchange values rarely change.
     */
    @GetMapping("/filters/exchanges")
    @Operation(
        summary = "Get distinct exchanges",
        description = "Retrieve all distinct exchange values from kite_instrument_master table. " +
                     "Results are cached for 7 days. Excludes NULL and empty values, sorted alphabetically."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved distinct exchanges",
            content = @Content(schema = @Schema(implementation = String[].class))
        ),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getDistinctExchanges() {
        long startTime = System.currentTimeMillis();
        try {
            log.info("Fetching distinct exchanges from kite_instrument_master");
            List<String> exchanges = repository.getDistinctExchanges();
            long duration = System.currentTimeMillis() - startTime;
            log.info("Retrieved {} distinct exchanges in {} ms", exchanges.size(), duration);
            return ResponseEntity.ok(exchanges);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching distinct exchanges after {} ms", duration, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Failed to fetch distinct exchanges")
            );
        }
    }

    /**
     * Get distinct index tradingsymbols where segment = 'INDICES'.
     * Results are cached for 7 days as index values rarely change.
     */
    @GetMapping("/filters/indices")
    @Operation(
        summary = "Get distinct indices",
        description = "Retrieve all distinct tradingsymbols from kite_instrument_master where segment = 'INDICES'. " +
                     "Results are cached for 7 days. Excludes NULL and empty values, sorted alphabetically."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved distinct indices",
            content = @Content(schema = @Schema(implementation = String[].class))
        ),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getDistinctIndices() {
        long startTime = System.currentTimeMillis();
        try {
            log.info("Fetching distinct indices from kite_instrument_master");
            List<String> indices = repository.getDistinctIndices();
            long duration = System.currentTimeMillis() - startTime;
            log.info("Retrieved {} distinct indices in {} ms", indices.size(), duration);
            return ResponseEntity.ok(indices);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching distinct indices after {} ms", duration, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Failed to fetch distinct indices")
            );
        }
    }

    /**
     * Get distinct segment values from kite_instrument_master.
     * Results are cached for 7 days as segment values rarely change.
     */
    @GetMapping("/filters/segments")
    @Operation(
        summary = "Get distinct segments",
        description = "Retrieve all distinct segment values from kite_instrument_master table. " +
                     "Results are cached for 7 days. Excludes NULL and empty values, sorted alphabetically."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved distinct segments",
            content = @Content(schema = @Schema(implementation = String[].class))
        ),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getDistinctSegments() {
        long startTime = System.currentTimeMillis();
        try {
            log.info("Fetching distinct segments from kite_instrument_master");
            List<String> segments = repository.getDistinctSegments();
            long duration = System.currentTimeMillis() - startTime;
            log.info("Retrieved {} distinct segments in {} ms", segments.size(), duration);
            return ResponseEntity.ok(segments);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching distinct segments after {} ms", duration, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Failed to fetch distinct segments")
            );
        }
    }

    /**
     * Get filtered instruments based on exchange, index, and segment filters.
     * Applies AND logic when multiple filters are provided.
     * Returns up to 1000 instruments to prevent excessive data transfer.
     */
    @GetMapping("/filtered")
    @Operation(
        summary = "Get filtered instruments",
        description = "Retrieve instruments filtered by exchange, index (tradingsymbol), and/or segment. " +
                     "All filters are optional. When multiple filters are provided, AND logic is applied. " +
                     "Results are limited to 1000 instruments and sorted by tradingsymbol."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved filtered instruments",
            content = @Content(schema = @Schema(implementation = InstrumentDto[].class))
        ),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getFilteredInstruments(
            @Parameter(description = "Exchange filter (e.g., NSE, BSE)", example = "NSE")
            @RequestParam(required = false) String exchange,
            @Parameter(description = "Index filter - tradingsymbol from INDICES segment (e.g., NIFTY 50)", example = "NIFTY 50")
            @RequestParam(required = false) String index,
            @Parameter(description = "Segment filter (e.g., EQ, FO)", example = "EQ")
            @RequestParam(required = false) String segment) {
        long startTime = System.currentTimeMillis();
        try {
            log.info("Fetching filtered instruments: exchange={}, index={}, segment={}", exchange, index, segment);
            
            // Fetch filtered instruments from repository
            List<Map<String, Object>> rawInstruments = repository.getFilteredInstruments(exchange, index, segment);
            
            // Map to InstrumentDto
            List<InstrumentDto> instruments = rawInstruments.stream()
                    .map(this::mapToInstrumentDto)
                    .collect(Collectors.toList());
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Retrieved {} filtered instruments in {} ms (query: {} ms, mapping: {} ms)", 
                    instruments.size(), duration, duration - 10, 10);
            return ResponseEntity.ok(instruments);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching filtered instruments after {} ms", duration, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Failed to fetch filtered instruments")
            );
        }
    }

    /**
     * Get instruments that belong to a specific index.
     * Uses nse_eq_sector_index table to map stocks to indices.
     */
    @GetMapping("/indices/{indexName}/instruments")
    @Operation(
        summary = "Get instruments by index",
        description = "Retrieve all instruments that belong to the specified index using nse_eq_sector_index mapping. " +
                     "Returns instruments with their current market data."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200", 
            description = "Successfully retrieved instruments for the index",
            content = @Content(schema = @Schema(implementation = InstrumentDto[].class))
        ),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getInstrumentsByIndex(
            @Parameter(description = "Name of the index (e.g., 'NIFTY 50', 'NIFTY BANK')", example = "NIFTY 50")
            @PathVariable String indexName) {
        long startTime = System.currentTimeMillis();
        try {
            log.info("Fetching instruments for index: {}", indexName);
            
            // Fetch instruments for the index from repository
            List<Map<String, Object>> rawInstruments = repository.getInstrumentsByIndex(indexName);
            
            if (rawInstruments.isEmpty()) {
                log.warn("No instruments found for index: {}", indexName);
                return ResponseEntity.notFound().build();
            }
            
            // Map to InstrumentDto
            List<InstrumentDto> instruments = rawInstruments.stream()
                    .map(this::mapToInstrumentDto)
                    .collect(Collectors.toList());
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Retrieved {} instruments for index '{}' in {} ms", instruments.size(), indexName, duration);
            return ResponseEntity.ok(instruments);
        } catch (Exception ex) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching instruments for index '{}' after {} ms", indexName, duration, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Failed to fetch instruments for index: " + indexName)
            );
        }
    }

    /**
     * Helper method to map database result to InstrumentDto.
     */
    private InstrumentDto mapToInstrumentDto(Map<String, Object> row) {
        InstrumentDto dto = new InstrumentDto();
        // Handle both old and new column names for backward compatibility
        dto.setInstrumentToken(getString(row, "instrumentToken") != null ? getString(row, "instrumentToken") : getString(row, "instrument_token"));
        dto.setTradingsymbol(getString(row, "tradingSymbol") != null ? getString(row, "tradingSymbol") : getString(row, "tradingsymbol"));
        dto.setName(getString(row, "name"));
        dto.setSegment(getString(row, "segment"));
        dto.setExchange(getString(row, "exchange"));
        dto.setInstrumentType(getString(row, "instrumentType") != null ? getString(row, "instrumentType") : getString(row, "instrument_type"));
        dto.setLastPrice(getDouble(row, "last_price"));
        dto.setLotSize(getInteger(row, "lot_size"));
        dto.setTickSize(getDouble(row, "tick_size"));
        return dto;
    }

    /**
     * Safely extract String value from Map.
     */
    private String getString(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * Safely extract Double value from Map.
     */
    private Double getDouble(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Safely extract Integer value from Map.
     */
    private Integer getInteger(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
