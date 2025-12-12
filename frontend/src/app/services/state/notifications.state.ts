import { Injectable, OnDestroy, computed, signal } from '@angular/core';
import { Observable, tap, interval, Subscription } from 'rxjs';
import { ApiService } from '../apis/api.base';
import { Notification } from '../entities/notification';
import { SettingsStateService } from './settings.state';

/**
 * Interface for the notifications state
 */
interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Initial state for notifications
 */
const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  lastUpdated: null
};

@Injectable({
  providedIn: 'root'
})
export class NotificationsStateService implements OnDestroy {
  private readonly endpoint = '/v1/notifications';

  // State signal
  private state = signal<NotificationsState>(initialState);

  // Public readable signals
  public notifications = computed(() => this.state().notifications);
  public loading = computed(() => this.state().loading);
  public error = computed(() => this.state().error);
  public lastUpdated = computed(() => this.state().lastUpdated);

  // Computed signals for derived state
  public unreadCount = computed(() => 
    this.notifications().filter(notification => !notification.isRead).length
  );

  // Cleanup interval subscription
  private cleanupSubscription: Subscription | null = null;

  constructor(
    private apiService: ApiService,
    private settingsState: SettingsStateService
  ) {
    // State changes are handled silently
    // Set up automatic cleanup of old notifications
    this.setupNotificationCleanup();
  }

  /**
   * Set up automatic cleanup of old notifications
   */
  private setupNotificationCleanup(): void {
    // Clean up notifications every 5 minutes
    this.cleanupSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.cleanupOldNotifications();
    });
  }

  /**
   * Clean up old notifications based on retention time
   */
  private cleanupOldNotifications(): void {
    const now = new Date();
    const retentionMs = this.settingsState.notificationRetentionMinutes() * 60 * 1000;
    const maxNotifications = this.settingsState.maxNotifications();

    // Filter out notifications older than the retention time
    let currentNotifications = this.notifications().filter(notification => {
      const notificationTime = new Date(notification.timestamp).getTime();
      return (now.getTime() - notificationTime) < retentionMs;
    });

    // If we still have more than the maximum allowed, trim the oldest ones
    if (currentNotifications.length > maxNotifications) {
      // Sort by timestamp (oldest first)
      currentNotifications.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Keep only the most recent ones up to the maximum
      currentNotifications = currentNotifications.slice(-maxNotifications);
    }

    // Update the state if the notifications have changed
    if (currentNotifications.length !== this.notifications().length) {
      this.updateState({ notifications: currentNotifications });
    }
  }

  /**
   * Updates the state
   * @param newState Partial state to update
   */
  private updateState(newState: Partial<NotificationsState>): void {
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
   * Get all notifications (always fresh from API since they're generated on-demand)
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Notification array
   */
  getNotifications(force: boolean = false): Observable<Notification[]> {
    // For lightweight notifications, we always fetch fresh data
    // but still respect caching for performance
    if (!force && this.notifications().length > 0 && this.lastUpdated()) {
      const cacheAge = new Date().getTime() - this.lastUpdated()!.getTime();
      // Use cache if it's less than 30 seconds old (shorter cache for real-time notifications)
      if (cacheAge < 30 * 1000) {
        return new Observable<Notification[]>(observer => {
          observer.next(this.notifications());
          observer.complete();
        });
      }
    }

    // Make the API call for fresh notifications
    this.setLoading(true);
    this.setError(null);

    return this.apiService.get<Notification[]>(this.endpoint).pipe(
      tap({
        next: (notifications) => {
          this.updateState({ 
            notifications,
            loading: false
          });
          this.updateTimestamp();
          // Ensure we don't exceed the maximum number of notifications
          this.cleanupOldNotifications();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to load notifications');
        }
      })
    );
  }

  /**
   * Get a specific notification by ID
   * @param id The notification ID
   * @returns An Observable of Notification
   */
  getNotificationById(id: string): Observable<Notification> {
    // Check if we have the notification in cache
    const cachedNotification = this.notifications().find(n => n.id === id);
    if (cachedNotification) {
      return new Observable<Notification>(observer => {
        observer.next(cachedNotification);
        observer.complete();
      });
    }

    // Otherwise, make the API call
    this.setLoading(true);
    this.setError(null);

    return this.apiService.get<Notification>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: (notification) => {
          // Update the notification in the cache if it exists
          this.updateState({
            notifications: [
              ...this.notifications().filter(n => n.id !== notification.id),
              notification
            ],
            loading: false
          });
          this.updateTimestamp();
          // Ensure we don't exceed the maximum number of notifications
          this.cleanupOldNotifications();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to load notification with ID ${id}`);
        }
      })
    );
  }

  /**
   * Mark a notification as read
   * @param id The notification ID
   * @returns An Observable of the updated Notification
   */
  markAsRead(id: string): Observable<Notification> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.put<Notification>(`${this.endpoint}/${id}/read`, {}).pipe(
      tap({
        next: (updatedNotification) => {
          // Update the notification in the cache
          this.updateState({
            notifications: this.notifications().map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            ),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to mark notification with ID ${id} as read`);
        }
      })
    );
  }

  /**
   * Mark all notifications as read
   * @returns An Observable of the operation result
   */
  markAllAsRead(): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.put<void>(`${this.endpoint}/read-all`, {}).pipe(
      tap({
        next: () => {
          // Update all notifications in the cache as read
          this.updateState({
            notifications: this.notifications().map(n => ({
              ...n,
              isRead: true
            })),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to mark all notifications as read');
        }
      })
    );
  }

  /**
   * Delete a notification
   * @param id The notification ID
   * @returns An Observable of the operation result
   */
  deleteNotification(id: string): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    // First, optimistically update the local state to improve UI responsiveness
    this.updateState({
      notifications: this.notifications().filter(n => n.id !== id)
    });

    return this.apiService.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap({
        next: () => {
          // API call succeeded, update loading state and timestamp
          this.setLoading(false);
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || `Failed to delete notification with ID ${id}`);
        }
      })
    );
  }

  /**
   * Delete all read notifications
   * @returns An Observable of the operation result
   */
  deleteAllReadNotifications(): Observable<void> {
    this.setLoading(true);
    this.setError(null);

    return this.apiService.delete<void>(`${this.endpoint}/read`).pipe(
      tap({
        next: () => {
          // Remove all read notifications from the cache
          this.updateState({
            notifications: this.notifications().filter(n => !n.isRead),
            loading: false
          });
          this.updateTimestamp();
        },
        error: (err) => {
          this.setLoading(false);
          this.setError(err.message || 'Failed to delete all read notifications');
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

  /**
   * Add a new notification
   * @param notification The notification to add
   */
  addNotification(notification: Notification): void {
    // Add the notification to the state
    this.updateState({
      notifications: [
        ...this.notifications(),
        notification
      ]
    });

    // Ensure we don't exceed the maximum number of notifications
    this.cleanupOldNotifications();
  }

  /**
   * Clean up resources when the service is destroyed
   */
  ngOnDestroy(): void {
    if (this.cleanupSubscription) {
      this.cleanupSubscription.unsubscribe();
      this.cleanupSubscription = null;
    }
  }
}
