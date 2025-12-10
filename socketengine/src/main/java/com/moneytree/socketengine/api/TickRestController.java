package com.moneytree.socketengine.api;

import com.moneytree.socketengine.api.dto.SubscriptionResponseDto;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.broadcast.SessionManager;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.kite.InstrumentLoader;
import com.moneytree.socketengine.kite.KiteTickParser;
import com.moneytree.socketengine.persistence.TickEntity;
import com.moneytree.socketengine.persistence.TickRepository;
import com.moneytree.socketengine.redis.TickCacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for querying tick data and managing subscriptions.
 * Provides endpoints for retrieving cached intraday data, historical data from TimescaleDB,
 * and viewing active WebSocket subscriptions.
 */
@RestController
@RequestMapping("/api/ticks")
@Tag(name = "Market Ticks", description = "Market tick data operations")
@Slf4j
@RequiredArgsConstructor
public class TickRestController {
    
    private final TickCacheService cacheService;
    private final TickRepository tickRepository;
    private final SessionManager sessionManager;
    private final InstrumentLoader instrumentLoader;
    private final KiteTickParser tickParser;
    
    /**
     * Retrieves today's cached ticks for a specific symbol from Redis.
     * Optionally filters by time window (last N minutes).
     * 
     * @param symbol Trading symbol (e.g., "NIFTY 50", "RELIANCE")
     * @param lastMinutes Optional time window in minutes (null = all ticks)
     * @return List of ticks from Redis cache
     */
    @GetMapping("/today/{symbol}")
    @Operation(
        summary = "Get today's ticks for a symbol",
        description = "Retrieves cached intraday ticks from Redis. Optionally filter by time window using lastMinutes parameter."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved ticks",
            content = @Content(schema = @Schema(implementation = TickDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid parameters"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<List<TickDto>> getTodayTicks(
            @Parameter(description = "Trading symbol", example = "NIFTY 50")
            @PathVariable String symbol,
            @Parameter(description = "Optional time window in minutes", example = "5")
            @RequestParam(required = false) Integer lastMinutes) {
        
        try {
            log.debug("Fetching today's ticks for symbol: {}, lastMinutes: {}", symbol, lastMinutes);
            
            // Validate lastMinutes if provided
            if (lastMinutes != null && lastMinutes <= 0) {
                log.warn("Invalid lastMinutes parameter: {}", lastMinutes);
                return ResponseEntity.badRequest().build();
            }
            
            List<Tick> ticks = cacheService.getTodayTicks(symbol, lastMinutes);
            List<TickDto> tickDtos = ticks.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
            
            log.debug("Retrieved {} ticks for symbol: {}", tickDtos.size(), symbol);
            return ResponseEntity.ok(tickDtos);
            
        } catch (Exception e) {
            log.error("Error retrieving today's ticks for symbol: {}", symbol, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Retrieves historical ticks for a symbol from TimescaleDB within a time range.
     * Raw binary data is parsed on demand.
     * 
     * @param symbol Trading symbol
     * @param startTime Start of time range (inclusive)
     * @param endTime End of time range (inclusive)
     * @return List of historical ticks
     */
    @GetMapping("/historical")
    @Operation(
        summary = "Get historical ticks",
        description = "Retrieves historical ticks from TimescaleDB for a specific symbol and time range. " +
                     "Raw binary data is parsed on demand. Time range must be valid (startTime < endTime)."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved historical ticks",
            content = @Content(schema = @Schema(implementation = TickDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid parameters (e.g., startTime >= endTime)"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<List<TickDto>> getHistoricalTicks(
            @Parameter(description = "Trading symbol", example = "RELIANCE", required = true)
            @RequestParam String symbol,
            @Parameter(description = "Start time in ISO 8601 format", example = "2025-12-08T09:15:00Z", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startTime,
            @Parameter(description = "End time in ISO 8601 format", example = "2025-12-08T15:30:00Z", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endTime) {
        
        try {
            log.debug("Fetching historical ticks for symbol: {}, startTime: {}, endTime: {}", 
                symbol, startTime, endTime);
            
            // Validate time range
            if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
                log.warn("Invalid time range: startTime ({}) must be before endTime ({})", startTime, endTime);
                return ResponseEntity.badRequest().build();
            }
            
            // Query TimescaleDB
            List<TickEntity> entities = tickRepository.findByTradingSymbolAndTimestampBetween(
                symbol, startTime, endTime);
            
            // Parse raw binary data on demand
            List<TickDto> tickDtos = entities.stream()
                .map(this::parseRawTickData)
                .filter(tick -> tick != null)  // Filter out any parsing failures
                .collect(Collectors.toList());
            
            log.debug("Retrieved {} historical ticks for symbol: {}", tickDtos.size(), symbol);
            return ResponseEntity.ok(tickDtos);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid parameters for historical ticks query: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error retrieving historical ticks for symbol: {}", symbol, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Retrieves all active WebSocket sessions and their subscriptions.
     * 
     * @return Map of session IDs to subscription details
     */
    @GetMapping("/subscriptions")
    @Operation(
        summary = "Get active subscriptions",
        description = "Returns all active WebSocket sessions with their endpoints and subscribed symbols."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved subscriptions",
            content = @Content(schema = @Schema(implementation = SubscriptionResponseDto.class))
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<Map<String, SubscriptionResponseDto>> getActiveSubscriptions() {
        try {
            log.debug("Fetching active subscriptions");
            
            Map<String, SubscriptionResponseDto> subscriptions = new HashMap<>();
            
            for (String sessionId : sessionManager.getAllSessionIds()) {
                String endpoint = sessionManager.getSessionEndpoint(sessionId);
                var subscribedSymbols = sessionManager.getSessionSubscriptions(sessionId);
                
                SubscriptionResponseDto dto = SubscriptionResponseDto.builder()
                    .sessionId(sessionId)
                    .endpoint(endpoint)
                    .subscribedSymbols(subscribedSymbols)
                    .connectedAt(Instant.now())  // Note: actual connection time not tracked currently
                    .build();
                
                subscriptions.put(sessionId, dto);
            }
            
            log.debug("Retrieved {} active subscriptions", subscriptions.size());
            return ResponseEntity.ok(subscriptions);
            
        } catch (Exception e) {
            log.error("Error retrieving active subscriptions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Admin endpoint to manually refresh the instrument cache from the database.
     * This reloads all NSE indices and stocks from the database and updates Redis cache.
     * 
     * @return Success or error message
     */
    @PostMapping("/admin/refresh-instruments")
    @Operation(
        summary = "Refresh instrument cache",
        description = "Admin endpoint to manually refresh the instrument cache from the database. " +
                     "Reloads all NSE indices and stocks and updates Redis cache."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Instrument cache refreshed successfully"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Failed to refresh cache"
        )
    })
    public ResponseEntity<String> refreshInstrumentCache() {
        try {
            log.info("Admin request to refresh instrument cache");
            instrumentLoader.refreshCache();
            log.info("Instrument cache refreshed successfully");
            return ResponseEntity.ok("Instrument cache refreshed successfully");
        } catch (Exception e) {
            log.error("Failed to refresh instrument cache", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to refresh cache: " + e.getMessage());
        }
    }
    
    /**
     * Converts domain Tick to DTO for API responses.
     * 
     * @param tick Domain tick object
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
     * Parses raw binary data from TickEntity and converts to TickDto.
     * If parsing fails, returns null and logs a warning.
     * 
     * @param entity TickEntity with raw binary data
     * @return TickDto if parsing succeeds, null otherwise
     */
    private TickDto parseRawTickData(TickEntity entity) {
        try {
            // Parse the raw binary data
            List<Tick> ticks = tickParser.parse(entity.getRawTickData());
            
            if (ticks.isEmpty()) {
                log.warn("No ticks parsed from raw data for instrument token: {}", 
                    entity.getInstrumentToken());
                return null;
            }
            
            // Return the first tick (should only be one per entity)
            Tick tick = ticks.get(0);
            return toDto(tick);
            
        } catch (Exception e) {
            log.warn("Failed to parse raw tick data for instrument token: {}, timestamp: {}", 
                entity.getInstrumentToken(), entity.getTickTimestamp(), e);
            return null;
        }
    }
}
