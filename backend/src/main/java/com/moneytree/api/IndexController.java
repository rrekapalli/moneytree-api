package com.moneytree.api;

import com.moneytree.marketdata.kite.KiteMarketDataRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Index", description = "Index data operations using Kite tables")
public class IndexController {

    private static final Logger log = LoggerFactory.getLogger(IndexController.class);

    private final KiteMarketDataRepository repository;

    public IndexController(KiteMarketDataRepository repository) {
        this.repository = repository;
    }

    /**
     * Map index names to tradingsymbols
     */
    private String mapIndexNameToTradingsymbol(String indexName) {
        // Normalize the index name
        String normalized = indexName.toUpperCase().trim();
        
        // Common mappings
        Map<String, String> mappings = Map.of(
            "NIFTY 50", "NIFTY 50",
            "NIFTY50", "NIFTY 50",
            "NIFTY-50", "NIFTY 50",
            "NIFTY BANK", "NIFTY BANK",
            "NIFTYBANK", "NIFTY BANK",
            "NIFTY-BANK", "NIFTY BANK",
            "NIFTY IT", "NIFTY IT",
            "NIFTYIT", "NIFTY IT",
            "NIFTY-IT", "NIFTY IT"
        );
        
        return mappings.getOrDefault(normalized, normalized);
    }

    @GetMapping("/index/name/{name}")
    @Operation(summary = "Get index by name", description = "Retrieve index information by name from kite_instrument_master")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved index"),
        @ApiResponse(responseCode = "404", description = "Index not found")
    })
    public ResponseEntity<?> getIndexByName(
            @Parameter(description = "Index name", required = true, example = "NIFTY 50")
            @PathVariable String name) {
        try {
            String tradingsymbol = mapIndexNameToTradingsymbol(name);
            Map<String, Object> instrument = repository.getInstrumentByName(tradingsymbol);
            
            if (instrument == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Index not found: " + name));
            }
            
            // Map to IndexResponseDto format
            Map<String, Object> response = new HashMap<>();
            response.put("id", instrument.get("instrument_token"));
            response.put("indexName", instrument.get("name"));
            response.put("indexSymbol", instrument.get("tradingsymbol"));
            response.put("lastPrice", instrument.get("last_price"));
            response.put("keyCategory", "Index");
            response.put("createdAt", java.time.Instant.now().toString());
            response.put("updatedAt", java.time.Instant.now().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting index by name: {}", name, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal error fetching index"));
        }
    }

    @GetMapping("/indices/{indexName}/previous-day")
    @Operation(summary = "Get previous day index data", description = "Retrieve previous day's data for an index from kite_ohlcv_historic")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved previous day data"),
        @ApiResponse(responseCode = "404", description = "Index not found")
    })
    public ResponseEntity<?> getPreviousDayIndexData(
            @Parameter(description = "Index name (URL-friendly format)", required = true, example = "nifty-50")
            @PathVariable String indexName) {
        try {
            // Convert URL-friendly format back to normal format
            String normalizedName = indexName.replace("-", " ").toUpperCase();
            String tradingsymbol = mapIndexNameToTradingsymbol(normalizedName);
            
            Map<String, Object> previousDayData = repository.getPreviousDayData(tradingsymbol);
            
            if (previousDayData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Previous day data not found for: " + indexName));
            }
            
            // Map to IndicesDto format expected by frontend
            Map<String, Object> indexData = new HashMap<>();
            indexData.put("indexName", previousDayData.get("name"));
            indexData.put("indexSymbol", previousDayData.get("tradingsymbol"));
            indexData.put("lastPrice", previousDayData.get("close"));
            indexData.put("openPrice", previousDayData.get("open"));
            indexData.put("dayHigh", previousDayData.get("high"));
            indexData.put("dayLow", previousDayData.get("low"));
            indexData.put("previousClose", previousDayData.get("close"));
            indexData.put("variation", 0.0); // Calculate if needed
            indexData.put("percentChange", 0.0); // Calculate if needed
            
            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", java.time.Instant.now().toString());
            response.put("indices", List.of(indexData));
            response.put("source", "Kite Market Data");
            response.put("marketStatus", Map.of("status", "CLOSED"));
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting previous day data for index: {}", indexName, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal error fetching previous day data"));
        }
    }

    @GetMapping("/index/{indexName}/historical-data")
    @Operation(summary = "Get index historical data", description = "Retrieve historical OHLCV data for an index from kite_ohlcv_historic")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data"),
        @ApiResponse(responseCode = "404", description = "Index not found")
    })
    public ResponseEntity<?> getIndexHistoricalData(
            @Parameter(description = "Index name", required = true, example = "NIFTY 50")
            @PathVariable String indexName,
            @Parameter(description = "Number of days to retrieve", example = "365")
            @RequestParam(defaultValue = "365") int days) {
        try {
            String tradingsymbol = mapIndexNameToTradingsymbol(indexName);
            List<Map<String, Object>> historicalData = repository.getHistoricalData(tradingsymbol, days);
            
            if (historicalData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Historical data not found for: " + indexName));
            }
            
            // Map to IndexHistoricalData format expected by frontend
            List<Map<String, Object>> response = historicalData.stream()
                .map(data -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("indexName", data.get("name"));
                    item.put("date", data.get("date").toString());
                    item.put("open", data.get("open"));
                    item.put("high", data.get("high"));
                    item.put("low", data.get("low"));
                    item.put("close", data.get("close"));
                    item.put("volume", data.get("volume"));
                    return item;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting historical data for index: {}", indexName, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal error fetching historical data"));
        }
    }
}

