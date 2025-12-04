import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.base';
import { 
  StrategyDto, 
  StrategyWithMetrics,
  StrategyCreateRequest, 
  StrategyUpdateRequest 
} from '../../features/strategies/strategy.types';

/**
 * Strategy API Service
 * 
 * Provides methods for managing trading strategies including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Strategy listing with metrics
 * - Strategy activation/deactivation
 * 
 * This service handles all HTTP communication with the backend strategy endpoints.
 * 
 * API Endpoints:
 * - GET    /api/strategies       - List all strategies for the user
 * - GET    /api/strategies/{id}  - Get a specific strategy by ID
 * - POST   /api/strategies       - Create a new strategy
 * - PUT    /api/strategies/{id}  - Update an existing strategy
 * - DELETE /api/strategies/{id}  - Delete a strategy
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
 * constructor(private strategyApi: StrategyApiService) {}
 * 
 * loadStrategies() {
 *   this.strategyApi.getStrategies().subscribe({
 *     next: (strategies) => this.displayStrategies(strategies),
 *     error: (err) => console.error('Load failed:', err.userMessage)
 *   });
 * }
 * ```
 * 
 * @see {@link StrategyDto} for the base strategy data model
 * @see {@link StrategyWithMetrics} for strategy with performance metrics
 * @see {@link StrategiesComponent} for the main UI component
 */
@Injectable({
  providedIn: 'root'
})
export class StrategyApiService extends ApiService {
  
  /**
   * Retrieves all strategies for the current user
   * 
   * Returns a list of strategies with their latest performance metrics.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @returns Observable that emits an array of strategies with metrics
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.strategyApi.getStrategies().subscribe({
   *   next: (strategies) => {
   *     console.log(`Loaded ${strategies.length} strategies`);
   *     this.strategies = strategies;
   *   },
   *   error: (err) => {
   *     if (err.canRetry) {
   *       // Show retry button
   *       this.showRetryOption();
   *     }
   *   }
   * });
   * ```
   */
  getStrategies(): Observable<StrategyWithMetrics[]> {
    return this.get<StrategyWithMetrics[]>('/strategies')
      .pipe(
        retry(1)
      );
  }

  /**
   * Retrieves a specific strategy by ID
   * 
   * Returns the strategy details without performance metrics.
   * Use getStrategies() if you need metrics included.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param id - The unique identifier (UUID) of the strategy
   * @returns Observable that emits the strategy details
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission to view this strategy
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.strategyApi.getStrategy('strategy-uuid-123').subscribe({
   *   next: (strategy) => this.displayStrategy(strategy),
   *   error: (err) => {
   *     if (err.status === 404) {
   *       this.showNotFoundMessage();
   *     }
   *   }
   * });
   * ```
   */
  getStrategy(id: string): Observable<StrategyDto> {
    return this.get<StrategyDto>(`/strategies/${id}`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Creates a new strategy
   * 
   * Creates a new strategy with the provided details.
   * The backend will assign a unique ID and set timestamps.
   * The strategy will be created in inactive state by default.
   * 
   * @param request - The strategy data to create (name is required)
   * @returns Observable that emits the created strategy with server-generated fields
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 409 if a strategy with the same name already exists
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const request: StrategyCreateRequest = {
   *   name: 'My Momentum Strategy',
   *   description: 'A momentum-based trading strategy',
   *   riskProfile: 'MODERATE',
   *   isActive: false
   * };
   * 
   * this.strategyApi.createStrategy(request).subscribe({
   *   next: (strategy) => {
   *     console.log('Created strategy:', strategy.id);
   *     this.navigateToStrategy(strategy.id);
   *   },
   *   error: (err) => {
   *     if (err.validationErrors) {
   *       // Display field-specific errors
   *       this.showValidationErrors(err.validationErrors);
   *     } else if (err.status === 409) {
   *       this.showError('A strategy with this name already exists');
   *     }
   *   }
   * });
   * ```
   */
  createStrategy(request: StrategyCreateRequest): Observable<StrategyDto> {
    return this.post<StrategyDto>('/strategies', request);
  }

  /**
   * Updates an existing strategy
   * 
   * Updates the strategy with the provided details.
   * Only the fields included in the request will be updated.
   * The backend will update the updatedAt timestamp automatically.
   * 
   * @param id - The unique identifier (UUID) of the strategy to update
   * @param request - The strategy data to update (all fields are optional)
   * @returns Observable that emits the updated strategy
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission to update this strategy
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 409 if the new name conflicts with another strategy
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const request: StrategyUpdateRequest = {
   *   name: 'Updated Strategy Name',
   *   description: 'Updated description',
   *   isActive: true
   * };
   * 
   * this.strategyApi.updateStrategy('strategy-uuid-123', request).subscribe({
   *   next: (strategy) => {
   *     console.log('Strategy updated:', strategy);
   *     this.refreshStrategyList();
   *   },
   *   error: (err) => {
   *     if (err.validationErrors) {
   *       this.showValidationErrors(err.validationErrors);
   *     }
   *   }
   * });
   * ```
   */
  updateStrategy(id: string, request: StrategyUpdateRequest): Observable<StrategyDto> {
    return this.put<StrategyDto>(`/strategies/${id}`, request);
  }

  /**
   * Deletes a strategy
   * 
   * Permanently deletes the strategy and all associated data including:
   * - Strategy configuration
   * - Strategy metrics
   * - Backtest results
   * 
   * This operation cannot be undone. The backend will prevent deletion
   * if the strategy has active positions.
   * 
   * @param id - The unique identifier (UUID) of the strategy to delete
   * @returns Observable that completes when deletion is successful
   * @throws Error with status 400 if strategy has active positions
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission to delete this strategy
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * // Show confirmation dialog first
   * if (confirm('Are you sure you want to delete this strategy?')) {
   *   this.strategyApi.deleteStrategy('strategy-uuid-123').subscribe({
   *     next: () => {
   *       console.log('Strategy deleted successfully');
   *       this.removeFromList('strategy-uuid-123');
   *     },
   *     error: (err) => {
   *       if (err.status === 400) {
   *         this.showError('Cannot delete strategy with active positions');
   *       }
   *     }
   *   });
   * }
   * ```
   */
  deleteStrategy(id: string): Observable<void> {
    return this.delete<void>(`/strategies/${id}`);
  }
}
