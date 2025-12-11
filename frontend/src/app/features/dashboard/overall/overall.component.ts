import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subscription, BehaviorSubject } from 'rxjs';
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
  FilterBy
} from '@dashboards/public-api';


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
import { NativeWebSocketService, IndexDataDto, IndicesDto, WebSocketConnectionState } from '../../../services/websockets';

// Import environment for debugging
import { environment } from '../../../../environments/environment';


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
  
  // Current selected index data from WebSocket
  private currentSelectedIndexData: IndexDataDto | null = null;
  
  // Historical data for candlestick chart
  private historicalData: IndexHistoricalData[] = [];
  
  // Selected time range for candlestick chart
  public selectedTimeRange: TimeRangeFilterEvent['range'] = 'YTD';
  public readonly timeRangeOptions: TimeRangeFilterEvent['range'][] = ['1D', '5D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', 'MAX'];

  // Currently selected index symbol for highlighting in Index List widget
  public selectedIndexSymbol: string = '';

  // Loading state for candlestick chart (converted to signal for reactive UI updates)
  protected isCandlestickLoadingSignal = signal<boolean>(false);

  // Component destruction flag to prevent chart updates during navigation
  private isComponentDestroyed = false;
  
  // Navigation flag to prevent chart operations during route changes
  private isNavigating = false;
  
  // Flag to disable all chart operations if errors occur
  private chartOperationsDisabled = false;

  // Real-time last price signal for the selected index
  private currentLastPriceSignal = signal<number | null>(null);
  
  // Real-time price data array for the line chart (stores timestamp and price pairs)
  private realTimePriceData: Array<{timestamp: string, price: number}> = [];

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedIndex: string | null = null;
  private isSubscribing: boolean = false; // Track if we're currently in the process of subscribing
  private subscribedTopics: Set<string> = new Set(); // Track which topics we're already subscribed to


  // ========== Angular Signals for Reactive State Management ==========
  
  // Writable signals for mutable state
  private indicesDataSignal = signal<StockDataDto[]>([]);
  private selectedIndexSymbolSignal = signal<string>('');
  private wsConnectionStateSignal = signal<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  
  // BehaviorSubject for better reactivity with widgets
  private indicesDataSubject = new BehaviorSubject<StockDataDto[]>([]);
  
  
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
  
  // Computed signal for price change indicators
  // Requirements: 3.1, 3.2
  protected indicesWithChangeIndicatorsSignal = computed(() => {
    const data = this.indicesDataSignal();
    
    return data.map(index => {
      const priceChange = index.priceChange || 0;
      const percentChange = index.percentChange || 0;
      
      // Determine change indicator based on price change
      let changeIndicator: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      if (priceChange > 0 || percentChange > 0) {
        changeIndicator = 'positive';
      } else if (priceChange < 0 || percentChange < 0) {
        changeIndicator = 'negative';
      }
      
      return {
        ...index,
        changeIndicator
      };
    });
  });
  
  // Subscription for all indices WebSocket data
  private allIndicesSubscription: Subscription | null = null;
  
  // BehaviorSubject subscription
  private indicesDataSubscription: Subscription | null = null;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private indicesService: IndicesService,
    private webSocketService: NativeWebSocketService,
    private ngZone: NgZone

  ) {
    super(cdr, excelExportService, filterService);
    
    // Set up effects for reactive side effects
    this.setupSignalEffects();
    
    // Set up BehaviorSubject subscription for additional reactivity
    this.setupBehaviorSubjectSubscription();
    
    // Make component accessible for debugging (only in development)
    if (typeof window !== 'undefined' && !environment?.production) {
      (window as any).overallComponent = this;
    }
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
    
    // Register this component with WebSocket service
    this.webSocketService.registerComponent('OverallComponent');
    
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
              // Use centralized subscription error handler with retry logic
              this.handleSubscriptionError('/topic/nse-indices', error, 0);
            }
          });
        
        // Update connection state signal to CONNECTED
        this.wsConnectionStateSignal.set(WebSocketConnectionState.CONNECTED);
        
      })
      .catch((error) => {
        // Connection failed - use centralized error handler
        this.handleConnectionError(error);
      });
  }
  
  /**
   * Handle WebSocket connection errors
   * This method logs connection errors with context and updates the connection state signal.
   * The application continues to function with fallback data - no user-facing error is displayed.
   * 
   * Requirements: 2.3, 4.1
   * 
   * @param error - The error object from the failed connection attempt
   */
  private handleConnectionError(error: any): void {
    // Log error with context information
    
    // Update connection state signal to ERROR
    this.wsConnectionStateSignal.set(WebSocketConnectionState.ERROR);
    
    // Continue displaying fallback data - no user-facing error
    // The application remains fully functional with REST API data
  }
  
  /**
   * Handle WebSocket data parsing errors
   * This method logs parsing errors with the raw message and error details.
   * The update is skipped and the application continues with existing data.
   * 
   * Requirements: 5.3, 8.2
   * 
   * @param rawMessage - The raw message string that failed to parse
   * @param error - The error object from the parsing failure
   */
  private handleParsingError(rawMessage: string, error: any): void {
    // Log error with raw message (first 200 chars) and error details
    
    // Skip this update - continue with existing data
    // No state changes, no user-facing error
    // The application continues to function normally with current data
  }
  
  /**
   * Handle WebSocket subscription errors
   * This method logs subscription errors with topic name and error details.
   * It implements retry logic with exponential backoff to attempt reconnection.
   * 
   * Requirements: 4.2, 8.3
   * 
   * @param topic - The topic name that failed to subscribe
   * @param error - The error object from the subscription failure
   * @param retryCount - Current retry attempt count (default: 0)
   */
  private handleSubscriptionError(topic: string, error: any, retryCount: number = 0): void {
    // Log error with topic name and error details
    
    // Maximum retry attempts
    const MAX_RETRIES = 5;
    
    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      // Calculate exponential backoff delay: 2^retryCount * 1000ms
      // Retry 0: 1s, Retry 1: 2s, Retry 2: 4s, Retry 3: 8s, Retry 4: 16s
      const delayMs = Math.pow(2, retryCount) * 1000;
      
      
      // Schedule retry with exponential backoff
      setTimeout(() => {
        this.retrySubscription(topic, retryCount + 1);
      }, delayMs);
    } else {
      // Max retries exceeded - log final failure and continue with fallback data
      
      // Update connection state to ERROR to indicate subscription failure
      this.wsConnectionStateSignal.set(WebSocketConnectionState.ERROR);
    }
  }
  
  /**
   * Retry WebSocket subscription after a failure
   * This method attempts to resubscribe to the all indices topic.
   * 
   * @param topic - The topic name to retry subscribing to
   * @param retryCount - Current retry attempt count
   */
  private retrySubscription(topic: string, retryCount: number): void {
    
    // Check if we're trying to retry the all indices subscription
    if (topic === '/topic/nse-indices') {
      
      // Attempt to resubscribe to all indices
      this.allIndicesSubscription = this.webSocketService
        .subscribeToAllIndices()
        .subscribe({
          next: (indicesDto: IndicesDto) => {
            // Subscription successful - reset retry count
            this.handleIncomingIndicesData(indicesDto);
          },
          error: (error) => {
            // Subscription failed again - call error handler with incremented retry count
            this.handleSubscriptionError(topic, error, retryCount);
          }
        });
    } else {
    }
  }
  
  /**
   * Handle incoming indices data from WebSocket
   * This method processes real-time indices data received via WebSocket and updates the component state.
   * Uses baseline cache for accurate price change calculations.
   * 
   * Requirements: 2.3, 3.1, 3.2, 4.1
   * 
   * @param indicesDto - The indices data received from WebSocket
   */
  private handleIncomingIndicesData(indicesDto: IndicesDto): void {
    
    // Validate incoming data
    if (!indicesDto?.indices || indicesDto.indices.length === 0) {
      return;
    }
    
    // CRITICAL: ALWAYS use WebSocket data directly for Stock List widget (no baseline merging)
    // The WebSocket data contains all necessary fields: lastTradedPrice, ohlc.close, etc.
    const directData = this.processWebSocketDataDirectly(indicesDto.indices);
    
    // Update signals with direct WebSocket data
    this.indicesDataSignal.set(directData);
    this.indicesDataSubject.next(directData);
    
    // CRITICAL: Update dashboard data to ensure widget has latest WebSocket values
    this.dashboardData = [...directData];
    this.filteredDashboardData = [...directData];
    
    // Update widgets directly with WebSocket data
    this.updateStockListWidgetDirectly(directData);
    
    const dataWithIndicators = directData.map(item => ({
      ...item,
      changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
    }));
    this.updateIndexListWidget(dataWithIndicators, this.selectedIndexSymbolSignal());
    
    // CRITICAL: Force change detection to ensure widget updates
    this.cdr.detectChanges();
    
  }
  
  /**
   * Process WebSocket data directly when baseline data is not available
   * This method converts WebSocket tick data directly to StockDataDto format
   * 
   * @param incomingTicks - Real-time tick data from WebSocket
   * @returns StockDataDto array with WebSocket data
   */
  private processWebSocketDataDirectly(incomingTicks: IndexDataDto[]): StockDataDto[] {
    
    return incomingTicks.map(tick => {
      // Extract symbol - WebSocket service maps tick.symbol to indexSymbol/indexName/key
      const symbol = tick.indexSymbol || tick.indexName || tick.key || (tick as any).symbol || '';
      
      // CRITICAL: Extract lastPrice directly from WebSocket data
      // Check multiple sources in order: lastPrice (mapped), last, lastTradedPrice (raw)
      let lastPrice: number = 0;
      if (tick.lastPrice && tick.lastPrice > 0) {
        lastPrice = tick.lastPrice;
      } else if (tick.last && tick.last > 0) {
        lastPrice = tick.last;
      } else if ((tick as any).lastTradedPrice && (tick as any).lastTradedPrice > 0) {
        lastPrice = (tick as any).lastTradedPrice;
      }
      
      // Get OHLC close from WebSocket data - this is the reference price for change calculations
      const ohlcClose = tick.ohlc?.close || tick.previousClose || 0;
      
      // Calculate changes if we have valid data
      // Change = lastTradedPrice - ohlc.close
      // Change % = (lastTradedPrice - ohlc.close) / ohlc.close * 100
      let priceChange = 0;
      let percentChange = 0;
      
      if (lastPrice > 0 && ohlcClose > 0) {
        priceChange = lastPrice - ohlcClose;
        percentChange = (priceChange / ohlcClose) * 100;
      }
      
      // CRITICAL: Create StockDataDto with explicit values to ensure nothing is lost
      const stockData: StockDataDto = {
        tradingsymbol: symbol,
        symbol: symbol,
        companyName: tick.indexName || tick.indexSymbol || symbol,
        lastPrice: lastPrice, // CRITICAL: Use extracted value directly
        percentChange: percentChange,
        priceChange: priceChange,
        previousClose: ohlcClose > 0 ? ohlcClose : lastPrice, // Use OHLC close or lastPrice as fallback
        totalTradedValue: 0,
        sector: 'Indices',
        industry: 'Indices',
        openPrice: tick.openPrice || tick.open || tick.ohlc?.open || 0,
        dayHigh: tick.dayHigh || tick.high || tick.ohlc?.high || 0,
        dayLow: tick.dayLow || tick.low || tick.ohlc?.low || 0,
        lastUpdateTime: tick.tickTimestamp || tick.ingestionTimestamp || new Date().toISOString()
      };
      
      return stockData;
    });
  }

  
  /**
   * Calculate change indicator based on price and percent changes
   * 
   * @param priceChange - The price change value
   * @param percentChange - The percent change value
   * @returns Change indicator: 'positive', 'negative', or 'neutral'
   */
  private calculateChangeIndicator(priceChange?: number, percentChange?: number): 'positive' | 'negative' | 'neutral' {
    const price = priceChange || 0;
    const percent = percentChange || 0;
    
    if (price > 0 || percent > 0) {
      return 'positive';
    } else if (price < 0 || percent < 0) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
  
  /**
   * Force refresh all stock list widgets - useful for debugging
   * This method can be called from browser console for testing
   */
  public forceRefreshStockListWidgets(): void {
    const currentData = this.indicesDataSignal();
    if (currentData && currentData.length > 0) {
      
      // Force both update methods
      this.updateStockListWidgetDirectly(currentData);
      
      const dataWithIndicators = currentData.map(item => ({
        ...item,
        changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
      }));
      this.updateIndexListWidget(dataWithIndicators, this.selectedIndexSymbolSignal());
      
    } else {
    }
  }
  
  

  
  /**
   * Set up BehaviorSubject subscription for widget updates
   */
  private setupBehaviorSubjectSubscription(): void {
    // Subscribe to indices data changes via BehaviorSubject
    this.indicesDataSubscription = this.indicesDataSubject.subscribe(data => {
      
      if (data && data.length > 0) {
        
        // Update widgets directly
        this.updateStockListWidgetDirectly(data);
        
      } else {
      }
    });
    
  }

  /**
   * Set up Angular signal effects for logging and widget updates
   * Requirements: 8.4, 8.5
   */
  private setupSignalEffects(): void {
    // Track previous state for state transition logging
    let previousState: WebSocketConnectionState | null = null;
    
    // Effect: Log WebSocket connection state changes with detailed information
    // This effect logs all connection state transitions with timestamps
    // Requirements: 8.4, 8.5
    effect(() => {
      const currentState = this.wsConnectionStateSignal();
      const timestamp = new Date().toISOString();
      
      // Always log state changes (not just in debug mode) for monitoring
      
      // Verbose logging in debug mode with additional context
      
      // Update previous state for next transition
      previousState = currentState;
    });
    
    // Effect: Update widgets when indices data changes
    // This effect automatically triggers UI updates without manual change detection
    effect(() => {
      const dataWithIndicators = this.indicesWithChangeIndicatorsSignal();
      const selectedSymbol = this.selectedIndexSymbolSignal();
      
      
      if (dataWithIndicators && dataWithIndicators.length > 0) {
        
        // Update the Index List widget with new data including change indicators
        // The signal-based approach ensures automatic UI updates
        this.updateIndexListWidget(dataWithIndicators, selectedSymbol);
        
      } else {
      }
    });
    
    // Effect: Sync selected index symbol with signal
    effect(() => {
      const symbol = this.selectedIndexSymbolSignal();
      // Keep the existing property in sync for backward compatibility
      this.selectedIndexSymbol = symbol;
    });
    
    // Effect: Update candlestick chart when real-time price changes
    // PERMANENTLY DISABLED: Real-time price line functionality removed as requested by user
    // This effect has been completely removed to prevent any chart-related operations
  }
  
  /**
   * Direct widget update method for immediate data refresh
   * This bypasses signals and directly updates the widget data
   */
  private updateStockListWidgetDirectly(data: StockDataDto[]): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );


    if (stockListWidgets.length === 0) {
      return;
    }

    stockListWidgets.forEach((widget, index) => {
      // CRITICAL: Create a completely new array with deep cloning to ensure change detection
      const newStockDataArray = data.map((item, itemIndex) => {
        // Use structuredClone if available for better numeric preservation, fallback to JSON
        let clonedItem: any;
        try {
          clonedItem = structuredClone ? structuredClone(item) : JSON.parse(JSON.stringify(item));
        } catch {
          clonedItem = { ...item };
        }
        
        // CRITICAL: Use original item values directly - don't clone to avoid losing WebSocket data
        return {
          ...item, // Spread original item to preserve all WebSocket values
          // CRITICAL: Explicitly ensure numeric values are preserved from original item
          lastPrice: (typeof item.lastPrice === 'number') ? item.lastPrice : 0,
          priceChange: (typeof item.priceChange === 'number') ? item.priceChange : 0,
          percentChange: (typeof item.percentChange === 'number') ? item.percentChange : 0,
          // Ensure symbol fields are present
          symbol: item.symbol || item.tradingsymbol || '',
          tradingsymbol: item.tradingsymbol || item.symbol || '',
          companyName: item.companyName || item.symbol || '',
          // Add multiple unique identifiers to force re-rendering
          _updateId: Date.now() + Math.random() + itemIndex,
          _directUpdateId: `direct-${Date.now()}-${Math.random()}-${itemIndex}`,
          _timestamp: Date.now(),
          _version: Date.now() + itemIndex,
          // Force trackBy to detect changes
          id: item.id || item.symbol || item.tradingsymbol || `item-${itemIndex}`,
          // Add a changing property that trackBy functions will detect
          _lastModified: Date.now() + Math.random()
        };
      });
      
      
      // CRITICAL: Force complete data replacement with aggressive re-render triggers
      const newWidgetData = {
        stocks: newStockDataArray,
        isLoadingStocks: false,
        selectedStockSymbol: this.selectedIndexSymbol,
        // Add timestamp to force widget refresh
        lastUpdated: Date.now(),
        // Add a unique key to force complete re-render
        dataKey: `stocks-${Date.now()}-${Math.random()}`,
        // Force refresh flag
        forceRefresh: true,
        // Add version to track updates
        version: Date.now()
      };
      
      // CRITICAL: Replace the entire data object AND trigger widget refresh
      widget.data = newWidgetData;
      
      // CRITICAL: Force widget to refresh by updating its internal state
      if (widget.config) {
        (widget.config as any).lastDataUpdate = Date.now();
        (widget.config as any).forceRefresh = true;
      }
      
      // CRITICAL: Mark widget as dirty to force re-render
      (widget as any)._isDirty = true;
      (widget as any)._lastUpdate = Date.now();
      (widget as any)._forceRefresh = true;
      
    });
    
    // Update legacy properties for backward compatibility
    this.dashboardData = [...data];
    this.filteredDashboardData = [...data];
    
    // CRITICAL: Force multiple aggressive change detection cycles
    this.ngZone.run(() => {
      // Force immediate change detection
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      
      // Additional change detection cycles with delays
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }, 10);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }, 50);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }, 100);
    });
    
  }

  /**
   * Update Index List widget with signal-based data
   * This method reads from signals and updates the widget automatically
   * Requirements: 3.1, 3.2, 3.3, 3.5, 7.2, 7.3
   * 
   * @param data - The indices data from signal with change indicators
   * @param selectedSymbol - The currently selected index symbol from signal
   */
  private updateIndexListWidget(data: (StockDataDto & { changeIndicator?: 'positive' | 'negative' | 'neutral' })[], selectedSymbol: string): void {
    
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all stock list widgets
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );


    if (stockListWidgets.length === 0) {
      return;
    }

    stockListWidgets.forEach((widget, index) => {
      // Sort data by tradingsymbol (index_name) in ascending order
      const sortedData = [...data].sort((a, b) => {
        const aSymbol = (a.tradingsymbol || a.symbol || '').toUpperCase();
        const bSymbol = (b.tradingsymbol || b.symbol || '').toUpperCase();
        return aSymbol.localeCompare(bSymbol);
      });

      // Calculate footer statistics
      const totalCount = sortedData.length;
      const positiveCount = sortedData.filter(item => (item.percentChange || 0) > 0).length;
      const negativeCount = sortedData.filter(item => (item.percentChange || 0) < 0).length;

      // CRITICAL: Create a completely new array - use original values directly to preserve WebSocket data
      const newStockDataArray = sortedData.map((item, itemIndex) => {
        // CRITICAL: Use original item values directly - don't clone to avoid losing WebSocket data
        return {
          ...item, // Spread original item to preserve all WebSocket values
          // CRITICAL: Explicitly ensure numeric values are preserved from original item
          lastPrice: (typeof item.lastPrice === 'number') ? item.lastPrice : 0,
          priceChange: (typeof item.priceChange === 'number') ? item.priceChange : 0,
          percentChange: (typeof item.percentChange === 'number') ? item.percentChange : 0,
          changeIndicator: item.changeIndicator || 'neutral',
          // Ensure symbol fields are present
          symbol: item.symbol || item.tradingsymbol || '',
          tradingsymbol: item.tradingsymbol || item.symbol || '',
          companyName: item.companyName || item.symbol || '',
          // Add multiple unique identifiers to force re-rendering
          _signalUpdateId: Date.now() + Math.random() + itemIndex,
          _signalId: `signal-${Date.now()}-${Math.random()}-${itemIndex}`,
          _signalTimestamp: Date.now(),
          _signalVersion: Date.now() + itemIndex,
          // Force trackBy to detect changes
          id: item.id || item.symbol || item.tradingsymbol || `signal-item-${itemIndex}`,
          // Add a changing property that trackBy functions will detect
          _signalLastModified: Date.now() + Math.random()
        };
      });
      
      
      // CRITICAL: Force complete data replacement with aggressive re-render triggers
      const newWidgetData = {
        stocks: newStockDataArray,
        isLoadingStocks: false,
        selectedStockSymbol: selectedSymbol,
        // Footer statistics
        footerStats: {
          totalCount: totalCount,
          positiveCount: positiveCount,
          negativeCount: negativeCount
        },
        // Add timestamp to force widget refresh
        lastSignalUpdate: Date.now(),
        // Add a unique key to force complete re-render
        signalDataKey: `signal-stocks-${Date.now()}-${Math.random()}`,
        // Force refresh flag
        signalForceRefresh: true,
        // Add version to track updates
        signalVersion: Date.now()
      };
      
      // CRITICAL: Replace the entire data object AND trigger widget refresh
      widget.data = newWidgetData;
      
      // CRITICAL: Force widget to refresh by updating its internal state
      if (widget.config) {
        (widget.config as any).lastSignalUpdate = Date.now();
        (widget.config as any).signalForceRefresh = true;
      }
      
      // CRITICAL: Mark widget as dirty to force re-render
      (widget as any)._signalDirty = true;
      (widget as any)._lastSignalUpdate = Date.now();
      (widget as any)._signalForceRefresh = true;
      
    });
    
    // Update legacy properties for backward compatibility
    this.dashboardData = [...data];
    this.filteredDashboardData = [...data];
    
    
    // Force change detection for signal-based updates
    this.ngZone.run(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
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
      
    }
    
    
    // Call WebSocket service to unsubscribe from all topics
    this.webSocketService.unsubscribeFromAll();
    
    // Unregister this component from WebSocket service
    // This allows the service to disconnect if no other components are using it
    this.webSocketService.unregisterComponent('OverallComponent');
    
    
    // Update connection state signal to DISCONNECTED
    this.wsConnectionStateSignal.set(WebSocketConnectionState.DISCONNECTED);
    
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
        }
      });

    // Initialize WebSocket subscription for Stock List widget
    setTimeout(() => {
      this.initializeWebSocketSubscription();
    }, 200);

    // Wait for widget header to be fully rendered for Candlestick chart
    setTimeout(() => this.ensureWidgetTimeRangeFilters(), 300);
    
  }

  protected onChildDestroy(): void {
    // CRITICAL: Set destruction flags FIRST to prevent any chart updates
    this.isComponentDestroyed = true;
    this.isNavigating = true;
    this.chartOperationsDisabled = true;
    
    // CRITICAL: Clear all chart instances IMMEDIATELY to prevent disposal errors
    this.clearAllChartInstances();
    
    // CRITICAL: Cleanup WebSocket subscription FIRST before any other cleanup
    // This ensures proper resource cleanup and prevents memory leaks
    // Requirements: 1.4, 1.5, 2.2
    this.cleanupWebSocketSubscription();
    
    
    // Clean up chart update timer
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
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

    // Unsubscribe from BehaviorSubject subscription
    if (this.indicesDataSubscription) {
      this.indicesDataSubscription.unsubscribe();
      this.indicesDataSubscription = null;
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
    
    // CRITICAL: Force garbage collection if available (development only)
    if (typeof window !== 'undefined' && window.gc) {
      try {
        window.gc();
      } catch (error) {
        // Ignore GC errors
      }
    }
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

    // Update selected index symbol signal for highlighting (use symbol field to match stock list table)
    // This will automatically trigger the effect that updates the widget
    this.selectedIndexSymbolSignal.set(symbol || name);
    
    // Also update the legacy property for backward compatibility
    this.selectedIndexSymbol = symbol || name;

    // Show loading indicator
    this.isCandlestickLoadingSignal.set(true);

    const selectedIndexData: SelectedIndexData = {
      id: selectedIndex.id || symbol || name,
      symbol: symbol || name,
      name: name || symbol,
      lastPrice: selectedIndex.lastPrice || 0,
      variation: selectedIndex.priceChange || 0,
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
   * SAFELY RE-ENABLED: Historical data loading with enhanced safety measures
   * @param indexName The name of the index to load historical data for
   */
  private loadHistoricalData(indexName: string): void {
    // SAFETY: Use the new safe loading method
    this.loadHistoricalDataSafely(indexName);
  }

  /**
   * 🛡️ SAFE HISTORICAL DATA LOADING
   * This method implements safety measures to prevent API errors from interfering with navigation
   * @param indexName The name of the index to load historical data for
   */
  private loadHistoricalDataSafely(indexName: string): void {
    // SAFETY CHECK 1: Component lifecycle validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Chart operations validation
    if (this.chartOperationsDisabled) {
      this.chartOperationsDisabled = false;
    }

    // SAFETY CHECK 3: Index name validation
    if (!indexName || indexName.trim() === '') {
      return;
    }

    // Show loading indicator
    this.isCandlestickLoadingSignal.set(true);

    // SAFETY: Use a timeout to prevent blocking navigation
    const loadingTimeout = setTimeout(() => {
      this.isCandlestickLoadingSignal.set(false);
    }, 10000); // 10 second timeout

    try {
      // Convert time range to days for API call
      const days = this.convertTimeRangeToDays(this.selectedTimeRange);
      this.indicesService.getIndexHistoricalData(indexName, days).subscribe({
        next: (data) => {
          // Clear timeout since we got a response
          clearTimeout(loadingTimeout);
          
          // SAFETY CHECK: Ensure component is still valid when data arrives
          if (this.isComponentDestroyed || this.isNavigating) {
            return;
          }
          
          if (data && data.length > 0) {
            // Normalize and store historical data
            this.historicalData = this.normalizeHistoricalData(data);
            
            // SAFETY: Update chart only if everything is still valid
            this.safelyUpdateCandlestickChart();
          } else {
            this.historicalData = [];
          }
          
          // Hide loading indicator
          this.isCandlestickLoadingSignal.set(false);
        },
        error: (error) => {
          // Clear timeout
          clearTimeout(loadingTimeout);
          
          console.warn('Historical data loading failed (non-critical):', error);
          
          // SAFETY: Don't let API errors affect navigation - just log and continue
          this.historicalData = [];
          this.isCandlestickLoadingSignal.set(false);
          
          // SAFETY: Only trigger change detection if component is still valid
          if (!this.isComponentDestroyed && !this.isNavigating) {
            this.cdr.detectChanges();
          }
        }
      });
    } catch (error) {
      // Clear timeout
      clearTimeout(loadingTimeout);
      
      console.error('Error initiating historical data loading:', error);
      this.historicalData = [];
      this.isCandlestickLoadingSignal.set(false);
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
   * Clear all chart instances to prevent ECharts disposal errors during navigation
   * CRITICAL: This method prevents the __ec_inner_XX errors that cause navigation issues
   */
  private clearAllChartInstances(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all widgets with chart instances and dispose them safely
    this.dashboardConfig.widgets.forEach(widget => {
      if (widget.chartInstance) {
        try {
          // CRITICAL: Check if the chart instance is still valid before disposing
          if (typeof widget.chartInstance.dispose === 'function') {
            widget.chartInstance.dispose();
          }
        } catch (error) {
          // Ignore disposal errors - this is expected during navigation
          console.warn('Chart disposal error (expected during navigation):', error);
        } finally {
          // Always clear the reference regardless of disposal success
          widget.chartInstance = null;
        }
      }
    });

    // CRITICAL: Also clear any global ECharts instances that might exist
    try {
      // Clear any ECharts instances that might be registered globally
      if (typeof window !== 'undefined' && (window as any).echarts) {
        const echarts = (window as any).echarts;
        if (echarts.dispose && typeof echarts.dispose === 'function') {
          // Dispose all ECharts instances
          echarts.dispose();
        }
      }
    } catch (error) {
      // Ignore global cleanup errors
      console.warn('Global ECharts cleanup error (expected):', error);
    }
  }

  /**
   * 🛡️ SAFE CANDLESTICK CHART LOADING
   * This method implements multiple safety layers to prevent navigation issues:
   * 1. Navigation state checking
   * 2. Component lifecycle validation
   * 3. Data readiness verification
   * 4. Delayed loading with proper timing
   * 5. Enhanced error handling
   */
  private scheduleSafeCandlestickChartLoading(): void {
    // SAFETY CHECK 1: Ensure component is not being destroyed
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Wait for Angular to complete initial rendering
    setTimeout(() => {
      this.attemptSafeCandlestickChartCreation();
    }, 1000); // 1 second delay to ensure everything is stable
  }

  /**
   * 🔍 Attempt to safely create the candlestick chart with comprehensive validation
   */
  private attemptSafeCandlestickChartCreation(): void {
    // SAFETY CHECK 1: Component lifecycle validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Dashboard config validation
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // SAFETY CHECK 3: Check if chart already exists (prevent duplicates)
    const existingCandlestickChart = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );
    
    if (existingCandlestickChart) {
      return;
    }

    // SAFETY CHECK 4: Validate that we have space for the chart
    const stockListWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.component === 'stock-list-table'
    );
    
    if (!stockListWidget) {
      return;
    }

    try {
      this.createSafeCandlestickChart();
    } catch (error) {
      console.error('Error during safe candlestick chart creation:', error);
      // Don't disable chart operations on creation error - just log and continue
    }
  }

  /**
   * 🏗️ Create the candlestick chart with enhanced safety measures
   */
  private createSafeCandlestickChart(): void {
    try {
      // Create candlestick chart with safe configuration
      const candlestickChart = CandlestickChartBuilder.create()
        .setId('safe-candlestick-chart')
        .setTitle('Index Historical Price Movement')
        .setData([]) // Start with empty data
        .enableTimeRangeFilters(this.timeRangeOptions, this.selectedTimeRange)
        .setTimeRangeChangeCallback((event: any) => {
          // SAFETY: Only handle time range changes if component is not being destroyed
          if (!this.isComponentDestroyed && !this.isNavigating) {
            this.handleTimeRangeFilterChange(event);
          }
        })
        .build();

      // Position the chart safely
      candlestickChart.position = { x: 4, y: 0, cols: 8, rows: 12 };

      // SAFETY: Add chart to dashboard only if everything is still valid
      if (this.dashboardConfig?.widgets && !this.isComponentDestroyed) {
        this.dashboardConfig.widgets.push(candlestickChart);
        
        // Enable chart operations now that chart is safely created
        this.chartOperationsDisabled = false;
        
        // SAFETY: Trigger change detection only if component is still valid
        if (!this.isComponentDestroyed) {
          this.cdr.detectChanges();
          
          // SAFETY: Schedule safe data loading after chart is rendered
          setTimeout(() => {
            this.safelyLoadHistoricalDataForChart();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to create safe candlestick chart:', error);
      // Keep chart operations disabled on error
      this.chartOperationsDisabled = true;
    }
  }

  /**
   * 📊 Safely load historical data for the candlestick chart
   */
  private safelyLoadHistoricalDataForChart(): void {
    // SAFETY CHECK: Ensure component is still valid
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }
    
    // FORCE ENABLE: Ensure chart operations are enabled for historical data loading
    if (this.chartOperationsDisabled) {
      this.chartOperationsDisabled = false;
    }

    // SAFETY CHECK: Ensure we have a selected index
    const selectedSymbol = this.selectedIndexSymbolSignal();
    if (!selectedSymbol) {
      return;
    }
    
    // Re-enable historical data loading with safety measures
    this.loadHistoricalDataSafely(selectedSymbol);
  }

  /**
   * 🎛️ Handle time range filter changes from the candlestick chart
   * This method safely handles time range changes and reloads historical data
   */
  private handleTimeRangeFilterChange(event: any): void {
    // SAFETY CHECK: Component lifecycle validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK: Chart operations validation
    if (this.chartOperationsDisabled) {
      return;
    }

    try {
      // Update selected time range
      if (event.range) {
        this.selectedTimeRange = event.range;
        
        // Reload historical data with new time range
        const selectedSymbol = this.selectedIndexSymbolSignal();
        if (selectedSymbol) {
          this.loadHistoricalDataSafely(selectedSymbol);
        }
      }
    } catch (error) {
      console.error('Error handling time range filter change:', error);
    }
  }

  /**
   * 📅 Convert time range string to number of days for API call
   * This method maps the time range filter values to actual days
   */
  private convertTimeRangeToDays(timeRange: string): number {
    const timeRangeMap: { [key: string]: number } = {
      '1D': 1,
      '5D': 5,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      'YTD': this.getDaysFromYearStart(),
      '1Y': 365,
      '3Y': 365 * 3,
      '5Y': 365 * 5,
      'MAX': 365 * 10 // 10 years as maximum
    };

    return timeRangeMap[timeRange] || 365; // Default to 1 year
  }

  /**
   * 📅 Calculate days from start of current year to today
   * Used for YTD (Year To Date) time range calculation
   */
  private getDaysFromYearStart(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    
    // Clear real-time price data for the previous index
    
    // Update selected index symbol signal for highlighting in Index List widget
    // This will automatically trigger the effect that updates the widget
    this.selectedIndexSymbolSignal.set(selectedIndex.symbol || selectedIndex.name || '');
    
    // Also update the legacy property for backward compatibility
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
      });
    }
    

    // Conditionally fetch previous-day data only when WebSocket is not connected
    if (indexName) {
    }
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Create metric tiles - returns empty array as metric tiles are removed
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return [];
  }

  protected initializeDashboardConfig(): void {
    // SAFETY: Start with chart operations disabled until everything is ready
    this.chartOperationsDisabled = true;

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

    // Position widgets with candlestick chart space reserved
    stockListWidget.position = { x: 0, y: 0, cols: 4, rows: 20 };
    
    // Prepare widgets array - candlestick chart will be added later via safe loading
    const widgets = [
      stockListWidget
    ];
    
    // Use the Fluent API to build the dashboard config
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      .setWidgets(widgets)
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
    
    // SAFETY: Schedule safe candlestick chart loading after everything is initialized
    this.scheduleSafeCandlestickChartLoading();
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

    // EChart widgets (candlestick) are populated via safe loading mechanism

    // Find and populate stock list widgets
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );


    stockListWidgets.forEach((widget, index) => {
      const stockData = this.filteredDashboardData || this.dashboardData;
      
      if (stockData && stockData.length > 0) {
        // Create a new array with unique identifiers to ensure change detection
        const initialStockData = stockData.map(item => ({
          ...item,
          _initialLoadId: Date.now() + Math.random()
        }));
        
        // Force complete data replacement
        const initialWidgetData = {
          stocks: initialStockData,
          isLoadingStocks: false,
          selectedStockSymbol: this.selectedIndexSymbol,
          initialLoad: Date.now()
        };
        
        widget.data = initialWidgetData;
        
      } else {
        // Set empty data to show the empty message
        widget.data = {
          stocks: [],
          isLoadingStocks: false,
          selectedStockSymbol: this.selectedIndexSymbol,
          initialLoad: Date.now()
        };
        
      }
    });


    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
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



  /**
   * Safely dispose of chart instance before updating
   */
  private safelyDisposeChartInstance(widget: IWidget): void {
    if (widget.chartInstance && typeof widget.chartInstance.dispose === 'function') {
      try {
        widget.chartInstance.dispose();
        widget.chartInstance = null;
      } catch (error) {
      }
    }
  }

  /**
   * Update candlestick chart with historical data from the API
   * SAFELY RE-ENABLED: Candlestick chart functionality with enhanced safety measures
   */
  private updateCandlestickChartWithHistoricalData(): void {
    // SAFETY: Use the new safe update method
    this.safelyUpdateCandlestickChart();
  }

  /**
   * 🛡️ SAFE CANDLESTICK CHART UPDATE
   * This method implements multiple safety layers to prevent ECharts disposal errors
   */
  private safelyUpdateCandlestickChart(): void {
    // SAFETY CHECK 1: Component lifecycle validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Chart operations validation
    if (this.chartOperationsDisabled) {
      return;
    }

    // SAFETY CHECK 3: Dashboard and widgets validation
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // SAFETY CHECK 4: Find candlestick chart widget
    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (!candlestickWidget) {
      return;
    }

    // SAFETY CHECK 5: Historical data validation
    if (!this.historicalData || this.historicalData.length === 0) {
      return;
    }

    try {
      // Apply data to chart with enhanced safety
      this.applyCandlestickDataSafely(candlestickWidget, this.historicalData);
      
    } catch (error) {
      console.error('Error during safe candlestick chart update:', error);
      
      // SAFETY: Don't disable chart operations on update error - just log and continue
      // This prevents cascading failures
    }
  }

  /**
   * Update the candlestick chart with real-time price line
   * PERMANENTLY DISABLED: Real-time price line functionality removed as requested by user
   */
  private updateCandlestickChartWithRealTimePrice(): void {
    // PERMANENTLY DISABLED: Real-time price line functionality completely removed
    // User requested to remove real-time line display functionality
    return;
  }

  private clearCandlestickChart(): void {
    // PERMANENTLY DISABLED: Candlestick chart functionality removed to fix navigation issues
    return;
  }

  /**
   * Apply candlestick data to the widget and update its ECharts options.
   * Data is already sorted in ascending order (oldest to newest) from the API.
   */
  private applyCandlestickData(widget: IWidget, dataset: IndexHistoricalData[]): void {
    // SAFETY: Use the new safe application method
    this.applyCandlestickDataSafely(widget, dataset);
  }

  /**
   * 🛡️ SAFE CANDLESTICK DATA APPLICATION
   * This method implements enhanced safety measures to prevent ECharts disposal errors
   */
  private applyCandlestickDataSafely(widget: IWidget, dataset: IndexHistoricalData[]): void {
    // SAFETY CHECK 1: Component lifecycle validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Chart operations validation
    if (this.chartOperationsDisabled) {
      return;
    }

    // SAFETY CHECK 3: Widget validation
    if (!widget) {
      return;
    }

    // SAFETY CHECK 4: Dataset validation
    if (!dataset || dataset.length === 0) {
      return;
    }

    try {
      
      // Transform data safely
      const candlestickData = dataset.map(item => [
        Number(item.open) || 0,
        Number(item.close) || 0,
        Number(item.low) || 0,
        Number(item.high) || 0
      ]);

      const xAxisData = dataset.map(item => this.formatHistoricalDate(item.date));

      // Build chart options safely
      const updatedOptions = this.buildUpdatedCandlestickOptionsSafely(widget, candlestickData, xAxisData);

      // Update widget data
      widget.data = dataset;

      // Update widget config safely
      if (widget.config) {
        widget.config.options = updatedOptions;
      } else {
        widget.config = { options: updatedOptions };
      }

      // SAFETY: Update chart instance with enhanced error handling
      this.safelyUpdateChartInstance(widget, updatedOptions);

    } catch (error) {
      console.error('Error during safe candlestick data application:', error);
      
      // SAFETY: Don't disable chart operations on data application error
      // Just log the error and continue - this prevents cascading failures
    }
  }

  /**
   * 🛡️ SAFE CHART INSTANCE UPDATE
   * This method safely updates the ECharts instance with enhanced error handling
   */
  private safelyUpdateChartInstance(widget: IWidget, updatedOptions: any): void {
    // SAFETY CHECK 1: Chart instance validation
    if (!widget.chartInstance) {
      return;
    }

    // SAFETY CHECK 2: Chart instance method validation
    if (typeof widget.chartInstance.setOption !== 'function') {
      return;
    }

    // SAFETY CHECK 3: Component state validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    try {
      // Use conservative approach - don't merge options to prevent conflicts
      widget.chartInstance.setOption(updatedOptions, false, true);
      
      // SAFETY: Schedule resize with delay and additional safety checks
      setTimeout(() => {
        this.safelyResizeChartInstance(widget);
      }, 200); // Increased delay for stability
      
      // SAFETY: Trigger change detection only if component is still valid
      if (!this.isComponentDestroyed && !this.isNavigating) {
        this.cdr.detectChanges();
      }
      
    } catch (chartError) {
      console.warn('Chart instance update failed:', chartError);
      
      // SAFETY: Check for specific ECharts disposal errors
      if (chartError instanceof Error && chartError.message && chartError.message.includes('__ec_inner_')) {
        console.warn('ECharts disposal error detected - temporarily disabling chart operations');
        this.chartOperationsDisabled = true;
        
        // SAFETY: Schedule re-enabling chart operations after a delay
        setTimeout(() => {
          if (!this.isComponentDestroyed && !this.isNavigating) {
            this.chartOperationsDisabled = false;
          }
        }, 2000); // 2 second recovery delay
      }
    }
  }

  /**
   * 🛡️ SAFE CHART INSTANCE RESIZE
   * This method safely resizes the chart instance with enhanced error handling
   */
  private safelyResizeChartInstance(widget: IWidget): void {
    // SAFETY CHECK 1: Component state validation
    if (this.isComponentDestroyed || this.isNavigating) {
      return;
    }

    // SAFETY CHECK 2: Chart instance validation
    if (!widget.chartInstance || typeof widget.chartInstance.resize !== 'function') {
      return;
    }

    try {
      widget.chartInstance.resize();
    } catch (resizeError) {
      console.warn('Chart resize failed (non-critical):', resizeError);
      // Resize errors are non-critical - just log and continue
    }
  }


  private buildUpdatedCandlestickOptions(
    widget: IWidget,
    candlestickData: number[][],
    xAxisData: string[]
  ): any {
    // SAFETY: Use the new safe options building method
    return this.buildUpdatedCandlestickOptionsSafely(widget, candlestickData, xAxisData);
  }

  /**
   * 🛡️ SAFE CANDLESTICK OPTIONS BUILDING
   * This method safely builds ECharts options with enhanced error handling
   */
  private buildUpdatedCandlestickOptionsSafely(
    widget: IWidget,
    candlestickData: number[][],
    xAxisData: string[]
  ): any {
    
    try {
      // SAFETY: Get base options safely
      let baseOptions: any = {};
      
      try {
        baseOptions = (widget.chartInstance?.getOption?.() || widget.config?.options || {});
      } catch (error) {
        console.warn('⚠️ Could not get base options, using defaults:', error);
        baseOptions = {};
      }
      
      // SAFETY: Deep clone to prevent reference issues
      const options = JSON.parse(JSON.stringify(baseOptions));

      // SAFETY: Build x-axis formatter with error handling
      const xAxisFormatter = (value: string, index: number) => {
        try {
          if (value && typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              const totalPoints = xAxisData?.length || 0;
              const isZoomed = totalPoints < 30;
              
              if (isZoomed) {
                return date.toLocaleDateString('en-IN', { 
                  month: 'short', 
                  day: 'numeric',
                  year: '2-digit'
                });
              } else {
                return date.toLocaleDateString('en-IN', { 
                  month: 'short', 
                  year: 'numeric'
                });
              }
            }
          }
        } catch (e) {
          console.warn('Date formatting error:', e);
        }
        return value;
      };

      // SAFETY: Update x-axis with validation
      try {
        if (Array.isArray(options['xAxis'])) {
          options['xAxis'] = [{
            ...options['xAxis'][0],
            data: xAxisData,
            axisLabel: {
              ...options['xAxis'][0]?.axisLabel,
              fontSize: 14,
              formatter: xAxisFormatter,
              show: true
            }
          }];
        } else if (options['xAxis']) {
          options['xAxis'] = {
            ...options['xAxis'],
            data: xAxisData,
            axisLabel: {
              ...options['xAxis'].axisLabel,
              fontSize: 14,
              formatter: xAxisFormatter,
              show: true
            }
          };
        } else {
          options['xAxis'] = {
            type: 'category',
            data: xAxisData,
            axisLabel: {
              fontSize: 14,
              formatter: xAxisFormatter,
              show: true
            }
          };
        }
      } catch (error) {
        console.warn('X-axis configuration error:', error);
      }

      // SAFETY: Update Y-axis with validation
      try {
        if (Array.isArray(options['yAxis'])) {
          options['yAxis'] = options['yAxis'].map((axis: any) => ({
            ...axis,
            axisLabel: {
              ...axis.axisLabel,
              fontSize: 20
            }
          }));
        } else if (options['yAxis']) {
          options['yAxis'] = {
            ...options['yAxis'],
            axisLabel: {
              ...options['yAxis'].axisLabel,
              fontSize: 20
            }
          };
        }
      } catch (error) {
        console.warn('Y-axis configuration error:', error);
      }

      // SAFETY: Update series data with validation
      try {
        if (!Array.isArray(options['series'])) {
          options['series'] = [];
        }
        
        // Remove unwanted series safely
        options['series'] = options['series'].filter((s: any) => {
          if (s.type === 'line') return false;
          if (s.type === 'bar' && (s.name === 'Volume' || s.gridIndex === 1 || s.xAxisIndex === 1 || s.yAxisIndex === 1)) {
            return false;
          }
          return true;
        });
        
        // Find and update candlestick series
        let candlestickSeries = options['series'].find((s: any) => s.type === 'candlestick');
        if (!candlestickSeries) {
          candlestickSeries = {
            name: 'Price',
            type: 'candlestick',
            xAxisIndex: 0,
            yAxisIndex: 0,
            gridIndex: 0,
            data: candlestickData,
            itemStyle: {
              color: '#00da3c',
              color0: '#ec0000',
              borderColor: '#00da3c',
              borderColor0: '#ec0000'
            }
          };
          options['series'].push(candlestickSeries);
        } else {
          candlestickSeries.data = candlestickData;
          candlestickSeries.xAxisIndex = 0;
          candlestickSeries.yAxisIndex = 0;
          candlestickSeries.gridIndex = 0;
        }
      } catch (error) {
        console.warn('Series configuration error:', error);
      }

      return options;
      
    } catch (error) {
      console.error('Error building candlestick options:', error);
      
      // SAFETY: Return minimal safe options on error
      return {
        xAxis: {
          type: 'category',
          data: xAxisData || []
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: 'Price',
          type: 'candlestick',
          data: candlestickData || []
        }]
      };
    }
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
      
      // Sort data by tradingsymbol (index_name) in ascending order
      const sortedData = [...stockData].sort((a, b) => {
        const aSymbol = (a.tradingsymbol || a.symbol || '').toUpperCase();
        const bSymbol = (b.tradingsymbol || b.symbol || '').toUpperCase();
        return aSymbol.localeCompare(bSymbol);
      });

      // Calculate footer statistics
      const totalCount = sortedData.length;
      const positiveCount = sortedData.filter(item => (item.percentChange || 0) > 0).length;
      const negativeCount = sortedData.filter(item => (item.percentChange || 0) < 0).length;
      
      if (widget.data) {
        widget.data.stocks = sortedData;
        widget.data.isLoadingStocks = false;
        widget.data.selectedStockSymbol = this.selectedIndexSymbol;
        widget.data.footerStats = {
          totalCount: totalCount,
          positiveCount: positiveCount,
          negativeCount: negativeCount
        };
      } else {
        widget.data = {
          stocks: sortedData,
          isLoadingStocks: false,
          selectedStockSymbol: this.selectedIndexSymbol,
          footerStats: {
            totalCount: totalCount,
            positiveCount: positiveCount,
            negativeCount: negativeCount
          }
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
              next: (indicesData: IndexDataDto) => {
                this.handleWebSocketData(indicesData, indexName);
              },
              error: (error: any) => {
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
            this.cdr.detectChanges();
          },
          complete: () => {
            // WebSocket subscription completed
          }
        });
    } catch (error) {
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
        
        // Update real-time price signal for candlestick chart
        if (indexData.lastPrice) {
          const newPrice = indexData.lastPrice;
          const timestamp = indexData.tickTimestamp || indexData.ingestionTimestamp || new Date().toISOString();
          
          // Update the current last price signal
          this.currentLastPriceSignal.set(newPrice);
          
          // Add to real-time price data array (keep last 100 points for performance)
          this.realTimePriceData.push({
            timestamp: timestamp,
            price: newPrice
          });
          
          // Keep only the last 100 data points to prevent memory issues
          if (this.realTimePriceData.length > 100) {
            this.realTimePriceData = this.realTimePriceData.slice(-100);
          }
        }
        
        // Check if dashboard is ready before updating
        if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
          // Schedule the update for later
          setTimeout(() => {
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
            // Trigger change detection
            this.cdr.detectChanges();
          } finally {
            this.chartUpdateTimer = null;
          }
        }, 250);
      } else {
      }
    } catch (error: any) {
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
      // Schedule another reconnection attempt after a delay
      setTimeout(() => {
        this.attemptWebSocketReconnection();
      }, 5000); // 5 second delay before retry
    }
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
    this.isCandlestickLoadingSignal.set(true);
    
    // Make API call with date range (pass undefined for days to force date range usage)
    this.indicesService.getIndexHistoricalData(indexName, undefined, startDate, endDate).subscribe({
      next: (historicalData: IndexHistoricalData[]) => {
        this.historicalData = this.normalizeHistoricalData(historicalData || []);
        this.updateCandlestickChartWithHistoricalData();
        this.isCandlestickLoadingSignal.set(false);
        this.ensureWidgetTimeRangeFilters();
      },
      error: (error) => {
        this.isCandlestickLoadingSignal.set(false);
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



}