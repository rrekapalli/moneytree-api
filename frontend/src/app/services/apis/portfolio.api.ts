import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { 
  PortfolioDto, 
  PortfolioCreateRequest, 
  PortfolioUpdateRequest, 
  PortfolioPatchRequest,
  PortfolioTransactionDto,
  TransactionCreateRequest,
  PortfolioHoldingDto,
  HoldingsCreateRequest,
  HoldingUpdateRequest,
  PortfolioCashFlowDto,
  PortfolioValuationDailyDto,
  PortfolioHoldingValuationDailyDto,
  PortfolioMetricsDailyDto,
  PortfolioBenchmarkDto
} from '../entities/portfolio.entities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioApiService extends ApiService {
  
  // ===== PORTFOLIO CORE ENDPOINTS =====
  
  /**
   * Get all portfolios
   */
  getPortfolios(): Observable<PortfolioDto[]> {
    return this.get<PortfolioDto[]>('/api/v1/portfolio');
  }

  /**
   * Get a specific portfolio by ID
   */
  getPortfolio(id: number): Observable<PortfolioDto> {
    return this.get<PortfolioDto>(`/api/v1/portfolio/${id}`);
  }

  /**
   * Create a new portfolio
   */
  createPortfolio(request: PortfolioCreateRequest): Observable<PortfolioDto> {
    return this.post<PortfolioDto>('/api/v1/portfolio', request);
  }

  /**
   * Update a portfolio
   */
  updatePortfolio(id: number, request: PortfolioUpdateRequest): Observable<PortfolioDto> {
    return this.put<PortfolioDto>(`/api/v1/portfolio/${id}`, request);
  }

  /**
   * Partially update a portfolio
   */
  patchPortfolio(id: number, request: PortfolioPatchRequest): Observable<PortfolioDto> {
    return this.patch<PortfolioDto>(`/api/v1/portfolio/${id}`, request);
  }

  /**
   * Delete a portfolio
   */
  deletePortfolio(id: number): Observable<void> {
    return this.delete<void>(`/api/v1/portfolio/${id}`);
  }

  // ===== TRANSACTIONS ENDPOINTS =====

  /**
   * Get portfolio transactions with optional filters
   */
  getTransactions(
    id: number, 
    start?: string, 
    end?: string, 
    symbol?: string
  ): Observable<PortfolioTransactionDto[]> {
    let url = `/api/v1/portfolio/${id}/transactions`;
    const params = new URLSearchParams();
    
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (symbol) params.append('symbol', symbol);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.get<PortfolioTransactionDto[]>(url);
  }

  /**
   * Add a new transaction to the portfolio
   */
  addTransaction(id: number, request: TransactionCreateRequest): Observable<PortfolioTransactionDto> {
    return this.post<PortfolioTransactionDto>(`/api/v1/portfolio/${id}/transactions`, request);
  }

  // ===== HOLDINGS ENDPOINTS =====

  /**
   * Get portfolio holdings with optional symbol filter
   */
  getHoldings(id: number, symbol?: string): Observable<PortfolioHoldingDto[]> {
    let url = `/api/v1/portfolio/${id}/holdings`;
    if (symbol) {
      url += `?symbol=${symbol}`;
    }
    return this.get<PortfolioHoldingDto[]>(url);
  }

  /**
   * Create holdings for a portfolio (one or more symbols)
   */
  addHoldings(id: number, request: HoldingsCreateRequest): Observable<PortfolioHoldingDto[]> {
    return this.post<PortfolioHoldingDto[]>(`/api/v1/portfolio/${id}/holdings`, request);
  }

  /**
   * Replace or create a single holding for a symbol
   */
  putHolding(id: number, symbol: string, request: HoldingUpdateRequest): Observable<PortfolioHoldingDto> {
    return this.put<PortfolioHoldingDto>(`/api/v1/portfolio/${id}/holdings/${symbol}`, request);
  }

  /**
   * Partially update a holding for a symbol
   */
  patchHolding(id: number, symbol: string, request: HoldingUpdateRequest): Observable<PortfolioHoldingDto> {
    return this.patch<PortfolioHoldingDto>(`/api/v1/portfolio/${id}/holdings/${symbol}`, request);
  }

  // ===== CASH FLOWS ENDPOINTS =====

  /**
   * Get portfolio cash flows with optional date range
   */
  getCashFlows(id: number, start?: string, end?: string): Observable<PortfolioCashFlowDto[]> {
    let url = `/api/v1/portfolio/${id}/cashflows`;
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    return this.get<PortfolioCashFlowDto[]>(url);
  }

  // ===== VALUATIONS ENDPOINTS =====

  /**
   * Get portfolio valuations with optional date range
   */
  getValuations(id: number, start?: string, end?: string): Observable<PortfolioValuationDailyDto[]> {
    let url = `/api/v1/portfolio/${id}/valuations/daily`;
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    return this.get<PortfolioValuationDailyDto[]>(url);
  }

  /**
   * Get holding valuations with optional filters
   */
  getHoldingValuations(
    id: number, 
    start?: string, 
    end?: string, 
    symbol?: string
  ): Observable<PortfolioHoldingValuationDailyDto[]> {
    let url = `/api/v1/portfolio/${id}/holdings/valuations/daily`;
    const params = new URLSearchParams();
    
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (symbol) params.append('symbol', symbol);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.get<PortfolioHoldingValuationDailyDto[]>(url);
  }

  // ===== METRICS ENDPOINTS =====

  /**
   * Get portfolio metrics with optional date range
   */
  getMetrics(id: number, start?: string, end?: string): Observable<PortfolioMetricsDailyDto[]> {
    let url = `/api/v1/portfolio/${id}/metrics/daily`;
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    return this.get<PortfolioMetricsDailyDto[]>(url);
  }

  // ===== BENCHMARKS ENDPOINTS =====

  /**
   * Get portfolio benchmarks
   */
  getBenchmarks(id: number): Observable<PortfolioBenchmarkDto[]> {
    return this.get<PortfolioBenchmarkDto[]>(`/api/v1/portfolio/${id}/benchmarks`);
  }
}
