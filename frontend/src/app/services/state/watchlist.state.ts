import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../apis/api.base';
import { MockApiService } from '../apis/mock-api.service';
import { WatchlistItem } from '../entities/watchlist-item';
import { Watchlist } from '../entities/watchlist';
import { environment } from '../../../environments/environment';

/**
 * Interface for the watchlist state
 */
interface WatchlistState {
  watchlists: Watchlist[];
  selectedWatchlist: Watchlist | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Initial state for the watchlist
 */
const initialState: WatchlistState = {
  watchlists: [],
  selectedWatchlist: null,
  loading: false,
  error: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class WatchlistStateService {
  private readonly endpoint = '/watchlists';
  
  // State signal
  private state = signal<WatchlistState>(initialState);
  
  // Public readable signals
  public watchlists = computed(() => this.state().watchlists);
  public selectedWatchlist = computed(() => this.state().selectedWatchlist);
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
   * @param newState Partial state to update
   */
  private updateState(newState: Partial<WatchlistState>): void {
    this.state.update(state => ({
      ...state,
      ...newState
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
   * Get all watchlists
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Watchlist array
   */
  getWatchlists(force: boolean = false): Observable<Watchlist[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.watchlists().length > 0 && this.lastUpdated()) {
      const cacheAge = new Date().getTime() - this.lastUpdated()!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<Watchlist[]>(observer => {
          observer.next(this.watchlists());
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<Watchlist[]>(this.endpoint).pipe(
      tap({
        next: (watchlists) => {
          this.updateState({ 
            watchlists,
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load watchlists');
        }
      })
    );
  }
  
  /**
   * Get a specific watchlist by ID
   * @param id The watchlist ID
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Watchlist
   */
  getWatchlistById(id: string, force: boolean = false): Observable<Watchlist> {
    // If not forcing and we have the watchlist in cache, return it
    if (!force && this.lastUpdated()) {
      const cachedWatchlist = this.watchlists().find(w => w.id === id);
      if (cachedWatchlist) {
        this.updateState({ selectedWatchlist: cachedWatchlist });
        return new Observable<Watchlist>(observer => {
          observer.next(cachedWatchlist);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<Watchlist>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: (watchlist) => {
          this.updateState({ 
            selectedWatchlist: watchlist,
            loading: false
          });
          
          // Update the watchlist in the cache if it exists
          this.updateState({
            watchlists: this.watchlists().map(w => 
              w.id === watchlist.id ? watchlist : w
            )
          });
          
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to load watchlist with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Create a new watchlist
   * @param watchlist The watchlist to create
   * @returns An Observable of the created Watchlist
   */
  createWatchlist(watchlist: Omit<Watchlist, 'id'>): Observable<Watchlist> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.post<Watchlist>(this.endpoint, watchlist).pipe(
      tap({
        next: (newWatchlist) => {
          this.updateState({ 
            watchlists: [...this.watchlists(), newWatchlist],
            selectedWatchlist: newWatchlist,
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to create watchlist');
        }
      })
    );
  }
  
  /**
   * Update an existing watchlist
   * @param id The watchlist ID
   * @param watchlist The updated watchlist data
   * @returns An Observable of the updated Watchlist
   */
  updateWatchlist(id: string, watchlist: Partial<Watchlist>): Observable<Watchlist> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.put<Watchlist>(`${this.endpoint}/${id}`, watchlist).pipe(
      tap({
        next: (updatedWatchlist) => {
          // Update the watchlist in the cache
          this.updateState({
            watchlists: this.watchlists().map(w => 
              w.id === updatedWatchlist.id ? updatedWatchlist : w
            ),
            selectedWatchlist: this.selectedWatchlist()?.id === updatedWatchlist.id 
              ? updatedWatchlist 
              : this.selectedWatchlist(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to update watchlist with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Delete a watchlist
   * @param id The watchlist ID
   * @returns An Observable of the operation result
   */
  deleteWatchlist(id: string): Observable<void> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: () => {
          // Remove the watchlist from the cache
          this.updateState({
            watchlists: this.watchlists().filter(w => w.id !== id),
            selectedWatchlist: this.selectedWatchlist()?.id === id 
              ? null 
              : this.selectedWatchlist(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to delete watchlist with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Add a symbol to a watchlist
   * @param watchlistId The watchlist ID
   * @param symbol The symbol to add
   * @returns An Observable of the updated Watchlist
   */
  addSymbol(watchlistId: string, symbol: string): Observable<Watchlist> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.post<Watchlist>(`${this.endpoint}/${watchlistId}/symbols`, { symbol }).pipe(
      tap({
        next: (updatedWatchlist) => {
          // Update the watchlist in the cache
          this.updateState({
            watchlists: this.watchlists().map(w => 
              w.id === updatedWatchlist.id ? updatedWatchlist : w
            ),
            selectedWatchlist: this.selectedWatchlist()?.id === updatedWatchlist.id 
              ? updatedWatchlist 
              : this.selectedWatchlist(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to add symbol to watchlist with ID ${watchlistId}`);
        }
      })
    );
  }
  
  /**
   * Remove a symbol from a watchlist
   * @param watchlistId The watchlist ID
   * @param symbol The symbol to remove
   * @returns An Observable of the updated Watchlist
   */
  removeSymbol(watchlistId: string, symbol: string): Observable<Watchlist> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.delete<Watchlist>(`${this.endpoint}/${watchlistId}/symbols/${symbol}`).pipe(
      tap({
        next: (updatedWatchlist) => {
          // Update the watchlist in the cache
          this.updateState({
            watchlists: this.watchlists().map(w => 
              w.id === updatedWatchlist.id ? updatedWatchlist : w
            ),
            selectedWatchlist: this.selectedWatchlist()?.id === updatedWatchlist.id 
              ? updatedWatchlist 
              : this.selectedWatchlist(),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to remove symbol from watchlist with ID ${watchlistId}`);
        }
      })
    );
  }
  
  /**
   * Clear the cache and reset the state
   */
  clearCache(): void {
    this.state.set(initialState);
  }
}