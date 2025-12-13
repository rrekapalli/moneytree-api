import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { ApiService } from './api.base';
import { InstrumentDto, InstrumentFilter } from '../entities/instrument-filter';

/**
 * Service for fetching instrument filter metadata and filtered instruments
 * Provides methods to get distinct filter values and query filtered instruments
 */
@Injectable({
  providedIn: 'root'
})
export class InstrumentFilterService {
  private readonly baseEndpoint = '/v1/instruments';
  private readonly indicesEndpoint = `${this.baseEndpoint}/filters/indices`;
  private readonly filteredEndpoint = `${this.baseEndpoint}/filtered`;

  constructor(private apiService: ApiService) {}

  /**
   * Get distinct index values (tradingsymbols where segment='INDICES')
   * Results are cached on the backend with 7-day TTL
   * @returns An Observable of string array containing distinct indices
   */
  getDistinctIndices(): Observable<string[]> {
    return this.apiService.get<string[]>(this.indicesEndpoint)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('Failed to fetch distinct indices:', error);
          throw error;
        })
      );
  }

  /**
   * Get filtered instruments based on index criteria
   * @param filter The filter criteria (index)
   * @returns An Observable of InstrumentDto array containing filtered instruments
   */
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
    let params = new HttpParams();
    
    if (filter.index) {
      params = params.set('index', filter.index);
    }
    
    return this.apiService.get<InstrumentDto[]>(this.filteredEndpoint, params)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('Failed to fetch filtered instruments:', error);
          throw error;
        })
      );
  }
}
