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
  private readonly baseEndpoint = '/api/v1/instruments';
  private readonly exchangesEndpoint = `${this.baseEndpoint}/filters/exchanges`;
  private readonly indicesEndpoint = `${this.baseEndpoint}/filters/indices`;
  private readonly segmentsEndpoint = `${this.baseEndpoint}/filters/segments`;
  private readonly filteredEndpoint = `${this.baseEndpoint}/filtered`;

  constructor(private apiService: ApiService) {}

  /**
   * Get distinct exchange values from the database
   * Results are cached on the backend with 7-day TTL
   * @returns An Observable of string array containing distinct exchanges
   */
  getDistinctExchanges(): Observable<string[]> {
    return this.apiService.get<string[]>(this.exchangesEndpoint)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('Failed to fetch distinct exchanges:', error);
          throw error;
        })
      );
  }

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
   * Get distinct segment values from the database
   * Results are cached on the backend with 7-day TTL
   * @returns An Observable of string array containing distinct segments
   */
  getDistinctSegments(): Observable<string[]> {
    return this.apiService.get<string[]>(this.segmentsEndpoint)
      .pipe(
        retry(2),
        catchError((error) => {
          console.error('Failed to fetch distinct segments:', error);
          throw error;
        })
      );
  }

  /**
   * Get filtered instruments based on exchange, index, and segment criteria
   * All filters are applied with AND logic
   * @param filter The filter criteria (exchange, index, segment)
   * @returns An Observable of InstrumentDto array containing filtered instruments
   */
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
    let params = new HttpParams();
    
    if (filter.exchange) {
      params = params.set('exchange', filter.exchange);
    }
    
    if (filter.index) {
      params = params.set('index', filter.index);
    }
    
    if (filter.segment) {
      params = params.set('segment', filter.segment);
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
