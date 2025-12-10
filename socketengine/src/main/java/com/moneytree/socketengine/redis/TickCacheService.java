package com.moneytree.socketengine.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Cold path consumer that asynchronously caches ticks to Redis for fast intraday queries.
 * Runs on separate thread pool (tickCacheExecutor) to avoid blocking the hot path.
 * 
 * Redis key format: "ticks:{tradingDate}:{symbol}"
 * Value: List of JSON-serialized TickDto objects
 * TTL: 2 days
 */
@Component
@Slf4j
public class TickCacheService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final Counter ticksCachedCounter;
    
    public TickCacheService(
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper,
            MeterRegistry meterRegistry) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        
        // Register counter for ticks cached
        this.ticksCachedCounter = Counter.builder("socketengine.ticks.cached")
            .description("Total number of ticks cached to Redis")
            .register(meterRegistry);
    }
    
    /**
     * Cold path: Asynchronous event listener for Redis caching.
     * Runs on separate thread pool to avoid blocking the hot path.
     * 
     * @param event The tick received event
     */
    @Async("tickCacheExecutor")
    @EventListener
    @Order(1)  // Lower priority than broadcast
    public void onTickReceived(TickReceivedEvent event) {
        Tick tick = event.tick();
        
        try {
            String tradingDate = getTradingDate();
            String key = String.format("ticks:%s:%s", tradingDate, tick.getSymbol());
            
            // Convert tick to DTO and serialize to JSON
            TickDto dto = toDto(tick);
            String tickJson = objectMapper.writeValueAsString(dto);
            
            // Append to Redis List (RPUSH is O(1))
            redisTemplate.opsForList().rightPush(key, tickJson);
            
            // Set TTL to 2 days if this is a new key
            Long ttl = redisTemplate.getExpire(key);
            if (ttl == null || ttl == -1) {
                redisTemplate.expire(key, Duration.ofDays(2));
            }
            
            // Increment metrics counter
            ticksCachedCounter.increment();
            
        } catch (JsonProcessingException e) {
            log.error("Error serializing tick for {}: {}", tick.getSymbol(), e.getMessage());
            // Don't rethrow - cache failures shouldn't affect other consumers
        } catch (Exception e) {
            log.error("Error caching tick for {}: {}", tick.getSymbol(), e.getMessage());
            // Don't rethrow - cache failures shouldn't affect other consumers
        }
    }
    
    /**
     * Retrieves today's cached ticks for a symbol, optionally filtered by time window.
     * 
     * @param symbol The trading symbol
     * @param lastMinutes Optional time window in minutes (null = all ticks)
     * @return List of ticks from Redis cache
     */
    public List<Tick> getTodayTicks(String symbol, Integer lastMinutes) {
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:%s", tradingDate, symbol);
        
        try {
            List<String> tickJsonList = redisTemplate.opsForList().range(key, 0, -1);
            if (tickJsonList == null || tickJsonList.isEmpty()) {
                return Collections.emptyList();
            }
            
            Stream<String> stream = tickJsonList.stream();
            
            // Filter by time window if requested
            if (lastMinutes != null) {
                Instant cutoff = Instant.now().minus(Duration.ofMinutes(lastMinutes));
                stream = stream.filter(json -> {
                    try {
                        TickDto dto = objectMapper.readValue(json, TickDto.class);
                        return Instant.parse(dto.getTimestamp()).isAfter(cutoff);
                    } catch (Exception e) {
                        log.warn("Failed to parse cached tick: {}", e.getMessage());
                        return false;
                    }
                });
            }
            
            return stream
                .map(this::fromJson)
                .filter(Objects::nonNull)
                .toList();
                
        } catch (Exception e) {
            log.error("Error retrieving cached ticks for {}: {}", symbol, e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Gets the current trading date in IST timezone.
     * 
     * @return Trading date in YYYY-MM-DD format
     */
    private String getTradingDate() {
        return ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
            .toLocalDate()
            .toString();
    }
    
    /**
     * Converts domain Tick to DTO for serialization.
     * 
     * @param tick The domain tick object
     * @return TickDto for JSON serialization
     */
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
    
    /**
     * Deserializes JSON string to Tick domain object.
     * 
     * @param json JSON string representation of TickDto
     * @return Tick domain object, or null if deserialization fails
     */
    private Tick fromJson(String json) {
        try {
            TickDto dto = objectMapper.readValue(json, TickDto.class);
            return Tick.builder()
                .symbol(dto.getSymbol())
                .instrumentToken(dto.getInstrumentToken())
                .type(com.moneytree.socketengine.domain.InstrumentType.valueOf(dto.getType()))
                .timestamp(Instant.parse(dto.getTimestamp()))
                .lastTradedPrice(dto.getLastTradedPrice())
                .volume(dto.getVolume())
                .ohlc(Tick.OHLC.builder()
                    .open(dto.getOhlc().getOpen())
                    .high(dto.getOhlc().getHigh())
                    .low(dto.getOhlc().getLow())
                    .close(dto.getOhlc().getClose())
                    .build())
                .build();
        } catch (Exception e) {
            log.warn("Failed to deserialize tick from JSON: {}", e.getMessage());
            return null;
        }
    }
}
