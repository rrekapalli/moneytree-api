import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
import { NseEquityService } from '../../services/apis/nse-equity.api';
import { NseEquity } from '../../services/entities/nse-equity';
import { StockService } from '../../services/apis/stock.api';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  // Watchlists
  watchlists: any[] = [];

  // NSE Equities
  nseEquities: NseEquity[] = [];
  isLoadingNseEquities: boolean = false;


  // Search functionality
  searchQuery: string = '';
  isSearching: boolean = false;
  searchResults: any[] = [];

  // Tab functionality
  activeTab: string = '0';


  // Helper method to get current watchlist index from activeTab
  private getCurrentWatchlistIndex(): number {
    return parseInt(this.activeTab, 10);
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private nseEquityService: NseEquityService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    // Load watchlists directly from the stock API
    this.loadWatchlists();
  }

  /**
   * Load all NSE equities
   * NOTE: This method is no longer used. We now use loadWatchlists() to fetch stocks directly from the stock API.
   */
  private loadNseEquities(): void {
    this.isLoadingNseEquities = true;
    this.nseEquityService.getAllNseEquities().subscribe({
      next: ( data: NseEquity[]) => {
        this.nseEquities = data;
        this.isLoadingNseEquities = false;

        // Create a watchlist from NSE equities if we have data
        if (this.nseEquities.length > 0) {
          this.createNseEquitiesWatchlist();
        }

        // Load additional watchlists after NSE equities are loaded
        this.loadWatchlists();
      },
      error: (error: any): void => {
        this.isLoadingNseEquities = false;

        // Even if NSE equities fail to load, still load the watchlists
        this.loadWatchlists();
      }
    });
  }

  /**
   * Create a watchlist from NSE equities to replace the first watchlist
   * NOTE: This method is no longer used. We now use loadWatchlists() to fetch stocks directly from the stock API.
   */
  private createNseEquitiesWatchlist(): void {
    // Create a watchlist item for each NSE equity
    const items = this.nseEquities.map(equity => ({
      symbol: equity.symbol,
      name: equity.nameOfCompany,
      price: 0, // We don't have price data in the NseEquity interface
      change: 0 // We don't have change data in the NseEquity interface
    }));

    // Create a watchlist with the NSE equities
    const nseWatchlist = {
      id: 'nse-equities',
      name: 'NSE Equities',
      description: 'All NSE equities',
      items: items
    };

    // Set the watchlists property with the NSE equities watchlist as the first item
    this.watchlists = [nseWatchlist];

    // Set the active tab to the first watchlist
    this.activeTab = '0';
  }


  /**
   * Search for stocks by symbol or name within the loaded NSE equities
   * @param query The search query
   */
  searchStocks(query: string): void {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    // Search within the loaded NSE equities
    const normalizedQuery = query.toLowerCase().trim();
    this.searchResults = this.nseEquities
      .filter(equity => 
        equity.symbol.toLowerCase().includes(normalizedQuery) || 
        equity.nameOfCompany.toLowerCase().includes(normalizedQuery)
      )
      .map(equity => ({
        symbol: equity.symbol,
        name: equity.nameOfCompany,
        price: 0, // We don't have price data in the NseEquity interface
        change: 0 // We don't have change data in the NseEquity interface
      }));

    this.isSearching = false;
  }

  /**
   * Add a stock from search results to the current watchlist
   * @param stock The stock to add
   */
  addStockFromSearch(stock: any): void {
    // Get the current watchlist from the active tab
    const currentWatchlistIndex = this.getCurrentWatchlistIndex();
    if (currentWatchlistIndex === 0) {
      // Can't add to the NSE equities watchlist
      return;
    }

    // Check if the stock is already in the watchlist
    const currentWatchlist = this.watchlists[currentWatchlistIndex];
    if (!currentWatchlist) return;

    const stockExists = currentWatchlist.items.some((item: { symbol: any; }) => item.symbol === stock.symbol);
    if (stockExists) {
      return;
    }

    // Add the stock to the watchlist
    currentWatchlist.items.push(stock);

    // Clear search results
    this.searchResults = [];
    this.searchQuery = '';
  }

  /**
   * Load watchlists from the stock API
   * Gets all stocks from the API and fills the watchlist with NSE equities
   */
  private loadWatchlists(): void {
    // Get all stocks from the API
    this.stockService.getAllStocks().subscribe({
      next: (stocks: any[]) => {
        // Create a watchlist item for each stock
        const items = stocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          price: 0, // We don't have price data in the Stock interface
          change: 0 // We don't have change data in the Stock interface
        }));

        // Create a watchlist with the stocks
        const nseWatchlist = {
          id: 'nse-equities',
          name: 'NSE Equities',
          description: 'All NSE equities from the stock API',
          items: items
        };

        // Set the watchlists property with the NSE equities watchlist as the first item
        this.watchlists = [nseWatchlist];

        // Set the active tab to the first watchlist
        this.activeTab = '0';
      },
      error: (error: any) => {
        // If there's an error, use empty watchlist
        const emptyWatchlist = {
          id: 'nse-equities',
          name: 'NSE Equities',
          description: 'All NSE equities from the stock API',
          items: []
        };
        
        // Set the watchlists property with the empty watchlist
        this.watchlists = [emptyWatchlist];
        
        // Set the active tab to the first watchlist
        this.activeTab = '0';
      }
    });
  }

  // No longer needed with tab-based interface
  // private loadWatchlistDetails(id: string): void {
  //   this.watchlistService.getWatchlistById(id).subscribe({
  //     next: (data) => {
  //       // Find the index of the watchlist and set it as active
  //       const index = this.watchlists.findIndex(w => w.id === id);
  //       if (index !== -1) {
  //         this.watchlists[index] = data;
  //         this.activeTab = index.toString();
  //       }
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }

  // private loadSampleData(): void {
  //   // Sample data as fallback
  //   this.watchlists = [
  //     {
  //       id: '1',
  //       name: 'Tech Stocks',
  //       description: 'Technology sector watchlist',
  //       items: [
  //         { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 0.0234 },
  //         { symbol: 'MSFT', name: 'Microsoft Corporation', price: 290.10, change: 0.0156 },
  //         { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -0.0089 }
  //       ]
  //     },
  //     {
  //       id: '2',
  //       name: 'Financial Stocks',
  //       description: 'Financial sector watchlist',
  //       items: [
  //         { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 150.25, change: 0.0134 },
  //         { symbol: 'BAC', name: 'Bank of America Corp.', price: 40.10, change: -0.0056 }
  //       ]
  //     }
  //   ];
  // }
  //
  // createWatchlist(): void {
  //   // This would typically open a dialog or navigate to a form
  //   // For now, we'll just create a simple watchlist with a placeholder name
  //   const newWatchlist = {
  //     name: 'New Watchlist',
  //     description: 'A new watchlist',
  //     items: []
  //   };
  //
  //   this.watchlistService.createWatchlist(newWatchlist).subscribe({
  //     next: (createdWatchlist) => {
  //       this.watchlists.push(createdWatchlist);
  //       // Switch to the new watchlist tab
  //       this.activeTab = (this.watchlists.length - 1).toString();
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
  //
  // viewWatchlist(watchlist: Watchlist): void {
  //   const index = this.watchlists.findIndex(w => w.id === watchlist.id);
  //   if (index !== -1) {
  //     this.activeTab = index.toString();
  //   }
  // }
  //
  // editWatchlist(): void {
  //   // Get the current watchlist from the active tab
  //   const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
  //   if (!currentWatchlist) return;
  //
  //   // This would typically open a dialog or form with the current data
  //   // For now, we'll just update the description
  //   const updatedWatchlist = {
  //     ...currentWatchlist,
  //     description: `${currentWatchlist.description} (updated)`
  //   };
  //
  //   this.watchlistService.updateWatchlist(currentWatchlist.id, updatedWatchlist).subscribe({
  //     next: (updated) => {
  //       // Update the watchlist in the array
  //       this.watchlists[this.getCurrentWatchlistIndex()] = updated;
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
  //
  // deleteWatchlist(watchlist: Watchlist | null): void {
  //   if (!watchlist) return;
  //
  //   this.watchlistService.deleteWatchlist(watchlist.id).subscribe({
  //     next: () => {
  //       // Get the index of the deleted watchlist
  //       const deletedIndex = this.watchlists.findIndex(w => w.id === watchlist.id);
  //
  //       // Remove from the list
  //       this.watchlists = this.watchlists.filter(w => w.id !== watchlist.id);
  //
  //       // Adjust the active tab index if needed
  //       if (this.watchlists.length > 0) {
  //         // If we deleted the last tab or a tab before the current one, adjust the active index
  //         if (deletedIndex <= this.getCurrentWatchlistIndex()) {
  //           this.activeTab = Math.max(0, this.getCurrentWatchlistIndex() - 1).toString();
  //         }
  //       } else {
  //         // No watchlists left
  //         this.activeTab = '0';
  //       }
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
  //
  // addSymbol(): void {
  //   // Get the current watchlist from the active tab
  //   const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
  //   if (!currentWatchlist) return;
  //
  //   // This would typically open a dialog to search for and select a symbol
  //   // For now, we'll just add a placeholder symbol
  //   const symbol = 'NFLX'; // Example symbol
  //
  //   this.watchlistService.addSymbol(currentWatchlist.id, symbol).subscribe({
  //     next: (updated) => {
  //       // Update the watchlist in the array
  //       this.watchlists[this.getCurrentWatchlistIndex()] = updated;
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
  //
  // removeSymbol(item: WatchlistItem): void {
  //   // Get the current watchlist from the active tab
  //   const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
  //   if (!currentWatchlist) return;
  //
  //   this.watchlistService.removeSymbol(currentWatchlist.id, item.symbol).subscribe({
  //     next: (updated) => {
  //       // Update the watchlist in the array
  //       this.watchlists[this.getCurrentWatchlistIndex()] = updated;
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }

  // No longer needed with tab-based interface
  // Kept for backward compatibility
  // backToList(): void {
  //   // Reset the active tab index
  //   this.activeTab = '0';
  // }
  //
  // /**
  //  * Search for stocks by symbol or name
  //  * @param query The search query
  //  */
  // searchStocks(query: string): void {
  //   if (!query || query.trim() === '') {
  //     this.searchResults = [];
  //     return;
  //   }
  //
  //   this.isSearching = true;
  //   this.marketService.searchStocks(query).subscribe({
  //     next: (results) => {
  //       this.searchResults = results;
  //       this.isSearching = false;
  //     },
  //     error: (error) => {
  //       this.isSearching = false;
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
  //
  // /**
  //  * Add a stock from search results to the current watchlist
  //  * @param stock The stock to add
  //  */
  // addStockFromSearch(stock: MarketData): void {
  //   // Get the current watchlist from the active tab
  //   const currentWatchlist = this.watchlists[this.getCurrentWatchlistIndex()];
  //   if (!currentWatchlist) return;
  //
  //   this.watchlistService.addSymbol(currentWatchlist.id, stock.symbol).subscribe({
  //     next: (updated) => {
  //       // Update the watchlist in the array
  //       this.watchlists[this.getCurrentWatchlistIndex()] = updated;
  //       // Optionally clear search results or show a success message
  //       this.searchResults = [];
  //       this.searchQuery = '';
  //     },
  //     error: (error) => {
  //       // Handle error (e.g., show a notification)
  //     }
  //   });
  // }
}
