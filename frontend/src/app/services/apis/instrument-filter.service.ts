import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class InstrumentFilterService {
  private baseUrl = '/api/v1/instruments';
  
  constructor(private http: HttpClient) {}
  
  getDistinctIndices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/indices`).pipe(
      retry(2),
      catchError((error) => {
        console.error('Failed to fetch distinct indices:', error);
        return of([]);
      })
    );
  }
  
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
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
