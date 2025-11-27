import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Indicator, IndicatorQuery, IndicatorResponse } from '../entities/indicators.entities';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsService {
  private readonly endpoint = '/api/v1/indicators';

  constructor(private apiService: ApiService) {}

  /**
   * Get available symbols that have indicators
   * @returns An Observable of available symbols array
   */
  getAvailableSymbols(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/symbols`);
  }

  /**
   * Get latest indicators for a specific symbol
   * @param symbol The stock symbol
   * @returns An Observable of the latest indicator data
   */
  getLatestForSymbol(symbol: string): Observable<Indicator> {
    return this.apiService.get<Indicator>(`${this.endpoint}/${symbol}/latest`);
  }

  /**
   * Get indicators for a specific symbol with optional date range
   * @param symbol The stock symbol
   * @param query Optional query parameters for filtering
   * @returns An Observable of indicator response with pagination
   */
  getIndicatorsForSymbol(symbol: string, query?: IndicatorQuery): Observable<IndicatorResponse> {
    const params = new URLSearchParams();
    
    if (query?.date) {
      params.append('date', query.date);
    }
    
    if (query?.fields && query.fields.length > 0) {
      params.append('fields', query.fields.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}/${symbol}?${queryString}` : `${this.endpoint}/${symbol}`;
    
    return this.apiService.get<IndicatorResponse>(url);
  }

  /**
   * Get indicators for multiple symbols
   * @param symbols Array of stock symbols
   * @param query Optional query parameters for filtering
   * @returns An Observable of indicator response with pagination
   */
  getIndicatorsForSymbols(symbols: string[], query?: IndicatorQuery): Observable<IndicatorResponse> {
    const params = new URLSearchParams();
    
    params.append('symbols', symbols.join(','));
    
    if (query?.date) {
      params.append('date', query.date);
    }
    
    if (query?.fields && query.fields.length > 0) {
      params.append('fields', query.fields.join(','));
    }

    const queryString = params.toString();
    return this.apiService.get<IndicatorResponse>(`${this.endpoint}/batch?${queryString}`);
  }

  /**
   * Get indicators by date range
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @param symbols Optional array of symbols to filter by
   * @param fields Optional array of fields to include
   * @returns An Observable of indicator response with pagination
   */
  getIndicatorsByDateRange(
    startDate: string, 
    endDate: string, 
    symbols?: string[], 
    fields?: string[]
  ): Observable<IndicatorResponse> {
    const params = new URLSearchParams();
    
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    if (symbols && symbols.length > 0) {
      params.append('symbols', symbols.join(','));
    }
    
    if (fields && fields.length > 0) {
      params.append('fields', fields.join(','));
    }

    const queryString = params.toString();
    return this.apiService.get<IndicatorResponse>(`${this.endpoint}/range?${queryString}`);
  }
}
