/**
 * SocketEngine module for real-time market data streaming.
 * 
 * This module is responsible for:
 * - Connecting to Zerodha Kite WebSocket API
 * - Ingesting live market tick data
 * - Broadcasting ticks to frontend clients via WebSocket
 * - Caching intraday data in Redis
 * - Persisting historical data to TimescaleDB
 * 
 * The module follows Spring Modulith conventions with clear boundaries
 * and event-driven communication.
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "SocketEngine",
    allowedDependencies = {}
)
package com.moneytree.socketengine;
