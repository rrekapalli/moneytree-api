package com.moneytree.socketengine.persistence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * Composite primary key for TickEntity.
 * Combines instrument_token and tick_timestamp to uniquely identify a tick.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TickEntityId implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * Unique numeric identifier for the instrument in Kite system
     */
    private Long instrumentToken;
    
    /**
     * Timestamp when the tick was generated
     */
    private Instant tickTimestamp;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TickEntityId that = (TickEntityId) o;
        return Objects.equals(instrumentToken, that.instrumentToken) &&
               Objects.equals(tickTimestamp, that.tickTimestamp);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(instrumentToken, tickTimestamp);
    }
}
