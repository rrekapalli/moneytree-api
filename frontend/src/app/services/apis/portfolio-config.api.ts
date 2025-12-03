import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiService } from './api.base';
import { 
  PortfolioConfig, 
  PortfolioConfigCreateRequest, 
  PortfolioConfigUpdateRequest 
} from '../entities/portfolio.entities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioConfigApiService extends ApiService {
  
  /**
   * Get portfolio configuration by portfolio ID
   * @param portfolioId The portfolio ID
   * @returns Observable of PortfolioConfig
   */
  getConfig(portfolioId: string): Observable<PortfolioConfig> {
    return this.get<PortfolioConfig>(`/portfolio/${portfolioId}/config`)
      .pipe(
        retry(1),
        catchError(this.handleConfigError)
      );
  }

  /**
   * Create a new portfolio configuration
   * @param portfolioId The portfolio ID
   * @param request The configuration create request
   * @returns Observable of created PortfolioConfig
   */
  createConfig(portfolioId: string, request: PortfolioConfigCreateRequest): Observable<PortfolioConfig> {
    return this.post<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request)
      .pipe(
        catchError(this.handleConfigError)
      );
  }

  /**
   * Update an existing portfolio configuration
   * @param portfolioId The portfolio ID
   * @param request The configuration update request
   * @returns Observable of updated PortfolioConfig
   */
  updateConfig(portfolioId: string, request: PortfolioConfigUpdateRequest): Observable<PortfolioConfig> {
    return this.put<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request)
      .pipe(
        catchError(this.handleConfigError)
      );
  }

  /**
   * Delete a portfolio configuration
   * @param portfolioId The portfolio ID
   * @returns Observable of void
   */
  deleteConfig(portfolioId: string): Observable<void> {
    return this.delete<void>(`/portfolio/${portfolioId}/config`)
      .pipe(
        catchError(this.handleConfigError)
      );
  }

  /**
   * Enhanced error handling for portfolio config operations
   * @param error The HTTP error
   * @returns Observable with enhanced error information
   */
  private handleConfigError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      // Network error
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      // Authentication error
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      // Authorization error
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      // Not found - this is expected when config doesn't exist yet
      errorMessage = 'Portfolio configuration not found.';
    } else if (error.status === 400) {
      // Validation error
      errorMessage = error.error?.message || 'Invalid configuration data. Please check your inputs.';
    } else if (error.status >= 500) {
      // Server error
      errorMessage = 'Server error occurred. Please try again later.';
    }
    
    return throwError(() => ({
      ...error,
      userMessage: errorMessage
    }));
  }
}
