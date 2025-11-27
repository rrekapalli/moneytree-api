import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MarketStateService } from '../../services/state/market.state';
import { MarketData } from '../../services/entities/market-data';
import { MarketSummary } from '../../services/entities/market-summary';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, PageHeaderComponent],
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {
  selectedMarketId: string | null = null;

  // Market data
  marketSummary: MarketSummary[] = [];
  topGainers: MarketData[] = [];
  topLosers: MarketData[] = [];
  mostActive: MarketData[] = [];
  selectedStock: MarketData | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private marketState: MarketStateService
  ) {
    this.route.params.subscribe(params => {
      this.selectedMarketId = params['id'] || null;
      if (this.selectedMarketId) {
        this.loadStockDetails(this.selectedMarketId);
      }
    });
  }

  ngOnInit(): void {
    this.loading = true;

    // Load market data
    this.loadMarketData();
  }

  loadMarketData(): void {
    // Load market summary
    this.marketState.getMarketSummary().subscribe({
      next: (data) => {
        this.marketSummary = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load market summary';
        this.loading = false;
      }
    });

    // Load top gainers
    this.marketState.getTopGainers().subscribe({
      next: (data) => {
        this.topGainers = data;
      },
      error: (err) => {
        // Failed to load top gainers
      }
    });

    // Load top losers
    this.marketState.getTopLosers().subscribe({
      next: (data) => {
        this.topLosers = data;
      },
      error: (err) => {
        // Failed to load top losers
      }
    });

    // Load most active
    this.marketState.getMostActive().subscribe({
      next: (data) => {
        this.mostActive = data;
      },
      error: (err) => {
        // Failed to load most active stocks
      }
    });
  }

  loadStockDetails(symbol: string): void {
    this.loading = true;
    this.marketState.getStockDetails(symbol).subscribe({
      next: (data) => {
        this.selectedStock = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Failed to load details for ${symbol}`;
        this.loading = false;
      }
    });
  }

  viewStockDetails(symbol: string): void {
    this.router.navigate(['/market', symbol]);
  }

  onEdit(): void {
    // Handle edit functionality
  }

  onDelete(): void {
    // Handle delete functionality
  }

  backToList(): void {
    this.router.navigate(['/market']);
  }
}
