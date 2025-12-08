package com.moneytree.socketengine.persistence;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for TickRepository using Testcontainers with TimescaleDB.
 * Tests verify that tick data can be persisted and queried correctly,
 * and that raw binary data is preserved.
 */
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TickRepositoryIntegrationTest {
    
    /**
     * TimescaleDB container (uses PostgreSQL image with TimescaleDB extension)
     * Note: For full TimescaleDB features, use timescale/timescaledb:latest-pg16
     * For basic testing, PostgreSQL is sufficient as JPA queries work the same
     */
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }
    
    @Autowired
    private TickRepository tickRepository;
    
    private Instant baseTime;
    private byte[] sampleBinaryData;
    
    @BeforeEach
    void setUp() {
        tickRepository.deleteAll();
        baseTime = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        sampleBinaryData = new byte[]{0x01, 0x02, 0x03, 0x04, 0x05};
    }
    
    @Test
    void shouldSaveAndRetrieveTickEntity() {
        // Given
        TickEntity tick = TickEntity.builder()
                .instrumentToken(256265L)
                .tradingSymbol("NIFTY 50")
                .exchange("NSE")
                .tickTimestamp(baseTime)
                .rawTickData(sampleBinaryData)
                .build();
        
        // When
        TickEntity saved = tickRepository.save(tick);
        
        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getInstrumentToken()).isEqualTo(256265L);
        assertThat(saved.getTradingSymbol()).isEqualTo("NIFTY 50");
        assertThat(saved.getExchange()).isEqualTo("NSE");
        assertThat(saved.getTickTimestamp()).isEqualTo(baseTime);
        assertThat(saved.getRawTickData()).isEqualTo(sampleBinaryData);
    }
    
    @Test
    void shouldPreserveRawBinaryData() {
        // Given - Create tick with specific binary pattern
        byte[] binaryData = new byte[]{
            (byte) 0xFF, (byte) 0xAA, 0x55, 0x00, 
            0x12, 0x34, 0x56, 0x78, 
            (byte) 0x9A, (byte) 0xBC, (byte) 0xDE, (byte) 0xF0
        };
        
        TickEntity tick = TickEntity.builder()
                .instrumentToken(738561L)
                .tradingSymbol("RELIANCE")
                .exchange("NSE")
                .tickTimestamp(baseTime)
                .rawTickData(binaryData)
                .build();
        
        // When
        tickRepository.save(tick);
        tickRepository.flush();
        
        // Retrieve from database
        TickEntityId id = new TickEntityId(738561L, baseTime);
        TickEntity retrieved = tickRepository.findById(id).orElseThrow();
        
        // Then - Binary data should be exactly preserved
        assertThat(retrieved.getRawTickData()).isEqualTo(binaryData);
        assertThat(retrieved.getRawTickData()).hasSize(12);
        assertThat(retrieved.getRawTickData()[0]).isEqualTo((byte) 0xFF);
        assertThat(retrieved.getRawTickData()[11]).isEqualTo((byte) 0xF0);
    }
    
    @Test
    void shouldFindByTradingSymbolAndTimestampBetween() {
        // Given - Create multiple ticks for same symbol at different times
        String symbol = "NIFTY 50";
        TickEntity tick1 = createTick(256265L, symbol, "NSE", baseTime.minus(2, ChronoUnit.HOURS));
        TickEntity tick2 = createTick(256265L, symbol, "NSE", baseTime.minus(1, ChronoUnit.HOURS));
        TickEntity tick3 = createTick(256265L, symbol, "NSE", baseTime);
        TickEntity tick4 = createTick(256265L, symbol, "NSE", baseTime.plus(1, ChronoUnit.HOURS));
        
        tickRepository.saveAll(List.of(tick1, tick2, tick3, tick4));
        
        // When - Query for ticks in a specific time range
        Instant startTime = baseTime.minus(90, ChronoUnit.MINUTES);
        Instant endTime = baseTime.plus(30, ChronoUnit.MINUTES);
        
        List<TickEntity> results = tickRepository.findByTradingSymbolAndTimestampBetween(
                symbol, startTime, endTime);
        
        // Then - Should return only ticks within the time range
        assertThat(results).hasSize(2);
        assertThat(results).extracting(TickEntity::getTickTimestamp)
                .containsExactly(
                        baseTime.minus(1, ChronoUnit.HOURS),
                        baseTime
                );
    }
    
    @Test
    void shouldFindByInstrumentTokenAndTimestampBetween() {
        // Given - Create ticks for different instruments
        Long niftyToken = 256265L;
        Long bankNiftyToken = 260105L;
        
        TickEntity niftyTick1 = createTick(niftyToken, "NIFTY 50", "NSE", baseTime);
        TickEntity niftyTick2 = createTick(niftyToken, "NIFTY 50", "NSE", baseTime.plus(1, ChronoUnit.MINUTES));
        TickEntity bankNiftyTick = createTick(bankNiftyToken, "NIFTY BANK", "NSE", baseTime);
        
        tickRepository.saveAll(List.of(niftyTick1, niftyTick2, bankNiftyTick));
        
        // When - Query for specific instrument token
        List<TickEntity> results = tickRepository.findByInstrumentTokenAndTimestampBetween(
                niftyToken,
                baseTime.minus(1, ChronoUnit.MINUTES),
                baseTime.plus(2, ChronoUnit.MINUTES)
        );
        
        // Then - Should return only ticks for that instrument
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(tick -> tick.getInstrumentToken().equals(niftyToken));
        assertThat(results).extracting(TickEntity::getTradingSymbol)
                .containsOnly("NIFTY 50");
    }
    
    @Test
    void shouldFindByExchangeAndTimestampBetween() {
        // Given - Create ticks for different exchanges
        TickEntity nseTick1 = createTick(256265L, "NIFTY 50", "NSE", baseTime);
        TickEntity nseTick2 = createTick(738561L, "RELIANCE", "NSE", baseTime.plus(1, ChronoUnit.MINUTES));
        TickEntity bseTick = createTick(500325L, "RELIANCE", "BSE", baseTime);
        
        tickRepository.saveAll(List.of(nseTick1, nseTick2, bseTick));
        
        // When - Query for specific exchange
        List<TickEntity> results = tickRepository.findByExchangeAndTimestampBetween(
                "NSE",
                baseTime.minus(1, ChronoUnit.MINUTES),
                baseTime.plus(2, ChronoUnit.MINUTES)
        );
        
        // Then - Should return only ticks from that exchange
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(tick -> tick.getExchange().equals("NSE"));
    }
    
    @Test
    void shouldFindByTimestampBetween() {
        // Given - Create ticks at different times
        TickEntity oldTick = createTick(256265L, "NIFTY 50", "NSE", baseTime.minus(2, ChronoUnit.HOURS));
        TickEntity recentTick1 = createTick(260105L, "NIFTY BANK", "NSE", baseTime);
        TickEntity recentTick2 = createTick(738561L, "RELIANCE", "NSE", baseTime.plus(30, ChronoUnit.MINUTES));
        TickEntity futureTick = createTick(408065L, "INFY", "NSE", baseTime.plus(2, ChronoUnit.HOURS));
        
        tickRepository.saveAll(List.of(oldTick, recentTick1, recentTick2, futureTick));
        
        // When - Query for all ticks in a time range
        List<TickEntity> results = tickRepository.findByTimestampBetween(
                baseTime.minus(10, ChronoUnit.MINUTES),
                baseTime.plus(1, ChronoUnit.HOURS)
        );
        
        // Then - Should return all ticks within the range
        assertThat(results).hasSize(2);
        assertThat(results).extracting(TickEntity::getTradingSymbol)
                .containsExactlyInAnyOrder("NIFTY BANK", "RELIANCE");
    }
    
    @Test
    void shouldReturnEmptyListWhenNoTicksInRange() {
        // Given - Create tick outside query range
        TickEntity tick = createTick(256265L, "NIFTY 50", "NSE", baseTime);
        tickRepository.save(tick);
        
        // When - Query for different time range
        List<TickEntity> results = tickRepository.findByTradingSymbolAndTimestampBetween(
                "NIFTY 50",
                baseTime.plus(1, ChronoUnit.HOURS),
                baseTime.plus(2, ChronoUnit.HOURS)
        );
        
        // Then - Should return empty list
        assertThat(results).isEmpty();
    }
    
    @Test
    void shouldHandleMultipleTicksWithSameInstrumentTokenButDifferentTimestamps() {
        // Given - Create multiple ticks for same instrument at different times
        Long token = 256265L;
        TickEntity tick1 = createTick(token, "NIFTY 50", "NSE", baseTime);
        TickEntity tick2 = createTick(token, "NIFTY 50", "NSE", baseTime.plus(1, ChronoUnit.SECONDS));
        TickEntity tick3 = createTick(token, "NIFTY 50", "NSE", baseTime.plus(2, ChronoUnit.SECONDS));
        
        // When
        tickRepository.saveAll(List.of(tick1, tick2, tick3));
        
        // Then - All should be saved with unique composite keys
        assertThat(tickRepository.count()).isEqualTo(3);
        
        // And - Should be retrievable individually
        assertThat(tickRepository.findById(new TickEntityId(token, baseTime))).isPresent();
        assertThat(tickRepository.findById(new TickEntityId(token, baseTime.plus(1, ChronoUnit.SECONDS)))).isPresent();
        assertThat(tickRepository.findById(new TickEntityId(token, baseTime.plus(2, ChronoUnit.SECONDS)))).isPresent();
    }
    
    /**
     * Helper method to create a TickEntity with test data
     */
    private TickEntity createTick(Long instrumentToken, String symbol, String exchange, Instant timestamp) {
        return TickEntity.builder()
                .instrumentToken(instrumentToken)
                .tradingSymbol(symbol)
                .exchange(exchange)
                .tickTimestamp(timestamp)
                .rawTickData(sampleBinaryData)
                .build();
    }
}
