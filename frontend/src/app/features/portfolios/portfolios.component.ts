import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subject, takeUntil, finalize, retry, timer, catchError, throwError, debounceTime, distinctUntilChanged, of } from 'rxjs';

import { PortfolioApiService } from '../../services/apis/portfolio.api';
import { PortfolioHoldingApiService } from '../../services/apis/portfolio-holding.api';
import { PortfolioTradeApiService } from '../../services/apis/portfolio-trade.api';
import { PortfolioDto, PortfolioHolding, PortfolioTrade } from '../../services/entities/portfolio.entities';
import { PortfolioWithMetrics } from './portfolio.types';
import { PortfolioConfigForm } from '../../services/entities/portfolio.entities';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../services/toast.service';
import { PortfolioConfigureComponent } from './configure/configure.component';
import { PortfolioOverviewComponent } from './overview/overview.component';
import { PortfolioHoldingsComponent } from './holdings/holdings.component';
import { PortfolioTradesComponent } from './trades/trades.component';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    DataViewModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
    TabsModule,
    FormsModule,
    ToggleButtonModule,
    InputNumberModule,
    TableModule,
    ScrollPanelModule,
    PageHeaderComponent,
    PortfolioConfigureComponent,
    PortfolioOverviewComponent,
    PortfolioHoldingsComponent,
    PortfolioTradesComponent
  ],
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  
  portfolios: PortfolioWithMetrics[] = [];
  filteredPortfolios: PortfolioWithMetrics[] = [];
  loading = false;
  error: string | null = null;
  retryCount = 0;
  maxRetries = 2;
  
  // Search and filter properties
  searchText = '';
  selectedRiskProfile: string | null = null;
  layout: 'list' | 'grid' = 'grid';
  
  // Sorting properties
  sortField: string = 'name';
  sortOrder: number = 1;
  
  // Selected portfolio for detail view
  selectedPortfolio: PortfolioWithMetrics | null = null;
  
  // Active tab for the detail panel (overview, configure, holdings, trades)
  activeTab: 'overview' | 'configure' | 'holdings' | 'trades' = 'overview';
  
  // Cache for portfolio data
  private portfolioCache: Map<string, PortfolioWithMetrics[]> = new Map();
  private portfolioCacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  
  // Cache for holdings and trades
  private holdingsCache: Map<string, { data: PortfolioHolding[], timestamp: number }> = new Map();
  private tradesCache: Map<string, { data: PortfolioTrade[], timestamp: number }> = new Map();
  
  // Lazy loading flags for tabs
  private holdingsLoaded = false;
  private tradesLoaded = false;

  // Configure tab form state
  configForm: PortfolioConfigForm = this.getDefaultConfigForm();
  originalConfigForm: PortfolioConfigForm = this.getDefaultConfigForm();
  configFormDirty = false;
  savingConfig = false;

  // Holdings tab state
  holdings: PortfolioHolding[] = [];
  holdingsLoading = false;
  holdingsError: string | null = null;
  holdingsRetryCount = 0;

  // Configure tab dropdown options
  riskProfileOptions = [
    { label: 'Conservative', value: 'CONSERVATIVE' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Aggressive', value: 'AGGRESSIVE' }
  ];

  riskToleranceOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' }
  ];

  rebalancingStrategyOptions = [
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Threshold-based', value: 'THRESHOLD' }
  ];

  // Trades tab state
  trades: PortfolioTrade[] = [];
  tradesLoading = false;
  tradesError: string | null = null;
  tradesRetryCount = 0;

  constructor(
    private portfolioApiService: PortfolioApiService,
    private portfolioHoldingApiService: PortfolioHoldingApiService,
    private portfolioTradeApiService: PortfolioTradeApiService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // AUTHENTICATION DISABLED - Skip token check
    // TODO: Re-enable authentication check by uncommenting below when authentication is needed
    // if (!this.hasValidToken()) {
    //   this.goToLogin();
    //   return;
    // }
    
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
    
    this.loadPortfolios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clear caches on destroy
    this.portfolioCache.clear();
    this.holdingsCache.clear();
    this.tradesCache.clear();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    try {
      // Decode the JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  loadPortfolios(): void {
    // Check cache first
    const now = Date.now();
    const cachedData = this.portfolioCache.get('portfolios');
    
    if (cachedData && (now - this.portfolioCacheTimestamp) < this.CACHE_DURATION_MS) {
      // Use cached data
      this.portfolios = cachedData;
      this.applyFilters();
      this.cdr.markForCheck();
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.retryCount = 0;
    this.cdr.markForCheck();
    
    this.portfolioApiService.getPortfolios()
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            this.retryCount = retryCount;
            // Exponential backoff: 1s, 2s, 4s
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
          this.handlePortfolioLoadError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          // Ensure data is an array
          if (Array.isArray(data)) {
            // Enhance portfolios with mock performance data for demonstration
            this.portfolios = this.enhancePortfoliosWithMetrics(data);
            
            // Cache the data
            this.portfolioCache.set('portfolios', this.portfolios);
            this.portfolioCacheTimestamp = Date.now();
            
            this.applyFilters();
            this.error = null;
            
            // Trigger change detection
            this.cdr.markForCheck();
          } else {
            this.error = 'Invalid data format received from API. Please contact support.';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          // Error already handled in catchError
          this.cdr.markForCheck();
        }
      });
  }

  // Method to clear portfolio cache
  private clearPortfolioCache(): void {
    this.portfolioCache.clear();
    this.portfolioCacheTimestamp = 0;
  }
  
  // Method to clear holdings cache for a specific portfolio
  private clearHoldingsCache(portfolioId: string): void {
    this.holdingsCache.delete(portfolioId);
  }
  
  // Method to clear trades cache for a specific portfolio
  private clearTradesCache(portfolioId: string): void {
    this.tradesCache.delete(portfolioId);
  }

  private handlePortfolioLoadError(error: any): void {
    console.error('Error loading portfolios:', error);
    
    if (error.status === 0) {
      // Network error
      this.error = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.status === 401) {
      // Authentication error
      this.error = 'Your session has expired. Please log in again.';
      localStorage.removeItem('auth_token');
    } else if (error.status === 403) {
      // Authorization error
      this.error = 'You do not have permission to view portfolios.';
    } else if (error.status === 404) {
      // Not found
      this.error = 'Portfolio service not found. Please contact support.';
    } else if (error.status >= 500) {
      // Server error
      this.error = 'Server error occurred. Please try again later or contact support.';
    } else if (error.status === 408 || error.name === 'TimeoutError') {
      // Timeout error
      this.error = 'Request timed out. Please check your connection and try again.';
    } else {
      // Generic error
      this.error = error.error?.message || 'Failed to load portfolios. Please try again.';
    }
    
    // For demo purposes, create mock portfolios when API fails
    this.portfolios = this.createMockPortfolios();
    this.applyFilters();
    this.cdr.markForCheck();
  }

  // Create mock portfolios for demonstration
  private createMockPortfolios(): PortfolioWithMetrics[] {
    const mockPortfolios: PortfolioDto[] = [
      {
        id: '1',
        name: 'Tech Portfolio',
        description: 'Technology-focused growth portfolio with high-growth potential stocks',
        baseCurrency: 'INR',
        inceptionDate: '2024-01-15',
        riskProfile: 'MODERATE',
        isActive: true
      },
      {
        id: '2',
        name: 'Dividend Portfolio',
        description: 'Income-generating portfolio focused on dividend-paying stocks',
        baseCurrency: 'INR',
        inceptionDate: '2024-02-01',
        riskProfile: 'CONSERVATIVE',
        isActive: true
      },
      {
        id: '3',
        name: 'Momentum Portfolio',
        description: 'High-momentum trading portfolio with aggressive growth strategy',
        baseCurrency: 'INR',
        inceptionDate: '2024-01-01',
        riskProfile: 'AGGRESSIVE',
        isActive: true
      }
    ];

    return this.enhancePortfoliosWithMetrics(mockPortfolios);
  }

  // Enhance portfolios with mock performance metrics for demonstration
  private enhancePortfoliosWithMetrics(portfolios: PortfolioDto[]): PortfolioWithMetrics[] {
    return portfolios.map((portfolio, index) => {
      // Generate mock performance data based on portfolio type
      const baseReturn = 18.2; // Benchmark return
      let portfolioReturn: number;
      let outperformance: number;
      let stockCount: number;
      let rebalanceEvents: number;
      let lastRebalance: string;
      let performanceData: { portfolio: number[], benchmark: number[], labels: string[] };

      switch (portfolio.riskProfile) {
        case 'CONSERVATIVE':
          portfolioReturn = baseReturn - 1.8; // Underperforming
          outperformance = -1.8;
          stockCount = 15;
          rebalanceEvents = 3;
          lastRebalance = '1 month ago';
          performanceData = {
            portfolio: [100, 102, 105, 103, 107, 110, 108, 112, 115, 116.4],
            benchmark: [100, 102, 105, 107, 110, 113, 116, 118, 120, 118.2],
            labels: ['6M', '5M', '4M', '3M', '2M', '1M', '3W', '2W', '1W', 'Now']
          };
          break;
        case 'AGGRESSIVE':
          portfolioReturn = baseReturn + 13.3; // Outperforming
          outperformance = 13.3;
          stockCount = 10;
          rebalanceEvents = 4;
          lastRebalance = '1.5 months ago';
          performanceData = {
            portfolio: [100, 105, 112, 120, 128, 135, 142, 150, 158, 131.5],
            benchmark: [100, 102, 105, 107, 110, 113, 116, 118, 120, 118.2],
            labels: ['6M', '5M', '4M', '3M', '2M', '1M', '3W', '2W', '1W', 'Now']
          };
          break;
        default: // MODERATE
          portfolioReturn = baseReturn + 6.6; // Slightly outperforming
          outperformance = 6.6;
          stockCount = 12;
          rebalanceEvents = 2;
          lastRebalance = '2 months ago';
          performanceData = {
            portfolio: [100, 103, 107, 110, 115, 118, 122, 125, 128, 124.8],
            benchmark: [100, 102, 105, 107, 110, 113, 116, 118, 120, 118.2],
            labels: ['6M', '5M', '4M', '3M', '2M', '1M', '3W', '2W', '1W', 'Now']
          };
          break;
      }

      return {
        ...portfolio,
        totalReturn: portfolioReturn,
        benchmarkReturn: baseReturn,
        outperformance: outperformance,
        stockCount: stockCount,
        rebalanceEvents: rebalanceEvents,
        lastRebalance: lastRebalance,
        performanceData: performanceData
      };
    });
  }

  // Computed properties for summary cards
  get totalPortfolios(): number {
    return this.portfolios.length;
  }

  get activePortfolios(): number {
    return this.portfolios.filter(p => p.isActive).length;
  }

  get conservativePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'CONSERVATIVE').length;
  }

  get moderatePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'MODERATE').length;
  }

  get aggressivePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'AGGRESSIVE').length;
  }

  // Search and filtering methods
  onSearchChange(): void {
    // Use debounced search subject instead of immediate filtering
    this.searchSubject$.next(this.searchText);
  }

  onRiskProfileChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRiskProfile = null;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.portfolios];

    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(portfolio =>
        portfolio.name.toLowerCase().includes(searchLower) ||
        portfolio.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply risk profile filter
    if (this.selectedRiskProfile) {
      filtered = filtered.filter(portfolio =>
        portfolio.riskProfile === this.selectedRiskProfile
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof PortfolioWithMetrics];
      let bValue: any = b[this.sortField as keyof PortfolioWithMetrics];

      if (this.sortField === 'inceptionDate') {
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

    this.filteredPortfolios = filtered;
  }

  onSortChange(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.applyFilters();
  }



  // Action methods
  createPortfolio(): void {
    // Create a new empty portfolio for creation mode
    this.selectedPortfolio = {
      id: '', // Temporary ID for new portfolio
      name: '',
      description: '',
      baseCurrency: 'INR',
      inceptionDate: new Date().toISOString().split('T')[0], // Today's date
      riskProfile: 'MODERATE',
      isActive: true,
      // Add default metrics for new portfolio
      totalReturn: 0,
      benchmarkReturn: 0,
      outperformance: 0,
      stockCount: 0,
      rebalanceEvents: 0,
      lastRebalance: 'N/A',
      performanceData: {
        portfolio: [100],
        benchmark: [100],
        labels: ['Now']
      }
    };
    // Switch to Configure tab for new portfolio creation
    this.activeTab = 'configure';
  }

  selectPortfolio(portfolio: PortfolioWithMetrics): void {
    this.selectedPortfolio = portfolio;
    // Default to overview tab when selecting a portfolio
    this.activeTab = 'overview';
    // Load portfolio configuration into form
    this.loadConfigForm(portfolio);
    
    // Reset lazy loading flags when selecting a new portfolio
    this.holdingsLoaded = false;
    this.tradesLoaded = false;
  }

  // Method to handle tab changes
  onTabChange(tab: 'overview' | 'configure' | 'holdings' | 'trades' | string | number | undefined): void {
    if (tab !== undefined) {
      // Handle both string and number types from PrimeNG tabs
      const tabValue = typeof tab === 'string' ? tab : tab.toString();
      if (tabValue === 'overview' || tabValue === 'configure' || tabValue === 'holdings' || tabValue === 'trades') {
        this.activeTab = tabValue;
        
        // Lazy load data when switching to specific tabs (only load once)
        if (tabValue === 'holdings' && this.selectedPortfolio && !this.holdingsLoaded) {
          this.loadHoldings(this.selectedPortfolio.id);
          this.holdingsLoaded = true;
        } else if (tabValue === 'trades' && this.selectedPortfolio && !this.tradesLoaded) {
          this.loadTrades(this.selectedPortfolio.id);
          this.tradesLoaded = true;
        }
      }
    }
  }

  // Track function for ngFor
  trackPortfolioById(index: number, portfolio: PortfolioWithMetrics): string {
    return portfolio.id;
  }

  // Get Y position for rebalance events on the chart
  getRebalanceYPosition(performanceData: number[], xPosition: number): number {
    if (!performanceData || performanceData.length === 0) return 50;
    
    // Calculate the index based on x position (0-100 range)
    const dataIndex = Math.floor((xPosition / 100) * (performanceData.length - 1));
    const value = performanceData[dataIndex] || performanceData[performanceData.length - 1];
    
    // Normalize value to chart Y coordinate (inverted because SVG Y=0 is at top)
    const minValue = Math.min(...performanceData);
    const maxValue = Math.max(...performanceData);
    const range = maxValue - minValue;
    
    if (range === 0) return 50;
    
    const normalizedY = ((value - minValue) / range) * 80 + 10; // 10-90 range
    return 100 - normalizedY; // Invert for SVG coordinate system
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

  // Performance formatting methods
  formatReturn(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getPerformanceColor(value: number): string {
    if (value === undefined || value === null) return 'var(--text-color-secondary)';
    return value >= 0 ? 'var(--green-600)' : 'var(--red-600)';
  }

  getPortfolioIcon(riskProfile: string): string {
    switch (riskProfile) {
      case 'CONSERVATIVE':
        return 'pi pi-shield';
      case 'AGGRESSIVE':
        return 'pi pi-arrow-up';
      default:
        return 'pi pi-chart-line';
    }
  }

  // Chart and visualization methods
  getPortfolioColor(riskProfile: string): string {
    switch (riskProfile) {
      case 'CONSERVATIVE':
        return '#ff9800'; // Orange
      case 'AGGRESSIVE':
        return '#9c27b0'; // Purple
      default:
        return '#4caf50'; // Green
    }
  }

  getChartHeight(performanceData: number[]): string {
    if (!performanceData || performanceData.length === 0) return '100px';
    
    // Calculate relative height based on performance data
    const maxValue = Math.max(...performanceData);
    const minValue = Math.min(...performanceData);
    const range = maxValue - minValue;
    
    if (range === 0) return '100px';
    
    // Normalize to chart height (100px base)
    const normalizedHeight = ((performanceData[performanceData.length - 1] - minValue) / range) * 80 + 20;
    return `${normalizedHeight}px`;
  }

  getRebalancePositions(eventCount: number): number[] {
    if (!eventCount || eventCount === 0) return [];
    
    // Distribute rebalance events across the chart width
    const positions: number[] = [];
    for (let i = 0; i < eventCount; i++) {
      // Distribute evenly across the chart (20% to 80% of width)
      const position = 20 + (i + 1) * (60 / (eventCount + 1));
      positions.push(position);
    }
    return positions;
  }

  // Enhanced chart visualization methods
  getChartPath(performanceData: number[]): string {
    if (!performanceData || performanceData.length < 2) return '';
    
    const points = performanceData.map((value, index) => {
      const x = (index / (performanceData.length - 1)) * 100;
      const y = 100 - ((value - Math.min(...performanceData)) / (Math.max(...performanceData) - Math.min(...performanceData))) * 80;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }

  getChartGradient(riskProfile: string): string {
    const color = this.getPortfolioColor(riskProfile);
    return `linear-gradient(180deg, ${color}20 0%, ${color} 100%)`;
  }

  // Configure tab methods
  private getDefaultConfigForm(): PortfolioConfigForm {
    return {
      name: '',
      description: '',
      riskProfile: 'MODERATE',
      riskTolerance: 'MEDIUM',
      rebalancingStrategy: 'QUARTERLY',
      rebalancingThreshold: 5,
      automatedExecution: false,
      notificationSettings: true,
      taxHarvesting: false
    };
  }

  private loadConfigForm(portfolio: PortfolioWithMetrics): void {
    this.configForm = {
      name: portfolio.name || '',
      description: portfolio.description || '',
      riskProfile: portfolio.riskProfile || 'MODERATE',
      riskTolerance: 'MEDIUM', // Default value, not in DTO
      rebalancingStrategy: 'QUARTERLY', // Default value, not in DTO
      rebalancingThreshold: 5, // Default value, not in DTO
      automatedExecution: false, // Default value, not in DTO
      notificationSettings: true, // Default value, not in DTO
      taxHarvesting: false // Default value, not in DTO
    };
    // Store original values for reset functionality
    this.originalConfigForm = { ...this.configForm };
    this.configFormDirty = false;
  }

  onConfigFormChange(): void {
    // Check if form has been modified
    this.configFormDirty = JSON.stringify(this.configForm) !== JSON.stringify(this.originalConfigForm);
  }

  isConfigFormValid(): boolean {
    // Check if required fields are filled
    return !!(
      this.configForm.name.trim() &&
      this.configForm.description.trim() &&
      this.configForm.riskProfile &&
      this.configForm.riskTolerance &&
      this.configForm.rebalancingStrategy &&
      this.configForm.rebalancingThreshold > 0
    );
  }

  isSaveButtonEnabled(): boolean {
    return this.configFormDirty && this.isConfigFormValid();
  }

  saveConfiguration(): void {
    if (!this.selectedPortfolio || !this.isConfigFormValid()) {
      return;
    }

    this.savingConfig = true;
    const isNewPortfolio = !this.selectedPortfolio.id;

    const portfolioData = {
      name: this.configForm.name,
      description: this.configForm.description,
      riskProfile: this.configForm.riskProfile,
      isActive: true
    };

    const apiCall = isNewPortfolio
      ? this.portfolioApiService.createPortfolio(portfolioData)
      : this.portfolioApiService.updatePortfolio(this.selectedPortfolio.id, portfolioData);

    apiCall
      .pipe(
        retry({
          count: 1,
          delay: 1000
        }),
        takeUntil(this.destroy$),
        finalize(() => this.savingConfig = false),
        catchError((error) => {
          this.handleSaveConfigError(error, isNewPortfolio);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (updatedPortfolio) => {
          this.toastService.show(
            'success',
            isNewPortfolio ? 'Portfolio Created' : 'Configuration Saved',
            isNewPortfolio
              ? 'Portfolio has been created successfully'
              : 'Portfolio configuration has been saved successfully'
          );

          // Clear portfolio cache to force refresh
          this.clearPortfolioCache();

          // Update the portfolio in the list
          if (isNewPortfolio) {
            // Reload portfolios to get the new one
            this.loadPortfolios();
          } else {
            // Update existing portfolio in the list
            const index = this.portfolios.findIndex(p => p.id === updatedPortfolio.id);
            if (index !== -1) {
              this.portfolios[index] = {
                ...this.portfolios[index],
                ...updatedPortfolio
              };
              this.applyFilters();
            }
            
            // Clear holdings and trades cache for this portfolio
            this.clearHoldingsCache(updatedPortfolio.id);
            this.clearTradesCache(updatedPortfolio.id);
          }

          // Update selected portfolio and form state
          if (this.selectedPortfolio) {
            this.selectedPortfolio = {
              ...this.selectedPortfolio,
              ...updatedPortfolio
            };
          }
          this.originalConfigForm = { ...this.configForm };
          this.configFormDirty = false;
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  private handleSaveConfigError(error: any, isNewPortfolio: boolean): void {
    console.error('Error saving portfolio configuration:', error);
    
    let errorMessage: string;
    
    if (error.status === 0) {
      errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid portfolio data. Please check your inputs and try again.';
    } else if (error.status === 401) {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to ' + (isNewPortfolio ? 'create' : 'update') + ' portfolios.';
    } else if (error.status === 404) {
      errorMessage = 'Portfolio not found. It may have been deleted.';
    } else if (error.status === 409) {
      errorMessage = 'A portfolio with this name already exists. Please choose a different name.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error occurred. Please try again later or contact support.';
    } else if (error.status === 408 || error.name === 'TimeoutError') {
      errorMessage = 'Request timed out. Please try again.';
    } else {
      errorMessage = error.error?.message || 'Failed to save portfolio configuration. Please try again.';
    }
    
    this.toastService.showError({
      summary: isNewPortfolio ? 'Create Failed' : 'Save Failed',
      detail: errorMessage
    });
  }

  resetConfiguration(): void {
    if (!this.selectedPortfolio) {
      return;
    }

    // Restore original form values
    this.configForm = { ...this.originalConfigForm };
    this.configFormDirty = false;
  }

  // Configure component event handlers
  onConfigureSave(updatedPortfolio: PortfolioWithMetrics): void {
    // Update the portfolio in the list
    const index = this.portfolios.findIndex(p => p.id === updatedPortfolio.id);
    if (index !== -1) {
      this.portfolios[index] = updatedPortfolio;
      this.selectedPortfolio = updatedPortfolio;
    } else {
      // New portfolio created
      this.portfolios.push(updatedPortfolio);
      this.selectedPortfolio = updatedPortfolio;
    }
    this.applyFilters();
    this.cdr.markForCheck();
    this.toastService.show('success', 'Success', 'Portfolio saved successfully');
  }

  onConfigureCancel(): void {
    // Handle cancel if needed
  }

  // Holdings tab methods
  loadHoldings(portfolioId: string): void {
    // Check cache first
    const cachedHoldings = this.holdingsCache.get(portfolioId);
    const now = Date.now();
    
    if (cachedHoldings && (now - cachedHoldings.timestamp) < this.CACHE_DURATION_MS) {
      // Use cached data
      this.holdings = cachedHoldings.data;
      this.holdingsError = null;
      this.cdr.markForCheck();
      return;
    }
    
    this.holdingsLoading = true;
    this.holdingsError = null;
    this.holdingsRetryCount = 0;
    this.cdr.markForCheck();
    
    this.portfolioHoldingApiService.getHoldings(portfolioId)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            this.holdingsRetryCount = retryCount;
            // Exponential backoff: 1s, 2s
            return timer(Math.pow(2, retryCount - 1) * 1000);
          }
        }),
        takeUntil(this.destroy$),
        finalize(() => {
          this.holdingsLoading = false;
          this.holdingsRetryCount = 0;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleHoldingsLoadError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.holdings = Array.isArray(data) ? data : [];
          
          // Cache the data
          this.holdingsCache.set(portfolioId, {
            data: this.holdings,
            timestamp: Date.now()
          });
          
          this.holdingsError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
          this.cdr.markForCheck();
        }
      });
  }

  private handleHoldingsLoadError(error: any): void {
    console.error('Error loading holdings:', error);
    
    if (error.status === 0) {
      this.holdingsError = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.holdingsError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.holdingsError = 'You do not have permission to view holdings for this portfolio.';
    } else if (error.status === 404) {
      this.holdingsError = 'Portfolio not found. It may have been deleted.';
    } else if (error.status >= 500) {
      this.holdingsError = 'Server error occurred. Please try again later.';
    } else if (error.status === 408 || error.name === 'TimeoutError') {
      this.holdingsError = 'Request timed out. Please try again.';
    } else {
      this.holdingsError = error.error?.message || 'Failed to load holdings. Please try again.';
    }
  }

  // Calculate unrealized P&L for a holding
  calculateUnrealizedPnl(holding: PortfolioHolding): number {
    if (!holding.currentPrice) {
      return 0;
    }
    return (holding.currentPrice - holding.avgCost) * holding.quantity;
  }

  // Calculate unrealized P&L percentage for a holding
  calculateUnrealizedPnlPct(holding: PortfolioHolding): number {
    if (!holding.currentPrice || holding.avgCost === 0) {
      return 0;
    }
    return ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
  }

  // Format currency values
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  // Format percentage values
  formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  // Trades tab methods
  loadTrades(portfolioId: string): void {
    // Check cache first
    const cachedTrades = this.tradesCache.get(portfolioId);
    const now = Date.now();
    
    if (cachedTrades && (now - cachedTrades.timestamp) < this.CACHE_DURATION_MS) {
      // Use cached data
      this.trades = cachedTrades.data;
      this.tradesError = null;
      this.cdr.markForCheck();
      return;
    }
    
    this.tradesLoading = true;
    this.tradesError = null;
    this.tradesRetryCount = 0;
    this.cdr.markForCheck();
    
    this.portfolioTradeApiService.getTrades(portfolioId)
      .pipe(
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            this.tradesRetryCount = retryCount;
            // Exponential backoff: 1s, 2s
            return timer(Math.pow(2, retryCount - 1) * 1000);
          }
        }),
        takeUntil(this.destroy$),
        finalize(() => {
          this.tradesLoading = false;
          this.tradesRetryCount = 0;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleTradesLoadError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.trades = Array.isArray(data) ? data : [];
          
          // Cache the data
          this.tradesCache.set(portfolioId, {
            data: this.trades,
            timestamp: Date.now()
          });
          
          this.tradesError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
          this.cdr.markForCheck();
        }
      });
  }

  private handleTradesLoadError(error: any): void {
    console.error('Error loading trades:', error);
    
    if (error.status === 0) {
      this.tradesError = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.tradesError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.tradesError = 'You do not have permission to view trades for this portfolio.';
    } else if (error.status === 404) {
      this.tradesError = 'Portfolio not found. It may have been deleted.';
    } else if (error.status >= 500) {
      this.tradesError = 'Server error occurred. Please try again later.';
    } else if (error.status === 408 || error.name === 'TimeoutError') {
      this.tradesError = 'Request timed out. Please try again.';
    } else {
      this.tradesError = error.error?.message || 'Failed to load trades. Please try again.';
    }
  }

  // Format date for trades table
  formatTradeDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

}