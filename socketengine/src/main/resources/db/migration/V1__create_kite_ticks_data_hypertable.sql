-- Create kite_ticks_data table for storing raw tick data from Kite WebSocket
-- This table will be converted to a TimescaleDB hypertable for efficient time-series storage

CREATE TABLE IF NOT EXISTS kite_ticks_data (
    instrument_token BIGINT NOT NULL,
    tradingsymbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    tick_timestamp TIMESTAMPTZ NOT NULL,
    raw_tick_data BYTEA NOT NULL,
    PRIMARY KEY (instrument_token, tick_timestamp)
);

-- Convert to TimescaleDB hypertable with 1-day chunk interval
-- This optimizes storage and query performance for time-series data
SELECT create_hypertable(
    'kite_ticks_data', 
    'tick_timestamp',
    if_not_exists => TRUE,
    chunk_time_interval => INTERVAL '1 day'
);

-- Create index for efficient queries by tradingsymbol
-- Useful for querying all ticks for a specific symbol over time
CREATE INDEX IF NOT EXISTS idx_kite_ticks_symbol_time 
    ON kite_ticks_data (tradingsymbol, tick_timestamp DESC);

-- Create index for efficient queries by exchange
-- Useful for querying all ticks from a specific exchange
CREATE INDEX IF NOT EXISTS idx_kite_ticks_exchange_time 
    ON kite_ticks_data (exchange, tick_timestamp DESC);

-- Create composite index for instrument_token queries
-- Useful for querying ticks for a specific instrument token
CREATE INDEX IF NOT EXISTS idx_kite_ticks_token_time 
    ON kite_ticks_data (instrument_token, tick_timestamp DESC);

-- Enable compression for older data (optional but recommended)
-- This significantly reduces storage requirements for historical data
ALTER TABLE kite_ticks_data SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'instrument_token, tradingsymbol, exchange'
);

-- Automatically compress chunks older than 7 days
-- This balances query performance with storage efficiency
SELECT add_compression_policy('kite_ticks_data', INTERVAL '7 days');
