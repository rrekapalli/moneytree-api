import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NseEqIndicator } from '../entities/nse-eq-indicator.entity';

@Injectable({ providedIn: 'root' })
export class StockIndicatorsApi {
  private readonly base = '/api/v1/indicators';

  constructor(private http: HttpClient) {}

  getSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/symbols`);
  }

  getLatest(symbol: string): Observable<NseEqIndicator> {
    return this.http.get<NseEqIndicator>(`${this.base}/${encodeURIComponent(symbol)}/latest`);
  }

  getRecent(symbol: string, limit: number = 30): Observable<NseEqIndicator[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return this.http.get<NseEqIndicator[]>(`${this.base}/${encodeURIComponent(symbol)}?${params.toString()}`);
  }

  getOnDate(symbol: string, date: string): Observable<NseEqIndicator> {
    return this.http.get<NseEqIndicator>(`${this.base}/${encodeURIComponent(symbol)}/${date}`);
  }
}
