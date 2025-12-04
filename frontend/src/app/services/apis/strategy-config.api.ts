import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.base';
import { 
  StrategyConfig, 
  StrategyConfigCreateRequest, 
  StrategyConfigUpdateRequest 
} from '../../features/strategies/strategy.types';

/**
 * Strategy Configuration API Service
 * 
 * Provides methods for managing strategy configuration including:
 * - Universe definition (which stocks to trade)
 * - Allocation rules (position sizing)
 * - Entry conditions (buy signals)
 * - Exit conditions (sell signals)
 * - Risk parameters (stop loss, take profit, etc.)
 * 
 * This service handles all HTTP communication with the backend strategy configuration endpoints.
 * 
 * API Endpoints:
 * - GET    /api/strategies/{id}/config          - Retrieve configuration
 * - PUT    /api/strategies/{id}/config          - Update configuration
 * - POST   /api/strategies/{id}/validate-config - Validate configuration
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
 * constructor(private configApi: StrategyConfigApiService) {}
 * 
 * loadConfig(strategyId: string) {
 *   this.configApi.getConfig(strategyId).subscribe({
 *     next: (config) => this.displayConfig(config),
 *     error: (err) => console.error('Load failed:', err.userMessage)
 *   });
 * }
 * ```
 * 
 * @see {@link StrategyConfig} for the configuration data model
 * @see {@link ConfigureComponent} for the UI component
 */
@Injectable({
  providedIn: 'root'
})
export class StrategyConfigApiService extends ApiService {
  
  /**
   * Retrieves strategy configuration by strategy ID
   * 
   * Returns the complete configuration including universe, allocations,
   * entry/exit conditions, and risk parameters.
   * Automatically retries once on failure to handle transient network issues.
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @returns Observable that emits the strategy configuration
   * @throws Error with status 404 if configuration doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.configApi.getConfig('strategy-uuid-123').subscribe({
   *   next: (config) => {
   *     this.universeForm.patchValue(config.universeDefinition);
   *     this.allocationsForm.patchValue(config.allocations);
   *     this.entryConditions = config.entryConditions;
   *     this.exitConditions = config.exitConditions;
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       // No config exists, use defaults
   *       this.initializeDefaultConfig();
   *     }
   *   }
   * });
   * ```
   */
  getConfig(strategyId: string): Observable<StrategyConfig> {
    return this.get<StrategyConfig>(`/strategies/${strategyId}/config`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Updates strategy configuration
   * 
   * Updates the complete configuration for the strategy.
   * The backend will validate all fields including:
   * - At least one entry condition must be defined
   * - At least one exit condition must be defined
   * - Percentage values must be within valid ranges (0-100)
   * - Universe must have at least one selection
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @param request - The configuration data to update
   * @returns Observable that emits the updated configuration
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const request: StrategyConfigUpdateRequest = {
   *   universeDefinition: {
   *     type: 'INDEX',
   *     indices: ['NIFTY_500']
   *   },
   *   allocations: {
   *     positionSizingMethod: 'EQUAL_WEIGHT',
   *     maxPositionSize: 10,
   *     maxPortfolioAllocation: 80,
   *     cashReserve: 20
   *   },
   *   entryConditions: [
   *     {
   *       id: 'entry-1',
   *       type: 'TECHNICAL',
   *       indicator: 'RSI',
   *       operator: 'LT',
   *       value: 30,
   *       timeframe: 'day'
   *     }
   *   ],
   *   exitConditions: [
   *     {
   *       id: 'exit-1',
   *       type: 'TECHNICAL',
   *       indicator: 'RSI',
   *       operator: 'GT',
   *       value: 70,
   *       timeframe: 'day'
   *     }
   *   ],
   *   riskParameters: {
   *     stopLossPercent: 5,
   *     takeProfitPercent: 15,
   *     trailingStopPercent: 3
   *   }
   * };
   * 
   * this.configApi.updateConfig('strategy-uuid-123', request).subscribe({
   *   next: (config) => {
   *     console.log('Configuration updated:', config);
   *     this.showSuccessMessage('Configuration saved successfully');
   *   },
   *   error: (err) => {
   *     if (err.validationErrors) {
   *       // Display field-specific errors
   *       this.showValidationErrors(err.validationErrors);
   *     }
   *   }
   * });
   * ```
   */
  updateConfig(strategyId: string, request: StrategyConfigUpdateRequest): Observable<StrategyConfig> {
    return this.put<StrategyConfig>(`/strategies/${strategyId}/config`, request);
  }

  /**
   * Validates strategy configuration without saving
   * 
   * Validates the configuration against all business rules without persisting changes.
   * Useful for providing real-time validation feedback in the UI.
   * 
   * The backend will check:
   * - At least one entry condition exists
   * - At least one exit condition exists
   * - All percentage values are within valid ranges
   * - Universe has at least one selection
   * - All required fields are present
   * - Condition operators are valid for their types
   * 
   * @param strategyId - The unique identifier (UUID) of the strategy
   * @param request - The configuration data to validate
   * @returns Observable that emits validation result (true if valid)
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 404 if strategy doesn't exist
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * // Validate before saving
   * this.configApi.validateConfig('strategy-uuid-123', configData).subscribe({
   *   next: (isValid) => {
   *     if (isValid) {
   *       // Proceed with save
   *       this.saveConfiguration();
   *     }
   *   },
   *   error: (err) => {
   *     if (err.validationErrors) {
   *       // Show validation errors without saving
   *       this.highlightInvalidFields(err.validationErrors);
   *     }
   *   }
   * });
   * ```
   */
  validateConfig(strategyId: string, request: StrategyConfigUpdateRequest): Observable<boolean> {
    return this.post<boolean>(`/strategies/${strategyId}/validate-config`, request);
  }
}
