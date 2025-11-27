export interface NseEqIndicatorId {
  symbol: string;
  date: string; // ISO yyyy-MM-dd
}

export interface NseEqIndicator {
  id: NseEqIndicatorId;
  createdAt?: string;
  updatedAt?: string;
  // include only commonly used subset; additional fields are optional and index signature allows others
  sma5?: number; sma10?: number; sma20?: number; sma50?: number; sma100?: number; sma200?: number;
  ema5?: number; ema10?: number; ema20?: number; ema50?: number; ema30?: number; ema200?: number;
  rsi14?: number; rsi21?: number; rsi50?: number;
  macdLine?: number; macdSignal?: number; macdHistogram?: number;
  bbUpper20?: number; bbMiddle20?: number; bbLower20?: number;
  [key: string]: any;
}
