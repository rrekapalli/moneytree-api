package com.moneytree.socketengine.kite;

import com.moneytree.socketengine.domain.IndexInstrument;
import com.moneytree.socketengine.persistence.IndexInstrumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for IndexInstrumentService.
 */
@ExtendWith(MockitoExtension.class)
class IndexInstrumentServiceTest {
    
    @Mock
    private IndexInstrumentRepository indexInstrumentRepository;
    
    private IndexInstrumentService indexInstrumentService;
    
    @BeforeEach
    void setUp() {
        indexInstrumentService = new IndexInstrumentService(indexInstrumentRepository);
    }
    
    @Test
    void getInstrumentsByIndex_ShouldReturnInstruments_WhenIndexExists() {
        // Given
        String indexName = "NIFTY 50";
        List<IndexInstrument> expectedInstruments = Arrays.asList(
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "RELIANCE", 738561L),
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "TCS", 2953217L)
        );
        
        when(indexInstrumentRepository.findInstrumentsByIndex(indexName))
            .thenReturn(expectedInstruments);
        
        // When
        List<IndexInstrument> result = indexInstrumentService.getInstrumentsByIndex(indexName);
        
        // Then
        assertThat(result).isEqualTo(expectedInstruments);
        verify(indexInstrumentRepository).findInstrumentsByIndex(indexName);
    }
    
    @Test
    void getInstrumentsByIndex_ShouldThrowException_WhenRepositoryFails() {
        // Given
        String indexName = "NIFTY 50";
        when(indexInstrumentRepository.findInstrumentsByIndex(indexName))
            .thenThrow(new RuntimeException("Database error"));
        
        // When & Then
        assertThatThrownBy(() -> indexInstrumentService.getInstrumentsByIndex(indexName))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Failed to query instruments for index: NIFTY 50");
    }
    
    @Test
    void getInstrumentTokensByIndex_ShouldReturnTokens_WhenIndexExists() {
        // Given
        String indexName = "NIFTY 50";
        List<IndexInstrument> instruments = Arrays.asList(
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "RELIANCE", 738561L),
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "TCS", 2953217L)
        );
        
        when(indexInstrumentRepository.findInstrumentsByIndex(indexName))
            .thenReturn(instruments);
        
        // When
        Set<Long> result = indexInstrumentService.getInstrumentTokensByIndex(indexName);
        
        // Then
        assertThat(result).containsExactlyInAnyOrder(738561L, 2953217L);
    }
    
    @Test
    void getTradingSymbolsByIndex_ShouldReturnSymbols_WhenIndexExists() {
        // Given
        String indexName = "NIFTY 50";
        List<IndexInstrument> instruments = Arrays.asList(
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "RELIANCE", 738561L),
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "TCS", 2953217L)
        );
        
        when(indexInstrumentRepository.findInstrumentsByIndex(indexName))
            .thenReturn(instruments);
        
        // When
        Set<String> result = indexInstrumentService.getTradingSymbolsByIndex(indexName);
        
        // Then
        assertThat(result).containsExactlyInAnyOrder("RELIANCE", "TCS");
    }
    
    @Test
    void getAllIndexNames_ShouldReturnAllIndices() {
        // Given
        List<String> expectedIndices = Arrays.asList("NIFTY 50", "NIFTY BANK", "NIFTY IT");
        when(indexInstrumentRepository.findAllIndexNames()).thenReturn(expectedIndices);
        
        // When
        List<String> result = indexInstrumentService.getAllIndexNames();
        
        // Then
        assertThat(result).isEqualTo(expectedIndices);
        verify(indexInstrumentRepository).findAllIndexNames();
    }
    
    @Test
    void getAllIndexNames_ShouldThrowException_WhenRepositoryFails() {
        // Given
        when(indexInstrumentRepository.findAllIndexNames())
            .thenThrow(new RuntimeException("Database error"));
        
        // When & Then
        assertThatThrownBy(() -> indexInstrumentService.getAllIndexNames())
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Failed to query available index names");
    }
    
    @Test
    void isValidIndex_ShouldReturnTrue_WhenIndexExists() {
        // Given
        String indexName = "NIFTY 50";
        List<String> allIndices = Arrays.asList("NIFTY 50", "NIFTY BANK", "NIFTY IT");
        when(indexInstrumentRepository.findAllIndexNames()).thenReturn(allIndices);
        
        // When
        boolean result = indexInstrumentService.isValidIndex(indexName);
        
        // Then
        assertThat(result).isTrue();
    }
    
    @Test
    void isValidIndex_ShouldReturnFalse_WhenIndexDoesNotExist() {
        // Given
        String indexName = "INVALID INDEX";
        List<String> allIndices = Arrays.asList("NIFTY 50", "NIFTY BANK", "NIFTY IT");
        when(indexInstrumentRepository.findAllIndexNames()).thenReturn(allIndices);
        
        // When
        boolean result = indexInstrumentService.isValidIndex(indexName);
        
        // Then
        assertThat(result).isFalse();
    }
    
    @Test
    void isValidIndex_ShouldReturnFalse_WhenIndexNameIsNull() {
        // When
        boolean result = indexInstrumentService.isValidIndex(null);
        
        // Then
        assertThat(result).isFalse();
        verifyNoInteractions(indexInstrumentRepository);
    }
    
    @Test
    void isValidIndex_ShouldReturnFalse_WhenIndexNameIsEmpty() {
        // When
        boolean result = indexInstrumentService.isValidIndex("   ");
        
        // Then
        assertThat(result).isFalse();
        verifyNoInteractions(indexInstrumentRepository);
    }
    
    @Test
    void isValidIndex_ShouldReturnFalse_WhenRepositoryFails() {
        // Given
        String indexName = "NIFTY 50";
        when(indexInstrumentRepository.findAllIndexNames())
            .thenThrow(new RuntimeException("Database error"));
        
        // When
        boolean result = indexInstrumentService.isValidIndex(indexName);
        
        // Then
        assertThat(result).isFalse();
    }
    
    @Test
    void getInstrumentCount_ShouldReturnCorrectCount() {
        // Given
        String indexName = "NIFTY 50";
        List<IndexInstrument> instruments = Arrays.asList(
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "RELIANCE", 738561L),
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "TCS", 2953217L),
            new IndexInstrument("NSE", "NSE", "EQ", "NIFTY 50", "HDFC", 341249L)
        );
        
        when(indexInstrumentRepository.findInstrumentsByIndex(indexName))
            .thenReturn(instruments);
        
        // When
        int result = indexInstrumentService.getInstrumentCount(indexName);
        
        // Then
        assertThat(result).isEqualTo(3);
    }
}