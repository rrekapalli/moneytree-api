import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import {
  ScreenerCreateReq,
  ScreenerResp,
  ScreenerVersionCreateReq,
  ScreenerVersionResp,
  ParamsetCreateReq,
  ParamsetResp,
  ScheduleCreateReq,
  ScheduleResp,
  AlertCreateReq,
  AlertResp,
  RunCreateReq,
  RunResp,
  ResultResp,
  ResultDiffResp,
  StarToggleReq,
  SavedViewCreateReq,
  SavedViewResp,
  PageResp,
  Symbol,
  ScreenerListParams,
  RunListParams,
  ResultListParams
} from '../entities/screener.entities';

@Injectable({
  providedIn: 'root'
})
export class ScreenerApiService {

  constructor(private apiService: ApiService) {}

  // Screener CRUD operations
  createScreener(request: ScreenerCreateReq): Observable<ScreenerResp> {
    return this.apiService.post<ScreenerResp>('/screeners', request);
  }

  getScreener(id: string): Observable<ScreenerResp> {
    return this.apiService.get<ScreenerResp>(`/screeners/${id}`);
  }

  updateScreener(id: string, request: ScreenerCreateReq): Observable<ScreenerResp> {
    return this.apiService.patch<ScreenerResp>(`/screeners/${id}`, request);
  }

  deleteScreener(id: string): Observable<void> {
    return this.apiService.delete<void>(`/screeners/${id}`);
  }

  listScreeners(params: ScreenerListParams = {}): Observable<PageResp<ScreenerResp>> {
    let httpParams = new HttpParams();
    
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ScreenerResp>>('/screeners', httpParams);
  }

  listMyScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/screeners/my');
  }

  listPublicScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/screeners/public');
  }

  // Screener Versions
  createVersion(screenerId: string, request: ScreenerVersionCreateReq): Observable<ScreenerVersionResp> {
    return this.apiService.post<ScreenerVersionResp>(`/screeners/${screenerId}/versions`, request);
  }

  listVersions(screenerId: string): Observable<ScreenerVersionResp[]> {
    return this.apiService.get<ScreenerVersionResp[]>(`/screeners/${screenerId}/versions`);
  }

  getVersion(versionId: string): Observable<ScreenerVersionResp> {
    return this.apiService.get<ScreenerVersionResp>(`/versions/${versionId}`);
  }

  updateVersion(versionId: string, request: Partial<ScreenerVersionCreateReq>): Observable<ScreenerVersionResp> {
    return this.apiService.patch<ScreenerVersionResp>(`/versions/${versionId}`, request);
  }

  // Paramsets
  createParamset(versionId: string, request: ParamsetCreateReq): Observable<ParamsetResp> {
    return this.apiService.post<ParamsetResp>(`/versions/${versionId}/paramsets`, request);
  }

  listParamsets(versionId: string): Observable<ParamsetResp[]> {
    return this.apiService.get<ParamsetResp[]>(`/versions/${versionId}/paramsets`);
  }

  deleteParamset(paramsetId: string): Observable<void> {
    return this.apiService.delete<void>(`/paramsets/${paramsetId}`);
  }

  // Schedules
  createSchedule(screenerId: string, request: ScheduleCreateReq): Observable<ScheduleResp> {
    return this.apiService.post<ScheduleResp>(`/screeners/${screenerId}/schedules`, request);
  }

  listSchedules(screenerId: string): Observable<ScheduleResp[]> {
    return this.apiService.get<ScheduleResp[]>(`/screeners/${screenerId}/schedules`);
  }

  updateSchedule(scheduleId: number, request: Partial<ScheduleCreateReq>): Observable<ScheduleResp> {
    return this.apiService.patch<ScheduleResp>(`/schedules/${scheduleId}`, request);
  }

  deleteSchedule(scheduleId: number): Observable<void> {
    return this.apiService.delete<void>(`/schedules/${scheduleId}`);
  }

  // Alerts
  createAlert(screenerId: string, request: AlertCreateReq): Observable<AlertResp> {
    return this.apiService.post<AlertResp>(`/screeners/${screenerId}/alerts`, request);
  }

  listAlerts(screenerId: string): Observable<AlertResp[]> {
    return this.apiService.get<AlertResp[]>(`/screeners/${screenerId}/alerts`);
  }

  updateAlert(alertId: number, request: Partial<AlertCreateReq>): Observable<AlertResp> {
    return this.apiService.patch<AlertResp>(`/alerts/${alertId}`, request);
  }

  deleteAlert(alertId: number): Observable<void> {
    return this.apiService.delete<void>(`/alerts/${alertId}`);
  }

  // Runs
  createRun(screenerId: string, request: RunCreateReq): Observable<RunResp> {
    return this.apiService.post<RunResp>(`/screeners/${screenerId}/runs`, request);
  }

  listRuns(screenerId: string, params: RunListParams = {}): Observable<PageResp<RunResp>> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.apiService.get<PageResp<RunResp>>(`/screeners/${screenerId}/runs`, httpParams);
  }

  getRun(runId: string): Observable<RunResp> {
    return this.apiService.get<RunResp>(`/runs/${runId}`);
  }

  retryRun(runId: string): Observable<RunResp> {
    return this.apiService.post<RunResp>(`/runs/${runId}/retry`, {});
  }

  getLatestSuccessfulRun(screenerId: string): Observable<RunResp> {
    return this.apiService.get<RunResp>(`/screeners/${screenerId}/last-run`);
  }

  getRunsByStatus(status: string): Observable<RunResp[]> {
    return this.apiService.get<RunResp[]>(`/runs/status/${status}`);
  }

  getRunsByUser(userId: number): Observable<RunResp[]> {
    return this.apiService.get<RunResp[]>(`/runs/user/${userId}`);
  }

  // Results
  getRunResults(runId: string, params: ResultListParams = {}): Observable<PageResp<ResultResp>> {
    let httpParams = new HttpParams();
    
    if (params.matched !== undefined) httpParams = httpParams.set('matched', params.matched.toString());
    if (params.minScore !== undefined) httpParams = httpParams.set('minScore', params.minScore.toString());
    if (params.symbolId !== undefined) httpParams = httpParams.set('symbolId', params.symbolId.toString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ResultResp>>(`/runs/${runId}/results`, httpParams);
  }

  getRunDiffs(runId: string): Observable<ResultDiffResp[]> {
    return this.apiService.get<ResultDiffResp[]>(`/runs/${runId}/diffs`);
  }

  getLastResults(screenerId: string, params: ResultListParams = {}): Observable<PageResp<ResultResp>> {
    let httpParams = new HttpParams();
    
    if (params.matched !== undefined) httpParams = httpParams.set('matched', params.matched.toString());
    if (params.minScore !== undefined) httpParams = httpParams.set('minScore', params.minScore.toString());
    if (params.symbolId !== undefined) httpParams = httpParams.set('symbolId', params.symbolId.toString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ResultResp>>(`/screeners/${screenerId}/last-results`, httpParams);
  }

  // Stars
  toggleStar(screenerId: string, request: StarToggleReq): Observable<void> {
    return this.apiService.put<void>(`/screeners/${screenerId}/star`, request);
  }

  getStarredScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/screeners/starred');
  }

  // Saved Views
  createSavedView(screenerId: string, request: SavedViewCreateReq): Observable<SavedViewResp> {
    return this.apiService.post<SavedViewResp>(`/screeners/${screenerId}/saved-views`, request);
  }

  listSavedViews(screenerId: string): Observable<SavedViewResp[]> {
    return this.apiService.get<SavedViewResp[]>(`/screeners/${screenerId}/saved-views`);
  }

  updateSavedView(savedViewId: number, request: Partial<SavedViewCreateReq>): Observable<SavedViewResp> {
    return this.apiService.patch<SavedViewResp>(`/saved-views/${savedViewId}`, request);
  }

  deleteSavedView(savedViewId: number): Observable<void> {
    return this.apiService.delete<void>(`/saved-views/${savedViewId}`);
  }

  // Utility
  searchSymbols(query: string): Observable<Symbol[]> {
    const params = new HttpParams().set('q', query);
    return this.apiService.get<Symbol[]>('/symbols', params);
  }
}
