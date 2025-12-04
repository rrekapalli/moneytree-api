-- Migration script to create strategy management tables
-- This script creates tables for:
-- 1. strategies - Master strategy data
-- 2. strategy_config - Strategy configuration (universe, entry/exit conditions, risk parameters)
-- 3. strategy_metrics - Strategy performance metrics over time
--
-- NOTE: backtest_runs and backtest_trades tables already exist and will be reused

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: Create strategies table
-- ============================================================================

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    risk_profile VARCHAR(50) CHECK (risk_profile IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
    is_active BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT strategies_user_name_uk UNIQUE (user_id, name)
);

-- Add indexes for performance optimization
CREATE INDEX idx_strategies_user ON strategies(user_id);
CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_strategies_updated ON strategies(updated_at DESC);
CREATE INDEX idx_strategies_user_active ON strategies(user_id, is_active);

-- Add table comment
COMMENT ON TABLE strategies IS 'Master table for trading strategies with basic metadata';
COMMENT ON COLUMN strategies.id IS 'Unique identifier for the strategy';
COMMENT ON COLUMN strategies.user_id IS 'Reference to the user who owns this strategy';
COMMENT ON COLUMN strategies.name IS 'User-defined name for the strategy';
COMMENT ON COLUMN strategies.description IS 'Optional description of the strategy';
COMMENT ON COLUMN strategies.risk_profile IS 'Risk profile: CONSERVATIVE, MODERATE, or AGGRESSIVE';
COMMENT ON COLUMN strategies.is_active IS 'Whether the strategy is currently active for trading';
COMMENT ON COLUMN strategies.created_at IS 'Timestamp when the strategy was created';
COMMENT ON COLUMN strategies.updated_at IS 'Timestamp when the strategy was last updated';

-- ============================================================================
-- STEP 2: Create strategy_config table
-- ============================================================================

CREATE TABLE strategy_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    universe_definition JSONB NOT NULL,
    allocations JSONB NOT NULL,
    entry_conditions JSONB NOT NULL,
    exit_conditions JSONB NOT NULL,
    risk_parameters JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT strategy_config_strategy_uk UNIQUE (strategy_id)
);

-- Add indexes for performance optimization
CREATE INDEX idx_strategy_config_strategy ON strategy_config(strategy_id);
CREATE INDEX idx_strategy_config_updated ON strategy_config(updated_at DESC);

-- Add GIN indexes for JSONB columns to enable efficient querying
CREATE INDEX idx_strategy_config_universe_gin ON strategy_config USING GIN (universe_definition);
CREATE INDEX idx_strategy_config_allocations_gin ON strategy_config USING GIN (allocations);
CREATE INDEX idx_strategy_config_entry_conditions_gin ON strategy_config USING GIN (entry_conditions);
CREATE INDEX idx_strategy_config_exit_conditions_gin ON strategy_config USING GIN (exit_conditions);
CREATE INDEX idx_strategy_config_risk_parameters_gin ON strategy_config USING GIN (risk_parameters);

-- Add table comment
COMMENT ON TABLE strategy_config IS 'Configuration details for strategies including universe, allocations, and trading conditions';
COMMENT ON COLUMN strategy_config.id IS 'Unique identifier for the configuration';
COMMENT ON COLUMN strategy_config.strategy_id IS 'Reference to the parent strategy';
COMMENT ON COLUMN strategy_config.universe_definition IS 'JSONB defining the universe of stocks (indices, sectors, custom symbols)';
COMMENT ON COLUMN strategy_config.allocations IS 'JSONB defining position sizing and capital allocation rules';
COMMENT ON COLUMN strategy_config.entry_conditions IS 'JSONB array of conditions that trigger buy signals';
COMMENT ON COLUMN strategy_config.exit_conditions IS 'JSONB array of conditions that trigger sell signals';
COMMENT ON COLUMN strategy_config.risk_parameters IS 'JSONB defining stop-loss, take-profit, and other risk management parameters';
COMMENT ON COLUMN strategy_config.created_at IS 'Timestamp when the configuration was created';
COMMENT ON COLUMN strategy_config.updated_at IS 'Timestamp when the configuration was last updated';

-- ============================================================================
-- STEP 3: Create strategy_metrics table
-- ============================================================================

CREATE TABLE strategy_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_return NUMERIC(10, 4),
    cagr NUMERIC(10, 4),
    sharpe_ratio NUMERIC(10, 4),
    sortino_ratio NUMERIC(10, 4),
    max_drawdown NUMERIC(10, 4),
    win_rate NUMERIC(5, 4),
    total_trades INTEGER,
    profit_factor NUMERIC(10, 4),
    avg_win NUMERIC(15, 2),
    avg_loss NUMERIC(15, 2),
    avg_holding_days NUMERIC(10, 2),
    max_consecutive_wins INTEGER,
    max_consecutive_losses INTEGER,
    expectancy NUMERIC(15, 2),
    calmar_ratio NUMERIC(10, 4),
    recovery_factor NUMERIC(10, 4),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT strategy_metrics_strategy_date_uk UNIQUE (strategy_id, metric_date)
);

-- Add indexes for performance optimization
CREATE INDEX idx_strategy_metrics_strategy ON strategy_metrics(strategy_id);
CREATE INDEX idx_strategy_metrics_date ON strategy_metrics(metric_date DESC);
CREATE INDEX idx_strategy_metrics_strategy_date ON strategy_metrics(strategy_id, metric_date DESC);
CREATE INDEX idx_strategy_metrics_performance ON strategy_metrics(total_return DESC, sharpe_ratio DESC);

-- Add table comment
COMMENT ON TABLE strategy_metrics IS 'Performance metrics for strategies tracked over time';
COMMENT ON COLUMN strategy_metrics.id IS 'Unique identifier for the metrics record';
COMMENT ON COLUMN strategy_metrics.strategy_id IS 'Reference to the parent strategy';
COMMENT ON COLUMN strategy_metrics.metric_date IS 'Date for which these metrics are calculated';
COMMENT ON COLUMN strategy_metrics.total_return IS 'Total return percentage';
COMMENT ON COLUMN strategy_metrics.cagr IS 'Compound Annual Growth Rate';
COMMENT ON COLUMN strategy_metrics.sharpe_ratio IS 'Risk-adjusted return metric (Sharpe Ratio)';
COMMENT ON COLUMN strategy_metrics.sortino_ratio IS 'Downside risk-adjusted return metric';
COMMENT ON COLUMN strategy_metrics.max_drawdown IS 'Maximum drawdown percentage';
COMMENT ON COLUMN strategy_metrics.win_rate IS 'Percentage of winning trades';
COMMENT ON COLUMN strategy_metrics.total_trades IS 'Total number of trades executed';
COMMENT ON COLUMN strategy_metrics.profit_factor IS 'Ratio of gross profit to gross loss';
COMMENT ON COLUMN strategy_metrics.avg_win IS 'Average profit per winning trade';
COMMENT ON COLUMN strategy_metrics.avg_loss IS 'Average loss per losing trade';
COMMENT ON COLUMN strategy_metrics.avg_holding_days IS 'Average number of days positions are held';
COMMENT ON COLUMN strategy_metrics.max_consecutive_wins IS 'Maximum number of consecutive winning trades';
COMMENT ON COLUMN strategy_metrics.max_consecutive_losses IS 'Maximum number of consecutive losing trades';
COMMENT ON COLUMN strategy_metrics.expectancy IS 'Expected value per trade';
COMMENT ON COLUMN strategy_metrics.calmar_ratio IS 'Return over maximum drawdown';
COMMENT ON COLUMN strategy_metrics.recovery_factor IS 'Net profit divided by maximum drawdown';
COMMENT ON COLUMN strategy_metrics.created_at IS 'Timestamp when the metrics were calculated';

-- ============================================================================
-- STEP 4: Create function to automatically update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Create triggers for automatic timestamp updates
-- ============================================================================

CREATE TRIGGER update_strategies_updated_at
    BEFORE UPDATE ON strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_config_updated_at
    BEFORE UPDATE ON strategy_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Add sample JSONB structure comments for documentation
-- ============================================================================

COMMENT ON COLUMN strategy_config.universe_definition IS 
'JSONB structure example:
{
  "type": "INDEX",
  "indices": ["NIFTY_500", "NIFTY_MIDCAP"],
  "sectors": ["Technology", "Finance"],
  "symbols": ["RELIANCE", "TCS", "INFY"]
}';

COMMENT ON COLUMN strategy_config.allocations IS 
'JSONB structure example:
{
  "positionSizingMethod": "EQUAL_WEIGHT",
  "maxPositionSize": 10.0,
  "maxPortfolioAllocation": 80.0,
  "cashReserve": 20.0
}';

COMMENT ON COLUMN strategy_config.entry_conditions IS 
'JSONB array structure example:
[
  {
    "id": "entry-1",
    "type": "TECHNICAL",
    "indicator": "RSI",
    "operator": "LT",
    "value": 30,
    "timeframe": "day",
    "logicalOperator": "AND"
  },
  {
    "id": "entry-2",
    "type": "PRICE",
    "indicator": "SMA",
    "operator": "CROSS_ABOVE",
    "value": 200,
    "timeframe": "day"
  }
]';

COMMENT ON COLUMN strategy_config.exit_conditions IS 
'JSONB array structure example:
[
  {
    "id": "exit-1",
    "type": "TECHNICAL",
    "indicator": "RSI",
    "operator": "GT",
    "value": 70,
    "timeframe": "day",
    "logicalOperator": "OR"
  },
  {
    "id": "exit-2",
    "type": "PRICE",
    "indicator": "SMA",
    "operator": "CROSS_BELOW",
    "value": 200,
    "timeframe": "day"
  }
]';

COMMENT ON COLUMN strategy_config.risk_parameters IS 
'JSONB structure example:
{
  "stopLossPercent": 5.0,
  "takeProfitPercent": 15.0,
  "trailingStopPercent": 3.0,
  "maxDrawdownPercent": 20.0,
  "maxDailyLoss": 10000.0
}';

-- ============================================================================
-- STEP 7: Grant permissions (adjust as needed for your security model)
-- ============================================================================

-- Note: Adjust these grants based on your application's user roles
-- GRANT SELECT, INSERT, UPDATE, DELETE ON strategies TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON strategy_config TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON strategy_metrics TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Summary:
-- - Created strategies table with UUID primary key
-- - Created strategy_config table with JSONB columns for flexible configuration
-- - Created strategy_metrics table for time-series performance tracking
-- - Added comprehensive indexes for query performance
-- - Added GIN indexes for JSONB columns to enable efficient querying
-- - Created triggers for automatic timestamp updates
-- - Added detailed comments for documentation
-- - Reusing existing backtest_runs and backtest_trades tables
