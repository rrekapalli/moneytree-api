import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Watchlist } from '../entities/watchlist';
import { WatchlistItem } from '../entities/watchlist-item';
@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly endpoint = '/watchlists';

  constructor(private apiService: ApiService) {}

  /**
   * Get all watchlists
   * @returns An Observable of Watchlist array
   */
  getWatchlists(): Observable<Watchlist[]> {
    return this.apiService.get<Watchlist[]>(this.endpoint);
  }

  /**
   * Get a specific watchlist by ID
   * @param id The watchlist ID
   * @returns An Observable of Watchlist
   */
  getWatchlistById(id: string): Observable<Watchlist> {
    return this.apiService.get<Watchlist>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new watchlist
   * @param watchlist The watchlist to create
   * @returns An Observable of the created Watchlist
   */
  createWatchlist(watchlist: Omit<Watchlist, 'id'>): Observable<Watchlist> {
    return this.apiService.post<Watchlist>(this.endpoint, watchlist);
  }

  /**
   * Update an existing watchlist
   * @param id The watchlist ID
   * @param watchlist The updated watchlist data
   * @returns An Observable of the updated Watchlist
   */
  updateWatchlist(id: string, watchlist: Partial<Watchlist>): Observable<Watchlist> {
    return this.apiService.put<Watchlist>(`${this.endpoint}/${id}`, watchlist);
  }

  /**
   * Delete a watchlist
   * @param id The watchlist ID
   * @returns An Observable of the operation result
   */
  deleteWatchlist(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get all items in a watchlist
   * @param watchlistId The watchlist ID
   * @returns An Observable of WatchlistItem array
   */
  getWatchlistItems(watchlistId: string): Observable<WatchlistItem[]> {
    return this.apiService.get<WatchlistItem[]>(`${this.endpoint}/${watchlistId}/items`);
  }

  /**
   * Add an item to a watchlist
   * @param watchlistId The watchlist ID
   * @param item The item to add
   * @returns An Observable of the added WatchlistItem
   */
  addWatchlistItem(watchlistId: string, item: Omit<WatchlistItem, 'id' | 'watchlistId'>): Observable<WatchlistItem> {
    const newItem = { ...item, watchlistId } as Omit<WatchlistItem, 'id'>;
    return this.apiService.post<WatchlistItem>(`${this.endpoint}/${watchlistId}/items`, newItem);
  }

  /**
   * Update a watchlist item
   * @param watchlistId The watchlist ID
   * @param itemId The item ID
   * @param item The updated item data
   * @returns An Observable of the updated WatchlistItem
   */
  updateWatchlistItem(watchlistId: string, itemId: string, item: Partial<WatchlistItem>): Observable<WatchlistItem> {
    return this.apiService.put<WatchlistItem>(`${this.endpoint}/${watchlistId}/items/${itemId}`, item);
  }

  /**
   * Remove an item from a watchlist
   * @param watchlistId The watchlist ID
   * @param itemId The item ID
   * @returns An Observable of the operation result
   */
  removeWatchlistItem(watchlistId: string, itemId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${watchlistId}/items/${itemId}`);
  }
}