package com.moneytree.socketengine.kite;

import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses binary tick data received from Kite WebSocket API.
 * 
 * <p>Kite sends tick data in a compact binary format to minimize bandwidth.
 * The binary packet structure varies based on the mode (LTP, Quote, Full).
 * This parser handles the Full mode which contains all tick fields.
 * 
 * <p>Binary packet structure (Full mode):
 * <pre>
 * - Number of packets (2 bytes)
 * For each packet:
 *   - Instrument token (4 bytes)
 *   - Tradable flag (1 byte)
 *   - Mode (1 byte)
 *   - Last price (4 bytes)
 *   - Last traded quantity (4 bytes)
 *   - Average traded price (4 bytes)
 *   - Volume (4 bytes)
 *   - Buy quantity (4 bytes)
 *   - Sell quantity (4 bytes)
 *   - Open (4 bytes)
 *   - High (4 bytes)
 *   - Low (4 bytes)
 *   - Close (4 bytes)
 *   - Last traded timestamp (4 bytes)
 *   - OI (4 bytes)
 *   - OI day high (4 bytes)
 *   - OI day low (4 bytes)
 *   - Timestamp (4 bytes)
 * </pre>
 * 
 * <p>All multi-byte integers are in big-endian (network byte order).
 * Prices are sent as integers and need to be divided by 100 to get actual price.
 * 
 * @see <a href="https://kite.trade/docs/connect/v3/websocket/">Kite WebSocket Documentation</a>
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class KiteTickParser {
    
    private final InstrumentLoader instrumentLoader;
    
    // Packet size constants for different modes
    private static final int MODE_LTP = 1;
    private static final int MODE_QUOTE = 2;
    private static final int MODE_FULL = 3;
    
    private static final int LTP_PACKET_SIZE = 8;      // 4 (token) + 1 (tradable) + 1 (mode) + 4 (ltp) - 2 (header)
    private static final int QUOTE_PACKET_SIZE = 28;   // LTP + additional quote fields
    private static final int FULL_PACKET_SIZE = 44;    // Quote + additional full fields
    
    /**
     * Parses binary tick data from Kite WebSocket into a list of Tick domain objects.
     * 
     * @param binaryData Raw binary data received from Kite WebSocket
     * @return List of parsed Tick objects
     * @throws TickParseException if the binary data is malformed or cannot be parsed
     */
    public List<Tick> parse(byte[] binaryData) {
        if (binaryData == null || binaryData.length < 2) {
            throw new TickParseException("Binary data is null or too short (minimum 2 bytes required)");
        }
        
        try {
            ByteBuffer buffer = ByteBuffer.wrap(binaryData);
            buffer.order(ByteOrder.BIG_ENDIAN);  // Kite uses big-endian (network byte order)
            
            // First 2 bytes: number of packets
            int packetCount = buffer.getShort() & 0xFFFF;
            
            if (packetCount <= 0) {
                throw new TickParseException("Invalid packet count: " + packetCount);
            }
            
            List<Tick> ticks = new ArrayList<>(packetCount);
            
            for (int i = 0; i < packetCount; i++) {
                if (buffer.remaining() < 6) {
                    throw new TickParseException(
                        String.format("Insufficient data for packet %d (need at least 6 bytes, have %d)", 
                            i, buffer.remaining()));
                }
                
                Tick tick = parsePacket(buffer, binaryData);
                if (tick != null) {
                    ticks.add(tick);
                }
            }
            
            return ticks;
            
        } catch (TickParseException e) {
            throw e;
        } catch (Exception e) {
            throw new TickParseException("Failed to parse binary tick data", e);
        }
    }
    
    /**
     * Parses a single tick packet from the buffer.
     * 
     * @param buffer ByteBuffer positioned at the start of a packet
     * @param originalData Original binary data for storage
     * @return Parsed Tick object, or null if packet should be skipped
     * @throws TickParseException if packet is malformed
     */
    private Tick parsePacket(ByteBuffer buffer, byte[] originalData) {
        // Read instrument token (4 bytes)
        long instrumentToken = buffer.getInt() & 0xFFFFFFFFL;
        
        // Read tradable flag (1 byte) - not used currently
        byte tradable = buffer.get();
        
        // Read mode (1 byte)
        int mode = buffer.get() & 0xFF;
        
        // Validate mode
        if (mode < MODE_LTP || mode > MODE_FULL) {
            log.warn("Unknown tick mode {} for instrument {}, skipping", mode, instrumentToken);
            skipRemainingPacketData(buffer, mode);
            return null;
        }
        
        // Parse based on mode
        switch (mode) {
            case MODE_LTP:
                return parseLTPMode(buffer, instrumentToken, originalData);
            case MODE_QUOTE:
                return parseQuoteMode(buffer, instrumentToken, originalData);
            case MODE_FULL:
                return parseFullMode(buffer, instrumentToken, originalData);
            default:
                log.warn("Unsupported mode {} for instrument {}", mode, instrumentToken);
                return null;
        }
    }
    
    /**
     * Parses LTP (Last Traded Price) mode packet.
     * Contains only the last traded price.
     */
    private Tick parseLTPMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 4) {
            throw new TickParseException("Insufficient data for LTP mode");
        }
        
        double lastPrice = buffer.getInt() / 100.0;
        
        return buildTick(instrumentToken, lastPrice, 0, 0, 0, 0, 0, Instant.now(), originalData);
    }
    
    /**
     * Parses Quote mode packet.
     * Contains LTP plus volume and OHLC data.
     */
    private Tick parseQuoteMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 24) {
            throw new TickParseException("Insufficient data for Quote mode");
        }
        
        double lastPrice = buffer.getInt() / 100.0;
        long lastQuantity = buffer.getInt() & 0xFFFFFFFFL;
        double avgPrice = buffer.getInt() / 100.0;
        long volume = buffer.getInt() & 0xFFFFFFFFL;
        long buyQuantity = buffer.getInt() & 0xFFFFFFFFL;
        long sellQuantity = buffer.getInt() & 0xFFFFFFFFL;
        
        return buildTick(instrumentToken, lastPrice, volume, 0, 0, 0, 0, Instant.now(), originalData);
    }
    
    /**
     * Parses Full mode packet.
     * Contains all available tick data including OHLC and timestamps.
     */
    private Tick parseFullMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 40) {
            throw new TickParseException("Insufficient data for Full mode");
        }
        
        double lastPrice = buffer.getInt() / 100.0;
        long lastQuantity = buffer.getInt() & 0xFFFFFFFFL;
        double avgPrice = buffer.getInt() / 100.0;
        long volume = buffer.getInt() & 0xFFFFFFFFL;
        long buyQuantity = buffer.getInt() & 0xFFFFFFFFL;
        long sellQuantity = buffer.getInt() & 0xFFFFFFFFL;
        
        double open = buffer.getInt() / 100.0;
        double high = buffer.getInt() / 100.0;
        double low = buffer.getInt() / 100.0;
        double close = buffer.getInt() / 100.0;
        
        long lastTradeTime = buffer.getInt() & 0xFFFFFFFFL;
        long oi = buffer.getInt() & 0xFFFFFFFFL;
        long oiDayHigh = buffer.getInt() & 0xFFFFFFFFL;
        long oiDayLow = buffer.getInt() & 0xFFFFFFFFL;
        long timestamp = buffer.getInt() & 0xFFFFFFFFL;
        
        // Convert Unix timestamp to Instant
        Instant tickTimestamp = Instant.ofEpochSecond(timestamp);
        
        return buildTick(instrumentToken, lastPrice, volume, open, high, low, close, tickTimestamp, originalData);
    }
    
    /**
     * Builds a Tick domain object from parsed fields.
     */
    private Tick buildTick(long instrumentToken, double lastPrice, long volume,
                          double open, double high, double low, double close,
                          Instant timestamp, byte[] originalData) {
        
        // Look up instrument info to get symbol and type
        var instrumentInfo = instrumentLoader.getInstrumentInfo(instrumentToken);
        
        String symbol;
        InstrumentType type;
        
        if (instrumentInfo != null) {
            symbol = instrumentInfo.getTradingSymbol();
            type = instrumentInfo.getType();
        } else {
            // Fallback if instrument not found
            symbol = String.valueOf(instrumentToken);
            type = InstrumentType.STOCK;  // Default to STOCK
            log.warn("Instrument token {} not found in loader, using token as symbol", instrumentToken);
        }
        
        return Tick.builder()
            .symbol(symbol)
            .instrumentToken(instrumentToken)
            .type(type)
            .timestamp(timestamp)
            .lastTradedPrice(lastPrice)
            .volume(volume)
            .ohlc(Tick.OHLC.builder()
                .open(open)
                .high(high)
                .low(low)
                .close(close)
                .build())
            .rawBinaryData(originalData)
            .build();
    }
    
    /**
     * Skips remaining packet data based on mode when packet cannot be parsed.
     */
    private void skipRemainingPacketData(ByteBuffer buffer, int mode) {
        int bytesToSkip = switch (mode) {
            case MODE_LTP -> 4;
            case MODE_QUOTE -> 24;
            case MODE_FULL -> 40;
            default -> 0;
        };
        
        if (buffer.remaining() >= bytesToSkip) {
            buffer.position(buffer.position() + bytesToSkip);
        }
    }
}
