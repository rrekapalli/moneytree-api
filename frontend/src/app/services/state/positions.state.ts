import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../apis/api.base';
import { Position } from '../entities/position';
import { PositionsSummary } from '../entities/positions-summary';

/**
 * Interface for the positions state
 */
interface PositionsState {
  positions: Position[];
  positionsSummary: PositionsSummary | null;
  selectedPosition: Position | null;
  loading: boolean;
  error: string | null;
  lastUpdated: {
    positions: Date | null;
    positionsSummary: Date | null;
  };
}

/**
 * Initial state for the positions
 */
const initialState: PositionsState = {
  positions: [],
  positionsSummary: null,
  selectedPosition: null,
  loading: false,
  error: null,
  lastUpdated: {
    positions: null,
    positionsSummary: null
  }
};

@Injectable({
  providedIn: 'root'
})
export class PositionsStateService {
  private readonly endpoint = '/positions';
  
  // State signal
  private state = signal<PositionsState>(initialState);
  
  // Public readable signals
  public positions = computed(() => this.state().positions);
  public positionsSummary = computed(() => this.state().positionsSummary);
  public selectedPosition = computed(() => this.state().selectedPosition);
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
  private updateState(newState: Partial<PositionsState>): void {
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
   * Updates the last updated timestamp for a specific data type
   * @param dataType The type of data being updated
   */
  private updateTimestamp(dataType: keyof PositionsState['lastUpdated']): void {
    this.state.update(state => ({
      ...state,
      lastUpdated: {
        ...state.lastUpdated,
        [dataType]: new Date()
      }
    }));
  }
  
  /**
   * Get all positions
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Position array
   */
  getPositions(force: boolean = false): Observable<Position[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.positions().length > 0 && this.lastUpdated().positions) {
      const cacheAge = new Date().getTime() - this.lastUpdated().positions!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<Position[]>(observer => {
          observer.next(this.positions());
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<Position[]>(this.endpoint).pipe(
      tap({
        next: (positions) => {
          this.updateState({ 
            positions,
            loading: false
          });
          this.updateTimestamp('positions');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load positions');
        }
      })
    );
  }
  
  /**
   * Get a specific position by ID
   * @param id The position ID
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Position
   */
  getPositionById(id: string, force: boolean = false): Observable<Position> {
    // If not forcing and we have the position in cache, return it
    if (!force && this.lastUpdated().positions) {
      const cachedPosition = this.positions().find(p => p.id === id);
      if (cachedPosition) {
        this.updateState({ selectedPosition: cachedPosition });
        return new Observable<Position>(observer => {
          observer.next(cachedPosition);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<Position>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: (position) => {
          this.updateState({ 
            selectedPosition: position,
            loading: false
          });
          
          // Update the position in the cache if it exists
          this.updateState({
            positions: this.positions().map(p => 
              p.id === position.id ? position : p
            )
          });
          
          this.updateTimestamp('positions');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to load position with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Create a new position
   * @param position The position to create
   * @returns An Observable of the created Position
   */
  createPosition(position: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'pnlPercentage'>): Observable<Position> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.post<Position>(this.endpoint, position).pipe(
      tap({
        next: (newPosition) => {
          this.updateState({ 
            positions: [...this.positions(), newPosition],
            selectedPosition: newPosition,
            loading: false
          });
          this.updateTimestamp('positions');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to create position');
        }
      })
    );
  }
  
  /**
   * Update an existing position
   * @param id The position ID
   * @param position The updated position data
   * @returns An Observable of the updated Position
   */
  updatePosition(id: string, position: Partial<Position>): Observable<Position> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.put<Position>(`${this.endpoint}/${id}`, position).pipe(
      tap({
        next: (updatedPosition) => {
          // Update the position in the cache
          this.updateState({
            positions: this.positions().map(p => 
              p.id === updatedPosition.id ? updatedPosition : p
            ),
            selectedPosition: this.selectedPosition()?.id === updatedPosition.id 
              ? updatedPosition 
              : this.selectedPosition(),
            loading: false
          });
          this.updateTimestamp('positions');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to update position with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Delete a position
   * @param id The position ID
   * @returns An Observable of the operation result
   */
  deletePosition(id: string): Observable<void> {
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: () => {
          // Remove the position from the cache
          this.updateState({
            positions: this.positions().filter(p => p.id !== id),
            selectedPosition: this.selectedPosition()?.id === id 
              ? null 
              : this.selectedPosition(),
            loading: false
          });
          this.updateTimestamp('positions');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to delete position with ID ${id}`);
        }
      })
    );
  }
  
  /**
   * Get positions summary (total P&L, etc.)
   * @param force Whether to force an API call or use cache
   * @returns An Observable of the positions summary
   */
  getPositionsSummary(force: boolean = false): Observable<PositionsSummary> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.positionsSummary() && this.lastUpdated().positionsSummary) {
      const cacheAge = new Date().getTime() - this.lastUpdated().positionsSummary!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<PositionsSummary>(observer => {
          observer.next(this.positionsSummary()!);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<PositionsSummary>(`${this.endpoint}/summary`).pipe(
      tap({
        next: (positionsSummary) => {
          this.updateState({ 
            positionsSummary,
            loading: false
          });
          this.updateTimestamp('positionsSummary');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load positions summary');
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