import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { NseQuoteEquity } from '../entities/nse-quote-equity';

@Injectable({
  providedIn: 'root'
})
export class NseQuoteEquityService {
  private readonly endpoint = '/v1/nse-quote-equities';

  constructor(private apiService: ApiService) {}

  /**
   * Get all NSE equity quotes
   * @returns An Observable of NseQuoteEquity array
   */
  getAllNseQuoteEquities(): Observable<NseQuoteEquity[]> {
    return this.apiService.get<NseQuoteEquity[]>(this.endpoint);
  }

  /**
   * Get a specific NSE equity quote by symbol
   * @param symbol The equity symbol
   * @returns An Observable of NseQuoteEquity
   */
  getNseQuoteEquityBySymbol(symbol: string): Observable<NseQuoteEquity> {
    return this.apiService.get<NseQuoteEquity>(`${this.endpoint}/${symbol}`);
  }

  /**
   * Get NSE equity quotes by date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns An Observable of NseQuoteEquity array for the specified date
   */
  getNseQuoteEquitiesByDate(date: string): Observable<NseQuoteEquity[]> {
    return this.apiService.get<NseQuoteEquity[]>(`${this.endpoint}/date/${date}`);
  }

  /**
   * Create a new NSE equity quote
   * @param nseQuoteEquity The NSE equity quote to create
   * @returns An Observable of the created NseQuoteEquity
   */
  createNseQuoteEquity(nseQuoteEquity: NseQuoteEquity): Observable<NseQuoteEquity> {
    return this.apiService.post<NseQuoteEquity>(this.endpoint, nseQuoteEquity);
  }

  /**
   * Update an existing NSE equity quote
   * @param symbol The equity symbol
   * @param nseQuoteEquity The updated NSE equity quote data
   * @returns An Observable of the updated NseQuoteEquity
   */
  updateNseQuoteEquity(symbol: string, nseQuoteEquity: Partial<NseQuoteEquity>): Observable<NseQuoteEquity> {
    return this.apiService.put<NseQuoteEquity>(`${this.endpoint}/${symbol}`, nseQuoteEquity);
  }

  /**
   * Delete an NSE equity quote
   * @param symbol The equity symbol
   * @returns An Observable of the operation result
   */
  deleteNseQuoteEquity(symbol: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${symbol}`);
  }
}