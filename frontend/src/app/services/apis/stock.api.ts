import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Stock } from '../entities/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly endpoint = '/api/v1/stock';

  constructor(private apiService: ApiService) {}

  /**
   * Get all stocks
   * @returns An Observable of Stock array
   */
  getAllStocks(): Observable<Stock[]> {
    return this.apiService.get<Stock[]>(this.endpoint);
  }

  /**
   * Get a specific stock by ID
   * @param id The stock ID
   * @returns An Observable of Stock
   */
  getStockById(id: string): Observable<Stock> {
    return this.apiService.get<Stock>(`${this.endpoint}/${id}`);
  }

  /**
   * Get a specific stock by symbol
   * @param symbol The stock symbol
   * @returns An Observable of Stock
   */
  getStockBySymbol(symbol: string): Observable<Stock> {
    return this.apiService.get<Stock>(`${this.endpoint}/symbol/${symbol}`);
  }

  /**
   * Get stocks by industry
   * @param industry The industry to filter by
   * @returns An Observable of Stock array
   */
  getStocksByIndustry(industry: string): Observable<Stock[]> {
    return this.apiService.get<Stock[]>(`${this.endpoint}/industry/${industry}`);
  }

  /**
   * Get stocks by sector
   * @param sector The sector indicator to filter by
   * @returns An Observable of Stock array
   */
  getStocksBySector(sector: string): Observable<Stock[]> {
    return this.apiService.get<Stock[]>(`${this.endpoint}/sector/${sector}`);
  }

  /**
   * Get historical OHLCV data for a stock between startDate and endDate
   * @param symbol The stock symbol
   * @param startDate The start date for historical data
   * @param endDate The end date for historical data
   * @returns An Observable of historical data array
   */
  getStockHistory(symbol: string, startDate: string, endDate: string): Observable<any[]> {
    const requestBody = {
      symbol: symbol,
      startDate: startDate,
      endDate: endDate
    };
    return this.apiService.post<any[]>(`${this.endpoint}/${symbol}/history`, requestBody);
  }

  /**
   * Get all historical OHLCV data for a stock
   * @param symbol The stock symbol
   * @returns An Observable of historical data array
   */
  getAllStockHistory(symbol: string): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/${symbol}/historic/all`);
  }

  /**
   * Create a new stock
   * @param stock The stock to create
   * @returns An Observable of the created Stock
   */
  createStock(stock: Stock): Observable<Stock> {
    return this.apiService.post<Stock>(this.endpoint, stock);
  }
}