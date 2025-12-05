package com.moneytree.api;

import com.moneytree.api.dto.InstrumentDto;
import com.moneytree.marketdata.kite.KiteMarketDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for InstrumentFilterController.
 * Tests each endpoint with various scenarios including success and error cases.
 */
class InstrumentFilterControllerTest {

    private static final Logger log = LoggerFactory.getLogger(InstrumentFilterControllerTest.class);

    @Mock
    private KiteMarketDataRepository repository;

    @InjectMocks
    private InstrumentFilterController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ==================== Distinct Exchanges Tests ====================

    @Test
    @DisplayName("getDistinctExchanges should return non-empty list when data exists")
    void testGetDistinctExchanges_Success() {
        // Arrange
        List<String> mockExchanges = Arrays.asList("BSE", "MCX", "NSE");
        when(repository.getDistinctExchanges()).thenReturn(mockExchanges);

        // Act
        ResponseEntity<?> response = controller.getDistinctExchanges();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<String> exchanges = (List<String>) response.getBody();
        assertEquals(3, exchanges.size());
        assertTrue(exchanges.contains("NSE"));
        assertTrue(exchanges.contains("BSE"));
        assertTrue(exchanges.contains("MCX"));
        
        verify(repository, times(1)).getDistinctExchanges();
        log.info("✓ getDistinctExchanges returned {} exchanges", exchanges.size());
    }

    @Test
    @DisplayName("getDistinctExchanges should return HTTP 500 on database failure")
    void testGetDistinctExchanges_DatabaseError() {
        // Arrange
        when(repository.getDistinctExchanges()).thenThrow(new RuntimeException("Database connection failed"));

        // Act
        ResponseEntity<?> response = controller.getDistinctExchanges();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> errorBody = (Map<String, Object>) response.getBody();
        assertTrue(errorBody.containsKey("error"));
        assertEquals("Failed to fetch distinct exchanges", errorBody.get("error"));
        
        verify(repository, times(1)).getDistinctExchanges();
        log.info("✓ getDistinctExchanges correctly returned 500 on database error");
    }

    // ==================== Distinct Indices Tests ====================

    @Test
    @DisplayName("getDistinctIndices should return non-empty list when data exists")
    void testGetDistinctIndices_Success() {
        // Arrange
        List<String> mockIndices = Arrays.asList("NIFTY 50", "NIFTY BANK", "NIFTY MIDCAP 50");
        when(repository.getDistinctIndices()).thenReturn(mockIndices);

        // Act
        ResponseEntity<?> response = controller.getDistinctIndices();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<String> indices = (List<String>) response.getBody();
        assertEquals(3, indices.size());
        assertTrue(indices.contains("NIFTY 50"));
        assertTrue(indices.contains("NIFTY BANK"));
        
        verify(repository, times(1)).getDistinctIndices();
        log.info("✓ getDistinctIndices returned {} indices", indices.size());
    }

    @Test
    @DisplayName("getDistinctIndices should return HTTP 500 on database failure")
    void testGetDistinctIndices_DatabaseError() {
        // Arrange
        when(repository.getDistinctIndices()).thenThrow(new RuntimeException("Database connection failed"));

        // Act
        ResponseEntity<?> response = controller.getDistinctIndices();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> errorBody = (Map<String, Object>) response.getBody();
        assertTrue(errorBody.containsKey("error"));
        assertEquals("Failed to fetch distinct indices", errorBody.get("error"));
        
        verify(repository, times(1)).getDistinctIndices();
        log.info("✓ getDistinctIndices correctly returned 500 on database error");
    }

    // ==================== Distinct Segments Tests ====================

    @Test
    @DisplayName("getDistinctSegments should return non-empty list when data exists")
    void testGetDistinctSegments_Success() {
        // Arrange
        List<String> mockSegments = Arrays.asList("EQ", "FO", "INDICES");
        when(repository.getDistinctSegments()).thenReturn(mockSegments);

        // Act
        ResponseEntity<?> response = controller.getDistinctSegments();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<String> segments = (List<String>) response.getBody();
        assertEquals(3, segments.size());
        assertTrue(segments.contains("EQ"));
        assertTrue(segments.contains("FO"));
        assertTrue(segments.contains("INDICES"));
        
        verify(repository, times(1)).getDistinctSegments();
        log.info("✓ getDistinctSegments returned {} segments", segments.size());
    }

    @Test
    @DisplayName("getDistinctSegments should return HTTP 500 on database failure")
    void testGetDistinctSegments_DatabaseError() {
        // Arrange
        when(repository.getDistinctSegments()).thenThrow(new RuntimeException("Database connection failed"));

        // Act
        ResponseEntity<?> response = controller.getDistinctSegments();

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> errorBody = (Map<String, Object>) response.getBody();
        assertTrue(errorBody.containsKey("error"));
        assertEquals("Failed to fetch distinct segments", errorBody.get("error"));
        
        verify(repository, times(1)).getDistinctSegments();
        log.info("✓ getDistinctSegments correctly returned 500 on database error");
    }

    // ==================== Filtered Instruments Tests ====================

    @Test
    @DisplayName("getFilteredInstruments should return instruments with single filter (exchange)")
    void testGetFilteredInstruments_SingleFilter_Exchange() {
        // Arrange
        List<Map<String, Object>> mockData = createMockInstrumentData();
        when(repository.getFilteredInstruments(eq("NSE"), isNull(), isNull())).thenReturn(mockData);

        // Act
        ResponseEntity<?> response = controller.getFilteredInstruments("NSE", null, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<InstrumentDto> instruments = (List<InstrumentDto>) response.getBody();
        assertEquals(2, instruments.size());
        assertEquals("RELIANCE", instruments.get(0).getTradingsymbol());
        
        verify(repository, times(1)).getFilteredInstruments("NSE", null, null);
        log.info("✓ getFilteredInstruments with exchange filter returned {} instruments", instruments.size());
    }

    @Test
    @DisplayName("getFilteredInstruments should return instruments with multiple filters")
    void testGetFilteredInstruments_MultipleFilters() {
        // Arrange
        List<Map<String, Object>> mockData = createMockInstrumentData();
        when(repository.getFilteredInstruments(eq("NSE"), eq("NIFTY 50"), eq("EQ"))).thenReturn(mockData);

        // Act
        ResponseEntity<?> response = controller.getFilteredInstruments("NSE", "NIFTY 50", "EQ");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<InstrumentDto> instruments = (List<InstrumentDto>) response.getBody();
        assertEquals(2, instruments.size());
        
        verify(repository, times(1)).getFilteredInstruments("NSE", "NIFTY 50", "EQ");
        log.info("✓ getFilteredInstruments with all filters returned {} instruments", instruments.size());
    }

    @Test
    @DisplayName("getFilteredInstruments should return empty list when no matches")
    void testGetFilteredInstruments_NoMatches() {
        // Arrange
        when(repository.getFilteredInstruments(anyString(), anyString(), anyString())).thenReturn(List.of());

        // Act
        ResponseEntity<?> response = controller.getFilteredInstruments("BSE", "SENSEX", "FO");

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof List);
        
        @SuppressWarnings("unchecked")
        List<InstrumentDto> instruments = (List<InstrumentDto>) response.getBody();
        assertTrue(instruments.isEmpty());
        
        verify(repository, times(1)).getFilteredInstruments("BSE", "SENSEX", "FO");
        log.info("✓ getFilteredInstruments correctly returned empty list when no matches");
    }

    @Test
    @DisplayName("getFilteredInstruments should return HTTP 500 on database failure")
    void testGetFilteredInstruments_DatabaseError() {
        // Arrange
        when(repository.getFilteredInstruments(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Database connection failed"));

        // Act
        ResponseEntity<?> response = controller.getFilteredInstruments("NSE", "NIFTY 50", "EQ");

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof Map);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> errorBody = (Map<String, Object>) response.getBody();
        assertTrue(errorBody.containsKey("error"));
        assertEquals("Failed to fetch filtered instruments", errorBody.get("error"));
        
        verify(repository, times(1)).getFilteredInstruments("NSE", "NIFTY 50", "EQ");
        log.info("✓ getFilteredInstruments correctly returned 500 on database error");
    }

    @Test
    @DisplayName("getFilteredInstruments should handle null filters correctly")
    void testGetFilteredInstruments_NullFilters() {
        // Arrange
        List<Map<String, Object>> mockData = createMockInstrumentData();
        when(repository.getFilteredInstruments(isNull(), isNull(), isNull())).thenReturn(mockData);

        // Act
        ResponseEntity<?> response = controller.getFilteredInstruments(null, null, null);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        verify(repository, times(1)).getFilteredInstruments(null, null, null);
        log.info("✓ getFilteredInstruments correctly handled null filters");
    }

    // ==================== Helper Methods ====================

    /**
     * Create mock instrument data for testing.
     */
    private List<Map<String, Object>> createMockInstrumentData() {
        Map<String, Object> instrument1 = new HashMap<>();
        instrument1.put("instrument_token", "738561");
        instrument1.put("tradingsymbol", "RELIANCE");
        instrument1.put("name", "Reliance Industries Ltd");
        instrument1.put("segment", "EQ");
        instrument1.put("exchange", "NSE");
        instrument1.put("instrument_type", "EQ");
        instrument1.put("last_price", 2450.50);
        instrument1.put("lot_size", 1);
        instrument1.put("tick_size", 0.05);

        Map<String, Object> instrument2 = new HashMap<>();
        instrument2.put("instrument_token", "2953217");
        instrument2.put("tradingsymbol", "TCS");
        instrument2.put("name", "Tata Consultancy Services Ltd");
        instrument2.put("segment", "EQ");
        instrument2.put("exchange", "NSE");
        instrument2.put("instrument_type", "EQ");
        instrument2.put("last_price", 3650.75);
        instrument2.put("lot_size", 1);
        instrument2.put("tick_size", 0.05);

        return Arrays.asList(instrument1, instrument2);
    }
}
