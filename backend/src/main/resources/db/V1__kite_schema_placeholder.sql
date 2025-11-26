-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.archival_metadata_id_seq;

CREATE SEQUENCE public.archival_metadata_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.backtest_events_event_id_seq;

CREATE SEQUENCE public.backtest_events_event_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.backtest_trades_trade_id_seq;

CREATE SEQUENCE public.backtest_trades_trade_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.field_metadata_field_metadata_id_seq;

CREATE SEQUENCE public.field_metadata_field_metadata_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.ingestion_jobs_id_seq;

CREATE SEQUENCE public.ingestion_jobs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.kite_instrument_ticks_tick_id_seq;

CREATE SEQUENCE public.kite_instrument_ticks_tick_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_idx_master_id_seq;

CREATE SEQUENCE public.nse_idx_master_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_idx_master_id_seq1;

CREATE SEQUENCE public.nse_idx_master_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_idx_ticks_id_seq;

CREATE SEQUENCE public.nse_idx_ticks_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_idx_ticks_id_seq1;

CREATE SEQUENCE public.nse_idx_ticks_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_performance_metrics_id_seq;

CREATE SEQUENCE public.nse_performance_metrics_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.nse_performance_metrics_id_seq1;

CREATE SEQUENCE public.nse_performance_metrics_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.open_positions_position_id_seq;

CREATE SEQUENCE public.open_positions_position_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.pending_orders_pending_order_id_seq;

CREATE SEQUENCE public.pending_orders_pending_order_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_cash_flows_id_seq;

CREATE SEQUENCE public.portfolio_cash_flows_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_holding_valuation_daily_id_seq;

CREATE SEQUENCE public.portfolio_holding_valuation_daily_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_holdings_id_seq;

CREATE SEQUENCE public.portfolio_holdings_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_metrics_daily_id_seq;

CREATE SEQUENCE public.portfolio_metrics_daily_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_stock_metrics_daily_metric_id_seq;

CREATE SEQUENCE public.portfolio_stock_metrics_daily_metric_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_trade_logs_id_seq;

CREATE SEQUENCE public.portfolio_trade_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_trades_trade_id_seq;

CREATE SEQUENCE public.portfolio_trades_trade_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_transactions_id_seq;

CREATE SEQUENCE public.portfolio_transactions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolio_valuation_daily_id_seq;

CREATE SEQUENCE public.portfolio_valuation_daily_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.portfolios_id_seq;

CREATE SEQUENCE public.portfolios_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_alert_alert_id_seq;

CREATE SEQUENCE public.screener_alert_alert_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_function_params_param_id_seq;

CREATE SEQUENCE public.screener_function_params_param_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_functions_function_id_seq;

CREATE SEQUENCE public.screener_functions_function_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_paramset_paramset_id_seq;

CREATE SEQUENCE public.screener_paramset_paramset_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_run_screener_run_id_seq;

CREATE SEQUENCE public.screener_run_screener_run_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_saved_view_saved_view_id_seq;

CREATE SEQUENCE public.screener_saved_view_saved_view_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_schedule_schedule_id_seq;

CREATE SEQUENCE public.screener_schedule_schedule_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_screener_id_seq;

CREATE SEQUENCE public.screener_screener_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.screener_version_screener_version_id_seq;

CREATE SEQUENCE public.screener_version_screener_version_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.signals_signal_id_seq;

CREATE SEQUENCE public.signals_signal_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.users_id_seq;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.users_id_seq1;

CREATE SEQUENCE public.users_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- public.archival_metadata definition

-- Drop table

-- DROP TABLE public.archival_metadata;

CREATE TABLE public.archival_metadata (
	id bigserial NOT NULL,
	archival_date date NOT NULL,
	created_at timestamptz(6) NOT NULL,
	destination_record_count int8 NOT NULL,
	duration_ms int8 NULL,
	end_time timestamptz(6) NULL,
	error_message varchar(2000) NULL,
	hudi_table_path varchar(500) NULL,
	integrity_check_passed bool NULL,
	source_record_count int8 NOT NULL,
	start_time timestamptz(6) NOT NULL,
	status varchar(255) NOT NULL,
	table_truncated bool NULL,
	updated_at timestamptz(6) NULL,
	CONSTRAINT archival_metadata_pkey PRIMARY KEY (id),
	CONSTRAINT archival_metadata_status_check CHECK (((status)::text = ANY ((ARRAY['IN_PROGRESS'::character varying, 'SUCCESS'::character varying, 'FAILED'::character varying, 'PARTIAL_SUCCESS'::character varying])::text[]))),
	CONSTRAINT uk_f1uxxr3w759qxuay8p91eb4wt UNIQUE (archival_date)
);


-- public.backtest_runs definition

-- Drop table

-- DROP TABLE public.backtest_runs;

CREATE TABLE public.backtest_runs (
	run_id uuid NOT NULL,
	strategy_name text NOT NULL,
	symbol text NOT NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	initial_capital numeric(15, 2) NOT NULL,
	final_equity numeric(15, 2) NULL,
	final_cash numeric(15, 2) NULL,
	accumulated_shares numeric(15, 6) NULL,
	total_return_pct numeric(10, 4) NULL,
	max_drawdown_pct numeric(10, 4) NULL,
	total_trades int4 NULL,
	winning_trades int4 NULL,
	losing_trades int4 NULL,
	hit_ratio numeric(5, 4) NULL,
	avg_profit_per_trade numeric(15, 2) NULL,
	avg_holding_days numeric(10, 2) NULL,
	sharpe_ratio numeric(10, 4) NULL,
	sortino_ratio numeric(10, 4) NULL,
	calmar_ratio numeric(10, 4) NULL,
	cagr numeric(10, 4) NULL,
	irr numeric(10, 4) NULL,
	total_return numeric(15, 2) NULL,
	max_consecutive_losses int4 NULL,
	max_consecutive_wins int4 NULL,
	avg_win numeric(15, 2) NULL,
	avg_loss numeric(15, 2) NULL,
	profit_factor numeric(10, 4) NULL,
	max_drawdown_value numeric(15, 2) NULL,
	avg_drawdown_pct numeric(10, 4) NULL,
	recovery_factor numeric(10, 4) NULL,
	win_rate numeric(5, 4) NULL,
	expectancy numeric(15, 2) NULL,
	total_days int4 NULL,
	trading_days int4 NULL,
	simulation_bars int4 NULL,
	parameters jsonb NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	notes text NULL,
	xirr numeric(10, 4) NULL,
	CONSTRAINT backtest_runs_pkey PRIMARY KEY (run_id)
);
CREATE INDEX idx_backtest_runs_created ON public.backtest_runs USING btree (created_at DESC);
CREATE INDEX idx_backtest_runs_dates ON public.backtest_runs USING btree (start_date, end_date);
CREATE INDEX idx_backtest_runs_performance ON public.backtest_runs USING btree (total_return_pct DESC, sharpe_ratio DESC);
CREATE INDEX idx_backtest_runs_strategy ON public.backtest_runs USING btree (strategy_name);
CREATE INDEX idx_backtest_runs_symbol ON public.backtest_runs USING btree (symbol);
COMMENT ON TABLE public.backtest_runs IS 'Stores metadata and summary results for each backtest run';


-- public.event_publication definition

-- Drop table

-- DROP TABLE public.event_publication;

CREATE TABLE public.event_publication (
	completion_date timestamptz(6) NULL,
	publication_date timestamptz(6) NULL,
	id uuid NOT NULL,
	event_type varchar(255) NULL,
	listener_id varchar(255) NULL,
	serialized_event varchar(255) NULL,
	CONSTRAINT event_publication_pkey PRIMARY KEY (id)
);


-- public.field_metadata definition

-- Drop table

-- DROP TABLE public.field_metadata;

CREATE TABLE public.field_metadata (
	field_metadata_id bigserial NOT NULL,
	category varchar(100) NULL,
	created_at timestamptz(6) NOT NULL,
	data_type varchar(50) NOT NULL,
	description text NULL,
	display_name varchar(200) NOT NULL,
	example_value varchar(500) NULL,
	field_name varchar(100) NOT NULL,
	is_active bool NOT NULL,
	sort_order int4 NULL,
	updated_at timestamptz(6) NOT NULL,
	validation_rules jsonb NULL,
	CONSTRAINT field_metadata_pkey PRIMARY KEY (field_metadata_id),
	CONSTRAINT uk_5bay96ty8w7qy885fejo7xq6l UNIQUE (field_name)
);
CREATE INDEX idx_field_metadata_category ON public.field_metadata USING btree (category);
CREATE INDEX idx_field_metadata_is_active ON public.field_metadata USING btree (is_active);


-- public.ingestion_jobs definition

-- Drop table

-- DROP TABLE public.ingestion_jobs;

CREATE TABLE public.ingestion_jobs (
	id bigserial NOT NULL,
	job_id varchar(36) NOT NULL, -- Unique job identifier (UUID)
	job_type varchar(50) NOT NULL, -- Type of ingestion job (e.g., NSE_BHAV_COPY)
	status varchar(20) NOT NULL, -- Current status: PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT
	start_date date NOT NULL, -- Start date of the ingestion range
	end_date date NOT NULL, -- End date of the ingestion range
	symbols text NULL, -- Comma-separated list of symbols (null means all)
	total_dates int4 NULL, -- Total number of dates to process
	processed_dates int4 DEFAULT 0 NULL, -- Number of dates processed so far
	total_records int4 DEFAULT 0 NULL, -- Total number of records encountered
	inserted_records int4 DEFAULT 0 NULL, -- Number of records successfully inserted
	failed_records int4 DEFAULT 0 NULL, -- Number of records that failed to insert
	error_message text NULL, -- Error message if job failed
	started_at timestamp NOT NULL, -- Timestamp when the job was started
	completed_at timestamp NULL, -- Timestamp when the job completed
	last_processed_date date NULL, -- Last successfully processed date for resume functionality. Tracks the most recent date that was fully processed and stored.
	CONSTRAINT chk_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'RUNNING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying, 'TIMEOUT'::character varying])::text[]))),
	CONSTRAINT ingestion_jobs_job_id_key UNIQUE (job_id),
	CONSTRAINT ingestion_jobs_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_ingestion_jobs_date_range ON public.ingestion_jobs USING btree (start_date, end_date);
CREATE INDEX idx_ingestion_jobs_job_id ON public.ingestion_jobs USING btree (job_id);
CREATE INDEX idx_ingestion_jobs_resumable ON public.ingestion_jobs USING btree (status, last_processed_date) WHERE (((status)::text = ANY ((ARRAY['FAILED'::character varying, 'TIMEOUT'::character varying])::text[])) AND (last_processed_date IS NOT NULL));
CREATE INDEX idx_ingestion_jobs_started_at ON public.ingestion_jobs USING btree (started_at DESC);
CREATE INDEX idx_ingestion_jobs_status ON public.ingestion_jobs USING btree (status);
COMMENT ON TABLE public.ingestion_jobs IS 'Tracks NSE historical data ingestion jobs with progress and statistics';

-- Column comments

COMMENT ON COLUMN public.ingestion_jobs.job_id IS 'Unique job identifier (UUID)';
COMMENT ON COLUMN public.ingestion_jobs.job_type IS 'Type of ingestion job (e.g., NSE_BHAV_COPY)';
COMMENT ON COLUMN public.ingestion_jobs.status IS 'Current status: PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT';
COMMENT ON COLUMN public.ingestion_jobs.start_date IS 'Start date of the ingestion range';
COMMENT ON COLUMN public.ingestion_jobs.end_date IS 'End date of the ingestion range';
COMMENT ON COLUMN public.ingestion_jobs.symbols IS 'Comma-separated list of symbols (null means all)';
COMMENT ON COLUMN public.ingestion_jobs.total_dates IS 'Total number of dates to process';
COMMENT ON COLUMN public.ingestion_jobs.processed_dates IS 'Number of dates processed so far';
COMMENT ON COLUMN public.ingestion_jobs.total_records IS 'Total number of records encountered';
COMMENT ON COLUMN public.ingestion_jobs.inserted_records IS 'Number of records successfully inserted';
COMMENT ON COLUMN public.ingestion_jobs.failed_records IS 'Number of records that failed to insert';
COMMENT ON COLUMN public.ingestion_jobs.error_message IS 'Error message if job failed';
COMMENT ON COLUMN public.ingestion_jobs.started_at IS 'Timestamp when the job was started';
COMMENT ON COLUMN public.ingestion_jobs.completed_at IS 'Timestamp when the job completed';
COMMENT ON COLUMN public.ingestion_jobs.last_processed_date IS 'Last successfully processed date for resume functionality. Tracks the most recent date that was fully processed and stored.';


-- public.kite_instrument_indicators definition

-- Drop table

-- DROP TABLE public.kite_instrument_indicators;

CREATE TABLE public.kite_instrument_indicators (
	instrument_token varchar(50) NOT NULL,
	exchange varchar(10) NOT NULL,
	"date" timestamptz NOT NULL,
	candle_interval varchar(20) NOT NULL,
	sma_5 float8 NULL,
	sma_10 float8 NULL,
	sma_14 float8 NULL,
	sma_20 float8 NULL,
	sma_30 float8 NULL,
	sma_50 float8 NULL,
	sma_100 float8 NULL,
	sma_200 float8 NULL,
	ema_5 float8 NULL,
	ema_10 float8 NULL,
	ema_14 float8 NULL,
	ema_20 float8 NULL,
	ema_30 float8 NULL,
	ema_50 float8 NULL,
	ema_100 float8 NULL,
	ema_200 float8 NULL,
	wma_5 float8 NULL,
	wma_10 float8 NULL,
	wma_20 float8 NULL,
	wma_30 float8 NULL,
	hma_20 float8 NULL,
	tema_20 float8 NULL,
	kama_20 float8 NULL,
	rsi_5 float8 NULL,
	rsi_10 float8 NULL,
	rsi_14 float8 NULL,
	rsi_20 float8 NULL,
	rsi_21 float8 NULL,
	rsi_30 float8 NULL,
	rsi_50 float8 NULL,
	rsi_100 float8 NULL,
	rsi_200 float8 NULL,
	macd_line float8 NULL,
	macd_signal float8 NULL,
	macd_histogram float8 NULL,
	macd_12_26_9 float8 NULL,
	macd_12_26_d float8 NULL,
	bb_upper_5 float8 NULL,
	bb_middle_5 float8 NULL,
	bb_lower_5 float8 NULL,
	bb_width_5 float8 NULL,
	bb_percent_b_5 float8 NULL,
	bb_upper_10 float8 NULL,
	bb_middle_10 float8 NULL,
	bb_lower_10 float8 NULL,
	bb_width_10 float8 NULL,
	bb_percent_b_10 float8 NULL,
	bb_upper_14 float8 NULL,
	bb_middle_14 float8 NULL,
	bb_lower_14 float8 NULL,
	bb_width_14 float8 NULL,
	bb_percent_b_14 float8 NULL,
	bb_upper_20 float8 NULL,
	bb_middle_20 float8 NULL,
	bb_lower_20 float8 NULL,
	bb_width_20 float8 NULL,
	bb_percent_b_20 float8 NULL,
	bb_upper_30 float8 NULL,
	bb_middle_30 float8 NULL,
	bb_lower_30 float8 NULL,
	bb_width_30 float8 NULL,
	bb_percent_b_30 float8 NULL,
	bb_upper_50 float8 NULL,
	bb_middle_50 float8 NULL,
	bb_lower_50 float8 NULL,
	bb_width_50 float8 NULL,
	bb_percent_b_50 float8 NULL,
	bb_upper_100 float8 NULL,
	bb_middle_100 float8 NULL,
	bb_lower_100 float8 NULL,
	bb_width_100 float8 NULL,
	bb_percent_b_100 float8 NULL,
	bb_upper_200 float8 NULL,
	bb_middle_200 float8 NULL,
	bb_lower_200 float8 NULL,
	bb_width_200 float8 NULL,
	bb_percent_b_200 float8 NULL,
	volume_sma_10 float8 NULL,
	volume_sma_20 float8 NULL,
	volume_sma_30 float8 NULL,
	volume_sma_50 float8 NULL,
	volume_ema_10 float8 NULL,
	volume_ema_20 float8 NULL,
	volume_ema_30 float8 NULL,
	volume_ema_50 float8 NULL,
	volume_ratio float8 NULL,
	cmf_14 float8 NULL,
	cmf_21 float8 NULL,
	vpt float8 NULL,
	vwap float8 NULL,
	atr_5 float8 NULL,
	atr_10 float8 NULL,
	atr_14 float8 NULL,
	atr_20 float8 NULL,
	atr_21 float8 NULL,
	atr_30 float8 NULL,
	atr_50 float8 NULL,
	atr_100 float8 NULL,
	atr_200 float8 NULL,
	adx_14 float8 NULL,
	adx_21 float8 NULL,
	adx_50 float8 NULL,
	di_plus_14 float8 NULL,
	di_plus_21 float8 NULL,
	di_plus_50 float8 NULL,
	di_minus_14 float8 NULL,
	di_minus_21 float8 NULL,
	di_minus_50 float8 NULL,
	cci_14 float8 NULL,
	cci_20 float8 NULL,
	cci_50 float8 NULL,
	keltner_upper_14 float8 NULL,
	keltner_middle_14 float8 NULL,
	keltner_lower_14 float8 NULL,
	keltner_14 float8 NULL,
	keltner_upper_20 float8 NULL,
	keltner_middle_20 float8 NULL,
	keltner_lower_20 float8 NULL,
	keltner_upper_50 float8 NULL,
	keltner_middle_50 float8 NULL,
	keltner_lower_50 float8 NULL,
	typical_price float8 NULL,
	stoch_k_14 float8 NULL,
	stoch_d_14 float8 NULL,
	williams_r_14 float8 NULL,
	mfi_14 float8 NULL,
	obv float8 NULL,
	roc_10 float8 NULL,
	roc_20 float8 NULL,
	proc_10 float8 NULL,
	proc_20 float8 NULL,
	vroc_10 float8 NULL,
	vroc_20 float8 NULL,
	parabolic_sar float8 NULL,
	ichimoku_tenkan float8 NULL,
	ichimoku_kijun float8 NULL,
	ichimoku_senkou_span_a float8 NULL,
	ichimoku_senkou_span_b float8 NULL,
	ichimoku_chikou_span float8 NULL,
	fib_0_236 float8 NULL,
	fib_0_382 float8 NULL,
	fib_0_500 float8 NULL,
	fib_0_618 float8 NULL,
	fib_0_786 float8 NULL,
	support_level_1 float8 NULL,
	support_level_2 float8 NULL,
	resistance_level_1 float8 NULL,
	resistance_level_2 float8 NULL,
	volatility_20 float8 NULL,
	volatility_50 float8 NULL,
	momentum_10 float8 NULL,
	momentum_20 float8 NULL,
	price_position_bb float8 NULL,
	price_trend_20 float8 NULL,
	ema_cross_rsi_filter float8 NULL,
	ema_ribbon_rsi float8 NULL,
	adx_atr_trend float8 NULL,
	macd_rsi_combo float8 NULL,
	macd_adx_combo float8 NULL,
	rsi_atr_breakout float8 NULL,
	bb_rsi_reversal float8 NULL,
	bb_macd_trend_breakout float8 NULL,
	squeeze_bb_keltner float8 NULL,
	macd_hist_vol_delta float8 NULL,
	cmf_rsi_combo float8 NULL,
	darvas_box_volume float8 NULL,
	canslim_technical float8 NULL,
	triple_screen_system float8 NULL,
	weighted_multi_factor float8 NULL,
	week_52_high float8 NULL,
	week_52_low float8 NULL,
	adjusted_close float8 NULL,
	timeframe varchar(20) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT kite_instrument_indicators_pkey PRIMARY KEY (instrument_token, exchange, date, candle_interval)
);
CREATE INDEX idx_indicators_candle_interval_date ON public.kite_instrument_indicators USING btree (candle_interval, date DESC);
CREATE INDEX idx_indicators_day_token_exchange_date ON public.kite_instrument_indicators USING btree (instrument_token, exchange, date DESC) WHERE ((candle_interval)::text = 'day'::text);
CREATE INDEX idx_indicators_exchange_date ON public.kite_instrument_indicators USING btree (exchange, date DESC);
CREATE INDEX idx_indicators_instrument_exchange_interval ON public.kite_instrument_indicators USING btree (instrument_token, exchange, candle_interval, date DESC);
CREATE INDEX idx_indicators_instrument_token_date ON public.kite_instrument_indicators USING btree (instrument_token, date DESC);
CREATE INDEX kite_instrument_indicators_date_idx ON public.kite_instrument_indicators USING btree (date DESC);
COMMENT ON TABLE public.kite_instrument_indicators IS 'Technical indicators calculated from kite_ohlcv_historic data. This is a superset of nse_eq_indicators with 150+ indicator columns.';


-- public.kite_instrument_master definition

-- Drop table

-- DROP TABLE public.kite_instrument_master;

CREATE TABLE public.kite_instrument_master (
	instrument_token varchar(50) NOT NULL,
	exchange_token varchar(50) NULL,
	tradingsymbol varchar(100) NOT NULL,
	"name" varchar(255) NULL,
	last_price float8 NULL,
	expiry date NULL,
	strike float8 NULL,
	tick_size float8 NULL,
	lot_size int4 NULL,
	instrument_type varchar(10) NULL,
	segment varchar(20) NULL,
	exchange varchar(10) NOT NULL,
	last_updated timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT kite_instrument_master_pkey PRIMARY KEY (instrument_token, exchange)
);
CREATE INDEX idx_kite_instrument_master_exchange ON public.kite_instrument_master USING btree (exchange);
CREATE INDEX idx_kite_instrument_master_instrument_type ON public.kite_instrument_master USING btree (instrument_type);
CREATE INDEX idx_kite_instrument_master_segment ON public.kite_instrument_master USING btree (segment);
CREATE INDEX idx_kite_instrument_master_tradingsymbol ON public.kite_instrument_master USING btree (tradingsymbol);


-- public.kite_instrument_ticks definition

-- Drop table

-- DROP TABLE public.kite_instrument_ticks;

CREATE TABLE public.kite_instrument_ticks (
	tick_id serial4 NOT NULL,
	instrument_token int8 NOT NULL,
	exchange varchar(10) NOT NULL,
	tradingsymbol text NOT NULL,
	"timestamp" timestamp NOT NULL,
	last_price numeric(15, 4) NOT NULL,
	last_quantity int4 NULL,
	average_price numeric(15, 4) NULL,
	volume int8 NULL,
	buy_quantity int4 NULL,
	sell_quantity int4 NULL,
	"open" numeric(15, 4) NULL,
	high numeric(15, 4) NULL,
	low numeric(15, 4) NULL,
	"close" numeric(15, 4) NULL,
	change_pct numeric(10, 4) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT kite_instrument_ticks_instrument_token_exchange_timestamp_key UNIQUE (instrument_token, exchange, "timestamp"),
	CONSTRAINT kite_instrument_ticks_pkey PRIMARY KEY (tick_id)
);
CREATE INDEX idx_kite_instrument_ticks_instrument_timestamp ON public.kite_instrument_ticks USING btree (instrument_token, exchange, "timestamp" DESC);
CREATE INDEX idx_kite_instrument_ticks_timestamp ON public.kite_instrument_ticks USING btree ("timestamp" DESC);
CREATE INDEX idx_kite_instrument_ticks_tradingsymbol ON public.kite_instrument_ticks USING btree (tradingsymbol, "timestamp" DESC);
CREATE INDEX idx_ticks_token_exchange_ts_asc ON public.kite_instrument_ticks USING btree (instrument_token, exchange, "timestamp");
CREATE INDEX idx_ticks_token_exchange_ts_desc_inc ON public.kite_instrument_ticks USING btree (instrument_token, exchange, "timestamp" DESC) INCLUDE (tradingsymbol, last_price, last_quantity, average_price, volume, buy_quantity, sell_quantity, open, high, low, close, change_pct);


-- public.kite_ohlcv_historic definition

-- Drop table

-- DROP TABLE public.kite_ohlcv_historic;

CREATE TABLE public.kite_ohlcv_historic (
	instrument_token varchar(50) NOT NULL,
	exchange varchar(10) NOT NULL,
	"date" timestamptz NOT NULL,
	"open" float8 NOT NULL,
	high float8 NOT NULL,
	low float8 NOT NULL,
	"close" float8 NOT NULL,
	volume int8 NOT NULL,
	candle_interval varchar(20) NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT kite_ohlcv_historic_pkey PRIMARY KEY (instrument_token, exchange, date, candle_interval)
);
CREATE INDEX idx_ohlcv_candle_interval_date ON public.kite_ohlcv_historic USING btree (candle_interval, date DESC);
CREATE INDEX idx_ohlcv_day_token_exchange_date ON public.kite_ohlcv_historic USING btree (instrument_token, exchange, date DESC) WHERE ((candle_interval)::text = 'day'::text);
CREATE INDEX idx_ohlcv_exchange_date ON public.kite_ohlcv_historic USING btree (exchange, date DESC);
CREATE INDEX idx_ohlcv_instrument_exchange_interval ON public.kite_ohlcv_historic USING btree (instrument_token, exchange, candle_interval, date DESC);
CREATE INDEX idx_ohlcv_instrument_token_date ON public.kite_ohlcv_historic USING btree (instrument_token, date DESC);
CREATE INDEX kite_ohlcv_historic_date_idx ON public.kite_ohlcv_historic USING btree (date DESC);


-- public.nse_eq_indicators definition

-- Drop table

-- DROP TABLE public.nse_eq_indicators;

CREATE TABLE public.nse_eq_indicators (
	symbol text NOT NULL, -- Stock symbol (e.g., INFY, RELIANCE)
	"date" timestamptz NOT NULL, -- Trading date and time (TIMESTAMP WITH TIME ZONE for TimescaleDB)
	sma_5 float8 NULL, -- 5-day Simple Moving Average
	sma_10 float8 NULL,
	sma_20 float8 NULL,
	sma_50 float8 NULL,
	sma_100 float8 NULL,
	sma_200 float8 NULL,
	ema_5 float8 NULL,
	ema_10 float8 NULL,
	ema_20 float8 NULL,
	ema_50 float8 NULL,
	wma_5 float8 NULL,
	wma_10 float8 NULL,
	wma_20 float8 NULL,
	hma_20 float8 NULL,
	tema_20 float8 NULL,
	kama_20 float8 NULL,
	rsi_14 float8 NULL, -- 14-period Relative Strength Index
	macd_line float8 NULL, -- MACD line (12-26 EMA difference)
	macd_signal float8 NULL,
	macd_histogram float8 NULL,
	bb_upper_20 float8 NULL, -- Bollinger Band Upper (20 SMA + 2*StdDev)
	bb_middle_20 float8 NULL,
	bb_lower_20 float8 NULL,
	bb_width_20 float8 NULL,
	bb_percent_b_20 float8 NULL,
	stoch_k_14 float8 NULL,
	stoch_d_14 float8 NULL,
	atr_14 float8 NULL, -- Average True Range over 14 periods
	williams_r_14 float8 NULL,
	cci_20 float8 NULL, -- Commodity Channel Index over 20 periods
	mfi_14 float8 NULL,
	obv float8 NULL,
	roc_10 float8 NULL,
	roc_20 float8 NULL,
	proc_10 float8 NULL,
	proc_20 float8 NULL,
	vroc_10 float8 NULL,
	vroc_20 float8 NULL,
	parabolic_sar float8 NULL,
	adx_14 float8 NULL, -- Average Directional Index over 14 periods
	di_plus_14 float8 NULL,
	di_minus_14 float8 NULL,
	ichimoku_tenkan float8 NULL,
	ichimoku_kijun float8 NULL,
	ichimoku_senkou_span_a float8 NULL,
	ichimoku_senkou_span_b float8 NULL,
	ichimoku_chikou_span float8 NULL,
	fib_0_236 float8 NULL,
	fib_0_382 float8 NULL,
	fib_0_500 float8 NULL,
	fib_0_618 float8 NULL,
	fib_0_786 float8 NULL,
	support_level_1 float8 NULL,
	support_level_2 float8 NULL,
	resistance_level_1 float8 NULL,
	resistance_level_2 float8 NULL,
	volatility_20 float8 NULL,
	volatility_50 float8 NULL,
	momentum_10 float8 NULL,
	momentum_20 float8 NULL,
	volume_sma_20 float8 NULL, -- Simple Moving Average of Volume over 20 periods
	volume_ema_20 float8 NULL,
	volume_ratio float8 NULL,
	price_position_bb float8 NULL,
	price_trend_20 float8 NULL,
	sma_30 float8 NULL,
	ema_30 float8 NULL,
	wma_30 float8 NULL,
	rsi_21 float8 NULL,
	rsi_50 float8 NULL,
	macd_12_26_9 float8 NULL,
	bb_upper_50 float8 NULL,
	bb_middle_50 float8 NULL,
	bb_lower_50 float8 NULL,
	bb_width_50 float8 NULL,
	bb_percent_b_50 float8 NULL,
	stoch_k_21 float8 NULL,
	stoch_d_21 float8 NULL,
	atr_21 float8 NULL,
	atr_50 float8 NULL,
	williams_r_21 float8 NULL,
	williams_r_50 float8 NULL,
	cci_14 float8 NULL,
	cci_50 float8 NULL,
	mfi_21 float8 NULL,
	mfi_50 float8 NULL,
	roc_5 float8 NULL,
	roc_30 float8 NULL,
	proc_5 float8 NULL,
	proc_30 float8 NULL,
	vroc_5 float8 NULL,
	vroc_30 float8 NULL,
	adx_21 float8 NULL,
	adx_50 float8 NULL,
	di_plus_21 float8 NULL,
	di_minus_21 float8 NULL,
	di_plus_50 float8 NULL,
	di_minus_50 float8 NULL,
	volume_sma_50 float8 NULL,
	volume_ema_50 float8 NULL,
	cmf_14 float8 NULL, -- Chaikin Money Flow over 14 periods
	cmf_50 float8 NULL,
	vwap_50 float8 NULL,
	eom_14 float8 NULL,
	eom_50 float8 NULL,
	keltner_14 float8 NULL, -- Keltner Channel upper band over 14 periods
	keltner_50 float8 NULL,
	std_dev_14 float8 NULL,
	std_dev_50 float8 NULL,
	chaikin_vol_14 float8 NULL,
	chaikin_vol_50 float8 NULL,
	trend_strength_14 float8 NULL,
	trend_strength_50 float8 NULL,
	dm_21 float8 NULL,
	dm_50 float8 NULL,
	custom_indicator_1 float8 NULL,
	custom_indicator_2 float8 NULL,
	custom_indicator_3 float8 NULL,
	sma_14 float8 NULL,
	macd_12_26_d float8 NULL,
	dm_30 float8 NULL,
	macd_rsi_combo float8 NULL, -- MACD + RSI confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)
	macd_adx_combo float8 NULL, -- MACD + ADX trend strength filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
	ema_cross_rsi_filter float8 NULL, -- EMA crossover + RSI filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
	ema_ribbon_rsi float8 NULL, -- EMA ribbon + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)
	sar_macd_alignment float8 NULL, -- Parabolic SAR + MACD alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)
	adx_cci_combo float8 NULL, -- ADX + CCI (1.0: bullish, -1.0: bearish, 0.0: neutral)
	rsi_atr_breakout float8 NULL, -- RSI + ATR breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
	rsi_obv_alignment float8 NULL, -- RSI + OBV alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)
	macd_hist_vol_delta float8 NULL, -- MACD histogram + Volume delta (1.0: bullish, -1.0: bearish, 0.0: neutral)
	cmf_rsi_combo float8 NULL, -- Chaikin Money Flow + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)
	bb_rsi_reversal float8 NULL, -- Bollinger Bands + RSI reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
	bb_macd_trend_breakout float8 NULL, -- Bollinger Bands + MACD trend breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
	squeeze_bb_keltner float8 NULL, -- BB-Keltner Squeeze (1.0: squeeze detected, 0.0: no squeeze)
	atr_ema_breakout float8 NULL, -- ATR + EMA breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)
	adx_atr_trend float8 NULL, -- ADX + ATR trend filter (1.0: strong trend, 0.0: weak trend)
	stoch_bb_reversal float8 NULL, -- Stochastic + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
	williams_bb_reversal float8 NULL, -- Williams %R + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)
	ema_obv_confirmation float8 NULL, -- EMA + OBV confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)
	vwap_obv_intraday float8 NULL, -- VWAP + OBV intraday (1.0: bullish, -1.0: bearish, 0.0: neutral)
	darvas_box_volume float8 NULL, -- Darvas Box + Volume (1.0: bullish breakout, -1.0: bearish breakout, 0.0: no breakout)
	canslim_technical float8 NULL, -- CANSLIM technical subset (1.0: meets criteria, 0.0: does not meet criteria)
	triple_screen_system float8 NULL, -- Elder's Triple Screen (1.0: bullish, -1.0: bearish, 0.0: neutral)
	vam_ratio float8 NULL -- Volatility-Adjusted Momentum ratio (higher values indicate stronger momentum relative to volatility),
	zscore_fusion float8 NULL, -- Normalized fusion score (statistical combination of multiple signals)
	weighted_multi_factor float8 NULL, -- Weighted multi-factor model score (comprehensive technical analysis score)
	candle_rsi_bb float8 NULL, -- Candle pattern + RSI/BB filter (1.0: bullish, -1.0: bearish, 0.0: neutral)
	volume_weighted_trend_score float8 NULL, -- Volume-weighted trend score (trend strength weighted by volume factors)
	volume_sma_10 float8 NULL,
	volume_sma_30 float8 NULL,
	volume_ema_10 float8 NULL,
	volume_ema_30 float8 NULL,
	cmf_21 float8 NULL,
	vpt float8 NULL,
	keltner_upper_14 float8 NULL,
	keltner_middle_14 float8 NULL,
	keltner_lower_14 float8 NULL,
	keltner_upper_20 float8 NULL,
	keltner_middle_20 float8 NULL,
	keltner_lower_20 float8 NULL,
	keltner_upper_50 float8 NULL,
	keltner_middle_50 float8 NULL,
	keltner_lower_50 float8 NULL,
	typical_price float8 NULL,
	mf_multiplier float8 NULL,
	mf_volume float8 NULL,
	tr float8 NULL,
	dm_plus float8 NULL,
	dm_minus float8 NULL,
	"52_week_high" float8 NULL,
	"52_week_low" float8 NULL,
	vwap float8 NULL, -- Volume Weighted Average Price
	timeframe text DEFAULT '1day'::text NULL, -- Timeframe for indicators (1day, 1week, 1month, etc.)
	adjusted_close float8 NULL, -- Adjusted close price (for splits/dividends)
	week_52_high float8 NULL, -- 52-week (252 trading days) high price
	week_52_low float8 NULL, -- 52-week (252 trading days) low price
	ema_14 float8 NULL, -- Exponential Moving Average with 14-day period
	CONSTRAINT nse_eq_indicators_pkey PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_indicators_date ON public.nse_eq_indicators USING btree (date);
CREATE INDEX idx_indicators_macd_line ON public.nse_eq_indicators USING btree (macd_line) WHERE (macd_line IS NOT NULL);
CREATE INDEX idx_indicators_rsi_14 ON public.nse_eq_indicators USING btree (rsi_14) WHERE (rsi_14 IS NOT NULL);
CREATE INDEX idx_indicators_sma_20 ON public.nse_eq_indicators USING btree (sma_20) WHERE (sma_20 IS NOT NULL);
CREATE INDEX idx_indicators_symbol_date_desc ON public.nse_eq_indicators USING btree (symbol, date DESC);
CREATE INDEX idx_indicators_timeframe_date ON public.nse_eq_indicators USING btree (timeframe, date DESC) WHERE (timeframe = '1day'::text);
CREATE INDEX nse_eq_indicators_date_idx ON public.nse_eq_indicators USING btree (date DESC);
COMMENT ON TABLE public.nse_eq_indicators IS 'Calculated technical indicators for NSE stocks';

-- Column comments

COMMENT ON COLUMN public.nse_eq_indicators.symbol IS 'Stock symbol (e.g., INFY, RELIANCE)';
COMMENT ON COLUMN public.nse_eq_indicators."date" IS 'Trading date and time (TIMESTAMP WITH TIME ZONE for TimescaleDB)';
COMMENT ON COLUMN public.nse_eq_indicators.sma_5 IS '5-day Simple Moving Average';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_14 IS '14-period Relative Strength Index';
COMMENT ON COLUMN public.nse_eq_indicators.macd_line IS 'MACD line (12-26 EMA difference)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_upper_20 IS 'Bollinger Band Upper (20 SMA + 2*StdDev)';
COMMENT ON COLUMN public.nse_eq_indicators.atr_14 IS 'Average True Range over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.cci_20 IS 'Commodity Channel Index over 20 periods';
COMMENT ON COLUMN public.nse_eq_indicators.adx_14 IS 'Average Directional Index over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.volume_sma_20 IS 'Simple Moving Average of Volume over 20 periods';
COMMENT ON COLUMN public.nse_eq_indicators.cmf_14 IS 'Chaikin Money Flow over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.keltner_14 IS 'Keltner Channel upper band over 14 periods';
COMMENT ON COLUMN public.nse_eq_indicators.macd_rsi_combo IS 'MACD + RSI confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.macd_adx_combo IS 'MACD + ADX trend strength filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_cross_rsi_filter IS 'EMA crossover + RSI filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_ribbon_rsi IS 'EMA ribbon + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.sar_macd_alignment IS 'Parabolic SAR + MACD alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.adx_cci_combo IS 'ADX + CCI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_atr_breakout IS 'RSI + ATR breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.rsi_obv_alignment IS 'RSI + OBV alignment (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.macd_hist_vol_delta IS 'MACD histogram + Volume delta (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.cmf_rsi_combo IS 'Chaikin Money Flow + RSI (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_rsi_reversal IS 'Bollinger Bands + RSI reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.bb_macd_trend_breakout IS 'Bollinger Bands + MACD trend breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.squeeze_bb_keltner IS 'BB-Keltner Squeeze (1.0: squeeze detected, 0.0: no squeeze)';
COMMENT ON COLUMN public.nse_eq_indicators.atr_ema_breakout IS 'ATR + EMA breakout (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.adx_atr_trend IS 'ADX + ATR trend filter (1.0: strong trend, 0.0: weak trend)';
COMMENT ON COLUMN public.nse_eq_indicators.stoch_bb_reversal IS 'Stochastic + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.williams_bb_reversal IS 'Williams %R + Bollinger reversal (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.ema_obv_confirmation IS 'EMA + OBV confirmation (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.vwap_obv_intraday IS 'VWAP + OBV intraday (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.darvas_box_volume IS 'Darvas Box + Volume (1.0: bullish breakout, -1.0: bearish breakout, 0.0: no breakout)';
COMMENT ON COLUMN public.nse_eq_indicators.canslim_technical IS 'CANSLIM technical subset (1.0: meets criteria, 0.0: does not meet criteria)';
COMMENT ON COLUMN public.nse_eq_indicators.triple_screen_system IS 'Elder''s Triple Screen (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.vam_ratio IS 'Volatility-Adjusted Momentum ratio (higher values indicate stronger momentum relative to volatility)';
COMMENT ON COLUMN public.nse_eq_indicators.zscore_fusion IS 'Normalized fusion score (statistical combination of multiple signals)';
COMMENT ON COLUMN public.nse_eq_indicators.weighted_multi_factor IS 'Weighted multi-factor model score (comprehensive technical analysis score)';
COMMENT ON COLUMN public.nse_eq_indicators.candle_rsi_bb IS 'Candle pattern + RSI/BB filter (1.0: bullish, -1.0: bearish, 0.0: neutral)';
COMMENT ON COLUMN public.nse_eq_indicators.volume_weighted_trend_score IS 'Volume-weighted trend score (trend strength weighted by volume factors)';
COMMENT ON COLUMN public.nse_eq_indicators.vwap IS 'Volume Weighted Average Price';
COMMENT ON COLUMN public.nse_eq_indicators.timeframe IS 'Timeframe for indicators (1day, 1week, 1month, etc.)';
COMMENT ON COLUMN public.nse_eq_indicators.adjusted_close IS 'Adjusted close price (for splits/dividends)';
COMMENT ON COLUMN public.nse_eq_indicators.week_52_high IS '52-week (252 trading days) high price';
COMMENT ON COLUMN public.nse_eq_indicators.week_52_low IS '52-week (252 trading days) low price';
COMMENT ON COLUMN public.nse_eq_indicators.ema_14 IS 'Exponential Moving Average with 14-day period';


-- public.nse_eq_master definition

-- Drop table

-- DROP TABLE public.nse_eq_master;

CREATE TABLE public.nse_eq_master (
	symbol varchar(100) NOT NULL,
	company_name varchar(500) NULL,
	industry varchar(200) NULL,
	is_fno_sec varchar(100) NULL,
	is_ca_sec varchar(100) NULL,
	is_slb_sec varchar(100) NULL,
	is_debt_sec varchar(100) NULL,
	is_suspended varchar(100) NULL,
	is_etf_sec varchar(100) NULL,
	is_delisted varchar(100) NULL,
	isin varchar(100) NULL,
	slb_isin varchar(100) NULL,
	listing_date varchar(100) NULL,
	is_municipal_bond varchar(100) NULL,
	is_hybrid_symbol varchar(100) NULL,
	is_top10 varchar(100) NULL,
	identifier varchar(200) NULL,
	series varchar(100) NULL,
	status varchar(200) NULL,
	last_update_time varchar(200) NULL,
	pd_sector_pe float4 NULL,
	pd_symbol_pe float4 NULL,
	pd_sector_ind varchar(200) NULL,
	board_status varchar(200) NULL,
	trading_status varchar(200) NULL,
	trading_segment varchar(200) NULL,
	session_no varchar(200) NULL,
	slb varchar(200) NULL,
	class_of_share varchar(200) NULL,
	derivatives varchar(200) NULL,
	surveillance_surv varchar(200) NULL,
	surveillance_desc varchar(500) NULL,
	face_value float4 NULL,
	issued_size float4 NULL,
	sdd_auditor varchar(200) NULL,
	sdd_status varchar(200) NULL,
	current_market_type varchar(200) NULL,
	last_price float4 NULL,
	"change" float4 NULL,
	p_change float4 NULL,
	previous_close float4 NULL,
	"open" float4 NULL,
	"close" float4 NULL,
	vwap float4 NULL,
	stock_ind_close_price float4 NULL,
	lower_cp varchar(200) NULL,
	upper_cp varchar(200) NULL,
	p_price_band varchar(200) NULL,
	base_price float4 NULL,
	intra_day_high_low_min float4 NULL,
	intra_day_high_low_max float4 NULL,
	intra_day_high_low_value float4 NULL,
	week_high_low_min float4 NULL,
	week_high_low_min_date varchar(200) NULL,
	week_high_low_max float4 NULL,
	week_high_low_max_date varchar(200) NULL,
	i_nav_value float4 NULL,
	check_inav varchar(200) NULL,
	tick_size float4 NULL,
	ieq varchar(200) NULL,
	macro varchar(200) NULL,
	sector varchar(200) NULL,
	basic_industry varchar(200) NULL,
	ato_buy float4 NULL,
	ato_sell float4 NULL,
	iep float4 NULL,
	total_traded_volume float4 NULL,
	final_price float4 NULL,
	final_quantity float4 NULL,
	pre_open_last_update_time varchar(200) NULL,
	total_buy_quantity float4 NULL,
	total_sell_quantity float4 NULL,
	ato_buy_qty float4 NULL,
	ato_sell_qty float4 NULL,
	pre_open_change float4 NULL,
	per_change float4 NULL,
	prev_close float4 NULL,
	CONSTRAINT nse_eq_master_pk PRIMARY KEY (symbol)
);


-- public.nse_eq_ohlcv_historic definition

-- Drop table

-- DROP TABLE public.nse_eq_ohlcv_historic;

CREATE TABLE public.nse_eq_ohlcv_historic (
	symbol text NOT NULL,
	"date" timestamptz NOT NULL, -- Trading date and time (TIMESTAMP WITH TIME ZONE for TimescaleDB)
	"open" float8 NULL,
	high float8 NULL,
	low float8 NULL,
	"close" float8 NULL,
	volume numeric(38, 2) NULL,
	total_traded_value numeric(38, 2) NULL,
	total_trades numeric(38, 2) NULL,
	delivery_quantity numeric(38, 2) NULL,
	delivery_percentage float8 NULL,
	previous_close float8 NULL,
	series text NULL,
	timeframe text DEFAULT '1day'::text NULL,
	avg_price float8 NULL,
	created_at timestamp(6) NULL,
	updated_at timestamp(6) NULL,
	vwap float4 NULL,
	CONSTRAINT nse_eq_ohlcv_historic_pkey PRIMARY KEY (symbol, date),
	CONSTRAINT nse_eq_ohlcv_historic_symbol_date_key UNIQUE (symbol, date)
);
CREATE INDEX idx_nse_eq_ohlcv_historic_date ON public.nse_eq_ohlcv_historic USING btree (date);
CREATE INDEX idx_nse_eq_ohlcv_historic_symbol ON public.nse_eq_ohlcv_historic USING btree (symbol);
CREATE INDEX idx_nse_eq_ohlcv_historic_symbol_date ON public.nse_eq_ohlcv_historic USING btree (symbol, date);
CREATE INDEX idx_nse_eq_ohlcv_historic_symbol_timeframe ON public.nse_eq_ohlcv_historic USING btree (symbol, timeframe);
CREATE INDEX idx_nse_eq_ohlcv_historic_timeframe ON public.nse_eq_ohlcv_historic USING btree (timeframe);
CREATE INDEX idx_timescale_view_symbol_date ON public.nse_eq_ohlcv_historic USING btree (symbol, date DESC) WHERE (timeframe = '1day'::text);

-- Column comments

COMMENT ON COLUMN public.nse_eq_ohlcv_historic."date" IS 'Trading date and time (TIMESTAMP WITH TIME ZONE for TimescaleDB)';


-- public.nse_eq_ohlcv_ticks definition

-- Drop table

-- DROP TABLE public.nse_eq_ohlcv_ticks;

CREATE TABLE public.nse_eq_ohlcv_ticks (
	symbol text NOT NULL,
	"date" date NOT NULL,
	"open" float8 NULL,
	high float8 NULL,
	low float8 NULL,
	"close" float8 NULL,
	volume numeric(38, 2) NULL,
	total_traded_value numeric(38, 2) NULL,
	total_trades numeric(38, 2) NULL,
	delivery_quantity numeric(38, 2) NULL,
	delivery_percentage float8 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	vwap float8 NULL,
	previous_close float8 NULL,
	series text NULL,
	CONSTRAINT nse_nse_eq_ohlcv_ticks_pkey PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_nse_eq_ohlcv_ticks_date ON public.nse_eq_ohlcv_ticks USING btree (date);
CREATE INDEX idx_nse_eq_ohlcv_ticks_symbol ON public.nse_eq_ohlcv_ticks USING btree (symbol);
CREATE INDEX idx_nse_eq_ohlcv_ticks_symbol_date ON public.nse_eq_ohlcv_ticks USING btree (symbol, date);


-- public.nse_eq_sector_index definition

-- Drop table

-- DROP TABLE public.nse_eq_sector_index;

CREATE TABLE public.nse_eq_sector_index (
	symbol varchar(50) NOT NULL,
	pd_sector_index varchar(100) NOT NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nse_eq_sector_index_pkey PRIMARY KEY (symbol, pd_sector_index)
);
CREATE INDEX idx_nse_eq_sector_index_pd_sector_index ON public.nse_eq_sector_index USING btree (pd_sector_index);
CREATE INDEX idx_nse_eq_sector_index_symbol ON public.nse_eq_sector_index USING btree (symbol);


-- public.nse_eq_ticks definition

-- Drop table

-- DROP TABLE public.nse_eq_ticks;

CREATE TABLE public.nse_eq_ticks (
	symbol varchar(20) NOT NULL,
	"timestamp" timestamptz NOT NULL,
	last_price numeric(18, 4) NOT NULL,
	last_quantity int8 NULL,
	average_price numeric(18, 4) NULL,
	volume int8 NOT NULL,
	buy_quantity int8 NULL,
	sell_quantity int8 NULL,
	"open" numeric(18, 4) NULL,
	high numeric(18, 4) NULL,
	low numeric(18, 4) NULL,
	"close" numeric(18, 4) NULL,
	change_pct numeric(10, 4) NULL,
	instrument_token int8 NULL,
	bid numeric(18, 4) NULL,
	ask numeric(18, 4) NULL,
	metadata jsonb NULL,
	CONSTRAINT nse_eq_ticks_pkey PRIMARY KEY (symbol, "timestamp")
);
CREATE INDEX idx_nse_eq_ticks_symbol ON public.nse_eq_ticks USING btree (symbol);
CREATE INDEX idx_nse_eq_ticks_symbol_timestamp ON public.nse_eq_ticks USING btree (symbol, "timestamp" DESC);
CREATE INDEX idx_nse_eq_ticks_timestamp ON public.nse_eq_ticks USING btree ("timestamp" DESC);
COMMENT ON TABLE public.nse_eq_ticks IS 'Intraday tick data for NSE equities - stores real-time market data';


-- public.nse_equities definition

-- Drop table

-- DROP TABLE public.nse_equities;

CREATE TABLE public.nse_equities (
	symbol varchar(50) NOT NULL,
	date_of_listing timestamp(6) NULL,
	face_value float4 NULL,
	isin_number varchar(50) NULL,
	market_lot float4 NULL,
	name_of_company text NULL,
	paid_up_value float4 NULL,
	series varchar(50) NULL,
	CONSTRAINT nse_equities_pkey PRIMARY KEY (symbol)
);


-- public.nse_equity_instruments definition

-- Drop table

-- DROP TABLE public.nse_equity_instruments;

CREATE TABLE public.nse_equity_instruments (
	tradingsymbol varchar(50) NOT NULL,
	exchange varchar(50) NULL,
	exchange_token text NULL,
	expiry varchar(50) NULL,
	instrument_token int8 NULL,
	instrument_type varchar(50) NULL,
	last_price float8 NULL,
	lot_size int8 NULL,
	"name" varchar(512) NULL,
	segment varchar(50) NULL,
	strike float8 NULL,
	tick_size float8 NULL,
	CONSTRAINT nse_equity_instruments_pkey PRIMARY KEY (tradingsymbol)
);


-- public.nse_idx_master definition

-- Drop table

-- DROP TABLE public.nse_idx_master;

CREATE TABLE public.nse_idx_master (
	id serial4 NOT NULL,
	key_category varchar(200) NULL,
	index_name varchar(200) NULL,
	index_symbol varchar(200) NULL,
	last_price float4 NULL,
	variation float4 NULL,
	percent_change float4 NULL,
	open_price float4 NULL,
	high_price float4 NULL,
	low_price float4 NULL,
	previous_close float4 NULL,
	year_high float4 NULL,
	year_low float4 NULL,
	indicative_close float4 NULL,
	pe_ratio float4 NULL,
	pb_ratio float4 NULL,
	dividend_yield float4 NULL,
	declines int4 NULL,
	advances int4 NULL,
	unchanged int4 NULL,
	percent_change_365d float4 NULL,
	date_365d_ago varchar(200) NULL,
	chart_365d_path text NULL,
	date_30d_ago varchar(200) NULL,
	percent_change_30d float4 NULL,
	chart_30d_path text NULL,
	chart_today_path text NULL,
	previous_day numeric(12, 2) NULL,
	one_week_ago numeric(12, 2) NULL,
	one_month_ago numeric(12, 2) NULL,
	one_year_ago numeric(12, 2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nse_idx_master_pkey PRIMARY KEY (id),
	CONSTRAINT unique_index_name UNIQUE (index_name)
);
CREATE INDEX idx_nse_idx_master_created_at ON public.nse_idx_master USING btree (created_at);
CREATE UNIQUE INDEX idx_nse_idx_master_name ON public.nse_idx_master USING btree (index_name);
CREATE INDEX idx_nse_idx_master_symbol ON public.nse_idx_master USING btree (index_symbol);


-- public.nse_idx_ohlcv_historic definition

-- Drop table

-- DROP TABLE public.nse_idx_ohlcv_historic;

CREATE TABLE public.nse_idx_ohlcv_historic (
	index_name text NOT NULL,
	"date" date NOT NULL,
	"open" float8 NULL,
	high float8 NULL,
	low float8 NULL,
	"close" float8 NULL,
	volume int8 NULL,
	total_traded_value float8 NULL,
	total_trades int8 NULL,
	delivery_quantity int8 NULL,
	delivery_percentage float8 NULL,
	vwap float8 NULL,
	previous_close float8 NULL,
	series text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nse_indices_historical_data_pkey PRIMARY KEY (index_name, date)
);
CREATE INDEX idx_nse_idx_ohlcv_historic_date ON public.nse_idx_ohlcv_historic USING btree (date);
CREATE INDEX idx_nse_idx_ohlcv_historic_index_date ON public.nse_idx_ohlcv_historic USING btree (index_name, date);
CREATE INDEX idx_nse_idx_ohlcv_historic_index_name ON public.nse_idx_ohlcv_historic USING btree (index_name);


-- public.nse_idx_ticks definition

-- Drop table

-- DROP TABLE public.nse_idx_ticks;

CREATE TABLE public.nse_idx_ticks (
	advances int4 NULL,
	day_high numeric(15, 4) NULL,
	day_low numeric(15, 4) NULL,
	declines int4 NULL,
	dividend_yield numeric(10, 4) NULL,
	indicative_close numeric(15, 4) NULL,
	last_price numeric(15, 4) NULL,
	open_price numeric(15, 4) NULL,
	pb_ratio numeric(10, 4) NULL,
	pe_ratio numeric(10, 4) NULL,
	percent_change numeric(10, 4) NULL,
	percent_change_30d numeric(10, 4) NULL,
	percent_change_365d numeric(10, 4) NULL,
	previous_close numeric(15, 4) NULL,
	unchanged int4 NULL,
	variation numeric(15, 4) NULL,
	year_high numeric(15, 4) NULL,
	year_low numeric(15, 4) NULL,
	created_on timestamptz(6) DEFAULT CURRENT_TIMESTAMP NULL,
	id bigserial NOT NULL,
	modified_on timestamptz(6) DEFAULT CURRENT_TIMESTAMP NULL,
	tick_timestamp timestamptz(6) NOT NULL,
	created_by varchar(36) DEFAULT 'System'::character varying NULL,
	modified_by varchar(36) DEFAULT 'System'::character varying NULL,
	date_30d_ago varchar(50) NULL,
	date_365d_ago varchar(50) NULL,
	market_status varchar(50) NULL,
	market_status_time varchar(50) NULL,
	trade_date varchar(50) NULL,
	index_symbol varchar(100) NULL,
	index_name varchar(200) NOT NULL,
	chart_30d_path varchar(500) NULL,
	chart_365d_path varchar(500) NULL,
	chart_today_path varchar(500) NULL,
	market_status_message varchar(500) NULL,
	CONSTRAINT nse_idx_ticks_index_name_tick_timestamp_key UNIQUE (index_name, tick_timestamp),
	CONSTRAINT nse_idx_ticks_pkey PRIMARY KEY (id),
	CONSTRAINT uk76ds8jr3jc8outo7lo2pf20pe UNIQUE (index_name, tick_timestamp)
);


-- public.nse_performance_metrics definition

-- Drop table

-- DROP TABLE public.nse_performance_metrics;

CREATE TABLE public.nse_performance_metrics (
	id serial4 NOT NULL,
	execution_date date DEFAULT CURRENT_DATE NULL,
	start_time timestamp NULL,
	end_time timestamp NULL,
	total_symbols int4 NULL,
	processed_symbols int4 NULL,
	successful_fetches int4 NULL,
	failed_fetches int4 NULL,
	total_records int8 NULL,
	execution_time_seconds float8 NULL,
	symbols_per_minute float8 NULL,
	records_per_minute float8 NULL,
	success_rate float8 NULL,
	system_resources jsonb NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT nse_performance_metrics_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_nse_performance_metrics_date ON public.nse_performance_metrics USING btree (execution_date);
CREATE INDEX idx_nse_performance_metrics_success_rate ON public.nse_performance_metrics USING btree (success_rate);


-- public.nse_quote_equity definition

-- Drop table

-- DROP TABLE public.nse_quote_equity;

CREATE TABLE public.nse_quote_equity (
	symbol varchar(50) NOT NULL,
	api_response jsonb NULL,
	quote_date date NULL,
	CONSTRAINT nse_quote_equity_pkey PRIMARY KEY (symbol)
);


-- public.screener_functions definition

-- Drop table

-- DROP TABLE public.screener_functions;

CREATE TABLE public.screener_functions (
	function_id bigserial NOT NULL,
	category varchar(100) NULL,
	created_at timestamptz(6) NOT NULL,
	description text NULL,
	display_name varchar(200) NOT NULL,
	examples jsonb NULL,
	function_name varchar(100) NOT NULL,
	is_active bool NOT NULL,
	return_type varchar(50) NOT NULL,
	sort_order int4 NULL,
	sql_template text NOT NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_functions_pkey PRIMARY KEY (function_id),
	CONSTRAINT uk_axevkmo1qxkd3s6k3uf67omq0 UNIQUE (function_name)
);
CREATE INDEX idx_screener_functions_category ON public.screener_functions USING btree (category);
CREATE INDEX idx_screener_functions_is_active ON public.screener_functions USING btree (is_active);


-- public.stock definition

-- Drop table

-- DROP TABLE public.stock;

CREATE TABLE public.stock (
	id varchar(36) NOT NULL,
	createdby varchar(36) NOT NULL,
	createdon timestamp(6) NOT NULL,
	modifiedby varchar(36) NOT NULL,
	modifiedon timestamp(6) NOT NULL,
	"name" varchar(255) NOT NULL,
	symbol varchar(255) NOT NULL,
	CONSTRAINT stock_pkey PRIMARY KEY (id)
);


-- public.transactions definition

-- Drop table

-- DROP TABLE public.transactions;

CREATE TABLE public.transactions (
	id varchar(36) NOT NULL,
	createdby varchar(36) NOT NULL,
	createdon timestamp(6) NOT NULL,
	modifiedby varchar(36) NOT NULL,
	modifiedon timestamp(6) NOT NULL,
	notes varchar(500) NULL,
	portfolioid varchar(36) NOT NULL,
	pricepershare numeric(10, 2) NOT NULL,
	quantity int4 NOT NULL,
	status varchar(255) NOT NULL,
	stocksymbol varchar(20) NOT NULL,
	totalvalue numeric(10, 2) NOT NULL,
	transactiondate timestamp(6) NOT NULL,
	"type" varchar(255) NOT NULL,
	userid varchar(36) NOT NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'COMPLETED'::character varying, 'FAILED'::character varying, 'CANCELLED'::character varying, 'PROCESSING'::character varying])::text[]))),
	CONSTRAINT transactions_type_check CHECK (((type)::text = ANY ((ARRAY['BUY'::character varying, 'SELL'::character varying, 'DIVIDEND'::character varying, 'SPLIT'::character varying, 'DEPOSIT'::character varying, 'WITHDRAWAL'::character varying])::text[])))
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id int8 GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	created_at timestamp(6) NOT NULL,
	email varchar(255) NOT NULL,
	first_name varchar(255) NULL,
	full_name varchar(255) NULL,
	is_enabled bool NOT NULL,
	last_login timestamp(6) NULL,
	last_name varchar(255) NULL,
	profile_picture_url varchar(255) NULL,
	provider varchar(255) NOT NULL,
	provider_user_id varchar(255) NOT NULL,
	updated_at timestamp(6) NULL,
	CONSTRAINT ukieiivcpfkhqmium8o6xr9kkd1 UNIQUE (provider_user_id, provider),
	CONSTRAINT ukruj7llynj9miho19bgmskwipt UNIQUE (email, provider),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_provider_check CHECK (((provider)::text = ANY (ARRAY[('GOOGLE'::character varying)::text, ('MICROSOFT'::character varying)::text])))
);


-- public.backtest_events definition

-- Drop table

-- DROP TABLE public.backtest_events;

CREATE TABLE public.backtest_events (
	event_id serial4 NOT NULL,
	run_id uuid NOT NULL,
	event_date date NOT NULL,
	event_type text NOT NULL, -- Type of event: ENTRY (position opened), EXIT (position closed), EQUITY (daily snapshot)
	trade_id int4 NULL, -- Links ENTRY and EXIT events for the same trade
	entry_price numeric(15, 4) NULL,
	exit_price numeric(15, 4) NULL,
	shares numeric(15, 6) NULL,
	principal numeric(15, 2) NULL,
	profit numeric(15, 2) NULL,
	profit_pct numeric(10, 4) NULL,
	exit_reason text NULL,
	kept_shares numeric(15, 6) NULL, -- Shares kept from profit for accumulation (share accumulation strategies)
	kept_cash numeric(15, 2) NULL, -- Cash kept from profit for accumulation (cash accumulation strategies)
	holding_days int4 NULL,
	equity numeric(15, 2) NOT NULL,
	cash numeric(15, 2) NULL,
	position_value numeric(15, 2) NULL,
	accumulated_shares_value numeric(15, 2) NULL,
	accumulated_cash numeric(15, 2) NULL, -- Total accumulated cash from all profit-taking events
	peak_equity numeric(15, 2) NULL, -- Running maximum equity up to this point (for drawdown calculation)
	drawdown_value numeric(15, 2) NULL, -- Current drawdown in currency units (peak_equity - current_equity)
	drawdown_pct numeric(10, 4) NULL, -- Current drawdown as percentage of peak equity
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT backtest_events_pkey PRIMARY KEY (event_id),
	CONSTRAINT valid_event_type CHECK ((event_type = ANY (ARRAY['ENTRY'::text, 'EXIT'::text, 'EQUITY'::text]))),
	CONSTRAINT valid_exit_reason CHECK (((exit_reason IS NULL) OR (exit_reason = ANY (ARRAY['TP'::text, 'SL'::text, 'TIME'::text, 'INDICATOR'::text])))),
	CONSTRAINT backtest_events_run_id_fkey FOREIGN KEY (run_id) REFERENCES public.backtest_runs(run_id) ON DELETE CASCADE
);
CREATE INDEX idx_backtest_events_chronological ON public.backtest_events USING btree (run_id, event_date, event_id);
CREATE INDEX idx_backtest_events_date ON public.backtest_events USING btree (event_date);
CREATE INDEX idx_backtest_events_run_date ON public.backtest_events USING btree (run_id, event_date);
CREATE INDEX idx_backtest_events_run_id ON public.backtest_events USING btree (run_id);
CREATE INDEX idx_backtest_events_trade_id ON public.backtest_events USING btree (trade_id) WHERE (trade_id IS NOT NULL);
CREATE INDEX idx_backtest_events_type ON public.backtest_events USING btree (event_type);
COMMENT ON TABLE public.backtest_events IS 'Unified table storing all backtest events: entries, exits, and equity snapshots';

-- Column comments

COMMENT ON COLUMN public.backtest_events.event_type IS 'Type of event: ENTRY (position opened), EXIT (position closed), EQUITY (daily snapshot)';
COMMENT ON COLUMN public.backtest_events.trade_id IS 'Links ENTRY and EXIT events for the same trade';
COMMENT ON COLUMN public.backtest_events.kept_shares IS 'Shares kept from profit for accumulation (share accumulation strategies)';
COMMENT ON COLUMN public.backtest_events.kept_cash IS 'Cash kept from profit for accumulation (cash accumulation strategies)';
COMMENT ON COLUMN public.backtest_events.accumulated_cash IS 'Total accumulated cash from all profit-taking events';
COMMENT ON COLUMN public.backtest_events.peak_equity IS 'Running maximum equity up to this point (for drawdown calculation)';
COMMENT ON COLUMN public.backtest_events.drawdown_value IS 'Current drawdown in currency units (peak_equity - current_equity)';
COMMENT ON COLUMN public.backtest_events.drawdown_pct IS 'Current drawdown as percentage of peak equity';


-- public.backtest_trades definition

-- Drop table

-- DROP TABLE public.backtest_trades;

CREATE TABLE public.backtest_trades (
	trade_id serial4 NOT NULL,
	run_id uuid NOT NULL,
	trade_date date NOT NULL,
	trade_type text NOT NULL,
	entry_price numeric(15, 4) NULL,
	exit_price numeric(15, 4) NULL,
	shares numeric(15, 6) NULL,
	principal numeric(15, 2) NULL,
	profit numeric(15, 2) NULL,
	profit_pct numeric(10, 4) NULL,
	kept_shares numeric(15, 6) NULL, -- Shares kept from profit (for accumulation strategies)
	holding_days int4 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT backtest_trades_pkey PRIMARY KEY (trade_id),
	CONSTRAINT backtest_trades_run_id_fkey FOREIGN KEY (run_id) REFERENCES public.backtest_runs(run_id) ON DELETE CASCADE
);
CREATE INDEX idx_backtest_trades_date ON public.backtest_trades USING btree (trade_date);
CREATE INDEX idx_backtest_trades_run_id ON public.backtest_trades USING btree (run_id);
CREATE INDEX idx_backtest_trades_type ON public.backtest_trades USING btree (trade_type);
COMMENT ON TABLE public.backtest_trades IS 'Stores individual trades for each backtest run';

-- Column comments

COMMENT ON COLUMN public.backtest_trades.kept_shares IS 'Shares kept from profit (for accumulation strategies)';


-- public.portfolios definition

-- Drop table

-- DROP TABLE public.portfolios;

CREATE TABLE public.portfolios (
	id bigserial NOT NULL,
	user_id int8 NOT NULL,
	"name" varchar(200) NOT NULL,
	description text NULL,
	base_currency varchar(10) DEFAULT 'INR'::character varying NULL,
	inception_date date NULL,
	risk_profile varchar(50) NULL,
	is_active bool DEFAULT true NOT NULL,
	target_allocation jsonb NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	initial_capital numeric(15, 2) NULL, -- Starting capital for the portfolio
	current_cash numeric(15, 2) NULL, -- Current available cash in the portfolio
	trading_mode varchar(20) NULL, -- Trading mode: paper or live
	strategy_name varchar(100) NULL, -- Name of the trading strategy being used
	strategy_params jsonb NULL, -- JSON object containing strategy-specific parameters
	kite_api_key text NULL, -- Zerodha Kite API key
	kite_api_secret text NULL, -- Zerodha Kite API secret
	last_signal_check timestamptz NULL, -- Timestamp of last signal evaluation
	CONSTRAINT portfolios_pkey PRIMARY KEY (id),
	CONSTRAINT portfolios_trading_mode_check CHECK (((trading_mode)::text = ANY ((ARRAY['paper'::character varying, 'live'::character varying])::text[]))),
	CONSTRAINT portfolios_user_name_uk UNIQUE (user_id, name),
	CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolios_active ON public.portfolios USING btree (is_active);
CREATE INDEX idx_portfolios_strategy ON public.portfolios USING btree (strategy_name) WHERE (strategy_name IS NOT NULL);
CREATE INDEX idx_portfolios_trading_mode ON public.portfolios USING btree (trading_mode) WHERE (trading_mode IS NOT NULL);
CREATE INDEX idx_portfolios_user ON public.portfolios USING btree (user_id);
COMMENT ON TABLE public.portfolios IS 'User portfolios container with base currency and metadata';

-- Column comments

COMMENT ON COLUMN public.portfolios.initial_capital IS 'Starting capital for the portfolio';
COMMENT ON COLUMN public.portfolios.current_cash IS 'Current available cash in the portfolio';
COMMENT ON COLUMN public.portfolios.trading_mode IS 'Trading mode: paper or live';
COMMENT ON COLUMN public.portfolios.strategy_name IS 'Name of the trading strategy being used';
COMMENT ON COLUMN public.portfolios.strategy_params IS 'JSON object containing strategy-specific parameters';
COMMENT ON COLUMN public.portfolios.kite_api_key IS 'Zerodha Kite API key';
COMMENT ON COLUMN public.portfolios.kite_api_secret IS 'Zerodha Kite API secret';
COMMENT ON COLUMN public.portfolios.last_signal_check IS 'Timestamp of last signal evaluation';


-- public.screener definition

-- Drop table

-- DROP TABLE public.screener;

CREATE TABLE public.screener (
	screener_id bigserial NOT NULL,
	owner_user_id int8 NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	is_public bool DEFAULT false NOT NULL,
	default_universe text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT screener_pkey PRIMARY KEY (screener_id),
	CONSTRAINT screener_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id)
);
CREATE INDEX ix_screener_owner ON public.screener USING btree (owner_user_id);
CREATE INDEX ix_screener_public ON public.screener USING btree (is_public);


-- public.screener_alert definition

-- Drop table

-- DROP TABLE public.screener_alert;

CREATE TABLE public.screener_alert (
	alert_id bigserial NOT NULL,
	screener_id int8 NOT NULL,
	condition_json jsonb NOT NULL,
	delivery_channels _text DEFAULT ARRAY['inapp'::text] NOT NULL,
	is_enabled bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT screener_alert_pkey PRIMARY KEY (alert_id),
	CONSTRAINT screener_alert_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE
);


-- public.screener_alert_delivery_channels definition

-- Drop table

-- DROP TABLE public.screener_alert_delivery_channels;

CREATE TABLE public.screener_alert_delivery_channels (
	alert_id int8 NOT NULL,
	delivery_channel varchar(255) NULL,
	CONSTRAINT fk43npt3486b9ujqxr6i5ftnek3 FOREIGN KEY (alert_id) REFERENCES public.screener_alert(alert_id)
);


-- public.screener_function_params definition

-- Drop table

-- DROP TABLE public.screener_function_params;

CREATE TABLE public.screener_function_params (
	param_id bigserial NOT NULL,
	created_at timestamptz(6) NOT NULL,
	data_type varchar(50) NOT NULL,
	default_value varchar(500) NULL,
	display_name varchar(200) NOT NULL,
	example_value varchar(500) NULL,
	help_text text NULL,
	is_required bool NOT NULL,
	param_name varchar(100) NOT NULL,
	param_order int4 NOT NULL,
	updated_at timestamptz(6) NOT NULL,
	validation_rules jsonb NULL,
	function_id int8 NOT NULL,
	CONSTRAINT screener_function_params_pkey PRIMARY KEY (param_id),
	CONSTRAINT fkh5k1r7ucggleg6sio0toji0ma FOREIGN KEY (function_id) REFERENCES public.screener_functions(function_id)
);
CREATE INDEX idx_screener_function_params_function_id ON public.screener_function_params USING btree (function_id);
CREATE INDEX idx_screener_function_params_param_order ON public.screener_function_params USING btree (function_id, param_order);


-- public.screener_saved_view definition

-- Drop table

-- DROP TABLE public.screener_saved_view;

CREATE TABLE public.screener_saved_view (
	saved_view_id bigserial NOT NULL,
	screener_id int8 NOT NULL,
	user_id int8 NOT NULL,
	"name" text NOT NULL,
	table_prefs jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_saved_view_pkey PRIMARY KEY (saved_view_id),
	CONSTRAINT screener_saved_view_screener_id_user_id_name_key UNIQUE (screener_id, user_id, name),
	CONSTRAINT ukk1bl5g67f7276aegsuc0cprw5 UNIQUE (screener_id, user_id, name),
	CONSTRAINT screener_saved_view_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE,
	CONSTRAINT screener_saved_view_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);


-- public.screener_schedule definition

-- Drop table

-- DROP TABLE public.screener_schedule;

CREATE TABLE public.screener_schedule (
	schedule_id bigserial NOT NULL,
	screener_id int8 NOT NULL,
	cron_expr text NOT NULL,
	timezone text DEFAULT 'Asia/Kolkata'::text NOT NULL,
	is_enabled bool DEFAULT true NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT screener_schedule_pkey PRIMARY KEY (schedule_id),
	CONSTRAINT screener_schedule_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE
);


-- public.screener_star definition

-- Drop table

-- DROP TABLE public.screener_star;

CREATE TABLE public.screener_star (
	screener_id int8 NOT NULL,
	user_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	created_by int8 NULL,
	modified_by int8 NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_star_pkey PRIMARY KEY (screener_id, user_id),
	CONSTRAINT screener_star_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE,
	CONSTRAINT screener_star_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);


-- public.screener_version definition

-- Drop table

-- DROP TABLE public.screener_version;

CREATE TABLE public.screener_version (
	screener_version_id bigserial NOT NULL,
	screener_id int8 NOT NULL,
	version_number int4 NOT NULL,
	status text DEFAULT 'active'::text NOT NULL,
	engine text DEFAULT 'sql'::text NOT NULL,
	dsl_json jsonb NULL,
	compiled_sql text NULL,
	params_schema_json jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT screener_version_pkey PRIMARY KEY (screener_version_id),
	CONSTRAINT screener_version_screener_id_version_number_key UNIQUE (screener_id, version_number),
	CONSTRAINT uk7s1kxbjfk78hx96p5b6ch7gdr UNIQUE (screener_id, version_number),
	CONSTRAINT screener_version_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE
);


-- public.signals definition

-- Drop table

-- DROP TABLE public.signals;

CREATE TABLE public.signals (
	signal_id serial4 NOT NULL, -- Unique identifier for the signal
	portfolio_id int8 NOT NULL, -- Reference to the portfolio
	symbol text NOT NULL, -- Stock symbol
	"timestamp" timestamp NOT NULL, -- Timestamp when signal was evaluated
	signal_type text NOT NULL, -- Type of signal: ENTRY or EXIT
	price numeric(15, 4) NOT NULL, -- Price at signal evaluation time
	conditions_met jsonb NULL, -- JSON object containing conditions that were met and their values
	executed bool DEFAULT false NULL, -- Whether the signal was executed as a trade
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- Timestamp when record was created
	CONSTRAINT signals_pkey PRIMARY KEY (signal_id),
	CONSTRAINT signals_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_signals_executed ON public.signals USING btree (executed);
CREATE INDEX idx_signals_portfolio_id ON public.signals USING btree (portfolio_id);
CREATE INDEX idx_signals_signal_type ON public.signals USING btree (signal_type);
CREATE INDEX idx_signals_symbol ON public.signals USING btree (symbol);
CREATE INDEX idx_signals_timestamp ON public.signals USING btree ("timestamp" DESC);
COMMENT ON TABLE public.signals IS 'Logs all signal evaluations for analysis and debugging';

-- Column comments

COMMENT ON COLUMN public.signals.signal_id IS 'Unique identifier for the signal';
COMMENT ON COLUMN public.signals.portfolio_id IS 'Reference to the portfolio';
COMMENT ON COLUMN public.signals.symbol IS 'Stock symbol';
COMMENT ON COLUMN public.signals."timestamp" IS 'Timestamp when signal was evaluated';
COMMENT ON COLUMN public.signals.signal_type IS 'Type of signal: ENTRY or EXIT';
COMMENT ON COLUMN public.signals.price IS 'Price at signal evaluation time';
COMMENT ON COLUMN public.signals.conditions_met IS 'JSON object containing conditions that were met and their values';
COMMENT ON COLUMN public.signals.executed IS 'Whether the signal was executed as a trade';
COMMENT ON COLUMN public.signals.created_at IS 'Timestamp when record was created';


-- public.__portfolio_transactions definition

-- Drop table

-- DROP TABLE public.__portfolio_transactions;

CREATE TABLE public.__portfolio_transactions (
	id int8 DEFAULT nextval('portfolio_transactions_id_seq'::regclass) NOT NULL,
	portfolio_id int8 NOT NULL,
	symbol text NULL,
	trade_date date NOT NULL,
	trade_time timestamptz NULL,
	txn_type varchar(20) NOT NULL,
	quantity numeric(20, 6) DEFAULT 0 NOT NULL,
	price numeric(20, 6) DEFAULT 0 NOT NULL,
	fees numeric(20, 6) DEFAULT 0 NOT NULL,
	taxes numeric(20, 6) DEFAULT 0 NOT NULL,
	notes text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_transactions_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_transactions_type_chk CHECK (((txn_type)::text = ANY ((ARRAY['BUY'::character varying, 'SELL'::character varying, 'DIVIDEND'::character varying, 'SPLIT'::character varying, 'BONUS'::character varying, 'FEES'::character varying, 'TAX'::character varying, 'DEPOSIT'::character varying, 'WITHDRAWAL'::character varying, 'INTEREST'::character varying])::text[]))),
	CONSTRAINT portfolio_transactions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
	CONSTRAINT portfolio_transactions_symbol_fkey FOREIGN KEY (symbol) REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE
);
CREATE INDEX idx_portfolio_txn_portfolio_date ON public.__portfolio_transactions USING btree (portfolio_id, trade_date);
CREATE INDEX idx_portfolio_txn_symbol ON public.__portfolio_transactions USING btree (symbol);
CREATE INDEX idx_portfolio_txn_type ON public.__portfolio_transactions USING btree (txn_type);
COMMENT ON TABLE public.__portfolio_transactions IS 'All portfolio transactions: trades and cash-impacting events';


-- public.open_positions definition

-- Drop table

-- DROP TABLE public.open_positions;

CREATE TABLE public.open_positions (
	position_id serial4 NOT NULL, -- Unique identifier for the position
	portfolio_id int8 NOT NULL, -- Reference to the portfolio
	symbol text NOT NULL, -- Stock symbol
	entry_date timestamp NOT NULL, -- Date and time when position was opened
	entry_price numeric(15, 4) NOT NULL, -- Price at which position was entered
	quantity numeric(15, 6) NOT NULL, -- Number of shares in the position
	principal numeric(15, 2) NOT NULL, -- Total capital deployed for this position
	take_profit numeric(15, 4) NOT NULL, -- Take profit price level
	stop_loss numeric(15, 4) NOT NULL, -- Stop loss price level
	order_id text NULL, -- Kite order ID for entry (live trades only)
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- Timestamp when record was created
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- Timestamp when record was last updated
	CONSTRAINT open_positions_pkey PRIMARY KEY (position_id),
	CONSTRAINT open_positions_portfolio_id_symbol_key UNIQUE (portfolio_id, symbol),
	CONSTRAINT open_positions_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_open_positions_entry_date ON public.open_positions USING btree (entry_date DESC);
CREATE INDEX idx_open_positions_portfolio_id ON public.open_positions USING btree (portfolio_id);
CREATE INDEX idx_open_positions_symbol ON public.open_positions USING btree (symbol);
COMMENT ON TABLE public.open_positions IS 'Tracks currently open trading positions';

-- Column comments

COMMENT ON COLUMN public.open_positions.position_id IS 'Unique identifier for the position';
COMMENT ON COLUMN public.open_positions.portfolio_id IS 'Reference to the portfolio';
COMMENT ON COLUMN public.open_positions.symbol IS 'Stock symbol';
COMMENT ON COLUMN public.open_positions.entry_date IS 'Date and time when position was opened';
COMMENT ON COLUMN public.open_positions.entry_price IS 'Price at which position was entered';
COMMENT ON COLUMN public.open_positions.quantity IS 'Number of shares in the position';
COMMENT ON COLUMN public.open_positions.principal IS 'Total capital deployed for this position';
COMMENT ON COLUMN public.open_positions.take_profit IS 'Take profit price level';
COMMENT ON COLUMN public.open_positions.stop_loss IS 'Stop loss price level';
COMMENT ON COLUMN public.open_positions.order_id IS 'Kite order ID for entry (live trades only)';
COMMENT ON COLUMN public.open_positions.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.open_positions.updated_at IS 'Timestamp when record was last updated';


-- public.pending_orders definition

-- Drop table

-- DROP TABLE public.pending_orders;

CREATE TABLE public.pending_orders (
	pending_order_id serial4 NOT NULL, -- Unique identifier for the pending order record
	portfolio_id int8 NOT NULL, -- Reference to the portfolio
	symbol text NOT NULL, -- Stock symbol
	order_id text NOT NULL, -- Kite order ID from the API
	order_type varchar(10) NOT NULL, -- Type of order: BUY or SELL
	total_quantity int4 NOT NULL, -- Total quantity ordered
	filled_quantity int4 DEFAULT 0 NOT NULL, -- Quantity filled so far
	remaining_quantity int4 NOT NULL, -- Quantity remaining to be filled
	condition_values jsonb NOT NULL, -- JSON object storing indicator values at order placement time for comparison
	order_timestamp timestamp NOT NULL, -- Timestamp when order was placed
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- Timestamp when record was created
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- Timestamp when record was last updated
	CONSTRAINT pending_orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['BUY'::character varying, 'SELL'::character varying])::text[]))),
	CONSTRAINT pending_orders_pkey PRIMARY KEY (pending_order_id),
	CONSTRAINT pending_orders_portfolio_id_symbol_order_type_key UNIQUE (portfolio_id, symbol, order_type),
	CONSTRAINT pending_orders_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_pending_orders_order_id ON public.pending_orders USING btree (order_id);
CREATE INDEX idx_pending_orders_order_type ON public.pending_orders USING btree (order_type);
CREATE INDEX idx_pending_orders_portfolio_id ON public.pending_orders USING btree (portfolio_id);
CREATE INDEX idx_pending_orders_symbol ON public.pending_orders USING btree (symbol);
COMMENT ON TABLE public.pending_orders IS 'Tracks pending orders with partial fill support and condition values';

-- Column comments

COMMENT ON COLUMN public.pending_orders.pending_order_id IS 'Unique identifier for the pending order record';
COMMENT ON COLUMN public.pending_orders.portfolio_id IS 'Reference to the portfolio';
COMMENT ON COLUMN public.pending_orders.symbol IS 'Stock symbol';
COMMENT ON COLUMN public.pending_orders.order_id IS 'Kite order ID from the API';
COMMENT ON COLUMN public.pending_orders.order_type IS 'Type of order: BUY or SELL';
COMMENT ON COLUMN public.pending_orders.total_quantity IS 'Total quantity ordered';
COMMENT ON COLUMN public.pending_orders.filled_quantity IS 'Quantity filled so far';
COMMENT ON COLUMN public.pending_orders.remaining_quantity IS 'Quantity remaining to be filled';
COMMENT ON COLUMN public.pending_orders.condition_values IS 'JSON object storing indicator values at order placement time for comparison';
COMMENT ON COLUMN public.pending_orders.order_timestamp IS 'Timestamp when order was placed';
COMMENT ON COLUMN public.pending_orders.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.pending_orders.updated_at IS 'Timestamp when record was last updated';


-- public.portfolio_benchmarks definition

-- Drop table

-- DROP TABLE public.portfolio_benchmarks;

CREATE TABLE public.portfolio_benchmarks (
	portfolio_id int8 NOT NULL,
	index_name varchar(200) NOT NULL,
	weight_pct numeric(10, 6) DEFAULT 1.0 NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_benchmarks_pkey PRIMARY KEY (portfolio_id, index_name),
	CONSTRAINT portfolio_benchmarks_index_name_fkey FOREIGN KEY (index_name) REFERENCES public.nse_idx_master(index_name) ON UPDATE CASCADE,
	CONSTRAINT portfolio_benchmarks_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_benchmarks_index_name ON public.portfolio_benchmarks USING btree (index_name);
CREATE INDEX idx_portfolio_benchmarks_portfolio ON public.portfolio_benchmarks USING btree (portfolio_id);
COMMENT ON TABLE public.portfolio_benchmarks IS 'Benchmark indices assigned to a portfolio with optional weights (sum may equal 1)';


-- public.portfolio_cash_flows definition

-- Drop table

-- DROP TABLE public.portfolio_cash_flows;

CREATE TABLE public.portfolio_cash_flows (
	id bigserial NOT NULL,
	portfolio_id int8 NOT NULL,
	flow_date date NOT NULL,
	amount numeric(20, 6) NOT NULL,
	flow_type varchar(20) NOT NULL,
	reference_txn_id int8 NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_cash_flows_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_cash_flows_type_chk CHECK (((flow_type)::text = ANY ((ARRAY['DEPOSIT'::character varying, 'WITHDRAWAL'::character varying, 'DIVIDEND'::character varying, 'INTEREST'::character varying, 'FEES'::character varying, 'TAX'::character varying])::text[]))),
	CONSTRAINT portfolio_cash_flows_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
	CONSTRAINT portfolio_cash_flows_reference_txn_id_fkey FOREIGN KEY (reference_txn_id) REFERENCES public.__portfolio_transactions(id) ON DELETE SET NULL
);
CREATE INDEX idx_portfolio_cash_flows_portfolio_date ON public.portfolio_cash_flows USING btree (portfolio_id, flow_date);
CREATE INDEX idx_portfolio_cash_flows_type ON public.portfolio_cash_flows USING btree (flow_type);
COMMENT ON TABLE public.portfolio_cash_flows IS 'Explicit cash movements at portfolio level (links to transactions when applicable)';


-- public.portfolio_holding_valuation_daily definition

-- Drop table

-- DROP TABLE public.portfolio_holding_valuation_daily;

CREATE TABLE public.portfolio_holding_valuation_daily (
	id bigserial NOT NULL,
	portfolio_id int8 NOT NULL,
	symbol text NOT NULL,
	"date" date NOT NULL,
	quantity numeric(20, 6) DEFAULT 0 NOT NULL,
	market_price numeric(20, 6) DEFAULT 0 NOT NULL,
	market_value numeric(20, 6) DEFAULT 0 NOT NULL,
	cost_basis numeric(20, 6) DEFAULT 0 NOT NULL,
	pnl_daily numeric(20, 6) DEFAULT 0 NOT NULL,
	pnl_total numeric(20, 6) DEFAULT 0 NOT NULL,
	weight_pct numeric(10, 6) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_holding_valuation_daily_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_holding_valuation_daily_uk UNIQUE (portfolio_id, symbol, date),
	CONSTRAINT portfolio_holding_valuation_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
	CONSTRAINT portfolio_holding_valuation_daily_symbol_fkey FOREIGN KEY (symbol) REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE
);
CREATE INDEX idx_phvd_portfolio_date ON public.portfolio_holding_valuation_daily USING btree (portfolio_id, date);
CREATE INDEX idx_phvd_symbol_date ON public.portfolio_holding_valuation_daily USING btree (symbol, date);
COMMENT ON TABLE public.portfolio_holding_valuation_daily IS 'Holding-level daily valuation and PnL for each portfolio symbol';


-- public.portfolio_holdings definition

-- Drop table

-- DROP TABLE public.portfolio_holdings;

CREATE TABLE public.portfolio_holdings (
	id bigserial NOT NULL,
	portfolio_id int8 NOT NULL,
	symbol text NOT NULL,
	quantity numeric(20, 6) DEFAULT 0 NOT NULL,
	avg_cost numeric(20, 6) DEFAULT 0 NOT NULL,
	realized_pnl numeric(20, 6) DEFAULT 0 NOT NULL,
	last_updated timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_holdings_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_holdings_portfolio_symbol_uk UNIQUE (portfolio_id, symbol),
	CONSTRAINT uk_portfolio_holdings_portfolio_symbol UNIQUE (portfolio_id, symbol),
	CONSTRAINT portfolio_holdings_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE,
	CONSTRAINT portfolio_holdings_symbol_fkey FOREIGN KEY (symbol) REFERENCES public.nse_eq_master(symbol) ON UPDATE CASCADE
);
CREATE INDEX idx_portfolio_holdings_portfolio ON public.portfolio_holdings USING btree (portfolio_id);
CREATE INDEX idx_portfolio_holdings_symbol ON public.portfolio_holdings USING btree (symbol);
COMMENT ON TABLE public.portfolio_holdings IS 'Aggregated current position per symbol within a portfolio';


-- public.portfolio_metrics_daily definition

-- Drop table

-- DROP TABLE public.portfolio_metrics_daily;

CREATE TABLE public.portfolio_metrics_daily (
	id bigserial NOT NULL,
	portfolio_id int8 NOT NULL,
	"date" date NOT NULL,
	nav numeric(20, 8) NULL,
	twr_daily_pct numeric(12, 6) NULL,
	twr_cumulative_pct numeric(12, 6) NULL,
	mwr_cumulative_pct numeric(12, 6) NULL,
	irr_to_date_pct numeric(12, 6) NULL,
	irr_annualized_pct numeric(12, 6) NULL,
	xirr_to_date_pct numeric(12, 6) NULL,
	xirr_annualized_pct numeric(12, 6) NULL,
	cagr_pct numeric(12, 6) NULL,
	ytd_return_pct numeric(12, 6) NULL,
	return_1m_pct numeric(12, 6) NULL,
	return_3m_pct numeric(12, 6) NULL,
	return_6m_pct numeric(12, 6) NULL,
	return_1y_pct numeric(12, 6) NULL,
	return_3y_annualized_pct numeric(12, 6) NULL,
	return_5y_annualized_pct numeric(12, 6) NULL,
	drawdown_pct numeric(12, 6) NULL,
	max_drawdown_pct numeric(12, 6) NULL,
	volatility_30d_pct numeric(12, 6) NULL,
	volatility_90d_pct numeric(12, 6) NULL,
	downside_deviation_30d_pct numeric(12, 6) NULL,
	sharpe_30d numeric(14, 6) NULL,
	sortino_30d numeric(14, 6) NULL,
	calmar_1y numeric(14, 6) NULL,
	treynor_30d numeric(14, 6) NULL,
	beta_30d numeric(14, 6) NULL,
	alpha_30d numeric(14, 6) NULL,
	tracking_error_30d numeric(14, 6) NULL,
	information_ratio_30d numeric(14, 6) NULL,
	var_95_30d numeric(20, 6) NULL,
	cvar_95_30d numeric(20, 6) NULL,
	upside_capture_1y numeric(12, 6) NULL,
	downside_capture_1y numeric(12, 6) NULL,
	active_return_30d_pct numeric(12, 6) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	total_trades int4 NULL, -- Total number of completed trades
	winning_trades int4 NULL, -- Number of profitable trades
	losing_trades int4 NULL, -- Number of losing trades
	win_rate numeric(5, 4) NULL, -- Percentage of winning trades
	avg_win numeric(15, 2) NULL, -- Average profit per winning trade
	avg_loss numeric(15, 2) NULL, -- Average loss per losing trade
	profit_factor numeric(10, 4) NULL, -- Ratio of gross profit to gross loss
	expectancy numeric(15, 2) NULL, -- Expected value per trade
	max_consecutive_wins int4 NULL, -- Maximum consecutive winning trades
	max_consecutive_losses int4 NULL, -- Maximum consecutive losing trades
	avg_holding_days numeric(10, 2) NULL, -- Average number of days positions are held
	total_equity numeric(15, 2) NULL, -- Total portfolio equity (cash + positions + accumulated shares)
	cash_balance numeric(15, 2) NULL, -- Current cash balance
	position_value numeric(15, 2) NULL, -- Total value of open positions
	accumulated_shares_value numeric(15, 2) NULL, -- Total value of accumulated shares from profit sharing
	peak_equity numeric(15, 2) NULL, -- Highest equity value reached
	drawdown_value numeric(15, 2) NULL, -- Current drawdown in absolute value
	total_return numeric(15, 2) NULL, -- Total return in absolute value
	total_return_pct numeric(10, 4) NULL, -- Total return as percentage
	max_drawdown_value numeric(15, 2) NULL, -- Maximum drawdown in absolute value
	avg_drawdown_pct numeric(10, 4) NULL, -- Average drawdown as percentage
	CONSTRAINT portfolio_metrics_daily_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_metrics_daily_uk UNIQUE (portfolio_id, date),
	CONSTRAINT portfolio_metrics_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_metrics_portfolio_date ON public.portfolio_metrics_daily USING btree (portfolio_id, date);
COMMENT ON TABLE public.portfolio_metrics_daily IS 'Time series of portfolio analytics and risk metrics for benchmarking and monitoring';

-- Column comments

COMMENT ON COLUMN public.portfolio_metrics_daily.total_trades IS 'Total number of completed trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.winning_trades IS 'Number of profitable trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.losing_trades IS 'Number of losing trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.win_rate IS 'Percentage of winning trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.avg_win IS 'Average profit per winning trade';
COMMENT ON COLUMN public.portfolio_metrics_daily.avg_loss IS 'Average loss per losing trade';
COMMENT ON COLUMN public.portfolio_metrics_daily.profit_factor IS 'Ratio of gross profit to gross loss';
COMMENT ON COLUMN public.portfolio_metrics_daily.expectancy IS 'Expected value per trade';
COMMENT ON COLUMN public.portfolio_metrics_daily.max_consecutive_wins IS 'Maximum consecutive winning trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.max_consecutive_losses IS 'Maximum consecutive losing trades';
COMMENT ON COLUMN public.portfolio_metrics_daily.avg_holding_days IS 'Average number of days positions are held';
COMMENT ON COLUMN public.portfolio_metrics_daily.total_equity IS 'Total portfolio equity (cash + positions + accumulated shares)';
COMMENT ON COLUMN public.portfolio_metrics_daily.cash_balance IS 'Current cash balance';
COMMENT ON COLUMN public.portfolio_metrics_daily.position_value IS 'Total value of open positions';
COMMENT ON COLUMN public.portfolio_metrics_daily.accumulated_shares_value IS 'Total value of accumulated shares from profit sharing';
COMMENT ON COLUMN public.portfolio_metrics_daily.peak_equity IS 'Highest equity value reached';
COMMENT ON COLUMN public.portfolio_metrics_daily.drawdown_value IS 'Current drawdown in absolute value';
COMMENT ON COLUMN public.portfolio_metrics_daily.total_return IS 'Total return in absolute value';
COMMENT ON COLUMN public.portfolio_metrics_daily.total_return_pct IS 'Total return as percentage';
COMMENT ON COLUMN public.portfolio_metrics_daily.max_drawdown_value IS 'Maximum drawdown in absolute value';
COMMENT ON COLUMN public.portfolio_metrics_daily.avg_drawdown_pct IS 'Average drawdown as percentage';


-- public.portfolio_stock_metrics_daily definition

-- Drop table

-- DROP TABLE public.portfolio_stock_metrics_daily;

CREATE TABLE public.portfolio_stock_metrics_daily (
	metric_id serial4 NOT NULL, -- Unique identifier for the metric record
	portfolio_id int8 NOT NULL, -- Reference to the portfolio
	symbol text NOT NULL, -- Stock symbol
	"date" date NOT NULL, -- Date of the metrics
	equity numeric(15, 2) NOT NULL, -- Total equity for this stock (cash + position + accumulated shares)
	cash numeric(15, 2) NOT NULL, -- Cash allocated to this stock
	position_value numeric(15, 2) NOT NULL, -- Value of open position for this stock
	accumulated_shares numeric(15, 6) NOT NULL, -- Number of accumulated shares from profit sharing
	accumulated_shares_value numeric(15, 2) NOT NULL, -- Value of accumulated shares
	peak_equity numeric(15, 2) NULL, -- Highest equity value reached for this stock
	drawdown_value numeric(15, 2) NULL, -- Current drawdown in absolute value
	drawdown_pct numeric(10, 4) NULL, -- Current drawdown as percentage
	total_return numeric(15, 2) NULL,
	total_return_pct numeric(10, 4) NULL,
	cagr numeric(10, 4) NULL,
	irr numeric(10, 4) NULL,
	sharpe_ratio numeric(10, 4) NULL,
	sortino_ratio numeric(10, 4) NULL,
	calmar_ratio numeric(10, 4) NULL,
	max_drawdown_pct numeric(10, 4) NULL,
	max_drawdown_value numeric(15, 2) NULL,
	avg_drawdown_pct numeric(10, 4) NULL,
	total_trades int4 NULL,
	winning_trades int4 NULL,
	losing_trades int4 NULL,
	win_rate numeric(5, 4) NULL,
	avg_win numeric(15, 2) NULL,
	avg_loss numeric(15, 2) NULL,
	profit_factor numeric(10, 4) NULL,
	expectancy numeric(15, 2) NULL,
	max_consecutive_wins int4 NULL,
	max_consecutive_losses int4 NULL,
	avg_holding_days numeric(10, 2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT portfolio_stock_metrics_daily_pkey PRIMARY KEY (metric_id),
	CONSTRAINT portfolio_stock_metrics_daily_portfolio_id_symbol_date_key UNIQUE (portfolio_id, symbol, date),
	CONSTRAINT portfolio_stock_metrics_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_stock_metrics_daily_date ON public.portfolio_stock_metrics_daily USING btree (date DESC);
CREATE INDEX idx_portfolio_stock_metrics_daily_portfolio_id ON public.portfolio_stock_metrics_daily USING btree (portfolio_id);
CREATE INDEX idx_portfolio_stock_metrics_daily_portfolio_symbol ON public.portfolio_stock_metrics_daily USING btree (portfolio_id, symbol);
CREATE INDEX idx_portfolio_stock_metrics_daily_symbol ON public.portfolio_stock_metrics_daily USING btree (symbol);
COMMENT ON TABLE public.portfolio_stock_metrics_daily IS 'Daily performance metrics at individual stock level';

-- Column comments

COMMENT ON COLUMN public.portfolio_stock_metrics_daily.metric_id IS 'Unique identifier for the metric record';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.portfolio_id IS 'Reference to the portfolio';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.symbol IS 'Stock symbol';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily."date" IS 'Date of the metrics';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.equity IS 'Total equity for this stock (cash + position + accumulated shares)';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.cash IS 'Cash allocated to this stock';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.position_value IS 'Value of open position for this stock';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.accumulated_shares IS 'Number of accumulated shares from profit sharing';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.accumulated_shares_value IS 'Value of accumulated shares';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.peak_equity IS 'Highest equity value reached for this stock';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.drawdown_value IS 'Current drawdown in absolute value';
COMMENT ON COLUMN public.portfolio_stock_metrics_daily.drawdown_pct IS 'Current drawdown as percentage';


-- public.portfolio_trade_logs definition

-- Drop table

-- DROP TABLE public.portfolio_trade_logs;

CREATE TABLE public.portfolio_trade_logs (
	id serial4 NOT NULL,
	portfolio_id int4 NOT NULL,
	cycle_timestamp timestamp NOT NULL,
	symbol varchar(20) NOT NULL,
	evaluation_type varchar(10) NOT NULL,
	current_price numeric(12, 2) NULL,
	current_rsi numeric(5, 2) NULL,
	current_volume int8 NULL,
	evaluation_result varchar(50) NULL,
	conditions_met int4 NULL,
	total_conditions int4 NULL,
	condition_details jsonb NULL, -- JSON object containing all condition values, thresholds, and evaluation details
	position_entry_price numeric(12, 2) NULL,
	position_quantity int4 NULL,
	position_unrealized_pnl numeric(12, 2) NULL,
	position_hold_duration_minutes int4 NULL,
	take_profit_price numeric(12, 2) NULL,
	stop_loss_price numeric(12, 2) NULL,
	tp_distance_pct numeric(5, 2) NULL,
	sl_distance_pct numeric(5, 2) NULL,
	intraday_high numeric(12, 2) NULL,
	intraday_low numeric(12, 2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT portfolio_trade_logs_pkey PRIMARY KEY (id),
	CONSTRAINT fk_portfolio FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_trade_logs_date ON public.portfolio_trade_logs USING btree (date(cycle_timestamp));
CREATE INDEX idx_trade_logs_evaluation_type ON public.portfolio_trade_logs USING btree (evaluation_type);
CREATE INDEX idx_trade_logs_portfolio_symbol_timestamp ON public.portfolio_trade_logs USING btree (portfolio_id, symbol, cycle_timestamp DESC);
CREATE INDEX idx_trade_logs_portfolio_timestamp ON public.portfolio_trade_logs USING btree (portfolio_id, cycle_timestamp DESC);
CREATE INDEX idx_trade_logs_result ON public.portfolio_trade_logs USING btree (evaluation_result);
CREATE INDEX idx_trade_logs_symbol ON public.portfolio_trade_logs USING btree (symbol);
COMMENT ON TABLE public.portfolio_trade_logs IS 'Detailed evaluation logs for each symbol in each trading cycle';

-- Column comments

COMMENT ON COLUMN public.portfolio_trade_logs.condition_details IS 'JSON object containing all condition values, thresholds, and evaluation details';


-- public.portfolio_trades definition

-- Drop table

-- DROP TABLE public.portfolio_trades;

CREATE TABLE public.portfolio_trades (
	trade_id serial4 NOT NULL, -- Unique identifier for the trade
	portfolio_id int8 NOT NULL, -- Reference to the portfolio
	symbol text NOT NULL, -- Stock symbol
	entry_date timestamp NOT NULL, -- Date and time of trade entry
	entry_price numeric(15, 4) NOT NULL, -- Price at which position was entered
	exit_date timestamp NOT NULL, -- Date and time of trade exit
	exit_price numeric(15, 4) NOT NULL, -- Price at which position was exited
	quantity numeric(15, 6) NOT NULL, -- Number of shares traded
	principal numeric(15, 2) NOT NULL, -- Total capital deployed for the trade
	profit numeric(15, 2) NOT NULL, -- Profit or loss from the trade
	profit_pct numeric(10, 4) NOT NULL, -- Profit or loss as percentage
	exit_type text NOT NULL, -- Type of exit: TP (take profit) or SL (stop loss)
	kept_shares numeric(15, 6) DEFAULT 0 NULL, -- Number of shares kept from profit sharing
	kept_cash numeric(15, 2) DEFAULT 0 NULL, -- Cash value of kept shares at exit time
	holding_days int4 NOT NULL, -- Number of days position was held
	order_id_entry text NULL, -- Kite order ID for entry (live trades only)
	order_id_exit text NULL, -- Kite order ID for exit (live trades only)
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT portfolio_trades_pkey PRIMARY KEY (trade_id),
	CONSTRAINT portfolio_trades_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_trades_entry_date ON public.portfolio_trades USING btree (entry_date DESC);
CREATE INDEX idx_portfolio_trades_exit_date ON public.portfolio_trades USING btree (exit_date DESC);
CREATE INDEX idx_portfolio_trades_portfolio_id ON public.portfolio_trades USING btree (portfolio_id);
CREATE INDEX idx_portfolio_trades_symbol ON public.portfolio_trades USING btree (symbol);
COMMENT ON TABLE public.portfolio_trades IS 'Stores completed trade records for portfolio analysis';

-- Column comments

COMMENT ON COLUMN public.portfolio_trades.trade_id IS 'Unique identifier for the trade';
COMMENT ON COLUMN public.portfolio_trades.portfolio_id IS 'Reference to the portfolio';
COMMENT ON COLUMN public.portfolio_trades.symbol IS 'Stock symbol';
COMMENT ON COLUMN public.portfolio_trades.entry_date IS 'Date and time of trade entry';
COMMENT ON COLUMN public.portfolio_trades.entry_price IS 'Price at which position was entered';
COMMENT ON COLUMN public.portfolio_trades.exit_date IS 'Date and time of trade exit';
COMMENT ON COLUMN public.portfolio_trades.exit_price IS 'Price at which position was exited';
COMMENT ON COLUMN public.portfolio_trades.quantity IS 'Number of shares traded';
COMMENT ON COLUMN public.portfolio_trades.principal IS 'Total capital deployed for the trade';
COMMENT ON COLUMN public.portfolio_trades.profit IS 'Profit or loss from the trade';
COMMENT ON COLUMN public.portfolio_trades.profit_pct IS 'Profit or loss as percentage';
COMMENT ON COLUMN public.portfolio_trades.exit_type IS 'Type of exit: TP (take profit) or SL (stop loss)';
COMMENT ON COLUMN public.portfolio_trades.kept_shares IS 'Number of shares kept from profit sharing';
COMMENT ON COLUMN public.portfolio_trades.kept_cash IS 'Cash value of kept shares at exit time';
COMMENT ON COLUMN public.portfolio_trades.holding_days IS 'Number of days position was held';
COMMENT ON COLUMN public.portfolio_trades.order_id_entry IS 'Kite order ID for entry (live trades only)';
COMMENT ON COLUMN public.portfolio_trades.order_id_exit IS 'Kite order ID for exit (live trades only)';


-- public.portfolio_valuation_daily definition

-- Drop table

-- DROP TABLE public.portfolio_valuation_daily;

CREATE TABLE public.portfolio_valuation_daily (
	id bigserial NOT NULL,
	portfolio_id int8 NOT NULL,
	"date" date NOT NULL,
	total_market_value numeric(20, 6) DEFAULT 0 NOT NULL,
	total_cost_basis numeric(20, 6) DEFAULT 0 NOT NULL,
	cash_balance numeric(20, 6) DEFAULT 0 NOT NULL,
	net_invested numeric(20, 6) DEFAULT 0 NOT NULL,
	pnl_daily numeric(20, 6) DEFAULT 0 NOT NULL,
	pnl_total numeric(20, 6) DEFAULT 0 NOT NULL,
	return_daily_pct numeric(12, 6) NULL,
	return_cumulative_pct numeric(12, 6) NULL,
	twr_daily_pct numeric(12, 6) NULL,
	twr_cumulative_pct numeric(12, 6) NULL,
	mwr_cumulative_pct numeric(12, 6) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT portfolio_valuation_daily_pkey PRIMARY KEY (id),
	CONSTRAINT portfolio_valuation_daily_uk UNIQUE (portfolio_id, date),
	CONSTRAINT portfolio_valuation_daily_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES public.portfolios(id) ON DELETE CASCADE
);
CREATE INDEX idx_portfolio_valuation_portfolio_date ON public.portfolio_valuation_daily USING btree (portfolio_id, date);
COMMENT ON TABLE public.portfolio_valuation_daily IS 'Portfolio-level daily valuation, PnL, and return metrics';


-- public.screener_paramset definition

-- Drop table

-- DROP TABLE public.screener_paramset;

CREATE TABLE public.screener_paramset (
	paramset_id bigserial NOT NULL,
	screener_version_id int8 NOT NULL,
	"name" text NOT NULL,
	params_json jsonb NOT NULL,
	created_by_user_id int8 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT screener_paramset_pkey PRIMARY KEY (paramset_id),
	CONSTRAINT screener_paramset_screener_version_id_name_key UNIQUE (screener_version_id, name),
	CONSTRAINT uk1jcdpw44uyx7ebola4ehwfh0g UNIQUE (screener_version_id, name),
	CONSTRAINT screener_paramset_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.users(id),
	CONSTRAINT screener_paramset_screener_version_id_fkey FOREIGN KEY (screener_version_id) REFERENCES public.screener_version(screener_version_id) ON DELETE CASCADE
);


-- public.screener_run definition

-- Drop table

-- DROP TABLE public.screener_run;

CREATE TABLE public.screener_run (
	screener_run_id bigserial NOT NULL,
	screener_id int8 NOT NULL,
	screener_version_id int8 NOT NULL,
	triggered_by_user_id int8 NULL,
	paramset_id int8 NULL,
	params_json jsonb NULL,
	universe_snapshot jsonb NULL,
	run_for_trading_day date NULL,
	started_at timestamptz DEFAULT now() NOT NULL,
	finished_at timestamptz NULL,
	status text DEFAULT 'running'::text NOT NULL,
	error_message text NULL,
	total_candidates int4 NULL,
	total_matches int4 NULL,
	created_at timestamptz(6) NOT NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_run_pkey PRIMARY KEY (screener_run_id),
	CONSTRAINT screener_run_paramset_id_fkey FOREIGN KEY (paramset_id) REFERENCES public.screener_paramset(paramset_id),
	CONSTRAINT screener_run_screener_id_fkey FOREIGN KEY (screener_id) REFERENCES public.screener(screener_id) ON DELETE CASCADE,
	CONSTRAINT screener_run_screener_version_id_fkey FOREIGN KEY (screener_version_id) REFERENCES public.screener_version(screener_version_id),
	CONSTRAINT screener_run_triggered_by_user_id_fkey FOREIGN KEY (triggered_by_user_id) REFERENCES public.users(id)
);
CREATE INDEX ix_screener_run_cascade ON public.screener_run USING btree (screener_id, run_for_trading_day DESC, started_at DESC);
CREATE INDEX ix_screener_run_status ON public.screener_run USING btree (status);


-- public.screener_result definition

-- Drop table

-- DROP TABLE public.screener_result;

CREATE TABLE public.screener_result (
	screener_run_id int8 NOT NULL,
	symbol text NOT NULL,
	"matched" bool NOT NULL,
	score_0_1 numeric(6, 4) NULL,
	rank_in_run int4 NULL,
	metrics_json jsonb NULL,
	reason_json jsonb NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	created_by int8 NULL,
	modified_by int8 NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_result_pkey PRIMARY KEY (screener_run_id, symbol),
	CONSTRAINT screener_result_screener_run_id_fkey FOREIGN KEY (screener_run_id) REFERENCES public.screener_run(screener_run_id) ON DELETE CASCADE,
	CONSTRAINT screener_result_symbol_fkey FOREIGN KEY (symbol) REFERENCES public.nse_eq_master(symbol)
);
CREATE INDEX ix_screener_result_rank ON public.screener_result USING btree (screener_run_id, rank_in_run);
CREATE INDEX ix_screener_result_score ON public.screener_result USING btree (screener_run_id, score_0_1 DESC);


-- public.screener_result_diff definition

-- Drop table

-- DROP TABLE public.screener_result_diff;

CREATE TABLE public.screener_result_diff (
	screener_run_id int8 NOT NULL,
	prev_screener_run_id int8 NOT NULL,
	symbol text NOT NULL,
	change_type text NOT NULL,
	prev_rank int4 NULL,
	new_rank int4 NULL,
	created_at timestamptz(6) NOT NULL,
	created_by int8 NULL,
	modified_by int8 NULL,
	updated_at timestamptz(6) NOT NULL,
	CONSTRAINT screener_result_diff_pkey PRIMARY KEY (screener_run_id, prev_screener_run_id, symbol),
	CONSTRAINT screener_result_diff_prev_screener_run_id_fkey FOREIGN KEY (prev_screener_run_id) REFERENCES public.screener_run(screener_run_id),
	CONSTRAINT screener_result_diff_screener_run_id_fkey FOREIGN KEY (screener_run_id) REFERENCES public.screener_run(screener_run_id) ON DELETE CASCADE,
	CONSTRAINT screener_result_diff_symbol_fkey FOREIGN KEY (symbol) REFERENCES public.nse_eq_master(symbol)
);


-- public.backtest_daily_equity_view source

CREATE OR REPLACE VIEW public.backtest_daily_equity_view
AS SELECT DISTINCT ON (run_id, event_date) run_id,
    event_date AS date,
    equity,
    cash,
    position_value,
    accumulated_shares_value,
    accumulated_cash,
    peak_equity,
    drawdown_value,
    drawdown_pct
   FROM backtest_events
  ORDER BY run_id, event_date, event_id DESC;

COMMENT ON VIEW public.backtest_daily_equity_view IS 'One equity snapshot per day (last event of each day)';


-- public.backtest_equity_view source

CREATE OR REPLACE VIEW public.backtest_equity_view
AS SELECT run_id,
    event_date AS date,
    equity,
    cash,
    position_value,
    accumulated_shares_value,
    accumulated_cash,
    peak_equity,
    drawdown_value,
    drawdown_pct
   FROM backtest_events
  ORDER BY run_id, event_date;

COMMENT ON VIEW public.backtest_equity_view IS 'All events with equity data in chronological order';


-- public.backtest_trades_view source

CREATE OR REPLACE VIEW public.backtest_trades_view
AS SELECT entry.run_id,
    entry.trade_id,
    entry.event_date AS entry_date,
    entry.entry_price,
    entry.shares,
    entry.principal,
    exit.event_date AS exit_date,
    exit.exit_price,
    exit.exit_reason,
    exit.profit,
    exit.profit_pct,
    exit.kept_shares,
    exit.kept_cash,
    exit.holding_days,
    entry.equity AS entry_equity,
    exit.equity AS exit_equity
   FROM backtest_events entry
     JOIN backtest_events exit ON entry.run_id = exit.run_id AND entry.trade_id = exit.trade_id AND entry.event_type = 'ENTRY'::text AND exit.event_type = 'EXIT'::text
  ORDER BY entry.event_date, entry.trade_id;

COMMENT ON VIEW public.backtest_trades_view IS 'Convenient view showing complete trades with entry and exit data';


-- public.kite_instrument_indicator_prices source

CREATE OR REPLACE VIEW public.kite_instrument_indicator_prices
AS SELECT i.instrument_token,
    i.exchange,
    i.date,
    i.candle_interval,
    i.sma_5,
    i.sma_10,
    i.sma_14,
    i.sma_20,
    i.sma_30,
    i.sma_50,
    i.sma_100,
    i.sma_200,
    i.ema_5,
    i.ema_10,
    i.ema_14,
    i.ema_20,
    i.ema_30,
    i.ema_50,
    i.ema_100,
    i.ema_200,
    i.wma_5,
    i.wma_10,
    i.wma_20,
    i.wma_30,
    i.hma_20,
    i.tema_20,
    i.kama_20,
    i.rsi_5,
    i.rsi_10,
    i.rsi_14,
    i.rsi_20,
    i.rsi_21,
    i.rsi_30,
    i.rsi_50,
    i.rsi_100,
    i.rsi_200,
    i.macd_line,
    i.macd_signal,
    i.macd_histogram,
    i.macd_12_26_9,
    i.macd_12_26_d,
    i.bb_upper_5,
    i.bb_middle_5,
    i.bb_lower_5,
    i.bb_width_5,
    i.bb_percent_b_5,
    i.bb_upper_10,
    i.bb_middle_10,
    i.bb_lower_10,
    i.bb_width_10,
    i.bb_percent_b_10,
    i.bb_upper_14,
    i.bb_middle_14,
    i.bb_lower_14,
    i.bb_width_14,
    i.bb_percent_b_14,
    i.bb_upper_20,
    i.bb_middle_20,
    i.bb_lower_20,
    i.bb_width_20,
    i.bb_percent_b_20,
    i.bb_upper_30,
    i.bb_middle_30,
    i.bb_lower_30,
    i.bb_width_30,
    i.bb_percent_b_30,
    i.bb_upper_50,
    i.bb_middle_50,
    i.bb_lower_50,
    i.bb_width_50,
    i.bb_percent_b_50,
    i.bb_upper_100,
    i.bb_middle_100,
    i.bb_lower_100,
    i.bb_width_100,
    i.bb_percent_b_100,
    i.bb_upper_200,
    i.bb_middle_200,
    i.bb_lower_200,
    i.bb_width_200,
    i.bb_percent_b_200,
    i.volume_sma_10,
    i.volume_sma_20,
    i.volume_sma_30,
    i.volume_sma_50,
    i.volume_ema_10,
    i.volume_ema_20,
    i.volume_ema_30,
    i.volume_ema_50,
    i.volume_ratio,
    i.cmf_14,
    i.cmf_21,
    i.vpt,
    i.vwap,
    i.atr_5,
    i.atr_10,
    i.atr_14,
    i.atr_20,
    i.atr_21,
    i.atr_30,
    i.atr_50,
    i.atr_100,
    i.atr_200,
    i.adx_14,
    i.adx_21,
    i.adx_50,
    i.di_plus_14,
    i.di_plus_21,
    i.di_plus_50,
    i.di_minus_14,
    i.di_minus_21,
    i.di_minus_50,
    i.cci_14,
    i.cci_20,
    i.cci_50,
    i.keltner_upper_14,
    i.keltner_middle_14,
    i.keltner_lower_14,
    i.keltner_14,
    i.keltner_upper_20,
    i.keltner_middle_20,
    i.keltner_lower_20,
    i.keltner_upper_50,
    i.keltner_middle_50,
    i.keltner_lower_50,
    i.typical_price,
    i.stoch_k_14,
    i.stoch_d_14,
    i.williams_r_14,
    i.mfi_14,
    i.obv,
    i.roc_10,
    i.roc_20,
    i.proc_10,
    i.proc_20,
    i.vroc_10,
    i.vroc_20,
    i.parabolic_sar,
    i.ichimoku_tenkan,
    i.ichimoku_kijun,
    i.ichimoku_senkou_span_a,
    i.ichimoku_senkou_span_b,
    i.ichimoku_chikou_span,
    i.fib_0_236,
    i.fib_0_382,
    i.fib_0_500,
    i.fib_0_618,
    i.fib_0_786,
    i.support_level_1,
    i.support_level_2,
    i.resistance_level_1,
    i.resistance_level_2,
    i.volatility_20,
    i.volatility_50,
    i.momentum_10,
    i.momentum_20,
    i.price_position_bb,
    i.price_trend_20,
    i.ema_cross_rsi_filter,
    i.ema_ribbon_rsi,
    i.adx_atr_trend,
    i.macd_rsi_combo,
    i.macd_adx_combo,
    i.rsi_atr_breakout,
    i.bb_rsi_reversal,
    i.bb_macd_trend_breakout,
    i.squeeze_bb_keltner,
    i.macd_hist_vol_delta,
    i.cmf_rsi_combo,
    i.darvas_box_volume,
    i.canslim_technical,
    i.triple_screen_system,
    i.weighted_multi_factor,
    i.week_52_high,
    i.week_52_low,
    i.adjusted_close,
    i.timeframe,
    i.created_at,
    i.updated_at,
    h.open,
    h.high,
    h.low,
    h.close,
    h.volume
   FROM kite_instrument_indicators i
     JOIN kite_ohlcv_historic h ON i.instrument_token::text = h.instrument_token::text AND i.exchange::text = h.exchange::text AND i.date = h.date AND i.candle_interval::text = h.candle_interval::text;

COMMENT ON VIEW public.kite_instrument_indicator_prices IS 'Joins kite_instrument_indicators with kite_ohlcv_historic to expose price data alongside indicators.';


-- public.nse_eq_indicators_52week_continuous source

CREATE OR REPLACE VIEW public.nse_eq_indicators_52week_continuous
AS SELECT day,
    symbol,
    week_52_high,
    week_52_low,
    close,
    open
   FROM _timescaledb_internal._materialized_hypertable_16;


-- public.nse_eq_indicators_52week_view source

CREATE OR REPLACE VIEW public.nse_eq_indicators_52week_view
AS SELECT symbol,
    day AS date,
    close,
    max(week_52_high) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 251 PRECEDING AND CURRENT ROW) AS week_52_high,
    min(week_52_low) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 251 PRECEDING AND CURRENT ROW) AS week_52_low
   FROM nse_eq_indicators_52week_continuous;


-- public.nse_eq_indicators_sma_continuous source

CREATE OR REPLACE VIEW public.nse_eq_indicators_sma_continuous
AS SELECT day,
    symbol,
    open,
    high,
    low,
    close,
    volume,
    avg_close,
    avg_volume,
    data_points
   FROM _timescaledb_internal._materialized_hypertable_15;


-- public.nse_eq_indicators_sma_view source

CREATE OR REPLACE VIEW public.nse_eq_indicators_sma_view
AS SELECT symbol,
    day AS date,
    close,
    volume,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 4 PRECEDING AND CURRENT ROW) AS sma_5,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 9 PRECEDING AND CURRENT ROW) AS sma_10,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) AS sma_14,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) AS sma_20,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS sma_30,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 49 PRECEDING AND CURRENT ROW) AS sma_50,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 99 PRECEDING AND CURRENT ROW) AS sma_100,
    avg(close) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 199 PRECEDING AND CURRENT ROW) AS sma_200,
    avg(volume) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 9 PRECEDING AND CURRENT ROW) AS volume_sma_10,
    avg(volume) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) AS volume_sma_20,
    avg(volume) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS volume_sma_30,
    avg(volume) OVER (PARTITION BY symbol ORDER BY day ROWS BETWEEN 49 PRECEDING AND CURRENT ROW) AS volume_sma_50
   FROM nse_eq_indicators_sma_continuous;


-- public.nse_eq_indicators_timescale_view source

CREATE OR REPLACE VIEW public.nse_eq_indicators_timescale_view
AS WITH base_data AS (
         SELECT nse_eq_ohlcv_historic.symbol,
            nse_eq_ohlcv_historic.date,
            nse_eq_ohlcv_historic.open,
            nse_eq_ohlcv_historic.high,
            nse_eq_ohlcv_historic.low,
            nse_eq_ohlcv_historic.close,
            nse_eq_ohlcv_historic.volume,
            nse_eq_ohlcv_historic.timeframe
           FROM nse_eq_ohlcv_historic
          WHERE nse_eq_ohlcv_historic.timeframe = '1day'::text
        ), windowed_calcs AS (
         SELECT base_data.symbol,
            base_data.date,
            base_data.open,
            base_data.high,
            base_data.low,
            base_data.close,
            base_data.volume,
            avg(base_data.close) OVER w5 AS sma_5,
            avg(base_data.close) OVER w10 AS sma_10,
            avg(base_data.close) OVER w14 AS sma_14,
            avg(base_data.close) OVER w20 AS sma_20,
            avg(base_data.close) OVER w30 AS sma_30,
            avg(base_data.close) OVER w50 AS sma_50,
            avg(base_data.close) OVER w100 AS sma_100,
            avg(base_data.close) OVER w200 AS sma_200,
            avg(base_data.volume) OVER w10 AS volume_sma_10,
            avg(base_data.volume) OVER w20 AS volume_sma_20,
            avg(base_data.volume) OVER w30 AS volume_sma_30,
            avg(base_data.volume) OVER w50 AS volume_sma_50,
            max(base_data.high) OVER w252 AS week_52_high,
            min(base_data.low) OVER w252 AS week_52_low,
            sum(base_data.close * base_data.volume::double precision) OVER w20 / NULLIF(sum(base_data.volume) OVER w20, 0::numeric)::double precision AS vwap,
            avg(base_data.close) OVER w20 + 2::double precision * stddev(base_data.close) OVER w20 AS bb_upper_20,
            avg(base_data.close) OVER w20 AS bb_middle_20,
            avg(base_data.close) OVER w20 - 2::double precision * stddev(base_data.close) OVER w20 AS bb_lower_20,
            avg(base_data.close) OVER w50 + 2::double precision * stddev(base_data.close) OVER w50 AS bb_upper_50,
            avg(base_data.close) OVER w50 AS bb_middle_50,
            avg(base_data.close) OVER w50 - 2::double precision * stddev(base_data.close) OVER w50 AS bb_lower_50,
            stddev(base_data.close) OVER w20 AS volatility_20,
            stddev(base_data.close) OVER w50 AS volatility_50,
            base_data.close - lag(base_data.close, 10) OVER w_symbol AS momentum_10,
            base_data.close - lag(base_data.close, 20) OVER w_symbol AS momentum_20,
            (base_data.close - lag(base_data.close, 10) OVER w_symbol) / NULLIF(lag(base_data.close, 10) OVER w_symbol, 0::double precision) * 100::double precision AS roc_10,
            (base_data.close - lag(base_data.close, 20) OVER w_symbol) / NULLIF(lag(base_data.close, 20) OVER w_symbol, 0::double precision) * 100::double precision AS roc_20,
            (base_data.volume - lag(base_data.volume, 10) OVER w_symbol) / NULLIF(lag(base_data.volume, 10) OVER w_symbol, 0::numeric) * 100::numeric AS vroc_10,
            (base_data.volume - lag(base_data.volume, 20) OVER w_symbol) / NULLIF(lag(base_data.volume, 20) OVER w_symbol, 0::numeric) * 100::numeric AS vroc_20,
            (base_data.close - (avg(base_data.close) OVER w20 - 2::double precision * stddev(base_data.close) OVER w20)) / NULLIF(avg(base_data.close) OVER w20 + 2::double precision * stddev(base_data.close) OVER w20 - (avg(base_data.close) OVER w20 - 2::double precision * stddev(base_data.close) OVER w20), 0::double precision) AS bb_percent_b_20,
            (base_data.close - (avg(base_data.close) OVER w50 - 2::double precision * stddev(base_data.close) OVER w50)) / NULLIF(avg(base_data.close) OVER w50 + 2::double precision * stddev(base_data.close) OVER w50 - (avg(base_data.close) OVER w50 - 2::double precision * stddev(base_data.close) OVER w50), 0::double precision) AS bb_percent_b_50,
            base_data.volume / NULLIF(avg(base_data.volume) OVER w20, 0::numeric) AS volume_ratio,
            (base_data.close - lag(base_data.close, 20) OVER w_symbol) / NULLIF(lag(base_data.close, 20) OVER w_symbol, 0::double precision) AS price_trend_20,
            GREATEST(base_data.high - base_data.low, abs(base_data.high - lag(base_data.close, 1) OVER w_symbol), abs(base_data.low - lag(base_data.close, 1) OVER w_symbol)) AS true_range,
            (base_data.high + base_data.low + base_data.close) / 3.0::double precision AS typical_price,
                CASE
                    WHEN (base_data.high - base_data.low) = 0::double precision THEN 0::double precision
                    ELSE (base_data.close - base_data.low - (base_data.high - base_data.close)) / (base_data.high - base_data.low)
                END AS mf_multiplier,
            GREATEST(base_data.high - lag(base_data.high, 1) OVER w_symbol, 0::double precision) AS dm_plus,
            GREATEST(lag(base_data.low, 1) OVER w_symbol - base_data.low, 0::double precision) AS dm_minus,
            min(base_data.low) OVER w20 AS support_level_1,
            min(base_data.low) OVER w50 AS support_level_2,
            max(base_data.high) OVER w20 AS resistance_level_1,
            max(base_data.high) OVER w50 AS resistance_level_2,
            min(base_data.low) OVER w252 + (max(base_data.high) OVER w252 - min(base_data.low) OVER w252) * 0.236::double precision AS fib_0_236,
            min(base_data.low) OVER w252 + (max(base_data.high) OVER w252 - min(base_data.low) OVER w252) * 0.382::double precision AS fib_0_382,
            min(base_data.low) OVER w252 + (max(base_data.high) OVER w252 - min(base_data.low) OVER w252) * 0.500::double precision AS fib_0_500,
            min(base_data.low) OVER w252 + (max(base_data.high) OVER w252 - min(base_data.low) OVER w252) * 0.618::double precision AS fib_0_618,
            min(base_data.low) OVER w252 + (max(base_data.high) OVER w252 - min(base_data.low) OVER w252) * 0.786::double precision AS fib_0_786,
            (max(base_data.high) OVER w9 + min(base_data.low) OVER w9) / 2.0::double precision AS ichimoku_tenkan,
            (max(base_data.high) OVER w26 + min(base_data.low) OVER w26) / 2.0::double precision AS ichimoku_kijun,
            ((max(base_data.high) OVER w9 + min(base_data.low) OVER w9) / 2.0::double precision + (max(base_data.high) OVER w26 + min(base_data.low) OVER w26) / 2.0::double precision) / 2.0::double precision AS ichimoku_senkou_span_a,
            (max(base_data.high) OVER w52 + min(base_data.low) OVER w52) / 2.0::double precision AS ichimoku_senkou_span_b,
            lag(base_data.close, 26) OVER w_symbol AS ichimoku_chikou_span
           FROM base_data
          WINDOW w_symbol AS (PARTITION BY base_data.symbol ORDER BY base_data.date), w5 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 4 PRECEDING AND CURRENT ROW), w9 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 8 PRECEDING AND CURRENT ROW), w10 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 9 PRECEDING AND CURRENT ROW), w14 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW), w20 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW), w26 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 25 PRECEDING AND CURRENT ROW), w30 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), w50 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 49 PRECEDING AND CURRENT ROW), w52 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 51 PRECEDING AND CURRENT ROW), w100 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 99 PRECEDING AND CURRENT ROW), w200 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 199 PRECEDING AND CURRENT ROW), w252 AS (PARTITION BY base_data.symbol ORDER BY base_data.date ROWS BETWEEN 251 PRECEDING AND CURRENT ROW)
        ), atr_calcs AS (
         SELECT windowed_calcs.symbol,
            windowed_calcs.date,
            windowed_calcs.open,
            windowed_calcs.high,
            windowed_calcs.low,
            windowed_calcs.close,
            windowed_calcs.volume,
            windowed_calcs.sma_5,
            windowed_calcs.sma_10,
            windowed_calcs.sma_14,
            windowed_calcs.sma_20,
            windowed_calcs.sma_30,
            windowed_calcs.sma_50,
            windowed_calcs.sma_100,
            windowed_calcs.sma_200,
            windowed_calcs.volume_sma_10,
            windowed_calcs.volume_sma_20,
            windowed_calcs.volume_sma_30,
            windowed_calcs.volume_sma_50,
            windowed_calcs.week_52_high,
            windowed_calcs.week_52_low,
            windowed_calcs.vwap,
            windowed_calcs.bb_upper_20,
            windowed_calcs.bb_middle_20,
            windowed_calcs.bb_lower_20,
            windowed_calcs.bb_upper_50,
            windowed_calcs.bb_middle_50,
            windowed_calcs.bb_lower_50,
            windowed_calcs.volatility_20,
            windowed_calcs.volatility_50,
            windowed_calcs.momentum_10,
            windowed_calcs.momentum_20,
            windowed_calcs.roc_10,
            windowed_calcs.roc_20,
            windowed_calcs.vroc_10,
            windowed_calcs.vroc_20,
            windowed_calcs.bb_percent_b_20,
            windowed_calcs.bb_percent_b_50,
            windowed_calcs.volume_ratio,
            windowed_calcs.price_trend_20,
            windowed_calcs.true_range,
            windowed_calcs.typical_price,
            windowed_calcs.mf_multiplier,
            windowed_calcs.dm_plus,
            windowed_calcs.dm_minus,
            windowed_calcs.support_level_1,
            windowed_calcs.support_level_2,
            windowed_calcs.resistance_level_1,
            windowed_calcs.resistance_level_2,
            windowed_calcs.fib_0_236,
            windowed_calcs.fib_0_382,
            windowed_calcs.fib_0_500,
            windowed_calcs.fib_0_618,
            windowed_calcs.fib_0_786,
            windowed_calcs.ichimoku_tenkan,
            windowed_calcs.ichimoku_kijun,
            windowed_calcs.ichimoku_senkou_span_a,
            windowed_calcs.ichimoku_senkou_span_b,
            windowed_calcs.ichimoku_chikou_span,
            avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) AS atr_14,
            avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 20 PRECEDING AND CURRENT ROW) AS atr_21,
            avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 49 PRECEDING AND CURRENT ROW) AS atr_50,
            windowed_calcs.bb_upper_20 - windowed_calcs.bb_lower_20 AS bb_width_20,
            windowed_calcs.bb_upper_50 - windowed_calcs.bb_lower_50 AS bb_width_50,
            windowed_calcs.sma_20 + 2::double precision * avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) AS keltner_upper_20,
            windowed_calcs.sma_20 AS keltner_middle_20,
            windowed_calcs.sma_20 - 2::double precision * avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) AS keltner_lower_20,
            (windowed_calcs.typical_price - avg(windowed_calcs.typical_price) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW)) / NULLIF(stddev(windowed_calcs.typical_price) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 19 PRECEDING AND CURRENT ROW) * 0.015::double precision, 0::double precision) AS cci_20,
            windowed_calcs.mf_multiplier * windowed_calcs.volume::double precision AS mf_volume,
            avg(windowed_calcs.dm_plus) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) / NULLIF(avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW), 0::double precision) * 100::double precision AS di_plus_14,
            avg(windowed_calcs.dm_minus) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) / NULLIF(avg(windowed_calcs.true_range) OVER (PARTITION BY windowed_calcs.symbol ORDER BY windowed_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW), 0::double precision) * 100::double precision AS di_minus_14
           FROM windowed_calcs
        ), final_calcs AS (
         SELECT atr_calcs.symbol,
            atr_calcs.date,
            atr_calcs.open,
            atr_calcs.high,
            atr_calcs.low,
            atr_calcs.close,
            atr_calcs.volume,
            atr_calcs.sma_5,
            atr_calcs.sma_10,
            atr_calcs.sma_14,
            atr_calcs.sma_20,
            atr_calcs.sma_30,
            atr_calcs.sma_50,
            atr_calcs.sma_100,
            atr_calcs.sma_200,
            atr_calcs.volume_sma_10,
            atr_calcs.volume_sma_20,
            atr_calcs.volume_sma_30,
            atr_calcs.volume_sma_50,
            atr_calcs.week_52_high,
            atr_calcs.week_52_low,
            atr_calcs.vwap,
            atr_calcs.bb_upper_20,
            atr_calcs.bb_middle_20,
            atr_calcs.bb_lower_20,
            atr_calcs.bb_upper_50,
            atr_calcs.bb_middle_50,
            atr_calcs.bb_lower_50,
            atr_calcs.volatility_20,
            atr_calcs.volatility_50,
            atr_calcs.momentum_10,
            atr_calcs.momentum_20,
            atr_calcs.roc_10,
            atr_calcs.roc_20,
            atr_calcs.vroc_10,
            atr_calcs.vroc_20,
            atr_calcs.bb_percent_b_20,
            atr_calcs.bb_percent_b_50,
            atr_calcs.volume_ratio,
            atr_calcs.price_trend_20,
            atr_calcs.true_range,
            atr_calcs.typical_price,
            atr_calcs.mf_multiplier,
            atr_calcs.dm_plus,
            atr_calcs.dm_minus,
            atr_calcs.support_level_1,
            atr_calcs.support_level_2,
            atr_calcs.resistance_level_1,
            atr_calcs.resistance_level_2,
            atr_calcs.fib_0_236,
            atr_calcs.fib_0_382,
            atr_calcs.fib_0_500,
            atr_calcs.fib_0_618,
            atr_calcs.fib_0_786,
            atr_calcs.ichimoku_tenkan,
            atr_calcs.ichimoku_kijun,
            atr_calcs.ichimoku_senkou_span_a,
            atr_calcs.ichimoku_senkou_span_b,
            atr_calcs.ichimoku_chikou_span,
            atr_calcs.atr_14,
            atr_calcs.atr_21,
            atr_calcs.atr_50,
            atr_calcs.bb_width_20,
            atr_calcs.bb_width_50,
            atr_calcs.keltner_upper_20,
            atr_calcs.keltner_middle_20,
            atr_calcs.keltner_lower_20,
            atr_calcs.cci_20,
            atr_calcs.mf_volume,
            atr_calcs.di_plus_14,
            atr_calcs.di_minus_14,
            abs(atr_calcs.di_plus_14 - atr_calcs.di_minus_14) / NULLIF(atr_calcs.di_plus_14 + atr_calcs.di_minus_14, 0::double precision) * 100::double precision AS adx_14,
            sum(atr_calcs.mf_volume) OVER (PARTITION BY atr_calcs.symbol ORDER BY atr_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW) / NULLIF(sum(atr_calcs.volume) OVER (PARTITION BY atr_calcs.symbol ORDER BY atr_calcs.date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW), 0::numeric)::double precision AS cmf_14,
            (atr_calcs.bb_upper_20 - atr_calcs.bb_lower_20 - lag(atr_calcs.bb_upper_20 - atr_calcs.bb_lower_20, 10) OVER (PARTITION BY atr_calcs.symbol ORDER BY atr_calcs.date)) / NULLIF(lag(atr_calcs.bb_upper_20 - atr_calcs.bb_lower_20, 10) OVER (PARTITION BY atr_calcs.symbol ORDER BY atr_calcs.date), 0::double precision) * 100::double precision AS chaikin_vol_14
           FROM atr_calcs
        )
 SELECT symbol,
    date,
    close,
    volume,
    open,
    high,
    low,
    sma_5,
    sma_10,
    sma_14,
    sma_20,
    sma_30,
    sma_50,
    sma_100,
    sma_200,
    volume_sma_10,
    volume_sma_20,
    volume_sma_30,
    volume_sma_50,
    vwap,
    volume_ratio,
    volatility_20,
    volatility_50,
    atr_14,
    atr_21,
    atr_50,
    bb_upper_20,
    bb_middle_20,
    bb_lower_20,
    bb_width_20,
    bb_percent_b_20,
    bb_upper_50,
    bb_middle_50,
    bb_lower_50,
    bb_width_50,
    bb_percent_b_50,
    keltner_upper_20,
    keltner_middle_20,
    keltner_lower_20,
    momentum_10,
    momentum_20,
    roc_10,
    roc_20,
    vroc_10,
    vroc_20,
    price_trend_20,
    week_52_high,
    week_52_low,
    support_level_1,
    support_level_2,
    resistance_level_1,
    resistance_level_2,
    fib_0_236,
    fib_0_382,
    fib_0_500,
    fib_0_618,
    fib_0_786,
    ichimoku_tenkan,
    ichimoku_kijun,
    ichimoku_senkou_span_a,
    ichimoku_senkou_span_b,
    ichimoku_chikou_span,
    di_plus_14,
    di_minus_14,
    adx_14,
    cci_20,
    cmf_14,
    chaikin_vol_14,
    true_range,
    typical_price,
    mf_multiplier,
    mf_volume,
    dm_plus,
    dm_minus
   FROM final_calcs;


-- public.nse_eq_indicators_volume_continuous source

CREATE OR REPLACE VIEW public.nse_eq_indicators_volume_continuous
AS SELECT day,
    symbol,
    total_volume,
    avg_volume,
    max_volume,
    min_volume,
    vwap,
    close
   FROM _timescaledb_internal._materialized_hypertable_17;


-- public.nse_eq_indicators_volume_view source

CREATE OR REPLACE VIEW public.nse_eq_indicators_volume_view
AS SELECT symbol,
    day AS date,
    close,
    total_volume AS volume,
    sum(close * total_volume::double precision) OVER w20 / NULLIF(sum(total_volume) OVER w20, 0::numeric)::double precision AS vwap_20,
    avg(total_volume) OVER w10 AS volume_ema_10,
    avg(total_volume) OVER w20 AS volume_ema_20,
    avg(total_volume) OVER w30 AS volume_ema_30,
    avg(total_volume) OVER w50 AS volume_ema_50
   FROM nse_eq_indicators_volume_continuous
  WINDOW w10 AS (PARTITION BY symbol ORDER BY day ROWS BETWEEN 9 PRECEDING AND CURRENT ROW), w20 AS (PARTITION BY symbol ORDER BY day ROWS BETWEEN 19 PRECEDING AND CURRENT ROW), w30 AS (PARTITION BY symbol ORDER BY day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW), w50 AS (PARTITION BY symbol ORDER BY day ROWS BETWEEN 49 PRECEDING AND CURRENT ROW);


-- public.portfolio_holdings_summary source

CREATE OR REPLACE VIEW public.portfolio_holdings_summary
AS WITH latest_stock_metrics AS (
         SELECT portfolio_stock_metrics_daily.portfolio_id,
            portfolio_stock_metrics_daily.symbol,
            portfolio_stock_metrics_daily.date,
            portfolio_stock_metrics_daily.equity,
            portfolio_stock_metrics_daily.cash,
            portfolio_stock_metrics_daily.position_value,
            portfolio_stock_metrics_daily.accumulated_shares,
            portfolio_stock_metrics_daily.accumulated_shares_value,
            row_number() OVER (PARTITION BY portfolio_stock_metrics_daily.portfolio_id, portfolio_stock_metrics_daily.symbol ORDER BY portfolio_stock_metrics_daily.date DESC) AS rn
           FROM portfolio_stock_metrics_daily
        ), trade_stats AS (
         SELECT portfolio_trades.portfolio_id,
            portfolio_trades.symbol,
            count(*) AS total_trades,
            sum(
                CASE
                    WHEN portfolio_trades.profit > 0::numeric THEN 1
                    ELSE 0
                END) AS winning_trades,
            sum(
                CASE
                    WHEN portfolio_trades.profit <= 0::numeric THEN 1
                    ELSE 0
                END) AS losing_trades,
            sum(portfolio_trades.quantity) AS total_quantity_traded,
            sum(portfolio_trades.principal) AS total_principal_deployed,
            sum(portfolio_trades.profit) AS realized_profit,
            sum(portfolio_trades.kept_shares) AS total_kept_shares,
            sum(portfolio_trades.kept_cash) AS total_kept_cash
           FROM portfolio_trades
          GROUP BY portfolio_trades.portfolio_id, portfolio_trades.symbol
        ), open_pos AS (
         SELECT open_positions.portfolio_id,
            open_positions.symbol,
            open_positions.entry_date,
            open_positions.entry_price,
            open_positions.quantity,
            open_positions.principal,
            open_positions.take_profit,
            open_positions.stop_loss
           FROM open_positions
        ), symbol_union AS (
         SELECT open_positions.portfolio_id,
            open_positions.symbol
           FROM open_positions
        UNION
         SELECT portfolio_trades.portfolio_id,
            portfolio_trades.symbol
           FROM portfolio_trades
        UNION
         SELECT portfolio_stock_metrics_daily.portfolio_id,
            portfolio_stock_metrics_daily.symbol
           FROM portfolio_stock_metrics_daily
        )
 SELECT su.portfolio_id,
    su.symbol,
    op.entry_date,
    op.entry_price,
    op.quantity AS open_quantity,
    op.principal AS open_principal,
    op.take_profit,
    op.stop_loss,
    COALESCE(ls.accumulated_shares, 0::numeric) AS accumulated_shares,
    COALESCE(ls.accumulated_shares_value, 0::numeric) AS accumulated_shares_value,
    COALESCE(ls.position_value, 0::numeric) AS last_position_value,
    COALESCE(ls.cash, 0::numeric) AS last_allocated_cash,
    COALESCE(ls.equity, 0::numeric) AS last_equity,
    COALESCE(ts.realized_profit, 0::numeric) AS realized_profit,
    COALESCE(ts.total_trades, 0::bigint) AS total_trades,
    COALESCE(ts.winning_trades, 0::bigint) AS winning_trades,
    COALESCE(ts.losing_trades, 0::bigint) AS losing_trades,
    COALESCE(ts.total_kept_shares, 0::numeric) AS total_kept_shares,
    COALESCE(ts.total_kept_cash, 0::numeric) AS total_kept_cash,
    COALESCE(ts.total_principal_deployed, 0::numeric) AS total_principal_deployed
   FROM symbol_union su
     LEFT JOIN open_pos op ON op.portfolio_id = su.portfolio_id AND op.symbol = su.symbol
     LEFT JOIN latest_stock_metrics ls ON ls.portfolio_id = su.portfolio_id AND ls.symbol = su.symbol AND ls.rn = 1
     LEFT JOIN trade_stats ts ON ts.portfolio_id = su.portfolio_id AND ts.symbol = su.symbol;

COMMENT ON VIEW public.portfolio_holdings_summary IS 'Combines open positions, latest stock metrics, and realized trade stats to summarize holdings per symbol.';


-- public.v_screener_last_results source

CREATE OR REPLACE VIEW public.v_screener_last_results
AS SELECT l.screener_id,
    r.symbol,
    r.matched,
    r.score_0_1,
    r.rank_in_run,
    r.metrics_json,
    r.reason_json
   FROM v_screener_last_run l
     JOIN screener_result r ON r.screener_run_id = l.screener_run_id
  ORDER BY l.screener_id, r.rank_in_run, r.score_0_1 DESC NULLS LAST;


-- public.v_screener_last_run source

CREATE OR REPLACE VIEW public.v_screener_last_run
AS SELECT DISTINCT ON (screener_id) screener_id,
    screener_run_id,
    run_for_trading_day,
    started_at,
    finished_at,
    total_candidates,
    total_matches
   FROM screener_run sr
  WHERE status = 'success'::text
  ORDER BY screener_id, run_for_trading_day DESC, started_at DESC;



-- DROP PROCEDURE public.add_columnstore_policy(regclass, any, bool, interval, timestamptz, text, interval);

CREATE OR REPLACE PROCEDURE public.add_columnstore_policy(IN hypertable regclass, IN after "any" DEFAULT NULL::unknown, IN if_not_exists boolean DEFAULT false, IN schedule_interval interval DEFAULT NULL::interval, IN initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, IN timezone text DEFAULT NULL::text, IN created_before interval DEFAULT NULL::interval)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_policy_compression_add$procedure$
;

-- DROP FUNCTION public.add_compression_policy(regclass, any, bool, interval, timestamptz, text, interval);

CREATE OR REPLACE FUNCTION public.add_compression_policy(hypertable regclass, compress_after "any" DEFAULT NULL::unknown, if_not_exists boolean DEFAULT false, schedule_interval interval DEFAULT NULL::interval, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, timezone text DEFAULT NULL::text, compress_created_before interval DEFAULT NULL::interval)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_compression_add$function$
;

-- DROP FUNCTION public.add_continuous_aggregate_policy(regclass, any, any, interval, bool, timestamptz, text, bool, int4, int4, bool);

CREATE OR REPLACE FUNCTION public.add_continuous_aggregate_policy(continuous_aggregate regclass, start_offset "any", end_offset "any", schedule_interval interval, if_not_exists boolean DEFAULT false, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, timezone text DEFAULT NULL::text, include_tiered_data boolean DEFAULT NULL::boolean, buckets_per_batch integer DEFAULT NULL::integer, max_batches_per_execution integer DEFAULT NULL::integer, refresh_newest_first boolean DEFAULT NULL::boolean)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_refresh_cagg_add$function$
;

-- DROP FUNCTION public.add_dimension(regclass, name, int4, anyelement, regproc, bool);

CREATE OR REPLACE FUNCTION public.add_dimension(hypertable regclass, column_name name, number_partitions integer DEFAULT NULL::integer, chunk_time_interval anyelement DEFAULT NULL::bigint, partitioning_func regproc DEFAULT NULL::regproc, if_not_exists boolean DEFAULT false)
 RETURNS TABLE(dimension_id integer, schema_name name, table_name name, column_name name, created boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_dimension_add$function$
;

-- DROP FUNCTION public.add_dimension(regclass, _timescaledb_internal.dimension_info, bool);

CREATE OR REPLACE FUNCTION public.add_dimension(hypertable regclass, dimension _timescaledb_internal.dimension_info, if_not_exists boolean DEFAULT false)
 RETURNS TABLE(dimension_id integer, created boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_dimension_add_general$function$
;

-- DROP FUNCTION public.add_job(regproc, interval, jsonb, timestamptz, bool, regproc, bool, text, text);

CREATE OR REPLACE FUNCTION public.add_job(proc regproc, schedule_interval interval, config jsonb DEFAULT NULL::jsonb, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, scheduled boolean DEFAULT true, check_config regproc DEFAULT NULL::regproc, fixed_schedule boolean DEFAULT true, timezone text DEFAULT NULL::text, job_name text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_job_add$function$
;

-- DROP PROCEDURE public.add_process_hypertable_invalidations_policy(regclass, interval, bool, timestamptz, text);

CREATE OR REPLACE PROCEDURE public.add_process_hypertable_invalidations_policy(IN hypertable regclass, IN schedule_interval interval, IN if_not_exists boolean DEFAULT false, IN initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, IN timezone text DEFAULT NULL::text)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_policy_process_hyper_inval_add$procedure$
;

-- DROP FUNCTION public.add_reorder_policy(regclass, name, bool, timestamptz, text);

CREATE OR REPLACE FUNCTION public.add_reorder_policy(hypertable regclass, index_name name, if_not_exists boolean DEFAULT false, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, timezone text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_reorder_add$function$
;

-- DROP FUNCTION public.add_retention_policy(regclass, any, bool, interval, timestamptz, text, interval);

CREATE OR REPLACE FUNCTION public.add_retention_policy(relation regclass, drop_after "any" DEFAULT NULL::unknown, if_not_exists boolean DEFAULT false, schedule_interval interval DEFAULT NULL::interval, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, timezone text DEFAULT NULL::text, drop_created_before interval DEFAULT NULL::interval)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_retention_add$function$
;

-- DROP FUNCTION public.alter_job(int4, interval, interval, int4, interval, bool, jsonb, timestamptz, bool, regproc, bool, timestamptz, text, text);

CREATE OR REPLACE FUNCTION public.alter_job(job_id integer, schedule_interval interval DEFAULT NULL::interval, max_runtime interval DEFAULT NULL::interval, max_retries integer DEFAULT NULL::integer, retry_period interval DEFAULT NULL::interval, scheduled boolean DEFAULT NULL::boolean, config jsonb DEFAULT NULL::jsonb, next_start timestamp with time zone DEFAULT NULL::timestamp with time zone, if_exists boolean DEFAULT false, check_config regproc DEFAULT NULL::regproc, fixed_schedule boolean DEFAULT NULL::boolean, initial_start timestamp with time zone DEFAULT NULL::timestamp with time zone, timezone text DEFAULT NULL::text, job_name text DEFAULT NULL::text)
 RETURNS TABLE(job_id integer, schedule_interval interval, max_runtime interval, max_retries integer, retry_period interval, scheduled boolean, config jsonb, next_start timestamp with time zone, check_config text, fixed_schedule boolean, initial_start timestamp with time zone, timezone text, application_name name)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_job_alter$function$
;

-- DROP FUNCTION public.approximate_row_count(regclass);

CREATE OR REPLACE FUNCTION public.approximate_row_count(relation regclass)
 RETURNS bigint
 LANGUAGE plpgsql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
    v_mat_ht REGCLASS = NULL;
    v_name NAME = NULL;
    v_schema NAME = NULL;
    v_hypertable_id INTEGER;
BEGIN
    -- Check if input relation is continuous aggregate view then
    -- get the corresponding materialized hypertable and schema name
    SELECT format('%I.%I', ht.schema_name, ht.table_name)::regclass INTO v_mat_ht
      FROM pg_class c
      JOIN pg_namespace n ON (n.OID = c.relnamespace)
      JOIN _timescaledb_catalog.continuous_agg a ON (a.user_view_schema = n.nspname AND a.user_view_name = c.relname)
      JOIN _timescaledb_catalog.hypertable ht ON (a.mat_hypertable_id = ht.id)
      WHERE c.OID = relation;

    IF FOUND THEN
        relation = v_mat_ht;
    END IF;

    SELECT nspname, relname FROM pg_class c
    INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
    INTO v_schema, v_name
    WHERE c.OID = relation;

    -- for hypertables return the sum of the row counts of all chunks
    SELECT id FROM _timescaledb_catalog.hypertable INTO v_hypertable_id WHERE table_name = v_name AND schema_name = v_schema;
    IF FOUND THEN
        RETURN (SELECT coalesce(sum(_timescaledb_functions.get_approx_row_count(format('%I.%I',schema_name,table_name))),0)
          FROM _timescaledb_catalog.chunk
          WHERE hypertable_id = v_hypertable_id AND NOT dropped);
    END IF;

		IF EXISTS (SELECT FROM pg_inherits WHERE inhparent = relation) THEN
		RETURN (
        SELECT _timescaledb_functions.get_approx_row_count(relation) + COALESCE(SUM(public.approximate_row_count(i.inhrelid)),0) FROM pg_inherits i
        WHERE i.inhparent = relation
     );
    END IF;

    -- Check for input relation is Plain RELATION
    RETURN _timescaledb_functions.get_approx_row_count(relation);
END;
$function$
;

-- DROP PROCEDURE public.attach_chunk(regclass, regclass, jsonb);

CREATE OR REPLACE PROCEDURE public.attach_chunk(IN hypertable regclass, IN chunk regclass, IN slices jsonb)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_attach_chunk$procedure$
;

-- DROP FUNCTION public.attach_tablespace(name, regclass, bool);

CREATE OR REPLACE FUNCTION public.attach_tablespace(tablespace name, hypertable regclass, if_not_attached boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_tablespace_attach$function$
;

-- DROP FUNCTION public.by_hash(name, int4, regproc);

CREATE OR REPLACE FUNCTION public.by_hash(column_name name, number_partitions integer, partition_func regproc DEFAULT NULL::regproc)
 RETURNS _timescaledb_internal.dimension_info
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_hash_dimension$function$
;

-- DROP FUNCTION public.by_range(name, anyelement, regproc);

CREATE OR REPLACE FUNCTION public.by_range(column_name name, partition_interval anyelement DEFAULT NULL::bigint, partition_func regproc DEFAULT NULL::regproc)
 RETURNS _timescaledb_internal.dimension_info
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_range_dimension$function$
;

-- DROP PROCEDURE public.cagg_migrate(regclass, bool, bool);

CREATE OR REPLACE PROCEDURE public.cagg_migrate(IN cagg regclass, IN override boolean DEFAULT false, IN drop_old boolean DEFAULT false)
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    _cagg_schema TEXT;
    _cagg_name TEXT;
    _cagg_name_new TEXT;
    _cagg_data _timescaledb_catalog.continuous_agg;
BEGIN
    -- procedures with SET clause cannot execute transaction
    -- control so we adjust search_path in procedure body
    SET LOCAL search_path TO pg_catalog, pg_temp;

    SELECT nspname, relname
    INTO _cagg_schema, _cagg_name
    FROM pg_catalog.pg_class
    JOIN pg_catalog.pg_namespace ON pg_namespace.oid OPERATOR(pg_catalog.=) pg_class.relnamespace
    WHERE pg_class.oid OPERATOR(pg_catalog.=) cagg::pg_catalog.oid;

    -- maximum size of an identifier in Postgres is 63 characters, se we need to left space for '_new'
    _cagg_name_new := pg_catalog.format('%s_new', pg_catalog.substr(_cagg_name, 1, 59));

    -- pre-validate the migration and get some variables
    _cagg_data := _timescaledb_functions.cagg_migrate_pre_validation(_cagg_schema, _cagg_name, _cagg_name_new);

    -- create new migration plan
    CALL _timescaledb_functions.cagg_migrate_create_plan(_cagg_data, _cagg_name_new, override, drop_old);
    COMMIT;

    -- SET LOCAL is only active until end of transaction.
    -- While we could use SET at the start of the function we do not
    -- want to bleed out search_path to caller, so we do SET LOCAL
    -- again after COMMIT
    SET LOCAL search_path TO pg_catalog, pg_temp;

    -- execute the migration plan
    CALL _timescaledb_functions.cagg_migrate_execute_plan(_cagg_data);

    -- Remove chunk metadata when marked as dropped
    PERFORM _timescaledb_functions.remove_dropped_chunk_metadata(_cagg_data.raw_hypertable_id);

    -- finish the migration plan
    UPDATE _timescaledb_catalog.continuous_agg_migrate_plan
    SET end_ts = pg_catalog.clock_timestamp()
    WHERE mat_hypertable_id OPERATOR(pg_catalog.=) _cagg_data.mat_hypertable_id;
END;
$procedure$
;

-- DROP FUNCTION public.calculate_drawdown_metrics(uuid);

CREATE OR REPLACE FUNCTION public.calculate_drawdown_metrics(p_run_id uuid)
 RETURNS TABLE(max_drawdown_pct numeric, max_drawdown_value numeric, avg_drawdown_pct numeric, current_drawdown_pct numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        MIN(drawdown_pct) AS max_drawdown_pct,
        MIN(drawdown_value) AS max_drawdown_value,
        AVG(CASE WHEN drawdown_pct < 0 THEN drawdown_pct ELSE NULL END) AS avg_drawdown_pct,
        (SELECT drawdown_pct FROM backtest_events 
         WHERE run_id = p_run_id 
         ORDER BY event_date DESC, event_id DESC 
         LIMIT 1) AS current_drawdown_pct
    FROM backtest_events
    WHERE run_id = p_run_id;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_drawdown_metrics(uuid) IS 'Calculate drawdown statistics for a backtest run';

-- DROP FUNCTION public.chunk_columnstore_stats(regclass);

CREATE OR REPLACE FUNCTION public.chunk_columnstore_stats(hypertable regclass)
 RETURNS TABLE(chunk_schema name, chunk_name name, compression_status text, before_compression_table_bytes bigint, before_compression_index_bytes bigint, before_compression_toast_bytes bigint, before_compression_total_bytes bigint, after_compression_table_bytes bigint, after_compression_index_bytes bigint, after_compression_toast_bytes bigint, after_compression_total_bytes bigint, node_name name)
 LANGUAGE sql
 STABLE STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$SELECT * FROM public.chunk_compression_stats($1)$function$
;

-- DROP FUNCTION public.chunk_compression_stats(regclass);

CREATE OR REPLACE FUNCTION public.chunk_compression_stats(hypertable regclass)
 RETURNS TABLE(chunk_schema name, chunk_name name, compression_status text, before_compression_table_bytes bigint, before_compression_index_bytes bigint, before_compression_toast_bytes bigint, before_compression_total_bytes bigint, after_compression_table_bytes bigint, after_compression_index_bytes bigint, after_compression_toast_bytes bigint, after_compression_total_bytes bigint, node_name name)
 LANGUAGE plpgsql
 STABLE STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
    table_name name;
    schema_name name;
BEGIN
    SELECT
      relname, nspname
    INTO
	    table_name, schema_name
    FROM
        pg_class c
        INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
        INNER JOIN _timescaledb_catalog.hypertable ht ON (ht.schema_name = n.nspname
                AND ht.table_name = c.relname)
    WHERE
        c.OID = hypertable;

    IF table_name IS NULL THEN
	    RETURN;
	END IF;

  RETURN QUERY
  SELECT
      *,
      NULL::name
  FROM
      _timescaledb_functions.compressed_chunk_local_stats(schema_name, table_name);
END;
$function$
;

-- DROP FUNCTION public.chunks_detailed_size(regclass);

CREATE OR REPLACE FUNCTION public.chunks_detailed_size(hypertable regclass)
 RETURNS TABLE(chunk_schema name, chunk_name name, table_bytes bigint, index_bytes bigint, toast_bytes bigint, total_bytes bigint, node_name name)
 LANGUAGE plpgsql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
        table_name       NAME;
        schema_name      NAME;
BEGIN
        SELECT relname, nspname
        INTO table_name, schema_name
        FROM pg_class c
        INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
        INNER JOIN _timescaledb_catalog.hypertable ht ON (ht.schema_name = n.nspname AND ht.table_name = c.relname)
        WHERE c.OID = hypertable;

        IF table_name IS NULL THEN
            SELECT h.schema_name, h.table_name
            INTO schema_name, table_name
            FROM pg_class c
            INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
            INNER JOIN _timescaledb_catalog.continuous_agg a ON (a.user_view_schema = n.nspname AND a.user_view_name = c.relname)
            INNER JOIN _timescaledb_catalog.hypertable h ON h.id = a.mat_hypertable_id
            WHERE c.OID = hypertable;

            IF table_name IS NULL THEN
                RETURN;
            END IF;
		END IF;

    RETURN QUERY SELECT chl.chunk_schema, chl.chunk_name, chl.table_bytes, chl.index_bytes,
                        chl.toast_bytes, chl.total_bytes, NULL::NAME
            FROM _timescaledb_functions.chunks_local_size(schema_name, table_name) chl;
END;
$function$
;

-- DROP FUNCTION public.compress_chunk(regclass, bool, bool);

CREATE OR REPLACE FUNCTION public.compress_chunk(uncompressed_chunk regclass, if_not_compressed boolean DEFAULT true, recompress boolean DEFAULT false)
 RETURNS regclass
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_compress_chunk$function$
;

-- DROP PROCEDURE public.convert_to_columnstore(regclass, bool, bool);

CREATE OR REPLACE PROCEDURE public.convert_to_columnstore(IN chunk regclass, IN if_not_columnstore boolean DEFAULT true, IN recompress boolean DEFAULT false)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_compress_chunk$procedure$
;

-- DROP PROCEDURE public.convert_to_rowstore(regclass, bool);

CREATE OR REPLACE PROCEDURE public.convert_to_rowstore(IN chunk regclass, IN if_columnstore boolean DEFAULT true)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_decompress_chunk$procedure$
;

-- DROP FUNCTION public.create_hypertable(regclass, _timescaledb_internal.dimension_info, bool, bool, bool);

CREATE OR REPLACE FUNCTION public.create_hypertable(relation regclass, dimension _timescaledb_internal.dimension_info, create_default_indexes boolean DEFAULT true, if_not_exists boolean DEFAULT false, migrate_data boolean DEFAULT false)
 RETURNS TABLE(hypertable_id integer, created boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_hypertable_create_general$function$
;

-- DROP FUNCTION public.create_hypertable(regclass, name, name, int4, name, name, anyelement, bool, bool, regproc, bool, text, regproc, regproc);

CREATE OR REPLACE FUNCTION public.create_hypertable(relation regclass, time_column_name name, partitioning_column name DEFAULT NULL::name, number_partitions integer DEFAULT NULL::integer, associated_schema_name name DEFAULT NULL::name, associated_table_prefix name DEFAULT NULL::name, chunk_time_interval anyelement DEFAULT NULL::bigint, create_default_indexes boolean DEFAULT true, if_not_exists boolean DEFAULT false, partitioning_func regproc DEFAULT NULL::regproc, migrate_data boolean DEFAULT false, chunk_target_size text DEFAULT NULL::text, chunk_sizing_func regproc DEFAULT '_timescaledb_functions.calculate_chunk_interval'::regproc, time_partitioning_func regproc DEFAULT NULL::regproc)
 RETURNS TABLE(hypertable_id integer, schema_name name, table_name name, created boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_hypertable_create$function$
;

-- DROP FUNCTION public.decompress_chunk(regclass, bool);

CREATE OR REPLACE FUNCTION public.decompress_chunk(uncompressed_chunk regclass, if_compressed boolean DEFAULT true)
 RETURNS regclass
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_decompress_chunk$function$
;

-- DROP FUNCTION public.delete_job(int4);

CREATE OR REPLACE FUNCTION public.delete_job(job_id integer)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_job_delete$function$
;

-- DROP PROCEDURE public.detach_chunk(regclass);

CREATE OR REPLACE PROCEDURE public.detach_chunk(IN chunk regclass)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_detach_chunk$procedure$
;

-- DROP FUNCTION public.detach_tablespace(name, regclass, bool);

CREATE OR REPLACE FUNCTION public.detach_tablespace(tablespace name, hypertable regclass DEFAULT NULL::regclass, if_attached boolean DEFAULT false)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_tablespace_detach$function$
;

-- DROP FUNCTION public.detach_tablespaces(regclass);

CREATE OR REPLACE FUNCTION public.detach_tablespaces(hypertable regclass)
 RETURNS integer
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_tablespace_detach_all_from_hypertable$function$
;

-- DROP FUNCTION public.disable_chunk_skipping(regclass, name, bool);

CREATE OR REPLACE FUNCTION public.disable_chunk_skipping(hypertable regclass, column_name name, if_not_exists boolean DEFAULT false)
 RETURNS TABLE(hypertable_id integer, column_name name, disabled boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_chunk_column_stats_disable$function$
;

-- DROP FUNCTION public.drop_chunks(regclass, any, any, bool, any, any);

CREATE OR REPLACE FUNCTION public.drop_chunks(relation regclass, older_than "any" DEFAULT NULL::unknown, newer_than "any" DEFAULT NULL::unknown, "verbose" boolean DEFAULT false, created_before "any" DEFAULT NULL::unknown, created_after "any" DEFAULT NULL::unknown)
 RETURNS SETOF text
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_chunk_drop_chunks$function$
;

-- DROP FUNCTION public.enable_chunk_skipping(regclass, name, bool);

CREATE OR REPLACE FUNCTION public.enable_chunk_skipping(hypertable regclass, column_name name, if_not_exists boolean DEFAULT false)
 RETURNS TABLE(column_stats_id integer, enabled boolean)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_chunk_column_stats_enable$function$
;

-- DROP AGGREGATE public."first"(anyelement, any);

CREATE OR REPLACE AGGREGATE public.first(pg_catalog.anyelement,pg_catalog."any") (
	SFUNC = _timescaledb_functions.first_sfunc,
	STYPE = internal,
	FINALFUNC = _timescaledb_functions.bookend_finalfunc,
	FINALFUNC_EXTRA,
	FINALFUNC_MODIFY = READ_ONLY,
	SERIALFUNC = _timescaledb_functions.bookend_serializefunc,
	DESERIALFUNC = _timescaledb_functions.bookend_deserializefunc
);

-- DROP FUNCTION public.generate_uuidv7();

CREATE OR REPLACE FUNCTION public.generate_uuidv7()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_uuid_generate_v7$function$
;

-- DROP FUNCTION public.get_telemetry_report();

CREATE OR REPLACE FUNCTION public.get_telemetry_report()
 RETURNS jsonb
 LANGUAGE c
 STABLE PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_telemetry_get_report_jsonb$function$
;

-- DROP FUNCTION public.get_trade_statistics(uuid);

CREATE OR REPLACE FUNCTION public.get_trade_statistics(p_run_id uuid)
 RETURNS TABLE(total_trades bigint, winning_trades bigint, losing_trades bigint, avg_profit numeric, avg_win numeric, avg_loss numeric, largest_win numeric, largest_loss numeric, avg_holding_days numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_trades,
        COUNT(*) FILTER (WHERE profit > 0) AS winning_trades,
        COUNT(*) FILTER (WHERE profit < 0) AS losing_trades,
        AVG(profit) AS avg_profit,
        AVG(profit) FILTER (WHERE profit > 0) AS avg_win,
        AVG(profit) FILTER (WHERE profit < 0) AS avg_loss,
        MAX(profit) AS largest_win,
        MIN(profit) AS largest_loss,
        AVG(holding_days) AS avg_holding_days
    FROM backtest_events
    WHERE run_id = p_run_id AND event_type = 'EXIT';
END;
$function$
;

COMMENT ON FUNCTION public.get_trade_statistics(uuid) IS 'Calculate trade statistics for a backtest run';

-- DROP AGGREGATE public.histogram(float8, float8, float8, int4);

CREATE OR REPLACE AGGREGATE public.histogram(double precision,double precision,double precision,integer) (
	SFUNC = _timescaledb_functions.hist_sfunc,
	STYPE = internal,
	FINALFUNC = _timescaledb_functions.hist_finalfunc,
	FINALFUNC_EXTRA,
	FINALFUNC_MODIFY = READ_ONLY,
	SERIALFUNC = _timescaledb_functions.hist_serializefunc,
	DESERIALFUNC = _timescaledb_functions.hist_deserializefunc
);

-- DROP FUNCTION public.hypertable_approximate_detailed_size(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_approximate_detailed_size(relation regclass)
 RETURNS TABLE(table_bytes bigint, index_bytes bigint, toast_bytes bigint, total_bytes bigint)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_hypertable_approximate_size$function$
;

-- DROP FUNCTION public.hypertable_approximate_size(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_approximate_size(hypertable regclass)
 RETURNS bigint
 LANGUAGE sql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
   SELECT sum(total_bytes)::bigint
   FROM public.hypertable_approximate_detailed_size(hypertable);
$function$
;

-- DROP FUNCTION public.hypertable_columnstore_stats(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_columnstore_stats(hypertable regclass)
 RETURNS TABLE(total_chunks bigint, number_compressed_chunks bigint, before_compression_table_bytes bigint, before_compression_index_bytes bigint, before_compression_toast_bytes bigint, before_compression_total_bytes bigint, after_compression_table_bytes bigint, after_compression_index_bytes bigint, after_compression_toast_bytes bigint, after_compression_total_bytes bigint, node_name name)
 LANGUAGE sql
 STABLE STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$SELECT * FROM public.hypertable_compression_stats($1)$function$
;

-- DROP FUNCTION public.hypertable_compression_stats(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_compression_stats(hypertable regclass)
 RETURNS TABLE(total_chunks bigint, number_compressed_chunks bigint, before_compression_table_bytes bigint, before_compression_index_bytes bigint, before_compression_toast_bytes bigint, before_compression_total_bytes bigint, after_compression_table_bytes bigint, after_compression_index_bytes bigint, after_compression_toast_bytes bigint, after_compression_total_bytes bigint, node_name name)
 LANGUAGE sql
 STABLE STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
	SELECT
        count(*)::bigint AS total_chunks,
        (count(*) FILTER (WHERE ch.compression_status = 'Compressed'))::bigint AS number_compressed_chunks,
        sum(ch.before_compression_table_bytes)::bigint AS before_compression_table_bytes,
        sum(ch.before_compression_index_bytes)::bigint AS before_compression_index_bytes,
        sum(ch.before_compression_toast_bytes)::bigint AS before_compression_toast_bytes,
        sum(ch.before_compression_total_bytes)::bigint AS before_compression_total_bytes,
        sum(ch.after_compression_table_bytes)::bigint AS after_compression_table_bytes,
        sum(ch.after_compression_index_bytes)::bigint AS after_compression_index_bytes,
        sum(ch.after_compression_toast_bytes)::bigint AS after_compression_toast_bytes,
        sum(ch.after_compression_total_bytes)::bigint AS after_compression_total_bytes,
        ch.node_name
    FROM
	    public.chunk_compression_stats(hypertable) ch
    GROUP BY
        ch.node_name;
$function$
;

-- DROP FUNCTION public.hypertable_detailed_size(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_detailed_size(hypertable regclass)
 RETURNS TABLE(table_bytes bigint, index_bytes bigint, toast_bytes bigint, total_bytes bigint, node_name name)
 LANGUAGE plpgsql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
        table_name       NAME = NULL;
        schema_name      NAME = NULL;
BEGIN
        SELECT relname, nspname
        INTO table_name, schema_name
        FROM pg_class c
        INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
        INNER JOIN _timescaledb_catalog.hypertable ht ON (ht.schema_name = n.nspname AND ht.table_name = c.relname)
        WHERE c.OID = hypertable;

        IF table_name IS NULL THEN
                SELECT h.schema_name, h.table_name
                INTO schema_name, table_name
                FROM pg_class c
                INNER JOIN pg_namespace n ON (n.OID = c.relnamespace)
                INNER JOIN _timescaledb_catalog.continuous_agg a ON (a.user_view_schema = n.nspname AND a.user_view_name = c.relname)
                INNER JOIN _timescaledb_catalog.hypertable h ON h.id = a.mat_hypertable_id
                WHERE c.OID = hypertable;

	        IF table_name IS NULL THEN
                        RETURN;
                END IF;
        END IF;

			RETURN QUERY
			SELECT *, NULL::name
			FROM _timescaledb_functions.hypertable_local_size(schema_name, table_name);
END;
$function$
;

-- DROP FUNCTION public.hypertable_index_size(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_index_size(index_name regclass)
 RETURNS bigint
 LANGUAGE sql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
  SELECT
  	pg_relation_size(ht_i.indexrelid) + COALESCE(sum(pg_relation_size(ch_i.indexrelid)), 0)
  FROM pg_index ht_i
  LEFT JOIN pg_inherits ch on ch.inhparent = ht_i.indrelid
  LEFT JOIN pg_index ch_i on ch_i.indrelid = ch.inhrelid and _timescaledb_functions.index_matches(ht_i.indexrelid, ch_i.indexrelid)
  WHERE ht_i.indexrelid = index_name
  GROUP BY ht_i.indexrelid;
$function$
;

-- DROP FUNCTION public.hypertable_size(regclass);

CREATE OR REPLACE FUNCTION public.hypertable_size(hypertable regclass)
 RETURNS bigint
 LANGUAGE sql
 STRICT
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
   SELECT total_bytes::bigint FROM public.hypertable_detailed_size(hypertable);
$function$
;

-- DROP FUNCTION public.interpolate(int4, record, record);

CREATE OR REPLACE FUNCTION public.interpolate(value integer, prev record DEFAULT NULL::record, next record DEFAULT NULL::record)
 RETURNS integer
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP FUNCTION public.interpolate(int8, record, record);

CREATE OR REPLACE FUNCTION public.interpolate(value bigint, prev record DEFAULT NULL::record, next record DEFAULT NULL::record)
 RETURNS bigint
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP FUNCTION public.interpolate(int2, record, record);

CREATE OR REPLACE FUNCTION public.interpolate(value smallint, prev record DEFAULT NULL::record, next record DEFAULT NULL::record)
 RETURNS smallint
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP FUNCTION public.interpolate(float4, record, record);

CREATE OR REPLACE FUNCTION public.interpolate(value real, prev record DEFAULT NULL::record, next record DEFAULT NULL::record)
 RETURNS real
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP FUNCTION public.interpolate(float8, record, record);

CREATE OR REPLACE FUNCTION public.interpolate(value double precision, prev record DEFAULT NULL::record, next record DEFAULT NULL::record)
 RETURNS double precision
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP AGGREGATE public."last"(anyelement, any);

CREATE OR REPLACE AGGREGATE public.last(pg_catalog.anyelement,pg_catalog."any") (
	SFUNC = _timescaledb_functions.last_sfunc,
	STYPE = internal,
	FINALFUNC = _timescaledb_functions.bookend_finalfunc,
	FINALFUNC_EXTRA,
	FINALFUNC_MODIFY = READ_ONLY,
	SERIALFUNC = _timescaledb_functions.bookend_serializefunc,
	DESERIALFUNC = _timescaledb_functions.bookend_deserializefunc
);

-- DROP FUNCTION public.locf(anyelement, anyelement, bool);

CREATE OR REPLACE FUNCTION public.locf(value anyelement, prev anyelement DEFAULT NULL::unknown, treat_null_as_missing boolean DEFAULT false)
 RETURNS anyelement
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_marker$function$
;

-- DROP PROCEDURE public.merge_chunks(_regclass);

CREATE OR REPLACE PROCEDURE public.merge_chunks(IN chunks regclass[])
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_merge_chunks$procedure$
;

-- DROP PROCEDURE public.merge_chunks(regclass, regclass);

CREATE OR REPLACE PROCEDURE public.merge_chunks(IN chunk1 regclass, IN chunk2 regclass)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_merge_two_chunks$procedure$
;

-- DROP FUNCTION public.move_chunk(regclass, name, name, regclass, bool);

CREATE OR REPLACE FUNCTION public.move_chunk(chunk regclass, destination_tablespace name, index_destination_tablespace name DEFAULT NULL::name, reorder_index regclass DEFAULT NULL::regclass, "verbose" boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_move_chunk$function$
;

-- DROP PROCEDURE public.recompress_chunk(regclass, bool);

CREATE OR REPLACE PROCEDURE public.recompress_chunk(IN chunk regclass, IN if_not_compressed boolean DEFAULT true)
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $procedure$
BEGIN
  IF current_setting('timescaledb.enable_deprecation_warnings', true)::bool THEN
    RAISE WARNING 'procedure public.recompress_chunk(regclass,boolean) is deprecated and the functionality is now included in public.compress_chunk. this compatibility function will be removed in a future version.';
  END IF;
  PERFORM public.compress_chunk(chunk, if_not_compressed);
END$procedure$
;

-- DROP PROCEDURE public.refresh_continuous_aggregate(regclass, any, any, bool, jsonb);

CREATE OR REPLACE PROCEDURE public.refresh_continuous_aggregate(IN continuous_aggregate regclass, IN window_start "any", IN window_end "any", IN force boolean DEFAULT false, IN options jsonb DEFAULT NULL::jsonb)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_continuous_agg_refresh$procedure$
;

-- DROP PROCEDURE public.remove_columnstore_policy(regclass, bool);

CREATE OR REPLACE PROCEDURE public.remove_columnstore_policy(IN hypertable regclass, IN if_exists boolean DEFAULT false)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_policy_compression_remove$procedure$
;

-- DROP FUNCTION public.remove_compression_policy(regclass, bool);

CREATE OR REPLACE FUNCTION public.remove_compression_policy(hypertable regclass, if_exists boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_compression_remove$function$
;

-- DROP FUNCTION public.remove_continuous_aggregate_policy(regclass, bool, bool);

CREATE OR REPLACE FUNCTION public.remove_continuous_aggregate_policy(continuous_aggregate regclass, if_not_exists boolean DEFAULT false, if_exists boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_refresh_cagg_remove$function$
;

-- DROP PROCEDURE public.remove_process_hypertable_invalidations_policy(regclass, bool);

CREATE OR REPLACE PROCEDURE public.remove_process_hypertable_invalidations_policy(IN hypertable regclass, IN if_exists boolean DEFAULT false)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_policy_process_hyper_inval_remove$procedure$
;

-- DROP FUNCTION public.remove_reorder_policy(regclass, bool);

CREATE OR REPLACE FUNCTION public.remove_reorder_policy(hypertable regclass, if_exists boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_reorder_remove$function$
;

-- DROP FUNCTION public.remove_retention_policy(regclass, bool);

CREATE OR REPLACE FUNCTION public.remove_retention_policy(relation regclass, if_exists boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_policy_retention_remove$function$
;

-- DROP FUNCTION public.reorder_chunk(regclass, regclass, bool);

CREATE OR REPLACE FUNCTION public.reorder_chunk(chunk regclass, index regclass DEFAULT NULL::regclass, "verbose" boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_reorder_chunk$function$
;

-- DROP PROCEDURE public.run_job(int4);

CREATE OR REPLACE PROCEDURE public.run_job(IN job_id integer)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_job_run$procedure$
;

-- DROP FUNCTION public.set_adaptive_chunking(in regclass, in text, inout regproc, out int8);

CREATE OR REPLACE FUNCTION public.set_adaptive_chunking(hypertable regclass, chunk_target_size text, INOUT chunk_sizing_func regproc DEFAULT '_timescaledb_functions.calculate_chunk_interval'::regproc, OUT chunk_target_size bigint)
 RETURNS record
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_chunk_adaptive_set$function$
;

-- DROP FUNCTION public.set_chunk_time_interval(regclass, anyelement, name);

CREATE OR REPLACE FUNCTION public.set_chunk_time_interval(hypertable regclass, chunk_time_interval anyelement, dimension_name name DEFAULT NULL::name)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_dimension_set_interval$function$
;

-- DROP FUNCTION public.set_integer_now_func(regclass, regproc, bool);

CREATE OR REPLACE FUNCTION public.set_integer_now_func(hypertable regclass, integer_now_func regproc, replace_if_exists boolean DEFAULT false)
 RETURNS void
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_hypertable_set_integer_now_func$function$
;

-- DROP FUNCTION public.set_number_partitions(regclass, int4, name);

CREATE OR REPLACE FUNCTION public.set_number_partitions(hypertable regclass, number_partitions integer, dimension_name name DEFAULT NULL::name)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_dimension_set_num_slices$function$
;

-- DROP FUNCTION public.set_partitioning_interval(regclass, anyelement, name);

CREATE OR REPLACE FUNCTION public.set_partitioning_interval(hypertable regclass, partition_interval anyelement, dimension_name name DEFAULT NULL::name)
 RETURNS void
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $function$ts_dimension_set_interval$function$
;

-- DROP FUNCTION public.show_chunks(regclass, any, any, any, any);

CREATE OR REPLACE FUNCTION public.show_chunks(relation regclass, older_than "any" DEFAULT NULL::unknown, newer_than "any" DEFAULT NULL::unknown, created_before "any" DEFAULT NULL::unknown, created_after "any" DEFAULT NULL::unknown)
 RETURNS SETOF regclass
 LANGUAGE c
 STABLE PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_chunk_show_chunks$function$
;

-- DROP FUNCTION public.show_tablespaces(regclass);

CREATE OR REPLACE FUNCTION public.show_tablespaces(hypertable regclass)
 RETURNS SETOF name
 LANGUAGE c
 STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_tablespace_show$function$
;

-- DROP PROCEDURE public.split_chunk(regclass, any);

CREATE OR REPLACE PROCEDURE public.split_chunk(IN chunk regclass, IN split_at "any" DEFAULT NULL::unknown)
 LANGUAGE c
AS '$libdir/timescaledb-2.23.0', $procedure$ts_split_chunk$procedure$
;

-- DROP FUNCTION public.time_bucket(int2, int2, int2);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width smallint, ts smallint, "offset" smallint)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int16_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamp, timestamp);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp without time zone, origin timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamp_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamp, interval);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp without time zone, "offset" interval)
 RETURNS timestamp without time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamp_offset_bucket$function$
;

-- DROP FUNCTION public.time_bucket(int8, int8, int8);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width bigint, ts bigint, "offset" bigint)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int64_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamp);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamp_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, date, interval);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts date, "offset" interval)
 RETURNS date
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_date_offset_bucket$function$
;

-- DROP FUNCTION public.time_bucket(int4, int4, int4);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width integer, ts integer, "offset" integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int32_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamptz);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_bucket$function$
;

-- DROP FUNCTION public.time_bucket(int8, int8);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width bigint, ts bigint)
 RETURNS bigint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int64_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp with time zone, origin timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamptz, text, timestamptz, interval);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp with time zone, timezone text, origin timestamp with time zone DEFAULT NULL::timestamp with time zone, "offset" interval DEFAULT NULL::interval)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_timezone_bucket$function$
;

-- DROP FUNCTION public.time_bucket(int2, int2);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width smallint, ts smallint)
 RETURNS smallint
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int16_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, date, date);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts date, origin date)
 RETURNS date
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_date_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, timestamptz, interval);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts timestamp with time zone, "offset" interval)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_offset_bucket$function$
;

-- DROP FUNCTION public.time_bucket(interval, date);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width interval, ts date)
 RETURNS date
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_date_bucket$function$
;

-- DROP FUNCTION public.time_bucket(int4, int4);

CREATE OR REPLACE FUNCTION public.time_bucket(bucket_width integer, ts integer)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_int32_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(interval, date, date, date);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width interval, ts date, start date DEFAULT NULL::date, finish date DEFAULT NULL::date)
 RETURNS date
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_date_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(interval, timestamp, timestamp, timestamp);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width interval, ts timestamp without time zone, start timestamp without time zone DEFAULT NULL::timestamp without time zone, finish timestamp without time zone DEFAULT NULL::timestamp without time zone)
 RETURNS timestamp without time zone
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_timestamp_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(interval, timestamptz, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width interval, ts timestamp with time zone, start timestamp with time zone DEFAULT NULL::timestamp with time zone, finish timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_timestamptz_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(int4, int4, int4, int4);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width integer, ts integer, start integer DEFAULT NULL::integer, finish integer DEFAULT NULL::integer)
 RETURNS integer
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_int32_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(interval, timestamptz, text, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width interval, ts timestamp with time zone, timezone text, start timestamp with time zone DEFAULT NULL::timestamp with time zone, finish timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_timestamptz_timezone_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(int2, int2, int2, int2);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width smallint, ts smallint, start smallint DEFAULT NULL::smallint, finish smallint DEFAULT NULL::smallint)
 RETURNS smallint
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_int16_bucket$function$
;

-- DROP FUNCTION public.time_bucket_gapfill(int8, int8, int8, int8);

CREATE OR REPLACE FUNCTION public.time_bucket_gapfill(bucket_width bigint, ts bigint, start bigint DEFAULT NULL::bigint, finish bigint DEFAULT NULL::bigint)
 RETURNS bigint
 LANGUAGE c
 PARALLEL SAFE
AS '$libdir/timescaledb-2.23.0', $function$ts_gapfill_int64_bucket$function$
;

-- DROP FUNCTION public.timescaledb_post_restore();

CREATE OR REPLACE FUNCTION public.timescaledb_post_restore()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
    db text;
    catalog_version text;
BEGIN
    SELECT m.value INTO catalog_version FROM pg_extension x
    JOIN _timescaledb_catalog.metadata m ON m.key='timescaledb_version'
    WHERE x.extname='timescaledb' AND x.extversion <> m.value;

    -- check that a loaded dump is compatible with the currently running code
    IF FOUND THEN
        RAISE EXCEPTION 'catalog version mismatch, expected "%" seen "%"', '2.23.0', catalog_version;
    END IF;

    SELECT current_database() INTO db;
    EXECUTE format($$ALTER DATABASE %I RESET timescaledb.restoring $$, db);
    -- we cannot use reset here because the reset_val might not be off
    SET timescaledb.restoring TO off;
    PERFORM _timescaledb_functions.restart_background_workers();

    RETURN true;
END
$function$
;

-- DROP FUNCTION public.timescaledb_pre_restore();

CREATE OR REPLACE FUNCTION public.timescaledb_pre_restore()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
    db text;
BEGIN
    SELECT current_database() INTO db;
    EXECUTE format($$ALTER DATABASE %I SET timescaledb.restoring ='on'$$, db);
    SET SESSION timescaledb.restoring = 'on';
    PERFORM _timescaledb_functions.stop_background_workers();
    RETURN true;
END
$function$
;

-- DROP FUNCTION public.to_uuidv7(timestamptz);

CREATE OR REPLACE FUNCTION public.to_uuidv7(ts timestamp with time zone)
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_uuid_v7_from_timestamptz$function$
;

-- DROP FUNCTION public.to_uuidv7_boundary(timestamptz);

CREATE OR REPLACE FUNCTION public.to_uuidv7_boundary(ts timestamp with time zone)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_uuid_v7_from_timestamptz_boundary$function$
;

-- DROP FUNCTION public.uuid_timestamp(uuid);

CREATE OR REPLACE FUNCTION public.uuid_timestamp(uuid uuid)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_from_uuid_v7$function$
;

-- DROP FUNCTION public.uuid_timestamp_micros(uuid);

CREATE OR REPLACE FUNCTION public.uuid_timestamp_micros(uuid uuid)
 RETURNS timestamp with time zone
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_timestamptz_from_uuid_v7_with_microseconds$function$
;

-- DROP FUNCTION public.uuid_version(uuid);

CREATE OR REPLACE FUNCTION public.uuid_version(uuid uuid)
 RETURNS integer
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/timescaledb-2.23.0', $function$ts_uuid_version$function$
;