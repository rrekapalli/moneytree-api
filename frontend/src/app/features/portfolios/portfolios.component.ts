import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subject, takeUntil, finalize } from 'rxjs';

import { PortfolioApiService } from '../../services/apis/portfolio.api';
import { PortfolioDto } from '../../services/entities/portfolio.entities';
import { PortfolioWithMetrics } from './portfolio.types';
import { PortfolioOverviewComponent } from './overview/overview.component';
import { PortfolioConfigureComponent } from './configure/configure.component';
import { PortfolioOptimizeComponent } from './optimize/optimize.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

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
    PortfolioOverviewComponent,
    PortfolioConfigureComponent,
    PortfolioOptimizeComponent,
    PageHeaderComponent
  ],
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.scss']
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  portfolios: PortfolioWithMetrics[] = [];
  filteredPortfolios: PortfolioWithMetrics[] = [];
  loading = false;
  error: string | null = null;
  
  // Search and filter properties
  searchText = '';
  selectedRiskProfile: string | null = null;
  layout: 'list' | 'grid' = 'grid';
  
  // Sorting properties
  sortField: string = 'name';
  sortOrder: number = 1;
  
  // Selected portfolio for configuration/optimization
  selectedPortfolio: PortfolioWithMetrics | null = null;
  
  // Active tab index for switching between tabs
  activeTab: string = "0";


  
  // Risk profile options for filter
  riskProfileOptions = [
    { label: 'Conservative', value: 'CONSERVATIVE' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Aggressive', value: 'AGGRESSIVE' }
  ];

  constructor(private portfolioApiService: PortfolioApiService) {}

  ngOnInit(): void {
    // Check if user has a valid token
    if (!this.hasValidToken()) {
      this.goToLogin();
      return;
    }
    
    this.loadPortfolios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.loading = true;
    this.error = null;
    
    this.portfolioApiService.getPortfolios()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          // Ensure data is an array
          if (Array.isArray(data)) {
            // Enhance portfolios with mock performance data for demonstration
            this.portfolios = this.enhancePortfoliosWithMetrics(data);
            this.applyFilters();
          } else {
            this.error = 'Invalid data format received from API';
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.error = 'Authentication expired. Please log in again.';
            // Clear invalid token
            localStorage.removeItem('auth_token');
          } else {
            // For demo purposes, create mock portfolios when API fails
            this.portfolios = this.createMockPortfolios();
            this.applyFilters();
          }
        }
      });
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
    this.applyFilters();
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
    this.activeTab = "1";
  }

  selectPortfolio(portfolio: PortfolioWithMetrics): void {
    // TODO: Navigate to portfolio details
  }

  editPortfolio(portfolio: PortfolioWithMetrics): void {
    // TODO: Implement portfolio editing
  }

  configurePortfolio(portfolio: PortfolioWithMetrics): void {
    this.selectedPortfolio = portfolio;
    this.activeTab = "1"; // Switch to Configure tab
  }

  optimizePortfolio(portfolio: PortfolioWithMetrics): void {
    this.selectedPortfolio = portfolio;
    this.activeTab = "2"; // Switch to Optimize tab
  }

  // Method to reset to Overview tab
  resetToOverview(): void {
    this.activeTab = "0";
    this.selectedPortfolio = null;
  }

  // Method to handle tab changes
  onTabChange(index: string | number | undefined): void {
    if (index !== undefined) {
      this.activeTab = typeof index === 'string' ? index : index.toString();
    }
  }

  viewPortfolioData(portfolio: PortfolioWithMetrics): void {
    // TODO: Navigate to portfolio data view
  }

  viewPortfolioInsights(portfolio: PortfolioWithMetrics): void {
    // TODO: Navigate to portfolio insights
  }

  goToLogin(): void {
    window.location.href = '/login';
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

  // Methods for child component communication
  onSaveChanges(portfolio: PortfolioWithMetrics): void {
    if (!portfolio.id || portfolio.id === '') {
      // This is a new portfolio creation
      // TODO: Implement API call to create portfolio
      // For now, simulate creation by adding to local array
      const newPortfolio = {
        ...portfolio,
        id: Date.now().toString(), // Generate a unique ID
        inceptionDate: new Date().toISOString().split('T')[0]
      };
      this.portfolios.push(newPortfolio);
      
      // For new portfolios, navigate to Overview to see the created portfolio
      this.resetToOverview();
    } else {
      // This is an existing portfolio update
      // TODO: Implement API call to update portfolio
      const index = this.portfolios.findIndex(p => p.id === portfolio.id);
      if (index !== -1) {
        this.portfolios[index] = { ...portfolio };
      }
      
      // For existing portfolio updates, stay on Configure tab to see the changes
      // Don't call resetToOverview() - let user stay on current tab
    }
  }

  onCancel(): void {
    // TODO: Implement cancel logic
    // Don't automatically navigate to Overview - let user decide where to go
    // Just clear the selected portfolio to exit edit mode
    this.selectedPortfolio = null;
  }

  onApplyOptimization(portfolio: PortfolioWithMetrics): void {
    // TODO: Implement optimization logic
    // Don't automatically navigate to Overview - let user decide where to go
    // Just clear the selected portfolio to exit optimization mode
    this.selectedPortfolio = null;
  }

  goToOverview(): void {
    this.activeTab = "0";
    this.selectedPortfolio = null;
  }
}