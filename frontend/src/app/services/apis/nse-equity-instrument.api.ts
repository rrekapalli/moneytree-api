import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { NseEquityInstrument } from '../entities/nse-equity-instrument';

@Injectable({
  providedIn: 'root'
})
export class NseEquityInstrumentService {
  private readonly endpoint = '/api/v1/nse-equity-instruments';

  constructor(private apiService: ApiService) {}

  /**
   * Get all NSE equity instruments
   * @returns An Observable of NseEquityInstrument array
   */
  getAllNseEquityInstruments(): Observable<NseEquityInstrument[]> {
    return this.apiService.get<NseEquityInstrument[]>(this.endpoint);
  }

  /**
   * Get a specific NSE equity instrument by trading symbol
   * @param tradingsymbol The trading symbol
   * @returns An Observable of NseEquityInstrument
   */
  getNseEquityInstrumentByTradingSymbol(tradingsymbol: string): Observable<NseEquityInstrument> {
    return this.apiService.get<NseEquityInstrument>(`${this.endpoint}/${tradingsymbol}`);
  }

  /**
   * Create a new NSE equity instrument
   * @param nseEquityInstrument The NSE equity instrument to create
   * @returns An Observable of the created NseEquityInstrument
   */
  createNseEquityInstrument(nseEquityInstrument: NseEquityInstrument): Observable<NseEquityInstrument> {
    return this.apiService.post<NseEquityInstrument>(this.endpoint, nseEquityInstrument);
  }

  /**
   * Update an existing NSE equity instrument
   * @param tradingsymbol The trading symbol
   * @param nseEquityInstrument The updated NSE equity instrument data
   * @returns An Observable of the updated NseEquityInstrument
   */
  updateNseEquityInstrument(tradingsymbol: string, nseEquityInstrument: Partial<NseEquityInstrument>): Observable<NseEquityInstrument> {
    return this.apiService.put<NseEquityInstrument>(`${this.endpoint}/${tradingsymbol}`, nseEquityInstrument);
  }

  /**
   * Delete an NSE equity instrument
   * @param tradingsymbol The trading symbol
   * @returns An Observable of the operation result
   */
  deleteNseEquityInstrument(tradingsymbol: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${tradingsymbol}`);
  }
}