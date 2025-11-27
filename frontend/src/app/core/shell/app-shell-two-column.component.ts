import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AppHeaderComponent } from '../header/app-header.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FeatureFlagDirective } from '../../core/directives';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { IndicesComponent } from '../../features/indices/indices.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell-two-column',
  standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        AppHeaderComponent,
        ProgressSpinnerModule,
        FeatureFlagDirective,
        ToastModule,
        IndicesComponent
    ],
  templateUrl: './app-shell-two-column.component.html',
  styleUrl: './app-shell-two-column.component.scss',
  providers: [MessageService]
})
export class AppShellTwoColumnComponent implements OnInit, OnDestroy {
  loading = false; // This will be used to control the loading spinner visibility
  private toastSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;
  currentRoute = '';

  constructor(
    private messageService: MessageService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      this.messageService.add(toast);
    });

    // Track route changes to determine sidebar content
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Set initial route
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onRouterOutletActivate(component: any): void {
    // Router outlet activation - no manual cleanup needed
  }

  onRouterOutletDeactivate(component: any): void {
    // Router outlet deactivation - no manual cleanup needed
  }

  /**
   * Check if current route is an indices route
   */
  isIndicesRoute(): boolean {
    return this.currentRoute.startsWith('/indices') || 
           this.currentRoute.startsWith('/dashboard') ||
           this.currentRoute === '/';
  }
}
