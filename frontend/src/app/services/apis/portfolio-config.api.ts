import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
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
        retry(1)
      );
  }

  /**
   * Create a new portfolio configuration
   * @param portfolioId The portfolio ID
   * @param request The configuration create request
   * @returns Observable of created PortfolioConfig
   */
  createConfig(portfolioId: string, request: PortfolioConfigCreateRequest): Observable<PortfolioConfig> {
    return this.post<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request);
  }

  /**
   * Update an existing portfolio configuration
   * @param portfolioId The portfolio ID
   * @param request The configuration update request
   * @returns Observable of updated PortfolioConfig
   */
  updateConfig(portfolioId: string, request: PortfolioConfigUpdateRequest): Observable<PortfolioConfig> {
    return this.put<PortfolioConfig>(`/portfolio/${portfolioId}/config`, request);
  }

  /**
   * Delete a portfolio configuration
   * @param portfolioId The portfolio ID
   * @returns Observable of void
   */
  deleteConfig(portfolioId: string): Observable<void> {
    return this.delete<void>(`/portfolio/${portfolioId}/config`);
  }
}
