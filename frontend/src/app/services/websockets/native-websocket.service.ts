import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { IWebSocketService } from './websocket.interface';
import SockJS from 'sockjs-client';

/**
 * Native WebSocket service for connecting to socketengine
 * Uses SockJS for compatibility with Spring WebSocket
 */
@Injectable({
  providedIn: 'root'
})
export class NativeWebSocketService implements IWebSocketService {
  
  private ws: WebSocket | null = null;
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryTimeout?: any;
  private baseRetryDelay: number = 1000;
  private maxRetryDelay: number = 10000;
  
  private activeComponents = new Set<string>();

  constructor() {}

  get connectionState(): Observable<WebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Connect to socketengine WebSocket endpoint for all indices using SockJS
      const sockJsUrl = 'http://localhost:8081/ws/indices/all';
      const sockjs = new SockJS(sockJsUrl);
      this.ws = sockjs as any;

      if (!this.ws) {
        throw new Error('Failed to create SockJS connection');
      }

      // Set up event handlers
      this.ws.onopen = () => {
        this.connectionState$.next(WebSocketConnectionState.CONNECTED);
        this.isConnected = true;
        this.retryCount = 0;
        this.clearRetryTimeout();
      };

      this.ws.onmessage = (event: any) => {
        try {
          const tick = JSON.parse(event.data);
          this.handleTickData(tick);
        } catch (error) {
          // Silent error handling - message parsing failed
        }
      };

      this.ws.onerror = (error: any) => {
        this.errors$.next('WebSocket connection error');
        this.connectionState$.next(WebSocketConnectionState.ERROR);
      };

      this.ws.onclose = (event: any) => {
        this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
        this.isConnected = false;
        
        // Retry connection if not a clean close
        if (event.code !== 1000 && this.retryCount < this.maxRetries) {
          this.scheduleRetry();
        }
      };

    } catch (error) {
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      throw error;
    }
  }

  disconnect(): void {
    this.clearRetryTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
    this.isConnected = false;
  }

  subscribeToAllIndices(): Observable<IndicesDto> {
    // For native WebSocket, we're already subscribed to all indices
    // Just return the observable
    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  subscribeToIndex(indexName: string): Observable<IndexDataDto> {
    // For native WebSocket streaming all indices, filter for specific index
    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null && data.indices !== undefined),
      filter((data: IndicesDto) => {
        const index = data.indices?.find(i => 
          i.indexName === indexName || i.indexSymbol === indexName
        );
        return !!index;
      }),
      filter((data: IndicesDto) => {
        const index = data.indices?.find(i => 
          i.indexName === indexName || i.indexSymbol === indexName
        );
        return index !== undefined;
      }) as any
    );
  }

  unsubscribeFromIndex(indexName: string): void {
    // No-op for native WebSocket - we stream all indices
  }

  unsubscribeFromAllIndices(): void {
    // No-op for native WebSocket - we stream all indices
  }

  registerComponent(componentName: string): void {
    this.activeComponents.add(componentName);
  }

  unregisterComponent(componentName: string): void {
    this.activeComponents.delete(componentName);
    
    if (this.activeComponents.size === 0) {
      this.disconnect();
    }
  }

  unsubscribeFromAll(): void {
    this.allIndicesData$.next(null);
  }

  sendMessage(destination: string, message: any): void {
    // No-op for native WebSocket - no message sending needed
  }

  getCurrentIndexData(indexName: string): any {
    const currentData = this.allIndicesData$.value;
    if (!currentData || !currentData.indices) return null;
    
    return currentData.indices.find(i => 
      i.indexName === indexName || i.indexSymbol === indexName
    );
  }

  getRetryStatus(): { retryCount: number; maxRetries: number; isRetrying: boolean } {
    return {
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      isRetrying: false
    };
  }

  getActiveComponents(): string[] {
    return Array.from(this.activeComponents);
  }
  
  /**
   * Analyze data quality for debugging binary parsing issues
   * This method can be called from browser console to check data quality
   */
  public analyzeDataQuality(): void {
    let messageCount = 0;
    const originalOnMessage = this.ws?.onmessage || null;
    
    if (this.ws) {
      this.ws.onmessage = (event: any) => {
        messageCount++;
        
        try {
          const parsed = JSON.parse(event.data);
          
          // Analyze message characteristics
          const analysis = {
            symbol: parsed.symbol,
            lastTradedPrice: parsed.lastTradedPrice,
            ohlc: parsed.ohlc,
            timestamp: parsed.timestamp,
            instrumentToken: parsed.instrumentToken,
            
            // Check for binary parsing issues
            hasBinaryIssues: this.detectBinaryParsingIssues(parsed),
            
            // Data quality assessment
            dataQuality: this.assessDataQuality(parsed)
          };
          
        } catch (error) {
          // Silent error handling
        }
        
        // Restore original handler after 3 messages
        if (messageCount >= 3) {
          if (this.ws && originalOnMessage) {
            this.ws.onmessage = originalOnMessage;
          }
        } else {
          // Continue with normal processing
          if (originalOnMessage && this.ws) {
            originalOnMessage.call(this.ws, event);
          }
        }
      };
    }
  }
  
  private detectBinaryParsingIssues(data: any): boolean {
    const price = data.lastTradedPrice || 0;
    const ohlc = data.ohlc || {};
    
    // Check for common binary parsing issues
    return price < 0 || // Negative prices indicate parsing issues
           price > 1000000 || // Extremely high prices
           Math.abs(price) > 1000000 || // Absolute value check
           (ohlc.close > 0 && Math.abs(price - ohlc.close) > ohlc.close * 10); // Price way off from OHLC
  }
  
  private assessDataQuality(data: any): string {
    const price = data.lastTradedPrice || 0;
    const ohlc = data.ohlc || {};
    
    if (price <= 0) return 'INVALID - Non-positive price';
    if (price > 1000000) return 'SUSPICIOUS - Extremely high price';
    if (ohlc.close > 0 && Math.abs(price - ohlc.close) > ohlc.close * 2) return 'INCONSISTENT - Price vs OHLC mismatch';
    if (ohlc.high > 0 && price > ohlc.high * 1.1) return 'INVALID - Price above high';
    if (ohlc.low > 0 && price < ohlc.low * 0.9) return 'INVALID - Price below low';
    
    return 'GOOD - Data appears valid';
  }
  
  /**
   * Debug method to analyze raw WebSocket messages for binary parsing issues
   * This method can be called from browser console to help debug data corruption
   */
  public debugRawMessages(): void {
    let messageCount = 0;
    const originalOnMessage = this.ws?.onmessage || null;
    
    if (this.ws) {
      this.ws.onmessage = (event: any) => {
        messageCount++;
        
        try {
          const parsed = JSON.parse(event.data);
          
          // Analyze for corruption
          const lastPrice = parsed.lastTradedPrice || 0;
          const ohlcClose = parsed.ohlc?.close || 0;
          const isCorrupted = lastPrice <= 0 || 
            (ohlcClose > 0 && Math.abs(lastPrice - ohlcClose) > ohlcClose * 2);
          
        } catch (error) {
          // Silent error handling
        }
        
        // Restore original handler after 5 messages
        if (messageCount >= 5) {
          if (this.ws && originalOnMessage) {
            this.ws.onmessage = originalOnMessage;
          }
        } else {
          // Continue with normal processing
          if (originalOnMessage && this.ws) {
            originalOnMessage.call(this.ws, event);
          }
        }
      };
    }
  }

  private handleTickData(tick: any): void {
    // Extract tick data - handle corrupted lastTradedPrice from binary parsing issues
    let lastPrice = tick.lastTradedPrice || 0;
    
    // CRITICAL FIX: Check if lastTradedPrice is corrupted (negative, zero, or way off from OHLC)
    const ohlcClose = tick.ohlc?.close || 0;
    const ohlcHigh = tick.ohlc?.high || 0;
    const ohlcLow = tick.ohlc?.low || 0;
    
    // If lastTradedPrice is clearly wrong, use OHLC close as fallback
    if (lastPrice <= 0 || 
        (ohlcClose > 0 && Math.abs(lastPrice - ohlcClose) > ohlcClose * 2) || // More than 200% difference
        (ohlcHigh > 0 && lastPrice > ohlcHigh * 1.5) || // Way above high
        (ohlcLow > 0 && lastPrice < ohlcLow * 0.5)) { // Way below low
      
      lastPrice = ohlcClose; // Use OHLC close as the most reliable price
    }
    
    // Convert single tick to IndexDataDto format (minimal processing)
    // The component will handle price change calculations using baseline cache
    const indexData: IndexDataDto = {
      key: tick.symbol,
      indexName: tick.symbol,
      indexSymbol: tick.symbol,
      lastPrice: lastPrice,
      // Don't calculate variation/percentChange here - let component do it with baseline
      variation: 0, // Will be calculated by component using baseline
      percentChange: 0, // Will be calculated by component using baseline
      openPrice: tick.ohlc?.open || 0,
      dayHigh: tick.ohlc?.high || 0,
      dayLow: tick.ohlc?.low || 0,
      previousClose: tick.ohlc?.close || 0, // Pass through for reference
      yearHigh: 0,
      yearLow: 0,
      indicativeClose: 0,
      peRatio: 0,
      pbRatio: 0,
      dividendYield: 0,
      declines: 0,
      advances: 0,
      unchanged: 0,
      percentChange365d: 0,
      date365dAgo: '',
      percentChange30d: 0,
      date30dAgo: '',
      chart365dPath: '',
      chart30dPath: '',
      chartTodayPath: '',
      ingestionTimestamp: tick.timestamp || '',
      tickTimestamp: tick.timestamp || '',
      // Pass through OHLC data for change calculations
      ohlc: tick.ohlc ? {
        open: tick.ohlc.open || 0,
        high: tick.ohlc.high || 0,
        low: tick.ohlc.low || 0,
        close: tick.ohlc.close || 0
      } : undefined
    };

    // Update the all indices data
    const currentData = this.allIndicesData$.value;
    const indices = currentData?.indices || [];
    
    // Find and update existing index or add new one
    const existingIndex = indices.findIndex(i => i.indexSymbol === tick.symbol);
    if (existingIndex >= 0) {
      indices[existingIndex] = indexData;
    } else {
      indices.push(indexData);
    }

    const indicesDto: IndicesDto = {
      timestamp: tick.timestamp || new Date().toISOString(),
      indices: indices,
      source: 'SocketEngine Native WebSocket',
      marketStatus: { status: 'ACTIVE' }
    };

    this.allIndicesData$.next(indicesDto);
  }

  private scheduleRetry(): void {
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay
    );
    
    this.retryCount++;
    
    this.retryTimeout = setTimeout(() => {
      this.connect().catch(error => {
        // Silent error handling
      });
    }, delay);
  }

  private clearRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
  }
}
