import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.base';
import { 
  BacktestRun, 
  BacktestTrade, 
  BacktestParameters 
} from '../../features/strategies/strategy.types';

/**
 * Backtest Execution Response
 * 
 * Response returned when triggering a backtest execution.
 * Contains the run ID for tracking the backtest progress.
 */
export interface BacktestExecutionResponse {
  /** Unique identifier for the backtest run */
  runId: string;
  
  /** Status of the backtest execution */
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  
  /** Optional message about the execution */
  message?: string;
}

/**
 * Backtest API Service
 * 
 * Provides methods for managing strategy backtests including:
 * - Triggering backtest execution
 * - Retrieving backtest runs and results
 * - Accessing individual backtest trades
 * 
 * This service handles all HTTP communication with the backend backtest endpoints.
 * 
 * API Endpoints:
 * - POST /api/strategies/{id}/backtest      - Trigger backtest execution
 * - GET  /api/strategies/{id}/backtests     - List all backtests for strategy
 * - GET  /api/backtests/{runId}             - Get backtest run details
 * - GET  /api/backtests/{runId}/trades      - Get backtest trades
 * 
 * Error Handling:
 * All methods use the base ApiService error handling which provides:
 * - User-friendly error messages
 * - Retry logic for transient failures (GET requests)
 * - Validation error details (400 responses)
 * - Authentication/authorization error handling
 * 
 * Usage Example:
 * ```typescript
 * constructor(private backtestApi: BacktestApiService) {}
 * 
 * runBacktest(strategyId: string) {
 *   const params: BacktestParameters = {
 *     startDate: '2023-01-01',
 *     endDate: '2023-12-31',
 *     initialCapital: 100000
 *   };
 *   
 *   this.backtestApi.triggerBacktest(strategyId, params).subscribe({
 *     next: (response) => this.pollBacktestStatus(response.runId),
 *     error: (err) => console.error('Backtest failed:', err.userMessage)
 *   });
 * }
 * ```
 * 
 * @see {@link BacktestRun} for the backtest run data model
 * @see {@link BacktestTrade} for the backtest trade data model
 * @see {@link BacktestResultsComponent} for the UI component
 */
@Injectable({
  providedIn: 'root'
})
export class BacktestApiService extends ApiService {
  
  /**
   * Triggers a backtest execution for a strategy
   * 
   * Initiates a backtest run with the specified parameters.
   * The backtest will execute asynchronously in the background.
   * Use the returned runId to poll for status and retrieve results.
   * 
   * The backend will:
   * - Validate the strategy configuration is complete
   * - Validate the date range and initial capital
   * - Queue the backtest for execution
   * - Return immediately with a runId
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @param params - Backtest parameters (date range, initial capital)
   * @returns Observable that emits the backtest execution response
   * @throws Error with status 400 if parameters are invalid or strategy config is incomplete
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 409 if a backtest is already running for this strategy
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const params: BacktestParameters = {
   *   startDate: '2023-01-01',
   *   endDate: '2023-12-31',
   *   initialCapital: 100000,
   *   symbol: 'RELIANCE' // Optional: test on specific symbol
   * };
   * 
   * this.backtestApi.triggerBacktest('strategy-uuid-123', params).subscribe({
   *   next: (response) => {
   *     console.log('Backtest started:', response.runId);
   *     this.showProgressIndicator();
   *     this.pollBacktestStatus(response.runId);
   *   },
   *   error: (err) => {
   *     if (err.status === 400) {
   *       this.showError('Invalid backtest parameters or incomplete strategy configuration');
   *     } else if (err.status === 409) {
   *       this.showError('A backtest is already running for this strategy');
   *     }
   *   }
   * });
   * ```
   */
  triggerBacktest(strategyId: string, params: BacktestParameters): Observable<BacktestExecutionResponse> {
    return this.post<BacktestExecutionResponse>(`/strategies/${strategyId}/backtest`, params);
  }

  /**
   * Retrieves all backtest runs for a strategy
   * 
   * Returns a list of all backtest runs for the strategy, ordered by creation date
   * (most recent first). Each run includes summary metrics and status.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @returns Observable that emits an array of backtest runs
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.backtestApi.getBacktests('strategy-uuid-123').subscribe({
   *   next: (backtests) => {
   *     console.log(`Found ${backtests.length} backtest runs`);
   *     this.displayBacktestList(backtests);
   *     
   *     // Get the most recent backtest
   *     if (backtests.length > 0) {
   *       this.mostRecentBacktest = backtests[0];
   *       this.loadBacktestDetails(backtests[0].runId);
   *     }
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       this.showNoBacktestsMessage();
   *     }
   *   }
   * });
   * ```
   */
  getBacktests(strategyId: string): Observable<BacktestRun[]> {
    return this.get<BacktestRun[]>(`/strategies/${strategyId}/backtests`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Retrieves detailed results for a specific backtest run
   * 
   * Returns the complete backtest run details including all performance metrics.
   * This is used to display the backtest summary in the Backtest Results tab.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param runId - The unique identifier of the backtest run
   * @returns Observable that emits the backtest run details
   * @throws Error with status 404 if backtest run doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission to view this backtest
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.backtestApi.getBacktestRun('run-uuid-456').subscribe({
   *   next: (run) => {
   *     // Display summary metrics
   *     this.totalReturn = run.totalReturnPct;
   *     this.cagr = run.cagr;
   *     this.sharpeRatio = run.sharpeRatio;
   *     this.sortinoRatio = run.sortinoRatio;
   *     this.maxDrawdown = run.maxDrawdownPct;
   *     this.winRate = run.winRate;
   *     this.totalTrades = run.totalTrades;
   *     this.profitFactor = run.profitFactor;
   *     
   *     // Display date range and capital
   *     this.startDate = run.startDate;
   *     this.endDate = run.endDate;
   *     this.initialCapital = run.initialCapital;
   *     this.finalEquity = run.finalEquity;
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       this.showError('Backtest run not found');
   *     }
   *   }
   * });
   * ```
   */
  getBacktestRun(runId: string): Observable<BacktestRun> {
    return this.get<BacktestRun>(`/backtests/${runId}`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Retrieves all trades for a specific backtest run
   * 
   * Returns a list of all trades executed during the backtest, ordered by trade date.
   * This is used to populate the trades table in the Backtest Results tab.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param runId - The unique identifier of the backtest run
   * @returns Observable that emits an array of backtest trades
   * @throws Error with status 404 if backtest run doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission to view this backtest
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.backtestApi.getBacktestTrades('run-uuid-456').subscribe({
   *   next: (trades) => {
   *     console.log(`Loaded ${trades.length} trades`);
   *     this.displayTradesTable(trades);
   *     
   *     // Calculate additional statistics
   *     const profitableTrades = trades.filter(t => t.profit > 0);
   *     const losingTrades = trades.filter(t => t.profit < 0);
   *     
   *     console.log(`Profitable: ${profitableTrades.length}`);
   *     console.log(`Losing: ${losingTrades.length}`);
   *     
   *     // Find best and worst trades
   *     const bestTrade = trades.reduce((max, t) => 
   *       t.profitPct > max.profitPct ? t : max
   *     );
   *     const worstTrade = trades.reduce((min, t) => 
   *       t.profitPct < min.profitPct ? t : min
   *     );
   *     
   *     this.highlightBestWorstTrades(bestTrade, worstTrade);
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       this.showError('Backtest trades not found');
   *     }
   *   }
   * });
   * ```
   */
  getBacktestTrades(runId: string): Observable<BacktestTrade[]> {
    return this.get<BacktestTrade[]>(`/backtests/${runId}/trades`)
      .pipe(
        retry(1)
      );
  }
}
