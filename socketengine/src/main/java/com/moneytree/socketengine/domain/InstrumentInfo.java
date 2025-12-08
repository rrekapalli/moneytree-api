package com.moneytree.socketengine.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;

/**
 * Domain model representing instrument metadata loaded from the database.
 * Used for mapping instrument tokens to trading symbols and determining instrument types.
 */
@Value
@Builder
public class InstrumentInfo {
    /**
     * Unique numeric identifier for the instrument in Kite system
     */
    long instrumentToken;
    
    /**
     * Exchange token identifier
     */
    long exchangeToken;
    
    /**
     * Trading symbol as displayed on the exchange (e.g., "NIFTY 50", "RELIANCE")
     */
    String tradingSymbol;
    
    /**
     * Type of instrument (INDEX or STOCK)
     */
    InstrumentType type;
    
    /**
     * Constructor for Jackson deserialization
     */
    @JsonCreator
    public InstrumentInfo(
            @JsonProperty("instrumentToken") long instrumentToken,
            @JsonProperty("exchangeToken") long exchangeToken,
            @JsonProperty("tradingSymbol") String tradingSymbol,
            @JsonProperty("type") InstrumentType type) {
        this.instrumentToken = instrumentToken;
        this.exchangeToken = exchangeToken;
        this.tradingSymbol = tradingSymbol;
        this.type = type;
    }
}
