package com.moneytree.socketengine.domain.events;

import com.moneytree.socketengine.domain.Tick;

import java.time.Instant;

/**
 * Domain event published when a tick is successfully received and parsed from Kite WebSocket.
 * This event triggers asynchronous processing by multiple consumers:
 * - TickBroadcaster: Immediately broadcasts to WebSocket clients (hot path)
 * - TickCacheService: Caches to Redis for intraday queries (cold path)
 * - TickBatchBuffer: Buffers for batch persistence to TimescaleDB (cold path)
 * 
 * @param tick The parsed tick data
 * @param receivedAt Timestamp when the event was created
 */
public record TickReceivedEvent(
    Tick tick,
    Instant receivedAt
) {
    /**
     * Convenience constructor that automatically sets receivedAt to current time
     * 
     * @param tick The parsed tick data
     */
    public TickReceivedEvent(Tick tick) {
        this(tick, Instant.now());
    }
}
