package com.moneytree.socketengine.persistence;

import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.kite.InstrumentLoader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe buffer that accumulates ticks for batch persistence to TimescaleDB.
 * This is part of the cold path - asynchronous processing that doesn't block
 * the hot path (WebSocket broadcasting).
 * 
 * Ticks are buffered in memory and periodically flushed to the database
 * by TickPersistenceService every 15 minutes.
 * 
 * Uses ConcurrentLinkedQueue for thread-safe buffering and AtomicLong for
 * accurate size tracking across concurrent operations.
 */
@Component
@Slf4j
public class TickBatchBuffer {
    
    private final InstrumentLoader instrumentLoader;
    
    // Thread-safe queue for buffering tick entities
    private final ConcurrentLinkedQueue<TickEntity> buffer = new ConcurrentLinkedQueue<>();
    
    // Atomic counter for accurate buffer size tracking
    private final AtomicLong bufferSize = new AtomicLong(0);
    
    public TickBatchBuffer(InstrumentLoader instrumentLoader) {
        this.instrumentLoader = instrumentLoader;
    }
    
    /**
     * Cold path: Asynchronous event listener for buffering ticks.
     * Runs on separate thread pool (tickPersistenceExecutor) to avoid blocking the hot path.
     * 
     * Order(2) ensures this runs after TickCacheService (Order(1)) and TickBroadcaster (synchronous).
     * 
     * @param event The tick received event containing tick data
     */
    @Async("tickPersistenceExecutor")
    @EventListener
    @Order(2)
    public void onTickReceived(TickReceivedEvent event) {
        try {
            var tick = event.tick();
            
            // Lookup instrument metadata to get tradingsymbol and exchange
            InstrumentInfo info = instrumentLoader.getInstrumentInfo(tick.getInstrumentToken());
            
            // Create entity with instrument metadata and raw binary data
            TickEntity entity = TickEntity.builder()
                .instrumentToken(tick.getInstrumentToken())
                .tradingSymbol(info != null ? info.getTradingSymbol() : tick.getSymbol())
                .exchange(info != null ? getExchange(info) : "NSE")
                .tickTimestamp(tick.getTimestamp())
                .rawTickData(tick.getRawBinaryData())  // Store raw binary from Kite
                .build();
            
            // Add to buffer (thread-safe operation)
            buffer.offer(entity);
            long size = bufferSize.incrementAndGet();
            
            // Log buffer size every 10,000 ticks for monitoring
            if (size % 10000 == 0) {
                log.info("Buffer size: {} ticks", size);
            }
            
        } catch (Exception e) {
            log.error("Error buffering tick for {}: {}", 
                event.tick().getSymbol(), e.getMessage(), e);
            // Don't rethrow - buffering failures shouldn't affect other consumers
        }
    }
    
    /**
     * Drains all buffered tick entities and resets the counter.
     * This method is called by TickPersistenceService during scheduled batch persistence.
     * 
     * Thread-safe: Multiple calls will not return duplicate entities.
     * 
     * @return List of all buffered tick entities (may be empty)
     */
    public List<TickEntity> drainBuffer() {
        List<TickEntity> batch = new ArrayList<>();
        TickEntity entity;
        
        // Poll all entities from the queue (thread-safe)
        while ((entity = buffer.poll()) != null) {
            batch.add(entity);
        }
        
        // Reset counter to zero
        bufferSize.set(0);
        
        return batch;
    }
    
    /**
     * Returns the current buffer size.
     * Used for monitoring and health checks.
     * 
     * @return Current number of buffered tick entities
     */
    public long getBufferSize() {
        return bufferSize.get();
    }
    
    /**
     * Determines the exchange for an instrument based on its type.
     * NSE is used for both indices and stocks in this implementation.
     * 
     * @param info Instrument information
     * @return Exchange code (e.g., "NSE")
     */
    private String getExchange(InstrumentInfo info) {
        // For now, all instruments are NSE
        // This can be extended to support other exchanges (BSE, NFO, etc.)
        return "NSE";
    }
}
