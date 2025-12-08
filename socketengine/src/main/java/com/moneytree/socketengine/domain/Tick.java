package com.moneytree.socketengine.domain;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/**
 * Domain model representing a single market data tick from Kite WebSocket.
 * Immutable value object containing price, volume, and OHLC information.
 */
@Value
@Builder
public class Tick {
    /**
     * Trading symbol (e.g., "NIFTY 50", "RELIANCE")
     */
    String symbol;
    
    /**
     * Unique numeric identifier for the instrument in Kite system
     */
    long instrumentToken;
    
    /**
     * Type of instrument (INDEX or STOCK)
     */
    InstrumentType type;
    
    /**
     * Timestamp when the tick was generated
     */
    Instant timestamp;
    
    /**
     * Last traded price
     */
    double lastTradedPrice;
    
    /**
     * Trading volume
     */
    long volume;
    
    /**
     * Open, High, Low, Close prices
     */
    OHLC ohlc;
    
    /**
     * Original binary data received from Kite WebSocket API.
     * Stored for persistence to TimescaleDB without parsing overhead.
     */
    byte[] rawBinaryData;
    
    /**
     * Nested value object for OHLC (Open, High, Low, Close) data
     */
    @Value
    @Builder
    public static class OHLC {
        double open;
        double high;
        double low;
        double close;
    }
}
