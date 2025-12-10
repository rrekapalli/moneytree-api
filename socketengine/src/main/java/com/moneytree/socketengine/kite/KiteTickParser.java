package com.moneytree.socketengine.kite;

import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
// We'll create a utility method to use Kite's parsing logic
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
    private int debugMessageCount = 0;
    
    // Packet mode constants (as defined in Kite Connect API)
    private static final int MODE_LTP = 1;
    private static final int MODE_QUOTE = 2;
    private static final int MODE_FULL = 3;
    
    // Packet size constants (after 2-byte header)
    private static final int LTP_PACKET_SIZE = 10;     // 4 (token) + 1 (tradable) + 1 (mode) + 4 (ltp)
    private static final int QUOTE_PACKET_SIZE = 30;   // LTP + 20 bytes additional quote fields
    private static final int FULL_PACKET_SIZE = 50;    // Quote + 20 bytes additional full fields
    
    /**
     * Parses binary tick data from Kite WebSocket into a list of Tick domain objects.
     * Based on the official Kite Connect Java library implementation.
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
            // CRITICAL FIX: Use the exact same approach as official Kite Java library
            ByteBuffer buffer = ByteBuffer.wrap(binaryData);
            buffer.order(ByteOrder.BIG_ENDIAN); // Kite uses big-endian
            
            // Read number of packets (2 bytes)
            int packetCount = buffer.getShort() & 0xFFFF;
            
            if (debugMessageCount < 3) {
                debugMessageCount++;
                log.info("🔍 KITE PARSING DEBUG #{}: packet count: {}, data length: {}", 
                    debugMessageCount, packetCount, binaryData.length);
            }
            
            if (packetCount <= 0 || packetCount > 1000) {
                throw new TickParseException("Invalid packet count: " + packetCount);
            }
            
            List<Tick> ticks = new ArrayList<>(packetCount);
            
            // Parse each packet
            for (int i = 0; i < packetCount; i++) {
                if (buffer.remaining() < 6) {
                    log.warn("Insufficient data for packet {}, remaining: {}", i, buffer.remaining());
                    break;
                }
                
                try {
                    Tick tick = parseKitePacket(buffer, binaryData);
                    if (tick != null) {
                        ticks.add(tick);
                    }
                } catch (Exception e) {
                    log.warn("Error parsing packet {}: {}", i, e.getMessage());
                    // Continue with next packet
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
     * Parses a single tick packet from the buffer using Kite's exact binary format.
     * Based on the official Kite Connect Java library implementation.
     * 
     * @param buffer ByteBuffer positioned at the start of a packet
     * @param originalData Original binary data for storage
     * @return Parsed Tick object, or null if packet should be skipped
     */
    private Tick parseKitePacket(ByteBuffer buffer, byte[] originalData) {
        // Read instrument token (4 bytes, big-endian)
        long instrumentToken = buffer.getInt() & 0xFFFFFFFFL;
        
        // Read tradable flag (1 byte) - indicates if instrument is tradable
        byte tradable = buffer.get();
        
        // Read mode (1 byte) - determines packet structure
        int mode = buffer.get() & 0xFF;
        
        if (debugMessageCount <= 3) {
            log.info("🔍 KITE PACKET: token={}, tradable={}, mode={}, remaining={}", 
                instrumentToken, tradable, mode, buffer.remaining());
        }
        
        // Parse based on mode (official Kite approach)
        switch (mode) {
            case MODE_LTP:
                return parseKiteLTPMode(buffer, instrumentToken, originalData);
            case MODE_QUOTE:
                return parseKiteQuoteMode(buffer, instrumentToken, originalData);
            case MODE_FULL:
                return parseKiteFullMode(buffer, instrumentToken, originalData);
            default:
                log.warn("Unknown mode {} for instrument {}, skipping packet", mode, instrumentToken);
                return null;
        }
    }
    
    /**
     * Parses LTP mode packet (4 bytes after instrument token and mode).
     * Based on official Kite Connect Java library.
     */
    private Tick parseKiteLTPMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 4) {
            log.warn("Insufficient data for LTP mode, remaining: {}", buffer.remaining());
            return null;
        }
        
        // LTP packet: last_price (4 bytes)
        int rawPrice = buffer.getInt();
        double lastPrice = rawPrice / 100.0;
        
        if (debugMessageCount <= 3) {
            log.info("🔍 KITE LTP: token={}, rawPrice={}, price={}", instrumentToken, rawPrice, lastPrice);
        }
        
        return buildTick(instrumentToken, lastPrice, 0, 0, 0, 0, 0, Instant.now(), originalData);
    }
    
    /**
     * Parses Quote mode packet (20 bytes after instrument token and mode).
     * Based on official Kite Connect Java library.
     */
    private Tick parseKiteQuoteMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 20) {
            log.warn("Insufficient data for Quote mode, remaining: {}", buffer.remaining());
            return null;
        }
        
        // Quote packet structure (after token, tradable, mode):
        // last_price (4), last_quantity (4), average_price (4), volume (4), buy_quantity (4), sell_quantity (4)
        int rawLastPrice = buffer.getInt();
        int rawLastQuantity = buffer.getInt();
        int rawAvgPrice = buffer.getInt();
        int rawVolume = buffer.getInt();
        int rawBuyQuantity = buffer.getInt();
        
        // Skip sell_quantity if not enough data
        if (buffer.remaining() >= 4) {
            int rawSellQuantity = buffer.getInt();
        }
        
        double lastPrice = rawLastPrice / 100.0;
        long lastQuantity = rawLastQuantity & 0xFFFFFFFFL;
        double avgPrice = rawAvgPrice / 100.0;
        long volume = rawVolume & 0xFFFFFFFFL;
        long buyQuantity = rawBuyQuantity & 0xFFFFFFFFL;
        
        if (debugMessageCount <= 3) {
            log.info("🔍 KITE QUOTE: token={}, rawPrice={}, price={}, volume={}", 
                instrumentToken, rawLastPrice, lastPrice, volume);
        }
        
        return buildTick(instrumentToken, lastPrice, volume, 0, 0, 0, 0, Instant.now(), originalData);
    }
    
    /**
     * Parses Full mode packet (40 bytes after instrument token and mode).
     * Based on official Kite Connect Java library.
     */
    private Tick parseKiteFullMode(ByteBuffer buffer, long instrumentToken, byte[] originalData) {
        if (buffer.remaining() < 40) {
            log.warn("Insufficient data for Full mode, remaining: {}", buffer.remaining());
            return null;
        }
        
        // Full packet structure (after token, tradable, mode - all values are 4 bytes each):
        // last_price, last_quantity, average_price, volume, buy_quantity, sell_quantity,
        // open, high, low, close, last_trade_time, oi, oi_day_high, oi_day_low, timestamp
        
        int rawLastPrice = buffer.getInt();
        int rawLastQuantity = buffer.getInt();
        int rawAvgPrice = buffer.getInt();
        int rawVolume = buffer.getInt();
        int rawBuyQuantity = buffer.getInt();
        int rawSellQuantity = buffer.getInt();
        
        int rawOpen = buffer.getInt();
        int rawHigh = buffer.getInt();
        int rawLow = buffer.getInt();
        int rawClose = buffer.getInt();
        
        // Convert raw values to proper types
        double lastPrice = rawLastPrice / 100.0;
        long lastQuantity = rawLastQuantity & 0xFFFFFFFFL;
        double avgPrice = rawAvgPrice / 100.0;
        long volume = rawVolume & 0xFFFFFFFFL;
        long buyQuantity = rawBuyQuantity & 0xFFFFFFFFL;
        long sellQuantity = rawSellQuantity & 0xFFFFFFFFL;
        
        double open = rawOpen / 100.0;
        double high = rawHigh / 100.0;
        double low = rawLow / 100.0;
        double close = rawClose / 100.0;
        
        // Optional fields - check if enough data remains
        long lastTradeTime = 0;
        long oi = 0;
        long oiDayHigh = 0;
        long oiDayLow = 0;
        long timestamp = 0;
        
        if (buffer.remaining() >= 20) { // 5 more fields * 4 bytes each
            lastTradeTime = buffer.getInt() & 0xFFFFFFFFL;
            oi = buffer.getInt() & 0xFFFFFFFFL;
            oiDayHigh = buffer.getInt() & 0xFFFFFFFFL;
            oiDayLow = buffer.getInt() & 0xFFFFFFFFL;
            timestamp = buffer.getInt() & 0xFFFFFFFFL;
        }
        
        // Convert Unix timestamp to Instant
        Instant tickTimestamp = timestamp > 0 ? Instant.ofEpochSecond(timestamp) : Instant.now();
        
        if (debugMessageCount <= 3) {
            log.info("🔍 KITE FULL: token={}, rawPrice={}, price={}, volume={}, OHLC=[{},{},{},{}]", 
                instrumentToken, rawLastPrice, lastPrice, volume, open, high, low, close);
        }
        
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
            
            // Log index ticks for debugging
            if (type == InstrumentType.INDEX) {
                log.info("INDEX TICK RECEIVED: {} (token: {}) = ₹{}", symbol, instrumentToken, lastPrice);
            }
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
    
    /**
     * Debug method to analyze raw binary data and detect parsing issues.
     * This method logs detailed information about the binary structure to help
     * identify issues with corrupted price data.
     * 
     * @param binaryData Raw binary data from Kite WebSocket
     */
    public void debugBinaryData(byte[] binaryData) {
        if (binaryData == null || binaryData.length < 2) {
            log.warn("🔍 DEBUG: Binary data is null or too short");
            return;
        }
        
        try {
            log.info("🔍 BINARY DEBUG: Analyzing {} bytes of data", binaryData.length);
            
            // Log first 32 bytes as hex for inspection
            StringBuilder hexDump = new StringBuilder();
            for (int i = 0; i < Math.min(32, binaryData.length); i++) {
                hexDump.append(String.format("%02X ", binaryData[i] & 0xFF));
                if ((i + 1) % 8 == 0) hexDump.append(" ");
            }
            log.info("🔍 HEX DUMP (first 32 bytes): {}", hexDump.toString());
            
            ByteBuffer buffer = ByteBuffer.wrap(binaryData);
            buffer.order(ByteOrder.BIG_ENDIAN);
            
            // Read packet count
            int packetCount = buffer.getShort() & 0xFFFF;
            log.info("🔍 PACKET COUNT: {}", packetCount);
            
            if (packetCount <= 0 || packetCount > 100) {
                log.warn("🔍 SUSPICIOUS PACKET COUNT: {} (expected 1-100)", packetCount);
                
                // Try little-endian
                buffer.rewind();
                buffer.order(ByteOrder.LITTLE_ENDIAN);
                int packetCountLE = buffer.getShort() & 0xFFFF;
                log.info("🔍 PACKET COUNT (little-endian): {}", packetCountLE);
                
                if (packetCountLE > 0 && packetCountLE <= 100) {
                    log.warn("🔍 DATA APPEARS TO BE LITTLE-ENDIAN, NOT BIG-ENDIAN!");
                }
                return;
            }
            
            // Analyze first packet
            if (buffer.remaining() >= 6) {
                long instrumentToken = buffer.getInt() & 0xFFFFFFFFL;
                byte tradable = buffer.get();
                int mode = buffer.get() & 0xFF;
                
                log.info("🔍 FIRST PACKET: token={}, tradable={}, mode={}", 
                    instrumentToken, tradable, mode);
                
                // Validate mode
                if (mode < MODE_LTP || mode > MODE_FULL) {
                    log.error("❌ INVALID MODE: {} (expected 1-3)", mode);
                    
                    // Try to detect byte order issues
                    buffer.rewind();
                    buffer.position(2); // Skip packet count
                    buffer.order(ByteOrder.LITTLE_ENDIAN);
                    
                    long tokenLE = buffer.getInt() & 0xFFFFFFFFL;
                    byte tradableLE = buffer.get();
                    int modeLE = buffer.get() & 0xFF;
                    
                    log.info("🔍 LITTLE-ENDIAN ATTEMPT: token={}, tradable={}, mode={}", 
                        tokenLE, tradableLE, modeLE);
                    
                    if (modeLE >= MODE_LTP && modeLE <= MODE_FULL) {
                        log.error("❌ DATA APPEARS TO BE LITTLE-ENDIAN, BUT KITE USES BIG-ENDIAN!");
                    }
                    return;
                }
                
                if (buffer.remaining() >= 4) {
                    // Read price with different interpretations
                    int rawPriceInt = buffer.getInt();
                    double priceBigEndian = rawPriceInt / 100.0;
                    
                    // Try little-endian interpretation
                    ByteBuffer tempBuffer = ByteBuffer.allocate(4);
                    tempBuffer.order(ByteOrder.LITTLE_ENDIAN);
                    tempBuffer.putInt(rawPriceInt);
                    tempBuffer.flip();
                    tempBuffer.order(ByteOrder.BIG_ENDIAN);
                    int swappedInt = tempBuffer.getInt();
                    double priceLittleEndian = swappedInt / 100.0;
                    
                    // Try without division
                    double priceNoDivision = rawPriceInt;
                    
                    // Try as unsigned
                    long unsignedPrice = rawPriceInt & 0xFFFFFFFFL;
                    double priceUnsigned = unsignedPrice / 100.0;
                    
                    log.info("🔍 PRICE INTERPRETATIONS:");
                    log.info("  Raw int: {} (0x{:08X})", rawPriceInt, rawPriceInt);
                    log.info("  Big-endian /100: {}", priceBigEndian);
                    log.info("  Little-endian /100: {}", priceLittleEndian);
                    log.info("  No division: {}", priceNoDivision);
                    log.info("  Unsigned /100: {}", priceUnsigned);
                    
                    // Check which interpretation makes sense (typical stock prices are 1-50000)
                    if (priceBigEndian > 0 && priceBigEndian < 100000) {
                        log.info("✅ Big-endian /100 looks reasonable: {}", priceBigEndian);
                    } else if (priceLittleEndian > 0 && priceLittleEndian < 100000) {
                        log.warn("⚠️ Little-endian /100 looks more reasonable: {}", priceLittleEndian);
                    } else if (priceUnsigned > 0 && priceUnsigned < 10000000) {
                        log.warn("⚠️ Unsigned /100 looks reasonable: {}", priceUnsigned);
                    } else {
                        log.error("❌ None of the interpretations look reasonable!");
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("🔍 DEBUG: Error analyzing binary data", e);
        }
    }
}
