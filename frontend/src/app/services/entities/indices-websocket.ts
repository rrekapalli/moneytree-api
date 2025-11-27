/**
 * TypeScript interfaces for NSE Indices WebSocket data.
 * Based on the backend IndicesDto structure.
 */

/**
 * Individual index data received from WebSocket
 */
export interface IndexDataDto {
  key?: string;
  indexName?: string;
  indexSymbol?: string;
  lastPrice?: number;
  variation?: number;
  percentChange?: number;
  openPrice?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  yearHigh?: number;
  yearLow?: number;
  indicativeClose?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  declines?: number;
  advances?: number;
  unchanged?: number;
  percentChange365d?: number;
  date365dAgo?: string;
  chart365dPath?: string;
  date30dAgo?: string;
  percentChange30d?: number;
  chart30dPath?: string;
  chartTodayPath?: string;
  
  // Actual WebSocket field names from backend
  index?: string;
  last?: number;
  open?: number;
  high?: number;
  low?: number;
  perChange?: number;
  change?: number;
  
  // Additional fields from actual WebSocket response
  ingestionTimestamp?: string;
  tickTimestamp?: string;
}

/**
 * Market status information from WebSocket
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
 * Complete indices data structure from WebSocket
 */
export interface IndicesDto {
  timestamp?: string;
  indices?: IndexDataDto[];
  marketStatus?: MarketStatusDto;
  source?: string;
}

/**
 * WebSocket connection states
 */
export enum WebSocketConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING'
}

/**
 * WebSocket subscription configuration
 */
export interface WebSocketSubscriptionConfig {
  endpoint: string;
  destination: string;
  indexName?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

/**
 * WebSocket subscription status
 */
export interface WebSocketSubscription {
  id: string;
  config: WebSocketSubscriptionConfig;
  isActive: boolean;
  lastMessage?: IndicesDto;
  lastError?: string;
  subscriptionTime: Date;
}

/**
 * WebSocket service configuration
 */
export interface WebSocketServiceConfig {
  brokerURL: string;
  heartbeatIncoming?: number;
  heartbeatOutgoing?: number;
  reconnectDelay?: number;
  debug?: boolean;
}