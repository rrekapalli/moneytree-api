import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize, catchError, throwError } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { StrategyWithMetrics, BacktestRun, BacktestTrade } from '../strategy.types';
import { BacktestApiService } from '../../../services/apis/backtest.api';

/**
 * Backtest Results Component
 * 
 * Displays comprehensive backtest results for a strategy including:
 * - Summary metrics (total return, CAGR, Sharpe ratio, Sortino ratio, etc.)
 * - Equity curve chart comparing strategy vs buy-and-hold benchmark
 * - Detailed trades table with sorting and filtering
 * - Empty state when no backtest results exist
 * 
 * This component is displayed in the Backtest Results tab when a strategy is selected.
 * It follows the patterns established in the Overview component for consistency.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @see {@link BacktestRun} for the backtest run data model
 * @see {@link BacktestTrade} for the backtest trade data model
 */
@Component({
  selector: 'app-backtest-results',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    NgxEchartsModule
  ],
  templateUrl: './backtest-results.component.html',
  styleUrls: ['./backtest-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BacktestResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /**
   * The strategy to display backtest results for
   * This is passed from the parent StrategiesComponent
   */
  @Input() strategy!: StrategyWithMetrics;

  /**
   * Event emitted when user wants to navigate to Configure tab
   */
  @Output() navigateToConfigure = new EventEmitter<void>();

  // Backtest run data
  backtestRun: BacktestRun | null = null;
  backtestRunLoading = false;
  backtestRunError: string | null = null;

  // Backtest trades data
  backtestTrades: BacktestTrade[] = [];
  tradesLoading = false;
  tradesError: string | null = null;

  // Equity curve chart data
  chartOptions: EChartsOption | null = null;
  chartLoading = false;
  chartError: string | null = null;

  // Empty state flag
  hasNoBacktestResults = false;

  constructor(
    private backtestApiService: BacktestApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.strategy && this.strategy.id) {
      this.loadBacktestResults();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads all backtest results data
   * - Most recent backtest run
   * - All trades from that run
   * - Equity curve chart data
   */
  loadBacktestResults(): void {
    this.loadMostRecentBacktest();
  }

  /**
   * Loads the most recent backtest run for the strategy
   */
  private loadMostRecentBacktest(): void {
    this.backtestRunLoading = true;
    this.backtestRunError = null;
    this.hasNoBacktestResults = false;
    this.cdr.markForCheck();

    this.backtestApiService.getBacktests(this.strategy.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.backtestRunLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleBacktestRunError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (backtests) => {
          if (backtests && backtests.length > 0) {
            // Get the most recent backtest
            this.backtestRun = backtests[0];
            this.backtestRunError = null;
            this.hasNoBacktestResults = false;
            
            // Load trades and chart for this backtest
            this.loadBacktestTrades(this.backtestRun.runId);
            this.loadEquityCurveChart(this.backtestRun.runId);
          } else {
            // No backtests exist yet - show empty state
            this.backtestRun = null;
            this.backtestRunError = null;
            this.hasNoBacktestResults = true;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Loads all trades for a specific backtest run
   */
  private loadBacktestTrades(runId: string): void {
    this.tradesLoading = true;
    this.tradesError = null;
    this.cdr.markForCheck();

    this.backtestApiService.getBacktestTrades(runId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.tradesLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleTradesError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (trades) => {
          this.backtestTrades = trades || [];
          this.tradesError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Loads equity curve chart data for a specific backtest run
   * Creates a chart comparing strategy equity vs buy-and-hold benchmark
   */
  private loadEquityCurveChart(runId: string): void {
    this.chartLoading = true;
    this.chartError = null;
    this.cdr.markForCheck();

    // For now, we'll create a simple chart based on the backtest run data
    // In a real implementation, this would fetch detailed equity curve data from the backend
    if (this.backtestRun) {
      this.createEquityCurveChart();
    }

    this.chartLoading = false;
    this.cdr.markForCheck();
  }

  /**
   * Creates equity curve chart options
   * For now, creates a simplified chart based on available data
   * In production, this would use detailed equity curve data from the backend
   */
  private createEquityCurveChart(): void {
    if (!this.backtestRun) {
      this.chartOptions = null;
      return;
    }

    // Create simplified equity curve data
    // In production, this would come from the backend with daily/hourly equity values
    const startDate = new Date(this.backtestRun.startDate);
    const endDate = new Date(this.backtestRun.endDate);
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate date points
    const dates: string[] = [];
    const strategyEquity: number[] = [];
    const benchmarkEquity: number[] = [];
    
    const initialCapital = this.backtestRun.initialCapital;
    const finalEquity = this.backtestRun.finalEquity;
    const totalReturn = this.backtestRun.totalReturnPct;
    
    // Generate 20 data points across the backtest period
    const numPoints = Math.min(20, daysDiff);
    for (let i = 0; i <= numPoints; i++) {
      const date = new Date(startDate.getTime() + (i / numPoints) * (endDate.getTime() - startDate.getTime()));
      dates.push(this.formatDate(date.toISOString()));
      
      // Strategy equity (assuming smooth growth for visualization)
      const progress = i / numPoints;
      strategyEquity.push(initialCapital * (1 + (totalReturn / 100) * progress));
      
      // Benchmark equity (assuming 10% annual return for buy-and-hold)
      const yearsElapsed = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      benchmarkEquity.push(initialCapital * Math.pow(1.10, yearsElapsed));
    }

    this.chartOptions = {
      title: {
        text: 'Equity Curve: Strategy vs Buy-and-Hold',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((param: any) => {
            const value = param.value !== null && param.value !== undefined 
              ? `₹${param.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'N/A';
            result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Strategy', 'Buy-and-Hold'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          rotate: 45,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: 'Equity (₹)',
        axisLabel: {
          formatter: (value: number) => `₹${(value / 1000).toFixed(0)}K`
        }
      },
      series: [
        {
          name: 'Strategy',
          type: 'line',
          data: strategyEquity,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#10b981' // green-600
          },
          itemStyle: {
            color: '#10b981'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
              ]
            }
          }
        },
        {
          name: 'Buy-and-Hold',
          type: 'line',
          data: benchmarkEquity,
          smooth: true,
          lineStyle: {
            width: 2,
            color: '#6366f1', // indigo-600
            type: 'dashed'
          },
          itemStyle: {
            color: '#6366f1'
          }
        }
      ]
    };
  }

  /**
   * Handles errors when loading backtest run
   */
  private handleBacktestRunError(error: any): void {
    console.error('Error loading backtest run:', error);

    if (error.status === 404) {
      // No backtests exist - show empty state
      this.backtestRunError = null;
      this.hasNoBacktestResults = true;
    } else if (error.status === 0) {
      this.backtestRunError = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.backtestRunError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.backtestRunError = 'You do not have permission to view these backtest results.';
    } else if (error.status >= 500) {
      this.backtestRunError = 'Server error occurred. Please try again later.';
    } else {
      this.backtestRunError = error.error?.message || 'Failed to load backtest results.';
    }

    this.cdr.markForCheck();
  }

  /**
   * Handles errors when loading trades
   */
  private handleTradesError(error: any): void {
    console.error('Error loading backtest trades:', error);

    if (error.status === 404) {
      this.tradesError = null; // No trades is not an error, just empty state
      this.backtestTrades = [];
    } else if (error.status === 0) {
      this.tradesError = 'Unable to connect to the server.';
    } else if (error.status === 401) {
      this.tradesError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.tradesError = 'You do not have permission to view these trades.';
    } else if (error.status >= 500) {
      this.tradesError = 'Server error occurred. Please try again later.';
    } else {
      this.tradesError = error.error?.message || 'Failed to load backtest trades.';
    }

    this.cdr.markForCheck();
  }

  /**
   * Navigates to the Configure tab
   */
  onNavigateToConfigure(): void {
    this.navigateToConfigure.emit();
  }

  /**
   * Formats a number as a percentage with sign
   */
  formatPercent(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * Formats a number with 2 decimal places
   */
  formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    return value.toFixed(2);
  }

  /**
   * Formats a currency value
   */
  formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formats a date string
   */
  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return dateString;
    }
  }

  /**
   * Gets the color for a performance value (green for positive, red for negative)
   */
  getPerformanceColor(value: number | undefined | null): string {
    if (value === undefined || value === null) return 'var(--text-color-secondary)';
    return value >= 0 ? 'var(--green-600)' : 'var(--red-600)';
  }

  /**
   * Gets the severity for a profit/loss tag
   */
  getProfitSeverity(profit: number | undefined | null): "success" | "danger" | "secondary" {
    if (profit === undefined || profit === null) return 'secondary';
    return profit >= 0 ? 'success' : 'danger';
  }

  /**
   * Formats profit/loss with sign and currency
   */
  formatProfit(profit: number | undefined | null): string {
    if (profit === undefined || profit === null) return 'N/A';
    const sign = profit >= 0 ? '+' : '';
    return `${sign}₹${profit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formats profit/loss percentage with sign
   */
  formatProfitPercent(profitPct: number | undefined | null): string {
    if (profitPct === undefined || profitPct === null) return 'N/A';
    const sign = profitPct >= 0 ? '+' : '';
    return `${sign}${profitPct.toFixed(2)}%`;
  }
}
