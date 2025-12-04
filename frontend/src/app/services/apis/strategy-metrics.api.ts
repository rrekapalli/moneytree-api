import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.base';

/**
 * Strategy Metrics DTO
 * 
 * Represents performance metrics for a strategy at a specific point in time.
 * Stored in the strategy_metrics table.
 */
export interface StrategyMetrics {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Strategy this metrics record belongs to */
  strategyId: string;
  
  /** Date these metrics were calculated for (ISO 8601 format) */
  metricDate: string;
  
  /** Total return percentage */
  totalReturn: number;
  
  /** Compound Annual Growth Rate (CAGR) */
  cagr: number;
  
  /** Sharpe ratio (risk-adjusted return) */
  sharpeRatio: number;
  
  /** Sortino ratio (downside risk-adjusted return) */
  sortinoRatio: number;
  
  /** Maximum drawdown percentage */
  maxDrawdown: number;
  
  /** Win rate (percentage of profitable trades) */
  winRate: number;
  
  /** Total number of trades executed */
  totalTrades: number;
  
  /** Profit factor (gross profit / gross loss) */
  profitFactor: number;
  
  /** Average win amount */
  avgWin: number;
  
  /** Average loss amount */
  avgLoss: number;
  
  /** When this metrics record was created (ISO 8601 format) */
  createdAt: string;
}

/**
 * Strategy Metrics API Service
 * 
 * Provides methods for retrieving strategy performance metrics including:
 * - Latest metrics snapshot
 * - Historical metrics time series
 * - Performance calculations and aggregations
 * 
 * This service handles all HTTP communication with the backend strategy metrics endpoints.
 * 
 * API Endpoints:
 * - GET /api/strategies/{id}/metrics         - Get latest metrics
 * - GET /api/strategies/{id}/metrics/history - Get historical metrics
 * 
 * Error Handling:
 * All methods use the base ApiService error handling which provides:
 * - User-friendly error messages
 * - Retry logic for transient failures (GET requests)
 * - Authentication/authorization error handling
 * 
 * Usage Example:
 * ```typescript
 * constructor(private metricsApi: StrategyMetricsApiService) {}
 * 
 * loadMetrics(strategyId: string) {
 *   this.metricsApi.getMetrics(strategyId).subscribe({
 *     next: (metrics) => this.displayMetrics(metrics),
 *     error: (err) => console.error('Load failed:', err.userMessage)
 *   });
 * }
 * ```
 * 
 * @see {@link StrategyMetrics} for the metrics data model
 * @see {@link OverviewComponent} for the UI component
 */
@Injectable({
  providedIn: 'root'
})
export class StrategyMetricsApiService extends ApiService {
  
  /**
   * Retrieves the latest metrics for a strategy
   * 
   * Returns the most recent performance metrics snapshot for the strategy.
   * This is typically used in the Overview tab to display current performance.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @returns Observable that emits the latest metrics
   * @throws Error with status 404 if no metrics exist for the strategy
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.metricsApi.getMetrics('strategy-uuid-123').subscribe({
   *   next: (metrics) => {
   *     this.totalReturn = metrics.totalReturn;
   *     this.cagr = metrics.cagr;
   *     this.sharpeRatio = metrics.sharpeRatio;
   *     this.maxDrawdown = metrics.maxDrawdown;
   *     this.winRate = metrics.winRate;
   *     this.totalTrades = metrics.totalTrades;
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       // No metrics yet, show empty state
   *       this.showNoMetricsMessage();
   *     }
   *   }
   * });
   * ```
   */
  getMetrics(strategyId: string): Observable<StrategyMetrics> {
    return this.get<StrategyMetrics>(`/strategies/${strategyId}/metrics`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Retrieves historical metrics for a strategy
   * 
   * Returns a time series of performance metrics for the strategy.
   * This is used to display performance charts and track metrics over time.
   * Results are ordered by metric_date in descending order (most recent first).
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @param startDate - Optional start date for filtering (ISO 8601 format: YYYY-MM-DD)
   * @param endDate - Optional end date for filtering (ISO 8601 format: YYYY-MM-DD)
   * @returns Observable that emits an array of historical metrics
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 400 if date parameters are invalid
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * // Get all historical metrics
   * this.metricsApi.getMetricsHistory('strategy-uuid-123').subscribe({
   *   next: (history) => {
   *     this.plotPerformanceChart(history);
   *   }
   * });
   * 
   * // Get metrics for a specific date range
   * this.metricsApi.getMetricsHistory(
   *   'strategy-uuid-123',
   *   '2024-01-01',
   *   '2024-12-31'
   * ).subscribe({
   *   next: (history) => {
   *     console.log(`Loaded ${history.length} metrics records`);
   *     this.analyzePerformanceTrend(history);
   *   },
   *   error: (err) => {
   *     if (err.status === 400) {
   *       this.showError('Invalid date range');
   *     }
   *   }
   * });
   * ```
   */
  getMetricsHistory(
    strategyId: string, 
    startDate?: string, 
    endDate?: string
  ): Observable<StrategyMetrics[]> {
    let url = `/strategies/${strategyId}/metrics/history`;
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('start', startDate);
    }
    if (endDate) {
      params.append('end', endDate);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.get<StrategyMetrics[]>(url)
      .pipe(
        retry(1)
      );
  }
}
