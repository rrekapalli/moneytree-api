import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from '../apis/api.base';
import { MockApiService } from '../apis/mock-api.service';
import { FeatureFlag } from '../entities/feature-flag';
import { enabledFeatures } from '../../../environments/enabled-features';
import { environment } from '../../../environments/environment';

/**
 * Interface for the feature flag state
 */
interface FeatureFlagState {
  featureFlags: FeatureFlag[];
  selectedFeatureFlag: FeatureFlag | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Initial state for the feature flags
 */
const initialState: FeatureFlagState = {
  featureFlags: [],
  selectedFeatureFlag: null,
  loading: false,
  error: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagStateService {
  private readonly endpoint = '/feature-flags';

  // State signal
  private state = signal<FeatureFlagState>(initialState);

  // Public readable signals
  public featureFlags = computed(() => this.state().featureFlags);
  public selectedFeatureFlag = computed(() => this.state().selectedFeatureFlag);
  public loading = computed(() => this.state().loading);
  public error = computed(() => this.state().error);
  public lastUpdated = computed(() => this.state().lastUpdated);

  // Choose the appropriate API service based on environment
  private get apiService(): ApiService | MockApiService {
    return environment.useMockData ? this.mockApiService : this.realApiService;
  }

  constructor(
    private realApiService: ApiService,
    private mockApiService: MockApiService
  ) {
    // State changes are handled silently
  }

  /**
   * Updates the state
   * @param updates Partial state to update
   */
  private updateState(updates: Partial<FeatureFlagState>): void {
    this.state.update(currentState => ({
      ...currentState,
      ...updates
    }));
  }

  /**
   * Sets the loading state
   * @param isLoading Loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateState({ loading: isLoading });
  }

  /**
   * Sets an error in the state
   * @param error Error message
   */
  private setError(error: string | null): void {
    this.updateState({ error });
  }

  /**
   * Updates the last updated timestamp
   */
  private updateTimestamp(): void {
    this.updateState({ lastUpdated: new Date() });
  }

  /**
   * Get all feature flags
   * @param force Whether to force a refresh of the static array
   * @returns An Observable of FeatureFlag array
   */
  getFeatureFlags(force: boolean = false): Observable<FeatureFlag[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.featureFlags().length > 0 && this.lastUpdated()) {
      const cacheAge = new Date().getTime() - this.lastUpdated()!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<FeatureFlag[]>(observer => {
          observer.next(this.featureFlags());
          observer.complete();
        });
      }
    }

    // Otherwise, use the static array of features
    this.setLoading(true);
    this.setError(null);

    // Convert the static array of feature names to FeatureFlag objects
    const featureFlags: FeatureFlag[] = enabledFeatures.map((featureName, index) => ({
      id: `feature-${index + 1}`,
      name: featureName,
      description: `${featureName} feature`,
      enabled: true,
      group: 'core'
    }));

    // Update the state with the feature flags
    this.updateState({ 
      featureFlags,
      loading: false
    });
    this.updateTimestamp();

    return of(featureFlags);
  }

  /**
   * Get a specific feature flag by ID
   * @param id The feature flag ID
   * @param force Whether to force a refresh from the static array
   * @returns An Observable of FeatureFlag
   */
  getFeatureFlagById(id: string, force: boolean = false): Observable<FeatureFlag> {
    // If not forcing and we have the feature flag in cache, return it
    if (!force && this.lastUpdated()) {
      const cachedFeatureFlag = this.featureFlags().find(f => f.id === id);
      if (cachedFeatureFlag) {
        this.updateState({ selectedFeatureFlag: cachedFeatureFlag });
        return new Observable<FeatureFlag>(observer => {
          observer.next(cachedFeatureFlag);
          observer.complete();
        });
      }
    }

    // Otherwise, get all feature flags and find the one with the matching ID
    this.setLoading(true);
    this.setError(null);

    return new Observable<FeatureFlag>(subscriber => {
      this.getFeatureFlags(force).subscribe(
        featureFlags => {
          const featureFlag = featureFlags.find(flag => flag.id === id);
          if (featureFlag) {
            this.updateState({ 
              selectedFeatureFlag: featureFlag,
              loading: false
            });
            subscriber.next(featureFlag);
            subscriber.complete();
          } else {
            this.setLoading(false);
            const errorMessage = `Feature flag with ID ${id} not found`;
            this.setError(errorMessage);
            subscriber.error(new Error(errorMessage));
          }
        },
        error => {
          this.setLoading(false);
          this.setError(error.message || `Failed to load feature flag with ID ${id}`);
          subscriber.error(error);
        }
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
    this.setLoading(true);
    this.setError(null);

    return this.apiService.post<FeatureFlag>(this.endpoint, featureFlag).pipe(
      tap({
        next: (newFeatureFlag) => {
          this.updateState({ 
            featureFlags: [...this.featureFlags(), newFeatureFlag],
            selectedFeatureFlag: newFeatureFlag,
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to create feature flag');
        }
      })
    );
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
    this.setLoading(true);
    this.setError(null);

    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}`, featureFlag).pipe(
      tap({
        next: (updatedFeatureFlag) => {
          // Update the feature flag in the cache
          this.updateState({
            featureFlags: this.featureFlags().map(f => 
              f.id === updatedFeatureFlag.id ? updatedFeatureFlag : f
            ),
            selectedFeatureFlag: this.selectedFeatureFlag()?.id === updatedFeatureFlag.id 
              ? updatedFeatureFlag 
              : this.selectedFeatureFlag(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to update feature flag with ID ${id}`);
        }
      })
    );
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
    this.setLoading(true);
    this.setError(null);

    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: () => {
          // Remove the feature flag from the cache
          this.updateState({
            featureFlags: this.featureFlags().filter(f => f.id !== id),
            selectedFeatureFlag: this.selectedFeatureFlag()?.id === id 
              ? null 
              : this.selectedFeatureFlag(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to delete feature flag with ID ${id}`);
        }
      })
    );
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
    this.setLoading(true);
    this.setError(null);

    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}/enable`, {}).pipe(
      tap({
        next: (updatedFeatureFlag) => {
          // Update the feature flag in the cache
          this.updateState({
            featureFlags: this.featureFlags().map(f => 
              f.id === updatedFeatureFlag.id ? updatedFeatureFlag : f
            ),
            selectedFeatureFlag: this.selectedFeatureFlag()?.id === updatedFeatureFlag.id 
              ? updatedFeatureFlag 
              : this.selectedFeatureFlag(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to enable feature flag with ID ${id}`);
        }
      })
    );
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
    this.setLoading(true);
    this.setError(null);

    return this.apiService.put<FeatureFlag>(`${this.endpoint}/${id}/disable`, {}).pipe(
      tap({
        next: (updatedFeatureFlag) => {
          // Update the feature flag in the cache
          this.updateState({
            featureFlags: this.featureFlags().map(f => 
              f.id === updatedFeatureFlag.id ? updatedFeatureFlag : f
            ),
            selectedFeatureFlag: this.selectedFeatureFlag()?.id === updatedFeatureFlag.id 
              ? updatedFeatureFlag 
              : this.selectedFeatureFlag(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to disable feature flag with ID ${id}`);
        }
      })
    );
  }

  /**
   * Check if a feature flag is enabled
   * @param id The feature flag ID or name
   * @returns True if the feature flag is enabled, false otherwise
   */
  isFeatureEnabled(idOrName: string): boolean {
    // First check the cache
    if (this.featureFlags().length > 0) {
      const featureFlag = this.featureFlags().find(f => f.id === idOrName || f.name === idOrName);
      if (featureFlag) {
        return featureFlag.enabled;
      }
    }

    // If not in cache or cache is empty, check the static array directly
    return enabledFeatures.includes(idOrName);
  }

  /**
   * Clear the cache and reset the state
   */
  clearCache(): void {
    this.state.set(initialState);
  }
}
