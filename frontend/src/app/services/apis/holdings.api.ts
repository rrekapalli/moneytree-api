import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Holding } from '../entities/holding';
import { HoldingGroup } from '../entities/holding-group';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class HoldingsService {
  private readonly endpoint = '/holdings';
  private readonly groupsEndpoint = '/holding-groups';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all holdings
   * @returns An Observable of Holding array
   */
  getHoldings(): Observable<Holding[]> {
    return this.apiService.get<Holding[]>(this.endpoint);
  }

  /**
   * Get a specific holding by ID
   * @param id The holding ID
   * @returns An Observable of Holding
   */
  getHoldingById(id: string): Observable<Holding> {
    return this.apiService.get<Holding>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new holding
   * @param holding The holding to create
   * @returns An Observable of the created Holding
   */
  createHolding(holding: Omit<Holding, 'id'>): Observable<Holding> {
    return this.apiService.post<Holding>(this.endpoint, holding);
  }

  /**
   * Update an existing holding
   * @param id The holding ID
   * @param holding The updated holding data
   * @returns An Observable of the updated Holding
   */
  updateHolding(id: string, holding: Partial<Holding>): Observable<Holding> {
    return this.apiService.put<Holding>(`${this.endpoint}/${id}`, holding);
  }

  /**
   * Delete a holding
   * @param id The holding ID
   * @returns An Observable of the operation result
   */
  deleteHolding(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get all holding groups
   * @returns An Observable of HoldingGroup array
   */
  getHoldingGroups(): Observable<HoldingGroup[]> {
    return this.apiService.get<HoldingGroup[]>(this.groupsEndpoint);
  }

  /**
   * Get a specific holding group by ID
   * @param id The holding group ID
   * @returns An Observable of HoldingGroup
   */
  getHoldingGroupById(id: string): Observable<HoldingGroup> {
    return this.apiService.get<HoldingGroup>(`${this.groupsEndpoint}/${id}`);
  }

  /**
   * Create a new holding group
   * @param group The holding group to create
   * @returns An Observable of the created HoldingGroup
   */
  createHoldingGroup(group: Omit<HoldingGroup, 'id'>): Observable<HoldingGroup> {
    return this.apiService.post<HoldingGroup>(this.groupsEndpoint, group);
  }

  /**
   * Update an existing holding group
   * @param id The holding group ID
   * @param group The updated holding group data
   * @returns An Observable of the updated HoldingGroup
   */
  updateHoldingGroup(id: string, group: Partial<HoldingGroup>): Observable<HoldingGroup> {
    return this.apiService.put<HoldingGroup>(`${this.groupsEndpoint}/${id}`, group);
  }

  /**
   * Delete a holding group
   * @param id The holding group ID
   * @returns An Observable of the operation result
   */
  deleteHoldingGroup(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.groupsEndpoint}/${id}`);
  }

  /**
   * Get all holdings in a group
   * @param groupId The holding group ID
   * @returns An Observable of Holding array
   */
  getHoldingsByGroup(groupId: string): Observable<Holding[]> {
    return this.apiService.get<Holding[]>(`${this.groupsEndpoint}/${groupId}/holdings`);
  }

  /**
   * Add a holding to a group
   * @param groupId The holding group ID
   * @param holdingId The holding ID
   * @returns An Observable of the operation result
   */
  addHoldingToGroup(groupId: string, holdingId: string): Observable<void> {
    return this.apiService.post<void>(`${this.groupsEndpoint}/${groupId}/holdings/${holdingId}`, {});
  }

  /**
   * Remove a holding from a group
   * @param groupId The holding group ID
   * @param holdingId The holding ID
   * @returns An Observable of the operation result
   */
  removeHoldingFromGroup(groupId: string, holdingId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.groupsEndpoint}/${groupId}/holdings/${holdingId}`);
  }
}