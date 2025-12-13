# Index-Specific WebSocket Endpoint

## Overview

This document describes the new index-specific WebSocket endpoint that allows clients to subscribe to real-time stock data for instruments belonging to a specific index.

## Endpoint

```
/ws/stocks/nse/index/{indexName}
```

### Parameters

- `indexName`: The name of the index (URL-encoded if it contains spaces)
  - Examples: `NIFTY%2050`, `NIFTY%20BANK`, `NIFTY%20IT`

## Usage

### Frontend Connection (SockJS)

```typescript
const indexName = "NIFTY 50";
const baseUrl = "http://socketengine.tailce422e.ts.net:8081";
const endpoint = `/ws/stocks/nse/index/${encodeURIComponent(indexName)}`;
const sockJsUrl = `${baseUrl}${endpoint}`;
const sockjs = new SockJS(sockJsUrl);
```

### Example URLs

- NIFTY 50: `ws://socketengine.tailce422e.ts.net:8081/ws/stocks/nse/index/NIFTY%2050`
- NIFTY BANK: `ws://socketengine.tailce422e.ts.net:8081/ws/stocks/nse/index/NIFTY%20BANK`
- NIFTY IT: `ws://socketengine.tailce422e.ts.net:8081/ws/stocks/nse/index/NIFTY%20IT`

## Database Query

The endpoint uses the following SQL query to determine which instruments belong to an index:

```sql
SELECT DISTINCT 
    kim.exchange,
    kim.segment,
    kim.instrument_type as instrumentType,
    nesi.pd_sector_index as indexName,
    kim.tradingsymbol as tradingSymbol,
    kim.instrument_token as instrumentToken
FROM kite_instrument_master kim 
INNER JOIN nse_eq_sector_index nesi ON kim.tradingsymbol = nesi.symbol
WHERE kim.exchange = 'NSE' 
    AND kim.segment = 'NSE' 
    AND kim.instrument_type = 'EQ' 
    AND kim.expiry IS NULL 
    AND kim.lot_size = 1 
    AND kim.name IS NOT NULL 
    AND kim.name NOT LIKE '%LOAN%'
    AND nesi.pd_sector_index = :indexName
ORDER BY kim.tradingsymbol
```

## Data Flow

1. **Client Connection**: Client connects to the index-specific WebSocket endpoint
2. **Index Validation**: Server validates that the index name exists in the database
3. **Instrument Resolution**: Server queries the database to get all instruments for the index
4. **Kite Subscription**: Server subscribes to Kite WebSocket for the resolved instrument tokens
5. **Real-time Broadcasting**: Server broadcasts tick data only for instruments in the specified index

## REST API Endpoints

The following REST endpoints are available for testing and validation:

### Get All Available Indices
```
GET /api/indices
```

### Get Instruments by Index
```
GET /api/indices/{indexName}/instruments
```

### Get Instrument Tokens by Index
```
GET /api/indices/{indexName}/tokens
```

### Get Trading Symbols by Index
```
GET /api/indices/{indexName}/symbols
```

### Validate Index Name
```
GET /api/indices/{indexName}/validate
```

## Performance Optimizations

1. **Caching**: Index instrument queries are cached to avoid repeated database lookups
2. **Efficient Broadcasting**: Only stocks belonging to the subscribed index are broadcast to clients
3. **Connection Management**: Each index-specific connection is tracked separately
4. **Database Indexing**: Ensure proper indexes on `kite_instrument_master` and `nse_eq_sector_index` tables

## Error Handling

- **Invalid Index**: If an invalid index name is provided, the connection will be established but no data will be broadcast
- **Database Errors**: Database connection issues are logged but don't affect other connections
- **Kite API Errors**: Kite WebSocket failures are handled with automatic reconnection

## Monitoring

The following metrics are available:

- `socketengine.ticks.broadcast`: Counter for total ticks broadcast
- Active sessions per index via SessionManager
- Cache hit/miss rates for index queries

## Testing

Use the provided REST endpoints to test the functionality:

```bash
# Get all available indices
curl http://socketengine.tailce422e.ts.net:8081/api/indices

# Get instruments for NIFTY 50
curl "http://socketengine.tailce422e.ts.net:8081/api/indices/NIFTY%2050/instruments"

# Validate an index
curl "http://socketengine.tailce422e.ts.net:8081/api/indices/NIFTY%2050/validate"
```

## Frontend Integration

The frontend has been updated to:

1. Connect to index-specific endpoints based on dropdown selection
2. Automatically reconnect when the index changes
3. Handle URL encoding for index names with spaces
4. Provide fallback to all stocks if index-specific connection fails

## Database Schema Requirements

Ensure the following tables exist:

1. `kite_instrument_master`: Contains instrument details from Kite
2. `nse_eq_sector_index`: Contains index membership mapping

The join is performed on `kim.tradingsymbol = nesi.symbol` where `nesi.pd_sector_index` matches the requested index name.