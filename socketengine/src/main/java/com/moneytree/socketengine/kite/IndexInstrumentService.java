package com.moneytree.socketengine.kite;

import com.moneytree.socketengine.domain.IndexInstrument;
import com.moneytree.socketengine.persistence.IndexInstrumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing index-specific instrument subscriptions.
 * Provides methods to query instruments by index and manage Kite WebSocket subscriptions.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class IndexInstrumentService {
    
    private final IndexInstrumentRepository indexInstrumentRepository;
    
    /**
     * Retrieves all instruments that belong to a specific index.
     * Results are cached to improve performance since index composition doesn't change frequently.
     * 
     * @param indexName the name of the index (e.g., "NIFTY 50", "NIFTY BANK")
     * @return list of instruments in the index
     */
    @Cacheable(value = "indexInstruments", key = "#indexName")
    public List<IndexInstrument> getInstrumentsByIndex(String indexName) {
        log.debug("Querying instruments for index: {}", indexName);
        
        try {
            List<IndexInstrument> instruments = indexInstrumentRepository.findInstrumentsByIndex(indexName);
            log.info("Found {} instruments for index: {}", instruments.size(), indexName);
            return instruments;
        } catch (Exception e) {
            log.error("Failed to query instruments for index: {}", indexName, e);
            throw new RuntimeException("Failed to query instruments for index: " + indexName, e);
        }
    }
    
    /**
     * Retrieves instrument tokens for all instruments in a specific index.
     * These tokens are used for Kite WebSocket subscriptions.
     * 
     * @param indexName the name of the index
     * @return set of instrument tokens
     */
    @Cacheable(value = "indexInstrumentTokens", key = "#indexName")
    public Set<Long> getInstrumentTokensByIndex(String indexName) {
        log.debug("Getting instrument tokens for index: {}", indexName);
        
        List<IndexInstrument> instruments = getInstrumentsByIndex(indexName);
        Set<Long> tokens = instruments.stream()
            .map(IndexInstrument::getInstrumentToken)
            .collect(Collectors.toSet());
        
        log.debug("Retrieved {} instrument tokens for index: {}", tokens.size(), indexName);
        return tokens;
    }
    
    /**
     * Retrieves trading symbols for all instruments in a specific index.
     * These symbols are used for client-side display and filtering.
     * 
     * @param indexName the name of the index
     * @return set of trading symbols
     */
    @Cacheable(value = "indexTradingSymbols", key = "#indexName")
    public Set<String> getTradingSymbolsByIndex(String indexName) {
        log.debug("Getting trading symbols for index: {}", indexName);
        
        List<IndexInstrument> instruments = getInstrumentsByIndex(indexName);
        Set<String> symbols = instruments.stream()
            .map(IndexInstrument::getTradingSymbol)
            .collect(Collectors.toSet());
        
        log.debug("Retrieved {} trading symbols for index: {}", symbols.size(), indexName);
        return symbols;
    }
    
    /**
     * Retrieves all available index names.
     * This can be used for validation and to provide a list of supported indices.
     * 
     * @return list of all available index names
     */
    @Cacheable(value = "allIndexNames")
    public List<String> getAllIndexNames() {
        log.debug("Querying all available index names");
        
        try {
            List<String> indexNames = indexInstrumentRepository.findAllIndexNames();
            log.info("Found {} available indices", indexNames.size());
            return indexNames;
        } catch (Exception e) {
            log.error("Failed to query available index names", e);
            throw new RuntimeException("Failed to query available index names", e);
        }
    }
    
    /**
     * Validates if an index name exists in the database.
     * 
     * @param indexName the index name to validate
     * @return true if the index exists, false otherwise
     */
    public boolean isValidIndex(String indexName) {
        if (indexName == null || indexName.trim().isEmpty()) {
            return false;
        }
        
        try {
            List<String> allIndices = getAllIndexNames();
            boolean isValid = allIndices.contains(indexName.trim());
            log.debug("Index validation for '{}': {}", indexName, isValid);
            return isValid;
        } catch (Exception e) {
            log.error("Failed to validate index: {}", indexName, e);
            return false;
        }
    }
    
    /**
     * Gets the count of instruments in a specific index.
     * Useful for logging and monitoring purposes.
     * 
     * @param indexName the name of the index
     * @return number of instruments in the index
     */
    public int getInstrumentCount(String indexName) {
        return getInstrumentsByIndex(indexName).size();
    }
}