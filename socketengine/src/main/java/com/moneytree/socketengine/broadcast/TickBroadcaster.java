package com.moneytree.socketengine.broadcast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.kite.InstrumentLoader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.HashSet;
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
 */
@Component
@Slf4j
public class TickBroadcaster {
    
    private final SessionManager sessionManager;
    private final InstrumentLoader instrumentLoader;
    private final ObjectMapper objectMapper;
    
    public TickBroadcaster(
            SessionManager sessionManager,
            InstrumentLoader instrumentLoader,
            ObjectMapper objectMapper) {
        this.sessionManager = sessionManager;
        this.instrumentLoader = instrumentLoader;
        this.objectMapper = objectMapper;
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
            if (instrumentLoader.isIndexToken(tick.getInstrumentToken())) {
                targetSessions.addAll(sessionManager.getIndicesAllSessions());
            }
            
            // 3. /ws/stocks/nse/all sessions (if this is a stock tick)
            if (instrumentLoader.isStockToken(tick.getInstrumentToken())) {
                targetSessions.addAll(sessionManager.getStocksAllSessions());
            }
            
            // Broadcast to all target sessions (non-blocking)
            // Individual send failures are handled gracefully to not affect other sessions
            targetSessions.forEach(sessionId -> {
                try {
                    sessionManager.sendMessage(sessionId, json);
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
