import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { NseEquity } from '../entities/nse-equity';

@Injectable({
  providedIn: 'root'
})
export class NseEquityService {
  private readonly endpoint = '/v1/nse-equities';

  constructor(private apiService: ApiService) {}

  /**
   * Get all NSE equities
   * @returns An Observable of NseEquity array
   */
  getAllNseEquities(): Observable<NseEquity[]> {
    return this.apiService.get<NseEquity[]>(this.endpoint);
  }

  /**
   * Get a specific NSE equity by symbol
   * @param symbol The equity symbol
   * @returns An Observable of NseEquity
   */
  getNseEquityBySymbol(symbol: string): Observable<NseEquity> {
    return this.apiService.get<NseEquity>(`${this.endpoint}/${symbol}`);
  }

  /**
   * Create a new NSE equity
   * @param nseEquity The NSE equity to create
   * @returns An Observable of the created NseEquity
   */
  createNseEquity(nseEquity: NseEquity): Observable<NseEquity> {
    return this.apiService.post<NseEquity>(this.endpoint, nseEquity);
  }

  /**
   * Update an existing NSE equity
   * @param symbol The equity symbol
   * @param nseEquity The updated NSE equity data
   * @returns An Observable of the updated NseEquity
   */
  updateNseEquity(symbol: string, nseEquity: Partial<NseEquity>): Observable<NseEquity> {
    return this.apiService.put<NseEquity>(`${this.endpoint}/${symbol}`, nseEquity);
  }

  /**
   * Delete an NSE equity
   * @param symbol The equity symbol
   * @returns An Observable of the operation result
   */
  deleteNseEquity(symbol: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${symbol}`);
  }
}