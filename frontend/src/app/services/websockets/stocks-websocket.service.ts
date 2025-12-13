import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StockDataDto, StockTicksDto } from '../entities/stock-ticks';
import { environment } from '../../../environments/environment';
import SockJS from 'sockjs-client';

/**
 * WebSocket connection states
 */
export enum StocksWebSocketConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

/**
 * Stocks WebSocket service for connecting to socketengine stocks endpoint
 * Uses SockJS for compatibility with Spring WebSocket
 */
@Injectable({
  providedIn: 'root'
})
export class StocksWebSocketService {
  
  private ws: WebSocket | null = null;
  private connectionState$ = new BehaviorSubject<StocksWebSocketConnectionState>(StocksWebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private allStocksData$ = new BehaviorSubject<StockTicksDto | null>(null);
  
  private isConnected: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 5;
  private retryTimeout?: any;
  private baseRetryDelay: number = 1000;
  private maxRetryDelay: number = 10000;
  
  private activeComponents = new Set<string>();

  constructor() {}

  get connectionState(): Observable<StocksWebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  async connect(indexName?: string): Promise<void> {
    if (this.isConnected) {
      return;
    }

    this.connectionState$.next(StocksWebSocketConnectionState.CONNECTING);

    try {
      // Connect to socketengine WebSocket endpoint for index-specific stocks using SockJS
      const baseUrl = environment.enginesHttpUrl;
      // Use index-specific endpoint if provided, otherwise fallback to all stocks
      const endpoint = indexName ? `/ws/stocks/nse/index/${encodeURIComponent(indexName)}` : '/ws/stocks/nse/all';
      const sockJsUrl = `${baseUrl}${endpoint}`;
      
      // Add timeout and better error handling for SockJS connection
      const sockjs = new SockJS(sockJsUrl);
      this.ws = sockjs as any;
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.isConnected) {
          console.warn('WebSocket connection timeout - continuing with REST API fallback');
          this.connectionState$.next(StocksWebSocketConnectionState.ERROR);
          if (this.ws) {
            this.ws.close();
          }
        }
      }, 10000); // 10 second timeout

      if (!this.ws) {
        throw new Error('Failed to create SockJS connection');
      }

      // Set up event handlers
      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.connectionState$.next(StocksWebSocketConnectionState.CONNECTED);
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
        clearTimeout(connectionTimeout);
        console.warn('Stocks WebSocket connection error - continuing with REST API fallback:', error);
        this.errors$.next('WebSocket connection error - using REST API fallback');
        this.connectionState$.next(StocksWebSocketConnectionState.ERROR);
      };

      this.ws.onclose = (event: any) => {
        clearTimeout(connectionTimeout);
        this.connectionState$.next(StocksWebSocketConnectionState.DISCONNECTED);
        this.isConnected = false;
        
        // Only retry if it's not a clean close and we haven't exceeded max retries
        // For 404 errors (like missing /info endpoint), don't retry
        if (event.code !== 1000 && event.code !== 1002 && this.retryCount < this.maxRetries) {
          console.warn(`Stocks WebSocket closed (code: ${event.code}), attempting retry ${this.retryCount + 1}/${this.maxRetries}`);
          this.scheduleRetry();
        } else {
          console.warn('Stocks WebSocket connection failed - continuing with REST API fallback');
        }
      };

    } catch (error) {
      console.warn('Failed to create stocks WebSocket connection - continuing with REST API fallback:', error);
      this.connectionState$.next(StocksWebSocketConnectionState.ERROR);
      // Don't throw error - let the application continue with REST API fallback
    }
  }

  disconnect(): void {
    this.clearRetryTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connectionState$.next(StocksWebSocketConnectionState.DISCONNECTED);
    this.isConnected = false;
  }

  /**
   * Reconnect with a different index filter
   * @param indexName The index name to filter stocks by
   */
  async reconnectWithIndex(indexName: string): Promise<void> {
    // Disconnect current connection
    this.disconnect();
    
    // Wait a moment for clean disconnect
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Reconnect with new index
    await this.connect(indexName);
  }

  subscribeToAllStocks(): Observable<StockTicksDto> {
    // For native WebSocket, we're already subscribed to all stocks
    // Just return the observable
    return this.allStocksData$.pipe(
      filter((data): data is StockTicksDto => data !== null)
    );
  }

  subscribeToStock(stockSymbol: string): Observable<StockDataDto> {
    // For native WebSocket streaming all stocks, filter for specific stock
    return this.allStocksData$.pipe(
      filter((data): data is StockTicksDto => data !== null && data.data !== undefined),
      filter((data: StockTicksDto) => {
        const stock = data.data?.find(s => 
          s.symbol === stockSymbol || s.tradingsymbol === stockSymbol
        );
        return !!stock;
      }),
      filter((data: StockTicksDto) => {
        const stock = data.data?.find(s => 
          s.symbol === stockSymbol || s.tradingsymbol === stockSymbol
        );
        return stock !== undefined;
      }) as any
    );
  }

  unsubscribeFromStock(stockSymbol: string): void {
    // No-op for native WebSocket - we stream all stocks
  }

  unsubscribeFromAllStocks(): void {
    // No-op for native WebSocket - we stream all stocks
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
    this.allStocksData$.next(null);
  }

  getCurrentStockData(stockSymbol: string): StockDataDto | null {
    const currentData = this.allStocksData$.value;
    if (!currentData || !currentData.data) return null;
    
    return currentData.data.find(s => 
      s.symbol === stockSymbol || s.tradingsymbol === stockSymbol
    ) || null;
  }

  getRetryStatus(): { retryCount: number; maxRetries: number; isRetrying: boolean } {
    return {
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      isRetrying: !!this.retryTimeout
    };
  }

  getActiveComponents(): string[] {
    return Array.from(this.activeComponents);
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
    
    // Convert single tick to StockDataDto format
    const stockData: StockDataDto = {
      symbol: tick.symbol,
      tradingsymbol: tick.symbol,
      companyName: tick.companyName || tick.symbol,
      lastPrice: lastPrice,
      // Calculate changes if we have OHLC data
      priceChange: ohlcClose > 0 ? lastPrice - ohlcClose : 0,
      percentChange: ohlcClose > 0 ? ((lastPrice - ohlcClose) / ohlcClose) * 100 : 0,
      openPrice: tick.ohlc?.open || 0,
      dayHigh: tick.ohlc?.high || 0,
      dayLow: tick.ohlc?.low || 0,
      previousClose: ohlcClose,
      totalTradedVolume: tick.volume || 0,
      totalTradedValue: tick.turnover || 0,
      lastUpdateTime: tick.timestamp || new Date().toISOString(),
      // Additional fields from the tick data
      yearHigh: tick.yearHigh || 0,
      yearLow: tick.yearLow || 0,
      industry: tick.industry || '',
      sector: tick.sector || '',
      isFnoSec: tick.isFnoSec || false,
      isCaSec: tick.isCaSec || false,
      isSlbSec: tick.isSlbSec || false,
      isDebtSec: tick.isDebtSec || false,
      isSuspended: tick.isSuspended || false,
      isEtfSec: tick.isEtfSec || false,
      isDelisted: tick.isDelisted || false,
      isin: tick.isin || '',
      listingDate: tick.listingDate || ''
    };

    // Update the all stocks data
    const currentData = this.allStocksData$.value;
    const stocks = currentData?.data || [];
    
    // Find and update existing stock or add new one
    const existingStockIndex = stocks.findIndex(s => s.symbol === tick.symbol);
    if (existingStockIndex >= 0) {
      stocks[existingStockIndex] = stockData;
    } else {
      stocks.push(stockData);
    }

    const stockTicksDto: StockTicksDto = {
      name: 'NSE All Stocks',
      timestamp: tick.timestamp || new Date().toISOString(),
      data: stocks,
      metadata: {
        indexName: 'NSE',
        totalTradedVolume: stocks.reduce((sum, s) => sum + (s.totalTradedVolume || 0), 0),
        totalTradedValue: stocks.reduce((sum, s) => sum + (s.totalTradedValue || 0), 0),
        timeVal: tick.timestamp || new Date().toISOString()
      },
      marketStatus: {
        market: 'NSE',
        marketStatus: 'ACTIVE',
        tradeDate: new Date().toISOString().split('T')[0],
        index: 'NSE',
        marketStatusMessage: 'Market is open'
      }
    };

    this.allStocksData$.next(stockTicksDto);
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