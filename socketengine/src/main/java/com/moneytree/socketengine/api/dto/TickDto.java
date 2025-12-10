package com.moneytree.socketengine.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for market tick data sent to WebSocket clients.
 * Represents a single market data update with price, volume, and OHLC information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TickDto {
    
    /**
     * Trading symbol (e.g., "NIFTY 50", "RELIANCE")
     */
    private String symbol;
    
    /**
     * Unique instrument token from Kite
     */
    private long instrumentToken;
    
    /**
     * Instrument type: "INDEX" or "STOCK"
     */
    private String type;
    
    /**
     * Tick timestamp in ISO 8601 format with timezone
     * Example: "2025-12-08T10:15:03.123+05:30"
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
