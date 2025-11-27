import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import {StockDataDto, StockTicksDto, StockTicksResponseDto} from '../entities/stock-ticks';

@Injectable({
  providedIn: 'root'
})
export class StockTicksService {
  private readonly endpoint = '/v1/stock-ticks';

  constructor(private apiService: ApiService) {}

  /**
   * Gets current stock ticks data for a specific index
   * @param indexName The name of the stock index (e.g., "NIFTY 50")
   * @returns An Observable of the stock ticks response
   */
  getStockTicks(indexName: string): Observable<StockTicksDto> {
    // Convert index name to URL-friendly format (spaces to hyphens)
    const urlFriendlyIndexName = indexName.replace(/\s+/g, '-');
    return this.apiService.get<StockTicksDto>(`${this.endpoint}/${urlFriendlyIndexName}`);
  }

  /**
   * Gets current stock ticks data for a specific index
   * @param indexName The name of the stock index (e.g., "NIFTY 50")
   * @returns An Observable of the stock ticks response
   */
  getStockTicksByIndex(indexName: string): Observable<StockDataDto[]> {
    // Convert index name to URL-friendly format (spaces to hyphens)
    const urlFriendlyIndexName = indexName.replace(/\s+/g, '-');
    return this.apiService.get<StockDataDto[]>(`${this.endpoint}/by-index/${urlFriendlyIndexName}`);
  }

  /**
   * Gets list of available stock indices for real-time data
   * @returns An Observable of available indices array
   */
  getAvailableIndices(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/indices`);
  }

  /**
   * Gets current stock ticks data for NIFTY 50 (convenience method)
   * @returns An Observable of the stock ticks response for NIFTY 50
   */
  getNifty50StockTicks(): Observable<StockTicksDto> {
    return this.getStockTicks('NIFTY 50');
  }

  /**
   * Gets current stock ticks data for NIFTY BANK (convenience method)
   * @returns An Observable of the stock ticks response for NIFTY BANK
   */
  getNiftyBankStockTicks(): Observable<StockTicksDto> {
    return this.getStockTicks('NIFTY BANK');
  }

  /**
   * Gets current stock ticks data for NIFTY IT (convenience method)
   * @returns An Observable of the stock ticks response for NIFTY IT
   */
  getNiftyITStockTicks(): Observable<StockTicksDto> {
    return this.getStockTicks('NIFTY IT');
  }

}