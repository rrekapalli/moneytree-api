import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../apis/api.base';
import { Holding } from '../entities/holding';
import { HoldingGroup } from '../entities/holding-group';

/**
 * Interface for the holdings state
 */
interface HoldingsState {
  holdingGroups: HoldingGroup[];
  selectedHoldingGroup: HoldingGroup | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Initial state for the holdings
 */
const initialState: HoldingsState = {
  holdingGroups: [],
  selectedHoldingGroup: null,
  loading: false,
  error: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class HoldingsStateService {
  private readonly endpoint = '/holdings';
  
  // State signal
  private state = signal<HoldingsState>(initialState);
  
  // Public readable signals
  public holdingGroups = computed(() => this.state().holdingGroups);
  public selectedHoldingGroup = computed(() => this.state().selectedHoldingGroup);
  public loading = computed(() => this.state().loading);
  public error = computed(() => this.state().error);
  public lastUpdated = computed(() => this.state().lastUpdated);
  
  constructor(
    private apiService: ApiService
  ) {
    // State changes are handled silently
  }
  
  /**
   * Updates the state
   * @param newState Partial state to update
   */
  private updateState(newState: Partial<HoldingsState>): void {
    this.state.update(state => ({
      ...state,
      ...newState
    }));
  }
  
  /**
   * Sets the loading state
   * @param loading Loading state
   */
  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }
  
  /**
   * Sets the error state
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
   * Get all holding groups
   * @param force Whether to force an API call or use cache
   * @returns An Observable of HoldingGroup array
   */
  getHoldingGroups(force: boolean = false): Observable<HoldingGroup[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.holdingGroups().length > 0 && this.lastUpdated()) {
      const cacheAge = new Date().getTime() - this.lastUpdated()!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<HoldingGroup[]>(observer => {
          observer.next(this.holdingGroups());
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<HoldingGroup[]>(this.endpoint).pipe(
      tap({
        next: (holdingGroups) => {
          this.updateState({ 
            holdingGroups,
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load holding groups');
        }
      })
    );
  }
  
  /**
   * Get a specific holding group by ID
   * @param id The holding group ID
   * @param force Whether to force an API call or use cache
   * @returns An Observable of HoldingGroup
   */
  getHoldingGroupById(id: string, force: boolean = false): Observable<HoldingGroup> {
    // If not forcing and we have the holding group in cache, return it
    if (!force && this.lastUpdated()) {
      const cachedHoldingGroup = this.holdingGroups().find(h => h.id === id);
      if (cachedHoldingGroup) {
        this.updateState({ selectedHoldingGroup: cachedHoldingGroup });
        return new Observable<HoldingGroup>(observer => {
          observer.next(cachedHoldingGroup);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<HoldingGroup>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: (holdingGroup) => {
          this.updateState({ 
            selectedHoldingGroup: holdingGroup,
            loading: false
          });
          
          // Update the holding group in the cache if it exists
          this.updateState({
            holdingGroups: this.holdingGroups().map(h => 
              h.id === holdingGroup.id ? holdingGroup : h
            )
          });
          
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to load holding group with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Create a new holding group
   * @param holdingGroup The holding group to create
   * @returns An Observable of the created HoldingGroup
   */
  createHoldingGroup(holdingGroup: Omit<HoldingGroup, 'id' | 'totalValue' | 'dailyChange'>): Observable<HoldingGroup> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.post<HoldingGroup>(this.endpoint, holdingGroup).pipe(
      tap({
        next: (newHoldingGroup) => {
          this.updateState({ 
            holdingGroups: [...this.holdingGroups(), newHoldingGroup],
            selectedHoldingGroup: newHoldingGroup,
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to create holding group');
        }
      })
    );
  }
  
  /**
   * Update an existing holding group
   * @param id The holding group ID
   * @param holdingGroup The updated holding group data
   * @returns An Observable of the updated HoldingGroup
   */
  updateHoldingGroup(id: string, holdingGroup: Partial<HoldingGroup>): Observable<HoldingGroup> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.put<HoldingGroup>(`${this.endpoint}/${id}`, holdingGroup).pipe(
      tap({
        next: (updatedHoldingGroup) => {
          // Update the holding group in the cache
          this.updateState({
            holdingGroups: this.holdingGroups().map(h => 
              h.id === updatedHoldingGroup.id ? updatedHoldingGroup : h
            ),
            selectedHoldingGroup: this.selectedHoldingGroup()?.id === updatedHoldingGroup.id 
              ? updatedHoldingGroup 
              : this.selectedHoldingGroup(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to update holding group with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Delete a holding group
   * @param id The holding group ID
   * @returns An Observable of the operation result
   */
  deleteHoldingGroup(id: string): Observable<void> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: () => {
          // Remove the holding group from the cache
          this.updateState({
            holdingGroups: this.holdingGroups().filter(h => h.id !== id),
            selectedHoldingGroup: this.selectedHoldingGroup()?.id === id 
              ? null 
              : this.selectedHoldingGroup(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to delete holding group with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Add a holding to a holding group
   * @param groupId The holding group ID
   * @param holding The holding to add
   * @returns An Observable of the updated HoldingGroup
   */
  addHolding(groupId: string, holding: Omit<Holding, 'value' | 'change'>): Observable<HoldingGroup> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.post<HoldingGroup>(`${this.endpoint}/${groupId}/holdings`, holding).pipe(
      tap({
        next: (updatedHoldingGroup) => {
          // Update the holding group in the cache
          this.updateState({
            holdingGroups: this.holdingGroups().map(h => 
              h.id === updatedHoldingGroup.id ? updatedHoldingGroup : h
            ),
            selectedHoldingGroup: this.selectedHoldingGroup()?.id === updatedHoldingGroup.id 
              ? updatedHoldingGroup 
              : this.selectedHoldingGroup(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to add holding to group with ID ${groupId}`);
        }
      })
    );
  }
  
  /**
   * Update a holding in a holding group
   * @param groupId The holding group ID
   * @param symbol The symbol of the holding to update
   * @param holding The updated holding data
   * @returns An Observable of the updated HoldingGroup
   */
  updateHolding(groupId: string, symbol: string, holding: Partial<Holding>): Observable<HoldingGroup> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.put<HoldingGroup>(`${this.endpoint}/${groupId}/holdings/${symbol}`, holding).pipe(
      tap({
        next: (updatedHoldingGroup) => {
          // Update the holding group in the cache
          this.updateState({
            holdingGroups: this.holdingGroups().map(h => 
              h.id === updatedHoldingGroup.id ? updatedHoldingGroup : h
            ),
            selectedHoldingGroup: this.selectedHoldingGroup()?.id === updatedHoldingGroup.id 
              ? updatedHoldingGroup 
              : this.selectedHoldingGroup(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to update holding in group with ID ${groupId}`);
        }
      })
    );
  }
  
  /**
   * Remove a holding from a holding group
   * @param groupId The holding group ID
   * @param symbol The symbol of the holding to remove
   * @returns An Observable of the updated HoldingGroup
   */
  removeHolding(groupId: string, symbol: string): Observable<HoldingGroup> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.delete<HoldingGroup>(`${this.endpoint}/${groupId}/holdings/${symbol}`).pipe(
      tap({
        next: (updatedHoldingGroup) => {
          // Update the holding group in the cache
          this.updateState({
            holdingGroups: this.holdingGroups().map(h => 
              h.id === updatedHoldingGroup.id ? updatedHoldingGroup : h
            ),
            selectedHoldingGroup: this.selectedHoldingGroup()?.id === updatedHoldingGroup.id 
              ? updatedHoldingGroup 
              : this.selectedHoldingGroup(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to remove holding from group with ID ${groupId}`);
        }
      })
    );
  }
}