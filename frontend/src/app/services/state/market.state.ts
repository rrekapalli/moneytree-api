import { Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../apis/api.base';
import { MockApiService } from '../apis/mock-api.service';
import { MarketData } from '../entities/market-data';
import { MarketSummary } from '../entities/market-summary';
import { environment } from '../../../environments/environment';

/**
 * Interface for the market state
 */
interface MarketState {
  marketSummary: MarketSummary[] | null;
  topGainers: MarketData[] | null;
  topLosers: MarketData[] | null;
  mostActive: MarketData[] | null;
  searchResults: MarketData[] | null;
  stockDetails: Record<string, MarketData>; // Map of symbol to stock details
  loading: boolean;
  error: string | null;
  lastUpdated: {
    marketSummary: Date | null;
    topGainers: Date | null;
    topLosers: Date | null;
    mostActive: Date | null;
    searchResults: Date | null;
    stockDetails: Record<string, Date | null>; // Map of symbol to last updated timestamp
  };
}

/**
 * Initial state for the market
 */
const initialState: MarketState = {
  marketSummary: null,
  topGainers: null,
  topLosers: null,
  mostActive: null,
  searchResults: null,
  stockDetails: {},
  loading: false,
  error: null,
  lastUpdated: {
    marketSummary: null,
    topGainers: null,
    topLosers: null,
    mostActive: null,
    searchResults: null,
    stockDetails: {}
  }
};

@Injectable({
  providedIn: 'root'
})
export class MarketStateService {
  private readonly endpoint = '/market';
  
  // State signal
  private state = signal<MarketState>(initialState);
  
  // Public readable signals
  public marketSummary = computed(() => this.state().marketSummary);
  public topGainers = computed(() => this.state().topGainers);
  public topLosers = computed(() => this.state().topLosers);
  public mostActive = computed(() => this.state().mostActive);
  public searchResults = computed(() => this.state().searchResults);
  public stockDetails = computed(() => this.state().stockDetails);
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
  private updateState(newState: Partial<MarketState>): void {
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
   * @param symbol Optional symbol for stock details
   */
  private updateTimestamp(dataType: keyof Omit<MarketState['lastUpdated'], 'stockDetails'> | 'stockDetails', symbol?: string): void {
    if (dataType === 'stockDetails' && symbol) {
      this.state.update(state => ({
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          stockDetails: {
            ...state.lastUpdated.stockDetails,
            [symbol]: new Date()
          }
        }
      }));
    } else if (dataType !== 'stockDetails') {
      this.state.update(state => ({
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          [dataType]: new Date()
        }
      }));
    }
  }
  
  /**
   * Get market summary data (indices)
   * @param force Whether to force an API call or use cache
   * @returns An Observable of MarketSummary array
   */
  getMarketSummary(force: boolean = false): Observable<MarketSummary[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.marketSummary() && this.lastUpdated().marketSummary) {
      const cacheAge = new Date().getTime() - this.lastUpdated().marketSummary!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<MarketSummary[]>(observer => {
          observer.next(this.marketSummary()!);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<MarketSummary[]>(`${this.endpoint}/summary`).pipe(
      tap({
        next: (marketSummary) => {
          this.updateState({ 
            marketSummary,
            loading: false
          });
          this.updateTimestamp('marketSummary');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load market summary');
        }
      })
    );
  }
  
  /**
   * Get top gainers in the market
   * @param limit Optional limit on the number of results
   * @param force Whether to force an API call or use cache
   * @returns An Observable of MarketData array
   */
  getTopGainers(limit: number = 10, force: boolean = false): Observable<MarketData[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.topGainers() && this.lastUpdated().topGainers) {
      const cacheAge = new Date().getTime() - this.lastUpdated().topGainers!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<MarketData[]>(observer => {
          observer.next(this.topGainers()!);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/gainers`, params).pipe(
      tap({
        next: (topGainers) => {
          this.updateState({ 
            topGainers,
            loading: false
          });
          this.updateTimestamp('topGainers');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load top gainers');
        }
      })
    );
  }
  
  /**
   * Get top losers in the market
   * @param limit Optional limit on the number of results
   * @param force Whether to force an API call or use cache
   * @returns An Observable of MarketData array
   */
  getTopLosers(limit: number = 10, force: boolean = false): Observable<MarketData[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.topLosers() && this.lastUpdated().topLosers) {
      const cacheAge = new Date().getTime() - this.lastUpdated().topLosers!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<MarketData[]>(observer => {
          observer.next(this.topLosers()!);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/losers`, params).pipe(
      tap({
        next: (topLosers) => {
          this.updateState({ 
            topLosers,
            loading: false
          });
          this.updateTimestamp('topLosers');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load top losers');
        }
      })
    );
  }
  
  /**
   * Get most active stocks in the market
   * @param limit Optional limit on the number of results
   * @param force Whether to force an API call or use cache
   * @returns An Observable of MarketData array
   */
  getMostActive(limit: number = 10, force: boolean = false): Observable<MarketData[]> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.mostActive() && this.lastUpdated().mostActive) {
      const cacheAge = new Date().getTime() - this.lastUpdated().mostActive!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<MarketData[]>(observer => {
          observer.next(this.mostActive()!);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/active`, params).pipe(
      tap({
        next: (mostActive) => {
          this.updateState({ 
            mostActive,
            loading: false
          });
          this.updateTimestamp('mostActive');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load most active stocks');
        }
      })
    );
  }
  
  /**
   * Search for stocks by symbol or name
   * @param query The search query
   * @returns An Observable of MarketData array
   */
  searchStocks(query: string): Observable<MarketData[]> {
    this.setLoading(true);
    this.setError(null);
    
    const params = new HttpParams().set('q', query);
    return this.apiService.get<MarketData[]>(`${this.endpoint}/search`, params).pipe(
      tap({
        next: (searchResults) => {
          this.updateState({ 
            searchResults,
            loading: false
          });
          this.updateTimestamp('searchResults');
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to search stocks');
        }
      })
    );
  }
  
  /**
   * Get detailed data for a specific stock
   * @param symbol The stock symbol
   * @param force Whether to force an API call or use cache
   * @returns An Observable of MarketData
   */
  getStockDetails(symbol: string, force: boolean = false): Observable<MarketData> {
    // If not forcing and we have cached data that's not too old, return the cached data
    if (!force && this.stockDetails()[symbol] && this.lastUpdated().stockDetails[symbol]) {
      const cacheAge = new Date().getTime() - this.lastUpdated().stockDetails[symbol]!.getTime();
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        return new Observable<MarketData>(observer => {
          observer.next(this.stockDetails()[symbol]);
          observer.complete();
        });
      }
    }
    
    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);
    
    return this.apiService.get<MarketData>(`${this.endpoint}/stocks/${symbol}`).pipe(
      tap({
        next: (stockDetail) => {
          this.state.update(state => ({
            ...state,
            stockDetails: {
              ...state.stockDetails,
              [symbol]: stockDetail
            },
            loading: false
          }));
          this.updateTimestamp('stockDetails', symbol);
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to load details for stock ${symbol}`);
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