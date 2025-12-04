import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subject, takeUntil, finalize, retry, timer, catchError, throwError, debounceTime, distinctUntilChanged } from 'rxjs';

import { StrategyApiService } from '../../services/apis/strategy.api';
import { StrategyWithMetrics, StrategyConfig } from './strategy.types';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../services/toast.service';
import { OverviewComponent } from './overview/overview.component';
import { DetailsComponent } from './details/details.component';
import { ConfigureComponent } from './configure/configure.component';
import { BacktestResultsComponent } from './backtest-results/backtest-results.component';

@Component({
  selector: 'app-strategies',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    TabsModule,
    FormsModule,
    ScrollPanelModule,
    PageHeaderComponent,
    OverviewComponent,
    DetailsComponent,
    ConfigureComponent,
    BacktestResultsComponent
  ],
  templateUrl: './strategies.component.html',
  styleUrls: ['./strategies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StrategiesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  private strategiesLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  strategies: StrategyWithMetrics[] = [];
  filteredStrategies: StrategyWithMetrics[] = [];
  loading = false;
  error: string | null = null;
  retryCount = 0;
  maxRetries = 2;

  // Search and filter properties
  searchText = '';

  // Sorting properties
  sortField: string = 'updatedAt';
  sortOrder: number = -1; // -1 for descending (most recent first)

  sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Updated (Recent)', value: 'updatedAt' },
    { label: 'Created (Recent)', value: 'createdAt' },
    { label: 'Return (%)', value: 'totalReturn' }
  ];

  // Selected strategy for detail view
  selectedStrategy: StrategyWithMetrics | null = null;

  // Active tab for the detail panel
  activeTab: 'overview' | 'details' | 'configure' | 'backtest-results' = 'overview';

  // Cache for strategy data
  private strategyCache: Map<string, StrategyWithMetrics[]> = new Map();
  private strategyCacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  // Lazy loading flags for tabs
  private overviewLoaded = false;
  private detailsLoaded = false;
  private configureLoaded = false;
  private backtestResultsLoaded = false;

  constructor(
    private strategyApiService: StrategyApiService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });

    // Subscribe to route parameters for deep linking
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const strategyId = params['id'];
        const tab = params['tab'];

        // Load strategies only once
        const loadPromise = this.strategiesLoaded
          ? Promise.resolve()
          : this.loadStrategies();

        if (strategyId && tab) {
          // Deep link: select strategy and tab from URL
          loadPromise.then(() => {
            const strategy = this.strategies.find(s => s.id === strategyId);
            if (strategy) {
              if (!this.selectedStrategy || this.selectedStrategy.id !== strategyId) {
                this.selectedStrategy = strategy;
                // Reset lazy loading flags when selecting a new strategy
                this.overviewLoaded = false;
                this.detailsLoaded = false;
                this.configureLoaded = false;
                this.backtestResultsLoaded = false;
              }
              this.activeTab = tab as any;

              // Lazy load data for the active tab
              this.loadTabData(tab as any);
            }
          });
        } else {
          // No deep link: clear selection and show empty state or auto-select first strategy
          loadPromise.then(() => {
            // Clear the selected strategy when navigating to /strategies without an ID
            this.selectedStrategy = null;
            this.cdr.markForCheck();
            
            // Optionally auto-select the first strategy if strategies exist
            // Comment out the lines below if you want to show an empty state instead
            if (this.strategies.length > 0) {
              this.selectStrategy(this.strategies[0]);
              this.activeTab = 'overview';
            }
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clear caches on destroy
    this.strategyCache.clear();
  }

  loadStrategies(): Promise<void> {
    // If already loading, return the existing promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // If already loaded, return resolved promise
    if (this.strategiesLoaded) {
      return Promise.resolve();
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Check cache first
      const now = Date.now();
      const cachedData = this.strategyCache.get('strategies');

      if (cachedData && (now - this.strategyCacheTimestamp) < this.CACHE_DURATION_MS) {
        // Use cached data
        this.strategies = cachedData;
        this.applyFilters();
        this.strategiesLoaded = true;
        this.cdr.markForCheck();
        resolve();
        return;
      }

      this.loading = true;
      this.error = null;
      this.retryCount = 0;
      this.cdr.markForCheck();

      this.strategyApiService.getStrategies()
        .pipe(
          retry({
            count: this.maxRetries,
            delay: (error, retryCount) => {
              this.retryCount = retryCount;
              return timer(Math.pow(2, retryCount - 1) * 1000);
            }
          }),
          takeUntil(this.destroy$),
          finalize(() => {
            this.loading = false;
            this.retryCount = 0;
            this.cdr.markForCheck();
          }),
          catchError((error) => {
            this.handleStrategyLoadError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (data) => {
            if (Array.isArray(data)) {
              this.strategies = data;

              // Cache the data
              this.strategyCache.set('strategies', this.strategies);
              this.strategyCacheTimestamp = Date.now();

              this.applyFilters();
              this.error = null;
              this.strategiesLoaded = true;
              this.loadingPromise = null;

              this.cdr.markForCheck();
              resolve();
            } else {
              this.error = 'Invalid data format received from API. Please contact support.';
              this.loadingPromise = null;
              this.cdr.markForCheck();
              reject(new Error('Invalid data format'));
            }
          },
          error: (err) => {
            this.loadingPromise = null;
            this.cdr.markForCheck();
            reject(err);
          }
        });
    });

    return this.loadingPromise;
  }

  private handleStrategyLoadError(error: any): void {
    console.error('Error loading strategies:', error);

    if (error.status === 0) {
      this.error = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.error = 'Your session has expired. Please log in again.';
      localStorage.removeItem('auth_token');
    } else if (error.status === 403) {
      this.error = 'You do not have permission to view strategies.';
    } else if (error.status === 404) {
      this.error = 'Strategy service not found. Please contact support.';
    } else if (error.status >= 500) {
      this.error = 'Server error occurred. Please try again later.';
    } else {
      this.error = error.error?.message || 'Failed to load strategies. Please try again.';
    }

    this.cdr.markForCheck();
  }

  // Search and filtering methods
  onSearchChange(): void {
    this.searchSubject$.next(this.searchText);
  }

  clearFilters(): void {
    this.searchText = '';
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.strategies];

    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(strategy =>
        strategy.name?.toLowerCase().includes(searchLower) ||
        strategy.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof StrategyWithMetrics];
      let bValue: any = b[this.sortField as keyof StrategyWithMetrics];

      if (this.sortField === 'updatedAt' || this.sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1 * this.sortOrder;
      if (aValue > bValue) return 1 * this.sortOrder;
      return 0;
    });

    this.filteredStrategies = filtered;
  }

  onSortFieldChange(): void {
    // Set appropriate sort order based on field
    if (this.sortField === 'name') {
      this.sortOrder = 1; // Ascending for names (A-Z)
    } else if (this.sortField === 'updatedAt' || this.sortField === 'createdAt') {
      this.sortOrder = -1; // Descending for dates (most recent first)
    } else if (this.sortField === 'totalReturn') {
      this.sortOrder = -1; // Descending for returns (highest first)
    }
    this.applyFilters();
  }

  getSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.sortField);
    return option ? `Sort by: ${option.label}` : 'Sort by';
  }

  // Action methods
  createStrategy(): void {
    // Create a new empty strategy for creation mode
    this.selectedStrategy = {
      id: '',
      userId: '',
      name: '',
      description: '',
      riskProfile: 'MODERATE',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Inactive'
    };
    // Switch to Details tab for new strategy creation
    this.activeTab = 'details';
  }

  selectStrategy(strategy: StrategyWithMetrics): void {
    this.selectedStrategy = strategy;
    this.activeTab = 'overview';

    // Reset lazy loading flags when selecting a new strategy
    this.overviewLoaded = false;
    this.detailsLoaded = false;
    this.configureLoaded = false;
    this.backtestResultsLoaded = false;

    // Update URL with deep link
    this.router.navigate(['/strategies', strategy.id, this.activeTab]);

    // Load data for the overview tab (default tab)
    this.loadTabData('overview');
  }

  // Method to handle tab changes
  onTabChange(tab: 'overview' | 'details' | 'configure' | 'backtest-results' | string | number | undefined): void {
    if (tab !== undefined) {
      const tabValue = typeof tab === 'string' ? tab : tab.toString();
      if (tabValue === 'overview' || tabValue === 'details' || tabValue === 'configure' || tabValue === 'backtest-results') {
        this.activeTab = tabValue;

        // Update URL with deep link
        if (this.selectedStrategy) {
          const url = `/strategies/${this.selectedStrategy.id}/${tabValue}`;
          window.history.replaceState({}, '', url);
        }

        // Lazy load data when switching to specific tabs
        this.loadTabData(tabValue);
      }
    }
  }

  // Lazy load data for specific tabs
  private loadTabData(tab: 'overview' | 'details' | 'configure' | 'backtest-results'): void {
    if (!this.selectedStrategy) {
      return;
    }

    switch (tab) {
      case 'overview':
        if (!this.overviewLoaded) {
          // Load overview data (metrics, performance chart, recent trades)
          // TODO: Implement in future tasks when OverviewComponent is created
          console.log('Loading overview data for strategy:', this.selectedStrategy.id);
          this.overviewLoaded = true;
        }
        break;

      case 'details':
        if (!this.detailsLoaded) {
          // Load strategy details
          // TODO: Implement in future tasks when DetailsComponent is created
          console.log('Loading details data for strategy:', this.selectedStrategy.id);
          this.detailsLoaded = true;
        }
        break;

      case 'configure':
        if (!this.configureLoaded) {
          // Load strategy configuration
          // TODO: Implement in future tasks when ConfigureComponent is created
          console.log('Loading configuration data for strategy:', this.selectedStrategy.id);
          this.configureLoaded = true;
        }
        break;

      case 'backtest-results':
        if (!this.backtestResultsLoaded) {
          // Load backtest results
          // TODO: Implement in future tasks when BacktestResultsComponent is created
          console.log('Loading backtest results for strategy:', this.selectedStrategy.id);
          this.backtestResultsLoaded = true;
        }
        break;
    }
  }

  // Track function for ngFor
  trackStrategyById(index: number, strategy: StrategyWithMetrics): string {
    return strategy.id;
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  getRiskProfileLabel(riskProfile: string): string {
    const labels: { [key: string]: string } = {
      'CONSERVATIVE': 'Low Risk',
      'MODERATE': 'Medium Risk',
      'AGGRESSIVE': 'High Risk'
    };
    return labels[riskProfile] || riskProfile;
  }

  formatReturn(value: number | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getPerformanceColor(value: number | undefined): string {
    if (value === undefined || value === null) return 'var(--text-color-secondary)';
    return value >= 0 ? 'var(--green-600)' : 'var(--red-600)';
  }

  getStrategyIcon(riskProfile: string): string {
    switch (riskProfile) {
      case 'CONSERVATIVE':
        return 'pi pi-shield';
      case 'AGGRESSIVE':
        return 'pi pi-arrow-up';
      default:
        return 'pi pi-chart-line';
    }
  }

  getStatusSeverity(status: string | undefined): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Backtesting':
        return 'info';
      case 'Inactive':
        return 'secondary';
      case 'Error':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Handles the strategySaved event from the DetailsComponent
   * Updates the strategy in the list and refreshes the display
   * For new strategies, adds them to the list
   */
  onStrategySaved(updatedStrategy: StrategyWithMetrics): void {
    // Find and update the strategy in the strategies array
    const index = this.strategies.findIndex(s => s.id === updatedStrategy.id);
    if (index !== -1) {
      // Update existing strategy
      this.strategies[index] = {
        ...this.strategies[index],
        ...updatedStrategy
      };
    } else {
      // Add new strategy to the list
      this.strategies.push(updatedStrategy);
    }

    // Update the selected strategy
    this.selectedStrategy = {
      ...this.selectedStrategy!,
      ...updatedStrategy
    };

    // Invalidate cache to force refresh on next load
    this.strategyCache.clear();
    this.strategyCacheTimestamp = 0;

    // Reapply filters to update the sidebar display
    this.applyFilters();

    this.cdr.markForCheck();
  }

  /**
   * Handles the configSaved event from the ConfigureComponent
   * Updates the configuration state
   */
  onConfigSaved(config: StrategyConfig): void {
    console.log('Configuration saved:', config);
    // Configuration is saved, no need to update strategy list
    // But we could invalidate cache if needed
    this.cdr.markForCheck();
  }

  /**
   * Handles the backtestTriggered event from the ConfigureComponent
   * Switches to the Backtest Results tab
   */
  onBacktestTriggered(): void {
    console.log('Backtest triggered');
    // TODO: Implement backtest execution in task 12.7
    // For now, just log the event
    this.cdr.markForCheck();
  }

  /**
   * Handles the navigateToConfigure event from the BacktestResultsComponent
   * Switches to the Configure tab
   */
  onNavigateToConfigureTab(): void {
    this.activeTab = 'configure';
    
    // Update URL with deep link
    if (this.selectedStrategy) {
      const url = `/strategies/${this.selectedStrategy.id}/configure`;
      window.history.replaceState({}, '', url);
    }
    
    // Load configure tab data
    this.loadTabData('configure');
    this.cdr.markForCheck();
  }

  /**
   * Toggles the active status of a strategy
   * Validates configuration before activation
   * 
   * @param strategy - The strategy to toggle
   * @param event - The click event (to prevent propagation)
   */
  toggleStrategyActive(strategy: StrategyWithMetrics, event?: Event): void {
    // Prevent event propagation to avoid selecting the strategy
    if (event) {
      event.stopPropagation();
    }

    const newActiveStatus = !strategy.isActive;

    // If activating, validate that configuration is complete
    if (newActiveStatus) {
      // TODO: Add configuration validation check
      // For now, we'll allow activation
      // In a future enhancement, we should check if the strategy has:
      // - At least one entry condition
      // - At least one exit condition
      // - Valid universe definition
      // - Valid allocation rules
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.strategyApiService.updateStrategy(strategy.id, { isActive: newActiveStatus })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (updatedStrategy) => {
          // Update the strategy in the list
          const index = this.strategies.findIndex(s => s.id === strategy.id);
          if (index !== -1) {
            this.strategies[index] = {
              ...this.strategies[index],
              isActive: updatedStrategy.isActive,
              status: updatedStrategy.isActive ? 'Active' : 'Inactive'
            };
          }

          // Update the selected strategy if it's the one being toggled
          if (this.selectedStrategy?.id === strategy.id) {
            this.selectedStrategy = {
              ...this.selectedStrategy,
              isActive: updatedStrategy.isActive,
              status: updatedStrategy.isActive ? 'Active' : 'Inactive'
            };
          }

          // Invalidate cache
          this.strategyCache.clear();
          this.strategyCacheTimestamp = 0;

          // Reapply filters to update the display
          this.applyFilters();

          // Show success notification
          const statusText = updatedStrategy.isActive ? 'activated' : 'deactivated';
          this.toastService.show(
            'success',
            'Strategy Status Updated',
            `Strategy "${strategy.name}" has been ${statusText}.`
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error toggling strategy status:', error);
          
          let errorMessage = 'Failed to update strategy status.';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Strategy configuration is incomplete. Please configure the strategy before activating.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to modify this strategy.';
          } else if (error.status === 404) {
            errorMessage = 'Strategy not found.';
          }

          this.toastService.showError({
            summary: 'Update Failed',
            detail: errorMessage
          });
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Deletes a strategy after confirmation
   * Checks for active positions before deletion
   * 
   * @param strategy - The strategy to delete
   * @param event - The click event (to prevent propagation)
   */
  deleteStrategy(strategy: StrategyWithMetrics, event?: Event): void {
    // Prevent event propagation to avoid selecting the strategy
    if (event) {
      event.stopPropagation();
    }

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete "${strategy.name}"?\n\n` +
      `This will permanently delete the strategy and all associated data including:\n` +
      `- Strategy configuration\n` +
      `- Performance metrics\n` +
      `- Backtest results\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.strategyApiService.deleteStrategy(strategy.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          // Remove the strategy from the list
          this.strategies = this.strategies.filter(s => s.id !== strategy.id);

          // If the deleted strategy was selected, clear selection
          if (this.selectedStrategy?.id === strategy.id) {
            this.selectedStrategy = null;
            
            // Select the first strategy if available
            if (this.strategies.length > 0) {
              this.selectStrategy(this.strategies[0]);
            }
          }

          // Invalidate cache
          this.strategyCache.clear();
          this.strategyCacheTimestamp = 0;

          // Reapply filters to update the display
          this.applyFilters();

          // Show success notification
          this.toastService.show(
            'success',
            'Strategy Deleted',
            `Strategy "${strategy.name}" has been deleted successfully.`
          );

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error deleting strategy:', error);
          
          let errorMessage = 'Failed to delete strategy.';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Cannot delete strategy with active positions. Please close all positions first.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to delete this strategy.';
          } else if (error.status === 404) {
            errorMessage = 'Strategy not found.';
          }

          this.toastService.showError({
            summary: 'Delete Failed',
            detail: errorMessage
          });
          this.cdr.markForCheck();
        }
      });
  }
}