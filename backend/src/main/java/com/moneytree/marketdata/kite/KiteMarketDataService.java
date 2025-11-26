package com.moneytree.marketdata.kite;

import com.moneytree.marketdata.kite.model.PriceData;
import com.moneytree.marketdata.kite.model.Quote;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
public class KiteMarketDataService {

    private static final Logger log = LoggerFactory.getLogger(KiteMarketDataService.class);

    private final KiteMarketDataRepository repository;

    public KiteMarketDataService(KiteMarketDataRepository repository) {
        this.repository = repository;
    }

    /**
     * Load historical candles for a given instrument token.
     *
     * NOTE: For now this uses a placeholder mapping from raw DB rows to PriceData.
     * Once the kite_* schema is finalized, this can be made type-safe.
     */
    public List<PriceData> getHistory(String instrumentToken,
                                      String interval,
                                      Instant from,
                                      Instant to) {
        log.info("getHistory instrumentToken={}, interval={}, from={}, to={}",
                instrumentToken, interval, from, to);
        // Placeholder: rely on repository when schema is known; return empty list for now to avoid
        // coupling tests to the actual DB contents.
        return Collections.emptyList();
    }

    /**
     * Retrieve latest quotes for one or more symbols.
     *
     * This will be wired to Kite HTTP calls in a later phase; for now,
     * it returns an empty list as a contract placeholder.
     */
    public List<Quote> getQuotes(List<String> symbols) {
        log.info("getQuotes symbols={}", symbols);
        return Collections.emptyList();
    }
}


