import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, computed, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { ScrollerModule } from "primeng/scroller";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';

// Import dashboard modules and chart builders
import { 
  StockListChartBuilder,
  StockListData,
  FilterBy,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  StandardDashboardBuilder,
  IWidget
} from '@dashboards/public-api';

import { TreeNode } from 'primeng/api';
import { IndicesService } from '../../services/apis/indices.api';
import { IndexResponseDto } from '../../services/entities/indices';
import { ComponentCommunicationService, SelectedIndexData } from '../../services/component-communication.service';
import { WebSocketService, IndexDataDto, IndicesDto } from '../../services/websockets';
import { StockTicksService } from '../../services/apis/stock-ticks.api';
import { StockDataDto } from '../../services/entities/stock-ticks';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-indices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    TreeTableModule,
    DividerModule,
    InputTextModule,
    ScrollerModule,
    DataViewModule,
    ScrollPanelModule,
    TabsModule,
    TooltipModule,
    SelectModule,
    DashboardContainerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './indices.component.html',
  styleUrls: ['./indices.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class IndicesComponent implements OnInit, OnDestroy {

  // Convert main data properties to signals for better performance
  indices = signal<IndexResponseDto[]>([]);
  indicesTreeData = signal<TreeNode[]>([]);
  indicesLists = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  selectedIndexSymbol = signal<string | null>(null);
  
  // Stock list data and dashboard
  stockListData = signal<StockDataDto[]>([]);
  filteredStockListData = signal<StockDataDto[]>([]);
  dashboardConfig: IWidget[] | null = null;
  selectedIndexForStocks = signal<IndexResponseDto | null>(null);
  
  // Loading states as signals
  isLoadingIndices = signal<boolean>(true); // Start with loading true
  errorIndices = signal<string | null>(null);
  isSearching = signal<boolean>(false);
  isLoadingStocks = signal<boolean>(false);
  


  // Search functionality
  searchQuery = signal<string>('');
  globalFilterValue = signal<string>('');
  stockSearchQuery = signal<string>('');

  // Tab functionality
  activeTab = signal<string>('0');
  

  
  // Method to update active tab (for two-way binding)
  updateActiveTab(value: string | number | undefined): void {
    if (value !== undefined) {
      this.activeTab.set(value.toString());
    }
  }
  
  // Method to update global filter value (for two-way binding)
  updateGlobalFilterValue(value: string | number): void {
    this.globalFilterValue.set(value.toString());
  }

  // Computed signals for derived data
  hasIndices = computed(() => this.indices().length > 0);
  hasTreeData = computed(() => this.indicesTreeData().length > 0);
  hasSearchResults = computed(() => this.searchResults().length > 0);

  currentIndicesList = computed(() => {
    const index = parseInt(this.activeTab(), 10);
    return this.indicesLists()[index] || null;
  });

  // WebSocket subscription management
  private indicesWebSocketSubscription: Subscription | null = null;
  private allIndicesWebSocketSubscription: Subscription | null = null;
  private webSocketUpdateTimer: any = null;
  
  // NSE Indices refresh timer
  private nseIndicesRefreshTimer: any = null;

  // Helper method to get current indices list index from activeTab
  private getCurrentIndicesListIndex(): number {
    return parseInt(this.activeTab(), 10);
  }

  // TrackBy function for ngFor performance optimization
  trackBySymbol(index: number, item: any): string {
    return item.symbol;
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private indicesService: IndicesService,
    private componentCommunicationService: ComponentCommunicationService,
    private webSocketService: WebSocketService,
    private stockTicksService: StockTicksService,
    private cdr: ChangeDetectorRef
  ) {
    // Removed effects to prevent infinite loops
  }

  ngOnInit(): void {
    try {
      // Check if services are properly injected
      if (!this.indicesService) {
        console.error('IndicesService not properly injected');
        return;
      }
      if (!this.componentCommunicationService) {
        console.error('ComponentCommunicationService not properly injected');
        return;
      }
      
      // Initialize WebSocket connection
      this.initializeWebSocket();
      
      // Load indices directly from the indices API
      this.loadIndicesLists();
    } catch (error) {
      console.error('Error in IndicesComponent ngOnInit:', error);
      // Set error state to show user-friendly message
      this.isLoadingIndices.set(false);
      this.errorIndices.set('Failed to initialize indices component');
    }
  }

  ngOnDestroy(): void {
    // Clean up WebSocket subscriptions
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }
    
    if (this.allIndicesWebSocketSubscription) {
      this.allIndicesWebSocketSubscription.unsubscribe();
      this.allIndicesWebSocketSubscription = null;
    }
    
    // Clear any pending WebSocket update timer
    if (this.webSocketUpdateTimer) {
      clearTimeout(this.webSocketUpdateTimer);
      this.webSocketUpdateTimer = null;
    }
    
    // Disconnect WebSockets
    this.webSocketService.disconnect();
  }

  retryIndices(): void {
    this.errorIndices.set(null);
    this.isLoadingIndices.set(true);
    this.ngOnInit();
  }

  /**
   * Initialize WebSocket connection for indices data
   */
  private async initializeWebSocket(): Promise<void> {
    try {
      await this.webSocketService.connect();
      
      // Subscribe to all indices updates
      this.subscribeToAllIndicesWebSocket();
    } catch (error) {
      // Silent warning - the application should continue to work without WebSocket
      // Indices will show static data from the initial API call
    }
  }

  /**
   * Subscribe to all indices WebSocket updates
   */
  private subscribeToAllIndicesWebSocket(): void {
    // Unsubscribe from previous subscription if any
    if (this.allIndicesWebSocketSubscription) {
      this.allIndicesWebSocketSubscription.unsubscribe();
      this.allIndicesWebSocketSubscription = null;
    }

    try {
      // Only subscribe if WebSocket is actually connected
      if (this.webSocketService.connected) {
        // Subscribe to all indices data using modern service
        this.allIndicesWebSocketSubscription = this.webSocketService
          .subscribeToAllIndices()
          .subscribe({
            next: (indicesData: IndicesDto) => {
              try {
                if (indicesData && indicesData.indices && indicesData.indices.length > 0) {
                  // Debounce WebSocket updates to prevent excessive signal updates
                  if (this.webSocketUpdateTimer) {
                    clearTimeout(this.webSocketUpdateTimer);
                  }
                  
                  this.webSocketUpdateTimer = setTimeout(() => {
                    // Update indices data with WebSocket data
                    if (indicesData.indices) {
                      this.updateIndicesWithWebSocketData(indicesData.indices);
                      
                      // Update TreeTable data
                      this.indicesTreeData.set(this.transformToTreeData(this.indices()));
                      
                      // Update indices lists
                      this.updateIndicesLists();
                    }
                  }, 100); // 100ms debounce
                }
              } catch (error) {
                // Error processing received indices data
              }
            },
            error: (error: any) => {
              // WebSocket subscription error for all indices
            },
            complete: () => {
              // WebSocket subscription completed
            }
          });
          
      }
    } catch (error) {
      // WebSocket subscription failed for all indices - continuing without real-time data
    }
  }

  /**
   * Update existing indices data with WebSocket data based on index name/symbol
   * @param webSocketIndices Array of index data from WebSocket
   */
  private updateIndicesWithWebSocketData(webSocketIndices: IndexDataDto[]): void {
    if (!webSocketIndices || webSocketIndices.length === 0) {
      return;
    }

    // Create a map of existing indices by symbol for quick lookup
    const existingIndicesMap = new Map<string, IndexResponseDto>();
    this.indices().forEach(index => {
      if (index.indexSymbol) {
        existingIndicesMap.set(index.indexSymbol.toUpperCase(), index);
      }
    });

    // Update existing indices with WebSocket data
    webSocketIndices.forEach(webSocketIndex => {
      const indexSymbol = webSocketIndex.indexSymbol || webSocketIndex.indexName;
      if (indexSymbol) {
        const normalizedSymbol = indexSymbol.toUpperCase();
        const existingIndex = existingIndicesMap.get(normalizedSymbol);
        
        if (existingIndex) {
          // Update existing index with WebSocket data
          this.updateIndexWithWebSocketData(existingIndex, webSocketIndex);
        } else {
          // Create new index from WebSocket data
          const newIndex = this.createIndexFromWebSocketData(webSocketIndex);
          if (newIndex) {
            this.indices.update(prev => [...prev, newIndex]);
          }
        }
      }
    });

    // Sort indices by symbol for consistent display
    this.indices.update(prev => [...prev].sort((a, b) => (a.indexSymbol || '').localeCompare(b.indexSymbol || '')));
  }

  /**
   * Update an existing index with WebSocket data
   * @param existingIndex The existing index to update
   * @param webSocketIndex The WebSocket data to merge
   */
  private updateIndexWithWebSocketData(existingIndex: IndexResponseDto, webSocketIndex: IndexDataDto): void {
    // Update price and variation data
    if (webSocketIndex.lastPrice !== undefined) {
      existingIndex.lastPrice = webSocketIndex.lastPrice;
    }
    
    if (webSocketIndex.variation !== undefined) {
      existingIndex.variation = webSocketIndex.variation;
    }
    
    if (webSocketIndex.percentChange !== undefined) {
      existingIndex.percentChange = webSocketIndex.percentChange;
    }
    
    if (webSocketIndex.openPrice !== undefined) {
      existingIndex.openPrice = webSocketIndex.openPrice;
    }
    
    if (webSocketIndex.dayHigh !== undefined) {
      existingIndex.highPrice = webSocketIndex.dayHigh;
    }
    
    if (webSocketIndex.dayLow !== undefined) {
      existingIndex.lowPrice = webSocketIndex.dayLow;
    }
    
    if (webSocketIndex.previousClose !== undefined) {
      existingIndex.previousClose = webSocketIndex.previousClose;
    }
    
    // Update WebSocket-specific fields
    if (webSocketIndex.last !== undefined) {
      existingIndex.lastPrice = webSocketIndex.last;
    }
    
    if (webSocketIndex.change !== undefined) {
      existingIndex.variation = webSocketIndex.change;
    }
    
    if (webSocketIndex.perChange !== undefined) {
      existingIndex.percentChange = webSocketIndex.perChange;
    }
    
    if (webSocketIndex.open !== undefined) {
      existingIndex.openPrice = webSocketIndex.open;
    }
    
    if (webSocketIndex.high !== undefined) {
      existingIndex.highPrice = webSocketIndex.high;
    }
    
    if (webSocketIndex.low !== undefined) {
      existingIndex.lowPrice = webSocketIndex.low;
    }
  }

  /**
   * Create a new index from WebSocket data
   * @param webSocketIndex The WebSocket data to create index from
   * @returns New IndexResponseDto or null if invalid data
   */
  private createIndexFromWebSocketData(webSocketIndex: IndexDataDto): IndexResponseDto | null {
    const indexSymbol = webSocketIndex.indexSymbol || webSocketIndex.indexName;
    const indexName = webSocketIndex.indexName || webSocketIndex.indexSymbol;
    
    if (!indexSymbol || !indexName) {
      return null;
    }

    return {
      id: '', // Will be assigned by backend, using empty string as placeholder
      indexSymbol: indexSymbol,
      indexName: indexName,
      lastPrice: webSocketIndex.lastPrice || webSocketIndex.last || 0,
      variation: webSocketIndex.variation || webSocketIndex.change || 0,
      percentChange: webSocketIndex.percentChange || webSocketIndex.perChange || 0,
      openPrice: webSocketIndex.openPrice || webSocketIndex.open || 0,
      highPrice: webSocketIndex.dayHigh || webSocketIndex.high || 0,
      lowPrice: webSocketIndex.dayLow || webSocketIndex.low || 0,
      previousClose: webSocketIndex.previousClose || 0,
      yearHigh: webSocketIndex.yearHigh || 0,
      yearLow: webSocketIndex.yearLow || 0,
      indicativeClose: webSocketIndex.indicativeClose || 0,
      peRatio: webSocketIndex.peRatio || 0,
      pbRatio: webSocketIndex.pbRatio || 0,
      dividendYield: webSocketIndex.dividendYield || 0,
      declines: webSocketIndex.declines || 0,
      advances: webSocketIndex.advances || 0,
      unchanged: webSocketIndex.unchanged || 0,
      percentChange365d: webSocketIndex.percentChange365d || 0,
      date365dAgo: webSocketIndex.date365dAgo || '',
      chart365dPath: webSocketIndex.chart365dPath || '',
      date30dAgo: webSocketIndex.date30dAgo || '',
      percentChange30d: webSocketIndex.percentChange30d || 0,
      chart30dPath: webSocketIndex.chart30dPath || '',
      chartTodayPath: webSocketIndex.chartTodayPath || '',
      keyCategory: 'Index', // Default category
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Update indices lists with current indices data
   */
  private updateIndicesLists(): void {
    const currentIndicesLists = this.indicesLists();
    if (currentIndicesLists.length === 0) {
      return;
    }

    // Update the main indices list (first item)
    const updatedIndicesLists = [...currentIndicesLists];
    const mainIndicesList = updatedIndicesLists[0];
    if (mainIndicesList) {
      mainIndicesList.items = this.indices().map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      }));
      this.indicesLists.set(updatedIndicesLists);
    }
  }

  /**
   * Search for indices by symbol or name within the loaded indices
   * @param query The search query
   */
  searchIndices(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults.set([]);
      return;
    }

    this.isSearching.set(true);

    // Search within the loaded indices
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults.set(this.indices()
      .filter(index => 
        (index.indexSymbol?.toLowerCase().includes(normalizedQuery)) || 
        (index.indexName?.toLowerCase().includes(normalizedQuery))
      )
      .map(index => ({
        symbol: index.indexSymbol,
        name: index.indexName,
        price: index.lastPrice || 0,
        change: (index.percentChange || 0) / 100 // Convert percentage to decimal
      })));

    this.isSearching.set(false);
  }

  /**
   * Add an index from search results to the current indices list
   * @param index The index to add
   */
  addIndexFromSearch(index: any): void {
    // Get the current indices list from the active tab
    const currentIndicesListIndex = this.getCurrentIndicesListIndex();
    if (currentIndicesListIndex === 0) {
      // Can't add to the main indices list
      return;
    }

    // Check if the index is already in the list
    const currentIndicesLists = this.indicesLists();
    const currentIndicesList = currentIndicesLists[currentIndicesListIndex];
    if (!currentIndicesList) return;

    const indexExists = currentIndicesList.items.some((item: { symbol: any; }) => item.symbol === index.symbol);
    if (indexExists) {
      return;
    }

    // Add the index to the list
    const updatedIndicesLists = [...currentIndicesLists];
    updatedIndicesLists[currentIndicesListIndex] = {
      ...currentIndicesList,
      items: [...currentIndicesList.items, index]
    };
    this.indicesLists.set(updatedIndicesLists);

    // Clear search results
    this.searchResults.set([]);
    this.searchQuery.set('');
  }

  /**
   * Transform flat indices data to hierarchical TreeNode structure
   * Groups indices by keyCategory for TreeTable display
   * Only shows categories that have indices with actual data
   */
  private transformToTreeData(indices: IndexResponseDto[]): TreeNode[] {
    const groupedData: { [key: string]: IndexResponseDto[] } = {};
    
    // Filter indices to only include those with meaningful data
    const validIndices = indices.filter(index => 
      index.indexSymbol && 
      (index.lastPrice !== null && index.lastPrice !== undefined) &&
      (index.variation !== null && index.variation !== undefined || 
       index.percentChange !== null && index.percentChange !== undefined)
    );
    
    // Group valid indices by keyCategory
    validIndices.forEach(index => {
      const category = index.keyCategory || 'Uncategorized';
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      groupedData[category].push(index);
    });

    // Transform to TreeNode structure - only include categories with valid indices
    const treeData: TreeNode[] = [];
    Object.keys(groupedData).forEach(category => {
      const categoryIndices = groupedData[category];
      
      // Only create category node if it has at least one valid index
      if (categoryIndices.length > 0) {
        const categoryNode: TreeNode = {
          data: {
            keyCategory: category,
            symbol: '',
            lastPrice: null,
            variation: null,
            percentChange: null,
            isCategory: true
          },
          children: categoryIndices.map(index => ({
            data: {
              keyCategory: category,
              symbol: index.indexSymbol,
              lastPrice: index.lastPrice,
              variation: index.variation,
              percentChange: index.percentChange,
              isCategory: false
            }
          })),
          expanded: true // All rows expanded by default
        };
        treeData.push(categoryNode);
      }
    });

    return treeData;
  }

  /**
   * Handle row click event in the tree table
   * @param rowData The clicked row data
   */
  onRowClick(rowData: any): void {
    // Only handle clicks on non-category rows (actual indices)
    if (rowData.isCategory) {
      return;
    }

    // Set the selected index symbol for highlighting
    this.selectedIndexSymbol.set(rowData.symbol);

    // Transform the row data to SelectedIndexData format
    const selectedIndexData: SelectedIndexData = {
      id: rowData.symbol || 'unknown',
      symbol: rowData.symbol || '',
      name: rowData.symbol || '', // Using symbol as name since name might not be available
      lastPrice: rowData.lastPrice || 0,
      variation: rowData.variation || 0,
      percentChange: rowData.percentChange || 0,
      keyCategory: rowData.keyCategory || 'Index'
    };

    // Send the selected data to the component communication service
    this.componentCommunicationService.setSelectedIndex(selectedIndexData);

    // Navigate to the overall dashboard component
    this.router.navigate(['/dashboard/overall']);
  }

  /**
   * Handle index selection from dropdown
   * @param selectedOption The selected option object with label and value
   */
  onIndexSelectionChange(selectedOption: any): void {
    // Extract the actual index from the option object
    const selectedIndex = selectedOption?.value || selectedOption;
    this.selectedIndexForStocks.set(selectedIndex);
    this.loadStocksForIndex(selectedIndex);
  }

  /**
   * Load stocks for the selected index
   * @param index The selected index
   */
  private loadStocksForIndex(index: IndexResponseDto): void {
    if (!index || !index.indexName) {
      return;
    }

    this.isLoadingStocks.set(true);
    
    // Convert index name to URL-friendly format
    const urlFriendlyIndexName = index.indexName.replace(/\s+/g, '-');
    
    this.stockTicksService.getStockTicksByIndex(urlFriendlyIndexName).subscribe({
      next: (stockData: StockDataDto[]) => {
        this.stockListData.set(stockData || []);
        this.filteredStockListData.set(stockData || []);
        this.isLoadingStocks.set(false);
        
        // Initialize dashboard with stock list widget
        this.initializeStockListDashboard();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.stockListData.set([]);
        this.filteredStockListData.set([]);
        this.isLoadingStocks.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Initialize the stock list dashboard widget
   */
  private initializeStockListDashboard(): void {
    const stockListWidget = StockListChartBuilder.create()
      .setData(this.filteredStockListData())
      .setStockPerformanceConfiguration()
      .setHeader('Stock List')
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('symbol')
      .setFilterColumn('symbol', FilterBy.Value)
      .setId('stock-list-widget')
      .setStockNavigationEvents(
        (symbol: string) => this.navigateToStockInsights(symbol),
        'symbol',
        'dblclick'
      )
      .setEvents((widget, chart) => {
        // Add a global click handler to the chart container as fallback
        if (chart) {
          const chartContainer = chart.getDom();
          if (chartContainer) {
            chartContainer.addEventListener('dblclick', (event: Event) => {
              // Try to find the clicked element and extract stock symbol
              const target = event.target as HTMLElement;
              if (target) {
                // Look for text content that might be a stock symbol
                const textContent = target.textContent || target.innerText;
                if (textContent && textContent.length <= 10) {
                  this.navigateToStockInsights(textContent.trim());
                }
              }
            });
          }
        }
      })
      .build();

    // Position the widget
    stockListWidget.position = { x: 0, y: 0, cols: 12, rows: 16 };

    this.dashboardConfig = [stockListWidget];
    
    // Add click handlers after dashboard is rendered
    this.addDashboardClickHandlers();
  }

  /**
   * Filter stock list data based on search query
   * @param query The search query
   */
  filterStockList(query: string): void {
    this.stockSearchQuery.set(query);
    
    if (!query || query.trim() === '') {
      this.filteredStockListData.set(this.stockListData());
      return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const filtered = this.stockListData().filter(stock => 
      stock.symbol?.toLowerCase().includes(normalizedQuery) ||
      stock.companyName?.toLowerCase().includes(normalizedQuery) ||
      stock.industry?.toLowerCase().includes(normalizedQuery) ||
      stock.sector?.toLowerCase().includes(normalizedQuery)
    );
    
    this.filteredStockListData.set(filtered);
    
    // Update dashboard with filtered data
    if (this.dashboardConfig && this.dashboardConfig.length > 0) {
      const stockListWidget = this.dashboardConfig[0];
      if (stockListWidget && stockListWidget['updateData']) {
        stockListWidget['updateData'](this.filteredStockListData());
      }
    }
  }

  /**
   * Get display options for the index dropdown
   */
  getIndexOptions(): any[] {
    return this.indices().map(index => ({
      label: `${index.indexSymbol} - ${index.indexName}`,
      value: index
    }));
  }

  /**
   * Navigate to stock insights dashboard with selected stock
   * @param stockSymbol The symbol of the stock to navigate to
   */
  private navigateToStockInsights(stockSymbol: string): void {
    if (!stockSymbol || stockSymbol.trim() === '') {
      return;
    }

    // Navigate to stock insights dashboard with the stock symbol
    this.router.navigate(['/dashboard/stock-insights', stockSymbol]);
  }

  /**
   * Add click handlers to the dashboard after it's rendered
   * This method can be called after the dashboard is initialized
   */
  private addDashboardClickHandlers(): void {
    // Use setTimeout to ensure the dashboard is fully rendered
    setTimeout(() => {
      const dashboardContainer = document.querySelector('[data-dashboard-id="indices-stock-list"]');
      if (dashboardContainer) {
        // Add double-click handler to the entire dashboard
        dashboardContainer.addEventListener('dblclick', (event: Event) => {
          // Find the clicked element
          const target = event.target as HTMLElement;
          if (target) {
            // Look for stock symbol in the clicked element or its parents
            let currentElement = target;
            while (currentElement && currentElement !== dashboardContainer) {
              const textContent = currentElement.textContent || currentElement.innerText;
              if (textContent && textContent.length <= 10 && textContent.length >= 2) {
                // Check if it looks like a stock symbol (letters and numbers)
                if (/^[A-Z0-9]+$/.test(textContent.trim())) {
                  this.navigateToStockInsights(textContent.trim());
                  return;
                }
              }
              currentElement = currentElement.parentElement as HTMLElement;
            }
          }
        });
      }
    }, 1000); // Wait 1 second for dashboard to render
  }

  /**
   * Auto-select NIFTY 50 index by default
   * @param indices Array of loaded indices
   */
  private selectNifty50ByDefault(indices: IndexResponseDto[]): void {
    // Find NIFTY 50 index
    const nifty50Index = indices.find(index => 
      index.indexSymbol?.toUpperCase() === 'NIFTY 50' || 
      index.indexName?.toUpperCase() === 'NIFTY 50' ||
      index.indexSymbol?.toUpperCase() === 'NIFTY50' ||
      index.indexName?.toUpperCase() === 'NIFTY50'
    );

    if (nifty50Index) {
      this.selectedIndexForStocks.set(nifty50Index);
      this.loadStocksForIndex(nifty50Index);
    } else {
      // If NIFTY 50 is not found, select the first available index
      if (indices.length > 0) {
        this.selectedIndexForStocks.set(indices[0]);
        this.loadStocksForIndex(indices[0]);
      }
    }
  }

  /**
   * Load indices lists from the indices API
   * Gets all indices from the API and fills the list with indices data
   */
  private loadIndicesLists(): void {
    try {
      this.isLoadingIndices.set(true);
      // Get all indices from the API
      this.indicesService.getAllIndices().subscribe({
        next: (indices: IndexResponseDto[]) => {
          this.indices.set(indices);
          this.isLoadingIndices.set(false);

          // Transform to TreeTable data
          this.indicesTreeData.set(this.transformToTreeData(indices));

          // Create an indices list item for each index
          const items = indices.map(index => ({
            symbol: index.indexSymbol,
            name: index.indexName,
            price: index.lastPrice || 0,
            change: (index.percentChange || 0) / 100 // Convert percentage to decimal
          }));

          // Create an indices list with the indices
          const mainIndicesList = {
            id: 'main-indices',
            name: 'Market Indices',
            description: 'All market indices from the indices API',
            items: items
          };

          // Set the indicesLists property with the main indices list as the first item
          this.indicesLists.set([mainIndicesList]);
          // Set the active tab to the first list
          this.activeTab.set('0');
          
          // Auto-select NIFTY 50 index by default
          this.selectNifty50ByDefault(indices);
          
          // Force change detection to ensure template updates
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.isLoadingIndices.set(false);
          
          // If there's an error, use empty indices list
          const emptyIndicesList = {
            id: 'main-indices',
            name: 'Market Indices',
            description: 'All market indices from the indices API',
            items: []
          };
          
          // Set the indicesLists property with the empty list
          this.indicesLists.set([emptyIndicesList]);
          
          // Set the active tab to the first list
          this.activeTab.set('0');
          
          // Try to auto-select NIFTY 50 even with empty list (will fallback gracefully)
          this.selectNifty50ByDefault([]);
        }
      });
    } catch (error) {
      // Error in loadIndicesLists
      this.isLoadingIndices.set(false);
      
      // If there's an error, use empty indices list
      const emptyIndicesList = {
        id: 'main-indices',
        name: 'Market Indices',
        description: 'All market indices from the indices API',
        items: []
      };
      
      // Set the indicesLists property with the empty list
      this.indicesLists.set([emptyIndicesList]);
      
      // Set the active tab to the first list
      this.activeTab.set('0');
      
      // Try to auto-select NIFTY 50 even with empty list (will fallback gracefully)
      this.selectNifty50ByDefault([]);
    }
  }
}