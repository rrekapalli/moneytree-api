/**
 * Strategy Types and Interfaces
 * 
 * This file contains all TypeScript interfaces for the Strategy feature,
 * following the patterns established in the Portfolios feature.
 * 
 * @see {@link StrategyDto} for the base strategy entity
 * @see {@link StrategyWithMetrics} for strategy with performance metrics
 * @see {@link StrategyConfig} for strategy configuration
 * @see {@link BacktestRun} for backtest execution results
 * @see {@link BacktestTrade} for individual backtest trades
 */

/**
 * Base Strategy DTO
 * 
 * Represents the core strategy entity from the strategies table.
 * This is the minimal data structure returned by the backend API.
 */
export interface StrategyDto {
  /** Unique identifier (UUID) */
  id: string;
  
  /** User who owns this strategy */
  userId: string;
  
  /** Strategy name (unique per user) */
  name: string;
  
  /** Optional description of the strategy */
  description: string;
  
  /** Risk profile: CONSERVATIVE, MODERATE, or AGGRESSIVE */
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  
  /** Whether the strategy is actively trading */
  isActive: boolean;
  
  /** When the strategy was created (ISO 8601 format) */
  createdAt: string;
  
  /** When the strategy was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Strategy with Performance Metrics
 * 
 * Extended interface that includes performance metrics for display in the UI.
 * Used in the strategy list sidebar and Overview tab.
 */
export interface StrategyWithMetrics extends StrategyDto {
  /** Total return percentage */
  totalReturn?: number;
  
  /** Compound Annual Growth Rate (CAGR) */
  cagr?: number;
  
  /** Sharpe ratio (risk-adjusted return) */
  sharpeRatio?: number;
  
  /** Maximum drawdown percentage */
  maxDrawdown?: number;
  
  /** Win rate (percentage of profitable trades) */
  winRate?: number;
  
  /** Total number of trades executed */
  totalTrades?: number;
  
  /** Date of the most recent backtest (ISO 8601 format) */
  lastBacktestDate?: string;
  
  /** Current status of the strategy */
  status?: 'Active' | 'Inactive' | 'Backtesting' | 'Error';
}

/**
 * Strategy Configuration
 * 
 * Complete configuration for a strategy, stored in the strategy_config table.
 * Defines the universe, allocations, entry/exit conditions, and risk parameters.
 */
export interface StrategyConfig {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Strategy this configuration belongs to */
  strategyId: string;
  
  /** Universe definition (which stocks to trade) */
  universeDefinition: UniverseDefinition;
  
  /** Allocation rules (position sizing) */
  allocations: AllocationRules;
  
  /** Entry conditions (buy signals) */
  entryConditions: TradingCondition[];
  
  /** Exit conditions (sell signals) */
  exitConditions: TradingCondition[];
  
  /** Risk management parameters */
  riskParameters: RiskParameters;
  
  /** When this configuration was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Universe Definition
 * 
 * Defines the set of stocks/instruments that a strategy will consider for trading.
 * Can be based on indices, sectors, or custom symbol lists.
 */
export interface UniverseDefinition {
  /** Type of universe selection */
  type: 'INDEX' | 'SECTOR' | 'CUSTOM';
  
  /** List of index names (e.g., ['NIFTY_500', 'NIFTY_MIDCAP']) */
  indices?: string[];
  
  /** List of sector names (e.g., ['Technology', 'Finance']) */
  sectors?: string[];
  
  /** List of custom symbols (e.g., ['RELIANCE', 'TCS', 'INFY']) */
  symbols?: string[];
}

/**
 * Allocation Rules
 * 
 * Defines how capital is allocated across positions in the strategy.
 * Controls position sizing and portfolio-level constraints.
 */
export interface AllocationRules {
  /** Method for determining position sizes */
  positionSizingMethod: 'EQUAL_WEIGHT' | 'RISK_PARITY' | 'CUSTOM';
  
  /** Maximum size of a single position as percentage (e.g., 10 = 10%) */
  maxPositionSize: number;
  
  /** Maximum total portfolio allocation as percentage */
  maxPortfolioAllocation: number;
  
  /** Minimum cash reserve to maintain as percentage */
  cashReserve: number;
}

/**
 * Trading Condition
 * 
 * Represents a single condition in an entry or exit rule.
 * Multiple conditions can be combined with AND/OR logic.
 */
export interface TradingCondition {
  /** Unique identifier for this condition */
  id: string;
  
  /** Type of condition */
  type: 'TECHNICAL' | 'PRICE' | 'VOLUME' | 'CUSTOM';
  
  /** Technical indicator name (e.g., 'RSI', 'MACD', 'SMA') */
  indicator?: string;
  
  /** Comparison operator */
  operator: 'GT' | 'LT' | 'EQ' | 'CROSS_ABOVE' | 'CROSS_BELOW';
  
  /** Value to compare against (can be number or string) */
  value: number | string;
  
  /** Timeframe for the condition (e.g., 'day', 'week') */
  timeframe?: string;
  
  /** Logical operator for combining with next condition */
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Risk Parameters
 * 
 * Risk management settings for the strategy.
 * Controls stop losses, take profits, and portfolio-level risk limits.
 */
export interface RiskParameters {
  /** Stop loss as percentage below entry price */
  stopLossPercent?: number;
  
  /** Take profit as percentage above entry price */
  takeProfitPercent?: number;
  
  /** Trailing stop as percentage below highest price */
  trailingStopPercent?: number;
  
  /** Maximum portfolio drawdown before halting trading */
  maxDrawdownPercent?: number;
  
  /** Maximum daily loss before halting trading */
  maxDailyLoss?: number;
}

/**
 * Backtest Run
 * 
 * Represents a single backtest execution and its summary results.
 * Stored in the backtest_runs table.
 */
export interface BacktestRun {
  /** Unique identifier for this backtest run */
  runId: string;
  
  /** Name of the strategy that was backtested */
  strategyName: string;
  
  /** Symbol that was backtested */
  symbol: string;
  
  /** Start date of the backtest period (ISO 8601 format) */
  startDate: string;
  
  /** End date of the backtest period (ISO 8601 format) */
  endDate: string;
  
  /** Initial capital at start of backtest */
  initialCapital: number;
  
  /** Final equity at end of backtest */
  finalEquity: number;
  
  /** Total return as percentage */
  totalReturnPct: number;
  
  /** Compound Annual Growth Rate */
  cagr: number;
  
  /** Sharpe ratio (risk-adjusted return) */
  sharpeRatio: number;
  
  /** Sortino ratio (downside risk-adjusted return) */
  sortinoRatio: number;
  
  /** Maximum drawdown as percentage */
  maxDrawdownPct: number;
  
  /** Win rate (percentage of profitable trades) */
  winRate: number;
  
  /** Total number of trades executed */
  totalTrades: number;
  
  /** Profit factor (gross profit / gross loss) */
  profitFactor: number;
  
  /** When this backtest was created (ISO 8601 format) */
  createdAt: string;
}

/**
 * Backtest Trade
 * 
 * Represents a single trade executed during a backtest.
 * Stored in the backtest_trades table.
 */
export interface BacktestTrade {
  /** Unique identifier for this trade */
  tradeId: string;
  
  /** Backtest run this trade belongs to */
  runId: string;
  
  /** Date the trade was executed (ISO 8601 format) */
  tradeDate: string;
  
  /** Type of trade: BUY or SELL */
  tradeType: 'BUY' | 'SELL';
  
  /** Entry price for the position */
  entryPrice: number;
  
  /** Exit price for the position */
  exitPrice: number;
  
  /** Number of shares traded */
  shares: number;
  
  /** Principal amount invested */
  principal: number;
  
  /** Profit or loss in currency */
  profit: number;
  
  /** Profit or loss as percentage */
  profitPct: number;
  
  /** Number of days the position was held */
  holdingDays: number;
}

/**
 * Strategy Create Request
 * 
 * Payload for creating a new strategy via POST /api/strategies
 */
export interface StrategyCreateRequest {
  /** User ID (required by backend) */
  userId?: string;
  
  /** Strategy name (required) */
  name: string;
  
  /** Optional description */
  description?: string;
  
  /** Risk profile (defaults to MODERATE if not provided) */
  riskProfile?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  
  /** Whether the strategy is active (defaults to false) */
  isActive?: boolean;
}

/**
 * Strategy Update Request
 * 
 * Payload for updating an existing strategy via PUT /api/strategies/{id}
 */
export interface StrategyUpdateRequest {
  /** Updated strategy name */
  name?: string;
  
  /** Updated description */
  description?: string;
  
  /** Updated risk profile */
  riskProfile?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  
  /** Updated active status */
  isActive?: boolean;
}

/**
 * Strategy Config Create Request
 * 
 * Payload for creating strategy configuration via POST /api/strategies/{id}/config
 */
export interface StrategyConfigCreateRequest {
  /** Universe definition */
  universeDefinition: UniverseDefinition;
  
  /** Allocation rules */
  allocations: AllocationRules;
  
  /** Entry conditions */
  entryConditions: TradingCondition[];
  
  /** Exit conditions */
  exitConditions: TradingCondition[];
  
  /** Risk parameters */
  riskParameters: RiskParameters;
}

/**
 * Strategy Config Update Request
 * 
 * Payload for updating strategy configuration via PUT /api/strategies/{id}/config
 */
export interface StrategyConfigUpdateRequest extends StrategyConfigCreateRequest {}

/**
 * Backtest Parameters
 * 
 * Parameters for triggering a backtest execution
 */
export interface BacktestParameters {
  /** Start date for the backtest period (ISO 8601 format) */
  startDate: string;
  
  /** End date for the backtest period (ISO 8601 format) */
  endDate: string;
  
  /** Initial capital for the backtest */
  initialCapital: number;
  
  /** Optional symbol to backtest (if not using universe) */
  symbol?: string;
}
