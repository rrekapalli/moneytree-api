import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize, catchError, throwError, forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

import { StrategyWithMetrics, BacktestTrade } from '../strategy.types';
import { StrategyMetricsApiService, StrategyMetrics } from '../../../services/apis/strategy-metrics.api';
import { BacktestApiService } from '../../../services/apis/backtest.api';

/**
 * Overview Component
 * 
 * Displays a comprehensive dashboard of strategy performance including:
 * - Key performance metrics (total return, CAGR, Sharpe ratio, etc.)
 * - Performance chart comparing strategy vs benchmark
 * - Recent trades table
 * - Current positions (if any)
 * - Strategy status indicators
 * 
 * This component is displayed in the Overview tab when a strategy is selected.
 * It follows the patterns established in the Portfolios page for consistency.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 * 
 * @see {@link StrategyWithMetrics} for the strategy data model
 * @see {@link StrategyMetrics} for the metrics data model
 */
@Component({
  selector: 'app-strategy-overview',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    NgxEchartsModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /**
   * The strategy to display overview for
   * This is passed from the parent StrategiesComponent
   */
  @Input() strategy!: StrategyWithMetrics;

  // Performance metrics
  metrics: StrategyMetrics | null = null;
  metricsLoading = false;
  metricsError: string | null = null;

  // Recent trades
  recentTrades: BacktestTrade[] = [];
  tradesLoading = false;
  tradesError: string | null = null;

  // Performance chart data
  chartOptions: EChartsOption | null = null;
  chartLoading = false;
  chartError: string | null = null;

  constructor(
    private metricsApiService: StrategyMetricsApiService,
    private backtestApiService: BacktestApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.strategy && this.strategy.id) {
      this.loadOverviewData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads all data needed for the overview tab
   * - Performance metrics
   * - Recent trades
   * - Performance chart data
   */
  private loadOverviewData(): void {
    this.loadMetrics();
    this.loadRecentTrades();
    this.loadPerformanceChart();
  }

  /**
   * Loads the latest performance metrics for the strategy
   */
  private loadMetrics(): void {
    this.metricsLoading = true;
    this.metricsError = null;
    this.cdr.markForCheck();

    this.metricsApiService.getMetrics(this.strategy.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.metricsLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleMetricsError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (metrics) => {
          this.metrics = metrics;
          this.metricsError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Loads recent trades for the strategy
   * Gets trades from the most recent backtest run
   */
  private loadRecentTrades(): void {
    this.tradesLoading = true;
    this.tradesError = null;
    this.cdr.markForCheck();

    // First, get the list of backtests for this strategy
    this.backtestApiService.getBacktests(this.strategy.id)
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
        next: (backtests) => {
          if (backtests && backtests.length > 0) {
            // Get trades from the most recent backtest
            const mostRecentBacktest = backtests[0];
            this.loadTradesForBacktest(mostRecentBacktest.runId);
          } else {
            // No backtests exist yet
            this.recentTrades = [];
            this.tradesError = null;
            this.cdr.markForCheck();
          }
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Loads trades for a specific backtest run
   */
  private loadTradesForBacktest(runId: string): void {
    this.backtestApiService.getBacktestTrades(runId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.handleTradesError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (trades) => {
          // Get the 10 most recent trades
          this.recentTrades = trades.slice(0, 10);
          this.tradesError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Loads performance chart data
   * Fetches historical metrics and creates a line chart comparing strategy vs benchmark
   */
  private loadPerformanceChart(): void {
    this.chartLoading = true;
    this.chartError = null;
    this.cdr.markForCheck();

    this.metricsApiService.getMetricsHistory(this.strategy.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.chartLoading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleChartError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (metricsHistory) => {
          if (metricsHistory && metricsHistory.length > 0) {
            this.createChartOptions(metricsHistory);
          } else {
            this.chartOptions = null;
            this.chartError = null;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Creates ECharts options from metrics history data
   */
  private createChartOptions(metricsHistory: StrategyMetrics[]): void {
    // Sort by date ascending for proper chart display
    const sortedMetrics = [...metricsHistory].sort((a, b) => 
      new Date(a.metricDate).getTime() - new Date(b.metricDate).getTime()
    );

    // Extract dates and returns
    const dates = sortedMetrics.map(m => this.formatDate(m.metricDate));
    const returns = sortedMetrics.map(m => m.totalReturn);

    // Create benchmark data (simple buy-and-hold comparison)
    // For now, we'll use a simple linear growth as benchmark
    // In a real implementation, this would come from actual benchmark data
    const benchmarkReturns = sortedMetrics.map((_, index) => {
      // Simple linear growth for demonstration
      return (index / sortedMetrics.length) * 10; // 10% total return over period
    });

    this.chartOptions = {
      title: {
        text: 'Strategy Performance vs Benchmark',
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
              ? `${param.value >= 0 ? '+' : ''}${param.value.toFixed(2)}%`
              : 'N/A';
            result += `${param.marker} ${param.seriesName}: ${value}<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['Strategy', 'Benchmark'],
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
        name: 'Return (%)',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: 'Strategy',
          type: 'line',
          data: returns,
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
          name: 'Benchmark',
          type: 'line',
          data: benchmarkReturns,
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
   * Handles errors when loading chart data
   */
  private handleChartError(error: any): void {
    console.error('Error loading performance chart:', error);

    if (error.status === 404) {
      this.chartError = null; // No data is not an error, just empty state
      this.chartOptions = null;
    } else if (error.status === 0) {
      this.chartError = 'Unable to connect to the server.';
    } else if (error.status === 401) {
      this.chartError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.chartError = 'You do not have permission to view this chart.';
    } else if (error.status >= 500) {
      this.chartError = 'Server error occurred. Please try again later.';
    } else {
      this.chartError = error.error?.message || 'Failed to load performance chart.';
    }

    this.cdr.markForCheck();
  }

  /**
   * Handles errors when loading metrics
   */
  private handleMetricsError(error: any): void {
    console.error('Error loading strategy metrics:', error);

    if (error.status === 404) {
      this.metricsError = 'No performance metrics available yet. Run a backtest to generate metrics.';
    } else if (error.status === 0) {
      this.metricsError = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.metricsError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.metricsError = 'You do not have permission to view these metrics.';
    } else if (error.status >= 500) {
      this.metricsError = 'Server error occurred. Please try again later.';
    } else {
      this.metricsError = error.error?.message || 'Failed to load performance metrics.';
    }

    this.cdr.markForCheck();
  }

  /**
   * Handles errors when loading trades
   */
  private handleTradesError(error: any): void {
    console.error('Error loading recent trades:', error);

    if (error.status === 404) {
      this.tradesError = null; // No trades is not an error, just empty state
      this.recentTrades = [];
    } else if (error.status === 0) {
      this.tradesError = 'Unable to connect to the server.';
    } else if (error.status === 401) {
      this.tradesError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.tradesError = 'You do not have permission to view these trades.';
    } else if (error.status >= 500) {
      this.tradesError = 'Server error occurred. Please try again later.';
    } else {
      this.tradesError = error.error?.message || 'Failed to load recent trades.';
    }

    this.cdr.markForCheck();
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
   * Gets the status badge severity based on strategy status
   */
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

  /**
   * Gets the icon for a risk profile
   */
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

  /**
   * Gets the label for a risk profile
   */
  getRiskProfileLabel(riskProfile: string): string {
    const labels: { [key: string]: string } = {
      'CONSERVATIVE': 'Low Risk',
      'MODERATE': 'Medium Risk',
      'AGGRESSIVE': 'High Risk'
    };
    return labels[riskProfile] || riskProfile;
  }
}
