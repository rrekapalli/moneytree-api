import { Component, OnInit, OnChanges, DoCheck, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { ScrollerModule } from "primeng/scroller";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { StockListData } from './stock-list-chart-builder';
import { IWidget } from '../../entities/IWidget';

/**
 * Interface for selected stock data communication
 */
export interface SelectedStockData {
  id: string;
  symbol: string;
  name: string;
  lastPrice: number;
  priceChange: number;
  percentChange: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  industry?: string;
  sector?: string;
}

@Component({
  selector: 'app-stock-list-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DividerModule,
    InputTextModule,
    ScrollerModule,
    DataViewModule,
    ScrollPanelModule,
    TabsModule,
    TooltipModule
  ],
  templateUrl: './stock-list-table.component.html',
  styleUrls: ['./stock-list-table.component.scss']
})
export class StockListTableComponent implements OnInit, OnChanges, DoCheck {
  @Input() widget!: IWidget;
  @Input() stocks: StockListData[] = [];
  @Input() isLoadingStocks: boolean = false;
  @Input() selectedStockSymbol: string = ''; // Add input for selected stock
  @Output() stockSelected = new EventEmitter<SelectedStockData>();
  @Output() stockDoubleClicked = new EventEmitter<SelectedStockData>();
  @Output() refreshRequested = new EventEmitter<void>();

  @ViewChild('stockTooltipTemplate') stockTooltipTemplate!: TemplateRef<any>;

  // Search functionality
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: StockListData[] = [];

  // Global filter for TreeTable
  globalFilterValue: string = '';

  // Tooltip functionality
  hoveredStock: StockListData | null = null;

  // Keep track of previous widget data for change detection
  private previousStocksLength: number = 0;
  private previousIsLoading: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateStocksFromWidget();
  }

  ngOnChanges(): void {
    this.updateStocksFromWidget();
  }

  ngDoCheck(): void {
    // Manually check for changes in widget.data.stocks
    const currentStocksLength = this.widget?.data?.stocks?.length || 0;
    const currentIsLoading = this.widget?.data?.isLoadingStocks || false;

    if (currentStocksLength !== this.previousStocksLength || 
        currentIsLoading !== this.previousIsLoading) {
      this.previousStocksLength = currentStocksLength;
      this.previousIsLoading = currentIsLoading;
      
      this.updateStocksFromWidget();
      this.cdr.detectChanges();
    }
  }

  /**
   * Update stocks data from widget.data
   */
  private updateStocksFromWidget(): void {
    console.log('🔄 StockListTable: Updating stocks from widget data:', this.widget?.data);
    
    if (this.widget?.data?.stocks && this.widget.data.stocks.length > 0) {
      this.stocks = this.widget.data.stocks;
      this.isLoadingStocks = this.widget.data.isLoadingStocks || false;
      
      // Update selected stock symbol from widget data
      if (this.widget.data.selectedStockSymbol !== undefined) {
        this.selectedStockSymbol = this.widget.data.selectedStockSymbol;
        console.log('📊 StockListTable: Updated selected stock symbol to:', this.selectedStockSymbol);
      }
      
      console.log('✅ StockListTable: Updated with', this.stocks.length, 'stocks');
    } else if (!this.stocks || this.stocks.length === 0) {
      // Ensure stocks is initialized as empty array if no data
      this.stocks = [];
      console.log('⚠️ StockListTable: No stock data available, using empty array');
    }
  }

  /**
   * TrackBy function for ngFor performance optimization
   */
  trackBySymbol(index: number, item: StockListData): string {
    return item.symbol || '';
  }

  /**
   * Search for stocks by symbol or company name
   */
  searchStocks(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    // Search within the loaded stocks
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults = this.stocks
      .filter(stock => 
        (stock.symbol?.toLowerCase().includes(normalizedQuery)) || 
        (stock.companyName?.toLowerCase().includes(normalizedQuery))
      )
      .map(stock => ({
        ...stock
      }));

    this.isSearching = false;
  }

  /**
   * Add a stock from search results to the current view
   */
  addStockFromSearch(stock: StockListData): void {
    // Check if the stock is already in the list
    const stockExists = this.stocks.some(item => item.symbol === stock.symbol);
    if (stockExists) {
      return;
    }

    // Add the stock to the list
    this.stocks.push(stock);

    // Clear search results
    this.searchResults = [];
    this.searchQuery = '';
  }


  /**
   * Handle row click event in the table
   */
  onRowClick(rowData: any): void {
    // Transform the row data to SelectedStockData format
    const selectedStockData: SelectedStockData = {
      id: rowData.symbol || 'unknown',
      symbol: rowData.symbol || '',
      name: rowData.companyName || rowData.symbol || '',
      lastPrice: rowData.lastPrice || 0,
      priceChange: rowData.priceChange || 0,
      percentChange: rowData.percentChange || 0,
      volume: rowData.volume,
      dayHigh: rowData.dayHigh,
      dayLow: rowData.dayLow,
      industry: rowData.industry,
      sector: rowData.sector
    };

    // Emit the selected stock data
    this.stockSelected.emit(selectedStockData);
  }

  /**
   * Handle row double-click event in the table
   */
  onRowDoubleClick(rowData: any): void {
    console.log('📊 StockListTable: Row double-clicked:', rowData);
    
    // Transform the row data to SelectedStockData format
    const selectedStockData: SelectedStockData = {
      id: rowData.symbol || 'unknown',
      symbol: rowData.symbol || '',
      name: rowData.companyName || rowData.symbol || '',
      lastPrice: rowData.lastPrice || 0,
      priceChange: rowData.priceChange || 0,
      percentChange: rowData.percentChange || 0,
      volume: rowData.volume,
      dayHigh: rowData.dayHigh,
      dayLow: rowData.dayLow,
      industry: rowData.industry,
      sector: rowData.sector
    };

    console.log('📤 StockListTable: Emitting stockDoubleClicked event:', selectedStockData);
    
    // Emit the double-clicked stock data
    this.stockDoubleClicked.emit(selectedStockData);
  }

  /**
   * Refresh stocks data
   */
  refreshStocks(): void {
    this.refreshRequested.emit();
  }

  /**
   * Set the currently hovered stock for tooltip display
   */
  setHoveredStock(stock: StockListData): void {
    this.hoveredStock = stock;
  }

  /**
   * Clear the hovered stock when mouse leaves
   */
  clearHoveredStock(): void {
    this.hoveredStock = null;
  }

  /**
   * Check if the stock has numerical data to display in tooltip
   */
  hasNumericalData(stock: StockListData | null): boolean {
    if (!stock) return false;
    return (stock.volume !== undefined && stock.volume !== null) ||
           (stock.dayHigh !== undefined && stock.dayHigh !== null) ||
           (stock.dayLow !== undefined && stock.dayLow !== null) ||
           (stock.openPrice !== undefined && stock.openPrice !== null) ||
           (stock.previousClose !== undefined && stock.previousClose !== null);
  }

  /**
   * Load sample data for testing
   */
  loadSampleData(): void {
    console.log('🎲 StockListTable: Loading sample data for testing');
    
    const sampleStocks: StockListData[] = [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries Limited',
        lastPrice: 2456.75,
        priceChange: 23.50,
        percentChange: 0.97,
        volume: 1234567,
        dayHigh: 2478.90,
        dayLow: 2445.20,
        openPrice: 2450.00,
        previousClose: 2433.25,
        industry: 'Oil & Gas',
        sector: 'Energy'
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services Limited',
        lastPrice: 3567.80,
        priceChange: -15.25,
        percentChange: -0.43,
        volume: 987654,
        dayHigh: 3590.00,
        dayLow: 3555.50,
        openPrice: 3580.00,
        previousClose: 3583.05,
        industry: 'Information Technology',
        sector: 'IT'
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys Limited',
        lastPrice: 1456.30,
        priceChange: 8.75,
        percentChange: 0.60,
        volume: 2345678,
        dayHigh: 1465.00,
        dayLow: 1445.80,
        openPrice: 1450.00,
        previousClose: 1447.55,
        industry: 'Information Technology',
        sector: 'IT'
      },
      {
        symbol: 'HDFC',
        companyName: 'HDFC Bank Limited',
        lastPrice: 1678.90,
        priceChange: 12.40,
        percentChange: 0.74,
        volume: 1876543,
        dayHigh: 1685.50,
        dayLow: 1665.20,
        openPrice: 1670.00,
        previousClose: 1666.50,
        industry: 'Banking',
        sector: 'Financial Services'
      },
      {
        symbol: 'ICICI',
        companyName: 'ICICI Bank Limited',
        lastPrice: 987.65,
        priceChange: -5.30,
        percentChange: -0.53,
        volume: 3456789,
        dayHigh: 995.00,
        dayLow: 982.50,
        openPrice: 990.00,
        previousClose: 992.95,
        industry: 'Banking',
        sector: 'Financial Services'
      }
    ];

    // Update both component state and widget data to maintain synchronization
    this.stocks = sampleStocks;
    this.isLoadingStocks = false;
    
    // Also update the widget data if available
    if (this.widget?.data) {
      this.widget.data.stocks = sampleStocks;
      this.widget.data.isLoadingStocks = false;
    }
  }
}