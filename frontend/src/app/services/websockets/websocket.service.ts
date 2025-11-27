import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { Client, IMessage, StompConfig, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';
import { parseStompMessageToJson } from '../utils/stomp-message.parser';
import { environment } from '../../../environments/environment';

/**
 * Single, consolidated WebSocket service for all WebSocket operations
 * Handles STOMP connections, data management, and automatic tile updates
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  
  // STOMP client
  private client: Client;
  
  // Connection state management
  private connectionState$ = new BehaviorSubject<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  private errors$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Data management using BehaviorSubjects
  private allIndicesData$ = new BehaviorSubject<IndicesDto | null>(null);
  private specificIndicesData = new Map<string, BehaviorSubject<any>>();
  
  // Active subscriptions
  private activeSubscriptions = new Map<string, any>();
  
  // Track which components are using WebSocket subscriptions
  private activeComponents = new Set<string>();
  
  // Connection state tracking
  private isConnected: boolean = false;
  
  // Retry mechanism
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryTimeout?: any;
  private baseRetryDelay: number = 1000; // 1 second base delay
  private maxRetryDelay: number = 10000; // 10 seconds max delay
  private isRetrying: boolean = false;

  constructor() {
    this.client = this.createStompClient();
  }

  /**
   * Create and configure STOMP client
   */
  private createStompClient(): Client {
    const client = new Client({
      webSocketFactory: () => {
        const baseUrl = environment.enginesHttpUrl + '/ws/nse-indices';
        return new SockJS(baseUrl);
      },
      debug: () => {
        // Debug logging disabled for production
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Allow normal reconnection behavior for continuous streaming
      reconnectDelay: 5000
    });

    // Set up connection callbacks
    client.onConnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.CONNECTED);
      this.isConnected = true;
      this.retryCount = 0; // Reset retry count on successful connection
      this.isRetrying = false;
      this.clearRetryTimeout();
    };

    client.onDisconnect = (frame: IFrame) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
      this.clearSubscriptions();
      // Allow normal reconnection for continuous streaming
    };

    client.onStompError = (frame: IFrame) => {
      this.errors$.next(`STOMP Error: ${frame.headers['message']}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      this.isConnected = false;
      // Only limit retries on actual error responses from server
      this.handleServerErrorResponse(frame);
    };

    client.onWebSocketError = (error: any) => {
      this.errors$.next(`WebSocket Error: ${error.message || error}`);
      this.connectionState$.next(WebSocketConnectionState.ERROR);
      this.isConnected = false;
      // Only limit retries on actual error responses from server
      this.handleServerErrorResponse(error);
    };

    client.onWebSocketClose = (event: CloseEvent) => {
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
      // Allow normal reconnection unless it's an error response
      if (event.code >= 4000) { // Server error codes
        this.handleServerErrorResponse(event);
      }
    };

    return client;
  }

  /**
   * Handle server error responses with limited retry logic
   */
  private handleServerErrorResponse(error: any): void {
    // Only limit retries on actual server error responses
    if (this.isServerErrorResponse(error)) {
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        this.scheduleRetry();
      } else {
        this.connectionState$.next(WebSocketConnectionState.ERROR);
        this.isRetrying = false;
        this.disconnect(); // Stop all WebSocket activity
      }
    }
  }

  /**
   * Check if the response is a server error that should limit retries
   */
  private isServerErrorResponse(error: any): boolean {
    // Check for HTTP error status codes
    if (error && typeof error === 'object') {
      // STOMP error with error message
      if (error.headers && error.headers['message'] && 
          (error.headers['message'].includes('error') || 
           error.headers['message'].includes('Error') ||
           error.headers['message'].includes('ERROR'))) {
        return true;
      }
      
      // WebSocket close with error code
      if (error.code && error.code >= 4000) {
        return true;
      }
      
      // Generic error object
      if (error.message && error.message.toLowerCase().includes('error')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Schedule a retry attempt with exponential backoff
   */
  private scheduleRetry(): void {
    this.isRetrying = true;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseRetryDelay * Math.pow(2, this.retryCount - 1),
      this.maxRetryDelay
    );
    
    this.retryTimeout = setTimeout(() => {
      if (this.isRetrying) {
        this.connect().catch(error => {
          this.handleServerErrorResponse(error);
        });
      }
    }, delay);
  }

  /**
   * Clear retry timeout
   */
  private clearRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
  }

  /**
   * Reset retry state
   */
  private resetRetryState(): void {
    this.retryCount = 0;
    this.isRetrying = false;
    this.clearRetryTimeout();
  }

  /**
   * Get connection state observable
   */
  get connectionState(): Observable<WebSocketConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Get error observable
   */
  get errors(): Observable<string> {
    return this.errors$.asObservable();
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      await this.client.activate();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Only limit retries on server error responses
      this.handleServerErrorResponse(error);
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    try {
      // Stop any ongoing retry attempts
      this.resetRetryState();
      
      this.clearSubscriptions();
      
      if (this.client && this.client.connected) {
        this.client.deactivate();
      }
      
      this.connectionState$.next(WebSocketConnectionState.DISCONNECTED);
      this.isConnected = false;
    } catch (error) {
      this.connectionState$.next(WebSocketConnectionState.ERROR);
    }
  }

  /**
   * Subscribe to all indices data
   */
  subscribeToAllIndices(): Observable<IndicesDto> {
    if (!this.isConnected) {
      // Return empty observable that never emits when WebSocket is not connected
      return new Observable(subscriber => {
        // This observable will never emit and will complete immediately
        subscriber.complete();
      });
    }

    const subscription = this.client.subscribe('/topic/nse-indices', (message: IMessage) => {
      try {
        const data = parseStompMessageToJson(message.body);
        if (!data) { return; }
        const indicesData = this.parseIndicesData(data);
        this.allIndicesData$.next(indicesData);
      } catch (error) {
        // Silent error handling
      }
    });

    this.activeSubscriptions.set('all-indices', subscription);

    return this.allIndicesData$.pipe(
      filter((data): data is IndicesDto => data !== null)
    );
  }

  /**
   * Subscribe to specific index data
   * Normalizes incoming payloads (including flattened payloads) to IndexDataDto.
   */
  subscribeToIndex(indexName: string): Observable<IndexDataDto> {
    if (!this.isConnected) {
      // Return empty observable that never emits when WebSocket is not connected
      return new Observable<IndexDataDto>(subscriber => {
        // This observable will never emit and will complete immediately
        subscriber.complete();
      });
    }

    // Check if already subscribed
    const subscriptionKey = `index-${indexName}`;
    if (this.activeSubscriptions.has(subscriptionKey)) {
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
      }
      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is IndexDataDto => data !== null)
      );
    }

    // Subscribe to topic
    const topic = `/topic/nse-indices/${indexName.replace(/\s+/g, '-').toLowerCase()}`;
    
    try {
      const subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = parseStompMessageToJson(message.body);
          if (!parsed) { return; }
          const normalized: IndexDataDto = this.parseIndexData(parsed);
          
          // Update the specific index data
          if (!this.specificIndicesData.has(indexName)) {
            this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
          }
          this.specificIndicesData.get(indexName)?.next(normalized);
        } catch (error) {
          // Silent error handling
        }
      });

      this.activeSubscriptions.set(subscriptionKey, subscription);

      // Ensure we have a BehaviorSubject for this index
      if (!this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.set(indexName, new BehaviorSubject<any>(null));
      }

      return this.specificIndicesData.get(indexName)!.pipe(
        filter((data): data is IndexDataDto => data !== null)
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current data for a specific index (synchronous)
   */
  getCurrentIndexData(indexName: string): any {
    const subject = this.specificIndicesData.get(indexName);
    return subject ? subject.value : null;
  }

  /**
   * Unsubscribe from all indices data
   */
  unsubscribeFromAllIndices(): void {
    const subscription = this.activeSubscriptions.get('all-indices');
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete('all-indices');
      this.allIndicesData$.next(null);
      
      // Send unsubscribe message to backend
      this.sendMessage('/app/unsubscribe-indices', {});
    }
  }

  /**
   * Unsubscribe from specific index data
   */
  unsubscribeFromIndex(indexName: string): void {
    const subscriptionKey = `index-${indexName}`;
    const subscription = this.activeSubscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(subscriptionKey);
      
      if (this.specificIndicesData.has(indexName)) {
        this.specificIndicesData.get(indexName)?.next(null);
      }
      
      // Send unsubscribe message to backend
      const webSocketIndexName = indexName.replace(/\s+/g, '-').toLowerCase();
      this.sendMessage(`/app/unsubscribe-indices/${webSocketIndexName}`, {});
    }
  }

  /**
   * Send message to WebSocket
   */
  sendMessage(destination: string, message: any): void {
    if (this.isConnected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    }
  }

  /**
   * Clear all subscriptions
   */
  private clearSubscriptions(): void {
    this.activeSubscriptions.forEach((subscription, key) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        // Silent error handling
      }
    });
    
    this.activeSubscriptions.clear();
    this.allIndicesData$.next(null);
    this.specificIndicesData.forEach((subject, indexName) => {
      subject.next(null);
    });
  }

  /**
   * Register a component as using WebSocket subscriptions
   */
  public registerComponent(componentName: string): void {
    this.activeComponents.add(componentName);
  }

  /**
   * Unregister a component from WebSocket subscriptions
   */
  public unregisterComponent(componentName: string): void {
    this.activeComponents.delete(componentName);
    
    // If no components are active, cleanup all subscriptions
    if (this.activeComponents.size === 0) {
      this.unsubscribeFromAll();
    }
  }

  /**
   * Get retry status for debugging
   */
  public getRetryStatus(): { retryCount: number; maxRetries: number; isRetrying: boolean } {
    return {
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      isRetrying: this.isRetrying
    };
  }

  /**
   * Get list of active components
   */
  public getActiveComponents(): string[] {
    return Array.from(this.activeComponents);
  }

  /**
   * Unsubscribe from all active subscriptions (public method for external cleanup)
   */
  public unsubscribeFromAll(): void {
    // Send unsubscribe messages to backend for all active subscriptions
    this.activeSubscriptions.forEach((subscription, key) => {
      try {
        if (key === 'all-indices') {
          this.sendMessage('/app/unsubscribe-indices', {});
        } else if (key.startsWith('index-')) {
          const indexName = key.replace('index-', '');
          const webSocketIndexName = indexName.replace(/\s+/g, '-').toLowerCase();
          this.sendMessage(`/app/unsubscribe-indices/${webSocketIndexName}`, {});
        }
      } catch (error) {
        // Silent error handling
      }
    });
    
    this.clearSubscriptions();
  }

  /**
   * Parse indices data from WebSocket message
   */
  private parseIndicesData(data: any): IndicesDto {
    if (data.indices && Array.isArray(data.indices)) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: data.indices.map((index: any) => this.parseIndexData(index)),
        source: data.source || 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    if (data.indexName || data.indexSymbol) {
      return {
        timestamp: data.timestamp || new Date().toISOString(),
        indices: [this.parseIndexData(data)],
        source: data.source || 'Engines STOMP WebSocket',
        marketStatus: data.marketStatus || { status: 'ACTIVE' }
      };
    }
    
    return {
      timestamp: new Date().toISOString(),
      indices: [],
      source: 'Engines STOMP WebSocket',
      marketStatus: { status: 'UNKNOWN' }
    };
  }

  /**
   * Parse individual index data
   */
  private parseIndexData(indexData: any): IndexDataDto {
    return {
      key: indexData.key || indexData.indexName || indexData.name,
      indexName: indexData.indexName || indexData.name,
      indexSymbol: indexData.indexSymbol || indexData.symbol,
      lastPrice: indexData.lastPrice || indexData.currentPrice || indexData.last || 0,
      variation: indexData.variation || indexData.change || 0,
      percentChange: indexData.percentChange || indexData.perChange || 0,
      openPrice: indexData.openPrice || indexData.open || 0,
      dayHigh: indexData.dayHigh || indexData.high || 0,
      dayLow: indexData.dayLow || indexData.low || 0,
      previousClose: indexData.previousClose || indexData.prevClose || 0,
      yearHigh: indexData.yearHigh || 0,
      yearLow: indexData.yearLow || 0,
      indicativeClose: indexData.indicativeClose || 0,
      peRatio: indexData.peRatio || 0,
      pbRatio: indexData.pbRatio || 0,
      dividendYield: indexData.dividendYield || 0,
      declines: indexData.declines || 0,
      advances: indexData.advances || 0,
      unchanged: indexData.unchanged || 0,
      percentChange365d: indexData.percentChange365d || 0,
      date365dAgo: indexData.date365dAgo || '',
      percentChange30d: indexData.percentChange30d || 0,
      date30dAgo: indexData.date30dAgo || '',
      chart365dPath: indexData.chart365dPath || '',
      chart30dPath: indexData.chart30dPath || '',
      chartTodayPath: indexData.chartTodayPath || '',
      // Additional timestamps commonly present in engine ticks
      ingestionTimestamp: indexData.ingestionTimestamp || indexData.ingestion_time || '',
      tickTimestamp: indexData.tickTimestamp || indexData.tick_time || ''
    };
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    this.resetRetryState();
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
