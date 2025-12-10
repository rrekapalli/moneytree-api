package com.moneytree.socketengine.kite;

import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tests for KiteTickParser.
 * Tests parsing of binary tick data from Kite WebSocket API.
 */
@ExtendWith(MockitoExtension.class)
class KiteTickParserTest {

    @Mock
    private InstrumentLoader instrumentLoader;

    private KiteTickParser parser;

    @BeforeEach
    void setUp() {
        parser = new KiteTickParser(instrumentLoader);
    }

    @Test
    void shouldParseFullModeTickData() {
        // Given: Binary data for a full mode tick
        long instrumentToken = 256265L;  // NIFTY 50
        double lastPrice = 23754.25;
        long volume = 1000000L;
        double open = 23700.50;
        double high = 23800.75;
        double low = 23650.00;
        double close = 23754.25;
        long timestamp = Instant.now().getEpochSecond();

        byte[] binaryData = createFullModeTickData(
            instrumentToken, lastPrice, volume, open, high, low, close, timestamp);

        // Mock instrument loader
        InstrumentInfo instrumentInfo = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        when(instrumentLoader.getInstrumentInfo(instrumentToken)).thenReturn(instrumentInfo);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Should parse correctly
        assertThat(ticks).hasSize(1);
        Tick tick = ticks.get(0);
        
        assertThat(tick.getSymbol()).isEqualTo("NIFTY 50");
        assertThat(tick.getInstrumentToken()).isEqualTo(instrumentToken);
        assertThat(tick.getType()).isEqualTo(InstrumentType.INDEX);
        assertThat(tick.getLastTradedPrice()).isEqualTo(lastPrice);
        assertThat(tick.getVolume()).isEqualTo(volume);
        assertThat(tick.getOhlc().getOpen()).isEqualTo(open);
        assertThat(tick.getOhlc().getHigh()).isEqualTo(high);
        assertThat(tick.getOhlc().getLow()).isEqualTo(low);
        assertThat(tick.getOhlc().getClose()).isEqualTo(close);
        assertThat(tick.getTimestamp()).isEqualTo(Instant.ofEpochSecond(timestamp));
        assertThat(tick.getRawBinaryData()).isEqualTo(binaryData);
    }

    @Test
    void shouldParseLTPModeTickData() {
        // Given: Binary data for LTP mode tick
        long instrumentToken = 738561L;  // RELIANCE
        double lastPrice = 2456.75;

        byte[] binaryData = createLTPModeTickData(instrumentToken, lastPrice);

        // Mock instrument loader
        InstrumentInfo instrumentInfo = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .tradingSymbol("RELIANCE")
            .type(InstrumentType.STOCK)
            .build();
        when(instrumentLoader.getInstrumentInfo(instrumentToken)).thenReturn(instrumentInfo);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Should parse correctly with LTP only
        assertThat(ticks).hasSize(1);
        Tick tick = ticks.get(0);
        
        assertThat(tick.getSymbol()).isEqualTo("RELIANCE");
        assertThat(tick.getInstrumentToken()).isEqualTo(instrumentToken);
        assertThat(tick.getType()).isEqualTo(InstrumentType.STOCK);
        assertThat(tick.getLastTradedPrice()).isEqualTo(lastPrice);
        assertThat(tick.getVolume()).isEqualTo(0);  // Not available in LTP mode
        assertThat(tick.getRawBinaryData()).isEqualTo(binaryData);
    }

    @Test
    void shouldParseQuoteModeTickData() {
        // Given: Binary data for Quote mode tick
        long instrumentToken = 408065L;  // INFY
        double lastPrice = 1543.50;
        long volume = 500000L;

        byte[] binaryData = createQuoteModeTickData(instrumentToken, lastPrice, volume);

        // Mock instrument loader
        InstrumentInfo instrumentInfo = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .tradingSymbol("INFY")
            .type(InstrumentType.STOCK)
            .build();
        when(instrumentLoader.getInstrumentInfo(instrumentToken)).thenReturn(instrumentInfo);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Should parse correctly with Quote data
        assertThat(ticks).hasSize(1);
        Tick tick = ticks.get(0);
        
        assertThat(tick.getSymbol()).isEqualTo("INFY");
        assertThat(tick.getInstrumentToken()).isEqualTo(instrumentToken);
        assertThat(tick.getLastTradedPrice()).isEqualTo(lastPrice);
        assertThat(tick.getVolume()).isEqualTo(volume);
        assertThat(tick.getRawBinaryData()).isEqualTo(binaryData);
    }

    @Test
    void shouldParseMultipleTicksInSinglePacket() {
        // Given: Binary data with multiple ticks
        long token1 = 256265L;  // NIFTY 50
        long token2 = 738561L;  // RELIANCE
        double price1 = 23754.25;
        double price2 = 2456.75;

        byte[] binaryData = createMultipleTicksData(token1, price1, token2, price2);

        // Mock instrument loader
        InstrumentInfo info1 = InstrumentInfo.builder()
            .instrumentToken(token1)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        InstrumentInfo info2 = InstrumentInfo.builder()
            .instrumentToken(token2)
            .tradingSymbol("RELIANCE")
            .type(InstrumentType.STOCK)
            .build();
        when(instrumentLoader.getInstrumentInfo(token1)).thenReturn(info1);
        when(instrumentLoader.getInstrumentInfo(token2)).thenReturn(info2);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Should parse both ticks
        assertThat(ticks).hasSize(2);
        
        assertThat(ticks.get(0).getSymbol()).isEqualTo("NIFTY 50");
        assertThat(ticks.get(0).getInstrumentToken()).isEqualTo(token1);
        assertThat(ticks.get(0).getLastTradedPrice()).isEqualTo(price1);
        
        assertThat(ticks.get(1).getSymbol()).isEqualTo("RELIANCE");
        assertThat(ticks.get(1).getInstrumentToken()).isEqualTo(token2);
        assertThat(ticks.get(1).getLastTradedPrice()).isEqualTo(price2);
    }

    @Test
    void shouldPreserveRawBinaryData() {
        // Given: Binary tick data
        long instrumentToken = 256265L;
        double lastPrice = 23754.25;
        byte[] binaryData = createLTPModeTickData(instrumentToken, lastPrice);

        // Mock instrument loader
        InstrumentInfo instrumentInfo = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        when(instrumentLoader.getInstrumentInfo(instrumentToken)).thenReturn(instrumentInfo);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Raw binary data should be preserved exactly
        assertThat(ticks).hasSize(1);
        assertThat(ticks.get(0).getRawBinaryData()).isEqualTo(binaryData);
        // The raw binary data is the same reference since we store the original array
        assertThat(ticks.get(0).getRawBinaryData()).isSameAs(binaryData);
    }

    @Test
    void shouldHandleUnknownInstrumentToken() {
        // Given: Binary data for unknown instrument
        long unknownToken = 999999L;
        double lastPrice = 1234.56;
        byte[] binaryData = createLTPModeTickData(unknownToken, lastPrice);

        // Mock instrument loader to return null
        when(instrumentLoader.getInstrumentInfo(unknownToken)).thenReturn(null);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Should still parse with fallback values
        assertThat(ticks).hasSize(1);
        Tick tick = ticks.get(0);
        
        assertThat(tick.getSymbol()).isEqualTo(String.valueOf(unknownToken));
        assertThat(tick.getInstrumentToken()).isEqualTo(unknownToken);
        assertThat(tick.getType()).isEqualTo(InstrumentType.STOCK);  // Default
        assertThat(tick.getLastTradedPrice()).isEqualTo(lastPrice);
    }

    @Test
    void shouldThrowExceptionForNullBinaryData() {
        // When/Then: Parsing null data should throw exception
        assertThatThrownBy(() -> parser.parse(null))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("null or too short");
    }

    @Test
    void shouldThrowExceptionForEmptyBinaryData() {
        // Given: Empty binary data
        byte[] emptyData = new byte[0];

        // When/Then: Parsing empty data should throw exception
        assertThatThrownBy(() -> parser.parse(emptyData))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("null or too short");
    }

    @Test
    void shouldThrowExceptionForTooShortBinaryData() {
        // Given: Binary data with only 1 byte (need at least 2 for packet count)
        byte[] shortData = new byte[]{0x01};

        // When/Then: Parsing short data should throw exception
        assertThatThrownBy(() -> parser.parse(shortData))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("null or too short");
    }

    @Test
    void shouldThrowExceptionForInvalidPacketCount() {
        // Given: Binary data with zero packet count
        ByteBuffer buffer = ByteBuffer.allocate(2);
        buffer.order(ByteOrder.BIG_ENDIAN);
        buffer.putShort((short) 0);  // Zero packets
        byte[] binaryData = buffer.array();

        // When/Then: Should throw exception for invalid packet count
        assertThatThrownBy(() -> parser.parse(binaryData))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("Invalid packet count");
    }

    @Test
    void shouldThrowExceptionForInsufficientDataInPacket() {
        // Given: Binary data claiming 1 packet but not enough bytes
        ByteBuffer buffer = ByteBuffer.allocate(4);
        buffer.order(ByteOrder.BIG_ENDIAN);
        buffer.putShort((short) 1);  // 1 packet
        buffer.put((byte) 0x01);     // Only 1 byte of data (need at least 6)
        byte[] binaryData = buffer.array();

        // When/Then: Should throw exception for insufficient data
        assertThatThrownBy(() -> parser.parse(binaryData))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("Insufficient data for packet");
    }

    @Test
    void shouldThrowExceptionForMalformedFullModeData() {
        // Given: Binary data claiming Full mode but insufficient bytes
        ByteBuffer buffer = ByteBuffer.allocate(20);
        buffer.order(ByteOrder.BIG_ENDIAN);
        buffer.putShort((short) 1);           // 1 packet
        buffer.putInt(256265);                // Instrument token
        buffer.put((byte) 1);                 // Tradable
        buffer.put((byte) 3);                 // Mode = Full
        buffer.putInt((int) (23754.25 * 100)); // Last price
        // Missing remaining Full mode fields
        byte[] binaryData = buffer.array();

        // When/Then: Should throw exception for insufficient Full mode data
        assertThatThrownBy(() -> parser.parse(binaryData))
            .isInstanceOf(TickParseException.class)
            .hasMessageContaining("Insufficient data for Full mode");
    }

    @Test
    void shouldCorrectlyConvertPricesFromIntegerFormat() {
        // Given: Binary data with price as integer (multiplied by 100)
        long instrumentToken = 256265L;
        int priceAsInt = 2375425;  // Represents 23754.25
        double expectedPrice = 23754.25;

        ByteBuffer buffer = ByteBuffer.allocate(12);
        buffer.order(ByteOrder.BIG_ENDIAN);
        buffer.putShort((short) 1);      // 1 packet
        buffer.putInt((int) instrumentToken);
        buffer.put((byte) 1);            // Tradable
        buffer.put((byte) 1);            // Mode = LTP
        buffer.putInt(priceAsInt);       // Price as integer
        byte[] binaryData = buffer.array();

        // Mock instrument loader
        InstrumentInfo instrumentInfo = InstrumentInfo.builder()
            .instrumentToken(instrumentToken)
            .tradingSymbol("NIFTY 50")
            .type(InstrumentType.INDEX)
            .build();
        when(instrumentLoader.getInstrumentInfo(instrumentToken)).thenReturn(instrumentInfo);

        // When: Parsing the binary data
        List<Tick> ticks = parser.parse(binaryData);

        // Then: Price should be correctly converted
        assertThat(ticks).hasSize(1);
        assertThat(ticks.get(0).getLastTradedPrice()).isEqualTo(expectedPrice);
    }

    // Helper methods to create test binary data

    private byte[] createFullModeTickData(long instrumentToken, double lastPrice, long volume,
                                         double open, double high, double low, double close,
                                         long timestamp) {
        // Full mode packet: 2 (count) + 4 (token) + 1 (tradable) + 1 (mode) + 64 (16 ints * 4 bytes) = 72 bytes
        ByteBuffer buffer = ByteBuffer.allocate(72);
        buffer.order(ByteOrder.BIG_ENDIAN);
        
        buffer.putShort((short) 1);                    // 1 packet (2 bytes)
        buffer.putInt((int) instrumentToken);          // 4 bytes
        buffer.put((byte) 1);                          // Tradable (1 byte)
        buffer.put((byte) 3);                          // Mode = Full (1 byte)
        buffer.putInt((int) (lastPrice * 100));        // 4 bytes
        buffer.putInt(0);                              // Last quantity (4 bytes)
        buffer.putInt(0);                              // Avg price (4 bytes)
        buffer.putInt((int) volume);                   // 4 bytes
        buffer.putInt(0);                              // Buy quantity (4 bytes)
        buffer.putInt(0);                              // Sell quantity (4 bytes)
        buffer.putInt((int) (open * 100));             // 4 bytes
        buffer.putInt((int) (high * 100));             // 4 bytes
        buffer.putInt((int) (low * 100));              // 4 bytes
        buffer.putInt((int) (close * 100));            // 4 bytes
        buffer.putInt(0);                              // Last trade time (4 bytes)
        buffer.putInt(0);                              // OI (4 bytes)
        buffer.putInt(0);                              // OI day high (4 bytes)
        buffer.putInt(0);                              // OI day low (4 bytes)
        buffer.putInt((int) timestamp);                // 4 bytes
        
        return buffer.array();
    }

    private byte[] createLTPModeTickData(long instrumentToken, double lastPrice) {
        ByteBuffer buffer = ByteBuffer.allocate(12);
        buffer.order(ByteOrder.BIG_ENDIAN);
        
        buffer.putShort((short) 1);                    // 1 packet
        buffer.putInt((int) instrumentToken);
        buffer.put((byte) 1);                          // Tradable
        buffer.put((byte) 1);                          // Mode = LTP
        buffer.putInt((int) (lastPrice * 100));
        
        return buffer.array();
    }

    private byte[] createQuoteModeTickData(long instrumentToken, double lastPrice, long volume) {
        ByteBuffer buffer = ByteBuffer.allocate(32);
        buffer.order(ByteOrder.BIG_ENDIAN);
        
        buffer.putShort((short) 1);                    // 1 packet
        buffer.putInt((int) instrumentToken);
        buffer.put((byte) 1);                          // Tradable
        buffer.put((byte) 2);                          // Mode = Quote
        buffer.putInt((int) (lastPrice * 100));
        buffer.putInt(0);                              // Last quantity
        buffer.putInt(0);                              // Avg price
        buffer.putInt((int) volume);
        buffer.putInt(0);                              // Buy quantity
        buffer.putInt(0);                              // Sell quantity
        
        return buffer.array();
    }

    private byte[] createMultipleTicksData(long token1, double price1, long token2, double price2) {
        ByteBuffer buffer = ByteBuffer.allocate(24);
        buffer.order(ByteOrder.BIG_ENDIAN);
        
        buffer.putShort((short) 2);                    // 2 packets
        
        // First tick (LTP mode)
        buffer.putInt((int) token1);
        buffer.put((byte) 1);                          // Tradable
        buffer.put((byte) 1);                          // Mode = LTP
        buffer.putInt((int) (price1 * 100));
        
        // Second tick (LTP mode)
        buffer.putInt((int) token2);
        buffer.put((byte) 1);                          // Tradable
        buffer.put((byte) 1);                          // Mode = LTP
        buffer.putInt((int) (price2 * 100));
        
        return buffer.array();
    }
}
