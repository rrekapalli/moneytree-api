-- Migration script to convert all primary keys to UUID
-- This script preserves all existing data by:
-- 1. Adding new UUID columns
-- 2. Generating UUIDs for existing rows
-- 3. Updating foreign key references
-- 4. Dropping old columns and constraints
-- 5. Renaming new columns to original names
--
-- NOTE: kite_* tables are NOT modified as per requirements

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 0: Drop dependent views and foreign keys that will block migration
-- ============================================================================

-- Drop views that depend on columns we're changing
DROP VIEW IF EXISTS v_screener_last_results CASCADE;
DROP VIEW IF EXISTS v_screener_last_run CASCADE;
DROP VIEW IF EXISTS portfolio_holdings_summary CASCADE;

-- Drop foreign key constraints from dependent tables
ALTER TABLE screener_result_diff DROP CONSTRAINT IF EXISTS screener_result_diff_screener_run_id_fkey;
ALTER TABLE screener_result_diff DROP CONSTRAINT IF EXISTS screener_result_diff_prev_screener_run_id_fkey;
ALTER TABLE portfolio_cash_flows DROP CONSTRAINT IF EXISTS portfolio_cash_flows_reference_txn_id_fkey;

-- ============================================================================
-- STEP 1: Add temporary UUID columns for all tables (except kite_* tables)
-- ============================================================================

-- Users table
ALTER TABLE users ADD COLUMN id_new UUID;

-- Portfolios table
ALTER TABLE portfolios ADD COLUMN id_new UUID;

-- Portfolio sub-tables
ALTER TABLE portfolio_holdings ADD COLUMN id_new UUID;
ALTER TABLE open_positions ADD COLUMN position_id_new UUID;
ALTER TABLE portfolio_trades ADD COLUMN trade_id_new UUID;
ALTER TABLE portfolio_trade_logs ADD COLUMN id_new UUID;
ALTER TABLE pending_orders ADD COLUMN pending_order_id_new UUID;
ALTER TABLE portfolio_cash_flows ADD COLUMN id_new UUID;
ALTER TABLE __portfolio_transactions ADD COLUMN id_new UUID;
ALTER TABLE portfolio_valuation_daily ADD COLUMN id_new UUID;
ALTER TABLE portfolio_metrics_daily ADD COLUMN id_new UUID;
ALTER TABLE portfolio_holding_valuation_daily ADD COLUMN id_new UUID;
ALTER TABLE portfolio_stock_metrics_daily ADD COLUMN metric_id_new UUID;

-- Screener tables
ALTER TABLE screener ADD COLUMN screener_id_new UUID;
ALTER TABLE screener_version ADD COLUMN screener_version_id_new UUID;
ALTER TABLE screener_run ADD COLUMN screener_run_id_new UUID;
ALTER TABLE screener_functions ADD COLUMN function_id_new UUID;
ALTER TABLE screener_alert ADD COLUMN alert_id_new UUID;
ALTER TABLE screener_paramset ADD COLUMN paramset_id_new UUID;
ALTER TABLE screener_function_params ADD COLUMN param_id_new UUID;
ALTER TABLE screener_schedule ADD COLUMN schedule_id_new UUID;
ALTER TABLE screener_saved_view ADD COLUMN saved_view_id_new UUID;

-- Signal table
ALTER TABLE signals ADD COLUMN signal_id_new UUID;

-- Backtest tables (backtest_runs already uses UUID, only backtest_trades needs update)
ALTER TABLE backtest_trades ADD COLUMN trade_id_new UUID;

-- ============================================================================
-- STEP 2: Generate UUIDs for existing rows
-- ============================================================================

UPDATE users SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolios SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolio_holdings SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE open_positions SET position_id_new = gen_random_uuid() WHERE position_id_new IS NULL;
UPDATE portfolio_trades SET trade_id_new = gen_random_uuid() WHERE trade_id_new IS NULL;
UPDATE portfolio_trade_logs SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE pending_orders SET pending_order_id_new = gen_random_uuid() WHERE pending_order_id_new IS NULL;
UPDATE portfolio_cash_flows SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE __portfolio_transactions SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolio_valuation_daily SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolio_metrics_daily SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolio_holding_valuation_daily SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE portfolio_stock_metrics_daily SET metric_id_new = gen_random_uuid() WHERE metric_id_new IS NULL;
UPDATE screener SET screener_id_new = gen_random_uuid() WHERE screener_id_new IS NULL;
UPDATE screener_version SET screener_version_id_new = gen_random_uuid() WHERE screener_version_id_new IS NULL;
UPDATE screener_run SET screener_run_id_new = gen_random_uuid() WHERE screener_run_id_new IS NULL;
UPDATE screener_functions SET function_id_new = gen_random_uuid() WHERE function_id_new IS NULL;
UPDATE screener_alert SET alert_id_new = gen_random_uuid() WHERE alert_id_new IS NULL;
UPDATE screener_paramset SET paramset_id_new = gen_random_uuid() WHERE paramset_id_new IS NULL;
UPDATE screener_function_params SET param_id_new = gen_random_uuid() WHERE param_id_new IS NULL;
UPDATE screener_schedule SET schedule_id_new = gen_random_uuid() WHERE schedule_id_new IS NULL;
UPDATE screener_saved_view SET saved_view_id_new = gen_random_uuid() WHERE saved_view_id_new IS NULL;
UPDATE signals SET signal_id_new = gen_random_uuid() WHERE signal_id_new IS NULL;
UPDATE backtest_trades SET trade_id_new = gen_random_uuid() WHERE trade_id_new IS NULL;

-- ============================================================================
-- STEP 3: Update foreign key references to use new UUID columns
-- ============================================================================

-- Update portfolios.user_id to reference users.id_new
ALTER TABLE portfolios ADD COLUMN user_id_new UUID;
UPDATE portfolios p SET user_id_new = u.id_new FROM users u WHERE p.user_id = u.id;
ALTER TABLE portfolios ALTER COLUMN user_id_new SET NOT NULL;

-- Update portfolio_holdings.portfolio_id
ALTER TABLE portfolio_holdings ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_holdings ph SET portfolio_id_new = p.id_new FROM portfolios p WHERE ph.portfolio_id = p.id;
ALTER TABLE portfolio_holdings ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update open_positions.portfolio_id
ALTER TABLE open_positions ADD COLUMN portfolio_id_new UUID;
UPDATE open_positions op SET portfolio_id_new = p.id_new FROM portfolios p WHERE op.portfolio_id = p.id;
ALTER TABLE open_positions ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_trades.portfolio_id
ALTER TABLE portfolio_trades ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_trades pt SET portfolio_id_new = p.id_new FROM portfolios p WHERE pt.portfolio_id = p.id;
ALTER TABLE portfolio_trades ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_trade_logs.portfolio_id
ALTER TABLE portfolio_trade_logs ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_trade_logs ptl SET portfolio_id_new = p.id_new FROM portfolios p WHERE ptl.portfolio_id = p.id;
ALTER TABLE portfolio_trade_logs ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update pending_orders.portfolio_id
ALTER TABLE pending_orders ADD COLUMN portfolio_id_new UUID;
UPDATE pending_orders po SET portfolio_id_new = p.id_new FROM portfolios p WHERE po.portfolio_id = p.id;
ALTER TABLE pending_orders ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_cash_flows.portfolio_id
ALTER TABLE portfolio_cash_flows ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_cash_flows pcf SET portfolio_id_new = p.id_new FROM portfolios p WHERE pcf.portfolio_id = p.id;
ALTER TABLE portfolio_cash_flows ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update __portfolio_transactions.portfolio_id
ALTER TABLE __portfolio_transactions ADD COLUMN portfolio_id_new UUID;
UPDATE __portfolio_transactions ptx SET portfolio_id_new = p.id_new FROM portfolios p WHERE ptx.portfolio_id = p.id;
ALTER TABLE __portfolio_transactions ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_valuation_daily.portfolio_id
ALTER TABLE portfolio_valuation_daily ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_valuation_daily pvd SET portfolio_id_new = p.id_new FROM portfolios p WHERE pvd.portfolio_id = p.id;
ALTER TABLE portfolio_valuation_daily ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_metrics_daily.portfolio_id
ALTER TABLE portfolio_metrics_daily ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_metrics_daily pmd SET portfolio_id_new = p.id_new FROM portfolios p WHERE pmd.portfolio_id = p.id;
ALTER TABLE portfolio_metrics_daily ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_holding_valuation_daily.portfolio_id
ALTER TABLE portfolio_holding_valuation_daily ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_holding_valuation_daily phvd SET portfolio_id_new = p.id_new FROM portfolios p WHERE phvd.portfolio_id = p.id;
ALTER TABLE portfolio_holding_valuation_daily ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update portfolio_stock_metrics_daily.portfolio_id
ALTER TABLE portfolio_stock_metrics_daily ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_stock_metrics_daily psmd SET portfolio_id_new = p.id_new FROM portfolios p WHERE psmd.portfolio_id = p.id;
ALTER TABLE portfolio_stock_metrics_daily ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update signals.portfolio_id
ALTER TABLE signals ADD COLUMN portfolio_id_new UUID;
UPDATE signals s SET portfolio_id_new = p.id_new FROM portfolios p WHERE s.portfolio_id = p.id;
ALTER TABLE signals ALTER COLUMN portfolio_id_new SET NOT NULL;

-- Update backtest_trades.run_id (already UUID, but ensure consistency)
-- No change needed as run_id already references backtest_runs.run_id which is UUID

-- Update screener.owner_user_id
ALTER TABLE screener ADD COLUMN owner_user_id_new UUID;
UPDATE screener sc SET owner_user_id_new = u.id_new FROM users u WHERE sc.owner_user_id = u.id;
ALTER TABLE screener ALTER COLUMN owner_user_id_new SET NOT NULL;

-- Update screener_version.screener_id
ALTER TABLE screener_version ADD COLUMN screener_id_new UUID;
UPDATE screener_version sv SET screener_id_new = s.screener_id_new FROM screener s WHERE sv.screener_id = s.screener_id;
ALTER TABLE screener_version ALTER COLUMN screener_id_new SET NOT NULL;

-- Update screener_run.screener_id
ALTER TABLE screener_run ADD COLUMN screener_id_new UUID;
UPDATE screener_run sr SET screener_id_new = s.screener_id_new FROM screener s WHERE sr.screener_id = s.screener_id;
ALTER TABLE screener_run ALTER COLUMN screener_id_new SET NOT NULL;

-- Update screener_run.screener_version_id
ALTER TABLE screener_run ADD COLUMN screener_version_id_new UUID;
UPDATE screener_run sr SET screener_version_id_new = sv.screener_version_id_new FROM screener_version sv WHERE sr.screener_version_id = sv.screener_version_id;
ALTER TABLE screener_run ALTER COLUMN screener_version_id_new SET NOT NULL;

-- Update screener_run.triggered_by_user_id (nullable)
ALTER TABLE screener_run ADD COLUMN triggered_by_user_id_new UUID;
UPDATE screener_run sr SET triggered_by_user_id_new = u.id_new FROM users u WHERE sr.triggered_by_user_id = u.id;

-- Update screener_run.paramset_id (nullable)
ALTER TABLE screener_run ADD COLUMN paramset_id_new UUID;
UPDATE screener_run sr SET paramset_id_new = sp.paramset_id_new FROM screener_paramset sp WHERE sr.paramset_id = sp.paramset_id;

-- Update screener_alert.screener_id
ALTER TABLE screener_alert ADD COLUMN screener_id_new UUID;
UPDATE screener_alert sa SET screener_id_new = s.screener_id_new FROM screener s WHERE sa.screener_id = s.screener_id;
ALTER TABLE screener_alert ALTER COLUMN screener_id_new SET NOT NULL;

-- Update screener_paramset.screener_version_id
ALTER TABLE screener_paramset ADD COLUMN screener_version_id_new UUID;
UPDATE screener_paramset sp SET screener_version_id_new = sv.screener_version_id_new FROM screener_version sv WHERE sp.screener_version_id = sv.screener_version_id;
ALTER TABLE screener_paramset ALTER COLUMN screener_version_id_new SET NOT NULL;

-- Update screener_paramset.created_by_user_id
ALTER TABLE screener_paramset ADD COLUMN created_by_user_id_new UUID;
UPDATE screener_paramset sp SET created_by_user_id_new = u.id_new FROM users u WHERE sp.created_by_user_id = u.id;
ALTER TABLE screener_paramset ALTER COLUMN created_by_user_id_new SET NOT NULL;

-- Update screener_function_params.function_id
ALTER TABLE screener_function_params ADD COLUMN function_id_new UUID;
UPDATE screener_function_params sfp SET function_id_new = sf.function_id_new FROM screener_functions sf WHERE sfp.function_id = sf.function_id;
ALTER TABLE screener_function_params ALTER COLUMN function_id_new SET NOT NULL;

-- Update screener_schedule.screener_id
ALTER TABLE screener_schedule ADD COLUMN screener_id_new UUID;
UPDATE screener_schedule ss SET screener_id_new = s.screener_id_new FROM screener s WHERE ss.screener_id = s.screener_id;
ALTER TABLE screener_schedule ALTER COLUMN screener_id_new SET NOT NULL;

-- Update screener_saved_view.screener_id
ALTER TABLE screener_saved_view ADD COLUMN screener_id_new UUID;
UPDATE screener_saved_view ssv SET screener_id_new = s.screener_id_new FROM screener s WHERE ssv.screener_id = s.screener_id;
ALTER TABLE screener_saved_view ALTER COLUMN screener_id_new SET NOT NULL;

-- Update screener_saved_view.user_id
ALTER TABLE screener_saved_view ADD COLUMN user_id_new UUID;
UPDATE screener_saved_view ssv SET user_id_new = u.id_new FROM users u WHERE ssv.user_id = u.id;
ALTER TABLE screener_saved_view ALTER COLUMN user_id_new SET NOT NULL;

-- Update composite key tables' foreign key columns
-- screener_star.user_id
ALTER TABLE screener_star ADD COLUMN user_id_new UUID;
UPDATE screener_star ss SET user_id_new = u.id_new FROM users u WHERE ss.user_id = u.id;
ALTER TABLE screener_star ALTER COLUMN user_id_new SET NOT NULL;

-- screener_star.screener_id
ALTER TABLE screener_star ADD COLUMN screener_id_new UUID;
UPDATE screener_star ss SET screener_id_new = s.screener_id_new FROM screener s WHERE ss.screener_id = s.screener_id;
ALTER TABLE screener_star ALTER COLUMN screener_id_new SET NOT NULL;

-- screener_result.screener_run_id
ALTER TABLE screener_result ADD COLUMN screener_run_id_new UUID;
UPDATE screener_result sr SET screener_run_id_new = srun.screener_run_id_new FROM screener_run srun WHERE sr.screener_run_id = srun.screener_run_id;
ALTER TABLE screener_result ALTER COLUMN screener_run_id_new SET NOT NULL;

-- portfolio_benchmarks.portfolio_id
ALTER TABLE portfolio_benchmarks ADD COLUMN portfolio_id_new UUID;
UPDATE portfolio_benchmarks pb SET portfolio_id_new = p.id_new FROM portfolios p WHERE pb.portfolio_id = p.id;
ALTER TABLE portfolio_benchmarks ALTER COLUMN portfolio_id_new SET NOT NULL;

-- screener_alert_delivery_channels.alert_id
ALTER TABLE screener_alert_delivery_channels ADD COLUMN alert_id_new UUID;
UPDATE screener_alert_delivery_channels sadc SET alert_id_new = sa.alert_id_new FROM screener_alert sa WHERE sadc.alert_id = sa.alert_id;
ALTER TABLE screener_alert_delivery_channels ALTER COLUMN alert_id_new SET NOT NULL;

-- Update screener_result_diff foreign key columns (this table has composite primary key)
ALTER TABLE screener_result_diff ADD COLUMN screener_run_id_new UUID;
UPDATE screener_result_diff srd SET screener_run_id_new = srun.screener_run_id_new FROM screener_run srun WHERE srd.screener_run_id = srun.screener_run_id;
ALTER TABLE screener_result_diff ALTER COLUMN screener_run_id_new SET NOT NULL;

ALTER TABLE screener_result_diff ADD COLUMN prev_screener_run_id_new UUID;
UPDATE screener_result_diff srd SET prev_screener_run_id_new = srun.screener_run_id_new FROM screener_run srun WHERE srd.prev_screener_run_id = srun.screener_run_id;
ALTER TABLE screener_result_diff ALTER COLUMN prev_screener_run_id_new SET NOT NULL;

-- Update portfolio_cash_flows.reference_txn_id (nullable foreign key to __portfolio_transactions)
ALTER TABLE portfolio_cash_flows ADD COLUMN reference_txn_id_new UUID;
UPDATE portfolio_cash_flows pcf SET reference_txn_id_new = ptx.id_new FROM __portfolio_transactions ptx WHERE pcf.reference_txn_id = ptx.id;

-- ============================================================================
-- STEP 4: Drop old foreign key constraints and indexes
-- ============================================================================

-- Drop foreign key constraints
ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_user_id_fkey;
ALTER TABLE portfolio_holdings DROP CONSTRAINT IF EXISTS portfolio_holdings_portfolio_id_fkey;
ALTER TABLE open_positions DROP CONSTRAINT IF EXISTS open_positions_portfolio_id_fkey;
ALTER TABLE portfolio_trades DROP CONSTRAINT IF EXISTS portfolio_trades_portfolio_id_fkey;
ALTER TABLE portfolio_trade_logs DROP CONSTRAINT IF EXISTS fk_portfolio;
ALTER TABLE pending_orders DROP CONSTRAINT IF EXISTS pending_orders_portfolio_id_fkey;
ALTER TABLE portfolio_cash_flows DROP CONSTRAINT IF EXISTS portfolio_cash_flows_portfolio_id_fkey;
ALTER TABLE __portfolio_transactions DROP CONSTRAINT IF EXISTS portfolio_transactions_portfolio_id_fkey;
ALTER TABLE portfolio_valuation_daily DROP CONSTRAINT IF EXISTS portfolio_valuation_daily_portfolio_id_fkey;
ALTER TABLE portfolio_metrics_daily DROP CONSTRAINT IF EXISTS portfolio_metrics_daily_portfolio_id_fkey;
ALTER TABLE portfolio_holding_valuation_daily DROP CONSTRAINT IF EXISTS portfolio_holding_valuation_daily_portfolio_id_fkey;
ALTER TABLE portfolio_stock_metrics_daily DROP CONSTRAINT IF EXISTS portfolio_stock_metrics_daily_portfolio_id_fkey;
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_portfolio_id_fkey;
ALTER TABLE screener DROP CONSTRAINT IF EXISTS screener_owner_user_id_fkey;
ALTER TABLE screener_version DROP CONSTRAINT IF EXISTS screener_version_screener_id_fkey;
ALTER TABLE screener_run DROP CONSTRAINT IF EXISTS screener_run_screener_id_fkey;
ALTER TABLE screener_run DROP CONSTRAINT IF EXISTS screener_run_screener_version_id_fkey;
ALTER TABLE screener_run DROP CONSTRAINT IF EXISTS screener_run_triggered_by_user_id_fkey;
ALTER TABLE screener_run DROP CONSTRAINT IF EXISTS screener_run_paramset_id_fkey;
ALTER TABLE screener_alert DROP CONSTRAINT IF EXISTS screener_alert_screener_id_fkey;
ALTER TABLE screener_paramset DROP CONSTRAINT IF EXISTS screener_paramset_screener_version_id_fkey;
ALTER TABLE screener_paramset DROP CONSTRAINT IF EXISTS screener_paramset_created_by_user_id_fkey;
ALTER TABLE screener_function_params DROP CONSTRAINT IF EXISTS fkh5k1r7ucggleg6sio0toji0ma;
ALTER TABLE screener_schedule DROP CONSTRAINT IF EXISTS screener_schedule_screener_id_fkey;
ALTER TABLE screener_saved_view DROP CONSTRAINT IF EXISTS screener_saved_view_screener_id_fkey;
ALTER TABLE screener_saved_view DROP CONSTRAINT IF EXISTS screener_saved_view_user_id_fkey;
ALTER TABLE backtest_trades DROP CONSTRAINT IF EXISTS backtest_trades_run_id_fkey;

-- Drop foreign key constraints for composite key tables (these reference tables we're modifying)
ALTER TABLE screener_star DROP CONSTRAINT IF EXISTS screener_star_user_id_fkey;
ALTER TABLE screener_star DROP CONSTRAINT IF EXISTS screener_star_screener_id_fkey;
ALTER TABLE screener_result DROP CONSTRAINT IF EXISTS screener_result_screener_run_id_fkey;
ALTER TABLE portfolio_benchmarks DROP CONSTRAINT IF EXISTS portfolio_benchmarks_portfolio_id_fkey;
ALTER TABLE screener_alert_delivery_channels DROP CONSTRAINT IF EXISTS fk43npt3486b9ujqxr6i5ftnek3;

-- ============================================================================
-- STEP 5: Drop old primary key constraints
-- ============================================================================

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_pkey;
ALTER TABLE portfolio_holdings DROP CONSTRAINT IF EXISTS portfolio_holdings_pkey;
ALTER TABLE open_positions DROP CONSTRAINT IF EXISTS open_positions_pkey;
ALTER TABLE portfolio_trades DROP CONSTRAINT IF EXISTS portfolio_trades_pkey;
ALTER TABLE portfolio_trade_logs DROP CONSTRAINT IF EXISTS portfolio_trade_logs_pkey;
ALTER TABLE pending_orders DROP CONSTRAINT IF EXISTS pending_orders_pkey;
ALTER TABLE portfolio_cash_flows DROP CONSTRAINT IF EXISTS portfolio_cash_flows_pkey;
ALTER TABLE __portfolio_transactions DROP CONSTRAINT IF EXISTS __portfolio_transactions_pkey;
ALTER TABLE portfolio_valuation_daily DROP CONSTRAINT IF EXISTS portfolio_valuation_daily_pkey;
ALTER TABLE portfolio_metrics_daily DROP CONSTRAINT IF EXISTS portfolio_metrics_daily_pkey;
ALTER TABLE portfolio_holding_valuation_daily DROP CONSTRAINT IF EXISTS portfolio_holding_valuation_daily_pkey;
ALTER TABLE portfolio_stock_metrics_daily DROP CONSTRAINT IF EXISTS portfolio_stock_metrics_daily_pkey;
ALTER TABLE screener DROP CONSTRAINT IF EXISTS screener_pkey;
ALTER TABLE screener_version DROP CONSTRAINT IF EXISTS screener_version_pkey;
ALTER TABLE screener_run DROP CONSTRAINT IF EXISTS screener_run_pkey;
ALTER TABLE screener_functions DROP CONSTRAINT IF EXISTS screener_functions_pkey;
ALTER TABLE screener_alert DROP CONSTRAINT IF EXISTS screener_alert_pkey;
ALTER TABLE screener_paramset DROP CONSTRAINT IF EXISTS screener_paramset_pkey;
ALTER TABLE screener_function_params DROP CONSTRAINT IF EXISTS screener_function_params_pkey;
ALTER TABLE screener_schedule DROP CONSTRAINT IF EXISTS screener_schedule_pkey;
ALTER TABLE screener_saved_view DROP CONSTRAINT IF EXISTS screener_saved_view_pkey;
ALTER TABLE signals DROP CONSTRAINT IF EXISTS signals_pkey;
ALTER TABLE backtest_trades DROP CONSTRAINT IF EXISTS backtest_trades_pkey;

-- ============================================================================
-- STEP 6: Drop old columns and rename new columns
-- ============================================================================

-- Users
ALTER TABLE users DROP COLUMN id;
ALTER TABLE users RENAME COLUMN id_new TO id;
ALTER TABLE users ALTER COLUMN id SET NOT NULL;
ALTER TABLE users ADD PRIMARY KEY (id);

-- Portfolios
ALTER TABLE portfolios DROP COLUMN id;
ALTER TABLE portfolios DROP COLUMN user_id;
ALTER TABLE portfolios RENAME COLUMN id_new TO id;
ALTER TABLE portfolios RENAME COLUMN user_id_new TO user_id;
ALTER TABLE portfolios ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolios ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE portfolios ADD PRIMARY KEY (id);
ALTER TABLE portfolios ADD CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Portfolio Holdings
ALTER TABLE portfolio_holdings DROP COLUMN id;
ALTER TABLE portfolio_holdings DROP COLUMN portfolio_id;
ALTER TABLE portfolio_holdings RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_holdings RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_holdings ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_holdings ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_holdings ADD PRIMARY KEY (id);
ALTER TABLE portfolio_holdings ADD CONSTRAINT portfolio_holdings_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Open Positions
ALTER TABLE open_positions DROP COLUMN position_id;
ALTER TABLE open_positions DROP COLUMN portfolio_id;
ALTER TABLE open_positions RENAME COLUMN position_id_new TO position_id;
ALTER TABLE open_positions RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE open_positions ALTER COLUMN position_id SET NOT NULL;
ALTER TABLE open_positions ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE open_positions ADD PRIMARY KEY (position_id);
ALTER TABLE open_positions ADD CONSTRAINT open_positions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Trades
ALTER TABLE portfolio_trades DROP COLUMN trade_id;
ALTER TABLE portfolio_trades DROP COLUMN portfolio_id;
ALTER TABLE portfolio_trades RENAME COLUMN trade_id_new TO trade_id;
ALTER TABLE portfolio_trades RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_trades ALTER COLUMN trade_id SET NOT NULL;
ALTER TABLE portfolio_trades ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_trades ADD PRIMARY KEY (trade_id);
ALTER TABLE portfolio_trades ADD CONSTRAINT portfolio_trades_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Trade Logs
ALTER TABLE portfolio_trade_logs DROP COLUMN id;
ALTER TABLE portfolio_trade_logs DROP COLUMN portfolio_id;
ALTER TABLE portfolio_trade_logs RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_trade_logs RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_trade_logs ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_trade_logs ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_trade_logs ADD PRIMARY KEY (id);
ALTER TABLE portfolio_trade_logs ADD CONSTRAINT fk_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Pending Orders
ALTER TABLE pending_orders DROP COLUMN pending_order_id;
ALTER TABLE pending_orders DROP COLUMN portfolio_id;
ALTER TABLE pending_orders RENAME COLUMN pending_order_id_new TO pending_order_id;
ALTER TABLE pending_orders RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE pending_orders ALTER COLUMN pending_order_id SET NOT NULL;
ALTER TABLE pending_orders ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE pending_orders ADD PRIMARY KEY (pending_order_id);
ALTER TABLE pending_orders ADD CONSTRAINT pending_orders_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Cash Flows
ALTER TABLE portfolio_cash_flows DROP COLUMN id;
ALTER TABLE portfolio_cash_flows DROP COLUMN portfolio_id;
ALTER TABLE portfolio_cash_flows RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_cash_flows RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_cash_flows ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_cash_flows ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_cash_flows ADD PRIMARY KEY (id);
ALTER TABLE portfolio_cash_flows ADD CONSTRAINT portfolio_cash_flows_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Transactions
ALTER TABLE __portfolio_transactions DROP COLUMN id;
ALTER TABLE __portfolio_transactions DROP COLUMN portfolio_id;
ALTER TABLE __portfolio_transactions RENAME COLUMN id_new TO id;
ALTER TABLE __portfolio_transactions RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE __portfolio_transactions ALTER COLUMN id SET NOT NULL;
ALTER TABLE __portfolio_transactions ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE __portfolio_transactions ADD PRIMARY KEY (id);
ALTER TABLE __portfolio_transactions ADD CONSTRAINT portfolio_transactions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Valuation Daily
ALTER TABLE portfolio_valuation_daily DROP COLUMN id;
ALTER TABLE portfolio_valuation_daily DROP COLUMN portfolio_id;
ALTER TABLE portfolio_valuation_daily RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_valuation_daily RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_valuation_daily ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_valuation_daily ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_valuation_daily ADD PRIMARY KEY (id);
ALTER TABLE portfolio_valuation_daily ADD CONSTRAINT portfolio_valuation_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Metrics Daily
ALTER TABLE portfolio_metrics_daily DROP COLUMN id;
ALTER TABLE portfolio_metrics_daily DROP COLUMN portfolio_id;
ALTER TABLE portfolio_metrics_daily RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_metrics_daily RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_metrics_daily ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_metrics_daily ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_metrics_daily ADD PRIMARY KEY (id);
ALTER TABLE portfolio_metrics_daily ADD CONSTRAINT portfolio_metrics_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Holding Valuation Daily
ALTER TABLE portfolio_holding_valuation_daily DROP COLUMN id;
ALTER TABLE portfolio_holding_valuation_daily DROP COLUMN portfolio_id;
ALTER TABLE portfolio_holding_valuation_daily RENAME COLUMN id_new TO id;
ALTER TABLE portfolio_holding_valuation_daily RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_holding_valuation_daily ALTER COLUMN id SET NOT NULL;
ALTER TABLE portfolio_holding_valuation_daily ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_holding_valuation_daily ADD PRIMARY KEY (id);
ALTER TABLE portfolio_holding_valuation_daily ADD CONSTRAINT portfolio_holding_valuation_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Portfolio Stock Metrics Daily
ALTER TABLE portfolio_stock_metrics_daily DROP COLUMN metric_id;
ALTER TABLE portfolio_stock_metrics_daily DROP COLUMN portfolio_id;
ALTER TABLE portfolio_stock_metrics_daily RENAME COLUMN metric_id_new TO metric_id;
ALTER TABLE portfolio_stock_metrics_daily RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_stock_metrics_daily ALTER COLUMN metric_id SET NOT NULL;
ALTER TABLE portfolio_stock_metrics_daily ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_stock_metrics_daily ADD PRIMARY KEY (metric_id);
ALTER TABLE portfolio_stock_metrics_daily ADD CONSTRAINT portfolio_stock_metrics_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Signals
ALTER TABLE signals DROP COLUMN signal_id;
ALTER TABLE signals DROP COLUMN portfolio_id;
ALTER TABLE signals RENAME COLUMN signal_id_new TO signal_id;
ALTER TABLE signals RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE signals ALTER COLUMN signal_id SET NOT NULL;
ALTER TABLE signals ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE signals ADD PRIMARY KEY (signal_id);
ALTER TABLE signals ADD CONSTRAINT signals_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Backtest Trades
ALTER TABLE backtest_trades DROP COLUMN trade_id;
ALTER TABLE backtest_trades RENAME COLUMN trade_id_new TO trade_id;
ALTER TABLE backtest_trades ALTER COLUMN trade_id SET NOT NULL;
ALTER TABLE backtest_trades ADD PRIMARY KEY (trade_id);
ALTER TABLE backtest_trades ADD CONSTRAINT backtest_trades_run_id_fkey FOREIGN KEY (run_id) REFERENCES backtest_runs(run_id) ON DELETE CASCADE;

-- Screener
ALTER TABLE screener DROP COLUMN screener_id;
ALTER TABLE screener DROP COLUMN owner_user_id;
ALTER TABLE screener RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener RENAME COLUMN owner_user_id_new TO owner_user_id;
ALTER TABLE screener ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener ALTER COLUMN owner_user_id SET NOT NULL;
ALTER TABLE screener ADD PRIMARY KEY (screener_id);
ALTER TABLE screener ADD CONSTRAINT screener_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Screener Version
ALTER TABLE screener_version DROP COLUMN screener_version_id;
ALTER TABLE screener_version DROP COLUMN screener_id;
ALTER TABLE screener_version RENAME COLUMN screener_version_id_new TO screener_version_id;
ALTER TABLE screener_version RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_version ALTER COLUMN screener_version_id SET NOT NULL;
ALTER TABLE screener_version ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_version ADD PRIMARY KEY (screener_version_id);
ALTER TABLE screener_version ADD CONSTRAINT screener_version_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;

-- Screener Run
ALTER TABLE screener_run DROP COLUMN screener_run_id;
ALTER TABLE screener_run DROP COLUMN screener_id;
ALTER TABLE screener_run DROP COLUMN screener_version_id;
ALTER TABLE screener_run DROP COLUMN IF EXISTS triggered_by_user_id;
ALTER TABLE screener_run DROP COLUMN IF EXISTS paramset_id;
ALTER TABLE screener_run RENAME COLUMN screener_run_id_new TO screener_run_id;
ALTER TABLE screener_run RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_run RENAME COLUMN screener_version_id_new TO screener_version_id;
ALTER TABLE screener_run RENAME COLUMN triggered_by_user_id_new TO triggered_by_user_id;
ALTER TABLE screener_run RENAME COLUMN paramset_id_new TO paramset_id;
ALTER TABLE screener_run ALTER COLUMN screener_run_id SET NOT NULL;
ALTER TABLE screener_run ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_run ALTER COLUMN screener_version_id SET NOT NULL;
ALTER TABLE screener_run ADD PRIMARY KEY (screener_run_id);
ALTER TABLE screener_run ADD CONSTRAINT screener_run_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;
ALTER TABLE screener_run ADD CONSTRAINT screener_run_screener_version_id_fkey FOREIGN KEY (screener_version_id) REFERENCES screener_version(screener_version_id) ON DELETE CASCADE;
ALTER TABLE screener_run ADD CONSTRAINT screener_run_triggered_by_user_id_fkey FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE screener_run ADD CONSTRAINT screener_run_paramset_id_fkey FOREIGN KEY (paramset_id) REFERENCES screener_paramset(paramset_id) ON DELETE SET NULL;

-- Screener Functions
ALTER TABLE screener_functions DROP COLUMN function_id;
ALTER TABLE screener_functions RENAME COLUMN function_id_new TO function_id;
ALTER TABLE screener_functions ALTER COLUMN function_id SET NOT NULL;
ALTER TABLE screener_functions ADD PRIMARY KEY (function_id);

-- Screener Alert
ALTER TABLE screener_alert DROP COLUMN alert_id;
ALTER TABLE screener_alert DROP COLUMN screener_id;
ALTER TABLE screener_alert RENAME COLUMN alert_id_new TO alert_id;
ALTER TABLE screener_alert RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_alert ALTER COLUMN alert_id SET NOT NULL;
ALTER TABLE screener_alert ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_alert ADD PRIMARY KEY (alert_id);
ALTER TABLE screener_alert ADD CONSTRAINT screener_alert_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;

-- Screener Paramset
ALTER TABLE screener_paramset DROP COLUMN paramset_id;
ALTER TABLE screener_paramset DROP COLUMN screener_version_id;
ALTER TABLE screener_paramset DROP COLUMN created_by_user_id;
ALTER TABLE screener_paramset RENAME COLUMN paramset_id_new TO paramset_id;
ALTER TABLE screener_paramset RENAME COLUMN screener_version_id_new TO screener_version_id;
ALTER TABLE screener_paramset RENAME COLUMN created_by_user_id_new TO created_by_user_id;
ALTER TABLE screener_paramset ALTER COLUMN paramset_id SET NOT NULL;
ALTER TABLE screener_paramset ALTER COLUMN screener_version_id SET NOT NULL;
ALTER TABLE screener_paramset ALTER COLUMN created_by_user_id SET NOT NULL;
ALTER TABLE screener_paramset ADD PRIMARY KEY (paramset_id);
ALTER TABLE screener_paramset ADD CONSTRAINT screener_paramset_screener_version_id_fkey FOREIGN KEY (screener_version_id) REFERENCES screener_version(screener_version_id) ON DELETE CASCADE;
ALTER TABLE screener_paramset ADD CONSTRAINT screener_paramset_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Screener Function Params
ALTER TABLE screener_function_params DROP COLUMN param_id;
ALTER TABLE screener_function_params DROP COLUMN function_id;
ALTER TABLE screener_function_params RENAME COLUMN param_id_new TO param_id;
ALTER TABLE screener_function_params RENAME COLUMN function_id_new TO function_id;
ALTER TABLE screener_function_params ALTER COLUMN param_id SET NOT NULL;
ALTER TABLE screener_function_params ALTER COLUMN function_id SET NOT NULL;
ALTER TABLE screener_function_params ADD PRIMARY KEY (param_id);
ALTER TABLE screener_function_params ADD CONSTRAINT fkh5k1r7ucggleg6sio0toji0ma FOREIGN KEY (function_id) REFERENCES screener_functions(function_id) ON DELETE CASCADE;

-- Screener Schedule
ALTER TABLE screener_schedule DROP COLUMN schedule_id;
ALTER TABLE screener_schedule DROP COLUMN screener_id;
ALTER TABLE screener_schedule RENAME COLUMN schedule_id_new TO schedule_id;
ALTER TABLE screener_schedule RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_schedule ALTER COLUMN schedule_id SET NOT NULL;
ALTER TABLE screener_schedule ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_schedule ADD PRIMARY KEY (schedule_id);
ALTER TABLE screener_schedule ADD CONSTRAINT screener_schedule_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;

-- Screener Saved View
ALTER TABLE screener_saved_view DROP COLUMN saved_view_id;
ALTER TABLE screener_saved_view DROP COLUMN screener_id;
ALTER TABLE screener_saved_view DROP COLUMN user_id;
ALTER TABLE screener_saved_view RENAME COLUMN saved_view_id_new TO saved_view_id;
ALTER TABLE screener_saved_view RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_saved_view RENAME COLUMN user_id_new TO user_id;
ALTER TABLE screener_saved_view ALTER COLUMN saved_view_id SET NOT NULL;
ALTER TABLE screener_saved_view ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_saved_view ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE screener_saved_view ADD PRIMARY KEY (saved_view_id);
ALTER TABLE screener_saved_view ADD CONSTRAINT screener_saved_view_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;
ALTER TABLE screener_saved_view ADD CONSTRAINT screener_saved_view_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update composite key tables' foreign key columns (these tables keep their composite primary keys)
-- Screener Star
ALTER TABLE screener_star DROP COLUMN user_id;
ALTER TABLE screener_star DROP COLUMN screener_id;
ALTER TABLE screener_star RENAME COLUMN user_id_new TO user_id;
ALTER TABLE screener_star RENAME COLUMN screener_id_new TO screener_id;
ALTER TABLE screener_star ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE screener_star ALTER COLUMN screener_id SET NOT NULL;
ALTER TABLE screener_star ADD CONSTRAINT screener_star_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE screener_star ADD CONSTRAINT screener_star_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES screener(screener_id) ON DELETE CASCADE;

-- Screener Result
ALTER TABLE screener_result DROP COLUMN screener_run_id;
ALTER TABLE screener_result RENAME COLUMN screener_run_id_new TO screener_run_id;
ALTER TABLE screener_result ALTER COLUMN screener_run_id SET NOT NULL;
ALTER TABLE screener_result ADD CONSTRAINT screener_result_screener_run_id_fkey FOREIGN KEY (screener_run_id) REFERENCES screener_run(screener_run_id) ON DELETE CASCADE;

-- Screener Result Diff (composite primary key table)
ALTER TABLE screener_result_diff DROP COLUMN screener_run_id;
ALTER TABLE screener_result_diff DROP COLUMN prev_screener_run_id;
ALTER TABLE screener_result_diff RENAME COLUMN screener_run_id_new TO screener_run_id;
ALTER TABLE screener_result_diff RENAME COLUMN prev_screener_run_id_new TO prev_screener_run_id;
ALTER TABLE screener_result_diff ALTER COLUMN screener_run_id SET NOT NULL;
ALTER TABLE screener_result_diff ALTER COLUMN prev_screener_run_id SET NOT NULL;
ALTER TABLE screener_result_diff ADD CONSTRAINT screener_result_diff_screener_run_id_fkey FOREIGN KEY (screener_run_id) REFERENCES screener_run(screener_run_id) ON DELETE CASCADE;
ALTER TABLE screener_result_diff ADD CONSTRAINT screener_result_diff_prev_screener_run_id_fkey FOREIGN KEY (prev_screener_run_id) REFERENCES screener_run(screener_run_id) ON DELETE CASCADE;

-- Portfolio Cash Flows - update reference_txn_id
ALTER TABLE portfolio_cash_flows DROP COLUMN IF EXISTS reference_txn_id;
ALTER TABLE portfolio_cash_flows RENAME COLUMN reference_txn_id_new TO reference_txn_id;
ALTER TABLE portfolio_cash_flows ADD CONSTRAINT portfolio_cash_flows_reference_txn_id_fkey FOREIGN KEY (reference_txn_id) REFERENCES __portfolio_transactions(id) ON DELETE SET NULL;

-- Portfolio Benchmarks
ALTER TABLE portfolio_benchmarks DROP COLUMN portfolio_id;
ALTER TABLE portfolio_benchmarks RENAME COLUMN portfolio_id_new TO portfolio_id;
ALTER TABLE portfolio_benchmarks ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE portfolio_benchmarks ADD CONSTRAINT portfolio_benchmarks_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE;

-- Screener Alert Delivery Channels
ALTER TABLE screener_alert_delivery_channels DROP COLUMN alert_id;
ALTER TABLE screener_alert_delivery_channels RENAME COLUMN alert_id_new TO alert_id;
ALTER TABLE screener_alert_delivery_channels ALTER COLUMN alert_id SET NOT NULL;
ALTER TABLE screener_alert_delivery_channels ADD CONSTRAINT fk43npt3486b9ujqxr6i5ftnek3 FOREIGN KEY (alert_id) REFERENCES screener_alert(alert_id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 7: Recreate indexes on UUID columns
-- ============================================================================

-- Recreate indexes that were dropped
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_active ON portfolios(is_active);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_open_positions_portfolio_id ON open_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_open_positions_entry_date ON open_positions(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_open_positions_symbol ON open_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_trades_portfolio ON portfolio_trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_trade_logs_portfolio ON portfolio_trade_logs(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_portfolio ON pending_orders(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_cash_flows_portfolio ON portfolio_cash_flows(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_portfolio ON __portfolio_transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_valuation_daily_portfolio ON portfolio_valuation_daily(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_metrics_daily_portfolio ON portfolio_metrics_daily(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holding_valuation_daily_portfolio ON portfolio_holding_valuation_daily(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stock_metrics_daily_portfolio ON portfolio_stock_metrics_daily(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_signals_portfolio ON signals(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_screener_owner ON screener(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_screener_version_screener ON screener_version(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_run_screener ON screener_run(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_run_version ON screener_run(screener_version_id);
CREATE INDEX IF NOT EXISTS idx_screener_alert_screener ON screener_alert(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_paramset_version ON screener_paramset(screener_version_id);
CREATE INDEX IF NOT EXISTS idx_screener_function_params_function ON screener_function_params(function_id);
CREATE INDEX IF NOT EXISTS idx_screener_schedule_screener ON screener_schedule(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_saved_view_screener ON screener_saved_view(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_saved_view_user ON screener_saved_view(user_id);
CREATE INDEX IF NOT EXISTS idx_screener_star_user ON screener_star(user_id);
CREATE INDEX IF NOT EXISTS idx_screener_star_screener ON screener_star(screener_id);
CREATE INDEX IF NOT EXISTS idx_screener_result_run ON screener_result(screener_run_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_benchmarks_portfolio ON portfolio_benchmarks(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_screener_alert_delivery_channels_alert ON screener_alert_delivery_channels(alert_id);
CREATE INDEX IF NOT EXISTS idx_screener_result_diff_run ON screener_result_diff(screener_run_id);
CREATE INDEX IF NOT EXISTS idx_screener_result_diff_prev_run ON screener_result_diff(prev_screener_run_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_cash_flows_reference_txn ON portfolio_cash_flows(reference_txn_id);

-- ============================================================================
-- STEP 8: Recreate views with updated column types
-- ============================================================================

-- Recreate v_screener_last_run view
CREATE OR REPLACE VIEW v_screener_last_run AS
SELECT DISTINCT ON (screener_id) 
    screener_id,
    screener_run_id,
    run_for_trading_day,
    started_at,
    finished_at,
    total_candidates,
    total_matches
FROM screener_run sr
WHERE status = 'success'
ORDER BY screener_id, run_for_trading_day DESC, started_at DESC;

-- Recreate v_screener_last_results view
CREATE OR REPLACE VIEW v_screener_last_results AS
SELECT 
    l.screener_id,
    r.symbol,
    r.matched,
    r.score_0_1,
    r.rank_in_run,
    r.metrics_json,
    r.reason_json
FROM v_screener_last_run l
JOIN screener_result r ON r.screener_run_id = l.screener_run_id
ORDER BY l.screener_id, r.rank_in_run, r.score_0_1 DESC NULLS LAST;

-- Recreate portfolio_holdings_summary view (portfolio_id is now UUID)
CREATE OR REPLACE VIEW portfolio_holdings_summary AS
WITH latest_stock_metrics AS (
    SELECT 
        portfolio_stock_metrics_daily.portfolio_id,
        portfolio_stock_metrics_daily.symbol,
        portfolio_stock_metrics_daily.date,
        portfolio_stock_metrics_daily.equity,
        portfolio_stock_metrics_daily.cash,
        portfolio_stock_metrics_daily.position_value,
        portfolio_stock_metrics_daily.accumulated_shares,
        portfolio_stock_metrics_daily.accumulated_shares_value,
        ROW_NUMBER() OVER (PARTITION BY portfolio_stock_metrics_daily.portfolio_id, portfolio_stock_metrics_daily.symbol ORDER BY portfolio_stock_metrics_daily.date DESC) AS rn
    FROM portfolio_stock_metrics_daily
),
trade_stats AS (
    SELECT 
        portfolio_trades.portfolio_id,
        portfolio_trades.symbol,
        COUNT(*) AS total_trades,
        SUM(CASE WHEN portfolio_trades.profit > 0 THEN 1 ELSE 0 END) AS winning_trades,
        SUM(CASE WHEN portfolio_trades.profit <= 0 THEN 1 ELSE 0 END) AS losing_trades,
        SUM(portfolio_trades.quantity) AS total_quantity_traded,
        SUM(portfolio_trades.principal) AS total_principal_deployed,
        SUM(portfolio_trades.profit) AS realized_profit,
        SUM(portfolio_trades.kept_shares) AS total_kept_shares,
        SUM(portfolio_trades.kept_cash) AS total_kept_cash
    FROM portfolio_trades
    GROUP BY portfolio_trades.portfolio_id, portfolio_trades.symbol
),
open_pos AS (
    SELECT 
        open_positions.portfolio_id,
        open_positions.symbol,
        open_positions.entry_date,
        open_positions.entry_price,
        open_positions.quantity,
        open_positions.principal,
        open_positions.take_profit,
        open_positions.stop_loss
    FROM open_positions
),
symbol_union AS (
    SELECT portfolio_id, symbol FROM open_positions
    UNION
    SELECT portfolio_id, symbol FROM portfolio_trades
    UNION
    SELECT portfolio_id, symbol FROM portfolio_stock_metrics_daily
)
SELECT 
    su.portfolio_id,
    su.symbol,
    op.entry_date,
    op.entry_price,
    op.quantity AS open_quantity,
    op.principal AS open_principal,
    op.take_profit,
    op.stop_loss,
    COALESCE(ls.accumulated_shares, 0) AS accumulated_shares,
    COALESCE(ls.accumulated_shares_value, 0) AS accumulated_shares_value,
    COALESCE(ls.position_value, 0) AS last_position_value,
    COALESCE(ls.cash, 0) AS last_allocated_cash,
    COALESCE(ls.equity, 0) AS last_equity,
    COALESCE(ts.realized_profit, 0) AS realized_profit,
    COALESCE(ts.total_trades, 0) AS total_trades,
    COALESCE(ts.winning_trades, 0) AS winning_trades,
    COALESCE(ts.losing_trades, 0) AS losing_trades,
    COALESCE(ts.total_kept_shares, 0) AS total_kept_shares,
    COALESCE(ts.total_kept_cash, 0) AS total_kept_cash,
    COALESCE(ts.total_principal_deployed, 0) AS total_principal_deployed
FROM symbol_union su
LEFT JOIN open_pos op ON op.portfolio_id = su.portfolio_id AND op.symbol = su.symbol
LEFT JOIN latest_stock_metrics ls ON ls.portfolio_id = su.portfolio_id AND ls.symbol = su.symbol AND ls.rn = 1
LEFT JOIN trade_stats ts ON ts.portfolio_id = su.portfolio_id AND ts.symbol = su.symbol;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- All primary keys have been converted to UUID
-- All foreign key references have been updated
-- All indexes have been recreated
-- All views have been recreated with updated column types
-- kite_* tables remain unchanged as per requirements

