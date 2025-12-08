package com.moneytree.socketengine.persistence;

import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.kite.InstrumentLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Unit tests for TickBatchBuffer.
 * Tests buffering logic, thread safety, and buffer draining.
 */
@ExtendWith(MockitoExtension.class)
class TickBatchBufferTest {

    @Mock
    private InstrumentLoader instrumentLoader;

    private TickBatchBuffer buffer;

    @BeforeEach
    void setUp() {
        buffer = new TickBatchBuffer(instrumentLoader);
    }

    @Test
    void shouldAddTickToBuffer() {
        // Given: A tick event
        Tick tick = createSampleTick("NIFTY 50", 256265L);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // Mock instrument loader to return instrument info
        InstrumentInfo info = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info);

        // When: Adding tick to buffer
        buffer.onTickReceived(event);

        // Then: Buffer size should be 1
        assertThat(buffer.getBufferSize()).isEqualTo(1);
    }

    @Test
    void shouldIncrementBufferSizeCorrectly() {
        // Given: Multiple tick events
        InstrumentInfo info1 = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        InstrumentInfo info2 = createInstrumentInfo(738561L, "RELIANCE", InstrumentType.STOCK);
        InstrumentInfo info3 = createInstrumentInfo(408065L, "INFY", InstrumentType.STOCK);
        
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info1);
        when(instrumentLoader.getInstrumentInfo(738561L)).thenReturn(info2);
        when(instrumentLoader.getInstrumentInfo(408065L)).thenReturn(info3);

        // When: Adding multiple ticks
        buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        buffer.onTickReceived(new TickReceivedEvent(createSampleTick("RELIANCE", 738561L)));
        buffer.onTickReceived(new TickReceivedEvent(createSampleTick("INFY", 408065L)));

        // Then: Buffer size should be 3
        assertThat(buffer.getBufferSize()).isEqualTo(3);
    }

    @Test
    void shouldDrainBufferAndResetCounter() {
        // Given: Buffer with multiple ticks
        InstrumentInfo info = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info);
        
        for (int i = 0; i < 5; i++) {
            buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        }
        
        assertThat(buffer.getBufferSize()).isEqualTo(5);

        // When: Draining the buffer
        List<TickEntity> drained = buffer.drainBuffer();

        // Then: Should return all buffered ticks
        assertThat(drained).hasSize(5);
        
        // And: Buffer size should be reset to 0
        assertThat(buffer.getBufferSize()).isEqualTo(0);
        
        // And: All entities should have correct data
        assertThat(drained).allMatch(entity -> 
            entity.getInstrumentToken() == 256265L &&
            entity.getTradingSymbol().equals("NIFTY 50") &&
            entity.getExchange().equals("NSE") &&
            entity.getRawTickData() != null
        );
    }

    @Test
    void shouldReturnEmptyListWhenDrainingEmptyBuffer() {
        // Given: Empty buffer
        assertThat(buffer.getBufferSize()).isEqualTo(0);

        // When: Draining the buffer
        List<TickEntity> drained = buffer.drainBuffer();

        // Then: Should return empty list
        assertThat(drained).isEmpty();
        assertThat(buffer.getBufferSize()).isEqualTo(0);
    }

    @Test
    void shouldHandleNullInstrumentInfo() {
        // Given: Tick with unknown instrument token
        Tick tick = createSampleTick("UNKNOWN", 999999L);
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // Mock instrument loader to return null (unknown instrument)
        when(instrumentLoader.getInstrumentInfo(999999L)).thenReturn(null);

        // When: Adding tick to buffer
        buffer.onTickReceived(event);

        // Then: Should still buffer the tick with fallback values
        assertThat(buffer.getBufferSize()).isEqualTo(1);
        
        List<TickEntity> drained = buffer.drainBuffer();
        assertThat(drained).hasSize(1);
        
        TickEntity entity = drained.get(0);
        assertThat(entity.getTradingSymbol()).isEqualTo("UNKNOWN");  // Fallback to tick symbol
        assertThat(entity.getExchange()).isEqualTo("NSE");  // Fallback to NSE
    }

    @Test
    void shouldBeThreadSafeWithConcurrentAdditions() throws InterruptedException {
        // Given: Multiple threads adding ticks concurrently
        int threadCount = 10;
        int ticksPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        
        InstrumentInfo info = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info);

        // When: Multiple threads add ticks concurrently
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < ticksPerThread; j++) {
                        Tick tick = createSampleTick("NIFTY 50", 256265L);
                        buffer.onTickReceived(new TickReceivedEvent(tick));
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Buffer size should be exactly threadCount * ticksPerThread
        assertThat(buffer.getBufferSize()).isEqualTo(threadCount * ticksPerThread);
        
        // And: Draining should return all ticks
        List<TickEntity> drained = buffer.drainBuffer();
        assertThat(drained).hasSize(threadCount * ticksPerThread);
        assertThat(buffer.getBufferSize()).isEqualTo(0);
    }

    @Test
    void shouldHandleConcurrentDrainOperations() throws InterruptedException {
        // Given: Buffer with ticks
        InstrumentInfo info = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info);
        
        // Add 1000 ticks
        for (int i = 0; i < 1000; i++) {
            buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        }
        
        assertThat(buffer.getBufferSize()).isEqualTo(1000);

        // When: Multiple threads drain concurrently
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<List<TickEntity>> allDrained = new java.util.concurrent.CopyOnWriteArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    List<TickEntity> drained = buffer.drainBuffer();
                    allDrained.add(drained);
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Total drained entities should equal original buffer size
        int totalDrained = allDrained.stream().mapToInt(List::size).sum();
        assertThat(totalDrained).isEqualTo(1000);
        
        // And: Buffer should be empty
        assertThat(buffer.getBufferSize()).isEqualTo(0);
        
        // And: No entity should be duplicated across drain operations
        long uniqueEntities = allDrained.stream()
            .flatMap(List::stream)
            .distinct()
            .count();
        assertThat(uniqueEntities).isEqualTo(1000);
    }

    @Test
    void shouldPreserveRawBinaryData() {
        // Given: Tick with specific raw binary data
        byte[] rawData = new byte[]{0x01, 0x02, 0x03, 0x04, 0x05};
        Tick tick = Tick.builder()
            .symbol("RELIANCE")
            .instrumentToken(738561L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(2500.50)
            .volume(1000000L)
            .ohlc(Tick.OHLC.builder()
                .open(2480.0)
                .high(2520.0)
                .low(2475.0)
                .close(2500.0)
                .build())
            .rawBinaryData(rawData)
            .build();
        
        InstrumentInfo info = createInstrumentInfo(738561L, "RELIANCE", InstrumentType.STOCK);
        when(instrumentLoader.getInstrumentInfo(738561L)).thenReturn(info);

        // When: Buffering the tick
        buffer.onTickReceived(new TickReceivedEvent(tick));
        List<TickEntity> drained = buffer.drainBuffer();

        // Then: Raw binary data should be preserved
        assertThat(drained).hasSize(1);
        assertThat(drained.get(0).getRawTickData()).isEqualTo(rawData);
    }

    @Test
    void shouldHandleMultipleDrainCycles() {
        // Given: Buffer that goes through multiple drain cycles
        InstrumentInfo info = createInstrumentInfo(256265L, "NIFTY 50", InstrumentType.INDEX);
        when(instrumentLoader.getInstrumentInfo(256265L)).thenReturn(info);

        // Cycle 1: Add 10 ticks, drain
        for (int i = 0; i < 10; i++) {
            buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        }
        List<TickEntity> batch1 = buffer.drainBuffer();
        assertThat(batch1).hasSize(10);
        assertThat(buffer.getBufferSize()).isEqualTo(0);

        // Cycle 2: Add 20 ticks, drain
        for (int i = 0; i < 20; i++) {
            buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        }
        List<TickEntity> batch2 = buffer.drainBuffer();
        assertThat(batch2).hasSize(20);
        assertThat(buffer.getBufferSize()).isEqualTo(0);

        // Cycle 3: Add 5 ticks, drain
        for (int i = 0; i < 5; i++) {
            buffer.onTickReceived(new TickReceivedEvent(createSampleTick("NIFTY 50", 256265L)));
        }
        List<TickEntity> batch3 = buffer.drainBuffer();
        assertThat(batch3).hasSize(5);
        assertThat(buffer.getBufferSize()).isEqualTo(0);
    }

    @Test
    void shouldStoreCorrectTimestamp() {
        // Given: Tick with specific timestamp
        Instant timestamp = Instant.parse("2025-12-08T10:15:30.123Z");
        Tick tick = Tick.builder()
            .symbol("INFY")
            .instrumentToken(408065L)
            .type(InstrumentType.STOCK)
            .timestamp(timestamp)
            .lastTradedPrice(1500.75)
            .volume(500000L)
            .ohlc(Tick.OHLC.builder()
                .open(1490.0)
                .high(1510.0)
                .low(1485.0)
                .close(1500.0)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02})
            .build();
        
        InstrumentInfo info = createInstrumentInfo(408065L, "INFY", InstrumentType.STOCK);
        when(instrumentLoader.getInstrumentInfo(408065L)).thenReturn(info);

        // When: Buffering the tick
        buffer.onTickReceived(new TickReceivedEvent(tick));
        List<TickEntity> drained = buffer.drainBuffer();

        // Then: Timestamp should be preserved
        assertThat(drained).hasSize(1);
        assertThat(drained.get(0).getTickTimestamp()).isEqualTo(timestamp);
    }

    // Helper methods

    private Tick createSampleTick(String symbol, long instrumentToken) {
        return Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(InstrumentType.INDEX)
            .timestamp(Instant.now())
            .lastTradedPrice(23754.25)
            .volume(1234567L)
            .ohlc(Tick.OHLC.builder()
                .open(23450.0)
                .high(23800.0)
                .low(23320.0)
                .close(23500.0)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
    }

    private InstrumentInfo createInstrumentInfo(long instrumentToken, String tradingSymbol, InstrumentType type) {
        return InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .exchangeToken(instrumentToken / 256)
            .tradingSymbol(tradingSymbol)
            .type(type)
            .build();
    }
}
