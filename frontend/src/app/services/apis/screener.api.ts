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
    return this.apiService.post<ScreenerResp>('/api/screeners', request);
  }

  getScreener(id: number): Observable<ScreenerResp> {
    return this.apiService.get<ScreenerResp>(`/api/screeners/${id}`);
  }

  updateScreener(id: number, request: ScreenerCreateReq): Observable<ScreenerResp> {
    return this.apiService.patch<ScreenerResp>(`/api/screeners/${id}`, request);
  }

  deleteScreener(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/screeners/${id}`);
  }

  listScreeners(params: ScreenerListParams = {}): Observable<PageResp<ScreenerResp>> {
    let httpParams = new HttpParams();
    
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ScreenerResp>>('/api/screeners', httpParams);
  }

  listMyScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/api/screeners/my');
  }

  listPublicScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/api/screeners/public');
  }

  // Screener Versions
  createVersion(screenerId: number, request: ScreenerVersionCreateReq): Observable<ScreenerVersionResp> {
    return this.apiService.post<ScreenerVersionResp>(`/api/screeners/${screenerId}/versions`, request);
  }

  listVersions(screenerId: number): Observable<ScreenerVersionResp[]> {
    return this.apiService.get<ScreenerVersionResp[]>(`/api/screeners/${screenerId}/versions`);
  }

  getVersion(versionId: number): Observable<ScreenerVersionResp> {
    return this.apiService.get<ScreenerVersionResp>(`/api/versions/${versionId}`);
  }

  updateVersion(versionId: number, request: Partial<ScreenerVersionCreateReq>): Observable<ScreenerVersionResp> {
    return this.apiService.patch<ScreenerVersionResp>(`/api/versions/${versionId}`, request);
  }

  // Paramsets
  createParamset(versionId: number, request: ParamsetCreateReq): Observable<ParamsetResp> {
    return this.apiService.post<ParamsetResp>(`/api/versions/${versionId}/paramsets`, request);
  }

  listParamsets(versionId: number): Observable<ParamsetResp[]> {
    return this.apiService.get<ParamsetResp[]>(`/api/versions/${versionId}/paramsets`);
  }

  deleteParamset(paramsetId: number): Observable<void> {
    return this.apiService.delete<void>(`/api/paramsets/${paramsetId}`);
  }

  // Schedules
  createSchedule(screenerId: number, request: ScheduleCreateReq): Observable<ScheduleResp> {
    return this.apiService.post<ScheduleResp>(`/api/screeners/${screenerId}/schedules`, request);
  }

  listSchedules(screenerId: number): Observable<ScheduleResp[]> {
    return this.apiService.get<ScheduleResp[]>(`/api/screeners/${screenerId}/schedules`);
  }

  updateSchedule(scheduleId: number, request: Partial<ScheduleCreateReq>): Observable<ScheduleResp> {
    return this.apiService.patch<ScheduleResp>(`/api/schedules/${scheduleId}`, request);
  }

  deleteSchedule(scheduleId: number): Observable<void> {
    return this.apiService.delete<void>(`/api/schedules/${scheduleId}`);
  }

  // Alerts
  createAlert(screenerId: number, request: AlertCreateReq): Observable<AlertResp> {
    return this.apiService.post<AlertResp>(`/api/screeners/${screenerId}/alerts`, request);
  }

  listAlerts(screenerId: number): Observable<AlertResp[]> {
    return this.apiService.get<AlertResp[]>(`/api/screeners/${screenerId}/alerts`);
  }

  updateAlert(alertId: number, request: Partial<AlertCreateReq>): Observable<AlertResp> {
    return this.apiService.patch<AlertResp>(`/api/alerts/${alertId}`, request);
  }

  deleteAlert(alertId: number): Observable<void> {
    return this.apiService.delete<void>(`/api/alerts/${alertId}`);
  }

  // Runs
  createRun(screenerId: number, request: RunCreateReq): Observable<RunResp> {
    return this.apiService.post<RunResp>(`/api/screeners/${screenerId}/runs`, request);
  }

  listRuns(screenerId: number, params: RunListParams = {}): Observable<PageResp<RunResp>> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.apiService.get<PageResp<RunResp>>(`/api/screeners/${screenerId}/runs`, httpParams);
  }

  getRun(runId: number): Observable<RunResp> {
    return this.apiService.get<RunResp>(`/api/runs/${runId}`);
  }

  retryRun(runId: number): Observable<RunResp> {
    return this.apiService.post<RunResp>(`/api/runs/${runId}/retry`, {});
  }

  getLatestSuccessfulRun(screenerId: number): Observable<RunResp> {
    return this.apiService.get<RunResp>(`/api/screeners/${screenerId}/last-run`);
  }

  getRunsByStatus(status: string): Observable<RunResp[]> {
    return this.apiService.get<RunResp[]>(`/api/runs/status/${status}`);
  }

  getRunsByUser(userId: number): Observable<RunResp[]> {
    return this.apiService.get<RunResp[]>(`/api/runs/user/${userId}`);
  }

  // Results
  getRunResults(runId: number, params: ResultListParams = {}): Observable<PageResp<ResultResp>> {
    let httpParams = new HttpParams();
    
    if (params.matched !== undefined) httpParams = httpParams.set('matched', params.matched.toString());
    if (params.minScore !== undefined) httpParams = httpParams.set('minScore', params.minScore.toString());
    if (params.symbolId !== undefined) httpParams = httpParams.set('symbolId', params.symbolId.toString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ResultResp>>(`/api/runs/${runId}/results`, httpParams);
  }

  getRunDiffs(runId: number): Observable<ResultDiffResp[]> {
    return this.apiService.get<ResultDiffResp[]>(`/api/runs/${runId}/diffs`);
  }

  getLastResults(screenerId: number, params: ResultListParams = {}): Observable<PageResp<ResultResp>> {
    let httpParams = new HttpParams();
    
    if (params.matched !== undefined) httpParams = httpParams.set('matched', params.matched.toString());
    if (params.minScore !== undefined) httpParams = httpParams.set('minScore', params.minScore.toString());
    if (params.symbolId !== undefined) httpParams = httpParams.set('symbolId', params.symbolId.toString());
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.apiService.get<PageResp<ResultResp>>(`/api/screeners/${screenerId}/last-results`, httpParams);
  }

  // Stars
  toggleStar(screenerId: number, request: StarToggleReq): Observable<void> {
    return this.apiService.put<void>(`/api/screeners/${screenerId}/star`, request);
  }

  getStarredScreeners(): Observable<ScreenerResp[]> {
    return this.apiService.get<ScreenerResp[]>('/api/screeners/starred');
  }

  // Saved Views
  createSavedView(screenerId: number, request: SavedViewCreateReq): Observable<SavedViewResp> {
    return this.apiService.post<SavedViewResp>(`/api/screeners/${screenerId}/saved-views`, request);
  }

  listSavedViews(screenerId: number): Observable<SavedViewResp[]> {
    return this.apiService.get<SavedViewResp[]>(`/api/screeners/${screenerId}/saved-views`);
  }

  updateSavedView(savedViewId: number, request: Partial<SavedViewCreateReq>): Observable<SavedViewResp> {
    return this.apiService.patch<SavedViewResp>(`/api/saved-views/${savedViewId}`, request);
  }

  deleteSavedView(savedViewId: number): Observable<void> {
    return this.apiService.delete<void>(`/api/saved-views/${savedViewId}`);
  }

  // Utility
  searchSymbols(query: string): Observable<Symbol[]> {
    const params = new HttpParams().set('q', query);
    return this.apiService.get<Symbol[]>('/api/symbols', params);
  }
}
