import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { PortfolioHolding } from '../entities/portfolio.entities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioHoldingApiService extends ApiService {
  
  /**
   * Get all holdings for a portfolio
   * @param portfolioId - The portfolio ID
   * @param symbol - Optional symbol filter
   */
  getHoldings(portfolioId: string, symbol?: string): Observable<PortfolioHolding[]> {
    let url = `/portfolio/${portfolioId}/holdings`;
    if (symbol) {
      url += `?symbol=${symbol}`;
    }
    return this.get<PortfolioHolding[]>(url);
  }

  /**
   * Get a specific holding by symbol
   * @param portfolioId - The portfolio ID
   * @param symbol - The stock symbol
   */
  getHolding(portfolioId: string, symbol: string): Observable<PortfolioHolding> {
    return this.get<PortfolioHolding>(`/portfolio/${portfolioId}/holdings/${symbol}`);
  }

  /**
   * Create holdings for a portfolio
   * @param portfolioId - The portfolio ID
   * @param symbols - Array of symbols to create holdings for
   */
  createHoldings(portfolioId: string, symbols: string[]): Observable<PortfolioHolding[]> {
    return this.post<PortfolioHolding[]>(`/portfolio/${portfolioId}/holdings`, { symbols });
  }

  /**
   * Update a holding
   * @param portfolioId - The portfolio ID
   * @param symbol - The stock symbol
   * @param holding - Partial holding data to update
   */
  updateHolding(
    portfolioId: string, 
    symbol: string, 
    holding: Partial<PortfolioHolding>
  ): Observable<PortfolioHolding> {
    return this.put<PortfolioHolding>(`/portfolio/${portfolioId}/holdings/${symbol}`, holding);
  }

  /**
   * Partially update a holding
   * @param portfolioId - The portfolio ID
   * @param symbol - The stock symbol
   * @param holding - Partial holding data to patch
   */
  patchHolding(
    portfolioId: string, 
    symbol: string, 
    holding: Partial<PortfolioHolding>
  ): Observable<PortfolioHolding> {
    return this.patch<PortfolioHolding>(`/portfolio/${portfolioId}/holdings/${symbol}`, holding);
  }

  /**
   * Delete a holding
   * @param portfolioId - The portfolio ID
   * @param symbol - The stock symbol
   */
  deleteHolding(portfolioId: string, symbol: string): Observable<void> {
    return this.delete<void>(`/portfolio/${portfolioId}/holdings/${symbol}`);
  }
}
