package com.moneytree.socketengine.domain;

import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for Tick domain model and related classes
 */
class TickTest {
    
    @Test
    void shouldCreateTickWithBuilder() {
        // Given: Tick data
        String symbol = "NIFTY 50";
        long instrumentToken = 256265L;
        InstrumentType type = InstrumentType.INDEX;
        Instant timestamp = Instant.now();
        double lastTradedPrice = 23754.25;
        long volume = 1234567L;
        byte[] rawBinaryData = new byte[]{0x01, 0x02, 0x03, 0x04};
        
        Tick.OHLC ohlc = Tick.OHLC.builder()
            .open(23450.0)
            .high(23800.0)
            .low(23320.0)
            .close(23500.0)
            .build();
        
        // When: Create tick using builder
        Tick tick = Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(type)
            .timestamp(timestamp)
            .lastTradedPrice(lastTradedPrice)
            .volume(volume)
            .ohlc(ohlc)
            .rawBinaryData(rawBinaryData)
            .build();
        
        // Then: All fields should be correctly set
        assertThat(tick.getSymbol()).isEqualTo(symbol);
        assertThat(tick.getInstrumentToken()).isEqualTo(instrumentToken);
        assertThat(tick.getType()).isEqualTo(type);
        assertThat(tick.getTimestamp()).isEqualTo(timestamp);
        assertThat(tick.getLastTradedPrice()).isEqualTo(lastTradedPrice);
        assertThat(tick.getVolume()).isEqualTo(volume);
        assertThat(tick.getOhlc()).isEqualTo(ohlc);
        assertThat(tick.getRawBinaryData()).isEqualTo(rawBinaryData);
    }
    
    @Test
    void shouldCreateOHLCWithBuilder() {
        // Given: OHLC data
        double open = 23450.0;
        double high = 23800.0;
        double low = 23320.0;
        double close = 23500.0;
        
        // When: Create OHLC using builder
        Tick.OHLC ohlc = Tick.OHLC.builder()
            .open(open)
            .high(high)
            .low(low)
            .close(close)
            .build();
        
        // Then: All fields should be correctly set
        assertThat(ohlc.getOpen()).isEqualTo(open);
        assertThat(ohlc.getHigh()).isEqualTo(high);
        assertThat(ohlc.getLow()).isEqualTo(low);
        assertThat(ohlc.getClose()).isEqualTo(close);
    }
    
    @Test
    void shouldCreateTickForIndexInstrument() {
        // When: Create tick for index
        Tick tick = Tick.builder()
            .symbol("NIFTY 50")
            .instrumentToken(256265L)
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
            .rawBinaryData(new byte[]{0x01, 0x02})
            .build();
        
        // Then: Type should be INDEX
        assertThat(tick.getType()).isEqualTo(InstrumentType.INDEX);
    }
    
    @Test
    void shouldCreateTickForStockInstrument() {
        // When: Create tick for stock
        Tick tick = Tick.builder()
            .symbol("RELIANCE")
            .instrumentToken(738561L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(2456.75)
            .volume(987654L)
            .ohlc(Tick.OHLC.builder()
                .open(2450.0)
                .high(2460.0)
                .low(2445.0)
                .close(2455.0)
                .build())
            .rawBinaryData(new byte[]{0x03, 0x04})
            .build();
        
        // Then: Type should be STOCK
        assertThat(tick.getType()).isEqualTo(InstrumentType.STOCK);
    }
    
    @Test
    void shouldStoreRawBinaryData() {
        // Given: Raw binary data from Kite
        byte[] rawData = new byte[]{0x01, 0x02, 0x03, 0x04, 0x05};
        
        // When: Create tick with raw binary data
        Tick tick = Tick.builder()
            .symbol("TEST")
            .instrumentToken(123456L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(100.0)
            .volume(1000L)
            .ohlc(Tick.OHLC.builder()
                .open(99.0)
                .high(101.0)
                .low(98.0)
                .close(100.0)
                .build())
            .rawBinaryData(rawData)
            .build();
        
        // Then: Raw binary data should be preserved
        assertThat(tick.getRawBinaryData()).isEqualTo(rawData);
        assertThat(tick.getRawBinaryData()).hasSize(5);
    }
    
    @Test
    void shouldCreateTickReceivedEventWithTick() {
        // Given: A tick
        Tick tick = Tick.builder()
            .symbol("NIFTY 50")
            .instrumentToken(256265L)
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
            .rawBinaryData(new byte[]{0x01, 0x02})
            .build();
        
        // When: Create event using convenience constructor
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // Then: Event should contain the tick and have a receivedAt timestamp
        assertThat(event.tick()).isEqualTo(tick);
        assertThat(event.receivedAt()).isNotNull();
        assertThat(event.receivedAt()).isBeforeOrEqualTo(Instant.now());
    }
    
    @Test
    void shouldCreateTickReceivedEventWithExplicitTimestamp() {
        // Given: A tick and explicit timestamp
        Tick tick = Tick.builder()
            .symbol("RELIANCE")
            .instrumentToken(738561L)
            .type(InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(2456.75)
            .volume(987654L)
            .ohlc(Tick.OHLC.builder()
                .open(2450.0)
                .high(2460.0)
                .low(2445.0)
                .close(2455.0)
                .build())
            .rawBinaryData(new byte[]{0x03, 0x04})
            .build();
        
        Instant receivedAt = Instant.parse("2025-12-08T10:15:30.123Z");
        
        // When: Create event with explicit timestamp
        TickReceivedEvent event = new TickReceivedEvent(tick, receivedAt);
        
        // Then: Event should have the specified timestamp
        assertThat(event.tick()).isEqualTo(tick);
        assertThat(event.receivedAt()).isEqualTo(receivedAt);
    }
    
    @Test
    void shouldCreateInstrumentInfoWithBuilder() {
        // Given: Instrument info data
        long instrumentToken = 256265L;
        long exchangeToken = 1024L;
        String tradingSymbol = "NIFTY 50";
        InstrumentType type = InstrumentType.INDEX;
        
        // When: Create InstrumentInfo using builder
        InstrumentInfo info = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .exchangeToken(exchangeToken)
            .tradingSymbol(tradingSymbol)
            .type(type)
            .build();
        
        // Then: All fields should be correctly set
        assertThat(info.getInstrumentToken()).isEqualTo(instrumentToken);
        assertThat(info.getExchangeToken()).isEqualTo(exchangeToken);
        assertThat(info.getTradingSymbol()).isEqualTo(tradingSymbol);
        assertThat(info.getType()).isEqualTo(type);
    }
    
    @Test
    void shouldCreateInstrumentInfoForIndex() {
        // When: Create InstrumentInfo for index
        InstrumentInfo info = InstrumentInfo.builder()
            .instrumentToken(256265L)
            .exchangeToken(1024L)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        
        // Then: Type should be INDEX
        assertThat(info.getType()).isEqualTo(InstrumentType.INDEX);
    }
    
    @Test
    void shouldCreateInstrumentInfoForStock() {
        // When: Create InstrumentInfo for stock
        InstrumentInfo info = InstrumentInfo.builder()
            .instrumentToken(738561L)
            .exchangeToken(2885L)
            .tradingSymbol("RELIANCE")
            .type(InstrumentType.STOCK)
            .build();
        
        // Then: Type should be STOCK
        assertThat(info.getType()).isEqualTo(InstrumentType.STOCK);
    }
}
