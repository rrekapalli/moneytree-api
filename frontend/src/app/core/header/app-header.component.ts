import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { PopoverModule } from 'primeng/popover';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { filter, Subscription, Observable } from 'rxjs';
import { FeatureFlagDirective } from '../../core/directives';
import { NotificationsStateService, ToastService, SettingsStateService } from '../../services';
import { Notification, NotificationType } from '../../services/entities/notification';
import { AuthService } from '../../services/security/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    BadgeModule,
    PopoverModule,
    MenuModule,
    FeatureFlagDirective
  ],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  title = 'MoneyPlant';
  menuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];
  private routerSubscription: Subscription | undefined;
  private notificationsSubscription: Subscription | undefined;
  private refreshStylesHandler?: () => void;
  private popStateHandler?: () => void;

  // Notifications
  notifications = this.notificationsState.notifications;
  unreadCount = this.notificationsState.unreadCount;

  constructor(
    private router: Router,
    private notificationsState: NotificationsStateService,
    private toastService: ToastService,
    private settingsState: SettingsStateService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initMenuItems();
    this.initUserMenuItems();
    this.setupActiveRouteTracking();

    // Create bound function references for the event listeners
    this.refreshStylesHandler = this.updateActiveMenuItem.bind(this);
    this.popStateHandler = this.updateActiveMenuItem.bind(this);

    // Add window refresh event listener to reapply styles
    window.addEventListener('load', this.refreshStylesHandler);

    // Add popstate event listener to handle browser back/forward navigation
    window.addEventListener('popstate', this.popStateHandler);

    // Force refresh notifications to ensure UI starts with latest data
    this.loadNotifications(true).subscribe({
      error: (err) => {
        // Handle error silently
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    // Remove the window event listeners to prevent memory leaks
    if (this.refreshStylesHandler) {
      window.removeEventListener('load', this.refreshStylesHandler);
    }

    if (this.popStateHandler) {
      window.removeEventListener('popstate', this.popStateHandler);
    }
  }

  /**
   * Load notifications from the service
   * @param force Whether to force an API call or use cache
   * @returns An Observable of Notification array
   */
  loadNotifications(force: boolean = false): Observable<Notification[]> {
    // Unsubscribe from previous subscription if it exists
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    // Get the notifications observable
    const notificationsObservable = this.notificationsState.getNotifications(force);

    // Subscribe to it
    this.notificationsSubscription = notificationsObservable.subscribe({
      next: (notifications) => {
        // No need to manually update the component's notifications property
        // as it's already bound to the signal from NotificationsStateService
        // which is automatically updated when the state changes
      },
      error: (err) => {
        // Handle error silently
      }
    });

    // Return the observable for chaining
    return notificationsObservable;
  }

  /**
   * Mark a notification as read
   * @param id The notification ID
   * @param event The click event
   */
  markAsRead(id: string, event: Event) {
    event.stopPropagation();
    this.notificationsState.markAsRead(id).subscribe({
      next: (updatedNotification) => {
        // No need to manually update the component's notifications property
        // as it's already bound to the signal from NotificationsStateService
      },
      error: (err) => {
        // Force refresh notifications to ensure UI is in sync with server
        this.loadNotifications(true).subscribe({
          error: (refreshErr) => {
            // Handle error silently
          }
        });
      }
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notificationsState.markAllAsRead().subscribe({
      next: () => {
        // No need to manually update the component's notifications property
        // as it's already bound to the signal from NotificationsStateService
      },
      error: (err) => {
        // Force refresh notifications to ensure UI is in sync with server
        this.loadNotifications(true).subscribe({
          error: (refreshErr) => {
            // Handle error silently
          }
        });
      }
    });
  }

  /**
   * Delete a notification
   * @param id The notification ID
   * @param event The click event
   * @param panel Optional overlay panel reference to refresh
   */
  deleteNotification(id: string, event: Event, panel?: any) {
    // Stop the event from propagating to parent elements
    event.stopPropagation();

    // First, completely hide the panel to ensure it's removed from the DOM
    if (panel) {
      panel.hide();
    }

    // Show success message immediately for better UX (optimistic update)
    // this.toastService.show(
    //   'success',
    //   'Notification Deleted',
    //   'The notification has been removed.'
    // );

    // Then delete the notification from the server
    this.notificationsState.deleteNotification(id).subscribe({
      next: () => {
        // No need to force refresh since we're using optimistic updates
        // The UI is already updated before the API call completes
      },
      error: (err) => {
        // Even though the API call failed, the notification is already removed from the UI
        // due to optimistic updates in the NotificationsStateService

        // Handle error silently but don't show error to user
        // This provides a better user experience

        // Optionally, we could refresh notifications to ensure UI is in sync with server
        // but this is not necessary for most cases and might confuse the user
        // this.loadNotifications(true);
      }
    });
  }

  /**
   * Navigate to a notification link if available
   * @param notification The notification
   * @param panel The overlay panel to hide
   */
  navigateToNotification(notification: Notification, panel: any) {
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
    panel.hide();

    // Mark the notification as read directly
    this.notificationsState.markAsRead(notification.id).subscribe({
      next: (updatedNotification) => {
        // No need to manually update the component's notifications property
        // as it's already bound to the signal from NotificationsStateService
      },
      error: (err) => {
        // Force refresh notifications to ensure UI is in sync with server
        this.loadNotifications(true).subscribe({
          error: (refreshErr) => {
            // Handle error silently
          }
        });
      }
    });
  }

  private initMenuItems() {
    // Create a function that will call updateActiveMenuItem after a short delay
    const updateStylesAfterClick = () => {
      // Use setTimeout to ensure this runs after navigation is complete
      setTimeout(() => {
        this.updateActiveMenuItem();
      }, 50);
    };

    this.menuItems = [
      {
        label: 'Dashboard',
        //icon: 'pi pi-chart-bar',
        routerLink: ['/dashboard'],
        command: updateStylesAfterClick
      },
      {
        label: 'Portfolios',
        //icon: 'pi pi-folder',
        routerLink: ['/portfolios'],
        command: updateStylesAfterClick
      },
      {
        label: 'Strategies',
        //icon: 'pi pi-sitemap',
        routerLink: ['/strategies'],
        command: updateStylesAfterClick
      },
      {
        label: 'Screeners',
        //icon: 'pi pi-search',
        routerLink: ['/screeners'],
        command: updateStylesAfterClick
      },
      {
        label: 'Positions',
        //icon: 'pi pi-chart-line',
        routerLink: ['/positions'],
        command: updateStylesAfterClick
      },
      {
        label: 'Holdings',
        //icon: 'pi pi-briefcase',
        routerLink: ['/holdings'],
        command: updateStylesAfterClick
      }
    ];
  }

  /**
   * Initialize user menu items
   */
  private initUserMenuItems() {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          // Navigate to profile page or show profile modal
        }
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
  }

  /**
   * Get user display name for the menu button
   */
  getUserDisplayName(): string {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Priority order: fullName > firstName + lastName > name > email > 'User'
      if (currentUser.fullName && currentUser.fullName.trim()) {
        return currentUser.fullName.trim();
      }
      
      if (currentUser.firstName && currentUser.lastName) {
        return `${currentUser.firstName.trim()} ${currentUser.lastName.trim()}`;
      }
      
      if (currentUser.firstName && currentUser.firstName.trim()) {
        return currentUser.firstName.trim();
      }
      
      if (currentUser.name && currentUser.name.trim()) {
        return currentUser.name.trim();
      }
      
      if (currentUser.email && currentUser.email.trim()) {
        // Extract name from email (everything before @)
        const emailName = currentUser.email.split('@')[0];
        // Capitalize first letter and replace dots/underscores with spaces
        return emailName
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }
    }
    return 'User';
  }

  /**
   * Handle user logout
   */
  logout(): void {
    this.authService.logout();
    // The auth service will handle navigation to login page
  }

  private setupActiveRouteTracking() {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveMenuItem();
        this.showNavigationNotifications(event.url);
      });

    // Initial update
    this.updateActiveMenuItem();
  }

  /**
   * Show notifications when navigation changes
   * @param url The current URL
   */
  private showNavigationNotifications(url: string) {
    // Get the route name from the URL
    const routeName = this.getRouteNameFromUrl(url);

    let type: NotificationType;
    let title: string;
    let message: string;

    // Set notification content based on the route
    if (routeName === 'dashboard') {
      type = NotificationType.INFO;
      title = 'Dashboard Updated';
      message = 'Your dashboard has been refreshed with the latest data.';
    } else if (routeName === 'holdings') {
      type = NotificationType.SUCCESS;
      title = 'Holdings Loaded';
      message = 'Your investment holdings have been loaded successfully.';
    } else if (routeName === 'positions') {
      type = NotificationType.INFO;
      title = 'Positions Updated';
      message = 'Your trading positions have been updated with real-time data.';
    } else if (routeName === 'market') {
      type = NotificationType.INFO;
      title = 'Market Data';
      message = 'Market data has been refreshed with the latest information.';
    } else if (routeName === 'watchlists') {
      type = NotificationType.SUCCESS;
      title = 'Watchlists Updated';
      message = 'Your watchlists have been updated with the latest prices.';
    } else if (routeName === 'portfolios') {
      type = NotificationType.SUCCESS;
      title = 'Portfolios Loaded';
      message = 'Your investment portfolios have been loaded successfully.';
    } else if (routeName === 'screeners') {
      type = NotificationType.INFO;
      title = 'Stock Screeners';
      message = 'Stock screeners have been loaded with the latest market data.';
    } else if (routeName === 'indices') {
      type = NotificationType.INFO;
      title = 'Market Indices';
      message = 'Market indices have been loaded with real-time data.';
    } else if (routeName === 'strategies') {
      type = NotificationType.INFO;
      title = 'Trading Strategies';
      message = 'Your trading strategies have been loaded with performance data.';
    } else {
      // Don't show notification for other routes
      return;
    }

    // Show toast notification
    this.toastService.showNotification(type, title, message);

    // Add to notifications state
    const notification: Notification = {
      id: this.generateNotificationId(),
      title,
      message,
      type,
      isRead: false,
      timestamp: new Date(),
      link: url
    };

    this.notificationsState.addNotification(notification);
  }

  /**
   * Generate a unique ID for a notification
   * @returns A unique ID string
   */
  private generateNotificationId(): string {
    return 'notification-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
  }

  /**
   * Get the route name from the URL
   * @param url The URL
   * @returns The route name
   */
  private getRouteNameFromUrl(url: string): string {
    // Remove leading slash and get the first segment
    const path = url.startsWith('/') ? url.substring(1) : url;
    const segments = path.split('/');
    return segments[0] || 'dashboard';
  }

  public updateActiveMenuItem() {
    const currentUrl = this.router.url;

    // First pass: update the menu items immediately
    this.updateMenuItemStyles(currentUrl);

    // Second pass: update again after a short delay to ensure styles are applied
    // This helps overcome any PrimeNG internal rendering that might reset our styles
    setTimeout(() => {
      this.updateMenuItemStyles(currentUrl);

      // Third pass: update once more after a slightly longer delay
      // This ensures our styles persist even if there are multiple rendering cycles
      setTimeout(() => {
        this.updateMenuItemStyles(currentUrl);
      }, 100);
    }, 0);
  }

  private updateMenuItemStyles(currentUrl: string) {
    this.menuItems.forEach(item => {
      if (item.routerLink && item.routerLink.length > 0) {
        const routePath = item.routerLink[0];
        // Add custom class for active items
        item.styleClass = currentUrl.startsWith(routePath) ? 'p-menuitem-active custom-active-menuitem' : '';

        // Add inline style for active items
        if (currentUrl.startsWith(routePath)) {
          item.style = {
            'color': 'var(--primary-color)',
            'border-bottom': '2px solid var(--primary-color)',
            'background-color': 'rgba(76, 175, 80, 0.2)',
            'font-weight': 'bold'
          };
        } else {
          item.style = {
            'color': '',
            'border-bottom': '',
            'background-color': '',
            'font-weight': ''
          };
        }
      }
    });
  }

  /**
   * Track notifications by their ID for better change detection
   * @param index The index of the notification in the array
   * @param notification The notification object
   * @returns The notification ID
   */
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
