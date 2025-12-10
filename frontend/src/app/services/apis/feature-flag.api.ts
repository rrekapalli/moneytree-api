import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.base';
import { FeatureFlag } from '../entities/feature-flag';
import { enabledFeatures } from '../../../environments/enabled-features';


@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private readonly endpoint = '/feature-flags';

  constructor(private apiService: ApiService) {}

  /**
   * Get all feature flags
   * @returns An Observable of FeatureFlag array
   */
  getFeatureFlags(): Observable<FeatureFlag[]> {
    // Convert the static array of feature names to FeatureFlag objects
    const featureFlags: FeatureFlag[] = enabledFeatures.map((featureName, index) => ({
      id: `feature-${index + 1}`,
      name: featureName,
      description: `${featureName} feature`,
      enabled: true,
      group: 'core'
    }));

    return of(featureFlags);
  }

  /**
   * Get a specific feature flag by ID
   * @param id The feature flag ID
   * @returns An Observable of FeatureFlag
   */
  getFeatureFlagById(id: string): Observable<FeatureFlag> {
    // Get all feature flags and find the one with the matching ID
    return new Observable<FeatureFlag>(subscriber => {
      this.getFeatureFlags().subscribe(
        featureFlags => {
          const featureFlag = featureFlags.find(flag => flag.id === id);
          if (featureFlag) {
            subscriber.next(featureFlag);
            subscriber.complete();
          } else {
            subscriber.error(new Error(`Feature flag with ID ${id} not found`));
          }
        },
        error => subscriber.error(error)
      );
    });
  }

  /**
   * Create a new feature flag
   * @param featureFlag The feature flag to create
   * @returns An Observable of the created FeatureFlag
   * 
   * NOTE: This method is not functional with the static array approach.
   * It will still make an API call, but changes won't be reflected in the static array.
   */
  createFeatureFlag(featureFlag: Omit<FeatureFlag, 'id'>): Observable<FeatureFlag> {
    return this.apiService.post<FeatureFlag>(this.endpoint, featureFlag);
  }

  /**
   * Update an existing feature flag
   * @param id The feature flag ID
   * @param featureFlag The updated feature flag data
   * @returns An Observable of the updated FeatureFlag
   * 
   * NOTE: This method is not functional with the static array approach.
   * It will still make an API call, but changes won't be reflected in the static array.
   */
  updateFeatureFlag(id: string, featureFlag: Partial<FeatureFlag>): Observable<FeatureFlag> {
    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}`, featureFlag);
  }

  /**
   * Delete a feature flag
   * @param id The feature flag ID
   * @returns An Observable of the operation result
   * 
   * NOTE: This method is not functional with the static array approach.
   * It will still make an API call, but changes won't be reflected in the static array.
   */
  deleteFeatureFlag(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Enable a feature flag
   * @param id The feature flag ID
   * @returns An Observable of the updated FeatureFlag
   * 
   * NOTE: This method is not functional with the static array approach.
   * It will still make an API call, but changes won't be reflected in the static array.
   */
  enableFeatureFlag(id: string): Observable<FeatureFlag> {
    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}/enable`, {});
  }

  /**
   * Disable a feature flag
   * @param id The feature flag ID
   * @returns An Observable of the updated FeatureFlag
   * 
   * NOTE: This method is not functional with the static array approach.
   * It will still make an API call, but changes won't be reflected in the static array.
   */
  disableFeatureFlag(id: string): Observable<FeatureFlag> {
    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}/disable`, {});
  }
}
