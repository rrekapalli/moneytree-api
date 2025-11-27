import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnginesApiService } from './engines-api.base';
import {
  NseIndicesTickDto,
  NseIndicesStatusResponse,
  NseIndicesSystemInfo,
  NseIndicesWebSocketHealth,
  NseIndicesOperationResponse,
  NseIndicesSubscriptionResponse
} from '../entities/nse-indices';

@Injectable({
  providedIn: 'root'
})
export class NseIndicesService {
  private readonly endpoint = '/api/nse-indices';

  constructor(private enginesApiService: EnginesApiService) {}

  /**
   * Start NSE indices data ingestion
   * Initiates WebSocket connection to NSE and starts streaming data
   */
  startIngestion(): Observable<NseIndicesOperationResponse> {
    return this.enginesApiService.post<NseIndicesOperationResponse>(`${this.endpoint}/ingestion/start`, {});
  }

  /**
   * Stop NSE indices data ingestion
   * Gracefully closes WebSocket connection and stops data streaming
   */
  stopIngestion(): Observable<NseIndicesOperationResponse> {
    return this.enginesApiService.post<NseIndicesOperationResponse>(`${this.endpoint}/ingestion/stop`, {});
  }

  /**
   * Get current ingestion status
   * Returns detailed status information including connection health and statistics
   */
  getIngestionStatus(): Observable<NseIndicesStatusResponse> {
    return this.enginesApiService.get<NseIndicesStatusResponse>(`${this.endpoint}/ingestion/status`);
  }

  /**
   * Subscribe to all NSE indices data
   * Sends subscription message to NSE WebSocket for all available indices
   */
  subscribeToAllIndices(): Observable<NseIndicesOperationResponse> {
    return this.enginesApiService.post<NseIndicesOperationResponse>(`${this.endpoint}/subscription/all`, {});
  }

  /**
   * Subscribe to specific NSE index data
   * Sends subscription message to NSE WebSocket for a specific index
   */
  subscribeToIndex(indexName: string): Observable<NseIndicesSubscriptionResponse> {
    return this.enginesApiService.post<NseIndicesSubscriptionResponse>(`${this.endpoint}/subscription/${indexName}`, {});
  }

  /**
   * Unsubscribe from all NSE indices data
   * Sends unsubscribe message to NSE WebSocket for all indices
   */
  unsubscribeFromAllIndices(): Observable<NseIndicesOperationResponse> {
    return this.enginesApiService.delete<NseIndicesOperationResponse>(`${this.endpoint}/subscription/all`);
  }

  /**
   * Unsubscribe from specific NSE index data
   * Sends unsubscribe message to NSE WebSocket for a specific index
   */
  unsubscribeFromIndex(indexName: string): Observable<NseIndicesSubscriptionResponse> {
    return this.enginesApiService.delete<NseIndicesSubscriptionResponse>(`${this.endpoint}/subscription/${indexName}`);
  }

  /**
   * Get latest ingested indices data
   * Returns the most recent NSE indices data from local cache
   */
  getLatestIndicesData(): Observable<NseIndicesTickDto[]> {
    return this.enginesApiService.get<NseIndicesTickDto[]>(`${this.endpoint}/data/latest`);
  }

  /**
   * Get latest data for a specific index
   * Returns the most recent data for the specified index from local cache
   */
  getLatestIndexData(indexName: string): Observable<NseIndicesTickDto> {
    return this.enginesApiService.get<NseIndicesTickDto>(`${this.endpoint}/data/${indexName}`);
  }

  /**
   * Manually trigger data ingestion for testing purposes
   * Useful for testing Kafka publishing without waiting for real-time data
   */
  triggerManualIngestion(): Observable<NseIndicesOperationResponse> {
    return this.enginesApiService.post<NseIndicesOperationResponse>(`${this.endpoint}/ingestion/trigger`, {});
  }

  /**
   * Check WebSocket connection health
   * Returns the current connection status
   */
  checkWebSocketHealth(): Observable<NseIndicesWebSocketHealth> {
    return this.enginesApiService.get<NseIndicesWebSocketHealth>(`${this.endpoint}/health/websocket`);
  }

  /**
   * Get system information and configuration
   * Returns configuration details and system status
   */
  getSystemInfo(): Observable<NseIndicesSystemInfo> {
    return this.enginesApiService.get<NseIndicesSystemInfo>(`${this.endpoint}/system/info`);
  }
}
