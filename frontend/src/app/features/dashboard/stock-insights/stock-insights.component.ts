import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, line, pie, and other chart components
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart
} from 'echarts/charts';
// Import tooltip, title, legend, and other components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
// Import renderer
import {
  CanvasRenderer
} from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart,
  CanvasRenderer
]);

// Extend Window interface for garbage collection (if available in development)
declare global {
  interface Window {
    gc?: () => void;
  }
}

// Register built-in maps and custom maps
import { DensityMapBuilder } from '@dashboards/public-api';

// Register the world map with ECharts
// We'll use a dynamic import to load the world map data
import('echarts-map-collection/custom/world.json').then((worldMapData) => {
  DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
}).catch((error) => {
  // Handle world map loading error silently
});

// Import dashboard modules and chart builders
import {
  IWidget,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Enhanced Chart Builders
  ApacheEchartBuilder,
  AreaChartBuilder,
  TreemapChartBuilder,
  SankeyChartBuilder,
  // Other builders and utilities
  BarChartBuilder,
  ScatterChartBuilder,
  GaugeChartBuilder,
  HeatmapChartBuilder,
  PolarChartBuilder,
  CandlestickChartBuilder,
  TimeRangeFilterEvent,
  SunburstChartBuilder,
  // Stock List Chart Builder
  StockListChartBuilder,
  StockListData,
  // Filter enum
  FilterBy,
  // Tile Builder for updating tiles
  TileBuilder,
  StockTileBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import {
  createFilterWidget,
  updateFilterData,
  addFilter as addFilterToWidget,
  removeFilter as removeFilterFromWidget,
  clearAllFilters as clearAllFiltersFromWidget,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';
import { createMetricTiles as createMetricTilesFunction } from './widgets/metric-tiles';

// Import base dashboard component
import { BaseDashboardComponent, IFilterValues } from '@dashboards/public-api';

// Import component communication service
import { ComponentCommunicationService, SelectedIndexData } from '../../../services/component-communication.service';

// Import stock ticks service and entities
import { StockTicksService } from '../../../services/apis/stock-ticks.api';
import { StockDataDto, StockTicksDto } from '../../../services/entities/stock-ticks';

// Import stock service and historical data entities
import { StockService } from '../../../services/apis/stock.api';
import { StockHistoricalData } from '../../../services/entities/stock-historical-data';
import { Stock } from '../../../services/entities/stock';

// Import indices service and historical data entities
import { IndicesService } from '../../../services/apis/indices.api';
import { IndexHistoricalData } from '../../../services/entities/index-historical-data';

// Import NSE Indices service and entities


// Import consolidated WebSocket service and entities
import { WebSocketService, IndexDataDto, IndicesDto } from '../../../services/websockets';

// TimeRange type is now defined locally

/**
 * Filter criteria interface for centralized filtering system
 */
interface FilterCriteria {
  type: 'industry' | 'sector' | 'symbol' | 'custom' | 'macro';
  field: string; // The field name in StockDataDto to filter on
  value: string | number; // The value to filter by
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan'; // Comparison operator
  source?: string; // Which widget/chart applied this filter (for tracking)
}

// Define the specific data structure for this dashboard
export interface DashboardDataRow {
  id: string;
  assetCategory: string;
  month: string;
  market: string;
  totalValue: number;
  riskValue?: number;
  returnValue?: number;
  description?: string;
}

// Define TimeRange type locally since we're not importing it anymore
type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | 'MAX';

@Component({
  selector: 'app-stock-insights',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MessageModule,
    ScrollPanelModule,
    // Dashboard components
    DashboardContainerComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './stock-insights.component.html',
  styleUrls: ['./stock-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Financial Dashboard with a centralized filtering system for consistent
 * filtering behavior across all widgets and charts.
 */
export class StockInsightsComponent extends BaseDashboardComponent<StockDataDto> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: StockDataDto[] = [];
  protected readonly initialDashboardData: StockDataDto[] = [];



  // Filtered stock data for cross-chart filtering
  protected filteredDashboardData: StockDataDto[] | null = [];

  // Central applied filters array for cumulative filtering
  protected appliedFilters: FilterCriteria[] = [];

  // Dashboard title - dynamic based on a selected stock
  public dashboardTitle: string = 'Stock Insights Dashboard';

  // Subscription management
  private selectedStockSubscription: Subscription | null = null;

  // Chart update control to prevent rapid reinitialization
  private chartUpdateTimer: any = null;
  private isRecreatingChart: boolean = false;
  private isUpdatingChart: boolean = false; // Prevent multiple simultaneous updates
  private stockWebSocketSubscription: Subscription | null = null;
  private webSocketConnectionStateSubscription: Subscription | null = null;

  // Current selected stock data
  private currentSelectedStockData: StockDataDto | null = null;

  // Selected stock symbol from route
  private selectedStockSymbol: string | null = null;

  // Historical data for candlestick chart
  private historicalData: StockHistoricalData[] = [];

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedStock: string | null = null;
  private isSubscribing: boolean = false; // Track if we're currently in the process of subscribing
  private subscribedTopics: Set<string> = new Set(); // Track which topics we're already subscribed to

  // Stocks list for header search box
  public allStocks: Stock[] = [];

  // Time range tracking
  public selectedTimeRange: TimeRange = '1Y';

  // Debug flag to control verbose console logging
  private readonly enableDebugLogging: boolean = false;
  // Track the last stock for which previous-day data was fetched (to avoid repeated calls)
  private lastPrevDayFetchStock: string | null = null;
  // Flag to prevent multiple stock ticks API calls
  private stockTicksDataLoaded: boolean = false;


  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private stockTicksService: StockTicksService,
    private stockService: StockService,
    private indicesService: IndicesService,
    private webSocketService: WebSocketService,
    private route: ActivatedRoute

  ) {
    super(cdr, excelExportService, filterService);
  }

  override ngOnInit(): void {
    try {
      // Check for stock symbol in route parameters immediately
      this.route.paramMap.subscribe(params => {
        const symbol = params.get('symbol');
        if (symbol) {
          this.selectedStockSymbol = symbol; // Store the symbol for later use

          // If dashboard is already initialized, switch to the new stock immediately
          if (this.dashboardConfig?.widgets && this.dashboardConfig.widgets.length > 0) {
            this.switchToStock(symbol);
          }
        }
      });

      super.ngOnInit?.();
    } catch (error) {
      console.error('Error in StockInsightsComponent ngOnInit:', error);
    }
  }

  protected onChildInit(): void {
    try {
      // Register world map for density map charts
      import('echarts-map-collection/custom/world.json').then((worldMapData) => {
        DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
      }).catch(() => {
        // Handle world map loading error silently
      });

      // Initialize WebSocket connection and monitor connection state
      this.initializeWebSocket();
      this.monitorWebSocketConnectionState();

      // Clear any existing subscription
      if (this.selectedStockSubscription) {
        this.selectedStockSubscription.unsubscribe();
        this.selectedStockSubscription = null;
      }

      // Reset filters and title
      this.appliedFilters = [];
      this.dashboardTitle = 'Stock Insights Dashboard';

      // Check if we have a stock symbol from route parameters
      if (this.selectedStockSymbol) {
        // Load the stock data first, then initialize dashboard
        this.loadStockDataForRoute(this.selectedStockSymbol);
      } else {
        this.loadDefaultStockData();
      }

      // Load default data if no stock selected (fallback)
      setTimeout(() => {
        if (!this.currentSelectedStockData?.symbol) {
          this.loadDefaultStockData();
        }
      }, 100);

      // Preload stocks for search box
      this.loadAllStocksForSearch();

      // Expose global function as fallback for time range filter clicks
      (window as any).handleTimeRangeFilterClick = (range: string) => {
        this.onTimeRangeChange(range);
      };
    } catch (error) {
      console.error('Error in StockInsightsComponent onChildInit:', error);
    }
  }

  protected onChildDestroy(): void {
    // Clean up chart update timer
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }

    // Unsubscribe from selected stock subscription to prevent memory leaks
    if (this.selectedStockSubscription) {
      this.selectedStockSubscription.unsubscribe();
      this.selectedStockSubscription = null;
    }

    // Unsubscribe from WebSocket subscription
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }

    // Unsubscribe from WebSocket connection state monitoring
    if (this.webSocketConnectionStateSubscription) {
      this.webSocketConnectionStateSubscription.unsubscribe();
      this.webSocketConnectionStateSubscription = null;
    }

    // Disconnect WebSocket
    this.webSocketService.disconnect();

    // Clear stock ticks data and reset filters
    this.dashboardData = [];
    this.filteredDashboardData = null;
    this.appliedFilters = [];
    this.currentSelectedStockData = null;
    this.historicalData = [];

    // Reset WebSocket state
    this.isWebSocketConnected = false;
    this.currentSubscribedStock = null;
    this.isSubscribing = false;
    this.subscribedTopics.clear();

    // Reset stock ticks data loaded flag
    this.stockTicksDataLoaded = false;
  }

  /**
   * Load default stock data for INFY
   * Note: Currently using NIFTY 50 index data as a workaround since we don't have
   * stock-specific endpoints in the backend yet. In the future, we should implement:
   * 1. /api/v1/stock-ticks/by-symbol/{symbol} for individual stock data
   * 2. /api/v1/stock/{symbol}/history for historical data (already implemented)
   */
  private loadDefaultStockData(): void {
    console.log('📊 Loading default stock data (INFY)');

    // Load INFY as the default stock
    const defaultStockSymbol = 'INFY';

    // Clear any existing data first
    this.dashboardData = [];
    this.filteredDashboardData = [];
    this.historicalData = [];
    this.appliedFilters = [];

    // Set current selected stock data immediately
    this.currentSelectedStockData = {
      symbol: defaultStockSymbol,
      lastPrice: 0, // Will be updated when data loads
      priceChange: 0,
      percentChange: 0
    } as StockDataDto;

    // Update dashboard title with stock info
    this.dashboardTitle = `${defaultStockSymbol} - Stock Insights Dashboard`;

    // Fetch stock ticks data for the stock list (only once)
    this.loadStockTicksData(defaultStockSymbol);

    // Load historical data for INFY using the date-range endpoint /stock/INFY/history
    this.loadHistoricalData(defaultStockSymbol);
  }

  /**
   * Generate sample historical data as fallback
   */
  private generateSampleHistoricalData(symbol: string): void {
    const sampleData: StockHistoricalData[] = [];
    const basePrice = 1500; // Base price for INFY
    const today = new Date();

    // Generate 30 days of sample data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate realistic OHLC data with some randomness
      const open = basePrice + (Math.random() - 0.5) * 100;
      const close = open + (Math.random() - 0.5) * 50;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      const volume = Math.floor(Math.random() * 1000000) + 500000;

      sampleData.push({
        date: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        close: Number(close.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        volume: volume,
        symbol: symbol
      });
    }

    this.historicalData = sampleData;

    // Update chart with sample data
    setTimeout(() => {
      this.updateCandlestickChartWithRetry();
    }, 200);
  }

  private loadStockTicksData(stockSymbol: string): void {
    // Prevent multiple API calls for stock ticks data
    if (this.stockTicksDataLoaded) {
      console.log('📊 Stock ticks data already loaded, skipping API call');
      return;
    }

    if (stockSymbol && stockSymbol.trim()) {
      console.log('📊 Loading stock ticks data from API (NIFTY 50)');
      // For now, use NIFTY 50 as the index since we need an index, not a stock symbol
      // TODO: Implement a proper stock-specific endpoint in the backend
      const indexName = 'NIFTY 50';

      this.stockTicksService.getStockTicksByIndex(indexName).subscribe({
        next: (stockTicksData: StockDataDto[]) => {
          console.log('✅ Stock ticks data loaded:', stockTicksData.length, 'stocks');
          this.dashboardData = stockTicksData || [];
          this.appliedFilters = [];
          this.filteredDashboardData = this.dashboardData;
          this.stockTicksDataLoaded = true; // Mark as loaded

          this.updateMetricTilesWithFilters([]);
          this.populateWidgetsWithInitialData();
          this.updateAllChartsWithFilteredData();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.warn('❌ Failed to load stock ticks data for index:', indexName, ':', error);
          this.dashboardData = [];
          this.filteredDashboardData = [];
          this.appliedFilters = [];
          this.stockTicksDataLoaded = true; // Mark as attempted to prevent retries

          this.updateMetricTilesWithFilters([]);
          this.updateAllChartsWithFilteredData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Load historical data for the selected stock using the /stock/{symbol}/history endpoint
   * @param stockSymbol The symbol of the stock to load historical data for
   */
  private loadHistoricalData(stockSymbol: string): void {
    if (stockSymbol && stockSymbol.trim()) {
      // Use the date-range endpoint: /stock/{symbol}/history (POST with date range)
      // Backend now accepts dates in yyyy-MM-dd format
      const endDate = new Date();
      const startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

      // Format dates as yyyy-MM-dd strings (backend expected format)
      const startDateStr = startDate.toISOString().split('T')[0]; // yyyy-MM-dd
      const endDateStr = endDate.toISOString().split('T')[0];     // yyyy-MM-dd

      this.stockService.getStockHistory(stockSymbol, startDateStr, endDateStr).subscribe({
        next: (historicalData: StockHistoricalData[]) => {
          console.log('📈 Historical data loaded for', stockSymbol, ':', historicalData.length, 'records');
          this.historicalData = historicalData || [];

          // Update the dashboard title to reflect the current stock
          this.dashboardTitle = `${stockSymbol} - Stock Insights Dashboard`;

          // Simple direct update - no complex retry logic
          this.updateCandlestickChartDirect();

          // Force change detection and widget refresh
          this.cdr.detectChanges();

          // Additional update after a delay to ensure chart is ready
          setTimeout(() => {
            console.log('🔄 Updating candlestick chart for', stockSymbol);
            // Use simple direct update instead of complex retry logic
            this.updateCandlestickChartDirect();
            this.cdr.detectChanges();
          }, 500);
        },
        error: (error: any) => {
          console.warn('❌ Failed to load historical data for', stockSymbol, ':', error);
          this.historicalData = [];

          // Still try to update chart even with empty data
          this.updateCandlestickChartDirect();

          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Clear all widgets data to prevent stale data display
   */
  private clearAllWidgetsData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all echart widgets and clear their data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget =>
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      // Clear widget data by setting empty data
      this.updateEchartWidget(widget, []);
    });
  }

  /**
   * Unsubscribe from the current WebSocket topic before switching to a new stock
   */
  private unsubscribeFromCurrentWebSocketTopic(): void {
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }

    // Clear current subscription tracking
    if (this.currentSubscribedStock) {
      const webSocketStockName = this.currentSubscribedStock.replace(/\s+/g, '-').toLowerCase();
      const topicName = `/topic/nse-stocks/${webSocketStockName}`;
      this.subscribedTopics.delete(topicName);

    }

    this.currentSubscribedStock = null;
    this.isSubscribing = false;
  }

  /**
   * Update dashboard data with selected stock information
   * @param selectedStock The selected stock data object from an stocks component
   */
  private updateDashboardWithSelectedStock(selectedStock: SelectedIndexData): void {
    // Unsubscribe from previous WebSocket topic if any
    this.unsubscribeFromCurrentWebSocketTopic();

    // Update dashboard title with selected stock name or symbol
    this.dashboardTitle = selectedStock.name || selectedStock.symbol || 'Stock Insights Dashboard';

    // Transform the selected stock data to dashboard data format
    const dashboardDataRow = this.componentCommunicationService.transformToDashboardData(selectedStock);

    // Add the new data to the existing dashboard data
    // First, remove any existing data for the same symbol to avoid duplicates
    this.dashboardData = this.dashboardData.filter(row => row.symbol !== dashboardDataRow.symbol);

    // Add the new data row
    this.dashboardData = [dashboardDataRow, ...this.dashboardData];

    // Set initial selected stock data for immediate display
    this.currentSelectedStockData = {
      symbol: selectedStock.symbol,
      lastPrice: selectedStock.lastPrice || 0,
      variation: selectedStock.variation || 0,
      percentChange: selectedStock.percentChange || 0
    } as StockDataDto;

    // Fetch stock ticks data for the selected stock
    // Extract symbol from selectedStock object (no need to reload stock ticks data)
    const stockSymbol = selectedStock.symbol;

    // Load historical data for the selected stock
    const stockName = selectedStock.name || selectedStock.symbol;
    if (stockName) {
      this.loadHistoricalData(stockName);

      // Subscribe to WebSocket updates for the selected stock
      this.subscribeToStockWebSocket(stockName).catch(error => {
        console.error('Failed to subscribe to WebSocket:', error);
      });
    }

    // CRITICAL FIX: Force metric tiles to refresh with new stock data
    this.forceMetricTilesRefresh();

    // Conditionally fetch previous-day data only when WebSocket is not connected
    if (stockName) {
      // Reset last previous-day fetch when stock changes
      this.lastPrevDayFetchStock = null;
      this.maybeFetchPreviousDay(stockName);
    }

    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Force metric tiles to refresh with current stock data
   */
  private forceMetricTilesRefresh(): void {


    // CRITICAL FIX: Completely recreate metric tiles with new data
    if (this.dashboardConfig?.widgets) {
      // Find and remove existing metric tiles
      const existingTiles = this.dashboardConfig.widgets.filter(widget =>
        widget.config?.component === 'tile' || widget.config?.component === 'stock-tile'
      );

      // Remove existing tiles
      existingTiles.forEach(tile => {
        const index = this.dashboardConfig.widgets.indexOf(tile);
        if (index > -1) {
          this.dashboardConfig.widgets.splice(index, 1);
        }
      });

      // Create new metric tiles with current data
      const newMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

      // Add new tiles at the beginning
      this.dashboardConfig.widgets.unshift(...newMetricTiles);


    }

    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);

    // Force change detection
    this.cdr.detectChanges();

    // Additional refresh after a short delay to ensure tiles are updated
    setTimeout(() => {
      this.updateMetricTilesWithFilters([]);
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Fetch previous-day data for the current stock and update the metric tiles
   */
  private fetchAndUpdateCurrentStockData(): void {
    // Note: This method will be invoked only when selected stock changes and WebSocket is not connected
    if (!this.currentSelectedStockData?.symbol) {
      return;
    }

    const stockSymbol = this.currentSelectedStockData.symbol;


    // For now, we'll skip this functionality since we don't have a previous-day stock data service
    // In the future, this could be implemented using StockService or a similar service

    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);
    this.cdr.detectChanges();
  }

  /**
   * Conditionally fetch previous-day data only when the WebSocket is not connected
   */
  private maybeFetchPreviousDay(stockName: string): void {
    if (!stockName) {
      return;
    }
    // Only fetch if WebSocket is not connected and we haven't fetched for this stock yet
    if (!this.isWebSocketConnected && this.lastPrevDayFetchStock !== stockName) {
      this.lastPrevDayFetchStock = stockName;
      this.fetchAndUpdateCurrentStockData();
    }
  }

  /**
   * Create metric tiles using stock ticks data and indices data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return createMetricTilesFunction(
      this.filteredDashboardData || this.dashboardData,
      this.currentSelectedStockData,
      this.webSocketService,
      this.indicesService
    );
  }

  /**
   * Override updateMetricTilesWithFilters to use filtered data
   */
  protected override updateMetricTilesWithFilters(filters: any[]): void {
    // Ensure dashboardConfig and widgets exist before proceeding
    if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
      // No widgets available yet; safely exit
      // Optionally, we could schedule a retry, but avoiding repeated retries to prevent loops
      return;
    }

    // Find all tile widgets (both regular tiles and stock tiles)
    const tileWidgets = (this.dashboardConfig?.widgets || []).filter(widget =>
      widget?.config?.component === 'tile' || widget?.config?.component === 'stock-tile'
    );

    if (!tileWidgets.length) {
      // Nothing to update
      return;
    }

    // Create new metric tiles with filtered data - use filteredDashboardData
    const updatedMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

    // Update each tile widget with new data
    tileWidgets.forEach((widget, index) => {
      if (index < updatedMetricTiles.length) {
        const updatedTile = updatedMetricTiles[index];

        // Check if this tile should update on data change
        const currentTileOptions = widget?.config?.options as any;
        const shouldUpdate = currentTileOptions?.updateOnDataChange !== false;

        if (shouldUpdate) {
          // Extract tile data properties from the updated tile
          const newTileOptions = updatedTile?.config?.options as any;

          if (widget?.config?.component === 'stock-tile') {
            // Handle stock tile updates
            const stockTileData = {
              value: newTileOptions?.value ?? '',
              change: newTileOptions?.change ?? '',
              changeType: newTileOptions?.changeType ?? 'neutral',
              description: newTileOptions?.description ?? '',
              icon: newTileOptions?.icon ?? '',
              color: newTileOptions?.color ?? '',
              backgroundColor: newTileOptions?.backgroundColor ?? '',
              highValue: newTileOptions?.highValue ?? '',
              lowValue: newTileOptions?.lowValue ?? '',
              currency: newTileOptions?.currency ?? '₹'
            };

            // Use StockTileBuilder to properly update the stock tile data
            StockTileBuilder.updateData(widget, stockTileData);
          } else {
            // Handle regular tile updates
            const tileData = {
              value: newTileOptions?.value ?? '',
              change: newTileOptions?.change ?? '',
              changeType: newTileOptions?.changeType ?? 'neutral',
              description: newTileOptions?.description ?? '',
              icon: newTileOptions?.icon ?? '',
              color: newTileOptions?.color ?? '',
              backgroundColor: newTileOptions?.backgroundColor ?? '',
              title: newTileOptions?.title ?? '',
              subtitle: newTileOptions?.subtitle ?? newTileOptions?.customData?.subtitle ?? ''
            };

            // Use TileBuilder to properly update the tile data
            TileBuilder.updateData(widget, tileData);
          }
        }
      }
    });

    // Trigger change detection to ensure tiles are refreshed
    setTimeout(() => {
      this.cdr?.detectChanges?.();
    }, 50);
  }

  protected initializeDashboardConfig(): void {
    try {
      // Stock Price Candlestick Chart

      const candlestickChart = CandlestickChartBuilder.create()
        .setData([]) // Start with empty data - will be updated when real data loads
        .setHeader('Stock Historical Price Movement with Volume')
        .setId('candlestick-chart')
        .setEvents((widget, chart) => {
          console.log('📊 Candlestick chart events callback called:', {
            hasChart: !!chart,
            widgetId: widget.id
          });
          if (chart) {
            widget.chartInstance = chart;
            console.log('✅ Chart instance attached to widget');

            // Store reference to component for data updates
            (widget as any).componentRef = this;
          }
        })
        .build();

      console.log('📊 Candlestick chart widget created:', {
        id: candlestickChart.id,
        hasConfig: !!candlestickChart.config,
        component: candlestickChart.config?.component
      });

      // Add time range filters to the candlestick chart widget
      if (candlestickChart && (candlestickChart as any).timeRangeFilters) {
        // The time range filters are now part of the widget data

      }



      // Stock List Widget - Initialize with empty data, will be populated later
      const stockListWidget = StockListChartBuilder.create()
        .setData([])
        .setStockPerformanceConfiguration()
        .setHeader('Stock List')
        .setCurrencyFormatter('INR', 'en-IN')
        .setPredefinedPalette('finance')
        .setAccessor('symbol')
        .setFilterColumn('symbol', FilterBy.Value)
        .setId('stock-list-widget')
        .build();



      const filterWidget = createFilterWidget();
      const metricTiles = this.createMetricTiles([]);

      // Position filter widget at row 2 (below metric tiles which occupy rows 0-1)
      filterWidget.position = { x: 0, y: 2, cols: 12, rows: 1 };

      // Position charts with proper spacing - adjusted candlestick chart height
      candlestickChart.position = { x: 0, y: 3, cols: 8, rows: 12 }; // Full width for time range filters
      stockListWidget.position = { x: 8, y: 3, cols: 4, rows: 16 }; // Move stock list below candlestick chart

      console.log('📊 Widget positions set:', {
        candlestick: candlestickChart.position,
        stockList: stockListWidget.position
      });

      // Use the Fluent API to build the dashboard config with filter highlighting enabled
      this.dashboardConfig = StandardDashboardBuilder.createStandard()
        .setDashboardId('overall-dashboard')
        // Enable filter highlighting mode with custom styling
        .enableFilterHighlighting(true, {
          filteredOpacity: 0.25,
          highlightedOpacity: 1.0,
          highlightColor: '#ff6b6b',
          filteredColor: '#e0e0e0'
        })
        .setWidgets([
          ...metricTiles,
          filterWidget,
          candlestickChart,
          stockListWidget,
        ])
        .setEditMode(false)
        .build();



      // Populate widgets with initial data
      this.populateWidgetsWithInitialData();

      // If we have historical data, update the candlestick chart immediately
      if (this.historicalData.length > 0) {
        setTimeout(() => {
          this.updateCandlestickChartWithRetry();
        }, 500);
      }


    } catch (error) {
      console.error('Error initializing dashboard config:', error);
    }
  }

  /**
   * Handle widget data load events - this method will be called by the dashboard container
   */
  async onDataLoad(widget: IWidget): Promise<void> {
    // Check if this is the candlestick chart widget
    if (widget.id === 'candlestick-chart') {

      // Try direct update first since we know chart instance is available
      if (widget.chartInstance && this.historicalData.length > 0) {
        try {
          CandlestickChartBuilder.updateData(widget, this.historicalData);
          return;
        } catch (error) {
          console.error('❌ Direct chart update failed:', error);
        }
      }

      // If no chart instance but we have data, try to find it
      if (!widget.chartInstance && this.historicalData.length > 0) {
        const chartInstance = this.findChartInstanceViaNgxEcharts(widget) || this.findChartInstanceInDOM(widget);
        if (chartInstance) {
          widget.chartInstance = chartInstance;
          try {
            CandlestickChartBuilder.updateData(widget, this.historicalData);
            return;
          } catch (error) {
            console.error('❌ Chart update failed after finding instance:', error);
          }
        }
      }

      // Use the retry mechanism for better reliability
      setTimeout(() => {
        this.updateCandlestickChartWithRetry();
      }, 100);
    }
  }

  /**
   * Populate all widgets with initial data from the shared dataset
   */
  protected override populateWidgetsWithInitialData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }



    // Find all echart widgets and populate them with initial data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget =>
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;

      // Try to get data by widget title first
      let initialData = null;
      if (widgetTitle) {
        initialData = this.getFilteredDataForWidget(widgetTitle);
      }

      // If no data found by title, try to detect chart type and provide appropriate data
      if (!initialData) {
        initialData = this.getSummarizedDataByWidget(widgetTitle);
      }

      if (initialData) {
        // Use appropriate update method based on widget type
        if (widgetTitle === 'Stock Historical Price Movement with Volume') {
          // Use retry mechanism for candlestick chart
          setTimeout(() => {
            this.updateCandlestickChartWithRetry();
          }, 200);
        } else {
          this.updateEchartWidget(widget, initialData);
        }
      }

      // Add line series to candlestick chart if this is the candlestick widget
      if (widgetTitle === 'Stock Historical Price Movement with Volume') {
        setTimeout(() => {
          this.addLineSeriesToCandlestickChart();
        }, 500); // Delay to ensure chart is rendered
      }
    });

    // Find and populate stock list widgets
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget =>
      widget.config?.component === 'stock-list-table'
    );

    stockListWidgets.forEach(widget => {
      const stockData = this.filteredDashboardData || this.dashboardData;

      if (stockData && stockData.length > 0) {
        // Update the widget's data directly
        if (widget.data) {
          widget.data.stocks = stockData;
          widget.data.isLoadingStocks = false;
        } else {
          // Initialize widget data if it doesn't exist
          widget.data = {
            stocks: stockData,
            isLoadingStocks: false
          };
        }
      } else {
        // Set empty data to show the empty message
        if (widget.data) {
          widget.data.stocks = [];
          widget.data.isLoadingStocks = false;
        } else {
          widget.data = {
            stocks: [],
            isLoadingStocks: false
          };
        }
      }
    });

    // Populate metric tiles with initial data
    this.updateMetricTilesWithFilters([]);

    // Trigger immediate fallback data fetch for metric tiles if no valid data
    this.triggerImmediateFallbackDataFetch();

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Trigger immediate fallback data fetch for metric tiles if no valid data is available
   */
  private triggerImmediateFallbackDataFetch(): void {
    // Check if we have valid stock data
    if (!this.currentSelectedStockData ||
      !this.currentSelectedStockData.lastPrice ||
      this.currentSelectedStockData.lastPrice === 0) {
      // Only attempt previous-day fetch when WebSocket is not connected
      if (this.isWebSocketConnected) {
        return;
      }

      // Determine target stock name (default to NIFTY 50)
      const stockName = this.currentSelectedStockData?.symbol || 'NIFTY 50';

      // Avoid repeated fetches for the same stock
      if (this.lastPrevDayFetchStock === stockName) {
        return;
      }

      // Skip if offline (no point calling backend without internet)
      try {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator && navigator.onLine === false) {
          if (this.enableDebugLogging) {
            console.warn('Offline detected, skipping previous-day fetch');
          }
          return;
        }
      } catch { /* no-op */ }



      // Mark as fetched for this stock to prevent duplicates
      this.lastPrevDayFetchStock = stockName;

      // Update metric tiles with current data
      this.updateMetricTilesWithFilters([]);
      this.cdr.detectChanges();
    }
  }

  /**
   * Load all stocks to serve as datasource for header search box
   */
  private loadAllStocksForSearch(): void {
    this.stockService.getAllStocks().subscribe({
      next: (stocks: Stock[]) => {
        this.allStocks = stocks || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.allStocks = [];
      }
    });
  }

  /**
   * Get data for widget based on chart type detection
   */
  protected override getSummarizedDataByWidget(widgetTitle: string | undefined): any {
    const widget = this.dashboardConfig.widgets.find(widget =>
      widget.config?.header?.title === widgetTitle
    );

    if (!widget) {
      return null;
    }

    const chartOptions = widget.config?.options as any;

    if (!chartOptions?.series?.[0]) {
      return null;
    }

    // Detect chart type and provide appropriate data
    switch (widgetTitle) {
      case 'Portfolio Distribution':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.filteredDashboardData || this.dashboardData, 'industry', 'totalTradedValue');
      case 'Stock Historical Price Movement with Volume':
        // This is a candlestick chart - provide OHLCV data from historical data if available
        if (this.historicalData.length > 0) {
          // Return the historical data directly as it already has the correct structure
          return this.historicalData;
        } else {
          // Fallback to stock data - transform to match historical data structure
          const stockData = this.filteredDashboardData || this.dashboardData;
          if (!stockData || stockData.length === 0) {
            console.warn('⚠️ No stock data available for fallback');
            return [];
          }

          // Transform stock data to match historical data structure
          const transformedData = stockData.map(stock => ({
            date: stock.lastUpdateTime ? new Date(stock.lastUpdateTime).toISOString().split('T')[0] : stock.symbol || 'Unknown',
            open: stock.openPrice || 0,
            close: stock.lastPrice || 0,
            low: stock.dayLow || 0,
            high: stock.dayHigh || 0,
            volume: stock.totalTradedVolume || 0,
            symbol: stock.symbol || 'Unknown'
          }));

          return transformedData;
        }
      default:
        return null;
    }
  }

  /**
   * Get filtered data for a specific widget using enhanced chart builder transformation methods
   */
  protected getFilteredDataForWidget(widgetTitle: string, data?: StockDataDto[]): any {
    const sourceData = data || this.filteredDashboardData || this.dashboardData;

    switch (widgetTitle) {
      case 'Portfolio Distribution':
        // Use stock ticks data with macro, industry, and sector hierarchy
        if (!sourceData) {
          return [];
        }

        // Create hierarchical treemap data: macro -> industry -> sector with sum(totalTradedValue)
        const macroGroups = sourceData.reduce((acc, stock) => {
          const macro = stock.macro || 'Unknown Macro';
          const industry = stock.industry || 'Unknown Industry';
          const sector = stock.sector || 'Unknown Sector';
          const tradedValue = stock.totalTradedValue || 0;

          if (!acc[macro]) {
            acc[macro] = {};
          }
          if (!acc[macro][industry]) {
            acc[macro][industry] = {};
          }
          if (!acc[macro][industry][sector]) {
            acc[macro][industry][sector] = 0;
          }
          acc[macro][industry][sector] += tradedValue;
          return acc;
        }, {} as Record<string, Record<string, Record<string, number>>>);

        // Transform to treemap format
        return Object.entries(macroGroups).map(([macro, industries]) => {
          const industryChildren = Object.entries(industries).map(([industry, sectors]) => {
            const sectorChildren = Object.entries(sectors).map(([sector, value]) => ({
              name: sector,
              value: value
            }));

            const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);

            return {
              name: industry,
              value: industryValue,
              children: sectorChildren
            };
          });

          const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);

          return {
            name: macro,
            value: macroValue,
            children: industryChildren
          };
        }).sort((a, b) => b.value - a.value);

      case 'Stock Historical Price Movement with Volume':
        // Use historical data for candlestick chart if available, otherwise use stock data
        if (this.historicalData.length > 0) {
          // Return the historical data directly as it already has the correct structure
          // The CandlestickChartBuilder will handle the transformation
          return this.historicalData;
        } else {
          // Fallback to stock data - transform to match historical data structure
          if (!sourceData) {
            console.warn('⚠️ No source data available for fallback');
            return [];
          }

          // Transform stock data to match historical data structure
          const transformedData = sourceData.map(stock => ({
            date: stock.lastUpdateTime ? new Date(stock.lastUpdateTime).toISOString().split('T')[0] : stock.symbol || 'Unknown',
            open: stock.openPrice || 0,
            close: stock.lastPrice || 0,
            low: stock.dayLow || 0,
            high: stock.dayHigh || 0,
            volume: stock.totalTradedVolume || 0,
            symbol: stock.symbol || 'Unknown'
          }));

          return transformedData;
        }

      default:
        return null;
    }
  }

  /**
   * Enhanced filtering method that applies filters and updates all widgets
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Apply filters to base data
    let filteredData = this.dashboardData;

    if (filters && filters.length > 0) {
      // Use the enhanced filtering from the base chart builder
      const dataFilters = filters.map(filter => ({
        property: filter.filterColumn || 'industry',
        operator: 'equals' as const,
        value: filter.value
      }));

      filteredData = ApacheEchartBuilder.applyFilters(filteredData, dataFilters);
    }

    // Update the filteredDashboardData property
    this.filteredDashboardData = filteredData;

    // Update all chart widgets with filtered data
    this.updateAllChartsWithFilteredData();

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }

  /**
   * Helper method to create treemap data from stockTicksData with proper hierarchy
   */
  protected createStockTicksTreemapData(data: StockDataDto[] | null): Array<{
    name: string;
    value: number;
    children?: Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }>
  }> {
    if (!data || data.length === 0) {
      return [];
    }

    // Group by macro -> industry -> sector hierarchy
    const macroGroups = new Map<string, StockDataDto[]>();

    data.forEach(stock => {
      const macro = stock.macro || 'Other';
      if (!macroGroups.has(macro)) {
        macroGroups.set(macro, []);
      }
      macroGroups.get(macro)!.push(stock);
    });

    return Array.from(macroGroups.entries()).map(([macro, macroStocks]) => {
      // Group by industry within macro
      const industryGroups = new Map<string, StockDataDto[]>();

      macroStocks.forEach(stock => {
        const industry = stock.industry || 'Other';
        if (!industryGroups.has(industry)) {
          industryGroups.set(industry, []);
        }
        industryGroups.get(industry)!.push(stock);
      });

      const industryChildren = Array.from(industryGroups.entries()).map(([industry, industryStocks]) => {
        // Group by sector within industry
        const sectorGroups = new Map<string, StockDataDto[]>();

        industryStocks.forEach(stock => {
          const sector = stock.sector || 'Other';
          if (!sectorGroups.has(sector)) {
            sectorGroups.set(sector, []);
          }
          sectorGroups.get(sector)!.push(stock);
        });

        const sectorChildren = Array.from(sectorGroups.entries()).map(([sector, sectorStocks]) => {
          const sectorValue = sectorStocks.reduce((sum, stock) => sum + (stock.lastPrice || 0), 0);
          return {
            name: sector,
            value: sectorValue
          };
        });

        const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);

        return {
          name: industry,
          value: industryValue,
          children: sectorChildren
        };
      });

      const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);

      return {
        name: macro,
        value: macroValue,
        children: industryChildren
      };
    });
  }

  private applyFilters(): void {
    if (!this.dashboardData || this.dashboardData.length === 0) {
      this.filteredDashboardData = [];
      this.updateAllChartsWithFilteredData();
      return;
    }

    if (this.appliedFilters.length === 0) {
      this.filteredDashboardData = [...this.dashboardData];
      this.updateAllChartsWithFilteredData();
      return;
    }

    let filtered = [...this.dashboardData];
    for (const filter of this.appliedFilters) {
      filtered = this.applyIndividualFilter(filtered, filter);
    }

    this.filteredDashboardData = filtered;
    this.updateAllChartsWithFilteredData();
  }

  private applyIndividualFilter(data: StockDataDto[], filter: FilterCriteria): StockDataDto[] {
    const operator = filter.operator || 'equals';

    return data.filter(stock => {
      const fieldValue = (stock as any)[filter.field];

      switch (operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return fieldValue && fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
        case 'greaterThan':
          return fieldValue > filter.value;
        case 'lessThan':
          return fieldValue < filter.value;
        default:
          return fieldValue === filter.value;
      }
    });
  }

  /**
   * Convert FilterCriteria to IFilterValues format for filter widget display
   */
  private convertFilterCriteriaToIFilterValues(filter: FilterCriteria): IFilterValues {
    const stringValue = typeof filter.value === 'number' ? filter.value.toString() : filter.value;

    // Create a user-friendly display format
    const fieldDisplayName = this.getFieldDisplayName(filter.field);
    const displayValue = `${fieldDisplayName}: '${filter.value}'`;

    // CRITICAL FIX: Filter widget displays 'value' property, so set it to the display name
    // Calculate numeric value for internal use (percentage, etc.)
    let numericValue = 0;
    if (typeof filter.value === 'string') {
      numericValue = this.getAggregatedValueForCategory(filter.field, filter.value as string);
    }

    return {
      accessor: filter.field,
      filterColumn: filter.field,
      category: stringValue,     // Category name for reference
      value: stringValue,        // FIXED: Display name (e.g., "Iron & Steel") - this is what's shown
      numericValue: numericValue.toString(), // Numeric value for internal use
      percentage: numericValue.toString(),   // For compatibility
      [filter.field]: stringValue,
      displayValue: displayValue,
      source: filter.source || 'Unknown'
    };
  }

  /**
   * Get aggregated value for a category (industry/sector) for filter display
   */
  private getAggregatedValueForCategory(field: string, categoryName: string): number {
    if (!this.dashboardData || this.dashboardData.length === 0) {
      return 0;
    }

    // Calculate aggregated totalTradedValue for the category
    return this.dashboardData
      .filter(stock => (stock as any)[field] === categoryName)
      .reduce((sum, stock) => sum + (stock.totalTradedValue || 0), 0);
  }

  /**
   * Get user-friendly display name for filter fields
   */
  private getFieldDisplayName(field: string): string {
    switch (field) {
      case 'industry': return 'Industry';
      case 'sector': return 'Sector';
      case 'macro': return 'Macro';
      case 'symbol': return 'Symbol';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  }

  /**
   * Get the filter widget from dashboard configuration
   */
  private getFilterWidget() {
    return this.dashboardConfig?.widgets?.find(widget =>
      widget.id === 'filter-widget' || widget.config?.component === 'filter'
    );
  }

  /**
   * Update filter widget with current applied filters
   */
  private updateFilterWidget(): void {
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      const filterValues = this.appliedFilters.map(filter =>
        this.convertFilterCriteriaToIFilterValues(filter)
      );
      updateFilterData(filterWidget, filterValues);
      this.cdr.detectChanges();
    }
  }

  private addFilter(filter: FilterCriteria): void {
    // Check if this exact filter already exists
    const exactFilterExists = this.appliedFilters.some(f =>
      f.type === filter.type && f.field === filter.field && f.value === filter.value
    );

    if (exactFilterExists) {
      // Remove and re-add for refresh behavior
      this.appliedFilters = this.appliedFilters.filter(f =>
        !(f.type === filter.type && f.field === filter.field && f.value === filter.value)
      );
    } else {
      // Remove any existing filter of the same type and field
      this.appliedFilters = this.appliedFilters.filter(f =>
        !(f.type === filter.type && f.field === filter.field)
      );
    }

    this.appliedFilters.push(filter);
    this.applyFilters();
    this.updateFilterWidget();
  }

  /**
   * Remove a specific filter from the applied filters array
   * This method removes a filter based on its type and field, then reapplies
   * all remaining filters to update the filteredStockData
   * 
   * @param filterType The type of filter to remove (e.g., 'industry', 'sector')
   * @param field The field name of the filter to remove
   */
  private removeFilter(filterType: string, field: string): void {
    this.appliedFilters = this.appliedFilters.filter(f =>
      !(f.type === filterType && f.field === field)
    );

    // Apply remaining filters
    this.applyFilters();

    // Update filter widget to reflect the removed filter
    this.updateFilterWidget();
  }

  public override clearAllFilters(): void {
    this.appliedFilters = [];
    this.filteredDashboardData = [...(this.dashboardData || [])];
    this.applyFilters();
    this.updateAllChartsWithFilteredData();

    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      clearAllFiltersFromWidget(filterWidget);
    }

    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 50);

    super.clearAllFilters();
  }

  override onFilterValuesChanged(filters: any[]): void {
    // Handle clear all operation
    if (!filters || filters.length === 0) {
      this.appliedFilters = [];
      this.filteredDashboardData = [...(this.dashboardData || [])];
      this.updateAllChartsWithFilteredData();

      const filterWidget = this.getFilterWidget();
      if (filterWidget) {
        clearAllFiltersFromWidget(filterWidget);
      }

      this.cdr.detectChanges();
      return;
    }

    // CRITICAL FIX: Default dashboard system sets value=numeric, category=name
    // But filter widget displays 'value', so we need to swap them for display
    const correctedFilters = filters.map(filter => {
      // If this looks like a chart filter with numeric value and string category
      if (filter.category && typeof filter.category === 'string' &&
        typeof filter.value === 'number' && !isNaN(filter.value)) {

        // Swap value and category so filter widget displays the name
        return {
          ...filter,
          value: filter.category,      // Set value to display name (what filter widget shows)
          category: filter.category,   // Keep category as display name
          numericValue: filter.value   // Store original numeric value
        };
      }

      return filter;
    });

    // Update the filter widget with corrected values
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      updateFilterData(filterWidget, correctedFilters);
    }

    // Handle individual filter removal or sync with filter widget
    // Convert current filter widget state to appliedFilters format
    const newAppliedFilters: FilterCriteria[] = [];

    correctedFilters.forEach(filter => {
      const categoryName = filter.category || filter.value;

      if (filter.filterColumn === 'sector' && categoryName &&
        typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'sector',
          field: 'sector',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      } else if (filter.filterColumn === 'industry' && categoryName &&
        typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'industry',
          field: 'industry',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      } else if (filter.filterColumn === 'symbol' && categoryName &&
        typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'symbol',
          field: 'symbol',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      }
    });

    // Update appliedFilters to match filter widget state
    this.appliedFilters = newAppliedFilters;

    // Apply the updated filters
    this.applyFilters();
  }

  private updateAllChartsWithFilteredData(): void {
    if (!this.filteredDashboardData) {
      return;
    }

    // Debounce chart updates to prevent rapid reinitialization
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
    }

    this.chartUpdateTimer = setTimeout(() => {
      // Use historical data for candlestick chart if available, otherwise use filtered data
      if (this.historicalData.length > 0) {
        this.updateCandlestickChartWithRetry();
      } else {
        this.updateCandlestickChartWithFilteredData();
      }
      this.updateStockListWithFilteredData();

      // Update metric tiles with filtered data
      this.updateMetricTilesWithFilters([]);

      this.cdr.detectChanges();
      this.chartUpdateTimer = null;
    }, 150); // Increased delay and debounce to reduce chart reinitialization
  }

  /**
   * Filter charts by macro category (called when treemap is clicked)
   */
  private filterChartsByMacro(macro: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0) return;

    // Use centralized filter system
    this.addFilter({
      type: 'macro',
      field: 'macro',
      value: macro,
      operator: 'equals',
      source: 'Treemap Chart'
    });
  }

  private filterChartsBySymbol(symbol: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0 ||
      typeof symbol !== 'string' || !isNaN(Number(symbol))) {
      return;
    }

    const availableSymbols = [...new Set(this.dashboardData.map(s => s.symbol))];
    if (!availableSymbols.includes(symbol)) {
      return;
    }

    this.addFilter({
      type: 'symbol',
      field: 'symbol',
      value: symbol,
      operator: 'equals',
      source: 'Candlestick Chart'
    });
  }

  /**
   * Direct chart update method - simple and reliable
   */
  private updateCandlestickChartDirect(): void {
    console.log('🔄 updateCandlestickChartDirect called with', this.historicalData?.length || 0, 'data points');

    if (!this.historicalData || this.historicalData.length === 0) {
      console.log('⚠️ No historical data available for chart update');
      return;
    }

    // Find the candlestick widget
    const candlestickWidget = this.dashboardConfig?.widgets?.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (!candlestickWidget) {
      console.log('❌ Candlestick widget not found');
      return;
    }

    console.log('✅ Found candlestick widget, attempting direct update');

    // Check and fix widget container before update
    this.ensureWidgetContainerIsVisible(candlestickWidget);

    try {
      // Debug: Check data format before update
      console.log('📊 Historical data sample for chart update:', {
        totalRecords: this.historicalData.length,
        firstRecord: this.historicalData[0],
        lastRecord: this.historicalData[this.historicalData.length - 1]
      });

      // Use CandlestickChartBuilder to update the widget directly
      CandlestickChartBuilder.updateData(candlestickWidget, this.historicalData);
      console.log('✅ Chart updated successfully with CandlestickChartBuilder');

      // Force chart refresh and resize - with multiple attempts
      setTimeout(() => {
        this.forceChartRefreshWithRetry(candlestickWidget);
      }, 100);
    } catch (error) {
      console.error('❌ Error updating chart with CandlestickChartBuilder:', error);

      // Fallback: try to create chart directly in container
      console.log('🔄 Attempting direct chart creation in container...');
      this.createChartDirectlyInContainer();
    }
  }

  /**
   * Force chart refresh with retry mechanism to find lost chart instances
   */
  private forceChartRefreshWithRetry(widget: any): void {
    console.log('🔄 Starting chart refresh with retry...');

    const maxAttempts = 5;
    let attempt = 0;

    const attemptRefresh = () => {
      attempt++;
      console.log(`🔄 Chart refresh attempt ${attempt}/${maxAttempts}`);

      // Try multiple methods to find the chart instance
      let chartInstance = this.findChartInstanceMultipleMethods(widget);

      if (chartInstance) {
        console.log('✅ Chart instance found, performing refresh');
        widget.chartInstance = chartInstance;
        this.performChartRefresh(chartInstance, widget);
        return;
      }

      if (attempt < maxAttempts) {
        console.log(`⚠️ Chart instance not found, retrying in ${attempt * 200}ms...`);
        setTimeout(attemptRefresh, attempt * 200);
      } else {
        console.log('❌ Failed to find chart instance after all attempts, recreating widget');
        this.recreateCandlestickWidget();
      }
    };

    attemptRefresh();
  }

  /**
   * Try multiple methods to find the chart instance
   */
  private findChartInstanceMultipleMethods(widget: any): any {
    console.log('🔍 Searching for chart instance using multiple methods...');

    // Method 1: Check widget.chartInstance
    if (widget.chartInstance) {
      console.log('✅ Method 1: Found chart instance on widget');
      return widget.chartInstance;
    }

    // Method 2: Search in DOM by widget ID
    const chartByWidgetId = this.findChartInstanceInDOM(widget);
    if (chartByWidgetId) {
      console.log('✅ Method 2: Found chart instance in DOM by widget ID');
      return chartByWidgetId;
    }

    // Method 3: Search all ECharts instances in DOM
    const allChartElements = document.querySelectorAll('[_echarts_instance_]');
    console.log(`🔍 Method 3: Found ${allChartElements.length} ECharts instances in DOM`);

    for (let i = 0; i < allChartElements.length; i++) {
      const element = allChartElements[i] as any;

      // Try multiple ways to get the instance
      let instance = null;

      console.log(`🔍 Method 3 - Element ${i + 1}:`, {
        tagName: element.tagName,
        hasDirectInstance: !!element._echarts_instance_,
        instanceId: element.getAttribute('_echarts_instance_'),
        hasEchartsGlobal: !!(window as any).echarts
      });

      // Method 3a: Direct instance property
      if (element._echarts_instance_) {
        instance = element._echarts_instance_;
        console.log(`✅ Method 3a: Found direct instance property ${i + 1}`, {
          type: typeof instance,
          hasSetOption: !!(instance && typeof instance.setOption === 'function'),
          keys: instance ? Object.keys(instance).slice(0, 5) : []
        });
      }

      // Method 3b: Via echarts.getInstanceById
      if (!instance) {
        const instanceId = element.getAttribute('_echarts_instance_');
        if (instanceId && (window as any).echarts && (window as any).echarts.getInstanceById) {
          try {
            instance = (window as any).echarts.getInstanceById(instanceId);
            if (instance) {
              console.log(`✅ Method 3b: Found via getInstanceById ${i + 1}`);
            } else {
              console.log(`❌ Method 3b: getInstanceById returned null for ID: ${instanceId}`);
            }
          } catch (error) {
            console.log(`❌ Method 3b: Error calling getInstanceById:`, error);
          }
        }
      }

      // Method 3c: Via echarts.getInstanceByDom
      if (!instance && (window as any).echarts && (window as any).echarts.getInstanceByDom) {
        try {
          instance = (window as any).echarts.getInstanceByDom(element);
          if (instance) {
            console.log(`✅ Method 3c: Found via getInstanceByDom ${i + 1}`);
          } else {
            console.log(`❌ Method 3c: getInstanceByDom returned null`);
          }
        } catch (error) {
          console.log(`❌ Method 3c: Error calling getInstanceByDom:`, error);
        }
      }

      if (instance && typeof instance.setOption === 'function') {
        console.log(`✅ Method 3: Valid ECharts instance found with setOption method`);
        return instance;
      } else if (instance) {
        console.log(`⚠️ Method 3: Found instance but no setOption method:`, {
          type: typeof instance,
          keys: Object.keys(instance).slice(0, 10)
        });
      }
    }

    // Method 4: Search by candlestick widget container specifically
    const candlestickContainer = document.querySelector('[data-widget-id="candlestick-chart"]');
    if (candlestickContainer) {
      console.log('🔍 Method 4: Found candlestick widget container');

      // Look for ECharts elements within the candlestick container
      const chartElements = candlestickContainer.querySelectorAll('[_echarts_instance_], .echarts, canvas');
      console.log(`🔍 Method 4: Found ${chartElements.length} chart elements in candlestick container`);

      for (let i = 0; i < chartElements.length; i++) {
        const element = chartElements[i] as any;

        console.log(`🔍 Method 4 - Element ${i + 1}:`, {
          tagName: element.tagName,
          className: element.className,
          hasDirectInstance: !!element._echarts_instance_,
          hasParentInstance: !!(element.parentElement && element.parentElement._echarts_instance_)
        });

        // Try to get instance from the element
        let instance = element._echarts_instance_;

        // If not found, try parent elements
        if (!instance && element.parentElement) {
          instance = element.parentElement._echarts_instance_;
          if (instance) {
            console.log(`✅ Method 4: Found instance on parent element`);
          }
        }

        // Try via echarts API
        if (!instance && (window as any).echarts) {
          if ((window as any).echarts.getInstanceByDom) {
            try {
              instance = (window as any).echarts.getInstanceByDom(element);
              if (instance) {
                console.log(`✅ Method 4: Found via getInstanceByDom`);
              }
            } catch (error) {
              console.log(`❌ Method 4: Error with getInstanceByDom:`, error);
            }
          }
        }

        if (instance && typeof instance.setOption === 'function') {
          console.log(`✅ Method 4: Found valid chart instance in candlestick container`);
          return instance;
        } else if (instance) {
          console.log(`⚠️ Method 4: Found instance but no setOption:`, typeof instance);
        }
      }
    }

    // Method 5: Search by general chart container classes
    const chartContainers = document.querySelectorAll('.echarts-container, .echarts, canvas[data-zr-dom-id]');
    console.log(`🔍 Method 5: Found ${chartContainers.length} potential chart containers`);

    for (let i = 0; i < chartContainers.length; i++) {
      const container = chartContainers[i] as any;

      let instance = container._echarts_instance_;

      // Try parent if not found
      if (!instance && container.parentElement) {
        instance = container.parentElement._echarts_instance_;
      }

      // Try via echarts API
      if (!instance && (window as any).echarts && (window as any).echarts.getInstanceByDom) {
        instance = (window as any).echarts.getInstanceByDom(container);
      }

      if (instance && typeof instance.setOption === 'function') {
        console.log(`✅ Method 5: Found chart instance in container ${i + 1}`);
        return instance;
      }
    }

    console.log('❌ All methods failed to find chart instance');
    return null;
  }

  /**
   * Ensure widget container is visible and properly sized
   */
  private ensureWidgetContainerIsVisible(widget: any): void {
    console.log('🔍 Checking widget container visibility...');

    const widgetContainer = document.querySelector(`[data-widget-id="${widget.id}"]`);
    if (!widgetContainer) {
      console.log('❌ Widget container not found in DOM');
      return;
    }

    const rect = widgetContainer.getBoundingClientRect();
    console.log('📊 Widget container dimensions:', {
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0,
      display: getComputedStyle(widgetContainer).display,
      visibility: getComputedStyle(widgetContainer).visibility
    });

    // Fix container if it has issues
    const containerElement = widgetContainer as HTMLElement;

    // Ensure container is visible
    if (getComputedStyle(widgetContainer).display === 'none') {
      console.log('⚠️ Container is hidden, making visible...');
      containerElement.style.display = 'block';
    }

    if (getComputedStyle(widgetContainer).visibility === 'hidden') {
      console.log('⚠️ Container visibility is hidden, fixing...');
      containerElement.style.visibility = 'visible';
    }

    // Ensure container has dimensions
    if (rect.width === 0 || rect.height === 0) {
      console.log('⚠️ Container has zero dimensions, fixing...');
      containerElement.style.width = '100%';
      containerElement.style.height = '400px';
      containerElement.style.minHeight = '400px';
      containerElement.style.minWidth = '300px';
    }

    // Ensure container position
    if (getComputedStyle(widgetContainer).position === 'static') {
      containerElement.style.position = 'relative';
    }

    console.log('✅ Widget container visibility check completed');
  }

  /**
   * Perform the actual chart refresh operations
   */
  private performChartRefresh(chartInstance: any, widget: any): void {
    try {
      console.log('🔄 Performing chart refresh operations...');

      // Check container dimensions first
      const chartContainer = document.querySelector(`[data-widget-id="${widget.id}"]`);
      if (chartContainer) {
        const rect = chartContainer.getBoundingClientRect();
        console.log('📊 Chart container dimensions:', {
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0
        });

        // Fix zero dimensions
        if (rect.width === 0 || rect.height === 0) {
          console.log('⚠️ Fixing zero dimensions...');
          (chartContainer as HTMLElement).style.width = '100%';
          (chartContainer as HTMLElement).style.height = '400px';
          (chartContainer as HTMLElement).style.minHeight = '400px';
        }
      }

      // Force resize
      if (typeof chartInstance.resize === 'function') {
        chartInstance.resize();
        console.log('✅ Chart resized');
      }

      // Manual data update with correct format
      if (this.historicalData && this.historicalData.length > 0) {
        console.log('🔄 Applying manual data update...');

        const candlestickData = this.historicalData.map(item => [
          Number(item.open) || 0,
          Number(item.close) || 0,
          Number(item.low) || 0,
          Number(item.high) || 0
        ]);

        const volumeData = this.historicalData.map(item => Number(item.volume) || 0);
        const xAxisData = this.historicalData.map(item => item.date || '');

        const manualOptions = {
          xAxis: [{
            type: 'category',
            data: xAxisData
          }],
          yAxis: [
            { scale: true },
            { scale: true, gridIndex: 1 }
          ],
          series: [
            {
              type: 'candlestick',
              data: candlestickData,
              name: 'Price'
            },
            {
              type: 'bar',
              data: volumeData,
              name: 'Volume',
              yAxisIndex: 1,
              xAxisIndex: 0
            }
          ]
        };

        chartInstance.setOption(manualOptions, true);
        console.log('✅ Manual chart data update completed');
      }

      // Trigger change detection
      this.cdr.detectChanges();

    } catch (error) {
      console.error('❌ Error during chart refresh:', error);
    }
  }

  /**
   * Force chart refresh and resize (legacy method)
   */
  private forceChartRefresh(widget: any): void {
    console.log('🔄 Forcing chart refresh and resize...');

    if (!widget) {
      console.log('❌ No widget provided for refresh');
      return;
    }

    // Try to get chart instance
    let chartInstance = widget.chartInstance;

    if (!chartInstance) {
      // Try to find it in DOM
      chartInstance = this.findChartInstanceInDOM(widget);
      if (chartInstance) {
        widget.chartInstance = chartInstance;
        console.log('✅ Found chart instance for refresh');
      }
    }

    if (chartInstance) {
      try {
        console.log('🔄 Forcing chart resize and refresh...');

        // Check chart container dimensions
        const chartContainer = document.querySelector(`[data-widget-id="${widget.id}"]`);
        if (chartContainer) {
          const rect = chartContainer.getBoundingClientRect();
          console.log('📊 Chart container dimensions:', {
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          });

          // If container has no dimensions, try to fix it
          if (rect.width === 0 || rect.height === 0) {
            console.log('⚠️ Chart container has zero dimensions, attempting to fix...');
            (chartContainer as HTMLElement).style.width = '100%';
            (chartContainer as HTMLElement).style.height = '400px';
            (chartContainer as HTMLElement).style.minHeight = '400px';
          }
        }

        // Force resize
        if (typeof chartInstance.resize === 'function') {
          chartInstance.resize();
          console.log('✅ Chart resized');
        }

        // Force refresh by setting option again
        if (typeof chartInstance.setOption === 'function') {
          // Try manual data update with correct format
          if (this.historicalData && this.historicalData.length > 0) {
            console.log('🔄 Attempting manual chart data update...');

            const candlestickData = this.historicalData.map(item => [
              Number(item.open) || 0,
              Number(item.close) || 0,
              Number(item.low) || 0,
              Number(item.high) || 0
            ]);

            const volumeData = this.historicalData.map(item => Number(item.volume) || 0);
            const xAxisData = this.historicalData.map(item => item.date || '');

            const manualOptions = {
              xAxis: [{
                type: 'category',
                data: xAxisData
              }],
              yAxis: [
                { scale: true },
                { scale: true, gridIndex: 1 }
              ],
              series: [
                {
                  type: 'candlestick',
                  data: candlestickData,
                  name: 'Price'
                },
                {
                  type: 'bar',
                  data: volumeData,
                  name: 'Volume',
                  yAxisIndex: 1,
                  xAxisIndex: 0
                }
              ]
            };

            chartInstance.setOption(manualOptions, true);
            console.log('✅ Manual chart data update completed');
          } else {
            const currentOption = chartInstance.getOption();
            if (currentOption) {
              chartInstance.setOption(currentOption, true); // Force refresh
              console.log('✅ Chart option refreshed');
            }
          }
        }

        // Trigger change detection
        this.cdr.detectChanges();

      } catch (error) {
        console.error('❌ Error during chart refresh:', error);
      }
    } else {
      console.log('❌ No chart instance found for refresh');
    }
  }

  /**
   * Recreate the candlestick widget completely
   */
  private recreateCandlestickWidget(): void {
    console.log('🔄 Recreating candlestick widget...');

    if (!this.dashboardConfig?.widgets) {
      return;
    }

    const widgetIndex = this.dashboardConfig.widgets.findIndex(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (widgetIndex >= 0) {
      const oldWidget = this.dashboardConfig.widgets[widgetIndex];

      // Create new widget with current data
      const newWidget = CandlestickChartBuilder.create()
        .setData(this.historicalData)
        .setHeader('Stock Historical Price Movement with Volume')
        .setId('candlestick-chart')
        .setEvents((widget, chart) => {
          console.log('📊 New candlestick chart events callback called');
          if (chart) {
            widget.chartInstance = chart;
            console.log('✅ New chart instance attached to widget');
          }
        })
        .build();

      // Preserve position
      newWidget.position = oldWidget.position;

      // Replace the widget
      this.dashboardConfig.widgets[widgetIndex] = newWidget;

      console.log('✅ Candlestick widget recreated successfully');

      // Force change detection
      this.cdr.detectChanges();
    }
  }

  /**
   * Update candlestick chart with retry mechanism for better reliability
   */
  private updateCandlestickChartWithRetry(): void {
    console.log('🔄 updateCandlestickChartWithRetry called, isUpdatingChart:', this.isUpdatingChart);

    // Prevent multiple simultaneous updates, but reset if stuck
    if (this.isUpdatingChart) {
      console.log('⚠️ Chart update already in progress, forcing reset after timeout');
      // Force reset the flag after 2 seconds to prevent permanent blocking
      setTimeout(() => {
        console.log('🔄 Force resetting stuck chart update flag');
        this.isUpdatingChart = false;
        // Retry the update
        this.updateCandlestickChartWithRetry();
      }, 2000);
      return;
    }

    this.isUpdatingChart = true;
    console.log('🔄 Starting chart update process with', this.historicalData.length, 'data points');

    const maxRetries = 3; // Reduced retries to prevent infinite loops
    let retryCount = 0;
    const retryDelay = 200; // Reduced delay

    const attemptUpdate = () => {
      console.log('🔄 Attempt', retryCount + 1, 'of', maxRetries);

      if (!this.dashboardConfig?.widgets) {
        console.warn('❌ No dashboard config widgets found');
        this.isUpdatingChart = false; // Reset flag
        return;
      }

      const candlestickWidgetIndex = this.dashboardConfig.widgets.findIndex(widget =>
        widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
      );

      const candlestickWidget = candlestickWidgetIndex >= 0 ? this.dashboardConfig.widgets[candlestickWidgetIndex] : null;

      console.log('🔍 Candlestick widget search result:', {
        widgetIndex: candlestickWidgetIndex,
        widgetFound: !!candlestickWidget,
        totalWidgets: this.dashboardConfig.widgets.length,
        historicalDataLength: this.historicalData.length
      });

      if (!candlestickWidget) {
        console.warn('⚠️ Candlestick widget not found');
        if (retryCount < maxRetries - 1) {
          retryCount++;
          setTimeout(attemptUpdate, retryDelay * retryCount);
        } else {
          this.isUpdatingChart = false; // Reset flag
        }
        return;
      }

      // Check if chart instance is ready - try multiple ways to find it
      let chartInstance = candlestickWidget.chartInstance;
      console.log('📊 Chart instance check:', {
        hasChartInstance: !!chartInstance,
        widgetId: candlestickWidget.id
      });

      // If not found on widget, try to find it in DOM
      if (!chartInstance) {
        chartInstance = this.findChartInstanceInDOM(candlestickWidget);
        if (chartInstance) {
          console.log('✅ Found chart instance in DOM');
          candlestickWidget.chartInstance = chartInstance;
        }
      }

      // Try to find chart instance using ngx-echarts directive
      if (!chartInstance) {
        chartInstance = this.findChartInstanceViaNgxEcharts(candlestickWidget);
        if (chartInstance) {
          candlestickWidget.chartInstance = chartInstance;
        }
      }

      // Skip the expensive DOM search to prevent page freeze
      // if (!chartInstance) {
      //   console.log('🔄 Chart instance still not found, searching all elements...');
      //   chartInstance = this.findAllChartInstances();
      //   if (chartInstance) {
      //     console.log('✅ Found chart instance in all elements, attaching to widget');
      //     candlestickWidget.chartInstance = chartInstance;
      //   }
      // }

      if (chartInstance &&
        typeof chartInstance.setOption === 'function' &&
        typeof chartInstance.getOption === 'function') {

        try {
          console.log('📊 Attempting to update candlestick chart with data:', {
            dataLength: this.historicalData.length,
            hasChartInstance: !!chartInstance,
            widgetId: candlestickWidget.id
          });
          CandlestickChartBuilder.updateData(candlestickWidget, this.historicalData);
          console.log('✅ Candlestick chart updated successfully');
          this.isUpdatingChart = false; // Reset flag
          return; // Success, exit retry loop
        } catch (error) {
          console.error('❌ Error updating candlestick chart:', error);

          // Try direct chart update as fallback
          try {
            this.updateChartDirectly(chartInstance, this.historicalData);
            this.isUpdatingChart = false; // Reset flag
            return;
          } catch (directError) {
            console.error('❌ Direct chart update also failed:', directError);
          }
        }

        // If we get here, the update failed or chart instance not ready
        if (retryCount < maxRetries - 1) {
          retryCount++;
          setTimeout(attemptUpdate, retryDelay * retryCount);
        } else {
          this.isUpdatingChart = false; // Reset flag
          // Try one last resort: force widget recreation
          this.forceWidgetRecreation(candlestickWidgetIndex);
        }
      } else {
        // Chart instance not found or not valid
        console.warn('⚠️ Chart instance not found or not valid:', {
          hasChartInstance: !!chartInstance,
          hasSetOption: chartInstance && typeof chartInstance.setOption === 'function',
          hasGetOption: chartInstance && typeof chartInstance.getOption === 'function',
          retryCount: retryCount
        });

        if (retryCount < maxRetries - 1) {
          retryCount++;
          setTimeout(attemptUpdate, retryDelay * retryCount);
        } else {
          console.error('❌ Failed to find chart instance after', maxRetries, 'retries');
          this.isUpdatingChart = false; // Reset flag
        }
      };

      attemptUpdate();
    }
  }

  /**
   * Update candlestick chart with historical data from the API (legacy method)
   */
  private updateCandlestickChartWithHistoricalData(): void {
    // Use the new retry mechanism
    this.updateCandlestickChartWithRetry();
  }

  /**
   * Force widget recreation by replacing it in the dashboard
   * @param widgetIndex The index of the widget to recreate
   */
  private forceWidgetRecreation(widgetIndex: number): void {

    if (!this.dashboardConfig?.widgets || this.historicalData.length === 0) {
      return;
    }

    try {
      // Get the existing widget to preserve its position and configuration
      const existingWidget = this.dashboardConfig.widgets[widgetIndex];
      if (!existingWidget) {
        return;
      }

      // Create a new candlestick widget with the historical data
      const newCandlestickWidget = CandlestickChartBuilder.create()
        .setData(this.historicalData)
        .setStockAnalysisConfiguration()
        .setHeader('Stock Historical Price Movement with Volume')
        .setCurrencyFormatter('INR', 'en-IN')
        .setPredefinedPalette('finance')
        .enableVolume(true)
        .enableAreaSeries(true)
        .enableTimeRangeFilters(['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'], '1Y')
        .setTimeRangeChangeCallback((event) => {
          // Handle time range change if needed
        })
        .setEvents((widget, chart) => {
          if (chart) {
            // Store the chart instance on the widget
            widget.chartInstance = chart;
            // Update data immediately when chart instance is available
            CandlestickChartBuilder.updateData(widget, this.historicalData);
          }
        })
        .build();

      // Preserve the position and other properties from the existing widget
      newCandlestickWidget.position = existingWidget.position;
      newCandlestickWidget.height = existingWidget.height;
      newCandlestickWidget.id = 'candlestick-chart'; // Ensure consistent ID

      // Replace the widget in the dashboard configuration
      this.dashboardConfig.widgets[widgetIndex] = newCandlestickWidget;

      // Force change detection to trigger re-render
      this.cdr.detectChanges();

      // Wait for the chart to be initialized by ngx-echarts
      this.waitForChartInitialization(newCandlestickWidget, widgetIndex);

    } catch (error) {
      console.error('Error forcing widget recreation:', error);
    }
  }

  /**
   * Wait for chart initialization by monitoring the widget's chartInstance property
   * @param widget The widget to monitor
   * @param widgetIndex The index of the widget
   */
  private waitForChartInitialization(widget: any, widgetIndex: number): void {
    const maxAttempts = 10; // Reduced attempts since we rely more on onDataLoad
    let attempt = 0;

    const checkInitialization = () => {
      if (attempt >= maxAttempts) {
        return;
      }

      attempt++;

      // Check if the widget now has a chart instance
      if (widget.chartInstance && typeof widget.chartInstance.setOption === 'function') {
        CandlestickChartBuilder.updateData(widget, this.historicalData);
        return;
      }

      // Check if the widget has been updated in the dashboard config
      const currentWidget = this.dashboardConfig?.widgets?.[widgetIndex];
      if (currentWidget && currentWidget.chartInstance && typeof currentWidget.chartInstance.setOption === 'function') {
        CandlestickChartBuilder.updateData(currentWidget, this.historicalData);
        return;
      }

      // Force change detection and try again
      this.cdr.detectChanges();
      setTimeout(checkInitialization, 300);
    };

    // Start checking after a short delay to allow for initial rendering
    setTimeout(checkInitialization, 200);
  }

  /**
   * Try to find and attach chart instance to widget
   * @param widget The widget to attach chart instance to
   * @param widgetIndex The index of the widget
   */
  private tryFindAndAttachChartInstance(widget: any, widgetIndex: number): void {

    const maxAttempts = 10;
    let attempt = 0;

    const tryAttach = () => {
      if (attempt >= maxAttempts) {
        console.warn('⚠️ Could not find chart instance after maximum attempts');
        return;
      }

      attempt++;

      // Try to find chart instance in DOM
      const chartInstance = this.findChartInstanceInDOM(widget);
      if (chartInstance) {
        widget.chartInstance = chartInstance;
        CandlestickChartBuilder.updateData(widget, this.historicalData);
        return;
      }

      // Try to find chart instance by looking for the widget's DOM element
      const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`);
      if (widgetElement) {
        const chartInstance = (widgetElement as any).__echarts_instance__;
        if (chartInstance) {
          widget.chartInstance = chartInstance;
          CandlestickChartBuilder.updateData(widget, this.historicalData);
          return;
        }
      }

      // Force change detection and try again
      this.cdr.detectChanges();
      setTimeout(tryAttach, 200);
    };

    tryAttach();
  }

  /**
   * Update chart data directly by modifying widget configuration
   * @param widget The candlestick widget to update
   */
  private updateChartDataDirectly(widget: any): void {

    try {
      // Transform historical data to candlestick format
      const transformedData = this.historicalData.map(item => [
        Number(item.open) || 0,
        Number(item.close) || 0,
        Number(item.low) || 0,
        Number(item.high) || 0
      ]);

      const volumeData = this.historicalData.map(item => [
        item.date || '',
        Number(item.volume) || 0
      ]);

      const xAxisLabels = this.historicalData.map(item => item.date || '');

      // Update the widget's ECharts options directly
      if (widget.config && widget.config.options) {
        const options = widget.config.options;

        // Update series data
        if (options.series && options.series.length > 0) {
          // Update candlestick series
          if (options.series[0]) {
            options.series[0].data = transformedData;
          }

          // Update volume series if it exists
          if (options.series[1] && options.series[1].name === 'Volume') {
            options.series[1].data = volumeData;
          }

          // Update area series if it exists
          const areaSeriesIndex = options.series.findIndex((s: any) => s.name === 'Close Price Area');
          if (areaSeriesIndex >= 0) {
            const closePrices = transformedData.map((candle: number[]) => candle[1]); // Close is at index 1
            options.series[areaSeriesIndex].data = closePrices;
          }
        }

        // Update x-axis data
        if (options.xAxis && Array.isArray(options.xAxis)) {
          options.xAxis[0].data = xAxisLabels;
          if (options.xAxis[1]) {
            options.xAxis[1].data = xAxisLabels;
          }
        }

        // Force change detection to trigger re-render
        this.cdr.detectChanges();

        // Try to find and update chart instance after a short delay
        setTimeout(() => {
          this.tryUpdateChartInstanceAfterDataChange(widget);
        }, 200);
      } else {
        console.warn('⚠️ Widget config or options not found');
      }
    } catch (error) {
      console.error('Error updating chart data directly:', error);
    }
  }

  /**
   * Try to update chart instance after data change
   * @param widget The widget to update
   */
  private tryUpdateChartInstanceAfterDataChange(widget: any): void {

    // Try to find chart instance in DOM
    const chartInstance = this.findChartInstanceInDOM(widget);
    if (chartInstance) {
      widget.chartInstance = chartInstance;
      CandlestickChartBuilder.updateData(widget, this.historicalData);
    } else {

      // Try to trigger chart initialization by updating widget data
      widget.data = this.historicalData;
      this.cdr.detectChanges();

      // Try again after another delay
      setTimeout(() => {
        const chartInstance2 = this.findChartInstanceInDOM(widget);
        if (chartInstance2) {
          widget.chartInstance = chartInstance2;
          CandlestickChartBuilder.updateData(widget, this.historicalData);
        } else {
          console.warn('⚠️ Chart instance still not found after data change');
        }
      }, 500);
    }
  }

  /**
   * Recreate the candlestick chart with historical data
   */
  private recreateCandlestickChartWithData(): void {
    if (!this.dashboardConfig?.widgets || this.historicalData.length === 0) {
      console.warn('❌ Cannot recreate chart - no data or widgets');
      return;
    }

    // Prevent multiple simultaneous chart recreations
    if (this.isRecreatingChart) {
      ('🔄 Chart recreation already in progress, skipping...');
      return;
    }

    this.isRecreatingChart = true;

    // Find the candlestick widget
    const candlestickWidgetIndex = this.dashboardConfig.widgets.findIndex(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (candlestickWidgetIndex === -1) {
      console.warn('❌ Candlestick widget not found');
      return;
    }

    // Create a new candlestick chart with the historical data
    const newCandlestickChart = CandlestickChartBuilder.create()
      .setData(this.historicalData) // Set the data directly
      .transformData({
        dateField: 'date',
        openField: 'open',
        closeField: 'close',
        lowField: 'low',
        highField: 'high',
        volumeField: 'volume',
        sortBy: 'date',
        sortOrder: 'asc'
      })
      .setHeader('Stock Historical Price Movement with Volume')
      .setId('candlestick-chart')
      .setStockAnalysisConfiguration()
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .enableAreaSeries(true, 0.3)
      .enableVolume(true)
      .enableLegend(false)
      .enableDataZoom(true)
      .enableTimeRangeFilters(['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'], this.selectedTimeRange)
      .setTimeRangeChangeCallback((event: TimeRangeFilterEvent) => {
        this.handleTimeRangeChange(event);
      })
      .build();

    // Preserve the position
    newCandlestickChart.position = { x: 0, y: 3, cols: 8, rows: 12 };

    // Clear the old chart instance to force reinitialization
    const oldWidget = this.dashboardConfig.widgets[candlestickWidgetIndex];
    if (oldWidget.chartInstance) {
      oldWidget.chartInstance.dispose();
      oldWidget.chartInstance = null;
    }

    // Replace the widget in the dashboard config
    this.dashboardConfig.widgets[candlestickWidgetIndex] = newCandlestickChart;

    // Force change detection
    this.cdr.detectChanges();

    // Force the chart to reinitialize after a longer delay to ensure chart instance is created
    setTimeout(() => {
      this.cdr.detectChanges();

      // Wait for chart instance to be created and then update with data
      this.waitForChartInstanceAndUpdate(candlestickWidgetIndex, 0);
    }, 100);
  }

  /**
   * Wait for chart instance to be available and then update with data
   * @param widgetIndex Index of the candlestick widget
   * @param attempt Current attempt number
   */
  private waitForChartInstanceAndUpdate(widgetIndex: number, attempt: number): void {
    const maxAttempts = 30; // Try for up to 3 seconds (30 * 100ms)
    const delay = 100; // 100ms between attempts

    if (attempt >= maxAttempts) {
      console.warn('⚠️ Chart instance not available after maximum attempts, giving up');
      this.isRecreatingChart = false;
      return;
    }

    const widget = this.dashboardConfig.widgets[widgetIndex];
    if (widget && widget.chartInstance) {

      if (this.historicalData.length > 0) {
        CandlestickChartBuilder.updateData(widget, this.historicalData);
      }
      this.isRecreatingChart = false;
    } else {
      // Try to find chart instance in DOM and attach it to widget
      const chartInstance = this.findChartInstanceInDOM(widget);
      if (chartInstance) {
        widget.chartInstance = chartInstance;

        if (this.historicalData.length > 0) {
          CandlestickChartBuilder.updateData(widget, this.historicalData);
        }
        this.isRecreatingChart = false;
        return;
      }

      // Force change detection every few attempts to trigger chart initialization
      if (attempt % 5 === 0) {
        this.cdr.detectChanges();
      }

      setTimeout(() => {
        this.waitForChartInstanceAndUpdate(widgetIndex, attempt + 1);
      }, delay);
    }
  }

  /**
   * Try to find chart instance in DOM and attach it to widget
   * @param widget The widget to find chart instance for
   * @returns Chart instance if found, null otherwise
   */
  private findChartInstanceInDOM(widget: any): any {
    try {
      // Look for ECharts instances in the DOM with various selectors
      const selectors = [
        '[data-echarts-instance]',
        '.echarts',
        'div[style*="width"]', // Look for divs with width styles (likely chart containers)
        'canvas', // ECharts often uses canvas elements
        '[id*="chart"]', // Look for elements with "chart" in ID
        '[class*="chart"]', // Look for elements with "chart" in class
        '[data-widget-id]', // Look for widget elements
        'ngx-echarts', // Look for ngx-echarts components
        'div[style*="height"]' // Look for divs with height styles (chart containers)
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          // Check for chart instance on the element
          const chartInstance = (element as any).__echarts_instance__;
          if (chartInstance && chartInstance.getOption) {
            return chartInstance;
          }

          // Check parent elements for chart instance
          let parent = element.parentElement;
          while (parent && parent !== document.body) {
            const parentChartInstance = (parent as any).__echarts_instance__;
            if (parentChartInstance && parentChartInstance.getOption) {
              return parentChartInstance;
            }
            parent = parent.parentElement;
          }
        }
      }

      // If widget has an ID, try to find it specifically
      if (widget && widget.id) {
        const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`);
        if (widgetElement) {
          const chartInstance = (widgetElement as any).__echarts_instance__;
          if (chartInstance && chartInstance.getOption) {
            return chartInstance;
          }

          // Check child elements of the widget
          const childElements = widgetElement.querySelectorAll('*');
          for (let i = 0; i < childElements.length; i++) {
            const child = childElements[i];
            const chartInstance = (child as any).__echarts_instance__;
            if (chartInstance && chartInstance.getOption) {
              return chartInstance;
            }
          }
        }
      }

      // Look for any element with __echarts_instance__ property
      const allElements = document.querySelectorAll('*');

      for (let i = 0; i < Math.min(allElements.length, 100); i++) { // Limit to first 100 elements for performance
        const element = allElements[i];
        const chartInstance = (element as any).__echarts_instance__;
        if (chartInstance && chartInstance.getOption) {
          return chartInstance;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding chart instance in DOM:', error);
      return null;
    }
  }

  /**
   * Try to find chart instance via ngx-echarts directive
   * @param widget The widget to find chart instance for
   * @returns Chart instance if found, null otherwise
   */
  private findChartInstanceViaNgxEcharts(widget: any): any {
    try {
      // Look for ngx-echarts directive instances
      const ngxEchartsElements = document.querySelectorAll('ngx-echarts');

      for (let i = 0; i < ngxEchartsElements.length; i++) {
        const element = ngxEchartsElements[i];

        // Check for chart instance on the element
        const chartInstance = (element as any).__echarts_instance__;
        if (chartInstance && chartInstance.getOption) {
          return chartInstance;
        }

        // Check child elements
        const childElements = element.querySelectorAll('*');
        for (let j = 0; j < childElements.length; j++) {
          const child = childElements[j];
          const chartInstance = (child as any).__echarts_instance__;
          if (chartInstance && chartInstance.getOption) {
            return chartInstance;
          }
        }
      }

      // Look for any element with echarts directive
      const echartsElements = document.querySelectorAll('[echarts]');

      for (let i = 0; i < echartsElements.length; i++) {
        const element = echartsElements[i];
        const chartInstance = (element as any).__echarts_instance__;
        if (chartInstance && chartInstance.getOption) {
          return chartInstance;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding chart instance via ngx-echarts:', error);
      return null;
    }
  }

  /**
   * Find all chart instances in the DOM
   * @returns First chart instance found, null otherwise
   */
  private findAllChartInstances(): any {
    try {
      // Get all elements in the document
      const allElements = document.querySelectorAll('*');

      // Check first 200 elements for performance
      const maxElements = Math.min(allElements.length, 200);

      for (let i = 0; i < maxElements; i++) {
        const element = allElements[i];

        // Check for chart instance on the element
        const chartInstance = (element as any).__echarts_instance__;
        if (chartInstance && chartInstance.getOption && chartInstance.setOption) {
          return chartInstance;
        }

        // Check for chart instance in element properties
        const properties = Object.getOwnPropertyNames(element);
        for (const prop of properties) {
          if (prop.includes('echarts') || prop.includes('chart')) {
            const value = (element as any)[prop];
            if (value && typeof value === 'object' && value.getOption && value.setOption) {
              return value;
            }
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Simple chart update method - no retry logic, just direct update
   */
  private simpleChartUpdate(): void {
    console.log('🔄 simpleChartUpdate called with', this.historicalData?.length || 0, 'data points');

    if (!this.historicalData || this.historicalData.length === 0) {
      console.log('⚠️ No historical data available for chart update');
      return;
    }

    // Find the candlestick widget
    const candlestickWidget = this.dashboardConfig?.widgets?.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    console.log('🔍 Candlestick widget found:', !!candlestickWidget);

    if (!candlestickWidget) {
      console.log('❌ Candlestick widget not found');
      return;
    }

    // Try to find chart instance
    let chartInstance = candlestickWidget.chartInstance;
    console.log('📊 Chart instance from widget:', !!chartInstance);

    if (!chartInstance) {
      console.log('🔍 Searching for chart instance in DOM...');
      chartInstance = this.findChartInstanceInDOM(candlestickWidget);
      if (chartInstance) {
        console.log('✅ Found chart instance in DOM');
        candlestickWidget.chartInstance = chartInstance;
      } else {
        console.log('❌ Chart instance not found in DOM');
      }
    }

    if (chartInstance && typeof chartInstance.setOption === 'function') {
      console.log('📊 Attempting to update chart with setOption...');
      try {
        // Transform data to candlestick format
        const candlestickData = this.historicalData.map(item => [
          Number(item.open) || 0,
          Number(item.close) || 0,
          Number(item.low) || 0,
          Number(item.high) || 0
        ]);

        const volumeData = this.historicalData.map(item => [
          item.date || '',
          Number(item.volume) || 0
        ]);

        const xAxisLabels = this.historicalData.map(item => item.date || '');

        // Create complete chart options
        const chartOptions = {
          series: [
            {
              name: 'Candlestick',
              type: 'candlestick',
              data: candlestickData,
              itemStyle: {
                color: '#00da3c',
                color0: '#ec0000',
                borderColor: '#00da3c',
                borderColor0: '#ec0000'
              }
            },
            {
              name: 'Volume',
              type: 'bar',
              data: volumeData,
              yAxisIndex: 1,
              itemStyle: {
                color: function (params: any) {
                  const dataIndex = params.dataIndex;
                  const candlestickData = chartOptions.series[0].data;
                  if (candlestickData[dataIndex]) {
                    return candlestickData[dataIndex][1] >= candlestickData[dataIndex][0] ? '#00da3c' : '#ec0000';
                  }
                  return '#00da3c';
                }
              }
            }
          ],
          xAxis: [
            {
              type: 'category',
              data: xAxisLabels,
              boundaryGap: false,
              axisLine: { onZero: false },
              splitLine: { show: false }
            },
            {
              type: 'category',
              data: xAxisLabels,
              boundaryGap: false,
              axisLine: { onZero: false },
              splitLine: { show: false }
            }
          ],
          yAxis: [
            {
              scale: true,
              splitArea: { show: true }
            },
            {
              scale: true,
              splitArea: { show: true }
            }
          ],
          grid: [
            {
              left: '10%',
              right: '8%',
              height: '50%'
            },
            {
              left: '10%',
              right: '8%',
              top: '63%',
              height: '16%'
            }
          ],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          }
        };

        chartInstance.setOption(chartOptions, true);

      } catch (error) {
        console.error('❌ Simple chart update failed:', error);
      }
    }
  }

  /**
   * Debug method to log current chart state
   */
  private debugChartState(): void {

    const candlestickWidget = this.dashboardConfig?.widgets?.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (candlestickWidget) {
      if (candlestickWidget.chartInstance) {
        try {
          const currentOptions = candlestickWidget.chartInstance.getOption();
        } catch (error) {
          console.log('🔍 Error getting chart options:', error);
        }
      }
    } else {
      console.log('🔍 Candlestick widget not found');
    }
  }

  /**
   * Try to update chart directly if possible
   */
  private updateChartDirectlyIfPossible(): void {
    if (!this.historicalData || this.historicalData.length === 0) {
      return;
    }

    // Find the candlestick widget
    const candlestickWidget = this.dashboardConfig?.widgets?.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (!candlestickWidget) {
      return;
    }

    // Try to find chart instance
    let chartInstance = candlestickWidget.chartInstance;
    if (!chartInstance) {
      chartInstance = this.findChartInstanceInDOM(candlestickWidget);
      if (chartInstance) {
        candlestickWidget.chartInstance = chartInstance;
      }
    }

    if (chartInstance && typeof chartInstance.setOption === 'function') {
      try {
        this.updateChartDirectly(chartInstance, this.historicalData);
      } catch (error) {
        console.error('❌ Direct chart update failed:', error);
      }
    } else {
      console.log('🔥 Chart instance not available for direct update');
    }
  }

  /**
   * Update chart directly by setting options
   * @param chartInstance The chart instance to update
   * @param data The data to set
   */
  private updateChartDirectly(chartInstance: any, data: any[]): void {
    if (!chartInstance || !data || data.length === 0) {
      return;
    }

    try {
      // Transform data to candlestick format
      const candlestickData = data.map(item => [
        Number(item.open) || 0,
        Number(item.close) || 0,
        Number(item.low) || 0,
        Number(item.high) || 0
      ]);

      const volumeData = data.map(item => [
        item.date || '',
        Number(item.volume) || 0
      ]);

      const xAxisLabels = data.map(item => item.date || '');

      // Create basic chart options
      const chartOptions = {
        series: [
          {
            type: 'candlestick',
            data: candlestickData,
            name: 'Candlestick'
          },
          {
            type: 'bar',
            data: volumeData,
            name: 'Volume',
            yAxisIndex: 1
          }
        ],
        xAxis: [
          {
            type: 'category',
            data: xAxisLabels
          },
          {
            type: 'category',
            data: xAxisLabels
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: {
              show: true
            }
          },
          {
            scale: true,
            splitArea: {
              show: true
            }
          }
        ],
        grid: [
          {
            left: '10%',
            right: '8%',
            height: '50%'
          },
          {
            left: '10%',
            right: '8%',
            top: '63%',
            height: '16%'
          }
        ]
      };

      chartInstance.setOption(chartOptions, true);

    } catch (error) {
      console.error('❌ Error updating chart directly:', error);
      throw error;
    }
  }

  /**
   * Update candlestick chart with filtered data (fallback to stock data)
   */
  private updateCandlestickChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (candlestickWidget) {
      // Transform stock data to match historical data structure
      const transformedData = this.filteredDashboardData.map(stock => ({
        date: stock.lastUpdateTime ? new Date(stock.lastUpdateTime).toISOString().split('T')[0] : stock.symbol || 'Unknown',
        open: stock.openPrice || 0,
        close: stock.lastPrice || 0,
        low: stock.dayLow || 0,
        high: stock.dayHigh || 0,
        volume: stock.totalTradedVolume || 0,
        symbol: stock.symbol || 'Unknown'
      }));

      // Update the widget with transformed data using CandlestickChartBuilder
      CandlestickChartBuilder.updateData(candlestickWidget, transformedData);

      // Force a resize to ensure proper rendering
      setTimeout(() => {
        if (candlestickWidget.chartInstance && typeof candlestickWidget.chartInstance.resize === 'function') {
          candlestickWidget.chartInstance.resize();
        }
      }, 100);
    }
  }

  /**
   * Add line series to candlestick chart
   */
  private addLineSeriesToCandlestickChart(): void {
    if (!this.dashboardConfig?.widgets) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (candlestickWidget && candlestickWidget.chartInstance) {
      const currentOptions = candlestickWidget.chartInstance.getOption();

      // Extract close prices from candlestick data
      const candlestickData = (currentOptions as any)?.series?.[0]?.data || [];
      const closePrices = candlestickData.map((candle: number[]) => candle[1]); // Close is at index 1

      // Add line series
      const newSeries = [...((currentOptions as any)?.series || [])];
      newSeries.push({
        name: 'Close Price Line',
        type: 'line',
        data: closePrices,
        smooth: false,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: '#ff6b6b'
        },
        itemStyle: {
          color: '#ff6b6b'
        },
        z: 2, // Ensure line is above area
        yAxisIndex: 0,
        xAxisIndex: 0
      });

      const newOptions = {
        ...currentOptions,
        series: newSeries
      };

      candlestickWidget.chartInstance.setOption(newOptions, true);
    }
  }

  /**
   * Update treemap chart with filtered data
   */
  private updateTreemapWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) return;

    const treemapWidget = this.dashboardConfig.widgets.find(widget =>
      widget.config?.header?.title === 'Portfolio Distribution'
    );

    if (treemapWidget) {
      // Create hierarchical treemap data from filtered stock data
      const treemapData = this.createStockTicksTreemapData(this.filteredDashboardData);

      // Update the widget with new data
      this.updateEchartWidget(treemapWidget, treemapData);
    }
  }

  private updateStockListWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    const stockListWidgets = this.dashboardConfig.widgets.filter(widget =>
      widget.config?.component === 'stock-list-table'
    );

    console.log('📋 Found stock list widgets:', stockListWidgets.length);

    stockListWidgets.forEach(widget => {
      const stockData = this.filteredDashboardData || [];
      const newStockDataArray = [...stockData];

      console.log('📊 Updating stock list with data:', newStockDataArray.length, 'stocks');

      const selectedSymbol = this.currentSelectedStockData?.symbol || '';
      console.log('📊 Updating stock list widget with selected symbol:', selectedSymbol);

      if (widget.data) {
        widget.data.stocks = newStockDataArray;
        widget.data.isLoadingStocks = false;
        widget.data.selectedStockSymbol = selectedSymbol;
      } else {
        widget.data = {
          stocks: newStockDataArray,
          isLoadingStocks: false,
          selectedStockSymbol: selectedSymbol
        };
      }
    });

    // Batch the change detection and refresh operations
    setTimeout(() => {
      this.cdr.detectChanges();

      stockListWidgets.forEach(widget => {
        if (widget.data && typeof (widget.data as any).refresh === 'function') {
          (widget.data as any).refresh();
        }
      });

      this.cdr.markForCheck();
    }, 50);
  }

  /**
   * Initialize WebSocket connection for indices data
   */
  private async initializeWebSocket(): Promise<void> {
    try {
      await this.webSocketService.connect();
    } catch (error: any) {
      // Silent warning - the application should continue to work without WebSocket
      // Tiles will show initial values or fallback data from APIs
    }
  }

  /**
   * Subscribe to WebSocket updates for the selected stock
   * @param stockName - The name of the stock to subscribe to
   */
  private async subscribeToStockWebSocket(stockName: string): Promise<void> {
    // Prevent duplicate subscriptions
    if (this.isSubscribing) {
      return;
    }

    // Check if we're already subscribed to this stock
    const webSocketStockName = stockName.replace(/\s+/g, '-').toLowerCase();
    const topicName = `/topic/nse-stocks/${webSocketStockName}`;

    if (this.subscribedTopics.has(topicName)) {
      return;
    }

    // Unsubscribe from previous subscription if any
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }

    // Track the current subscribed stock
    this.currentSubscribedStock = stockName;
    this.isSubscribing = true;

    try {
      // Wait for WebSocket to be connected before attempting subscription
      if (!this.webSocketService.connected) {
        // Wait for connection to be established
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 10000); // 10 second timeout

          const connectionCheck = this.webSocketService.connectionState
            .pipe(filter((state: any) => state === 'CONNECTED'))
            .subscribe({
              next: () => {
                clearTimeout(timeout);
                connectionCheck.unsubscribe();
                resolve();
              },
              error: (error) => {
                clearTimeout(timeout);
                connectionCheck.unsubscribe();
                reject(error);
              }
            });
        });
      }

      // Now WebSocket should be connected, verify and subscribe
      if (this.webSocketService.connected) {

        // First try to subscribe to specific stock data
        try {
          // For now, we'll skip WebSocket subscription since stock-specific methods don't exist
          // In the future, this could be implemented when stock WebSocket services are available

          // Mark this topic as subscribed to prevent repeated attempts
          this.subscribedTopics.add(topicName);

        } catch (error) {
          console.warn(`Stock subscription failed for ${webSocketStockName}, continuing without real-time data:`, error);
          // Continue without WebSocket subscription
        }

      } else {
        // WebSocket still not connected - skipping real-time subscription
        console.warn('WebSocket still not connected - skipping real-time subscription for', webSocketStockName);
      }
    } catch (error) {
      // Don't clear currentSelectedStockData on WebSocket connection failures to prevent tile from reverting
      this.cdr.detectChanges();
    } finally {
      // Always reset the subscribing flag
      this.isSubscribing = false;
    }
  }

  /**
   * Fallback subscription to all stocks data when specific stock subscription fails
   * @param targetStockName - The name of the stock we're looking for
   */
  private subscribeToAllStocksAsFallback(targetStockName: string): void {
    try {
      // For now, we'll skip WebSocket subscription since stock-specific methods don't exist
      // In the future, this could be implemented when stock WebSocket services are available
      console.log(`All stocks WebSocket subscription not implemented for ${targetStockName}`);

    } catch (error) {
      console.error('Failed to subscribe to all stocks as fallback:', error);
    }
  }

  /**
   * Handle WebSocket data updates for the selected stock
   * @param stockData - Raw stock data received from WebSocket
   * @param stockName - The name of the stock being monitored
   */
  private handleWebSocketData(stockData: any, stockName: string): void {
    try {


      // The WebSocket now returns raw stock data directly, not wrapped in IndicesDto
      if (stockData && (stockData.stockName || stockData.stockSymbol)) {


        // Update current selected stock data with real-time information
        this.currentSelectedStockData = stockData;

        // Check if dashboard is ready before updating
        if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
          console.warn('Dashboard not ready yet, deferring first tile update');
          // Schedule the update for later
          setTimeout(() => {
            this.updateFirstTileWithRealTimeData(stockData);
          }, 1000);
          return;
        }

        // Throttle UI updates to avoid excessive re-initializations
        if (this.chartUpdateTimer) {
          return; // A recent update is in progress; skip this tick
        }
        this.chartUpdateTimer = setTimeout(() => {
          try {
            // Update the first tile (stock price tile) with real-time data
            this.updateFirstTileWithRealTimeData(stockData);
            // Update metric tiles in-place with new data (non-destructive)
            this.recreateMetricTiles();
            // Trigger change detection
            this.cdr.detectChanges();
          } finally {
            this.chartUpdateTimer = null;
          }
        }, 250);
      } else {
        console.warn('WebSocket received data but no valid stock data found:', stockData);
      }
    } catch (error: any) {
      console.error('Error processing received stock data:', error);
    }
  }

  /**
   * Attempt to reconnect to WebSocket and resubscribe to current stock
   */
  private async attemptWebSocketReconnection(): Promise<void> {
    if (!this.currentSubscribedStock) {
      return;
    }

    try {

      await this.webSocketService.connect();

      if (this.webSocketService.connected) {
        this.subscribeToStockWebSocket(this.currentSubscribedStock);
      }
    } catch (error) {
      console.warn('WebSocket reconnection failed:', error);
      // Schedule another reconnection attempt after a delay
      setTimeout(() => {
        this.attemptWebSocketReconnection();
      }, 5000); // 5 second delay before retry
    }
  }

  /**
   * Update the first tile (stock price tile) with real-time WebSocket data
   * @param realTimeStockData - Real-time stock data from WebSocket
   */
  private updateFirstTileWithRealTimeData(realTimeStockData: StockDataDto): void {
    // Wait for dashboard to be ready
    if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
      // Wait for dashboard to be ready and retry
      setTimeout(() => {
        this.updateFirstTileWithRealTimeData(realTimeStockData);
      }, 500);
      return;
    }

    // Find the first tile (stock price tile) - try multiple strategies
    let firstTile = this.dashboardConfig.widgets.find(widget =>
      widget.position?.x === 0 && widget.position?.y === 0 &&
      (widget.config?.component === 'stock-tile' || widget.config?.component === 'tile')
    );

    // If not found at (0,0), try to find any stock-tile or tile
    if (!firstTile) {
      firstTile = this.dashboardConfig.widgets.find(widget =>
        widget.config?.component === 'stock-tile' || widget.config?.component === 'tile'
      );
    }

    // If still not found, try to find by title
    if (!firstTile) {
      firstTile = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title?.toLowerCase().includes('nifty') ||
        widget.config?.header?.title?.toLowerCase().includes('index') ||
        widget.config?.header?.title?.toLowerCase().includes('price')
      );
    }

    if (!firstTile) {
      console.warn('No suitable tile found for real-time updates');
      return;
    }



    if (!realTimeStockData) {
      console.warn('No real-time stock data available for first tile update');
      return;
    }

    try {
      // Extract real-time data using WebSocket field names
      const stockName = realTimeStockData.symbol || 'Stock';
      const lastPrice = realTimeStockData.lastPrice || 0;
      const percentChange = realTimeStockData.percentChange || 0;
      const dayHigh = realTimeStockData.dayHigh || 0;
      const dayLow = realTimeStockData.dayLow || 0;
      const priceChange = realTimeStockData.priceChange || 0;



      if (firstTile.config?.component === 'stock-tile') {
        // Update stock tile with real-time data using exact WebSocket fields
        const stockTileData = {
          value: lastPrice.toFixed(2),
          change: priceChange.toFixed(2), // Use priceChange field from WebSocket
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: stockName, // Use stockName from WebSocket
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          highValue: dayHigh.toFixed(2), // Use dayHigh from WebSocket
          lowValue: dayLow.toFixed(2), // Use dayLow from WebSocket
          currency: '₹'
        };



        // Use StockTileBuilder to properly update the stock tile data
        StockTileBuilder.updateData(firstTile, stockTileData);

        // Also update the widget data property directly
        firstTile.data = { ...firstTile.data, ...stockTileData };


      } else {
        // Update regular tile with real-time data
        const tileData = {
          value: lastPrice.toFixed(2),
          change: priceChange.toFixed(2),
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: stockName,
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          title: stockName,
          subtitle: `Change: ${percentChange.toFixed(2)}%`
        };

        // Use TileBuilder to properly update the tile data
        TileBuilder.updateData(firstTile, tileData);

        // Also update the widget data property directly
        firstTile.data = { ...firstTile.data, ...tileData };


      }

      // Force change detection for OnPush strategy
      this.cdr.markForCheck();
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error updating first tile with real-time data:', error);
    }
  }

  /**
   * Force refresh the dashboard to update all widgets
   */
  private forceDashboardRefresh(): void {
    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);

    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Public method to force tile refresh (called from dashboard header)
   */
  public forceTileRefresh(): void {

    // Safe refresh: update tiles and trigger change detection
    this.updateMetricTilesWithFilters([]);
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  private recreateMetricTiles(): void {
    const currentMetricTiles = this.dashboardConfig.widgets.filter(widget =>
      widget.config?.component === 'tile' || widget.config?.component === 'stock-tile'
    );

    const newMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

    currentMetricTiles.forEach((widget, index) => {
      if (index < newMetricTiles.length) {
        const updatedTile = newMetricTiles[index];

        // Check if this tile should update on data change
        const tileOptions = widget.config?.options as any;
        const shouldUpdate = tileOptions?.updateOnDataChange !== false;

        if (shouldUpdate) {
          // Extract tile data properties from the updated tile
          const tileOptions = updatedTile.config?.options as any;

          if (widget.config?.component === 'stock-tile') {
            // Handle stock tile updates
            const stockTileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              highValue: tileOptions?.highValue || '',
              lowValue: tileOptions?.lowValue || '',
              currency: tileOptions?.currency || '₹'
            };

            // Use StockTileBuilder to properly update the stock tile data
            StockTileBuilder.updateData(widget, stockTileData);
          } else {
            // Handle regular tile updates
            const tileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              title: tileOptions?.title || '',
              subtitle: tileOptions?.subtitle || tileOptions?.customData?.subtitle || ''
            };

            // Use TileBuilder to properly update the tile data
            TileBuilder.updateData(widget, tileData);
          }
        }
      }
    });
  }

  /**
   * Monitor WebSocket connection state changes
   */
  private monitorWebSocketConnectionState(): void {
    this.webSocketConnectionStateSubscription = this.webSocketService.connectionState
      .subscribe({
        next: (state: any) => {
          this.isWebSocketConnected = state === 'CONNECTED';

          if (this.isWebSocketConnected) {
            // Only resubscribe if we have a current subscribed stock AND we're not already subscribed
            if (this.currentSubscribedStock && !this.isSubscribing) {
              const webSocketStockName = this.currentSubscribedStock.replace(/\s+/g, '-').toLowerCase();
              const topicName = `/topic/nse-stocks/${webSocketStockName}`;

              if (!this.subscribedTopics.has(topicName)) {

                this.subscribeToStockWebSocket(this.currentSubscribedStock);
              } else {
                // Already subscribed to topic, no need to resubscribe
              }
            }
          } else if (state === 'DISCONNECTED' || state === 'ERROR') {
            // Clear subscribed topics when disconnected
            this.subscribedTopics.clear();
            // Attempt reconnection if we have a subscribed stock
            if (this.currentSubscribedStock) {
              this.attemptWebSocketReconnection();
            }
          }
        },
        error: (error) => {
          console.error('WebSocket connection state monitoring error:', error);
          this.isWebSocketConnected = false;
          // Clear subscribed topics on error
          this.subscribedTopics.clear();
          // Attempt reconnection on error
          if (this.currentSubscribedStock) {
            this.attemptWebSocketReconnection();
          }
        }
      });
  }

  /**
   * Load stock data for route parameter before dashboard initialization
   * @param stockSymbol The stock symbol from route parameter
   */
  private loadStockDataForRoute(stockSymbol: string): void {
    // Update dashboard title
    this.dashboardTitle = `${stockSymbol} - Stock Insights Dashboard`;

    // Load historical data first
    this.loadHistoricalData(stockSymbol);

    // Load stock ticks data only if not already loaded
    if (!this.dashboardData || this.dashboardData.length === 0) {
      this.loadStockTicksData(stockSymbol);
    }

    // Update current selected stock data
    this.currentSelectedStockData = {
      symbol: stockSymbol,
      lastPrice: 0, // Will be updated when data loads
      priceChange: 0,
      percentChange: 0
    } as StockDataDto;
  }

  /**
   * Public method to switch to a different stock
   * @param stockSymbol The stock symbol to switch to (e.g., 'RELIANCE', 'TCS', 'HDFC')
   */
  public switchToStock(stockSymbol: string): void {
    console.log('🔄 switchToStock called with symbol:', stockSymbol);

    if (!stockSymbol || stockSymbol.trim() === '') {
      console.warn('Invalid stock symbol provided');
      return;
    }

    // Update dashboard title
    this.dashboardTitle = `${stockSymbol} - Stock Insights Dashboard`;

    // Clear only historical data (keep stock list data)
    this.historicalData = [];
    this.appliedFilters = [];

    // Update current selected stock data immediately
    this.currentSelectedStockData = {
      symbol: stockSymbol,
      lastPrice: 0, // Will be updated when data loads
      priceChange: 0,
      percentChange: 0
    } as StockDataDto;

    // Clear any existing chart update timers
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }

    // Load historical data for the new stock (no need to reload stock ticks data)
    this.loadHistoricalData(stockSymbol); // This now uses /stock/{symbol}/history with date range

    // Update stock list widget with new selected stock
    this.updateStockListWithFilteredData();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Force chart recreation by completely replacing the widget
   */
  private forceChartRecreation(): void {
    if (!this.dashboardConfig?.widgets || this.historicalData.length === 0) {
      console.warn('❌ Cannot force chart recreation - no data or widgets');
      return;
    }

    // Find the candlestick widget
    const candlestickWidgetIndex = this.dashboardConfig.widgets.findIndex(widget =>
      widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
    );

    if (candlestickWidgetIndex === -1) {
      console.warn('❌ Candlestick widget not found for recreation');
      return;
    }


    // Create a new candlestick widget with the current historical data
    const newCandlestickWidget = CandlestickChartBuilder.create()
      .setData(this.historicalData)
      .setHeader('Stock Historical Price Movement with Volume')
      .setId('candlestick-chart')
      .setEvents((widget, chart) => {
        if (chart) {
          widget.chartInstance = chart;

          // Try immediate update with current data
          if (this.historicalData.length > 0) {
            try {
              CandlestickChartBuilder.updateData(widget, this.historicalData);
            } catch (error) {
              console.error('❌ Error updating recreated chart:', error);
            }
          }
        }
      })
      .build();

    // Preserve the position and other properties
    const existingWidget = this.dashboardConfig.widgets[candlestickWidgetIndex];
    newCandlestickWidget.position = existingWidget.position;
    newCandlestickWidget.height = existingWidget.height;

    // Replace the widget in the dashboard configuration
    this.dashboardConfig.widgets[candlestickWidgetIndex] = newCandlestickWidget;

    // Force change detection to trigger re-render
    this.cdr.detectChanges();

    // Wait for the chart to be initialized and then update
    setTimeout(() => {
      this.updateCandlestickChartWithRetry();
    }, 500);
  }

  /**
   * Handle search from header search box
   */
  public onHeaderSearchStock(symbol: string): void {
    if (!symbol) {
      return;
    }

    // Validate symbol against allStocks if available; otherwise proceed
    const matched = this.allStocks.find(s => s.symbol?.toUpperCase() === symbol.toUpperCase());
    const targetSymbol = matched ? matched.symbol : symbol.toUpperCase();

    // Verify via API and then update dashboard
    this.stockService.getStockBySymbol(targetSymbol).subscribe({
      next: () => {
        this.switchToStock(targetSymbol);
      },
      error: () => {
        // If lookup fails, still try to switch to symbol to trigger data flow
        this.switchToStock(targetSymbol);
      }
    });
  }

  /**
   * Get the maximum available date for historical data
   * Uses listing_date from selected stock or falls back to 1996-01-01
   */
  private getMaxAvailableDate(): Date {
    const fallbackDate = new Date('1996-01-01');

    if (!this.currentSelectedStockData?.listingDate) {
      return fallbackDate;
    }

    try {
      const listingDate = new Date(this.currentSelectedStockData.listingDate);
      if (isNaN(listingDate.getTime())) {
        return fallbackDate;
      }

      // Return the later date between listing_date and 1996-01-01
      return listingDate > fallbackDate ? listingDate : fallbackDate;
    } catch (error) {
      console.warn('Error parsing listing date, using fallback:', error);
      return fallbackDate;
    }
  }

  /**
   * Handle time range change from candlestick chart filters
   * @param timeRange The selected time range (1D, 5D, 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, MAX)
   */
  public onTimeRangeChange(timeRange: string): void {
    if (!this.currentSelectedStockData?.symbol) {
      return;
    }

    // Update the selected time range
    this.selectedTimeRange = timeRange as TimeRange;

    // Update the time range filters in the candlestick chart widget
    if (this.dashboardConfig?.widgets) {
      const candlestickWidget = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title === 'Stock Historical Price Movement with Volume'
      );

      if (candlestickWidget) {
        CandlestickChartBuilder.updateTimeRangeFilters(candlestickWidget, timeRange as TimeRange, this.handleTimeRangeChange.bind(this));
      }
    }

    // Calculate date range based on selected time range
    const endDate = new Date();
    const maxAvailableDate = this.getMaxAvailableDate();
    let startDate: Date;

    switch (timeRange) {
      case '1D':
        // For 1D, we'll use intraday data if available, otherwise show last trading day
        startDate = new Date(endDate.getTime() - (1 * 24 * 60 * 60 * 1000)); // 1 day ago
        break;
      case '5D':
        startDate = new Date(endDate.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 days ago
        break;
      case '1M':
        // Fix: Use proper month calculation to avoid future dates
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
        break;
      case '3M':
        // Fix: Use proper month calculation to avoid future dates
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, endDate.getDate());
        break;
      case '6M':
        // Fix: Use proper month calculation to avoid future dates
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, endDate.getDate());
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year
        break;
      case '1Y':
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
        break;
      case '3Y':
        startDate = new Date(endDate.getFullYear() - 3, endDate.getMonth(), endDate.getDate());
        break;
      case '5Y':
        startDate = new Date(endDate.getFullYear() - 5, endDate.getMonth(), endDate.getDate());
        break;
      case 'MAX':
        // Use the maximum available date (listing_date or 1996-01-01, whichever is later)
        startDate = new Date(maxAvailableDate);
        break;
      default:
        startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate()); // Default to 1Y
    }

    // Ensure start date is not before the maximum available date
    if (startDate < maxAvailableDate) {
      startDate = maxAvailableDate;
    }

    // Format dates as yyyy-MM-dd strings (backend expected format)
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Load historical data for the new time range
    this.stockService.getStockHistory(this.currentSelectedStockData.symbol, startDateStr, endDateStr).subscribe({
      next: (historicalData: StockHistoricalData[]) => {
        this.historicalData = historicalData || [];
        this.updateCandlestickChartWithRetry();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.warn('Failed to load historical data for time range', timeRange, ':', error);
        this.historicalData = [];
        this.updateCandlestickChartWithRetry();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Handle time range change events from the candlestick chart builder
   * @param event The time range filter event
   */
  private handleTimeRangeChange(event: TimeRangeFilterEvent): void {
    if (event.type === 'timeRangeChange') {
      this.onTimeRangeChange(event.range);
    } else {
      console.warn('🔥 Unknown event type:', event.type);
    }
  }

  /**
   * Make onTimeRangeChange available globally for widget templates
   */
  public get onTimeRangeChangeGlobal() {
    return this.onTimeRangeChange.bind(this);
  }

  /**
   * Handle stock selection event from stock list widget
   * @param selectedStock - Selected stock data
   */
  onStockSelected(selectedStock: any): void {
    console.log('✅ Stock selected:', selectedStock);
    // Handle single click - could be used for highlighting or other actions
  }

  /**
   * Handle stock double-click event from stock list widget
   * @param selectedStock - Double-clicked stock data
   */
  onStockDoubleClicked(selectedStock: any): void {
    console.log('🎯 Stock double-clicked:', selectedStock);

    // Switch to the double-clicked stock and update the candlestick chart
    if (selectedStock?.symbol) {
      console.log('🔄 Switching to stock:', selectedStock.symbol);
      this.switchToStock(selectedStock.symbol);
    } else {
      console.warn('⚠️ No symbol found in selected stock data:', selectedStock);
    }
  }

  /**
   * Create chart directly in container as fallback method
   */
  private createChartDirectlyInContainer(): void {
    console.log('🔄 Creating chart directly in container...');

    try {
      // Find the candlestick widget container
      const candlestickContainer = document.querySelector('[data-widget-id="candlestick-chart"]');
      if (!candlestickContainer) {
        console.warn('❌ Candlestick container not found');
        return;
      }

      // Clear existing content
      candlestickContainer.innerHTML = '';

      // Create a new div for the chart
      const chartDiv = document.createElement('div');
      chartDiv.style.width = '100%';
      chartDiv.style.height = '400px';
      chartDiv.style.minHeight = '400px';
      candlestickContainer.appendChild(chartDiv);

      // Initialize ECharts directly
      const chartInstance = echarts.init(chartDiv);

      if (this.historicalData && this.historicalData.length > 0) {
        const candlestickData = this.historicalData.map(item => [
          Number(item.open) || 0,
          Number(item.close) || 0,
          Number(item.low) || 0,
          Number(item.high) || 0
        ]);

        const volumeData = this.historicalData.map(item => Number(item.volume) || 0);
        const xAxisData = this.historicalData.map(item => item.date || '');

        const option = {
          title: {
            text: 'Stock Historical Price Movement with Volume',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['Price', 'Volume'],
            top: 30
          },
          grid: [
            {
              left: '10%',
              right: '8%',
              height: '50%'
            },
            {
              left: '10%',
              right: '8%',
              top: '70%',
              height: '16%'
            }
          ],
          xAxis: [
            {
              type: 'category',
              data: xAxisData,
              boundaryGap: false,
              axisLine: { onZero: false },
              splitLine: { show: false },
              min: 'dataMin',
              max: 'dataMax'
            },
            {
              type: 'category',
              gridIndex: 1,
              data: xAxisData,
              boundaryGap: false,
              axisLine: { onZero: false },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { show: false },
              min: 'dataMin',
              max: 'dataMax'
            }
          ],
          yAxis: [
            {
              scale: true,
              splitArea: {
                show: true
              }
            },
            {
              scale: true,
              gridIndex: 1,
              splitNumber: 2,
              axisLabel: { show: false },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { show: false }
            }
          ],
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: [0, 1],
              start: 50,
              end: 100
            },
            {
              show: true,
              xAxisIndex: [0, 1],
              type: 'slider',
              top: '90%',
              start: 50,
              end: 100
            }
          ],
          series: [
            {
              name: 'Price',
              type: 'candlestick',
              data: candlestickData,
              itemStyle: {
                color: '#00da3c',
                color0: '#ec0000',
                borderColor: '#008F28',
                borderColor0: '#8A0000'
              }
            },
            {
              name: 'Volume',
              type: 'bar',
              xAxisIndex: 1,
              yAxisIndex: 1,
              data: volumeData,
              itemStyle: {
                color: '#7fbe9e'
              }
            }
          ]
        };

        chartInstance.setOption(option);
        console.log('✅ Chart created directly in container successfully');
      }

      // Store chart instance for future updates
      const candlestickWidget = this.dashboardConfig?.widgets?.find(w => w.id === 'candlestick-chart');
      if (candlestickWidget) {
        (candlestickWidget as any).chartInstance = chartInstance;
      }

    } catch (error) {
      console.error('❌ Error creating chart directly in container:', error);
    }
  }

}