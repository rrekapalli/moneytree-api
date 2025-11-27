import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap, throwError } from 'rxjs';
import { ScreenerApiService } from '../apis/screener.api';
import { QueryConverterService } from 'querybuilder';
import {
  ScreenerResp,
  ScreenerVersionResp,
  RunResp,
  ResultResp,
  PageResp,
  ScreenerListParams,
  RunListParams,
  ResultListParams
} from '../entities/screener.entities';

export interface ScreenerState {
  screeners: ScreenerResp[];
  myScreeners: ScreenerResp[];
  publicScreeners: ScreenerResp[];
  starredScreeners: ScreenerResp[];
  currentScreener: ScreenerResp | null;
  screenerVersions: ScreenerVersionResp[];
  screenerRuns: RunResp[];
  currentRun: RunResp | null;
  runResults: ResultResp[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

const initialState: ScreenerState = {
  screeners: [],
  myScreeners: [],
  publicScreeners: [],
  starredScreeners: [],
  currentScreener: null,
  screenerVersions: [],
  screenerRuns: [],
  currentRun: null,
  runResults: [],
  loading: false,
  error: null,
  pagination: {
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0
  }
};

@Injectable({
  providedIn: 'root'
})
export class ScreenerStateService {
  private stateSubject$ = new BehaviorSubject<ScreenerState>(initialState);

  constructor(
    private screenerApi: ScreenerApiService,
    private queryConverter: QueryConverterService
  ) {}

  // State selectors
  get state$(): Observable<ScreenerState> {
    return this.stateSubject$.asObservable();
  }

  get screeners$(): Observable<ScreenerResp[]> {
    return this.state$.pipe(map(state => state.screeners));
  }

  get myScreeners$(): Observable<ScreenerResp[]> {
    return this.state$.pipe(map(state => state.myScreeners));
  }

  get publicScreeners$(): Observable<ScreenerResp[]> {
    return this.state$.pipe(map(state => state.publicScreeners));
  }

  get starredScreeners$(): Observable<ScreenerResp[]> {
    return this.state$.pipe(map(state => state.starredScreeners));
  }

  get currentScreener$(): Observable<ScreenerResp | null> {
    return this.state$.pipe(map(state => state.currentScreener));
  }

  get screenerVersions$(): Observable<ScreenerVersionResp[]> {
    return this.state$.pipe(map(state => state.screenerVersions));
  }

  get screenerRuns$(): Observable<RunResp[]> {
    return this.state$.pipe(map(state => state.screenerRuns));
  }

  get currentRun$(): Observable<RunResp | null> {
    return this.state$.pipe(map(state => state.currentRun));
  }

  get runResults$(): Observable<ResultResp[]> {
    return this.state$.pipe(map(state => state.runResults));
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.loading));
  }

  get error$(): Observable<string | null> {
    return this.state$.pipe(map(state => state.error));
  }

  get pagination$(): Observable<any> {
    return this.state$.pipe(map(state => state.pagination));
  }

  // State actions
  private updateState(updates: Partial<ScreenerState>): void {
    const currentState = this.stateSubject$.value;
    this.stateSubject$.next({ ...currentState, ...updates });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setCurrentScreener(screener: ScreenerResp | null): void {
    this.updateState({ currentScreener: screener });
  }

  setCurrentRun(run: RunResp | null): void {
    this.updateState({ currentRun: run });
  }

  // API actions
  loadScreeners(params: ScreenerListParams = {}): Observable<PageResp<ScreenerResp>> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.listScreeners(params).pipe(
      tap(response => {
        this.updateState({
          screeners: response.content,
          pagination: {
            page: response.page,
            size: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages
          },
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load screeners');
          this.setLoading(false);
        }
      })
    );
  }

  loadMyScreeners(): Observable<ScreenerResp[]> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.listMyScreeners().pipe(
      tap(screeners => {
        this.updateState({
          myScreeners: screeners,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load my screeners');
          this.setLoading(false);
        }
      })
    );
  }

  loadPublicScreeners(): Observable<ScreenerResp[]> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.listPublicScreeners().pipe(
      tap(screeners => {
        this.updateState({
          publicScreeners: screeners,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load public screeners');
          this.setLoading(false);
        }
      })
    );
  }

  loadStarredScreeners(): Observable<ScreenerResp[]> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.getStarredScreeners().pipe(
      tap(screeners => {
        this.updateState({
          starredScreeners: screeners,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load starred screeners');
          this.setLoading(false);
        }
      })
    );
  }

  loadScreener(id: number): Observable<ScreenerResp> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.getScreener(id).pipe(
      tap(screener => {
        this.setCurrentScreener(screener);
        this.setLoading(false);
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load screener');
          this.setLoading(false);
        }
      })
    );
  }

  createScreener(request: any): Observable<ScreenerResp> {
    // Validate criteria before API call
    const validationResult = this.validateScreenerRequest(request);
    if (!validationResult.isValid) {
      this.setError(`Validation failed: ${validationResult.errors.join(', ')}`);
      return throwError(() => new Error(validationResult.errors.join(', ')));
    }

    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.createScreener(request).pipe(
      tap(screener => {
        const currentState = this.stateSubject$.value;
        this.updateState({
          screeners: [screener, ...currentState.screeners],
          myScreeners: [screener, ...currentState.myScreeners],
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to create screener');
          this.setLoading(false);
        }
      })
    );
  }

  updateScreener(id: number, request: any): Observable<ScreenerResp> {
    // Validate criteria before API call
    const validationResult = this.validateScreenerRequest(request);
    if (!validationResult.isValid) {
      this.setError(`Validation failed: ${validationResult.errors.join(', ')}`);
      return throwError(() => new Error(validationResult.errors.join(', ')));
    }

    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.updateScreener(id, request).pipe(
      tap(updatedScreener => {
        const currentState = this.stateSubject$.value;
        const updateInArray = (arr: ScreenerResp[]) => 
          arr.map((s: ScreenerResp) => s.screenerId === id ? updatedScreener : s);

        this.updateState({
          screeners: updateInArray(currentState.screeners),
          myScreeners: updateInArray(currentState.myScreeners),
          publicScreeners: updateInArray(currentState.publicScreeners),
          starredScreeners: updateInArray(currentState.starredScreeners),
          currentScreener: currentState.currentScreener?.screenerId === id ? updatedScreener : currentState.currentScreener,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to update screener');
          this.setLoading(false);
        }
      })
    );
  }

  deleteScreener(id: number): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.deleteScreener(id).pipe(
      tap(() => {
        const currentState = this.stateSubject$.value;
        const removeFromArray = (arr: ScreenerResp[]) => 
          arr.filter((s: ScreenerResp) => s.screenerId !== id);

        this.updateState({
          screeners: removeFromArray(currentState.screeners),
          myScreeners: removeFromArray(currentState.myScreeners),
          publicScreeners: removeFromArray(currentState.publicScreeners),
          starredScreeners: removeFromArray(currentState.starredScreeners),
          currentScreener: currentState.currentScreener?.screenerId === id ? null : currentState.currentScreener,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to delete screener');
          this.setLoading(false);
        }
      })
    );
  }

  loadScreenerVersions(screenerId: number): Observable<ScreenerVersionResp[]> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.listVersions(screenerId).pipe(
      tap(versions => {
        this.updateState({
          screenerVersions: versions,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load screener versions');
          this.setLoading(false);
        }
      })
    );
  }

  loadScreenerRuns(screenerId: number, params: RunListParams = {}): Observable<PageResp<RunResp>> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.listRuns(screenerId, params).pipe(
      tap(response => {
        this.updateState({
          screenerRuns: response.content,
          pagination: {
            page: response.page,
            size: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages
          },
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load screener runs');
          this.setLoading(false);
        }
      })
    );
  }

  loadRunResults(runId: number, params: ResultListParams = {}): Observable<PageResp<ResultResp>> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.getRunResults(runId, params).pipe(
      tap(response => {
        this.updateState({
          runResults: response.content,
          pagination: {
            page: response.page,
            size: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages
          },
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to load run results');
          this.setLoading(false);
        }
      })
    );
  }

  toggleStar(screenerId: number, starred: boolean): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    return this.screenerApi.toggleStar(screenerId, { starred }).pipe(
      tap(() => {
        const currentState = this.stateSubject$.value;
        let updatedStarredScreeners = [...currentState.starredScreeners];

        if (starred) {
          // Add to starred if not already present
          const screener = currentState.screeners.find((s: ScreenerResp) => s.screenerId === screenerId);
          if (screener && !updatedStarredScreeners.find((s: ScreenerResp) => s.screenerId === screenerId)) {
            updatedStarredScreeners.push(screener);
          }
        } else {
          // Remove from starred
          updatedStarredScreeners = updatedStarredScreeners.filter((s: ScreenerResp) => s.screenerId !== screenerId);
        }

        this.updateState({
          starredScreeners: updatedStarredScreeners,
          loading: false
        });
      }),
      tap({
        error: (error) => {
          this.setError('Failed to toggle star');
          this.setLoading(false);
        }
      })
    );
  }

  // Validation methods
  private validateScreenerRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!request.name || typeof request.name !== 'string' || !request.name.trim()) {
      errors.push('Screener name is required');
    }

    // Validate criteria if present
    if (request.criteria) {
      try {
        // Convert to RuleSet first to validate structure
        const conversionResult = this.queryConverter.convertScreenerCriteriaToQuery(request.criteria);
        if (!conversionResult.success) {
          errors.push(...(conversionResult.errors?.map(e => e.message) || ['Invalid criteria structure']));
        } else if (conversionResult.data) {
          // Validate API compatibility
          const apiErrors = this.queryConverter.validateApiCompatibility(conversionResult.data);
          if (apiErrors.length > 0) {
            errors.push(...apiErrors.map(e => e.message));
          }
        }
      } catch (error) {
        errors.push(`Criteria validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Reset state
  reset(): void {
    this.stateSubject$.next(initialState);
  }
}
