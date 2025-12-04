export interface PortfolioDto {
  id: string;
  name: string;
  description: string;
  baseCurrency?: string;
  inceptionDate: string;
  riskProfile: string;
  isActive: boolean;
  initialCapital?: number;
  currentCash?: number;
  strategyName?: string;
  tradingMode?: string;
  dematAccount?: string;
  lastSignalCheck?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioCreateRequest {
  userId?: string; // required in backend
  name: string;
  description?: string;
  baseCurrency?: string;
  inceptionDate?: string;
  riskProfile?: string;
  isActive?: boolean;
  symbols?: string[]; // optional: symbols to seed holdings
}

export interface PortfolioUpdateRequest {
  name?: string;
  description?: string;
  baseCurrency?: string;
  inceptionDate?: string;
  riskProfile?: string;
  isActive?: boolean;
}

export interface PortfolioPatchRequest {
  name?: string;
  description?: string;
  baseCurrency?: string;
  inceptionDate?: string;
  riskProfile?: string;
  isActive?: boolean;
}

// Transaction-related DTOs
export interface TransactionCreateRequest {
  symbol: string;
  tradeDate: string;
  txnType: string;
  quantity: number;
  price: number;
  fees?: number;
  taxes?: number;
  notes?: string;
}

export interface PortfolioTransactionDto {
  id: string;
  portfolioId: string;
  symbol: string;
  tradeDate: string;
  tradeTime: string; // OffsetDateTime in backend
  txnType: string;
  quantity: number;
  price: number;
  fees?: number;
  taxes?: number;
  notes?: string;
}

// Holdings-related DTOs
export interface HoldingsCreateRequest {
  symbols: string[];
}

export interface HoldingUpdateRequest {
  quantity?: number;
  avgCost?: number;
  realizedPnl?: number;
}

export interface PortfolioHoldingDto {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  lastUpdated: string; // OffsetDateTime in backend
}

// Cash Flow DTOs
export interface PortfolioCashFlowDto {
  id: string;
  portfolioId: string;
  date: string;
  type: string;
  amount: number;
  description: string;
}

// Valuation DTOs
export interface PortfolioValuationDailyDto {
  id: string;
  portfolioId: string;
  date: string;
  totalValue: number;
  cashValue: number;
  investmentValue: number;
  totalReturn: number;
  totalReturnPct: number;
  dailyReturn: number;
  dailyReturnPct: number;
  lastUpdated: string;
}

export interface PortfolioHoldingValuationDailyDto {
  id: string;
  portfolioId: string;
  symbol: string;
  date: string;
  quantity: number;
  price: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  lastUpdated: string;
}

// Metrics DTOs
export interface PortfolioMetricsDailyDto {
  id: string;
  portfolioId: string;
  date: string;
  nav: number;
  twrDailyPct: number;
  twrCumulativePct: number;
  mwrCumulativePct: number;
  irrToDatePct: number;
  irrAnnualizedPct: number;
  xirrToDatePct: number;
  xirrAnnualizedPct: number;
  cagrPct: number;
  ytdReturnPct: number;
  return1mPct: number;
  return3mPct: number;
  return6mPct: number;
  return1yPct: number;
  return3yAnnualizedPct: number;
  return5yAnnualizedPct: number;
  drawdownPct: number;
  maxDrawdownPct: number;
  volatility30dPct: number;
  volatility90dPct: number;
  downsideDeviation30dPct: number;
  sharpe30d: number;
  sortino30d: number;
  calmar1y: number;
  treynor30d: number;
  beta30d: number;
  alpha30d: number;
  trackingError30d: number;
  informationRatio30d: number;
  var9530d: number;
  cvar9530d: number;
  upsideCapture1y: number;
  downsideCapture1y: number;
  activeReturn30dPct: number;
}

// Benchmark DTOs
export interface PortfolioBenchmarkDto {
  id: string;
  portfolioId: string;
  benchmarkSymbol: string;
  benchmarkName: string;
  correlation: number;
  trackingError: number;
  informationRatio: number;
}

// Extended Portfolio with metrics for frontend display
export interface PortfolioWithMetrics extends PortfolioDto {
  totalReturn?: number;
  benchmarkReturn?: number;
  outperformance?: number;
  stockCount?: number;
  rebalanceEvents?: number;
  lastRebalance?: string;
  performanceData?: {
    portfolio: number[];
    benchmark: number[];
    labels: string[];
  };
}

// Portfolio interface for UI with extended properties
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  isActive: boolean;
  targetAllocation?: Record<string, any>;
  initialCapital?: number;
  currentCash?: number;
  tradingMode?: 'paper' | 'live';
  strategyName?: string;
  strategyParams?: Record<string, any>;
  // Extended properties for UI
  totalReturn?: number;
  benchmarkReturn?: number;
  outperformance?: number;
  stockCount?: number;
  lastExecuted?: string;
}

// PortfolioHolding interface for UI (from portfolio_holdings_summary view)
export interface PortfolioHolding {
  portfolioId: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  lastUpdated: string;
  // Additional fields from summary
  entryDate?: string;
  openPrincipal?: number;
  takeProfit?: number;
  stopLoss?: number;
  lastPositionValue?: number;
  lastEquity?: number;
  totalTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  // Computed properties
  currentPrice?: number;
  unrealizedPnl?: number;
  unrealizedPnlPct?: number;
}

// PortfolioTrade interface for UI
export interface PortfolioTrade {
  tradeId: string;
  portfolioId: string;
  symbol: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  principal: number;
  profit: number;
  profitPct: number;
  exitType: 'TP' | 'SL';
  keptShares?: number;
  keptCash?: number;
  holdingDays: number;
  orderIdEntry?: string;
  orderIdExit?: string;
}

// PortfolioConfigForm interface for Configure tab
export interface PortfolioConfigForm {
  name: string;
  description: string;
  riskProfile: string;
  riskTolerance: string;
  rebalancingStrategy: string;
  rebalancingThreshold: number;
  automatedExecution: boolean;
  notificationSettings: boolean;
  taxHarvesting: boolean;
}

/**
 * Portfolio Configuration Interface
 * 
 * Represents the technical trading configuration for a portfolio, stored in the
 * portfolio_config table. This configuration is separate from basic portfolio
 * metadata (name, description, etc.) which is stored in the portfolio table.
 * 
 * Configuration Sections:
 * 
 * 1. Trading Configuration:
 *    - tradingMode: 'paper' or 'live' trading
 *    - signalCheckInterval: How often to check for trading signals (seconds)
 *    - lookbackDays: Historical data window for analysis
 * 
 * 2. Historical Cache Configuration:
 *    - Controls caching of historical market data
 *    - Reduces API calls and improves performance
 *    - Configurable TTL and lookback period
 * 
 * 3. Redis Configuration:
 *    - Optional Redis caching for improved performance
 *    - Connection settings and key prefix
 * 
 * 4. Entry Conditions:
 *    - Technical indicators for trade entry signals
 *    - Bollinger Bands, RSI, MACD, Volume
 *    - Fallback indicators (SMA, ATR)
 * 
 * 5. Exit Conditions:
 *    - Take profit and stop loss settings
 *    - ATR-based stop loss multiplier
 *    - Option to allow only take-profit exits
 * 
 * Default Values:
 * When no configuration exists, the system uses these defaults:
 * - tradingMode: 'paper'
 * - signalCheckInterval: 300 (5 minutes)
 * - lookbackDays: 30
 * - historicalCacheEnabled: false
 * - redisEnabled: false
 * - entryRsiThreshold: 30
 * - exitTakeProfitPct: 5.0
 * - exitStopLossAtrMult: 2.0
 * 
 * @see {@link PortfolioConfigApiService} for API operations
 * @see {@link PortfolioConfigureComponent} for the UI component
 * @see {@link PortfolioConfigCreateRequest} for creation payload
 * @see {@link PortfolioConfigUpdateRequest} for update payload
 */
export interface PortfolioConfig {
  /** The portfolio this configuration belongs to */
  portfolioId: string;
  
  // Trading Configuration
  /** Trading mode: 'paper' for simulation, 'live' for real trading */
  tradingMode: string;
  
  /** How often to check for trading signals, in seconds (e.g., 300 = 5 minutes) */
  signalCheckInterval: number;
  
  /** Number of days of historical data to analyze for signals */
  lookbackDays: number;
  
  // Historical Cache Configuration
  /** Whether to cache historical market data */
  historicalCacheEnabled: boolean;
  
  /** Number of days of historical data to cache */
  historicalCacheLookbackDays: number;
  
  /** Exchange for historical data (e.g., 'NSE', 'BSE') */
  historicalCacheExchange: string;
  
  /** Instrument type for historical data (e.g., 'EQ', 'FUT', 'OPT') */
  historicalCacheInstrumentType: string;
  
  /** Candle interval for historical data (e.g., 'minute', 'day', 'week') */
  historicalCacheCandleInterval: string;
  
  /** Time-to-live for cached historical data, in seconds */
  historicalCacheTtlSeconds: number;
  
  // Redis Configuration
  /** Whether to use Redis for caching */
  redisEnabled: boolean;
  
  /** Redis server hostname or IP address */
  redisHost: string;
  
  /** Redis server port (typically 6379) */
  redisPort: number;
  
  /** Redis authentication password (optional) */
  redisPassword?: string;
  
  /** Redis database number (0-15) */
  redisDb: number;
  
  /** Prefix for Redis keys to avoid collisions */
  redisKeyPrefix: string;
  
  // Additional Trading Settings
  /** Whether to enable detailed conditional logging for debugging */
  enableConditionalLogging: boolean;
  
  /** Duration to cache trading data, in seconds */
  cacheDurationSeconds: number;
  
  /** Primary exchange for trading (e.g., 'NSE', 'BSE') */
  exchange: string;
  
  /** Candle interval for trading signals (e.g., 'minute', 'day') */
  candleInterval: string;
  
  // Entry Conditions
  /** Require price at Bollinger Band lower for entry */
  entryBbLower: boolean;
  
  /** RSI threshold for entry (0-100, typically 30 for oversold) */
  entryRsiThreshold: number;
  
  /** Require MACD turning positive for entry */
  entryMacdTurnPositive: boolean;
  
  /** Require volume above average for entry */
  entryVolumeAboveAvg: boolean;
  
  /** SMA period for fallback entry signal */
  entryFallbackSmaPeriod: number;
  
  /** ATR multiplier for fallback entry signal */
  entryFallbackAtrMultiplier: number;
  
  // Exit Conditions
  /** Take profit percentage (e.g., 5.0 = 5%) */
  exitTakeProfitPct: number;
  
  /** Stop loss as multiple of ATR (e.g., 2.0 = 2x ATR) */
  exitStopLossAtrMult: number;
  
  /** Whether to allow only take-profit exits (ignore stop loss) */
  exitAllowTpExitsOnly: boolean;
  
  // Custom JSON
  /** Custom configuration data as JSON object (optional) */
  customJson?: Record<string, any>;
  
  // Timestamps
  /** When this configuration was created (ISO 8601 format) */
  createdAt: string;
  
  /** When this configuration was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Portfolio Configuration Create Request
 * 
 * Payload for creating a new portfolio configuration via POST /api/portfolio/{id}/config
 * 
 * Required Fields:
 * - tradingMode: Must be 'paper' or 'live'
 * - signalCheckInterval: Must be positive integer
 * - lookbackDays: Must be positive integer
 * 
 * Optional Fields:
 * All other fields are optional and will use backend defaults if not provided.
 * 
 * Validation:
 * - entryRsiThreshold must be 0-100
 * - redisPort must be 1-65535
 * - All numeric fields must be non-negative
 * - Redis fields (host, port) are required if redisEnabled is true
 * 
 * Note: portfolioId, createdAt, and updatedAt are not included in the request
 * as they are managed by the backend.
 * 
 * @see {@link PortfolioConfig} for the complete configuration model
 * @see {@link PortfolioConfigApiService.createConfig} for the API method
 */
export interface PortfolioConfigCreateRequest {
  tradingMode: string;
  signalCheckInterval: number;
  lookbackDays: number;
  historicalCacheEnabled?: boolean;
  historicalCacheLookbackDays?: number;
  historicalCacheExchange?: string;
  historicalCacheInstrumentType?: string;
  historicalCacheCandleInterval?: string;
  historicalCacheTtlSeconds?: number;
  redisEnabled?: boolean;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  redisDb?: number;
  redisKeyPrefix?: string;
  enableConditionalLogging?: boolean;
  cacheDurationSeconds?: number;
  exchange?: string;
  candleInterval?: string;
  entryBbLower?: boolean;
  entryRsiThreshold?: number;
  entryMacdTurnPositive?: boolean;
  entryVolumeAboveAvg?: boolean;
  entryFallbackSmaPeriod?: number;
  entryFallbackAtrMultiplier?: number;
  exitTakeProfitPct?: number;
  exitStopLossAtrMult?: number;
  exitAllowTpExitsOnly?: boolean;
  customJson?: Record<string, any>;
}

/**
 * Portfolio Configuration Update Request
 * 
 * Payload for updating an existing portfolio configuration via PUT /api/portfolio/{id}/config
 * 
 * This interface extends PortfolioConfigCreateRequest with the same structure.
 * All fields have the same validation rules as the create request.
 * 
 * @see {@link PortfolioConfigCreateRequest} for field descriptions and validation rules
 * @see {@link PortfolioConfigApiService.updateConfig} for the API method
 */
export interface PortfolioConfigUpdateRequest extends PortfolioConfigCreateRequest {}
