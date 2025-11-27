import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.base';
import { Notification } from '../entities/notification';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly endpoint = '/notifications';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all notifications
   * @param read Optional filter by read status
   * @returns An Observable of Notification array
   */
  getNotifications(read?: boolean): Observable<Notification[]> {
    let params = new HttpParams();
    if (read !== undefined) {
      params = params.set('read', read.toString());
    }
    return this.apiService.get<Notification[]>(this.endpoint, params);
  }

  /**
   * Get a specific notification by ID
   * @param id The notification ID
   * @returns An Observable of Notification
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.apiService.get<Notification>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new notification
   * @param notification The notification to create
   * @returns An Observable of the created Notification
   */
  createNotification(notification: Omit<Notification, 'id'>): Observable<Notification> {
    return this.apiService.post<Notification>(this.endpoint, notification);
  }

  /**
   * Update an existing notification
   * @param id The notification ID
   * @param notification The updated notification data
   * @returns An Observable of the updated Notification
   */
  updateNotification(id: string, notification: Partial<Notification>): Observable<Notification> {
    return this.apiService.put<Notification>(`${this.endpoint}/${id}`, notification);
  }

  /**
   * Delete a notification
   * @param id The notification ID
   * @returns An Observable of the operation result
   */
  deleteNotification(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Mark a notification as read
   * @param id The notification ID
   * @returns An Observable of the updated Notification
   */
  markAsRead(id: string): Observable<Notification> {
    return this.apiService.put<Notification>(`${this.endpoint}/${id}/read`, {});
  }

  /**
   * Mark a notification as unread
   * @param id The notification ID
   * @returns An Observable of the updated Notification
   */
  markAsUnread(id: string): Observable<Notification> {
    return this.apiService.put<Notification>(`${this.endpoint}/${id}/unread`, {});
  }

  /**
   * Mark all notifications as read
   * @returns An Observable of the operation result
   */
  markAllAsRead(): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/read-all`, {});
  }

  /**
   * Get unread notification count
   * @returns An Observable of the unread count
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.apiService.get<{ count: number }>(`${this.endpoint}/unread-count`);
  }

  /**
   * Delete all notifications
   * @returns An Observable of the operation result
   */
  deleteAll(): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/all`);
  }

  /**
   * Delete all read notifications
   * @returns An Observable of the operation result
   */
  deleteAllRead(): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/read`);
  }
}