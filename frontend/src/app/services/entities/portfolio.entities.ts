export interface PortfolioDto {
  id: string;
  name: string;
  description: string;
  baseCurrency?: string;
  inceptionDate: string;
  riskProfile: string;
  isActive: boolean;
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
