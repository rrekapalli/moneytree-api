/**
 * Interface representing NSE Indices Tick Data
 * Updated to align with engines/common NseIndicesTickDto and remain backward compatible.
 */
export interface NseIndicesTickDto {
  timestamp: string | null;
  indices: IndexTickDataDto[] | null;
  // Market status is an object in engines payload; keep as object and allow null
  marketStatus: MarketStatusDto | null;
  source: string | null;
  ingestionTimestamp: string;
}

/**
 * Market status information (mirrors backend MarketStatusTickDto)
 */
export interface MarketStatusDto {
  status?: string;
  message?: string;
  tradeDate?: string;
  index?: string;
  last?: number;
  variation?: number;
  percentChange?: number;
  marketStatusTime?: string;
}

/**
 * Interface for individual index tick data
 * Uses engines field names and keeps legacy aliases optional for tolerance.
 */
export interface IndexTickDataDto {
  key?: string | null;
  // Engines naming
  indexName?: string;        // was `index`
  indexSymbol?: string;
  lastPrice?: number;        // was `last` or `currentPrice`
  variation?: number;        // may map from `change`
  percentChange?: number;    // may map from `perChange`
  openPrice?: number | null; // was `open`
  dayHigh?: number | null;   // was `high`
  dayLow?: number | null;    // was `low`
  previousClose?: number | null;
  yearHigh?: number | null;
  yearLow?: number | null;
  indicativeClose?: number | null;
  peRatio?: number | null;   // was `pe`
  pbRatio?: number | null;   // was `pb`
  dividendYield?: number | null; // was `dy`
  declines?: number | null;
  advances?: number | null;
  unchanged?: number | null;
  percentChange365d?: number | null; // was `perChange365d`
  date365dAgo?: string | null;
  chart365dPath?: string | null;
  date30dAgo?: string | null;
  percentChange30d?: number | null;  // was `perChange30d`
  chart30dPath?: string | null;
  chartTodayPath?: string | null;
  tickTimestamp?: string;

  // Legacy/alternate aliases to tolerate raw/older payloads
  index?: string;
  last?: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  perChange?: number | null;
  currentPrice?: number | null;
  pe?: number | null;
  pb?: number | null;
  dy?: number | null;
  perChange365d?: number | null;
  perChange30d?: number | null;
}

/**
 * Interface for NSE Indices ingestion status response
 */
export interface NseIndicesStatusResponse {
  ingestionStatus: string;
  webSocketConnected: boolean;
  connectionStats: string;
  timestamp: string;
}

/**
 * Interface for NSE Indices system info response
 */
export interface NseIndicesSystemInfo {
  serviceName: string;
  version: string;
  description: string;
  dataSource: string;
  outputDestination: string;
  supportedIndices: string[];
  ingestionStatus: string;
  webSocketConnected: boolean;
  timestamp: string;
}

/**
 * Interface for NSE Indices WebSocket health response
 */
export interface NseIndicesWebSocketHealth {
  webSocketConnected: boolean;
  connectionStats: string;
  timestamp: string;
}

/**
 * Interface for NSE Indices operation response
 */
export interface NseIndicesOperationResponse {
  status: string;
  message: string;
  timestamp: string;
  indexName?: string;
}

/**
 * Interface for NSE Indices subscription response
 */
export interface NseIndicesSubscriptionResponse extends NseIndicesOperationResponse {
  indexName: string;
}

/**
 * Raw single-index NSE tick as received from Kafka/NSE-like producers
 */
export interface NseIndicesTickDtoRaw {
  indexName: string;
  brdCstIndexName: string;
  currentPrice: number;
  perChange: number;
  change: number;
  previousClose: number;
  recievedTime: string | null;
  dessiminationTime: string | null;
  open: number | null;
  low: number | null;
  high: number | null;
  indStatus: string | null;
  indValue: number | null;
  indChange: number | null;
  indPerChange: number | null;
  indRecievedTime: string | null;
  mktStatus: string | null;
}
