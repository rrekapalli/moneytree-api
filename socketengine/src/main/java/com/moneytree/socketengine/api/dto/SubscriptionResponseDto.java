package com.moneytree.socketengine.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

/**
 * Data Transfer Object for subscription status responses.
 * Provides information about active WebSocket sessions and their subscriptions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponseDto {
    
    /**
     * Unique session identifier
     */
    private String sessionId;
    
    /**
     * WebSocket endpoint path
     * Examples: "/ws/indices", "/ws/stocks", "/ws/indices/all", "/ws/stocks/nse/all"
     */
    private String endpoint;
    
    /**
     * Set of trading symbols currently subscribed by this session
     */
    private Set<String> subscribedSymbols;
    
    /**
     * Timestamp when the session was established
     */
    private Instant connectedAt;
}
