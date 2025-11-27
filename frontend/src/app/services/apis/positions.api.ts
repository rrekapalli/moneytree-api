import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.base';
import { Position } from '../entities/position';
import { PositionsSummary } from '../entities/positions-summary';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class PositionsService {
  private readonly endpoint = '/positions';
  private readonly summaryEndpoint = '/positions/summary';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all positions
   * @param status Optional filter by position status
   * @returns An Observable of Position array
   */
  getPositions(status?: 'open' | 'closed'): Observable<Position[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.apiService.get<Position[]>(this.endpoint, params);
  }

  /**
   * Get a specific position by ID
   * @param id The position ID
   * @returns An Observable of Position
   */
  getPositionById(id: string): Observable<Position> {
    return this.apiService.get<Position>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new position
   * @param position The position to create
   * @returns An Observable of the created Position
   */
  createPosition(position: Omit<Position, 'id'>): Observable<Position> {
    return this.apiService.post<Position>(this.endpoint, position);
  }

  /**
   * Update an existing position
   * @param id The position ID
   * @param position The updated position data
   * @returns An Observable of the updated Position
   */
  updatePosition(id: string, position: Partial<Position>): Observable<Position> {
    return this.apiService.put<Position>(`${this.endpoint}/${id}`, position);
  }

  /**
   * Delete a position
   * @param id The position ID
   * @returns An Observable of the operation result
   */
  deletePosition(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Close a position
   * @param id The position ID
   * @param exitPrice The exit price
   * @param closeDate The close date
   * @returns An Observable of the updated Position
   */
  closePosition(id: string, exitPrice: number, closeDate: string = new Date().toISOString()): Observable<Position> {
    const data = {
      exitPrice,
      closeDate,
      status: 'closed'
    };
    return this.apiService.put<Position>(`${this.endpoint}/${id}/close`, data);
  }

  /**
   * Reopen a closed position
   * @param id The position ID
   * @returns An Observable of the updated Position
   */
  reopenPosition(id: string): Observable<Position> {
    return this.apiService.put<Position>(`${this.endpoint}/${id}/reopen`, {
      status: 'open',
      exitPrice: null,
      closeDate: null
    });
  }

  /**
   * Get positions summary
   * @returns An Observable of PositionsSummary
   */
  getPositionsSummary(): Observable<PositionsSummary> {
    return this.apiService.get<PositionsSummary>(this.summaryEndpoint);
  }

  /**
   * Get positions by symbol
   * @param symbol The stock symbol
   * @returns An Observable of Position array
   */
  getPositionsBySymbol(symbol: string): Observable<Position[]> {
    const params = new HttpParams().set('symbol', symbol);
    return this.apiService.get<Position[]>(this.endpoint, params);
  }

  /**
   * Get positions by date range
   * @param startDate The start date
   * @param endDate The end date
   * @returns An Observable of Position array
   */
  getPositionsByDateRange(startDate: string, endDate: string): Observable<Position[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.apiService.get<Position[]>(this.endpoint, params);
  }
}