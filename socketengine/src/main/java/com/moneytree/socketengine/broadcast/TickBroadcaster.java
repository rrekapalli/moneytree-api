package com.moneytree.socketengine.broadcast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.kite.InstrumentLoader;
import com.moneytree.socketengine.kite.IndexInstrumentService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Hot path component that immediately broadcasts ticks to connected WebSocket clients.
 * This is a synchronous event listener that runs on the same thread as the Kite WebSocket receiver
 * to minimize latency. It converts ticks to DTOs once, serializes to JSON once, and broadcasts
 * to all relevant sessions.
 * 
 * Target sessions are determined by:
 * 1. Sessions with explicit subscriptions to the symbol
 * 2. /ws/indices/all sessions (if the tick is for an index)
 * 3. /ws/stocks/nse/all sessions (if the tick is for a stock)
 * 4. /ws/stocks/nse/index/{indexName} sessions (if the stock belongs to that index)
 */
@Component
@Slf4j
public class TickBroadcaster {
    
    private final SessionManager sessionManager;
    private final InstrumentLoader instrumentLoader;
    private final IndexInstrumentService indexInstrumentService;
    private final ObjectMapper objectMapper;
    private final Counter ticksBroadcastCounter;
    
    public TickBroadcaster(
            SessionManager sessionManager,
            InstrumentLoader instrumentLoader,
            IndexInstrumentService indexInstrumentService,
            ObjectMapper objectMapper,
            MeterRegistry meterRegistry) {
        this.sessionManager = sessionManager;
        this.instrumentLoader = instrumentLoader;
        this.indexInstrumentService = indexInstrumentService;
        this.objectMapper = objectMapper;
        
        // Register counter for ticks broadcast
        this.ticksBroadcastCounter = Counter.builder("socketengine.ticks.broadcast")
            .description("Total number of ticks broadcast to WebSocket clients")
            .register(meterRegistry);
    }
    
    /**
     * Hot path: Synchronous event listener for immediate broadcast.
     * This runs on the same thread as the Kite WebSocket receiver to minimize latency.
     * 
     * @param event The tick received event containing the parsed tick data
     */
    @EventListener
    public void onTickReceived(TickReceivedEvent event) {
        Tick tick = event.tick();
        
        try {
            // Convert to DTO once
            TickDto dto = toDto(tick);
            
            // Serialize to JSON once
            String json = objectMapper.writeValueAsString(dto);
            
            // Determine which sessions should receive this tick
            Set<String> targetSessions = new HashSet<>();
            
            // 1. Sessions with explicit subscriptions to this symbol
            targetSessions.addAll(
                sessionManager.getSessionsSubscribedTo(tick.getSymbol()));
            
            // 2. /ws/indices/all sessions (if this is an index tick)
            boolean isIndex = instrumentLoader.isIndexToken(tick.getInstrumentToken());
            if (isIndex) {
                Set<String> indicesAllSessions = sessionManager.getIndicesAllSessions();
                targetSessions.addAll(indicesAllSessions);
                log.debug("INDEX TICK BROADCAST: {} (token: {}) to {} sessions", 
                    tick.getSymbol(), tick.getInstrumentToken(), indicesAllSessions.size());
            }
            
            // 3. /ws/stocks/nse/all sessions (if this is a stock tick)
            boolean isStock = instrumentLoader.isStockToken(tick.getInstrumentToken());
            if (isStock) {
                targetSessions.addAll(sessionManager.getStocksAllSessions());
                
                // 4. Index-specific sessions (if this stock belongs to any index)
                addIndexSpecificSessions(tick, targetSessions);
            }
            
            // Debug logging for troubleshooting
            if (isIndex && targetSessions.isEmpty()) {
                log.warn("INDEX TICK {} has no target sessions! indicesAllSessions: {}", 
                    tick.getSymbol(), sessionManager.getIndicesAllSessions().size());
            }
            
            // Broadcast to all target sessions (non-blocking)
            // Individual send failures are handled gracefully to not affect other sessions
            targetSessions.forEach(sessionId -> {
                try {
                    sessionManager.sendMessage(sessionId, json);
                    ticksBroadcastCounter.increment();
                } catch (Exception e) {
                    // Log warning (not error) since client disconnections are normal
                    log.warn("Failed to send tick to session {}: {}", 
                        sessionId, e.getMessage());
                    // SessionManager already handles session cleanup on send failure
                }
            });
            
        } catch (JsonProcessingException e) {
            // This should rarely happen - log as error since it indicates a serialization issue
            log.error("Error serializing tick for {}", tick.getSymbol(), e);
        } catch (Exception e) {
            // Catch any other unexpected errors to prevent disrupting the hot path
            log.error("Error broadcasting tick for {}", tick.getSymbol(), e);
        }
    }
    
    /**
     * Adds sessions from index-specific endpoints if the stock belongs to any index.
     * This method checks all active index-specific sessions and determines if the
     * current stock tick should be sent to them.
     * 
     * @param tick The stock tick to check
     * @param targetSessions The set of target sessions to add to
     */
    private void addIndexSpecificSessions(Tick tick, Set<String> targetSessions) {
        try {
            // Get all active index-specific sessions
            Map<String, Set<String>> indexSessions = sessionManager.getAllIndexSpecificSessions();
            
            if (indexSessions.isEmpty()) {
                return; // No index-specific sessions active
            }
            
            // For each active index, check if this stock belongs to it
            for (Map.Entry<String, Set<String>> entry : indexSessions.entrySet()) {
                String indexName = entry.getKey();
                Set<String> sessions = entry.getValue();
                
                // Check if this stock's trading symbol belongs to the index
                Set<String> indexSymbols = indexInstrumentService.getTradingSymbolsByIndex(indexName);
                if (indexSymbols.contains(tick.getSymbol())) {
                    targetSessions.addAll(sessions);
                    log.debug("INDEX-SPECIFIC BROADCAST: {} belongs to index {} - adding {} sessions", 
                        tick.getSymbol(), indexName, sessions.size());
                }
            }
            
        } catch (Exception e) {
            // Don't let index-specific session errors affect the main broadcast
            log.warn("Error determining index-specific sessions for {}: {}", 
                tick.getSymbol(), e.getMessage());
        }
    }
    
    /**
     * Converts a domain Tick object to a TickDto for JSON serialization.
     * 
     * @param tick The domain tick object
     * @return TickDto ready for JSON serialization
     */
    private TickDto toDto(Tick tick) {
        return TickDto.builder()
            .symbol(tick.getSymbol())
            .instrumentToken(tick.getInstrumentToken())
            .type(tick.getType().name())  // Convert enum to string
            .timestamp(tick.getTimestamp().toString())  // ISO 8601 format
            .lastTradedPrice(tick.getLastTradedPrice())
            .volume(tick.getVolume())
            .ohlc(new TickDto.OHLCDto(
                tick.getOhlc().getOpen(),
                tick.getOhlc().getHigh(),
                tick.getOhlc().getLow(),
                tick.getOhlc().getClose()
            ))
            .build();
    }
}
