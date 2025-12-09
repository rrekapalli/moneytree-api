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
      console.log('[NativeWebSocket] Already connected, skipping connection attempt');
      return;
    }

    try {
      // Connect to socketengine WebSocket endpoint for all indices using SockJS
      const sockJsUrl = 'http://localhost:8081/ws/indices/all';
      console.log('[NativeWebSocket] Creating SockJS connection to:', sockJsUrl);
      const sockjs = new SockJS(sockJsUrl);
      this.ws = sockjs as any;

      if (!this.ws) {
        throw new Error('Failed to create SockJS connection');
      }

      // Set up event handlers
      this.ws.onopen = () => {
        console.log('[NativeWebSocket] Connected to socketengine via SockJS');
        console.log('[NativeWebSocket] Connection readyState:', this.ws?.readyState);
        this.connectionState$.next(WebSocketConnectionState.CONNECTED);
        this.isConnected = true;
        this.retryCount = 0;
        this.clearRetryTimeout();
      };

      this.ws.onmessage = (event: any) => {
        try {
          console.log('[NativeWebSocket] Raw message received:', event.data);
          const tick = JSON.parse(event.data);
          console.log('[NativeWebSocket] Parsed tick data:', tick);
          this.handleTickData(tick);
        } catch (error) {
          console.error('[NativeWebSocket] Failed to parse message:', error, 'Raw data:', event.data);
        }
      };

      this.ws.onerror = (error: any) => {
        console.error('[NativeWebSocket] WebSocket error:', error);
        this.errors$.next('WebSocket connection error');
        this.connectionState$.next(WebSocketConnectionState.ERROR);
      };

      this.ws.onclose = (event: any) => {
        console.log('[NativeWebSocket] Connection closed:', event.code, event.reason);
        this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
        this.isConnected = false;
        
        // Retry connection if not a clean close
        if (event.code !== 1000 && this.retryCount < this.maxRetries) {
          this.scheduleRetry();
        }
      };

      console.log('[NativeWebSocket] SockJS connection setup complete, waiting for onopen event');

    } catch (error) {
      console.error('[NativeWebSocket] Connection failed:', error);
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

  private handleTickData(tick: any): void {
    console.log('[NativeWebSocket] handleTickData called with:', tick);
    
    // Convert single tick to IndicesDto format
    const indexData: IndexDataDto = {
      key: tick.symbol,
      indexName: tick.symbol,
      indexSymbol: tick.symbol,
      lastPrice: tick.lastTradedPrice || 0,
      variation: 0,
      percentChange: 0,
      openPrice: tick.ohlc?.open || 0,
      dayHigh: tick.ohlc?.high || 0,
      dayLow: tick.ohlc?.low || 0,
      previousClose: tick.ohlc?.close || 0,
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
      tickTimestamp: tick.timestamp || ''
    };

    console.log('[NativeWebSocket] Converted to IndexDataDto:', indexData);

    // Update the all indices data
    const currentData = this.allIndicesData$.value;
    const indices = currentData?.indices || [];
    
    console.log('[NativeWebSocket] Current indices count:', indices.length);
    
    // Find and update existing index or add new one
    const existingIndex = indices.findIndex(i => i.indexSymbol === tick.symbol);
    if (existingIndex >= 0) {
      console.log('[NativeWebSocket] Updating existing index at position:', existingIndex);
      indices[existingIndex] = indexData;
    } else {
      console.log('[NativeWebSocket] Adding new index');
      indices.push(indexData);
    }

    const indicesDto: IndicesDto = {
      timestamp: tick.timestamp || new Date().toISOString(),
      indices: indices,
      source: 'SocketEngine Native WebSocket',
      marketStatus: { status: 'ACTIVE' }
    };

    console.log('[NativeWebSocket] Emitting IndicesDto with', indices.length, 'indices');
    this.allIndicesData$.next(indicesDto);
  }

  private scheduleRetry(): void {
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, this.retryCount),
      this.maxRetryDelay
    );
    
    this.retryCount++;
    console.log(`[NativeWebSocket] Scheduling retry ${this.retryCount}/${this.maxRetries} in ${delay}ms`);
    
    this.retryTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('[NativeWebSocket] Retry failed:', error);
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
