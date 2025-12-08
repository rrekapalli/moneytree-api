package com.moneytree.socketengine.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * JPA entity for persisting tick data to TimescaleDB.
 * Stores raw binary data from Kite WebSocket API for space efficiency.
 * Uses composite primary key (instrument_token, tick_timestamp).
 */
@Entity
@Table(name = "kite_ticks_data")
@IdClass(TickEntityId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TickEntity {
    
    /**
     * Unique numeric identifier for the instrument in Kite system.
     * Part of composite primary key.
     */
    @Id
    @Column(name = "instrument_token", nullable = false)
    private Long instrumentToken;
    
    /**
     * Trading symbol (e.g., "NIFTY 50", "RELIANCE")
     */
    @Column(name = "tradingsymbol", nullable = false, length = 50)
    private String tradingSymbol;
    
    /**
     * Exchange where the instrument is traded (e.g., "NSE", "BSE")
     */
    @Column(name = "exchange", nullable = false, length = 10)
    private String exchange;
    
    /**
     * Timestamp when the tick was generated.
     * Part of composite primary key.
     */
    @Id
    @Column(name = "tick_timestamp", nullable = false)
    private Instant tickTimestamp;
    
    /**
     * Raw binary data received from Kite WebSocket API.
     * Stored as-is without parsing to minimize storage overhead.
     * Can be parsed on-demand when querying historical data.
     */
    @Column(name = "raw_tick_data", nullable = false)
    @Lob
    private byte[] rawTickData;
}
