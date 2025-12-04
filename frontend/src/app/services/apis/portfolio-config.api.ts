import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { ApiService } from './api.base';
import { 
  PortfolioConfig, 
  PortfolioConfigCreateRequest, 
  PortfolioConfigUpdateRequest 
} from '../entities/portfolio.entities';

/**
 * Portfolio Configuration API Service
 * 
 * Provides methods for managing portfolio trading configuration including:
 * - Trading parameters (mode, intervals, lookback periods)
 * - Historical cache settings
 * - Redis configuration
 * - Entry and exit conditions for automated trading
 * 
 * This service is part of the portfolio details/config split refactoring that
 * separates technical trading configuration from basic portfolio metadata.
 * 
 * API Endpoints:
 * - GET    /api/portfolio/{id}/config - Retrieve configuration
 * - POST   /api/portfolio/{id}/config - Create new configuration
 * - PUT    /api/portfolio/{id}/config - Update existing configuration
 * - DELETE /api/portfolio/{id}/config - Delete configuration
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
 * constructor(private configApi: PortfolioConfigApiService) {}
 * 
 * loadConfig(portfolioId: string) {
 *   this.configApi.getConfig(portfolioId).subscribe({
 *     next: (config) => console.log('Config loaded:', config),
 *     error: (err) => console.error('Load failed:', err.userMessage)
 *   });
 * }
 * ```
 * 
 * @see {@link PortfolioConfig} for the configuration data model
 * @see {@link PortfolioConfigureComponent} for the UI component
 */
@Injectable({
  providedIn: 'root'
})
export class PortfolioConfigApiService extends ApiService {
  
  /**
   * Retrieves portfolio configuration by portfolio ID
   * 
   * Automatically retries once on failure to handle transient network issues.
   * Returns 404 if no configuration exists for the portfolio.
   * 
   * @param portfolioId - The unique identifier of the portfolio
   * @returns Observable that emits the portfolio configuration
   * @throws Error with status 404 if configuration doesn't exist
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.configApi.getConfig('portfolio-123').subscribe({
   *   next: (config) => this.displayConfig(config),
   *   error: (err) => {
   *     if (err.status === 404) {
   *       // No config exists, use defaults
   *       this.displayDefaults();
   *     }
   *   }
   * });
   * ```
   */
  getConfig(portfolioId: string): Observable<PortfolioConfig> {
    return this.get<PortfolioConfig>(`/portfolio/${portfolioId}/config`)
      .pipe(
        retry(1)
      );
  }

  /**
   * Creates a new portfolio configuration
   * 
   * Use this method when no configuration exists for the portfolio.
   * The backend will validate all required fields and return validation errors if invalid.
   * 
   * @param portfolioId - The unique identifier of the portfolio
   * @param request - The configuration data to create (excludes portfolioId, timestamps)
   * @returns Observable that emits the created configuration with server-generated fields
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 409 if configuration already exists
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const request: PortfolioConfigCreateRequest = {
   *   tradingMode: 'paper',
   *   signalCheckInterval: 300,
   *   lookbackDays: 30,
   *   // ... other fields
   * };
   * 
   * this.configApi.createConfig('portfolio-123', request).subscribe({
   *   next: (config) => console.log('Created:', config),
   *   error: (err) => {
   *     if (err.validationErrors) {
   *       // Display field-specific errors
   *       console.error('Validation errors:', err.validationErrors);
   *     }
   *   }
   * });
   * ```
   */
  createConfig(portfolioId: string, request: PortfolioConfigCreateRequest): Observable<PortfolioConfig> {
    return this.post<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request);
  }

  /**
   * Updates an existing portfolio configuration
   * 
   * Use this method when configuration already exists for the portfolio.
   * The backend will validate all fields and return validation errors if invalid.
   * 
   * @param portfolioId - The unique identifier of the portfolio
   * @param request - The configuration data to update (excludes portfolioId, timestamps)
   * @returns Observable that emits the updated configuration
   * @throws Error with status 400 if validation fails (includes field-specific errors)
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 404 if configuration doesn't exist
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * const request: PortfolioConfigUpdateRequest = {
   *   tradingMode: 'live',
   *   signalCheckInterval: 600,
   *   // ... other fields
   * };
   * 
   * this.configApi.updateConfig('portfolio-123', request).subscribe({
   *   next: (config) => console.log('Updated:', config),
   *   error: (err) => console.error('Update failed:', err.userMessage)
   * });
   * ```
   */
  updateConfig(portfolioId: string, request: PortfolioConfigUpdateRequest): Observable<PortfolioConfig> {
    return this.put<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request);
  }

  /**
   * Deletes a portfolio configuration
   * 
   * Removes all trading configuration for the specified portfolio.
   * The portfolio itself is not deleted, only its configuration.
   * 
   * @param portfolioId - The unique identifier of the portfolio
   * @returns Observable that completes when deletion is successful
   * @throws Error with status 401 if user is not authenticated
   * @throws Error with status 403 if user lacks permission
   * @throws Error with status 404 if configuration doesn't exist
   * @throws Error with status 500+ for server errors
   * 
   * @example
   * ```typescript
   * this.configApi.deleteConfig('portfolio-123').subscribe({
   *   next: () => console.log('Configuration deleted'),
   *   error: (err) => console.error('Delete failed:', err.userMessage)
   * });
   * ```
   */
  deleteConfig(portfolioId: string): Observable<void> {
    return this.delete<void>(`/portfolio/${portfolioId}/config`);
  }
}
