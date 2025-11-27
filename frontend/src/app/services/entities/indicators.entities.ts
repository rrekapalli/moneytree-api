// Technical Indicators Entities and DTOs

export interface Indicator {
  symbol: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  
  // Moving Averages
  sma5?: number;
  sma10?: number;
  sma20?: number;
  sma50?: number;
  sma100?: number;
  sma200?: number;
  ema5?: number;
  ema10?: number;
  ema20?: number;
  ema50?: number;
  wma5?: number;
  wma10?: number;
  wma20?: number;
  hma20?: number;
  tema20?: number;
  kama20?: number;
  
  // Oscillators
  rsi14?: number;
  macdLine?: number;
  macdSignal?: number;
  macdHistogram?: number;
  
  // Bollinger Bands
  bbUpper20?: number;
  bbMiddle20?: number;
  bbLower20?: number;
  
  // Volume Indicators
  obv?: number;
  adLine?: number;
  cmf21?: number;
  vpt?: number;
  volumeSma10?: number;
  volumeSma30?: number;
  volumeEma10?: number;
  volumeEma30?: number;
  
  // Volatility Indicators
  atr14?: number;
  atr20?: number;
  keltnerUpper14?: number;
  keltnerMiddle14?: number;
  keltnerLower14?: number;
  keltnerUpper20?: number;
  keltnerMiddle20?: number;
  keltnerLower20?: number;
  keltnerUpper50?: number;
  keltnerMiddle50?: number;
  keltnerLower50?: number;
  
  // Price Action
  typicalPrice?: number;
  tr?: number;
  dmPlus?: number;
  dmMinus?: number;
  
  // Composite Indicators
  darvasBoxVolume?: number;
  canslimTechnical?: number;
  tripleScreenSystem?: number;
  vamRatio?: number;
  zscoreFusion?: number;
  weightedMultiFactor?: number;
  candleRsiBb?: number;
  volumeWeightedTrendScore?: number;
}

export interface IndicatorField {
  name: string;
  value: string;
  type: 'number';
  category: 'Moving Averages' | 'Oscillators' | 'Volume' | 'Volatility' | 'Price Action' | 'Composite';
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface IndicatorQuery {
  symbol?: string;
  date?: string;
  fields?: string[];
}

export interface IndicatorResponse {
  indicators: Indicator[];
  totalCount: number;
  page: number;
  size: number;
}

// Available indicator fields for query builder
export const INDICATOR_FIELDS: IndicatorField[] = [
  // Moving Averages
  { name: 'SMA 5', value: 'sma5', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 5 periods' },
  { name: 'SMA 10', value: 'sma10', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 10 periods' },
  { name: 'SMA 20', value: 'sma20', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 20 periods' },
  { name: 'SMA 50', value: 'sma50', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 50 periods' },
  { name: 'SMA 100', value: 'sma100', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 100 periods' },
  { name: 'SMA 200', value: 'sma200', type: 'number', category: 'Moving Averages', description: 'Simple Moving Average 200 periods' },
  { name: 'EMA 5', value: 'ema5', type: 'number', category: 'Moving Averages', description: 'Exponential Moving Average 5 periods' },
  { name: 'EMA 10', value: 'ema10', type: 'number', category: 'Moving Averages', description: 'Exponential Moving Average 10 periods' },
  { name: 'EMA 20', value: 'ema20', type: 'number', category: 'Moving Averages', description: 'Exponential Moving Average 20 periods' },
  { name: 'EMA 50', value: 'ema50', type: 'number', category: 'Moving Averages', description: 'Exponential Moving Average 50 periods' },
  { name: 'WMA 5', value: 'wma5', type: 'number', category: 'Moving Averages', description: 'Weighted Moving Average 5 periods' },
  { name: 'WMA 10', value: 'wma10', type: 'number', category: 'Moving Averages', description: 'Weighted Moving Average 10 periods' },
  { name: 'WMA 20', value: 'wma20', type: 'number', category: 'Moving Averages', description: 'Weighted Moving Average 20 periods' },
  { name: 'HMA 20', value: 'hma20', type: 'number', category: 'Moving Averages', description: 'Hull Moving Average 20 periods' },
  { name: 'TEMA 20', value: 'tema20', type: 'number', category: 'Moving Averages', description: 'Triple Exponential Moving Average 20 periods' },
  { name: 'KAMA 20', value: 'kama20', type: 'number', category: 'Moving Averages', description: 'Kaufman Adaptive Moving Average 20 periods' },
  
  // Oscillators
  { name: 'RSI 14', value: 'rsi14', type: 'number', category: 'Oscillators', description: 'Relative Strength Index 14 periods', min: 0, max: 100 },
  { name: 'MACD Line', value: 'macdLine', type: 'number', category: 'Oscillators', description: 'MACD Line' },
  { name: 'MACD Signal', value: 'macdSignal', type: 'number', category: 'Oscillators', description: 'MACD Signal Line' },
  { name: 'MACD Histogram', value: 'macdHistogram', type: 'number', category: 'Oscillators', description: 'MACD Histogram' },
  
  // Bollinger Bands
  { name: 'BB Upper 20', value: 'bbUpper20', type: 'number', category: 'Volatility', description: 'Bollinger Bands Upper 20 periods' },
  { name: 'BB Middle 20', value: 'bbMiddle20', type: 'number', category: 'Volatility', description: 'Bollinger Bands Middle 20 periods' },
  { name: 'BB Lower 20', value: 'bbLower20', type: 'number', category: 'Volatility', description: 'Bollinger Bands Lower 20 periods' },
  
  // Volume Indicators
  { name: 'OBV', value: 'obv', type: 'number', category: 'Volume', description: 'On Balance Volume' },
  { name: 'AD Line', value: 'adLine', type: 'number', category: 'Volume', description: 'Accumulation/Distribution Line' },
  { name: 'CMF 21', value: 'cmf21', type: 'number', category: 'Volume', description: 'Chaikin Money Flow 21 periods', min: -1, max: 1 },
  { name: 'VPT', value: 'vpt', type: 'number', category: 'Volume', description: 'Volume Price Trend' },
  { name: 'Volume SMA 10', value: 'volumeSma10', type: 'number', category: 'Volume', description: 'Volume Simple Moving Average 10 periods' },
  { name: 'Volume SMA 30', value: 'volumeSma30', type: 'number', category: 'Volume', description: 'Volume Simple Moving Average 30 periods' },
  { name: 'Volume EMA 10', value: 'volumeEma10', type: 'number', category: 'Volume', description: 'Volume Exponential Moving Average 10 periods' },
  { name: 'Volume EMA 30', value: 'volumeEma30', type: 'number', category: 'Volume', description: 'Volume Exponential Moving Average 30 periods' },
  
  // Volatility Indicators
  { name: 'ATR 14', value: 'atr14', type: 'number', category: 'Volatility', description: 'Average True Range 14 periods' },
  { name: 'ATR 20', value: 'atr20', type: 'number', category: 'Volatility', description: 'Average True Range 20 periods' },
  { name: 'Keltner Upper 14', value: 'keltnerUpper14', type: 'number', category: 'Volatility', description: 'Keltner Channel Upper 14 periods' },
  { name: 'Keltner Middle 14', value: 'keltnerMiddle14', type: 'number', category: 'Volatility', description: 'Keltner Channel Middle 14 periods' },
  { name: 'Keltner Lower 14', value: 'keltnerLower14', type: 'number', category: 'Volatility', description: 'Keltner Channel Lower 14 periods' },
  { name: 'Keltner Upper 20', value: 'keltnerUpper20', type: 'number', category: 'Volatility', description: 'Keltner Channel Upper 20 periods' },
  { name: 'Keltner Middle 20', value: 'keltnerMiddle20', type: 'number', category: 'Volatility', description: 'Keltner Channel Middle 20 periods' },
  { name: 'Keltner Lower 20', value: 'keltnerLower20', type: 'number', category: 'Volatility', description: 'Keltner Channel Lower 20 periods' },
  { name: 'Keltner Upper 50', value: 'keltnerUpper50', type: 'number', category: 'Volatility', description: 'Keltner Channel Upper 50 periods' },
  { name: 'Keltner Middle 50', value: 'keltnerMiddle50', type: 'number', category: 'Volatility', description: 'Keltner Channel Middle 50 periods' },
  { name: 'Keltner Lower 50', value: 'keltnerLower50', type: 'number', category: 'Volatility', description: 'Keltner Channel Lower 50 periods' },
  
  // Price Action
  { name: 'Typical Price', value: 'typicalPrice', type: 'number', category: 'Price Action', description: 'Typical Price (H+L+C)/3' },
  { name: 'True Range', value: 'tr', type: 'number', category: 'Price Action', description: 'True Range' },
  { name: 'DM Plus', value: 'dmPlus', type: 'number', category: 'Price Action', description: 'Directional Movement Plus' },
  { name: 'DM Minus', value: 'dmMinus', type: 'number', category: 'Price Action', description: 'Directional Movement Minus' },
  
  // Composite Indicators
  { name: 'Darvas Box Volume', value: 'darvasBoxVolume', type: 'number', category: 'Composite', description: 'Darvas Box Volume Indicator' },
  { name: 'CANSLIM Technical', value: 'canslimTechnical', type: 'number', category: 'Composite', description: 'CANSLIM Technical Score' },
  { name: 'Triple Screen System', value: 'tripleScreenSystem', type: 'number', category: 'Composite', description: 'Triple Screen Trading System' },
  { name: 'VAM Ratio', value: 'vamRatio', type: 'number', category: 'Composite', description: 'Volume Adjusted Momentum Ratio' },
  { name: 'Z-Score Fusion', value: 'zscoreFusion', type: 'number', category: 'Composite', description: 'Z-Score Fusion Indicator' },
  { name: 'Weighted Multi Factor', value: 'weightedMultiFactor', type: 'number', category: 'Composite', description: 'Weighted Multi-Factor Score' },
  { name: 'Candle RSI BB', value: 'candleRsiBb', type: 'number', category: 'Composite', description: 'Candlestick RSI Bollinger Bands' },
  { name: 'Volume Weighted Trend Score', value: 'volumeWeightedTrendScore', type: 'number', category: 'Composite', description: 'Volume Weighted Trend Score' }
];
