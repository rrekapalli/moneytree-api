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
    private int debugMessageCount = 0;
    
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
            // CRITICAL FIX: Try both byte orders to determine correct parsing
            ByteBuffer buffer = ByteBuffer.wrap(binaryData);
            
            // First try BIG_ENDIAN (as per Kite documentation)
            buffer.order(ByteOrder.BIG_ENDIAN);
            int packetCountBE = buffer.getShort() & 0xFFFF;
            
            // Then try LITTLE_ENDIAN
            buffer.rewind();
            buffer.order(ByteOrder.LITTLE_ENDIAN);
            int packetCountLE = buffer.getShort() & 0xFFFF;
            
            // Determine which byte order produces reasonable packet count
            int packetCount;
            ByteOrder correctOrder;
            
            if (packetCountBE > 0 && packetCountBE <= 100) {
                packetCount = packetCountBE;
                correctOrder = ByteOrder.BIG_ENDIAN;
                buffer.rewind();
                buffer.order(ByteOrder.BIG_ENDIAN);
                buffer.getShort(); // Skip packet count
            } else if (packetCountLE > 0 && packetCountLE <= 100) {
                packetCount = packetCountLE;
                correctOrder = ByteOrder.LITTLE_ENDIAN;
                // buffer is already positioned correctly and in LITTLE_ENDIAN
                buffer.getShort(); // Skip packet count
                log.warn("🔧 BINARY PARSING FIX: Using LITTLE_ENDIAN byte order (packet count: {})", packetCountLE);
            } else {
                // Neither byte order produces reasonable packet count, use original logic
                packetCount = packetCountBE;
                correctOrder = ByteOrder.BIG_ENDIAN;
                buffer.rewind();
                buffer.order(ByteOrder.BIG_ENDIAN);
                buffer.getShort(); // Skip packet count
                log.warn("⚠️ BINARY PARSING: Neither byte order produces reasonable packet count (BE: {}, LE: {})", 
                    packetCountBE, packetCountLE);
            }
            
            if (packetCount <= 0) {
                throw new TickParseException("Invalid packet count: " + packetCount);
            }
            
            // Debug: Log parsing details for first few messages
            if (debugMessageCount < 3) {
                debugMessageCount++;
                log.info("🔍 PARSING DEBUG #{}: Using {} byte order, packet count: {}, data length: {}", 
                    debugMessageCount, correctOrder, packetCount, binaryData.length);
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
        
        // Debug: Log first few tick modes to verify parsing
        if (debugMessageCount <= 3) {
            log.info("🔍 TICK DEBUG: instrument={}, mode={}, valid={}, bufferRemaining={}", 
                instrumentToken, mode, (mode >= MODE_LTP && mode <= MODE_FULL), buffer.remaining());
        }
        
        // Validate mode
        if (mode < MODE_LTP || mode > MODE_FULL) {
            if (debugMessageCount <= 3) {
                log.warn("❌ Invalid tick mode {} for instrument {} (expected 1-3), attempting recovery", 
                    mode, instrumentToken);
            }
            
            // CRITICAL FIX: For invalid modes, we can't trust the packet structure
            // Skip a minimal amount and let the next packet parsing attempt to recover
            // This is better than trying to guess the packet size
            if (buffer.remaining() >= 4) {
                buffer.getInt(); // Skip 4 bytes and try to recover
            }
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
        
        // Debug: Log LTP parsing for first few messages
        if (debugMessageCount <= 3) {
            log.info("🔍 LTP MODE: instrument={}, lastPrice={}", instrumentToken, lastPrice);
        }
        
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
        
        // Debug: Log Quote parsing for first few messages
        if (debugMessageCount <= 3) {
            log.info("🔍 QUOTE MODE: instrument={}, lastPrice={}, volume={}", 
                instrumentToken, lastPrice, volume);
        }
        
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
        
        // Debug: Log Full parsing for first few messages
        if (debugMessageCount <= 3) {
            log.info("🔍 FULL MODE: instrument={}, lastPrice={}, volume={}, OHLC=[{},{},{},{}]", 
                instrumentToken, lastPrice, volume, open, high, low, close);
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
                
                if (mode >= MODE_LTP && mode <= MODE_FULL && buffer.remaining() >= 4) {
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
