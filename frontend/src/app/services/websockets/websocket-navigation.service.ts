import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { WebSocketService } from './websocket.service';

/**
 * Service to handle WebSocket cleanup on navigation events
 * This ensures WebSocket subscriptions are properly unsubscribed when navigating between pages
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketNavigationService implements OnDestroy {
  private routerSubscription?: Subscription;
  private currentRoute: string = '';

  constructor(
    private router: Router,
    private webSocketService: WebSocketService
  ) {
    this.setupNavigationTracking();
  }

  /**
   * Setup navigation event tracking to handle WebSocket cleanup
   */
  private setupNavigationTracking(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const previousRoute = this.currentRoute;
        this.currentRoute = event.url;

        // If we're navigating to a different route, cleanup WebSocket subscriptions
        if (previousRoute && previousRoute !== this.currentRoute) {
          this.handleRouteChange(previousRoute, this.currentRoute);
        }
      });

    // Set initial route
    this.currentRoute = this.router.url;
  }

  /**
   * Handle route changes and cleanup WebSocket subscriptions
   */
  private handleRouteChange(previousRoute: string, currentRoute: string): void {
    // Determine if we're leaving a page that uses WebSocket subscriptions
    const isLeavingWebSocketPage = this.isWebSocketPage(previousRoute);

    if (isLeavingWebSocketPage) {
      this.cleanupWebSocketSubscriptions();
    }
  }

  /**
   * Check if a route is a page that uses WebSocket subscriptions
   */
  private isWebSocketPage(route: string): boolean {
    const webSocketRoutes = [
      '/dashboard/overall',
      '/dashboard/stock-insights',
      '/dashboard/today',
      '/dashboard/week',
      '/dashboard/month',
      '/dashboard/year',
      '/indices',
      '/dashboard'
    ];

    return webSocketRoutes.some(wsRoute => route.startsWith(wsRoute));
  }

  /**
   * Cleanup all WebSocket subscriptions
   */
  private cleanupWebSocketSubscriptions(): void {
    try {
      // Unsubscribe from all active subscriptions
      this.webSocketService.unsubscribeFromAll();
      
      // Disconnect the WebSocket connection
      this.webSocketService.disconnect();
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Force cleanup of WebSocket subscriptions (can be called manually)
   */
  public forceCleanup(): void {
    this.cleanupWebSocketSubscriptions();
  }

  /**
   * Get current route for debugging
   */
  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  /**
   * Check if current route is a WebSocket page
   */
  public isCurrentRouteWebSocketPage(): boolean {
    return this.isWebSocketPage(this.currentRoute);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
