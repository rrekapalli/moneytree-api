import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';

@Component({
  selector: 'app-portfolio-overview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    CheckboxModule,
    PanelModule,
    ScrollPanelModule,
    FormsModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class PortfolioOverviewComponent {
  @Input() portfolios: PortfolioWithMetrics[] = [];
  @Input() filteredPortfolios: PortfolioWithMetrics[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() searchText = '';
  @Input() selectedRiskProfile: string | null = null;
  @Input() layout: 'list' | 'grid' = 'grid';
  @Input() sortField = 'name';
  @Input() sortOrder = 1;
  @Input() riskProfileOptions: any[] = [];

  @Output() searchChange = new EventEmitter<void>();
  @Output() riskProfileChange = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() layoutChange = new EventEmitter<'list' | 'grid'>();
  @Output() configurePortfolio = new EventEmitter<PortfolioWithMetrics>();
  @Output() optimizePortfolio = new EventEmitter<PortfolioWithMetrics>();
  @Output() createPortfolio = new EventEmitter<void>();
  @Output() goToLogin = new EventEmitter<void>();

  // Track function for ngFor
  trackPortfolioById(index: number, portfolio: PortfolioWithMetrics): number {
    return portfolio.id;
  }

  // Utility methods for portfolio display
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

  formatReturn(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getPerformanceColor(value: number): string {
    if (value === undefined || value === null) return 'var(--text-color-secondary)';
    return value >= 0 ? 'var(--green-600)' : 'var(--red-600)';
  }

  // Utility methods for list view
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

  getChartPath(performanceData: number[]): string {
    if (!performanceData || performanceData.length < 2) return '';
    
    const points = performanceData.map((value, index) => {
      const x = (index / (performanceData.length - 1)) * 100;
      const y = 100 - ((value - Math.min(...performanceData)) / (Math.max(...performanceData) - Math.min(...performanceData))) * 80;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
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

  onSearchChange(): void {
    this.searchChange.emit();
  }

  onRiskProfileChange(): void {
    this.riskProfileChange.emit();
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }

  onSortChange(field: string): void {
    this.sortChange.emit(field);
  }

  onLayoutChange(layout: 'list' | 'grid'): void {
    this.layoutChange.emit(layout);
  }

  onConfigurePortfolio(portfolio: PortfolioWithMetrics): void {
    this.configurePortfolio.emit(portfolio);
  }

  onOptimizePortfolio(portfolio: PortfolioWithMetrics): void {
    this.optimizePortfolio.emit(portfolio);
  }

  onCreatePortfolio(): void {
    this.createPortfolio.emit();
  }

  onGoToLogin(): void {
    this.goToLogin.emit();
  }
}
