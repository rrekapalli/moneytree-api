package com.moneytree.api;

import com.moneytree.api.dto.HistoryRequest;
import com.moneytree.marketdata.kite.KiteMarketDataService;
import com.moneytree.marketdata.kite.model.PriceData;
import com.moneytree.marketdata.kite.model.Quote;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/marketdata/kite")
@Tag(name = "Market Data", description = "Kite-based market data operations (time-series data using JDBC)")
public class MarketDataController {

    private static final Logger log = LoggerFactory.getLogger(MarketDataController.class);

    private final KiteMarketDataService service;

    public MarketDataController(KiteMarketDataService service) {
        this.service = service;
    }

    @PostMapping("/{tradingsymbol}/history")
    @Operation(
        summary = "Get historical price data",
        description = "Retrieve historical candle/price data for a trading symbol from Kite. " +
                     "This endpoint uses JDBC for high-performance time-series queries."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getHistory(
            @Parameter(description = "Trading symbol", required = true, example = "RELIANCE")
            @PathVariable String tradingsymbol,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "History request parameters", required = true)
            @Valid @RequestBody HistoryRequest request) {
        try {
            // Validate required fields
            if (request.getInterval() == null || request.getInterval().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "interval is required")
                );
            }
            if (request.getFrom() == null || request.getFrom().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "from is required")
                );
            }
            if (request.getTo() == null || request.getTo().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "to is required")
                );
            }
            
            Instant fromTs = Instant.parse(request.getFrom());
            Instant toTs = Instant.parse(request.getTo());
            if (fromTs.isAfter(toTs)) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "from must be <= to")
                );
            }
            
            // Use instrumenttoken from payload if provided, otherwise use tradingsymbol from path
            String instrumentToken = (request.getInstrumenttoken() != null && !request.getInstrumenttoken().isEmpty()) 
                    ? request.getInstrumenttoken() 
                    : tradingsymbol;
            
            log.info("getHistory tradingsymbol={}, instrumenttoken={}, exchange={}, interval={}, from={}, to={}",
                    tradingsymbol, instrumentToken, request.getExchange(), request.getInterval(), fromTs, toTs);
            
            List<PriceData> candles = service.getHistory(instrumentToken, request.getInterval(), fromTs, toTs);
            return ResponseEntity.ok(candles);
        } catch (DateTimeParseException ex) {
            log.warn("Invalid date range for history: from={}, to={}", request.getFrom(), request.getTo());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    java.util.Map.of("error", "Invalid from/to timestamp format")
            );
        } catch (Exception ex) {
            log.error("Error in getHistory", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    java.util.Map.of("error", "Internal error fetching history")
            );
        }
    }

    @GetMapping("/quotes")
    @Operation(
        summary = "Get current quotes",
        description = "Retrieve current/live quotes for one or more trading symbols. " +
                     "Symbols should be comma-separated."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved quotes"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getQuotes(
            @Parameter(description = "Comma-separated list of trading symbols", required = true, example = "RELIANCE,TCS,INFY")
            @RequestParam("symbols") String symbolsCsv) {
        try {
            List<String> symbols = Arrays.stream(symbolsCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            if (symbols.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "At least one symbol must be provided")
                );
            }
            List<Quote> quotes = service.getQuotes(symbols);
            return ResponseEntity.ok(quotes);
        } catch (Exception ex) {
            log.error("Error in getQuotes", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    java.util.Map.of("error", "Internal error fetching quotes")
            );
        }
    }
}


