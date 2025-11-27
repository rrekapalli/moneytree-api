import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { NseEquityHistoricData } from '../entities/nse-historical-data';
import { NseEquityHistoricDataId } from '../entities/nse-historical-data-id';

@Injectable({
  providedIn: 'root'
})
export class NseEquityHistoricDataService {
  private readonly endpoint = '/v1/nse-historical-data';

  constructor(private apiService: ApiService) {}

  /**
   * Get all NSE historical data
   * @returns An Observable of NseEquityHistoricData array
   */
  getAllNseEquityHistoricData(): Observable<NseEquityHistoricData[]> {
    return this.apiService.get<NseEquityHistoricData[]>(this.endpoint);
  }

  /**
   * Get NSE historical data by symbol
   * @param symbol The equity symbol
   * @returns An Observable of NseEquityHistoricData array for the specified symbol
   */
  getNseEquityHistoricDataBySymbol(symbol: string): Observable<NseEquityHistoricData[]> {
    return this.apiService.get<NseEquityHistoricData[]>(`${this.endpoint}/symbol/${symbol}`);
  }

  /**
   * Get NSE historical data by symbol and date
   * @param symbol The equity symbol
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns An Observable of NseEquityHistoricData
   */
  getNseEquityHistoricDataBySymbolAndDate(symbol: string, date: string): Observable<NseEquityHistoricData> {
    return this.apiService.get<NseEquityHistoricData>(`${this.endpoint}/symbol/${symbol}/date/${date}`);
  }

  /**
   * Create a new NSE historical data entry
   * @param NseEquityHistoricData The NSE historical data to create
   * @returns An Observable of the created NseEquityHistoricData
   */
  createNseEquityHistoricData(NseEquityHistoricData: NseEquityHistoricData): Observable<NseEquityHistoricData> {
    return this.apiService.post<NseEquityHistoricData>(this.endpoint, NseEquityHistoricData);
  }

  /**
   * Update an existing NSE historical data entry
   * @param id The composite ID (symbol and date)
   * @param NseEquityHistoricData The updated NSE historical data
   * @returns An Observable of the updated NseEquityHistoricData
   */
  updateNseEquityHistoricData(id: NseEquityHistoricDataId, NseEquityHistoricData: Partial<NseEquityHistoricData>): Observable<NseEquityHistoricData> {
    return this.apiService.put<NseEquityHistoricData>(`${this.endpoint}/symbol/${id.symbol}/date/${id.date}`, NseEquityHistoricData);
  }

  /**
   * Delete an NSE historical data entry
   * @param id The composite ID (symbol and date)
   * @returns An Observable of the operation result
   */
  deleteNseEquityHistoricData(id: NseEquityHistoricDataId): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/symbol/${id.symbol}/date/${id.date}`);
  }
}