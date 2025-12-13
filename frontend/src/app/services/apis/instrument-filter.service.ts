import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FilterOptions {
  indices: string[];
}

export interface InstrumentFilter {
  index?: string;
}

export interface InstrumentDto {
  instrumentToken: string;
  tradingsymbol: string;
  name: string;
  segment: string;
  exchange: string;
  instrumentType: string;
  lastPrice: number;
  lotSize: number;
  tickSize: number;
}

// Note: IndexInstrument interface removed as we now use main backend API directly

@Injectable({
  providedIn: 'root'
})
export class InstrumentFilterService {
  private baseUrl = '/api/v1/instruments';
  private socketEngineUrl = environment.enginesHttpUrl;
  
  constructor(private http: HttpClient) {}
  
  getDistinctIndices(): Observable<string[]> {
    // Use main backend API as primary source
    return this.http.get<string[]>(`${this.baseUrl}/filters/indices`).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch distinct indices from main backend:', error);
        return of([]);
      })
    );
  }
  
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
    // If index filter is provided, use main backend API to get stocks for that index
    if (filter.index) {
      const encodedIndexName = encodeURIComponent(filter.index);
      return this.http.get<InstrumentDto[]>(`${this.baseUrl}/indices/${encodedIndexName}/instruments`).pipe(
        retry(2),
        catchError((error) => {
          console.error('Failed to fetch instruments for index from main backend:', error);
          return of([]);
        })
      );
    }
    
    // For non-index filters, use main backend API
    let params = new HttpParams();
    if (filter.index) params = params.set('index', filter.index);
    
    return this.http.get<InstrumentDto[]>(`${this.baseUrl}/filtered`, { params }).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch filtered instruments:', error);
        return of([]);
      })
    );
  }
}
