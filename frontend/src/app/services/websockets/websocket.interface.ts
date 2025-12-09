import { Observable } from 'rxjs';
import { IndexDataDto, IndicesDto, WebSocketConnectionState } from '../entities/indices-websocket';

/**
 * Common interface for WebSocket services
 * Allows different implementations (STOMP, native WebSocket) to be used interchangeably
 */
export interface IWebSocketService {
  connectionState: Observable<WebSocketConnectionState>;
  errors: Observable<string>;
  connected: boolean;
  
  connect(): Promise<void>;
  disconnect(): void;
  
  subscribeToAllIndices(): Observable<IndicesDto>;
  subscribeToIndex(indexName: string): Observable<IndexDataDto>;
  unsubscribeFromAllIndices(): void;
  unsubscribeFromIndex(indexName: string): void;
  
  registerComponent(componentName: string): void;
  unregisterComponent(componentName: string): void;
  unsubscribeFromAll(): void;
  
  sendMessage(destination: string, message: any): void;
  getCurrentIndexData(indexName: string): any;
  getRetryStatus(): { retryCount: number; maxRetries: number; isRetrying: boolean };
  getActiveComponents(): string[];
}
