package com.moneytree.socketengine.api;

import com.moneytree.socketengine.domain.IndexInstrument;
import com.moneytree.socketengine.kite.IndexInstrumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST controller for index-related operations.
 * Provides endpoints to query instruments by index and validate index names.
 */
@RestController
@RequestMapping("/api/indices")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Index Management", description = "APIs for managing index-specific instrument queries")
public class IndexController {
    
    private final IndexInstrumentService indexInstrumentService;
    
    /**
     * Retrieves all available index names.
     * 
     * @return list of all available index names
     */
    @GetMapping
    @Operation(
        summary = "Get all available indices",
        description = "Returns a list of all available index names that can be used for WebSocket subscriptions"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved index names")
    public ResponseEntity<List<String>> getAllIndices() {
        log.debug("REST: Getting all available indices");
        
        try {
            List<String> indices = indexInstrumentService.getAllIndexNames();
            log.info("REST: Retrieved {} available indices", indices.size());
            return ResponseEntity.ok(indices);
        } catch (Exception e) {
            log.error("REST: Failed to retrieve available indices", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Retrieves all instruments for a specific index.
     * 
     * @param indexName the name of the index
     * @return list of instruments in the index
     */
    @GetMapping("/{indexName}/instruments")
    @Operation(
        summary = "Get instruments by index",
        description = "Returns all instruments that belong to the specified index"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved instruments")
    @ApiResponse(responseCode = "404", description = "Index not found")
    public ResponseEntity<List<IndexInstrument>> getInstrumentsByIndex(
            @Parameter(description = "Name of the index (e.g., 'NIFTY 50', 'NIFTY BANK')")
            @PathVariable String indexName) {
        
        log.debug("REST: Getting instruments for index: {}", indexName);
        
        try {
            // Validate index name
            if (!indexInstrumentService.isValidIndex(indexName)) {
                log.warn("REST: Invalid index name requested: {}", indexName);
                return ResponseEntity.notFound().build();
            }
            
            List<IndexInstrument> instruments = indexInstrumentService.getInstrumentsByIndex(indexName);
            log.info("REST: Retrieved {} instruments for index: {}", instruments.size(), indexName);
            return ResponseEntity.ok(instruments);
            
        } catch (Exception e) {
            log.error("REST: Failed to retrieve instruments for index: {}", indexName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Retrieves instrument tokens for a specific index.
     * These tokens can be used for Kite API subscriptions.
     * 
     * @param indexName the name of the index
     * @return set of instrument tokens
     */
    @GetMapping("/{indexName}/tokens")
    @Operation(
        summary = "Get instrument tokens by index",
        description = "Returns instrument tokens for all instruments in the specified index"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved instrument tokens")
    @ApiResponse(responseCode = "404", description = "Index not found")
    public ResponseEntity<Set<Long>> getInstrumentTokensByIndex(
            @Parameter(description = "Name of the index")
            @PathVariable String indexName) {
        
        log.debug("REST: Getting instrument tokens for index: {}", indexName);
        
        try {
            // Validate index name
            if (!indexInstrumentService.isValidIndex(indexName)) {
                log.warn("REST: Invalid index name requested: {}", indexName);
                return ResponseEntity.notFound().build();
            }
            
            Set<Long> tokens = indexInstrumentService.getInstrumentTokensByIndex(indexName);
            log.info("REST: Retrieved {} instrument tokens for index: {}", tokens.size(), indexName);
            return ResponseEntity.ok(tokens);
            
        } catch (Exception e) {
            log.error("REST: Failed to retrieve instrument tokens for index: {}", indexName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Retrieves trading symbols for a specific index.
     * 
     * @param indexName the name of the index
     * @return set of trading symbols
     */
    @GetMapping("/{indexName}/symbols")
    @Operation(
        summary = "Get trading symbols by index",
        description = "Returns trading symbols for all instruments in the specified index"
    )
    @ApiResponse(responseCode = "200", description = "Successfully retrieved trading symbols")
    @ApiResponse(responseCode = "404", description = "Index not found")
    public ResponseEntity<Set<String>> getTradingSymbolsByIndex(
            @Parameter(description = "Name of the index")
            @PathVariable String indexName) {
        
        log.debug("REST: Getting trading symbols for index: {}", indexName);
        
        try {
            // Validate index name
            if (!indexInstrumentService.isValidIndex(indexName)) {
                log.warn("REST: Invalid index name requested: {}", indexName);
                return ResponseEntity.notFound().build();
            }
            
            Set<String> symbols = indexInstrumentService.getTradingSymbolsByIndex(indexName);
            log.info("REST: Retrieved {} trading symbols for index: {}", symbols.size(), indexName);
            return ResponseEntity.ok(symbols);
            
        } catch (Exception e) {
            log.error("REST: Failed to retrieve trading symbols for index: {}", indexName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Validates if an index name exists.
     * 
     * @param indexName the name of the index to validate
     * @return validation result
     */
    @GetMapping("/{indexName}/validate")
    @Operation(
        summary = "Validate index name",
        description = "Checks if the specified index name exists in the database"
    )
    @ApiResponse(responseCode = "200", description = "Index validation completed")
    public ResponseEntity<Boolean> validateIndex(
            @Parameter(description = "Name of the index to validate")
            @PathVariable String indexName) {
        
        log.debug("REST: Validating index name: {}", indexName);
        
        try {
            boolean isValid = indexInstrumentService.isValidIndex(indexName);
            log.debug("REST: Index validation for '{}': {}", indexName, isValid);
            return ResponseEntity.ok(isValid);
            
        } catch (Exception e) {
            log.error("REST: Failed to validate index: {}", indexName, e);
            return ResponseEntity.ok(false);
        }
    }
}