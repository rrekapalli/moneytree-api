package com.moneytree.api;

import com.moneytree.marketdata.kite.KiteMarketDataService;
import com.moneytree.marketdata.kite.model.PriceData;
import com.moneytree.marketdata.kite.model.Quote;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/marketdata/kite")
public class MarketDataController {

    private static final Logger log = LoggerFactory.getLogger(MarketDataController.class);

    private final KiteMarketDataService service;

    public MarketDataController(KiteMarketDataService service) {
        this.service = service;
    }

    @GetMapping("/{instrumentToken}/history")
    public ResponseEntity<?> getHistory(@PathVariable String instrumentToken,
                                        @RequestParam String interval,
                                        @RequestParam String from,
                                        @RequestParam String to) {
        try {
            Instant fromTs = Instant.parse(from);
            Instant toTs = Instant.parse(to);
            if (fromTs.isAfter(toTs)) {
                return ResponseEntity.badRequest().body(
                        java.util.Map.of("error", "from must be <= to")
                );
            }
            List<PriceData> candles = service.getHistory(instrumentToken, interval, fromTs, toTs);
            return ResponseEntity.ok(candles);
        } catch (DateTimeParseException ex) {
            log.warn("Invalid date range for history: from={}, to={}", from, to);
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
    public ResponseEntity<?> getQuotes(@RequestParam("symbols") String symbolsCsv) {
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


