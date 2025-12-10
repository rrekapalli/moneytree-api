package com.moneytree.socketengine.broadcast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Random;

/**
 * Mock broadcaster for testing index data when Kite is not connected.
 * This component generates fake index ticks for NIFTY 50, NIFTY BANK, etc.
 * to test the WebSocket broadcasting functionality.
 * 
 * Enable with: socketengine.mock.enabled=true
 */
@Component
@Slf4j
@ConditionalOnProperty(name = "socketengine.mock.enabled", havingValue = "true")
public class MockIndexDataBroadcaster {
    
    private final SessionManager sessionManager;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();
    
    // Mock index data with realistic base prices
    private final List<MockIndex> mockIndices = List.of(
        new MockIndex(256265L, "NIFTY 50", 24500.0),
        new MockIndex(260105L, "NIFTY BANK", 52000.0),
        new MockIndex(256777L, "NIFTY MIDCAP 100", 58000.0),
        new MockIndex(265L, "SENSEX", 81000.0)
    );
    
    public MockIndexDataBroadcaster(SessionManager sessionManager, ObjectMapper objectMapper) {
        this.sessionManager = sessionManager;
        this.objectMapper = objectMapper;
        log.info("MockIndexDataBroadcaster initialized - mock data broadcasting enabled");
    }
    
    /**
     * Broadcasts mock index ticks every 2 seconds for testing
     */
    @Scheduled(fixedRate = 2000)
    public void broadcastMockIndexTicks() {
        var indicesAllSessions = sessionManager.getIndicesAllSessions();
        
        if (indicesAllSessions.isEmpty()) {
            return; // No sessions to broadcast to
        }
        
        log.debug("Broadcasting mock index ticks to {} sessions", indicesAllSessions.size());
        
        for (MockIndex mockIndex : mockIndices) {
            try {
                // Generate realistic price movement
                double priceChange = (random.nextGaussian() * 0.002); // ~0.2% volatility
                mockIndex.currentPrice += mockIndex.basePrice * priceChange;
                
                // Keep price within reasonable bounds
                if (mockIndex.currentPrice < mockIndex.basePrice * 0.95) {
                    mockIndex.currentPrice = mockIndex.basePrice * 0.95;
                }
                if (mockIndex.currentPrice > mockIndex.basePrice * 1.05) {
                    mockIndex.currentPrice = mockIndex.basePrice * 1.05;
                }
                
                // Create mock tick
                Tick mockTick = Tick.builder()
                    .symbol(mockIndex.symbol)
                    .instrumentToken(mockIndex.instrumentToken)
                    .type(InstrumentType.INDEX)
                    .timestamp(Instant.now())
                    .lastTradedPrice(mockIndex.currentPrice)
                    .volume(random.nextLong(1000000, 10000000))
                    .ohlc(Tick.OHLC.builder()
                        .open(mockIndex.currentPrice * (0.998 + random.nextDouble() * 0.004))
                        .high(mockIndex.currentPrice * (1.001 + random.nextDouble() * 0.002))
                        .low(mockIndex.currentPrice * (0.997 + random.nextDouble() * 0.002))
                        .close(mockIndex.currentPrice)
                        .build())
                    .build();
                
                // Convert to DTO
                TickDto dto = toDto(mockTick);
                String json = objectMapper.writeValueAsString(dto);
                
                // Broadcast to all /ws/indices/all sessions
                indicesAllSessions.forEach(sessionId -> {
                    try {
                        sessionManager.sendMessage(sessionId, json);
                    } catch (Exception e) {
                        log.warn("Failed to send mock tick to session {}: {}", sessionId, e.getMessage());
                    }
                });
                
            } catch (JsonProcessingException e) {
                log.error("Error serializing mock tick for {}", mockIndex.symbol, e);
            }
        }
    }
    
    private TickDto toDto(Tick tick) {
        return TickDto.builder()
            .symbol(tick.getSymbol())
            .instrumentToken(tick.getInstrumentToken())
            .type(tick.getType().name())
            .timestamp(tick.getTimestamp().toString())
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
    
    private static class MockIndex {
        final long instrumentToken;
        final String symbol;
        final double basePrice;
        double currentPrice;
        
        MockIndex(long instrumentToken, String symbol, double basePrice) {
            this.instrumentToken = instrumentToken;
            this.symbol = symbol;
            this.basePrice = basePrice;
            this.currentPrice = basePrice;
        }
    }
}