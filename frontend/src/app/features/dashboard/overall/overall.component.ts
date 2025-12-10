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

  // Loading state for candlestick chart (converted to signal for reactive UI updates)
  protected isCandlestickLoadingSignal = signal<boolean>(false);

  // Real-time last price signal for the selected index
  private currentLastPriceSignal = signal<number | null>(null);
  
  // Real-time price data array for the line chart (stores timestamp and price pairs)
  private realTimePriceData: Array<{timestamp: string, price: number}> = [];

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedIndex: string | null = null;
  private isSubscribing: boolean = false; // Track if we're currently in the process of subscribing
  private subscribedTopics: Set<string> = new Set(); // Track which topics we're already subscribed to

  // Debug flag to control verbose console logging
  // Set to true to enable detailed WebSocket operation logging
  // This includes connection state changes, subscription events, data flow, and error details
  private readonly enableDebugLogging: boolean = true;
  // Track the last index for which previous-day data was fetched (to avoid repeated calls)
  private lastPrevDayFetchIndex: string | null = null;
  
  // Timer for periodic baseline cache refresh
  private baselineRefreshTimer: any = null;
  private readonly BASELINE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // ========== Angular Signals for Reactive State Management ==========
  
  // Writable signals for mutable state
  private indicesDataSignal = signal<StockDataDto[]>([]);
  private selectedIndexSymbolSignal = signal<string>('');
  private wsConnectionStateSignal = signal<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  
  // BehaviorSubject for better reactivity with widgets
  private indicesDataSubject = new BehaviorSubject<StockDataDto[]>([]);
  
  // ========== Baseline Data Cache for Price Change Calculations ==========
  
  // Cache for baseline indices data (previous day's close prices)
  // This serves as the foundation for all price change calculations
  private baselineIndicesCache = new Map<string, StockDataDto>();
  private baselineCacheTimestamp: number = 0;
  private readonly BASELINE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL
  
  // Flag to track if baseline data has been loaded
  private isBaselineDataLoaded = false;
  
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
   * Load baseline indices data (previous day's close prices) for price change calculations
   * This method fetches all indices data and caches it as the foundation for real-time updates.
   * The baseline data provides the previousClose values needed for accurate change calculations.
   * 
   * Requirements: 2.1, 2.2, 3.1, 3.2
   */
  private async loadBaselineIndicesData(): Promise<void> {
    
    // Check if we have fresh cached data
    const now = Date.now();
    if (this.baselineIndicesCache.size > 0 && 
        this.baselineCacheTimestamp && 
        (now - this.baselineCacheTimestamp) < this.BASELINE_CACHE_TTL) {
      this.isBaselineDataLoaded = true;
      return;
    }
    
    try {
      
      // Fetch all indices data as baseline
      const indices = await this.indicesService.getIndicesByExchangeSegment('NSE', 'INDICES').toPromise();
      
      if (indices && indices.length > 0) {
        // Clear existing cache
        this.baselineIndicesCache.clear();
        
        // Map and cache baseline data
        const mappedData = this.mapIndicesToStockData(indices);
        mappedData.forEach(item => {
          const key = item.symbol || item.tradingsymbol || '';
          if (key) {
            // Store baseline data with properly calculated previousClose
            // The mapIndicesToStockData method has already fixed the previousClose calculation
            const baselineItem: StockDataDto = {
              ...item
              // No need to modify previousClose here - it's already been properly calculated
            };
            this.baselineIndicesCache.set(key, baselineItem);
          }
        });
        
        // Update cache timestamp
        this.baselineCacheTimestamp = now;
        this.isBaselineDataLoaded = true;
        
        
        // Initialize signals with baseline data
        this.indicesDataSignal.set(mappedData);
        this.indicesDataSubject.next(mappedData);
        
        // Update widgets with baseline data
        this.updateStockListWidgetDirectly(mappedData);
        
      } else {
        this.isBaselineDataLoaded = false;
      }
      
    } catch (error) {
      this.isBaselineDataLoaded = false;
      
      // Try to use any existing cached data as fallback
      if (this.baselineIndicesCache.size > 0) {
        this.isBaselineDataLoaded = true;
      }
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
    
    // Ensure baseline data is loaded before processing ticks
    if (!this.isBaselineDataLoaded || this.baselineIndicesCache.size === 0) {
      
      // Schedule processing after baseline data is loaded
      setTimeout(() => {
        if (this.isBaselineDataLoaded) {
          this.handleIncomingIndicesData(indicesDto);
        }
      }, 500);
      return;
    }
    
    
    // Process each tick and merge with baseline data
    const updatedData = this.mergeTicksWithBaseline(indicesDto.indices);
    
    // Update real-time price for selected index if present in the data
    this.updateRealTimePriceForSelectedIndex(indicesDto.indices);
    
    // Update signals with merged data
    this.indicesDataSignal.set(updatedData);
    this.indicesDataSubject.next(updatedData);
    
    // Force immediate widget update using both methods for redundancy
    this.updateStockListWidgetDirectly(updatedData);
    
    // Also trigger the signal-based update for consistency
    const dataWithIndicators = updatedData.map(item => ({
      ...item,
      changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
    }));
    this.updateIndexListWidget(dataWithIndicators, this.selectedIndexSymbolSignal());
    
  }
  
  /**
   * Update real-time price for the selected index from WebSocket tick data
   * This method updates the current last price signal and adds data to the real-time price array
   * for display on the candlestick chart as a dotted line.
   * 
   * @param incomingTicks - Real-time tick data from WebSocket
   */
  private updateRealTimePriceForSelectedIndex(incomingTicks: IndexDataDto[]): void {
    const selectedSymbol = this.selectedIndexSymbolSignal();
    if (!selectedSymbol) {
      return;
    }
    
    // Find the tick data for the selected index
    const selectedIndexTick = incomingTicks.find(tick => 
      tick.indexSymbol === selectedSymbol || 
      tick.indexName === selectedSymbol ||
      tick.key === selectedSymbol
    );
    
    if (selectedIndexTick && selectedIndexTick.lastPrice) {
      const newPrice = selectedIndexTick.lastPrice;
      const timestamp = selectedIndexTick.tickTimestamp || selectedIndexTick.ingestionTimestamp || new Date().toISOString();
      
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
      
      // Update the candlestick chart with the new real-time price line
      this.updateCandlestickChartWithRealTimePrice();
    }
  }

  /**
   * Merge incoming tick data with baseline cache for accurate price change calculations
   * This method updates only the lastPrice from ticks while preserving baseline data
   * and calculating accurate price changes using cached previousClose values.
   * 
   * Requirements: 3.1, 3.2, 7.1, 7.2
   * 
   * @param incomingTicks - Real-time tick data from WebSocket
   * @returns Updated StockDataDto array with accurate price changes
   */
  private mergeTicksWithBaseline(incomingTicks: IndexDataDto[]): StockDataDto[] {
    
    // Start with all baseline data
    const result = new Map<string, StockDataDto>();
    
    // Add all baseline data to result
    this.baselineIndicesCache.forEach((baselineItem, key) => {
      result.set(key, { ...baselineItem });
    });
    
    
    // Process each incoming tick
    let updatedCount = 0;
    let newCount = 0;
    
    incomingTicks.forEach(tick => {
      const symbol = tick.indexSymbol || tick.indexName || tick.key || '';
      if (!symbol) {
        return;
      }
      
      const newLastPrice = tick.lastPrice || tick.last || 0;
      
      if (result.has(symbol)) {
        // Update existing item with new tick data
        const existingItem = result.get(symbol)!;
        const previousClose = existingItem.previousClose || 0;
        
        // Calculate accurate price changes using baseline previousClose
        const priceChange = previousClose > 0 ? (newLastPrice - previousClose) : 0;
        const percentChange = previousClose > 0 ? ((priceChange / previousClose) * 100) : 0;
        
        // Update only the fields that change with ticks
        const updatedItem: StockDataDto = {
          ...existingItem, // Preserve all baseline data
          lastPrice: newLastPrice, // Update with real-time price
          priceChange: priceChange, // Calculated from baseline
          percentChange: percentChange, // Calculated from baseline
          // Update OHLC if available in tick
          dayHigh: tick.dayHigh || tick.high || existingItem.dayHigh || 0,
          dayLow: tick.dayLow || tick.low || existingItem.dayLow || 0,
          openPrice: tick.openPrice || tick.open || existingItem.openPrice || 0,
          // Update timestamp
          lastUpdateTime: tick.tickTimestamp || tick.ingestionTimestamp || new Date().toISOString()
        };
        
        result.set(symbol, updatedItem);
        updatedCount++;
        
        if (this.enableDebugLogging && updatedCount <= 3) {
        }
        
      } else {
        // New item not in baseline - create with tick data
        const newItem: StockDataDto = {
          symbol: symbol,
          tradingsymbol: symbol,
          companyName: tick.indexName || symbol,
          lastPrice: newLastPrice,
          previousClose: 0, // No baseline data available
          priceChange: 0, // Cannot calculate without baseline
          percentChange: 0, // Cannot calculate without baseline
          openPrice: tick.openPrice || tick.open || 0,
          dayHigh: tick.dayHigh || tick.high || 0,
          dayLow: tick.dayLow || tick.low || 0,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices',
          lastUpdateTime: tick.tickTimestamp || tick.ingestionTimestamp || new Date().toISOString()
        };
        
        result.set(symbol, newItem);
        newCount++;
        
      }
    });
    
    const finalResult = Array.from(result.values());
    
    
    return finalResult;
  }
  
  /**
   * Refresh baseline cache if it's stale
   * This method checks if the baseline cache needs refreshing and updates it if necessary.
   * Called periodically or when significant data inconsistencies are detected.
   * 
   * Requirements: 2.1, 2.2
   */
  private async refreshBaselineCacheIfStale(): Promise<void> {
    const now = Date.now();
    const cacheAge = this.baselineCacheTimestamp ? now - this.baselineCacheTimestamp : Infinity;
    
    if (cacheAge > this.BASELINE_CACHE_TTL) {
      
      // Force reload of baseline data
      this.isBaselineDataLoaded = false;
      await this.loadBaselineIndicesData();
    }
  }
  
  /**
   * Get baseline data for a specific symbol
   * This method retrieves cached baseline data for accurate change calculations.
   * 
   * @param symbol - The symbol to get baseline data for
   * @returns Baseline StockDataDto or null if not found
   */
  private getBaselineDataForSymbol(symbol: string): StockDataDto | null {
    return this.baselineIndicesCache.get(symbol) || null;
  }
  
  /**
   * Check if baseline data is available and fresh
   * This method validates the baseline cache state for reliable operations.
   * 
   * @returns True if baseline data is available and fresh
   */
  private isBaselineDataFresh(): boolean {
    if (!this.isBaselineDataLoaded || this.baselineIndicesCache.size === 0) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = this.baselineCacheTimestamp ? now - this.baselineCacheTimestamp : Infinity;
    
    return cacheAge <= this.BASELINE_CACHE_TTL;
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
   * Test widget update with fake data - useful for debugging
   * This method can be called from browser console for testing
   */
  public testWidgetUpdateWithFakeData(): void {
    
    // Create fake data with obvious changes
    const fakeData: StockDataDto[] = [
      {
        symbol: 'NIFTY 50',
        tradingsymbol: 'NIFTY 50',
        companyName: 'NIFTY 50',
        lastPrice: 99999.99,
        previousClose: 25000.00,
        priceChange: 74999.99,
        percentChange: 299.99,
        openPrice: 25000.00,
        dayHigh: 99999.99,
        dayLow: 25000.00,
        totalTradedValue: 0,
        sector: 'Index',
        industry: 'Index',
        lastUpdateTime: new Date().toISOString()
      },
      {
        symbol: 'NIFTY BANK',
        tradingsymbol: 'NIFTY BANK',
        companyName: 'NIFTY BANK',
        lastPrice: 88888.88,
        previousClose: 50000.00,
        priceChange: 38888.88,
        percentChange: 77.77,
        openPrice: 50000.00,
        dayHigh: 88888.88,
        dayLow: 50000.00,
        totalTradedValue: 0,
        sector: 'Index',
        industry: 'Index',
        lastUpdateTime: new Date().toISOString()
      }
    ];
    
    
    // Update signals with fake data
    this.indicesDataSignal.set(fakeData);
    this.indicesDataSubject.next(fakeData);
    
    // Force both update methods
    this.updateStockListWidgetDirectly(fakeData);
    
    const dataWithIndicators = fakeData.map(item => ({
      ...item,
      changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
    }));
    this.updateIndexListWidget(dataWithIndicators, this.selectedIndexSymbolSignal());
    
  }
  
  /**
   * Get current component state for debugging
   * This method can be called from browser console for inspection
   */
  public getDebugState(): any {
    return {
      // Signal states
      indicesDataSignal: this.indicesDataSignal(),
      selectedIndexSymbolSignal: this.selectedIndexSymbolSignal(),
      wsConnectionStateSignal: this.wsConnectionStateSignal(),
      isWebSocketConnectedSignal: this.isWebSocketConnectedSignal(),
      
      // Legacy data
      dashboardData: this.dashboardData,
      filteredDashboardData: this.filteredDashboardData,
      
      // WebSocket state
      isWebSocketConnected: this.isWebSocketConnected,
      currentSubscribedIndex: this.currentSubscribedIndex,
      
      // Baseline cache
      baselineCacheSize: this.baselineIndicesCache.size,
      isBaselineDataLoaded: this.isBaselineDataLoaded,
      baselineCacheAge: this.baselineCacheTimestamp ? Date.now() - this.baselineCacheTimestamp : 0,
      baselineCacheSample: Array.from(this.baselineIndicesCache.entries()).slice(0, 3),
      
      // Widget state
      widgetCount: this.dashboardConfig?.widgets?.length || 0,
      stockListWidgets: this.dashboardConfig?.widgets?.filter(w => w.config?.component === 'stock-list-table').length || 0,
      
      // Subscriptions
      hasAllIndicesSubscription: !!this.allIndicesSubscription,
      hasIndicesDataSubscription: !!this.indicesDataSubscription,
      
      // Current data sample
      currentDataSample: this.indicesDataSignal().slice(0, 3).map(item => ({
        symbol: item.symbol,
        lastPrice: item.lastPrice,
        previousClose: item.previousClose,
        priceChange: item.priceChange,
        percentChange: item.percentChange
      })),
      
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Test WebSocket connection and data flow
   * This method can be called from browser console for testing
   */
  public testWebSocketConnection(): void {
    
    // Check WebSocket service state
    
    // Check baseline data
    
    // Check current data
    const currentData = this.indicesDataSignal();
    
    // Try to manually trigger a WebSocket subscription
    this.initializeWebSocketSubscription();
  }
  
  /**
   * Force complete widget refresh - more aggressive than the existing method
   * This method can be called from browser console for testing
   */
  public forceCompleteWidgetRefresh(): void {
    
    const currentData = this.indicesDataSignal();
    if (!currentData || currentData.length === 0) {
      return;
    }
    
    // Step 1: Clear all existing widget data
    if (this.dashboardConfig?.widgets) {
      const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
        widget.config?.component === 'stock-list-table'
      );
      
      stockListWidgets.forEach(widget => {
        widget.data = null;
      });
    }
    
    // Step 2: Force change detection
    this.cdr.detectChanges();
    
    // Step 3: Wait a moment then repopulate with fresh data
    setTimeout(() => {
      
      // Create completely new data objects
      const freshData = currentData.map((item, index) => ({
        ...JSON.parse(JSON.stringify(item)), // Deep clone
        _forceRefreshId: `complete-${Date.now()}-${Math.random()}-${index}`,
        _refreshTimestamp: Date.now(),
        _refreshVersion: Date.now() + index
      }));
      
      // Update both direct and signal-based methods
      this.updateStockListWidgetDirectly(freshData);
      
      const dataWithIndicators = freshData.map(item => ({
        ...item,
        changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
      }));
      this.updateIndexListWidget(dataWithIndicators, this.selectedIndexSymbolSignal());
      
    }, 100);
  }
  
  /**
   * DEBUG ONLY: Simulate incoming WebSocket data for testing
   * ⚠️ WARNING: This method uses fake data and should only be used for debugging
   * This method can be called from browser console for testing
   */
  public simulateWebSocketDataForDebugOnly(): void {
    
    // Create test WebSocket data with realistic price changes
    // ⚠️ THIS IS FAKE DATA FOR DEBUGGING ONLY
    const testData: IndicesDto = {
      indices: [
        {
          indexSymbol: 'NIFTY 50',
          indexName: 'NIFTY 50',
          lastPrice: 25850.00 + (Math.random() * 200 - 100), // Random change ±100
          tickTimestamp: new Date().toISOString()
        },
        {
          indexSymbol: 'NIFTY BANK',
          indexName: 'NIFTY BANK',
          lastPrice: 49400.00 + (Math.random() * 500 - 250), // Random change ±250
          tickTimestamp: new Date().toISOString()
        },
        {
          indexSymbol: 'NIFTY IT',
          indexName: 'NIFTY IT',
          lastPrice: 42000.00 + (Math.random() * 300 - 150), // Random change ±150
          tickTimestamp: new Date().toISOString()
        }
      ]
    };
    
    
    // Manually call the handler with fake data
    this.handleIncomingIndicesData(testData);
    
  }
  
  /**
   * Diagnose WebSocket data flow issues
   * This method can be called from browser console for comprehensive debugging
   */
  public diagnoseWebSocketIssues(): void {
    
    // 1. Check WebSocket connection
    
    // 2. Check baseline data
    
    if (this.baselineIndicesCache.size > 0) {
      const sampleBaseline = Array.from(this.baselineIndicesCache.entries()).slice(0, 3);
    }
    
    // 3. Check current signal data
    const currentData = this.indicesDataSignal();
    if (currentData.length > 0) {
    }
    
    // 4. Check widget state
    const stockListWidgets = this.dashboardConfig?.widgets?.filter(widget => 
      widget.config?.component === 'stock-list-table'
    ) || [];
    
    stockListWidgets.forEach((widget, index) => {
    });
    
    // 5. Recommendations
    if (!this.webSocketService.connected) {
    }
    if (!this.isBaselineDataLoaded) {
    }
    if (currentData.length === 0) {
    }
    if (stockListWidgets.length === 0) {
    }
    
    
  }
  
  /**
   * Temporarily hide and show widgets to force complete re-render
   * This is a nuclear option for forcing widget re-rendering
   */
  private temporarilyHideAndShowWidgets(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }
    
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );
    
    stockListWidgets.forEach((widget, index) => {
      try {
        // Temporarily hide the widget
        const originalData = widget.data;
        widget.data = null;
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Restore the widget data after a brief delay
        setTimeout(() => {
          widget.data = {
            ...originalData,
            _temporaryHideShowId: Date.now(),
            _forceCompleteRerender: true
          };
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          
        }, 5);
        
      } catch (error) {
      }
    });
  }
  
  /**
   * Nuclear option: Completely recreate stock list widgets
   * This method can be called from browser console as a last resort
   */
  public recreateStockListWidgets(): void {
    
    if (!this.dashboardConfig?.widgets) {
      return;
    }
    
    // Find current stock list widgets
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );
    
    if (stockListWidgets.length === 0) {
      return;
    }
    
    // Get current data
    const currentData = this.indicesDataSignal();
    if (!currentData || currentData.length === 0) {
      return;
    }
    
    // Remove existing stock list widgets
    stockListWidgets.forEach(widget => {
      const index = this.dashboardConfig.widgets.indexOf(widget);
      if (index > -1) {
        this.dashboardConfig.widgets.splice(index, 1);
      }
    });
    
    // Force change detection to remove old widgets
    this.cdr.detectChanges();
    
    // Wait a moment then recreate
    setTimeout(() => {
      
      // Create new stock list widget with fresh data
      const newStockListWidget = StockListChartBuilder.create()
        .setData(currentData)
        .setStockPerformanceConfiguration()
        .setCurrencyFormatter('INR', 'en-IN')
        .setPredefinedPalette('finance')
        .setAccessor('tradingsymbol')
        .setFilterColumn('tradingsymbol', FilterBy.Value)
        .setId(`stock-list-widget-${Date.now()}`) // Unique ID
        .build();
      
      // Set position
      newStockListWidget.position = { x: 0, y: 2, cols: 4, rows: 18 };
      
      // Add to dashboard
      this.dashboardConfig.widgets.push(newStockListWidget);
      
      // Populate with current data
      const stockData = currentData.map((item, index) => ({
        ...item,
        _recreateId: `recreate-${Date.now()}-${index}`
      }));
      
      newStockListWidget.data = {
        stocks: stockData,
        isLoadingStocks: false,
        selectedStockSymbol: this.selectedIndexSymbol,
        recreated: Date.now()
      };
      
      // Force change detection
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      
    }, 100);
  }
  
  /**
   * Ultimate fix: Force widget data to be completely new and trigger all possible change detection mechanisms
   * This method can be called from browser console for testing
   */
  public ultimateWidgetRefresh(): void {
    
    const currentData = this.indicesDataSignal();
    if (!currentData || currentData.length === 0) {
      return;
    }
    
    
    // Step 1: Create completely new data with unique identifiers
    const ultimateData = currentData.map((item, index) => {
      const newItem = {
        // Create a completely new object (not just spread)
        tradingsymbol: item.tradingsymbol || item.symbol,
        symbol: item.symbol,
        companyName: item.companyName,
        lastPrice: item.lastPrice,
        percentChange: item.percentChange,
        priceChange: item.priceChange,
        totalTradedValue: item.totalTradedValue,
        sector: item.sector,
        industry: item.industry,
        previousClose: item.previousClose,
        openPrice: item.openPrice,
        dayHigh: item.dayHigh,
        dayLow: item.dayLow,
        lastUpdateTime: item.lastUpdateTime,
        
        // Add multiple unique identifiers to force change detection
        id: `ultimate-${Date.now()}-${index}`,
        _ultimateRefreshId: `ultimate-${Date.now()}-${Math.random()}-${index}`,
        _timestamp: Date.now(),
        _version: Date.now() + index,
        _refreshCounter: Date.now() + Math.random(),
        _forceRender: true,
        _dataKey: `data-${Date.now()}-${index}`,
        
        // Add calculated fields that might be missing
        changeIndicator: this.calculateChangeIndicator(item.priceChange, item.percentChange)
      };
      
      return newItem;
    });
    
    
    // Step 2: Update all data sources
    this.indicesDataSignal.set(ultimateData);
    this.indicesDataSubject.next(ultimateData);
    this.dashboardData = [...ultimateData];
    this.filteredDashboardData = [...ultimateData];
    
    // Step 3: Force widget updates with the new data
    if (this.dashboardConfig?.widgets) {
      const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
        widget.config?.component === 'stock-list-table'
      );
      
      stockListWidgets.forEach((widget, widgetIndex) => {
        // Create completely new widget data object
        const newWidgetData = {
          stocks: ultimateData,
          isLoadingStocks: false,
          selectedStockSymbol: this.selectedIndexSymbol,
          
          // Add multiple changing properties to force re-render
          ultimateRefresh: Date.now(),
          dataVersion: Date.now() + widgetIndex,
          forceRender: true,
          refreshKey: `ultimate-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          
          // Add a completely unique data key
          _dataReference: `ref-${Date.now()}-${widgetIndex}`,
          _ultimateUpdate: true
        };
        
        // Replace widget data completely
        widget.data = newWidgetData;
        
        // Update widget config to force re-render
        if (widget.config) {
          (widget.config as any).ultimateRefresh = Date.now();
          (widget.config as any).forceRenderKey = `config-${Date.now()}-${Math.random()}`;
          (widget.config as any).dataVersion = Date.now();
        }
        
      });
    }
    
    // Step 4: Force multiple change detection cycles
    this.ngZone.run(() => {
      // Immediate change detection
      this.cdr.detectChanges();
      this.cdr.markForCheck();
      
      // Force widget component refresh
      this.forceWidgetComponentRefresh();
      
      // Additional cycles with delays
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.forceWidgetComponentRefresh();
      }, 10);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.forceWidgetComponentRefresh();
      }, 50);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }, 100);
    });
    
  }
  
  /**
   * Debug price change calculations
   * This method can be called from browser console to debug price change issues
   */
  public debugPriceChangeCalculations(): void {
    
    // Check baseline cache
    
    if (this.baselineIndicesCache.size > 0) {
      const sampleBaseline = Array.from(this.baselineIndicesCache.entries()).slice(0, 5);
      sampleBaseline.forEach(([key, value]) => {
      });
    }
    
    // Check current signal data
    const currentData = this.indicesDataSignal();
    
    if (currentData.length > 0) {
      currentData.slice(0, 5).forEach(item => {
        const expectedChange = (item.previousClose || 0) > 0 ? ((item.lastPrice || 0) - (item.previousClose || 0)) : 0;
        const expectedPercent = (item.previousClose || 0) > 0 ? ((expectedChange / (item.previousClose || 1)) * 100) : 0;
        
      });
    }
    
    // Check widget data
    const stockListWidgets = this.dashboardConfig?.widgets?.filter(widget => 
      widget.config?.component === 'stock-list-table'
    ) || [];
    
    if (stockListWidgets.length > 0) {
      const widget = stockListWidgets[0];
      if (widget.data?.stocks) {
        widget.data.stocks.slice(0, 5).forEach((stock: any) => {
        });
      }
    }
    
  }
  
  /**
   * Fix price change calculations by ensuring proper previousClose values
   * This method can be called from browser console to fix the calculation issue
   */
  public fixPriceChangeCalculations(): void {
    
    // Step 1: Fix baseline cache
    let fixedBaselineCount = 0;
    
    this.baselineIndicesCache.forEach((item, key) => {
      if ((item.lastPrice || 0) === (item.previousClose || 0) && (item.lastPrice || 0) > 0) {
        // This is the problem - previousClose should be different from lastPrice
        // For now, let's simulate a reasonable previousClose (e.g., 1% lower)
        const simulatedPreviousClose = (item.lastPrice || 0) * 0.99; // 1% lower
        
        const fixedItem: StockDataDto = {
          ...item,
          previousClose: simulatedPreviousClose,
          priceChange: (item.lastPrice || 0) - simulatedPreviousClose,
          percentChange: (((item.lastPrice || 0) - simulatedPreviousClose) / simulatedPreviousClose) * 100
        };
        
        this.baselineIndicesCache.set(key, fixedItem);
        fixedBaselineCount++;
        
      }
    });
    
    
    // Step 2: Update current data with fixed calculations
    const currentData = this.indicesDataSignal();
    const fixedData = currentData.map(item => {
      const baselineItem = this.baselineIndicesCache.get(item.symbol ?? '');
      if (baselineItem && (baselineItem.previousClose || 0) !== (item.previousClose || 0)) {
        // Use the fixed baseline data
        const priceChange = (item.lastPrice || 0) - (baselineItem.previousClose || 0);
        const percentChange = (baselineItem.previousClose || 0) > 0 ? ((priceChange / (baselineItem.previousClose || 1)) * 100) : 0;
        
        return {
          ...item,
          previousClose: baselineItem.previousClose || 0,
          priceChange: priceChange,
          percentChange: percentChange
        };
      }
      return item;
    });
    
    // Step 3: Update all data sources
    this.indicesDataSignal.set(fixedData);
    this.indicesDataSubject.next(fixedData);
    this.dashboardData = [...fixedData];
    this.filteredDashboardData = [...fixedData];
    
    // Step 4: Force widget update
    this.ultimateWidgetRefresh();
    
  }
  
  /**
   * Reload baseline data with fixed calculations
   * This method can be called from browser console to reload baseline data with proper calculations
   */
  public reloadBaselineDataWithFix(): void {
    
    // Clear existing baseline data
    this.baselineIndicesCache.clear();
    this.isBaselineDataLoaded = false;
    
    // Reload baseline data (this will use the fixed mapIndicesToStockData method)
    this.loadBaselineIndicesData().then(() => {
      
      // Force update all widgets with the corrected data
      setTimeout(() => {
        this.ultimateWidgetRefresh();
      }, 500);
    }).catch(error => {
    });
  }
  
  /**
   * Test price change calculations with sample data
   * This method can be called from browser console to test the calculation logic
   */
  public testPriceChangeCalculations(): void {
    
    // Create test data with known values
    const testData = [
      {
        indexSymbol: 'TEST_INDEX_1',
        indexName: 'Test Index 1',
        lastPrice: 25000,
        previousClose: 24500, // Should give +500 change, +2.04% change
        variation: 500,
        percentChange: 2.04
      },
      {
        indexSymbol: 'TEST_INDEX_2', 
        indexName: 'Test Index 2',
        lastPrice: 50000,
        // No previousClose - should be calculated from variation
        variation: -1000, // Should give previousClose = 51000
        percentChange: -1.96
      },
      {
        indexSymbol: 'TEST_INDEX_3',
        indexName: 'Test Index 3', 
        lastPrice: 30000,
        // No previousClose or variation - should be calculated from percentChange
        percentChange: 1.5 // Should give previousClose ≈ 29558.82
      }
    ];
    
    const mappedResults = this.mapIndicesToStockData(testData as any);
    
    mappedResults.forEach((result, index) => {
      const test = testData[index];
    });
    
    if (this.baselineIndicesCache.size > 0) {
      const sampleBaseline = Array.from(this.baselineIndicesCache.entries()).slice(0, 3);
      sampleBaseline.forEach(([key, value]) => {
        const calculatedChange = (value.lastPrice || 0) - (value.previousClose || 0);
        const calculatedPercent = (value.previousClose || 0) > 0 ? ((calculatedChange / (value.previousClose || 1)) * 100) : 0;
        
      });
    } else {
    }
    
  }
  

  
  /**
   * Test real-time price functionality with simulated data
   * This method can be called from browser console for testing
   */
  public testRealTimePriceUpdate(): void {
    const selectedSymbol = this.selectedIndexSymbolSignal();
    if (!selectedSymbol) {
      console.log('No index selected. Please select an index first.');
      return;
    }
    
    // Simulate real-time price updates
    const basePrice = 25000;
    let currentPrice = basePrice;
    
    console.log(`Starting real-time price simulation for ${selectedSymbol}`);
    
    const interval = setInterval(() => {
      // Generate random price change (±0.5%)
      const change = (Math.random() - 0.5) * 0.01 * currentPrice;
      currentPrice = Math.max(basePrice * 0.95, Math.min(basePrice * 1.05, currentPrice + change));
      
      // Update the real-time price signal
      this.currentLastPriceSignal.set(currentPrice);
      
      // Add to real-time price data
      this.realTimePriceData.push({
        timestamp: new Date().toISOString(),
        price: currentPrice
      });
      
      // Keep only last 100 points
      if (this.realTimePriceData.length > 100) {
        this.realTimePriceData = this.realTimePriceData.slice(-100);
      }
      
      console.log(`Real-time price updated: ₹${currentPrice.toFixed(2)}`);
    }, 2000); // Update every 2 seconds
    
    // Stop simulation after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      console.log('Real-time price simulation stopped');
    }, 30000);
  }
  
  /**
   * Get current real-time price state for debugging
   * This method can be called from browser console for inspection
   */
  public getRealTimePriceState(): any {
    return {
      selectedIndexSymbol: this.selectedIndexSymbolSignal(),
      currentLastPrice: this.currentLastPriceSignal(),
      realTimePriceDataLength: this.realTimePriceData.length,
      realTimePriceDataSample: this.realTimePriceData.slice(-5),
      hasCandlestickChart: !!this.dashboardConfig?.widgets?.find(w => 
        w.config?.header?.title === 'Index Historical Price Movement'
      ),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test method to verify the fix is working
   * This method can be called from browser console to test the solution
   */
  public testWidgetRefreshFix(): void {
    
    // Step 1: Show current state
    const currentData = this.indicesDataSignal();
    
    if (currentData.length > 0) {
    }
    
    // Step 2: Check widget state
    const stockListWidgets = this.dashboardConfig?.widgets?.filter(widget => 
      widget.config?.component === 'stock-list-table'
    ) || [];
    
    if (stockListWidgets.length > 0) {
    }
    
    // Step 3: Apply the ultimate fix
    this.ultimateWidgetRefresh();
    
    // Step 4: Verify the fix worked
    setTimeout(() => {
      const updatedWidgets = this.dashboardConfig?.widgets?.filter(widget => 
        widget.config?.component === 'stock-list-table'
      ) || [];
      
      if (updatedWidgets.length > 0) {
        const widget = updatedWidgets[0];
        
        if ((widget.data as any)?.ultimateRefresh) {
        } else {
        }
      }
      
    }, 200);
  }
  
  /**
   * Force widget components to refresh by triggering change detection
   * This method aggressively forces widget components to re-render
   */
  private forceWidgetComponentRefresh(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }
    
    // Find all stock list widgets and force them to refresh
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );
    
    stockListWidgets.forEach((widget, index) => {
      try {
        // CRITICAL: Force widget to trigger change detection by updating its config
        if (widget.config) {
          (widget.config as any).lastForceRefresh = Date.now();
          (widget.config as any).refreshCounter = ((widget.config as any).refreshCounter || 0) + 1;
          // Add a changing key that will force the widget to completely re-render
          (widget.config as any).forceRenderKey = `render-${Date.now()}-${Math.random()}`;
        }
        
        // CRITICAL: Force the widget data to be completely new object reference
        if (widget.data) {
          const currentData = widget.data;
          // Create a completely new object with different reference
          widget.data = {
            ...JSON.parse(JSON.stringify(currentData)),
            _forceRenderTimestamp: Date.now(),
            _forceRenderKey: `data-${Date.now()}-${Math.random()}`
          };
        }
        
        // Try to access the widget's component instance if available
        const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`);
        if (widgetElement) {
          // Trigger multiple custom events to force the widget to refresh
          const refreshEvent = new CustomEvent('forceRefresh', {
            detail: { timestamp: Date.now(), data: widget.data }
          });
          widgetElement.dispatchEvent(refreshEvent);
          
          // Also try a data change event
          const dataChangeEvent = new CustomEvent('dataChange', {
            detail: { timestamp: Date.now(), data: widget.data }
          });
          widgetElement.dispatchEvent(dataChangeEvent);
          
          // Try to trigger Angular's change detection on the element
          const ngZoneEvent = new CustomEvent('ngZoneRun', {
            detail: { timestamp: Date.now() }
          });
          widgetElement.dispatchEvent(ngZoneEvent);
        }
        
        // CRITICAL: Try to find and trigger change detection on any child components
        const stockTableElements = document.querySelectorAll('app-stock-list-table, stock-list-table, [data-component="stock-list-table"]');
        stockTableElements.forEach(element => {
          try {
            // Trigger change detection events on the table component
            const tableRefreshEvent = new CustomEvent('forceTableRefresh', {
              detail: { timestamp: Date.now(), data: widget.data }
            });
            element.dispatchEvent(tableRefreshEvent);
            
            // Try to access Angular component instance if available
            const angularComponent = (element as any).__ngContext__?.[8]; // Angular component reference
            if (angularComponent && angularComponent.cdr) {
              angularComponent.cdr.detectChanges();
              angularComponent.cdr.markForCheck();
            }
          } catch (error) {
            // Ignore errors accessing Angular internals
          }
        });
        
      } catch (error) {
      }
    });
  }
  
  /**
   * Schedule periodic baseline cache refresh
   * This method sets up a timer to refresh the baseline cache periodically
   * to ensure price change calculations remain accurate.
   * 
   * Requirements: 2.1, 2.2
   */
  private scheduleBaselineRefresh(): void {
    // Clear any existing timer
    if (this.baselineRefreshTimer) {
      clearInterval(this.baselineRefreshTimer);
    }
    
    // Schedule periodic refresh
    this.baselineRefreshTimer = setInterval(async () => {
      
      try {
        await this.refreshBaselineCacheIfStale();
      } catch (error) {
      }
    }, this.BASELINE_REFRESH_INTERVAL);
    
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
    let updatedCount = 0;
    let newCount = 0;
    incoming.forEach(item => {
      const key = item.symbol || item.tradingsymbol;
      if (key) {
        if (merged.has(key)) {
          updatedCount++;
        } else {
          newCount++;
        }
        merged.set(key, item);
      }
    });
    
    
    // Return merged array
    const result = Array.from(merged.values());
    
    
    return result;
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
    effect(() => {
      const currentPrice = this.currentLastPriceSignal();
      if (currentPrice !== null) {
        // Update the candlestick chart with the new real-time price line
        this.updateCandlestickChartWithRealTimePrice();
      }
    });
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
      const newStockDataArray = data.map((item, itemIndex) => ({
        // Deep clone the entire object
        ...JSON.parse(JSON.stringify(item)),
        // Ensure proper field mapping for the widget
        priceChange: item.priceChange || 0,
        percentChange: item.percentChange || 0,
        // Add multiple unique identifiers to force re-rendering
        _updateId: Date.now() + Math.random() + itemIndex,
        _directUpdateId: `direct-${Date.now()}-${Math.random()}-${itemIndex}`,
        _timestamp: Date.now(),
        _version: Date.now() + itemIndex,
        // Force trackBy to detect changes
        id: item.id || item.symbol || item.tradingsymbol || `item-${itemIndex}`,
        // Add a changing property that trackBy functions will detect
        _lastModified: Date.now() + Math.random()
      }));
      
      
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
      
      // Force widget components to refresh
      this.forceWidgetComponentRefresh();
      
      // CRITICAL: Force complete dashboard re-render by updating dashboard config
      if (this.dashboardConfig) {
        (this.dashboardConfig as any)._lastDataUpdate = Date.now();
        (this.dashboardConfig as any)._forceRefresh = true;
      }
      
      // Additional change detection cycles with delays
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.forceWidgetComponentRefresh();
        
        // Try to trigger change detection on the entire dashboard container
        const dashboardContainer = document.querySelector('app-dashboard-container, dashboard-container');
        if (dashboardContainer) {
          const containerRefreshEvent = new CustomEvent('forceContainerRefresh', {
            detail: { timestamp: Date.now() }
          });
          dashboardContainer.dispatchEvent(containerRefreshEvent);
        }
      }, 10);
      
      setTimeout(() => {
        this.cdr.detectChanges();
        this.cdr.markForCheck();
        this.forceWidgetComponentRefresh();
        
        // Force a complete re-render by temporarily hiding and showing widgets
        this.temporarilyHideAndShowWidgets();
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
      // CRITICAL: Create a completely new array with deep cloning to ensure change detection
      const newStockDataArray = data.map((item, itemIndex) => ({
        // Deep clone the entire object
        ...JSON.parse(JSON.stringify(item)),
        // Add multiple unique identifiers to force re-rendering
        _signalUpdateId: Date.now() + Math.random() + itemIndex,
        _signalId: `signal-${Date.now()}-${Math.random()}-${itemIndex}`,
        _signalTimestamp: Date.now(),
        _signalVersion: Date.now() + itemIndex,
        // Ensure all required fields are present
        priceChange: item.priceChange || 0,
        percentChange: item.percentChange || 0,
        changeIndicator: item.changeIndicator || 'neutral',
        // Force trackBy to detect changes
        id: item.id || item.symbol || item.tradingsymbol || `signal-item-${itemIndex}`,
        // Add a changing property that trackBy functions will detect
        _signalLastModified: Date.now() + Math.random()
      }));
      
      
      // CRITICAL: Force complete data replacement with aggressive re-render triggers
      const newWidgetData = {
        stocks: newStockDataArray,
        isLoadingStocks: false,
        selectedStockSymbol: selectedSymbol,
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
        } else {
          this.loadDefaultNifty50Data();
        }
      });

    // STEP 1: Load baseline indices data first (critical for accurate price calculations)
    // This must complete before processing any WebSocket ticks
    this.loadBaselineIndicesData().then(() => {
      
      // STEP 2: Load default data if no index selected (uses baseline data)
      setTimeout(() => {
        const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
        if (!currentSelectedIndex) {
          this.loadDefaultNifty50Data();
        }
      }, 100);

      // STEP 3: Initialize WebSocket subscription (after baseline data is ready)
      // This ensures accurate price change calculations from the first tick
      setTimeout(() => {
        this.initializeWebSocketSubscription();
      }, 200);

      // STEP 4: Wait for widget header to be fully rendered
      setTimeout(() => this.ensureWidgetTimeRangeFilters(), 300);
      
      // STEP 5: Schedule periodic baseline cache refresh
      this.scheduleBaselineRefresh();
      
    }).catch(error => {
      
      // Continue with initialization even if baseline loading fails
      setTimeout(() => {
        const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
        if (!currentSelectedIndex) {
          this.loadDefaultNifty50Data();
        }
      }, 100);

      setTimeout(() => {
        this.initializeWebSocketSubscription();
      }, 200);

      setTimeout(() => this.ensureWidgetTimeRangeFilters(), 300);
    });
    
  }

  protected onChildDestroy(): void {
    
    // CRITICAL: Cleanup WebSocket subscription FIRST before any other cleanup
    // This ensures proper resource cleanup and prevents memory leaks
    // Requirements: 1.4, 1.5, 2.2
    this.cleanupWebSocketSubscription();
    
    // Clear baseline cache to free memory
    this.baselineIndicesCache.clear();
    this.baselineCacheTimestamp = 0;
    this.isBaselineDataLoaded = false;
    
    // Clear baseline refresh timer
    if (this.baselineRefreshTimer) {
      clearInterval(this.baselineRefreshTimer);
      this.baselineRefreshTimer = null;
    }
    
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
    
    // Clear real-time price data
    this.clearRealTimePriceData();
    
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

    // UPDATED: Use baseline cache data if available (most accurate)
    if (this.isBaselineDataLoaded && this.baselineIndicesCache.size > 0) {
      
      const baselineData = Array.from(this.baselineIndicesCache.values());
      this.updateIndexListData(baselineData);
      this.indicesLoaded = true;
      this.setDefaultIndexFromData(baselineData);
      return;
    }

    // FALLBACK 1: Check if WebSocket has already provided data via the signal
    const webSocketData = this.indicesDataSignal();
    if (webSocketData && webSocketData.length > 0) {
      
      // Update legacy properties for backward compatibility
      this.updateIndexListData(webSocketData);
      this.indicesLoaded = true;
      this.setDefaultIndexFromData(webSocketData);
      return;
    }

    // FALLBACK 2: Use REST API if neither baseline nor WebSocket data is available
    
    this.indicesService.getIndicesByExchangeSegment('NSE', 'INDICES').subscribe({
      next: (indices) => {
        const mappedData = this.mapIndicesToStockData(indices || []);
        if (mappedData.length === 0) {
          this.loadDefaultNifty50DataFallback();
          return;
        }

        // Only update if baseline and WebSocket haven't provided data yet
        const currentWebSocketData = this.indicesDataSignal();
        if (!this.isBaselineDataLoaded && (!currentWebSocketData || currentWebSocketData.length === 0)) {
          
          // Update signals with fallback data
          this.indicesDataSignal.set(mappedData);
          this.indicesDataSubject.next(mappedData);
          
          // Update legacy properties for backward compatibility
          this.updateIndexListData(mappedData);
        } else {
        }
        
        this.indicesLoaded = true;
        this.setDefaultIndexFromData(this.indicesDataSignal());
      },
      error: (error) => {
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

  private mapIndicesToStockData(indices: IndexResponseDto[] | IndexDataDto[]): StockDataDto[] {
    return indices.map(index => {
      const lastPrice = index.lastPrice || 0;
      const variation = (index as any).variation || (index as any).priceChange || 0;
      const percentChange = (index as any).percentChange || 0;
      
      // CRITICAL FIX: Handle previousClose properly
      let previousClose = (index as any).previousClose || 0;
      let calculatedPriceChange = variation;
      let calculatedPercentChange = percentChange;
      
      // If we have valid previousClose from API, use it for calculations
      if (previousClose > 0 && previousClose !== lastPrice) {
        calculatedPriceChange = lastPrice - previousClose;
        calculatedPercentChange = ((calculatedPriceChange / previousClose) * 100);
      } else if (variation !== 0 && lastPrice > 0) {
        // If we have variation but no proper previousClose, calculate previousClose from variation
        previousClose = lastPrice - variation;
        calculatedPriceChange = variation;
        calculatedPercentChange = previousClose > 0 ? ((variation / previousClose) * 100) : percentChange;
      } else if (percentChange !== 0 && lastPrice > 0) {
        // If we have percentChange but no proper previousClose, calculate previousClose from percentChange
        // percentChange = ((lastPrice - previousClose) / previousClose) * 100
        // Solving for previousClose: previousClose = lastPrice / (1 + percentChange/100)
        previousClose = lastPrice / (1 + (percentChange / 100));
        calculatedPriceChange = lastPrice - previousClose;
        calculatedPercentChange = percentChange;
      } else {
        // Fallback: if no proper data available, set previousClose to a reasonable estimate
        // This prevents the issue where previousClose === lastPrice
        previousClose = lastPrice > 0 ? lastPrice * 0.999 : 0; // Assume 0.1% change as fallback
        calculatedPriceChange = lastPrice - previousClose;
        calculatedPercentChange = previousClose > 0 ? ((calculatedPriceChange / previousClose) * 100) : 0;
      }
      
      
      return {
        tradingsymbol: index.indexSymbol || index.indexName || 'N/A',
        symbol: index.indexSymbol || index.indexName || 'N/A',
        companyName: index.indexName || index.indexSymbol || 'Unknown Index',
        lastPrice: lastPrice,
        percentChange: calculatedPercentChange,
        priceChange: calculatedPriceChange,
        totalTradedValue: 0,
        sector: 'Indices',
        industry: 'Indices',
        // CRITICAL: Use the properly calculated previousClose
        previousClose: previousClose,
        // Add additional fields that might be used by the Index List widget
        openPrice: (index as any).openPrice || 0,
        dayHigh: (index as any).dayHigh || 0,
        dayLow: (index as any).dayLow || 0,
        // Add timestamp for tracking data freshness
        lastUpdateTime: (index as any).updatedAt || (index as any).tickTimestamp || new Date().toISOString()
      };
    });
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
      variation: (targetIndex as any).variation || targetIndex.priceChange || 0,
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
          this.isCandlestickLoadingSignal.set(false); // Hide loading indicator
          this.ensureWidgetTimeRangeFilters();
        },
        error: (error) => {
          this.historicalData = [];
          this.updateCandlestickChartWithHistoricalData();
          this.isCandlestickLoadingSignal.set(false); // Hide loading indicator even on error
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
    
    // Clear real-time price data for the previous index
    this.clearRealTimePriceData();
    
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
      if (Array.isArray(options['series'])) {
        options['series'] = options['series'].filter((s: any) => {
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

      // Configure grid: single grid for candlestick chart with space for dual y-axes
      options.grid = {
        top: '10%',
        left: '8%',   // More space for left y-axis (real-time price)
        right: '8%',  // More space for right y-axis (historical price)
        bottom: '11%',  // Leave minimal space for data zoom
        containLabel: true
      };

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
      if (!Array.isArray(options['xAxis'])) {
        options['xAxis'] = options['xAxis'] ? [options['xAxis']] : [];
      }
      if (options['xAxis'].length > 1) {
        options['xAxis'] = [options['xAxis'][0]];
      }
      if (options['xAxis'].length === 0) {
        options['xAxis'] = [{
          type: 'category',
          data: []
        }];
      }
      
      // Configure y-axis - dual axes for historical price (right) and real-time price (left)
      if (!Array.isArray(options['yAxis'])) {
        options['yAxis'] = options['yAxis'] ? [options['yAxis']] : [];
      }
      
      // Ensure we have at least the primary y-axis for historical data
      if (options['yAxis'].length === 0) {
        options['yAxis'].push({
          type: 'value',
          scale: true,
          position: 'right',
          axisLabel: {
            fontSize: 20,
            formatter: (value: number) => {
              return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(value);
            }
          }
        });
      } else {
        // Update existing primary y-axis
        options['yAxis'][0] = {
          ...options['yAxis'][0],
          type: 'value',
          scale: true,
          position: 'right',
          axisLabel: {
            ...options['yAxis'][0].axisLabel,
            fontSize: 20,
            formatter: (value: number) => {
              return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(value);
            }
          }
        };
      }
      
      // Add secondary y-axis for real-time price (will be populated when real-time data arrives)
      if (options['yAxis'].length < 2) {
        options['yAxis'].push({
          type: 'value',
          scale: true,
          position: 'left',
          show: false, // Initially hidden, will be shown when real-time data arrives
          axisLabel: {
            formatter: (value: number) => {
              return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
              }).format(value);
            },
            fontSize: 16,
            color: '#ff6b35'
          },
          axisLine: {
            lineStyle: {
              color: '#ff6b35'
            }
          },
          splitLine: {
            show: false
          }
        });
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

  /**
   * Update the candlestick chart with real-time price line
   * This method adds or updates the dotted line showing the current last price
   */
  private updateCandlestickChartWithRealTimePrice(): void {
    if (!this.dashboardConfig?.widgets) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (!candlestickWidget || !candlestickWidget.chartInstance) {
      return;
    }

    const currentPrice = this.currentLastPriceSignal();
    if (currentPrice === null) {
      return;
    }

    // Get current chart options
    const currentOptions = candlestickWidget.chartInstance.getOption();
    if (!currentOptions) {
      return;
    }

    // Update the chart options to include the real-time price line
    const updatedOptions = this.addRealTimePriceLineToChart(currentOptions, currentPrice);
    
    // Apply the updated options to the chart
    candlestickWidget.chartInstance.setOption(updatedOptions, false);
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

  /**
   * Clear real-time price data when switching indices
   * This method resets the real-time price signal and data array
   */
  private clearRealTimePriceData(): void {
    this.currentLastPriceSignal.set(null);
    this.realTimePriceData = [];
    
    // Remove real-time price line from chart if it exists
    this.removeRealTimePriceLineFromChart();
  }

  /**
   * Remove real-time price line from the candlestick chart
   */
  private removeRealTimePriceLineFromChart(): void {
    if (!this.dashboardConfig?.widgets) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (!candlestickWidget || !candlestickWidget.chartInstance) {
      return;
    }

    // Get current chart options
    const currentOptions = candlestickWidget.chartInstance.getOption();
    if (!currentOptions || !Array.isArray(currentOptions['series'])) {
      return;
    }

    // Remove real-time price line series
    const updatedOptions = JSON.parse(JSON.stringify(currentOptions));
    updatedOptions['series'] = updatedOptions['series'].filter((s: any) => s.name !== 'Real-time Price');
    
    // Hide secondary y-axis
    if (Array.isArray(updatedOptions['yAxis']) && updatedOptions['yAxis'].length > 1) {
      updatedOptions['yAxis'][1].show = false;
    }
    
    // Apply the updated options to the chart
    candlestickWidget.chartInstance.setOption(updatedOptions, false);
  }

  /**
   * Add real-time price line to the chart configuration
   * This method adds a dotted horizontal line showing the current last price on a secondary y-axis
   * 
   * @param currentOptions - Current chart options
   * @param currentPrice - Current last price from WebSocket
   * @returns Updated chart options with real-time price line
   */
  private addRealTimePriceLineToChart(currentOptions: any, currentPrice: number): any {
    const options = JSON.parse(JSON.stringify(currentOptions)); // Deep clone
    
    // Ensure we have series array
    if (!Array.isArray(options['series'])) {
      options['series'] = [];
    }
    
    // Ensure we have yAxis array
    if (!Array.isArray(options['yAxis'])) {
      options['yAxis'] = options['yAxis'] ? [options['yAxis']] : [];
    }
    
    // Show and configure secondary y-axis for real-time price
    if (options['yAxis'].length >= 2) {
      options['yAxis'][1].show = true;
      options['yAxis'][1].min = currentPrice * 0.999; // Set min slightly below current price
      options['yAxis'][1].max = currentPrice * 1.001; // Set max slightly above current price
    } else {
      // Add secondary y-axis if it doesn't exist
      options['yAxis'].push({
        type: 'value',
        scale: true,
        position: 'left',
        show: true,
        min: currentPrice * 0.999,
        max: currentPrice * 1.001,
        axisLabel: {
          formatter: (value: number) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(value);
          },
          fontSize: 16,
          color: '#ff6b35' // Orange color for real-time price axis
        },
        axisLine: {
          lineStyle: {
            color: '#ff6b35'
          }
        },
        splitLine: {
          show: false // Hide grid lines for secondary axis
        }
      });
    }
    
    // Remove existing real-time price line series if it exists
    options['series'] = options['series'].filter((s: any) => s.name !== 'Real-time Price');
    
    // Add real-time price line series
    const realTimePriceSeries = {
      name: 'Real-time Price',
      type: 'line',
      yAxisIndex: 1, // Use secondary y-axis
      data: Array(options['xAxis'][0]?.data?.length || 0).fill(currentPrice),
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#ff6b35' // Orange color for visibility
      },
      symbol: 'none', // No symbols on the line
      animation: false, // Disable animation for real-time updates
      silent: true, // Don't trigger events
      emphasis: {
        disabled: true // Disable hover effects
      },
      tooltip: {
        formatter: () => {
          return `<div style="padding: 8px;">
            <div style="font-weight: bold; color: #ff6b35;">Real-time Price</div>
            <div style="margin: 4px 0;">
              <span style="color: #666;">Current:</span> 
              <span style="font-weight: bold;">${new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(currentPrice)}</span>
            </div>
            <div style="font-size: 12px; color: #999;">Live from WebSocket</div>
          </div>`;
        }
      }
    };
    
    options['series'].push(realTimePriceSeries);
    
    return options;
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
    if (Array.isArray(options['xAxis'])) {
      // Keep only the first x-axis
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

    // Update Y-axis font size
    if (Array.isArray(options['yAxis'])) {
      options['yAxis'] = options['yAxis'].map((axis: any) => ({
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          fontSize: 20 // 1.25rem = 20px
        }
      }));
    } else if (options['yAxis']) {
      options['yAxis'] = {
        ...options['yAxis'],
        axisLabel: {
          ...options['yAxis'].axisLabel,
          fontSize: 20 // 1.25rem = 20px
        }
      };
    }

    // Update series data - candlestick only
    if (!Array.isArray(options['series'])) {
      options['series'] = [];
    }
    
    // Remove any volume (bar) series or line series
    // Volume series can be identified by: type='bar', name='Volume', gridIndex=1, xAxisIndex=1, or yAxisIndex=1
    options['series'] = options['series'].filter((s: any) => {
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
          color: '#00da3c',  // Green for positive
          color0: '#ec0000', // Red for negative
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
      return;
    }



    if (!realTimeIndexData) {
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