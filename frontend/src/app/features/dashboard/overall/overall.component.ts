import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import required chart components
import {
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
  CandlestickChart,
  CanvasRenderer
]);

// Extend Window interface for garbage collection (if available in development)
declare global {
  interface Window {
    gc?: () => void;
  }
}


// Import dashboard modules and chart builders
import { 
  IWidget,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Chart Builders
  ApacheEchartBuilder,
  CandlestickChartBuilder,
  TimeRangeFilterEvent,
  // Stock List Chart Builder
  StockListChartBuilder,
  // Filter enum
  FilterBy,
  // Tile Builder for updating tiles
  TileBuilder,
  StockTileBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import { createMetricTiles as createMetricTilesFunction } from './widgets/metric-tiles';

// Import base dashboard component
import { BaseDashboardComponent } from '@dashboards/public-api';

// Import component communication service
import { ComponentCommunicationService, SelectedIndexData } from '../../../services/component-communication.service';

// Import stock ticks service and entities
import {StockDataDto} from '../../../services/entities/stock-ticks';

// Import indices service and historical data entities
import { IndicesService } from '../../../services/apis/indices.api';
import { IndexHistoricalData } from '../../../services/entities/index-historical-data';
import { IndexResponseDto } from '../../../services/entities/indices';

// Import consolidated WebSocket service and entities
import { WebSocketService, IndexDataDto, IndicesDto, WebSocketConnectionState } from '../../../services/websockets';


@Component({
  selector: 'app-overall',
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
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Financial Dashboard for overall view with candlestick chart and stock list.
 */
export class OverallComponent extends BaseDashboardComponent<StockDataDto> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: StockDataDto[] = [];
  protected readonly initialDashboardData: StockDataDto[] = [];

  // Filtered stock data for cross-chart filtering
  protected filteredDashboardData: StockDataDto[] | null = this.dashboardData || [];
  
  // Dashboard title - dynamic based on a selected index
  public dashboardTitle: string = 'Financial Dashboard';
  
  // Subscription management
  private selectedIndexSubscription: Subscription | null = null;
  
  // Chart update control to prevent rapid reinitialization
  private chartUpdateTimer: any = null;
  private indicesWebSocketSubscription: Subscription | null = null;
  private webSocketConnectionStateSubscription: Subscription | null = null;
  
  // Current selected index data from WebSocket
  private currentSelectedIndexData: IndexDataDto | null = null;
  
  // Historical data for candlestick chart
  private historicalData: IndexHistoricalData[] = [];
  
  // Selected time range for candlestick chart
  public selectedTimeRange: TimeRangeFilterEvent['range'] = 'YTD';
  public readonly timeRangeOptions: TimeRangeFilterEvent['range'][] = ['1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'];

  // Currently selected index symbol for highlighting in Index List widget
  public selectedIndexSymbol: string = '';

  // Loading state for candlestick chart
  public isCandlestickLoading: boolean = false;

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedIndex: string | null = null;
  private isSubscribing: boolean = false; // Track if we're currently in the process of subscribing
  private subscribedTopics: Set<string> = new Set(); // Track which topics we're already subscribed to

  // Debug flag to control verbose console logging
  private readonly enableDebugLogging: boolean = false;
  // Track the last index for which previous-day data was fetched (to avoid repeated calls)
  private lastPrevDayFetchIndex: string | null = null;

  // ========== Angular Signals for Reactive State Management ==========
  
  // Writable signals for mutable state
  private indicesDataSignal = signal<StockDataDto[]>([]);
  private selectedIndexSymbolSignal = signal<string>('');
  private wsConnectionStateSignal = signal<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  
  // Computed signals for derived state
  protected filteredIndicesSignal = computed(() => {
    const data = this.indicesDataSignal();
    const selected = this.selectedIndexSymbolSignal();
    // Return filtered data based on current filters
    // For now, return all data - filtering logic can be added later
    return data;
  });
  
  protected isWebSocketConnectedSignal = computed(() => 
    this.wsConnectionStateSignal() === WebSocketConnectionState.CONNECTED
  );
  
  // Subscription for all indices WebSocket data
  private allIndicesSubscription: Subscription | null = null;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private indicesService: IndicesService,
    private webSocketService: WebSocketService,
    private ngZone: NgZone

  ) {
    super(cdr, excelExportService, filterService);
    
    // Set up effects for reactive side effects
    this.setupSignalEffects();
  }
  
  /**
   * Initialize WebSocket connection and subscribe to all indices data
   * This method establishes the WebSocket connection and subscribes to the /topic/nse-indices topic
   * for real-time updates of all NSE indices data.
   * 
   * Error handling: Connection failures are logged but do not prevent the application from functioning.
   * The component will continue to display fallback data from the REST API.
   */
  private initializeWebSocketSubscription(): void {
    // Connect to WebSocket service
    this.webSocketService.connect()
      .then(() => {
        // Connection successful - subscribe to all indices topic
        this.allIndicesSubscription = this.webSocketService
          .subscribeToAllIndices()
          .subscribe({
            next: (indicesDto: IndicesDto) => {
              this.handleIncomingIndicesData(indicesDto);
            },
            error: (error) => {
              // Log error but continue with fallback data
              if (this.enableDebugLogging) {
                console.warn('[WebSocket] Subscription error:', {
                  error: error.message || error,
                  timestamp: new Date().toISOString()
                });
              }
              // Continue with fallback data - no user-facing error
            }
          });
        
        // Update connection state signal to CONNECTED
        this.wsConnectionStateSignal.set(WebSocketConnectionState.CONNECTED);
        
        if (this.enableDebugLogging) {
          console.log('[WebSocket] Successfully connected and subscribed to all indices');
        }
      })
      .catch((error) => {
        // Connection failed - log error and continue with fallback data
        if (this.enableDebugLogging) {
          console.warn('[WebSocket] Connection failed:', {
            error: error.message || error,
            timestamp: new Date().toISOString()
          });
        }
        
        // Update connection state signal to ERROR
        this.wsConnectionStateSignal.set(WebSocketConnectionState.ERROR);
        
        // Continue with fallback data - application remains functional
      });
  }
  
  /**
   * Handle incoming indices data from WebSocket
   * This method processes real-time indices data received via WebSocket and updates the component state.
   * 
   * @param indicesDto - The indices data received from WebSocket
   */
  private handleIncomingIndicesData(indicesDto: IndicesDto): void {
    // Validate incoming data
    if (!indicesDto?.indices || indicesDto.indices.length === 0) {
      if (this.enableDebugLogging) {
        console.warn('[WebSocket] Received empty or invalid indices data');
      }
      return;
    }
    
    // Map WebSocket data to component format using existing mapper
    const newData = this.mapIndicesToStockData(indicesDto.indices as any);
    
    // Merge with existing data, preserving fallback entries
    const merged = this.mergeIndicesData(this.indicesDataSignal(), newData);
    
    // Update signal - this automatically triggers UI updates via effects
    this.indicesDataSignal.set(merged);
    
    if (this.enableDebugLogging) {
      console.log('[WebSocket] Updated indices data:', {
        receivedCount: indicesDto.indices.length,
        mergedCount: merged.length,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Merge WebSocket data with existing fallback data
   * This method ensures that fallback data is preserved for indices not present in the WebSocket update.
   * 
   * @param existing - Current indices data (from fallback or previous updates)
   * @param incoming - New indices data from WebSocket
   * @returns Merged array with all unique indices
   */
  private mergeIndicesData(
    existing: StockDataDto[], 
    incoming: StockDataDto[]
  ): StockDataDto[] {
    const merged = new Map<string, StockDataDto>();
    
    // Add existing data to map
    existing.forEach(item => {
      const key = item.symbol || item.tradingsymbol;
      if (key) {
        merged.set(key, item);
      }
    });
    
    // Overlay incoming data (overwrites existing entries with same key)
    incoming.forEach(item => {
      const key = item.symbol || item.tradingsymbol;
      if (key) {
        merged.set(key, item);
      }
    });
    
    // Return merged array
    return Array.from(merged.values());
  }
  
  /**
   * Set up Angular signal effects for logging and widget updates
   */
  private setupSignalEffects(): void {
    // Effect: Log WebSocket connection state changes
    effect(() => {
      const state = this.wsConnectionStateSignal();
      if (this.enableDebugLogging) {
        console.log('[WebSocket] Connection state changed:', {
          state,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Effect: Update widgets when indices data changes
    effect(() => {
      const data = this.indicesDataSignal();
      if (data && data.length > 0) {
        // Update the Index List widget with new data
        this.updateStockListWithFilteredData();
      }
    });
    
    // Effect: Sync selected index symbol with signal
    effect(() => {
      const symbol = this.selectedIndexSymbolSignal();
      // Keep the existing property in sync for backward compatibility
      this.selectedIndexSymbol = symbol;
    });
  }
  
  /**
   * Cleanup WebSocket subscription for all indices
   * This method unsubscribes from the /topic/nse-indices subscription and updates connection state.
   * It ensures proper resource cleanup when the component is destroyed or when switching contexts.
   * 
   * Requirements: 1.4, 1.5, 2.2, 2.5
   */
  private cleanupWebSocketSubscription(): void {
    // Unsubscribe from all indices subscription if active
    if (this.allIndicesSubscription) {
      this.allIndicesSubscription.unsubscribe();
      this.allIndicesSubscription = null;
      
      if (this.enableDebugLogging) {
        console.log('[WebSocket] Unsubscribed from all indices subscription');
      }
    }
    
    // Call WebSocket service to unsubscribe from all topics
    this.webSocketService.unsubscribeFromAll();
    
    // Update connection state signal to DISCONNECTED
    this.wsConnectionStateSignal.set(WebSocketConnectionState.DISCONNECTED);
    
    if (this.enableDebugLogging) {
      console.log('[WebSocket] Cleanup completed - connection state set to DISCONNECTED');
    }
  }

  override ngOnInit(): void {
    super.ngOnInit?.();
  }

  protected onChildInit(): void {
    // Clear any existing subscription
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }

    // Reset title
    this.dashboardTitle = 'Financial Dashboard';
    this.componentCommunicationService.clearSelectedIndex();

    // Subscribe to selected index changes (dedupe same index emissions)
    this.selectedIndexSubscription = this.componentCommunicationService.getSelectedIndex()
      .pipe(
        distinctUntilChanged((a: any, b: any) => {
          const keyA = (a && (a.name || a.symbol)) || a;
          const keyB = (b && (b.name || b.symbol)) || b;
          return keyA === keyB;
        })
      )
      .subscribe((selectedIndex: any) => {
        if (selectedIndex) {
          this.updateDashboardWithSelectedIndex(selectedIndex);
        } else {
          this.loadDefaultNifty50Data();
        }
      });

    // Load default data if no index selected (fallback data loads first)
    setTimeout(() => {
      const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
      if (!currentSelectedIndex) {
        this.loadDefaultNifty50Data();
      }
    }, 100);

    // Initialize WebSocket subscription (non-blocking, after fallback data)
    // This ensures the component displays fallback data immediately while
    // WebSocket connection is being established in the background
    setTimeout(() => {
      this.initializeWebSocketSubscription();
    }, 150);

    // Wait for widget header to be fully rendered
    setTimeout(() => this.ensureWidgetTimeRangeFilters(), 200);
  }

  protected onChildDestroy(): void {
    // Clean up chart update timer
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }
    
    // Dispose of all chart instances to prevent reinitialization errors
    if (this.dashboardConfig?.widgets) {
      this.dashboardConfig.widgets.forEach(widget => {
        if (widget.chartInstance && typeof widget.chartInstance.dispose === 'function') {
          try {
            widget.chartInstance.dispose();
            widget.chartInstance = null;
          } catch (error) {
            console.warn('Error disposing chart instance:', error);
          }
        }
      });
    }
    
    // Unsubscribe from selected index subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }
    
    // Unsubscribe from WebSocket subscription
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }

    // Unsubscribe from WebSocket connection state monitoring
    if (this.webSocketConnectionStateSubscription) {
      this.webSocketConnectionStateSubscription.unsubscribe();
      this.webSocketConnectionStateSubscription = null;
    }
    
    // Disconnect WebSocket
    this.webSocketService.disconnect();
    
    // Clear stock ticks data
    this.dashboardData = [];
    this.filteredDashboardData = null;
    this.currentSelectedIndexData = null;
    this.historicalData = [];
    
    // Reset WebSocket state
    this.isWebSocketConnected = false;
    this.currentSubscribedIndex = null;
    this.isSubscribing = false;
    this.subscribedTopics.clear();
  }

  private indicesLoaded = false;

  private loadDefaultNifty50Data(): void {
    if (this.indicesLoaded && this.dashboardData.length > 0) {
      this.setDefaultIndexFromData(this.dashboardData);
      return;
    }

    this.indicesService.getIndicesByExchangeSegment('NSE', 'INDICES').subscribe({
      next: (indices) => {
        const mappedData = this.mapIndicesToStockData(indices || []);
        if (mappedData.length === 0) {
          this.loadDefaultNifty50DataFallback();
          return;
        }

        // Update signals with fallback data
        this.indicesDataSignal.set(mappedData);
        
        // Update legacy properties for backward compatibility
        this.updateIndexListData(mappedData);
        this.indicesLoaded = true;
        this.setDefaultIndexFromData(mappedData);
      },
      error: (error) => {
        console.warn('Failed to list indices, using fallback:', error);
        this.loadDefaultNifty50DataFallback();
      }
    });
  }

  private loadDefaultNifty50DataFallback(): void {
    // Fallback method with hardcoded data
    const defaultNifty50Data: SelectedIndexData = {
      id: 'NIFTY50',
      symbol: 'NIFTY 50',
      name: 'NIFTY 50',
      lastPrice: 0,
      variation: 0,
      percentChange: 0,
      keyCategory: 'Index'
    };
    
    this.updateDashboardWithSelectedIndex(defaultNifty50Data);
  }

  private mapIndicesToStockData(indices: IndexResponseDto[]): StockDataDto[] {
    return indices.map(index => ({
      tradingsymbol: index.indexSymbol || index.indexName || 'N/A',
      symbol: index.indexSymbol || index.indexName || 'N/A',
      companyName: index.indexName || index.indexSymbol || 'Unknown Index',
      lastPrice: index.lastPrice || 0,
      percentChange: (index as any).percentChange || 0,
      totalTradedValue: 0,
      sector: 'Indices',
      industry: 'Indices'
    }));
  }

  private updateIndexListData(data: StockDataDto[]): void {
    this.initialDashboardData.length = 0;
    this.initialDashboardData.push(...data);

    this.dashboardData = [...data];
    this.filteredDashboardData = [...data];
    
    this.updateStockListWithFilteredData();
    this.updateMetricTilesWithFilters([]);
    this.cdr.detectChanges();
  }

  private setDefaultIndexFromData(data: StockDataDto[]): void {
    this.dashboardTitle = 'NIFTY 50 - Financial Dashboard';

    const targetIndex = data.find(
      index => index.companyName?.toUpperCase().includes('NIFTY 50') ||
        index.tradingsymbol?.toUpperCase().includes('NIFTY 50')
    ) || (data.length > 0 ? data[0] : null);

    if (!targetIndex) {
      this.loadDefaultNifty50DataFallback();
      return;
    }

    const defaultNifty50Data: SelectedIndexData = {
      id: targetIndex.id || targetIndex.tradingsymbol || 'NIFTY50',
      symbol: targetIndex.tradingsymbol || targetIndex.symbol || 'NIFTY 50',
      name: targetIndex.companyName || targetIndex.tradingsymbol || 'NIFTY 50',
      lastPrice: targetIndex.lastPrice || 0,
      variation: (targetIndex as any).variation || 0,
      percentChange: targetIndex.percentChange || 0,
      keyCategory: 'Index'
    };

    this.updateDashboardWithSelectedIndex(defaultNifty50Data);
  }

  /**
   * Handle single-click events from the Index List widget.
   * Loads the selected index into the dashboard and refreshes the candlestick chart.
   */
  public onIndexSelected(selectedIndex: any): void {
    if (!selectedIndex) {
      return;
    }

    // Use symbol field first (as used by stock list table), fallback to tradingsymbol
    const symbol = selectedIndex.symbol || selectedIndex.tradingsymbol;
    const name = selectedIndex.companyName || selectedIndex.name || symbol;

    if (!symbol && !name) {
      return;
    }

    // Update selected index symbol for highlighting (use symbol field to match stock list table)
    this.selectedIndexSymbol = symbol || name;

    // Show loading indicator
    this.isCandlestickLoading = true;

    const selectedIndexData: SelectedIndexData = {
      id: selectedIndex.id || symbol || name,
      symbol: symbol || name,
      name: name || symbol,
      lastPrice: selectedIndex.lastPrice || 0,
      variation: selectedIndex.variation || selectedIndex.priceChange || 0,
      percentChange: selectedIndex.percentChange || selectedIndex.changePercent || 0,
      keyCategory: 'Index'
    };

    this.updateDashboardWithSelectedIndex(selectedIndexData);
  }

  /**
   * Handle double-click events from the Index List widget.
   * Reserved for future functionality.
   */
  public onIndexDoubleClicked(selectedIndex: any): void {
    // Placeholder for future double-click functionality
    // Currently empty as requested
  }

  /**
   * Load historical data for the selected index
   * @param indexName The name of the index to load historical data for
   */
  private loadHistoricalData(indexName: string): void {
    if (indexName && indexName.trim()) {
      const timeRange = this.selectedTimeRange || 'YTD';
      const { startDate, endDate } = this.calculateDateRangeFromTimeRange(timeRange);

      this.indicesService.getIndexHistoricalData(indexName, undefined, startDate, endDate).subscribe({
        next: (historicalData: IndexHistoricalData[]) => {
          this.historicalData = this.normalizeHistoricalData(historicalData || []);
          this.updateCandlestickChartWithHistoricalData();
          this.isCandlestickLoading = false; // Hide loading indicator
          this.cdr.detectChanges();
          this.ensureWidgetTimeRangeFilters();
        },
        error: (error) => {
          console.warn('Failed to load historical data for', indexName, ':', error);
          this.historicalData = [];
          this.updateCandlestickChartWithHistoricalData();
          this.isCandlestickLoading = false; // Hide loading indicator even on error
          this.cdr.detectChanges();
          this.ensureWidgetTimeRangeFilters();
        }
      });
    }
  }

  /**
   * Normalize historical data to ensure dates and numeric fields are usable by charts.
   */
  private normalizeHistoricalData(data: IndexHistoricalData[]): IndexHistoricalData[] {
    return data.map(item => ({
      ...item,
      date: item.date ? item.date.replace(' ', 'T') : item.date,
      open: Number(item.open) || 0,
      high: Number(item.high) || 0,
      low: Number(item.low) || 0,
      close: Number(item.close) || 0,
    }));
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
   * Unsubscribe from the current WebSocket topic before switching to a new index
   */
  private unsubscribeFromCurrentWebSocketTopic(): void {
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }
    
    // Clear current subscription tracking
    if (this.currentSubscribedIndex) {
      const webSocketIndexName = this.currentSubscribedIndex.replace(/\s+/g, '-').toLowerCase();
      const topicName = `/topic/nse-indices/${webSocketIndexName}`;
      this.subscribedTopics.delete(topicName);

    }
    
    this.currentSubscribedIndex = null;
    this.isSubscribing = false;
  }

  /**
   * Update dashboard data with selected index information
   * @param selectedIndex The selected index data object from an indices component
   */
  private updateDashboardWithSelectedIndex(selectedIndex: SelectedIndexData): void {
    // Unsubscribe from previous WebSocket topic if any
    this.unsubscribeFromCurrentWebSocketTopic();
    
    // Update selected index symbol for highlighting in Index List widget
    this.selectedIndexSymbol = selectedIndex.symbol || selectedIndex.name || '';
    
    // Update dashboard title with selected index name or symbol
    this.dashboardTitle = selectedIndex.name || selectedIndex.symbol || 'Financial Dashboard';

    // Transform the selected index data to dashboard data format
    const dashboardDataRow = this.componentCommunicationService.transformToDashboardData(selectedIndex);
    
    // Remove duplicates and insert latest selection to top for display
    this.dashboardData = [
      dashboardDataRow,
      ...this.dashboardData.filter(row => row.symbol !== dashboardDataRow.symbol)
    ];
    
    // Set initial selected index data for immediate display
    this.currentSelectedIndexData = {
      indexName: selectedIndex.name || selectedIndex.symbol,
      indexSymbol: selectedIndex.symbol,
      lastPrice: selectedIndex.lastPrice || 0,
      variation: selectedIndex.variation || 0,
      percentChange: selectedIndex.percentChange || 0
    };
    
    // Load historical data for the selected index
    const indexName = selectedIndex.name || selectedIndex.symbol;
    if (indexName) {
      this.loadHistoricalData(indexName);
      
      // Subscribe to WebSocket updates for the selected index
      this.subscribeToIndexWebSocket(indexName).catch(error => {
        console.error('Failed to subscribe to WebSocket:', error);
      });
    }
    
    // CRITICAL FIX: Force metric tiles to refresh with new index data
    this.forceMetricTilesRefresh();

    // Conditionally fetch previous-day data only when WebSocket is not connected
    if (indexName) {
      // Reset last previous-day fetch when index changes
      this.lastPrevDayFetchIndex = null;
      this.maybeFetchPreviousDay(indexName);
    }
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Force metric tiles to refresh with current index data
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
   * Fetch previous-day data for the current index and update the metric tiles
   */
  private fetchAndUpdateCurrentIndexData(): void {
    // Note: This method will be invoked only when selected index changes and WebSocket is not connected
    if (!this.currentSelectedIndexData?.indexName) {
      return;
    }
    
    const indexName = this.currentSelectedIndexData.indexName;

    
    // Fetch previous-day data for the current index
    this.indicesService.getPreviousDayIndexData(indexName).subscribe({
      next: (fallbackData) => {
        if (fallbackData && fallbackData.indices && fallbackData.indices.length > 0) {
          const indexData = fallbackData.indices[0];

          
          // Update the current selected index data with fallback data
          this.currentSelectedIndexData = {
            indexName: indexData.indexName || indexData.index || indexName,
            indexSymbol: indexData.indexSymbol || indexName,
            lastPrice: indexData.lastPrice || indexData.last || 0,
            variation: indexData.variation || 0,
            percentChange: indexData.percentChange || 0
          };
          
          
          
          // Force metric tiles to refresh with new data
          this.updateMetricTilesWithFilters([]);
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.warn(`Failed to fetch previous-day data for ${indexName}:`, error);
      }
    });
  }

  /**
   * Conditionally fetch previous-day data only when the WebSocket is not connected
   */
  private maybeFetchPreviousDay(indexName: string): void {
    if (!indexName) {
      return;
    }
    // Only fetch if WebSocket is not connected and we haven't fetched for this index yet
    if (!this.isWebSocketConnected && this.lastPrevDayFetchIndex !== indexName) {
      this.lastPrevDayFetchIndex = indexName;
      this.fetchAndUpdateCurrentIndexData();
    }
  }

  /**
   * Create metric tiles using stock ticks data and indices data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return createMetricTilesFunction(
      this.filteredDashboardData || this.dashboardData, 
      this.currentSelectedIndexData,
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
    // Stock Price Candlestick Chart - Enhanced with timeline legend
    const candlestickChart = CandlestickChartBuilder.create()
      .setData([]) // Use empty array initially, will be populated with historical data
      .transformData({
        dateField: 'date',
        openField: 'open',
        closeField: 'close',
        lowField: 'low',
        highField: 'high',
        sortBy: 'date',
        sortOrder: 'asc'
      })
      .setHeader('Index Historical Price Movement')
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('symbol')
      .setFilterColumn('symbol')
      .setXAxisName('Trading Date')
      .setYAxisName('Price (₹)')
      .setBarWidth('60%')  // Set candlestick bar width for better visibility
      .setCandlestickColors('#00da3c', '#ec0000', '#808080')  // Green for positive, red for negative, grey for neutral
      .enableBrush()  // Enable brush selection for technical analysis
      .setLargeMode(100)  // Enable large mode for datasets with 100+ points
      .setTooltipType('axis')  // Enable crosshair tooltip for better analysis
      .enableAreaSeries(false, 0.4)  // Disable area series - reserved for future indicators like Bollinger Bands
      .enableVolume(false)  // Disable volume bars - indices don't have volume data
      .enableLegend(false)  // Disable legend for cleaner appearance
      .enableDataZoom(true)  // Enable data zoom for timeline navigation
      .disableTimeRangeFilters() // Disable canvas overlay filters - using custom header filters instead
      .setEvents((widget: any, chart: any) => {
        if (chart) {
          chart.off('click');
          chart.on('click', (params: any) => {
            params.event?.stop?.();
            // For historical data, we don't filter by symbol since it's all the same index
            // Just log the click for debugging
            return false;
          });
        }
      })
      .setId('candlestick-chart')
      .setSkipDefaultFiltering(true)
      .build();

    // Add enhanced X-axis and Y-axis configuration to candlestick chart
    if (candlestickChart.config?.options) {
      const options = candlestickChart.config.options as any;
      
      // Remove any volume series that might have been created by the builder
      if (Array.isArray(options.series)) {
        options.series = options.series.filter((s: any) => {
          if (s.type === 'line') return false;
          if (s.type === 'bar') {
            if (s.name === 'Volume' || 
                s.gridIndex === 1 || 
                s.xAxisIndex === 1 || 
                s.yAxisIndex === 1) {
              return false;
            }
          }
          return true;
        });
      }
      
      // Initialize xAxis and yAxis - will be properly configured below

      // Configure grid: single grid for candlestick chart
      options.grid = [
        {
          id: 'main',
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '11%',  // Leave minimal space for data zoom
          containLabel: true
        }
      ];

      // Enhanced tooltip configuration
      options.tooltip = {
        ...options.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          const paramsArray = Array.isArray(params) ? params : [params];
          const candlestickParam = paramsArray.find((p: any) => p.seriesType === 'candlestick');
          
          if (!candlestickParam) {
            return '';
          }
          
          const data = candlestickParam.data;
          const date = candlestickParam.name;
          
          // Format date for tooltip
          let formattedDate = date;
          try {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (e) {
            // Keep original date if parsing fails
          }

          const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 8px;">${formattedDate}</div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Open:</span> 
                <span style="font-weight: bold;">${formatter.format(data[0])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Close:</span> 
                <span style="font-weight: bold;">${formatter.format(data[1])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Low:</span> 
                <span style="font-weight: bold;">${formatter.format(data[2])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">High:</span> 
                <span style="font-weight: bold;">${formatter.format(data[3])}</span>
              </div>
            </div>
          `;
        }
      };

      // Update data zoom configuration - position at bottom
      if (options.dataZoom && Array.isArray(options.dataZoom)) {
        options.dataZoom.forEach((zoom: any) => {
          if (zoom.type === 'slider') {
            zoom.height = '8%';
            zoom.bottom = '0%';  // Position at the very bottom with no gap
            zoom.xAxisIndex = [0];  // Link to single x-axis
          }
        });
      }
      
      // Configure x-axis - single axis for candlestick chart
      if (!Array.isArray(options.xAxis)) {
        options.xAxis = options.xAxis ? [options.xAxis] : [];
      }
      if (options.xAxis.length > 1) {
        options.xAxis = [options.xAxis[0]];
      }
      if (options.xAxis.length === 0) {
        options.xAxis = [{
          type: 'category',
          data: [],
          gridIndex: 0
        }];
      }
      
      // Configure y-axis - single axis for price
      if (!Array.isArray(options.yAxis)) {
        options.yAxis = options.yAxis ? [options.yAxis] : [];
      }
      if (options.yAxis.length > 1) {
        options.yAxis = [options.yAxis[0]];
      }
      if (options.yAxis.length === 0) {
        options.yAxis = [{
          type: 'value',
          scale: true,
          gridIndex: 0,
          position: 'right',
          axisLabel: {
            formatter: (value: number) => {
              return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(value);
            }
          }
        }];
      }
    }

    // Stock List Widget - Initialize with empty data, will be populated later
    const stockListWidget = StockListChartBuilder.create()
      .setData(this.filteredDashboardData)
      .setStockPerformanceConfiguration()
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('tradingsymbol')
      .setFilterColumn('tradingsymbol', FilterBy.Value)
      .setId('stock-list-widget')
      .build();

    const metricTiles = this.createMetricTiles([]);

    // Position charts with proper spacing
    stockListWidget.position = { x: 0, y: 2, cols: 4, rows: 18 };
    candlestickChart.position = { x: 4, y: 2, cols: 8, rows: 11 };
    
    // Use the Fluent API to build the dashboard config
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      .setWidgets([
        ...metricTiles,
        stockListWidget,
        candlestickChart,
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
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
        this.updateEchartWidget(widget, initialData);
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
          widget.data.selectedStockSymbol = this.selectedIndexSymbol;
        } else {
          // Initialize widget data if it doesn't exist
          widget.data = {
            stocks: stockData,
            isLoadingStocks: false,
            selectedStockSymbol: this.selectedIndexSymbol
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
    // Check if we have valid index data
    if (!this.currentSelectedIndexData || 
        !this.currentSelectedIndexData.lastPrice || 
        this.currentSelectedIndexData.lastPrice === 0) {
      // Only attempt previous-day fetch when WebSocket is not connected
      if (this.isWebSocketConnected) {
        return;
      }

      // Determine target index name (default to NIFTY 50)
      const indexName = this.currentSelectedIndexData?.indexName || 'NIFTY 50';

      // Avoid repeated fetches for the same index
      if (this.lastPrevDayFetchIndex === indexName) {
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



      // Mark as fetched for this index to prevent duplicates
      this.lastPrevDayFetchIndex = indexName;

      // Fetch previous-day data
      this.indicesService.getPreviousDayIndexData(indexName).subscribe({
        next: (fallbackData) => {
          if (fallbackData && fallbackData.indices && fallbackData.indices.length > 0) {
            const indexData = fallbackData.indices[0];
            
            
            // Update the current selected index data with fallback data
            this.currentSelectedIndexData = {
              indexName: indexData.indexName || indexName,
              indexSymbol: indexData.indexSymbol || indexName,
              lastPrice: indexData.lastPrice || 0,
              variation: indexData.variation || 0,
              percentChange: indexData.percentChange || 0
            };
            
            // Refresh tiles
            this.updateMetricTilesWithFilters([]);
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.warn(`Failed to fetch previous-day data for ${indexName}:`, error);
        }
      });
    }
  }

  /**
   * Get data for widget based on chart type detection
   */
  protected override getSummarizedDataByWidget(widgetTitle: string | undefined): any {
    const widget = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title === widgetTitle
    );

    if(!widget)
    {
      return null;
    }

    const chartOptions = widget.config?.options as any;

    if (!chartOptions?.series?.[0]) {
      return null;
    }

    // Detect chart type and provide appropriate data
    switch (widgetTitle) {
      case 'Index Historical Price Movement':
        // This is a candlestick chart - provide OHLC data from historical data if available
        if (this.historicalData.length > 0) {
          // Use historical data for candlestick chart
          const candlestickData = this.historicalData.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]);
          const xAxisLabels = this.historicalData.map(item => {
            const date = new Date(item.date);
            return date.toISOString().split('T')[0]; // Use ISO date format for consistency
          });
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        } else {
          // Fallback to stock data (without volume since stock data doesn't have volume)
          const stockData = this.filteredDashboardData || this.dashboardData;
          if (!stockData || stockData.length === 0) {
            return [];
          }
          const candlestickData = stockData.map(stock => [
            stock.openPrice || 0,
            stock.lastPrice || 0,
            stock.dayLow || 0,
            stock.dayHigh || 0
          ]);
          const xAxisLabels = stockData.map(stock => stock.tradingsymbol || stock.symbol || 'Unknown');
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
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
      case 'Index Historical Price Movement':
        // Use historical data for candlestick chart if available, otherwise use stock data
        if (this.historicalData.length > 0) {
          // Transform historical data to candlestick format: [open, close, low, high]
          const candlestickData = this.historicalData.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]);
          
          // Set X-axis labels (dates) with proper ISO format for consistency
          const xAxisLabels = this.historicalData.map(item => {
            const date = new Date(item.date);
            return date.toISOString().split('T')[0]; // Use ISO date format for consistency
          });
          
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        } else {
          // Fallback to stock data (without volume since stock data doesn't have volume)
          if (!sourceData) {
            return [];
          }
          
          // Transform stock data to candlestick format: [open, close, low, high]
          const candlestickData = sourceData.map(stock => [
            stock.openPrice || 0,
            stock.lastPrice || 0,
            stock.dayLow || 0,
            stock.dayHigh || 0
          ]);
          
          // Set X-axis labels (symbols or dates if available)
          const xAxisLabels = sourceData.map(stock => {
            // Try to use lastUpdateTime if available, otherwise fall back to symbol
            if (stock.lastUpdateTime) {
              try {
                const date = new Date(stock.lastUpdateTime);
                if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
                }
              } catch (e) {
                // Fall back to symbol if date parsing fails
              }
            }
            return stock.tradingsymbol || stock.symbol || 'Unknown';
          });
          
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        }

      default:
        return null;
    }
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
        this.updateCandlestickChartWithHistoricalData();
      this.updateStockListWithFilteredData();
      
      // Update metric tiles with filtered data
      this.updateMetricTilesWithFilters([]);
      
      this.cdr.detectChanges();
      this.chartUpdateTimer = null;
    }, 150); // Increased delay and debounce to reduce chart reinitialization
  }

  /**
   * Safely dispose of chart instance before updating
   */
  private safelyDisposeChartInstance(widget: IWidget): void {
    if (widget.chartInstance && typeof widget.chartInstance.dispose === 'function') {
      try {
        widget.chartInstance.dispose();
        widget.chartInstance = null;
      } catch (error) {
        console.warn('Error disposing chart instance:', error);
      }
    }
  }

  /**
   * Update candlestick chart with historical data from the API
   */
  private updateCandlestickChartWithHistoricalData(): void {
    if (!this.dashboardConfig?.widgets) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (!candlestickWidget) {
      return;
    }

    if (!this.historicalData || this.historicalData.length === 0) {
      this.clearCandlestickChart();
      return;
    }

    const filteredData = this.filterHistoricalDataByTimeRange(this.selectedTimeRange);
    this.applyCandlestickData(candlestickWidget, filteredData);
  }

  private clearCandlestickChart(): void {
    if (!this.dashboardConfig?.widgets) return;
    const candlestickWidget = this.dashboardConfig.widgets.find(widget =>
      widget.config?.header?.title === 'Index Historical Price Movement'
    );
    if (!candlestickWidget) return;

    this.applyCandlestickData(candlestickWidget, []);
  }

  /**
   * Apply candlestick data to the widget and update its ECharts options.
   * Data is already sorted in ascending order (oldest to newest) from the API.
   */
  private applyCandlestickData(widget: IWidget, dataset: IndexHistoricalData[]): void {
    const candlestickData = dataset.map(item => [
      Number(item.open) || 0,
      Number(item.close) || 0,
      Number(item.low) || 0,
      Number(item.high) || 0
    ]);

    const xAxisData = dataset.map(item => this.formatHistoricalDate(item.date));

    const updatedOptions = this.buildUpdatedCandlestickOptions(widget, candlestickData, xAxisData);

    widget.data = dataset;

    if (widget.config) {
      widget.config.options = updatedOptions;
    } else {
      widget.config = { options: updatedOptions };
    }

    if (widget.chartInstance && typeof widget.chartInstance.setOption === 'function') {
      widget.chartInstance.setOption(updatedOptions, true);
      setTimeout(() => widget.chartInstance?.resize?.(), 50);
    }

    this.cdr.detectChanges();
  }

  private buildUpdatedCandlestickOptions(
    widget: IWidget,
    candlestickData: number[][],
    xAxisData: string[]
  ): any {
    const baseOptions: any = (widget.chartInstance?.getOption?.() || widget.config?.options || {});
    const options = { ...baseOptions };

    // Update x-axis labels with enhanced formatter and font size
    const xAxisFormatter = (value: string, index: number) => {
      if (value && typeof value === 'string') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            // Check if dataZoom is active by checking if we have many data points
            const totalPoints = xAxisData?.length || 0;
            const isZoomed = totalPoints < 30; // If less than 30 points visible, consider it zoomed
            
            if (isZoomed) {
              // Show full date when zoomed in
              return date.toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: '2-digit'
              });
            } else {
              // Show year and month only when not zoomed
              return date.toLocaleDateString('en-IN', { 
                month: 'short', 
                year: 'numeric'
              });
            }
          }
        } catch (e) {
          // If not a valid date, return as is
        }
      }
      return value;
    };

    // Update x-axis - single axis for candlestick chart
    if (Array.isArray(options.xAxis)) {
      // Keep only the first x-axis
      options.xAxis = [{
        ...options.xAxis[0],
        data: xAxisData,
        gridIndex: 0,
        axisLabel: {
          ...options.xAxis[0]?.axisLabel,
          fontSize: 14,
          formatter: xAxisFormatter,
          show: true
        }
      }];
    } else if (options.xAxis) {
      options.xAxis = {
        ...options.xAxis,
        data: xAxisData,
        gridIndex: 0,
        axisLabel: {
          ...options.xAxis.axisLabel,
          fontSize: 14,
          formatter: xAxisFormatter,
          show: true
        }
      };
    } else {
      options.xAxis = {
        type: 'category',
        data: xAxisData,
        gridIndex: 0,
        axisLabel: {
          fontSize: 14,
          formatter: xAxisFormatter,
          show: true
        }
      };
    }

    // Update Y-axis font size
    if (Array.isArray(options.yAxis)) {
      options.yAxis = options.yAxis.map((axis: any) => ({
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          fontSize: 20 // 1.25rem = 20px
        }
      }));
    } else if (options.yAxis) {
      options.yAxis = {
        ...options.yAxis,
        axisLabel: {
          ...options.yAxis.axisLabel,
          fontSize: 20 // 1.25rem = 20px
        }
      };
    }

    // Update series data - candlestick only
    if (!Array.isArray(options.series)) {
      options.series = [];
    }
    
    // Remove any volume (bar) series or line series
    // Volume series can be identified by: type='bar', name='Volume', gridIndex=1, xAxisIndex=1, or yAxisIndex=1
    options.series = options.series.filter((s: any) => {
      // Remove line series
      if (s.type === 'line') {
        return false;
      }
      // Remove volume/bar series
      if (s.type === 'bar') {
        if (s.name === 'Volume' || 
            s.gridIndex === 1 || 
            s.xAxisIndex === 1 || 
            s.yAxisIndex === 1) {
          return false;
        }
      }
      return true;
    });
    
    // Find and update candlestick series
    let candlestickSeries = options.series.find((s: any) => s.type === 'candlestick');
    if (!candlestickSeries) {
      candlestickSeries = {
        name: 'Price',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        gridIndex: 0,
        data: candlestickData,
        itemStyle: {
          color: '#00da3c',  // Green for positive
          color0: '#ec0000', // Red for negative
          borderColor: '#00da3c',
          borderColor0: '#ec0000'
        }
      };
      options.series.push(candlestickSeries);
    } else {
      candlestickSeries.data = candlestickData;
      candlestickSeries.xAxisIndex = 0;
      candlestickSeries.yAxisIndex = 0;
      candlestickSeries.gridIndex = 0;
    }

    return options;
  }

  private formatHistoricalDate(dateValue?: string): string {
    if (!dateValue) {
      return '';
    }

    const normalized = dateValue.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toISOString().split('T')[0];
  }


  private updateStockListWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );

    stockListWidgets.forEach(widget => {
      const stockData = this.filteredDashboardData || [];
      const newStockDataArray = [...stockData];
      
      if (widget.data) {
        widget.data.stocks = newStockDataArray;
        widget.data.isLoadingStocks = false;
        widget.data.selectedStockSymbol = this.selectedIndexSymbol;
      } else {
        widget.data = {
          stocks: newStockDataArray,
          isLoadingStocks: false,
          selectedStockSymbol: this.selectedIndexSymbol
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
   * Subscribe to WebSocket updates for the selected index
   * @param indexName - The name of the index to subscribe to
   */
  private async subscribeToIndexWebSocket(indexName: string): Promise<void> {
    // Prevent duplicate subscriptions
    if (this.isSubscribing) {
      return;
    }

    // Check if we're already subscribed to this index
    const webSocketIndexName = indexName.replace(/\s+/g, '-').toLowerCase();
    const topicName = `/topic/nse-indices/${webSocketIndexName}`;
    
    if (this.subscribedTopics.has(topicName)) {
      return;
    }

    // Unsubscribe from previous subscription if any
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }

    // Track the current subscribed index
    this.currentSubscribedIndex = indexName;
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
        
        // First try to subscribe to specific index data
        try {
          this.indicesWebSocketSubscription = this.webSocketService
            .subscribeToIndex(webSocketIndexName)
            .subscribe({
              next: (indicesData) => {
                this.handleWebSocketData(indicesData, indexName);
              },
              error: (error) => {
                console.warn(`Specific index subscription failed for ${webSocketIndexName}, falling back to all indices:`, error.message || error);
                // Fallback to all indices subscription
                this.subscribeToAllIndicesAsFallback(indexName);
              },
              complete: () => {
                // WebSocket subscription completed
              }
            });
          
          // Mark this topic as subscribed
          this.subscribedTopics.add(topicName);
          
        } catch (error) {
          console.warn(`Specific index subscription failed for ${webSocketIndexName}, falling back to all indices:`, error);
          // Fallback to all indices subscription
          this.subscribeToAllIndicesAsFallback(indexName);
        }
          
      }
    } catch (error) {
      // Don't clear currentSelectedIndexData on WebSocket connection failures to prevent tile from reverting
      this.cdr.detectChanges();
    } finally {
      // Always reset the subscribing flag
      this.isSubscribing = false;
    }
  }

  /**
   * Fallback subscription to all indices data when specific index subscription fails
   * @param targetIndexName - The name of the index we're looking for
   */
  private subscribeToAllIndicesAsFallback(targetIndexName: string): void {
    try {
      this.indicesWebSocketSubscription = this.webSocketService
        .subscribeToAllIndices()
        .subscribe({
          next: (indicesData: IndicesDto) => {
            // Filter for the target index from all indices data
            if (indicesData && indicesData.indices && indicesData.indices.length > 0) {
              const targetIndex = indicesData.indices.find(index => {
                const indexName = index.indexName || index.index || '';
                const indexSymbol = index.indexSymbol || index.key || '';
                return indexName.toLowerCase().includes(targetIndexName.toLowerCase()) ||
                       indexSymbol.toLowerCase().includes(targetIndexName.toLowerCase()) ||
                       targetIndexName.toLowerCase().includes(indexName.toLowerCase()) ||
                       targetIndexName.toLowerCase().includes(indexSymbol.toLowerCase());
              });
              
              if (targetIndex) {
                this.handleWebSocketData(targetIndex, targetIndexName);
              }
            }
          },
          error: (error) => {
            console.warn('All indices subscription error:', error.message || error);
            this.cdr.detectChanges();
          },
          complete: () => {
            // WebSocket subscription completed
          }
        });
    } catch (error) {
      console.error('Failed to subscribe to all indices as fallback:', error);
    }
  }

  /**
   * Handle WebSocket data updates for the selected index
   * @param indexData - Raw index data received from WebSocket
   * @param indexName - The name of the index being monitored
   */
  private handleWebSocketData(indexData: any, indexName: string): void {
    try {

      
      // The WebSocket now returns raw index data directly, not wrapped in IndicesDto
      if (indexData && (indexData.indexName || indexData.indexSymbol)) {
        
        
        // Update current selected index data with real-time information
        this.currentSelectedIndexData = indexData;
        
        // Check if dashboard is ready before updating
        if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
          console.warn('Dashboard not ready yet, deferring first tile update');
          // Schedule the update for later
          setTimeout(() => {
            this.updateFirstTileWithRealTimeData(indexData);
          }, 1000);
          return;
        }
        
        // Throttle UI updates to avoid excessive re-initializations
        if (this.chartUpdateTimer) {
          return; // A recent update is in progress; skip this tick
        }
        this.chartUpdateTimer = setTimeout(() => {
          try {
            // Update the first tile (index price tile) with real-time data
            this.updateFirstTileWithRealTimeData(indexData);
            // Update metric tiles in-place with new data (non-destructive)
            this.recreateMetricTiles();
            // Trigger change detection
            this.cdr.detectChanges();
          } finally {
            this.chartUpdateTimer = null;
          }
        }, 250);
      } else {
        console.warn('WebSocket received data but no valid index data found:', indexData);
      }
    } catch (error: any) {
      console.error('Error processing received index data:', error);
    }
  }

  /**
   * Attempt to reconnect to WebSocket and resubscribe to current index
   */
  private async attemptWebSocketReconnection(): Promise<void> {
    if (!this.currentSubscribedIndex) {
      return;
    }

    try {

      await this.webSocketService.connect();
      
              if (this.webSocketService.connected) {
        this.subscribeToIndexWebSocket(this.currentSubscribedIndex);
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
   * Update the first tile (index price tile) with real-time WebSocket data
   * @param realTimeIndexData - Real-time index data from WebSocket
   */
  private updateFirstTileWithRealTimeData(realTimeIndexData: IndexDataDto): void {
    // Wait for dashboard to be ready
    if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
      // Wait for dashboard to be ready and retry
      setTimeout(() => {
        this.updateFirstTileWithRealTimeData(realTimeIndexData);
      }, 500);
      return;
    }

    // Find the first tile (index price tile) - try multiple strategies
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



    if (!realTimeIndexData) {
      console.warn('No real-time index data available for first tile update');
      return;
    }

    try {
      // Extract real-time data using WebSocket field names
      const indexName = realTimeIndexData.indexName || realTimeIndexData.indexSymbol || 'Index';
      const lastPrice = realTimeIndexData.lastPrice || 0;
      const percentChange = realTimeIndexData.percentChange || 0;
      const dayHigh = realTimeIndexData.dayHigh || 0;
      const dayLow = realTimeIndexData.dayLow || 0;
      const variation = realTimeIndexData.variation || 0;



      if (firstTile.config?.component === 'stock-tile') {
        // Update stock tile with real-time data using exact WebSocket fields
        const stockTileData = {
          value: lastPrice.toFixed(2),
          change: variation.toFixed(2), // Use variation field from WebSocket
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: indexName, // Use indexName from WebSocket
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
          change: variation.toFixed(2),
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: indexName,
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          title: indexName,
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
   * Handle time range change events from the candlestick chart
   * @param event TimeRangeFilterEvent containing the selected time range
   */
  private handleTimeRangeChange(event: TimeRangeFilterEvent): void {
    // Store the selected time range
    this.selectedTimeRange = event.range;
    this.ensureWidgetTimeRangeFilters();
    
    // Get the current index name
    const indexName = this.currentSelectedIndexData?.indexName;
    
    if (!indexName) {
      return;
    }
    
    // Calculate start and end dates based on the time range
    const { startDate, endDate } = this.calculateDateRangeFromTimeRange(event.range);
    
    // Show loading indicator
    this.isCandlestickLoading = true;
    this.cdr.detectChanges();
    
    // Make API call with date range (pass undefined for days to force date range usage)
    this.indicesService.getIndexHistoricalData(indexName, undefined, startDate, endDate).subscribe({
      next: (historicalData: IndexHistoricalData[]) => {
        this.historicalData = this.normalizeHistoricalData(historicalData || []);
        this.updateCandlestickChartWithHistoricalData();
        this.isCandlestickLoading = false;
        this.cdr.detectChanges();
        this.ensureWidgetTimeRangeFilters();
      },
      error: (error) => {
        this.isCandlestickLoading = false;
        this.cdr.detectChanges();
        this.ensureWidgetTimeRangeFilters();
      }
    });
  }

  /**
   * Handle header time range button click
   */
  public onTimeRangeButtonClick(range: TimeRangeFilterEvent['range']): void {
    if (!range) {
      return;
    }

    this.handleTimeRangeChange({
      type: 'timeRangeChange',
      range,
      widgetId: 'candlestick-chart'
    });
  }

  /**
   * Ensure time range filters are rendered inside the candlestick widget header
   */
  private ensureWidgetTimeRangeFilters(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const widgetElement = document.querySelector('[data-widget-id="candlestick-chart"]');
    if (!widgetElement) {
      // Retry after a short delay (max 5 retries)
      const retryCount = (this as any)._filterRetryCount || 0;
      if (retryCount < 5) {
        (this as any)._filterRetryCount = retryCount + 1;
        setTimeout(() => this.ensureWidgetTimeRangeFilters(), 200);
      }
      return;
    }

    const header = widgetElement.querySelector('.p-panel-header') as HTMLElement | null;
    if (!header) {
      const retryCount = (this as any)._filterRetryCount || 0;
      if (retryCount < 5) {
        (this as any)._filterRetryCount = retryCount + 1;
        setTimeout(() => this.ensureWidgetTimeRangeFilters(), 200);
      }
      return;
    }

    // Reset retry count on success
    (this as any)._filterRetryCount = 0;

    // Target the new widget-header-right container
    // Try both the new class and the old p-panel-header-icons as fallback
    let rightContainer = header.querySelector('.widget-header-right') as HTMLElement | null;
    if (!rightContainer) {
      // Fallback to p-panel-header-icons if widget-header-right doesn't exist
      rightContainer = header.querySelector('.p-panel-header-icons') as HTMLElement | null;
    }
    
    if (!rightContainer) {
      // If still not found, try to find the header content div and create the right container
      const headerContent = header.querySelector('.widget-header-content') as HTMLElement | null;
      if (headerContent) {
        rightContainer = document.createElement('div');
        rightContainer.classList.add('widget-header-right', 'p-panel-header-icons');
        headerContent.appendChild(rightContainer);
      } else {
        // Last resort: append to header directly
        rightContainer = document.createElement('div');
        rightContainer.classList.add('widget-header-right', 'p-panel-header-icons');
        header.appendChild(rightContainer);
      }
    }

    let container = rightContainer.querySelector('.widget-time-range-filters') as HTMLElement | null;
    if (!container) {
      container = document.createElement('div');
      container.classList.add('widget-time-range-filters');
      rightContainer.appendChild(container);
    }

    container.innerHTML = '';

    // Create time range filter buttons
    this.timeRangeOptions.forEach((range) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add('time-range-btn');
      if (range === this.selectedTimeRange) {
        button.classList.add('active');
      }
      button.textContent = range;
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.ngZone.run(() => this.onTimeRangeButtonClick(range));
      });
      container?.appendChild(button);
    });
    
    // Force change detection after DOM manipulation
    this.cdr.detectChanges();
  }
  
  /**
   * Calculate start and end dates based on the selected time range
   * @param timeRange The selected time range (1D, 5D, 1M, 3M, 6M, YTD, 1Y, 3Y, 5Y, MAX)
   * @returns Object with startDate and endDate as ISO date strings
   */
  private calculateDateRangeFromTimeRange(timeRange: string): { startDate: string; endDate: string } {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set to end of day
    let startDate = new Date();
    
    switch (timeRange) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '5D':
        startDate.setDate(endDate.getDate() - 5);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3Y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case 'MAX':
        // For MAX, use a very old date (e.g., 10 years ago)
        startDate.setFullYear(endDate.getFullYear() - 10);
        break;
      default:
        // Default to 1 year
        startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    startDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // Format as ISO date strings (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  }

  /**
   * Filter historical data based on the selected time range
   * @param timeRange The selected time range
   */
  private filterHistoricalDataByTimeRange(timeRange: string): IndexHistoricalData[] {
    if (!this.historicalData || this.historicalData.length === 0) {
      return [];
    }

    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '5D':
        startDate.setDate(endDate.getDate() - 5);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'YTD':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '3Y':
        startDate.setFullYear(endDate.getFullYear() - 3);
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
      case 'MAX':
        // For MAX, return all data
        return this.historicalData;
      default:
        // Default to 1 year
        startDate.setFullYear(endDate.getFullYear() - 1);
    }

    // Filter data based on date range
    return this.historicalData.filter(item => {
      const itemDate = item.date ? new Date(item.date) : new Date();
      return itemDate >= startDate && itemDate <= endDate;
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
            // Only resubscribe if we have a current subscribed index AND we're not already subscribed
            if (this.currentSubscribedIndex && !this.isSubscribing) {
              const webSocketIndexName = this.currentSubscribedIndex.replace(/\s+/g, '-').toLowerCase();
              const topicName = `/topic/nse-indices/${webSocketIndexName}`;
              
              if (!this.subscribedTopics.has(topicName)) {
                
                this.subscribeToIndexWebSocket(this.currentSubscribedIndex);
                              } else {
                  // Already subscribed to topic, no need to resubscribe
                }
            }
          } else if (state === 'DISCONNECTED' || state === 'ERROR') {
            // Clear subscribed topics when disconnected
            this.subscribedTopics.clear();
            // Attempt reconnection if we have a subscribed index
            if (this.currentSubscribedIndex) {
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
          if (this.currentSubscribedIndex) {
            this.attemptWebSocketReconnection();
          }
        }
      });
  }

}