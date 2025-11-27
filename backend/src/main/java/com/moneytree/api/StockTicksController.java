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

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stock-ticks")
@Tag(name = "Stock Ticks", description = "Stock tick data operations using Kite tables")
public class StockTicksController {

    private static final Logger log = LoggerFactory.getLogger(StockTicksController.class);

    private final KiteMarketDataRepository repository;

    public StockTicksController(KiteMarketDataRepository repository) {
        this.repository = repository;
    }

    /**
     * Map index names to tradingsymbols
     */
    private String mapIndexNameToTradingsymbol(String indexName) {
        // Normalize the index name
        String normalized = indexName.toUpperCase().trim().replace("-", " ");
        
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

    @GetMapping("/by-index/{indexName}")
    @Operation(summary = "Get stock ticks by index", description = "Retrieve latest stock tick data for stocks in an index from kite_instrument_ticks")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stock ticks"),
        @ApiResponse(responseCode = "404", description = "Index not found")
    })
    public ResponseEntity<?> getStockTicksByIndex(
            @Parameter(description = "Index name (URL-friendly format)", required = true, example = "NIFTY-50")
            @PathVariable String indexName) {
        try {
            // Convert URL-friendly format back to normal format
            String normalizedName = indexName.replace("-", " ").toUpperCase();
            String tradingsymbol = mapIndexNameToTradingsymbol(normalizedName);
            
            List<Map<String, Object>> stockTicks = repository.getStockTicksByIndex(tradingsymbol);
            
            if (stockTicks.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Stock ticks not found for index: " + indexName));
            }
            
            // Map to StockDataDto format expected by frontend
            List<Map<String, Object>> response = stockTicks.stream()
                .map(tick -> {
                    Map<String, Object> stockData = new HashMap<>();
                    stockData.put("symbol", tick.get("tradingsymbol"));
                    stockData.put("companyName", tick.get("name"));
                    stockData.put("lastPrice", tick.get("last_price"));
                    stockData.put("openPrice", tick.get("open"));
                    stockData.put("dayHigh", tick.get("high"));
                    stockData.put("dayLow", tick.get("low"));
                    stockData.put("previousClose", tick.get("close"));
                    stockData.put("totalTradedVolume", tick.get("volume"));
                    stockData.put("percentChange", tick.get("change_pct"));
                    stockData.put("lastUpdateTime", tick.get("timestamp") != null 
                        ? tick.get("timestamp").toString() 
                        : Instant.now().toString());
                    return stockData;
                })
                .toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error getting stock ticks for index: {}", indexName, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal error fetching stock ticks"));
        }
    }
}

