package com.moneytree.socketengine.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents an instrument that belongs to a specific index.
 * Contains the essential information needed for WebSocket subscriptions.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IndexInstrument {
    
    /**
     * The exchange where the instrument is traded (e.g., "NSE")
     */
    private String exchange;
    
    /**
     * The segment of the instrument (e.g., "NSE")
     */
    private String segment;
    
    /**
     * The type of instrument (e.g., "EQ" for equity)
     */
    private String instrumentType;
    
    /**
     * The index this instrument belongs to (e.g., "NIFTY 50", "NIFTY BANK")
     */
    private String indexName;
    
    /**
     * The trading symbol of the instrument (e.g., "RELIANCE", "TCS")
     */
    private String tradingSymbol;
    
    /**
     * The unique instrument token used by Kite for subscriptions
     */
    private Long instrumentToken;
}