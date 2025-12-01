import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { PortfolioTrade } from '../entities/portfolio.entities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioTradeApiService extends ApiService {
  
  /**
   * Get all trades for a portfolio
   * @param portfolioId - The portfolio ID
   * @param symbol - Optional symbol filter
   */
  getTrades(portfolioId: string, symbol?: string): Observable<PortfolioTrade[]> {
    let url = `/portfolio/${portfolioId}/trades`;
    if (symbol) {
      url += `?symbol=${symbol}`;
    }
    return this.get<PortfolioTrade[]>(url);
  }

  /**
   * Get a specific trade by ID
   * @param portfolioId - The portfolio ID
   * @param tradeId - The trade ID
   */
  getTrade(portfolioId: string, tradeId: string): Observable<PortfolioTrade> {
    return this.get<PortfolioTrade>(`/portfolio/${portfolioId}/trades/${tradeId}`);
  }

  /**
   * Create a new trade
   * @param portfolioId - The portfolio ID
   * @param trade - The trade data
   */
  createTrade(portfolioId: string, trade: Partial<PortfolioTrade>): Observable<PortfolioTrade> {
    return this.post<PortfolioTrade>(`/portfolio/${portfolioId}/trades`, trade);
  }

  /**
   * Update a trade
   * @param portfolioId - The portfolio ID
   * @param tradeId - The trade ID
   * @param trade - The updated trade data
   */
  updateTrade(
    portfolioId: string, 
    tradeId: string, 
    trade: Partial<PortfolioTrade>
  ): Observable<PortfolioTrade> {
    return this.put<PortfolioTrade>(`/portfolio/${portfolioId}/trades/${tradeId}`, trade);
  }

  /**
   * Delete a trade
   * @param portfolioId - The portfolio ID
   * @param tradeId - The trade ID
   */
  deleteTrade(portfolioId: string, tradeId: string): Observable<void> {
    return this.delete<void>(`/portfolio/${portfolioId}/trades/${tradeId}`);
  }
}
