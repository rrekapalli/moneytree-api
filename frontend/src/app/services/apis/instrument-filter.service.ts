import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface FilterOptions {
  exchanges: string[];
  indices: string[];
  segments: string[];
}

export interface InstrumentFilter {
  exchange?: string;
  index?: string;
  segment?: string;
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

@Injectable({
  providedIn: 'root'
})
export class InstrumentFilterService {
  private baseUrl = '/api/v1/instruments';
  
  constructor(private http: HttpClient) {}
  
  getDistinctExchanges(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/exchanges`).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch distinct exchanges:', error);
        return of([]);
      })
    );
  }
  
  getDistinctIndices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/indices`).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch distinct indices:', error);
        return of([]);
      })
    );
  }
  
  getDistinctSegments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/segments`).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch distinct segments:', error);
        return of([]);
      })
    );
  }
  
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
    let params = new HttpParams();
    if (filter.exchange) params = params.set('exchange', filter.exchange);
    if (filter.index) params = params.set('index', filter.index);
    if (filter.segment) params = params.set('segment', filter.segment);
    
    return this.http.get<InstrumentDto[]>(`${this.baseUrl}/filtered`, { params }).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch filtered instruments:', error);
        return of([]);
      })
    );
  }
}
