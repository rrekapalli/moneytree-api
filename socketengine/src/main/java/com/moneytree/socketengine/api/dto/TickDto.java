package com.moneytree.socketengine.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for tick data sent to WebSocket clients.
 * Contains all relevant market data fields in a JSON-friendly format.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TickDto {
    /**
     * Trading symbol (e.g., "NIFTY 50", "RELIANCE")
     */
    private String symbol;
    
    /**
     * Unique numeric identifier for the instrument
     */
    private long instrumentToken;
    
    /**
     * Type of instrument: "INDEX" or "STOCK"
     */
    private String type;
    
    /**
     * ISO 8601 formatted timestamp (e.g., "2025-12-08T10:15:03.123+05:30")
     */
    private String timestamp;
    
    /**
     * Last traded price
     */
    private double lastTradedPrice;
    
    /**
     * Trading volume
     */
    private long volume;
    
    /**
     * Open, High, Low, Close prices
     */
    private OHLCDto ohlc;
    
    /**
     * Nested DTO for OHLC (Open, High, Low, Close) data
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OHLCDto {
        private double open;
        private double high;
        private double low;
        private double close;
    }
}
