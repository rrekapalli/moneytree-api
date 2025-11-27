import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.base';
import { MarketData } from '../entities/market-data';
import { MarketSummary } from '../entities/market-summary';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private readonly endpoint = '/market';
  private readonly summaryEndpoint = '/market/summary';
  private readonly topGainersEndpoint = '/market/top-gainers';
  private readonly topLosersEndpoint = '/market/top-losers';
  private readonly mostActiveEndpoint = '/market/most-active';
  private readonly searchEndpoint = '/market/search';

  constructor(private apiService: MockApiService) {}

  /**
   * Get market summary data
   * @returns An Observable of MarketSummary array
   */
  getMarketSummary(): Observable<MarketSummary[]> {
    return this.apiService.get<MarketSummary[]>(this.summaryEndpoint);
  }

  /**
   * Get top gaining stocks
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getTopGainers(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(this.topGainersEndpoint, params);
  }

  /**
   * Get top losing stocks
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getTopLosers(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(this.topLosersEndpoint, params);
  }

  /**
   * Get most active stocks by volume
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getMostActive(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(this.mostActiveEndpoint, params);
  }

  /**
   * Search for stocks by symbol or name
   * @param query The search query
   * @returns An Observable of MarketData array
   */
  searchStocks(query: string): Observable<MarketData[]> {
    const params = new HttpParams().set('q', query);
    return this.apiService.get<MarketData[]>(this.searchEndpoint, params);
  }

  /**
   * Get detailed information for a specific stock
   * @param symbol The stock symbol
   * @returns An Observable of MarketData
   */
  getStockDetails(symbol: string): Observable<MarketData> {
    return this.apiService.get<MarketData>(`${this.endpoint}/${symbol}`);
  }

  /**
   * Get historical price data for a stock
   * @param symbol The stock symbol
   * @param range The time range (e.g., '1d', '5d', '1m', '3m', '6m', '1y', '5y')
   * @returns An Observable of historical price data
   */
  getHistoricalData(symbol: string, range: string = '1m'): Observable<any> {
    const params = new HttpParams().set('range', range);
    return this.apiService.get<any>(`${this.endpoint}/${symbol}/history`, params);
  }

  /**
   * Get company information for a stock
   * @param symbol The stock symbol
   * @returns An Observable of company information
   */
  getCompanyInfo(symbol: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${symbol}/company`);
  }

  /**
   * Get financial data for a stock
   * @param symbol The stock symbol
   * @returns An Observable of financial data
   */
  getFinancialData(symbol: string): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${symbol}/financials`);
  }
}