import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioTrade } from '../../../services/entities/portfolio.entities';

@Component({
  selector: 'app-portfolio-trades',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule
  ],
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})
export class PortfolioTradesComponent implements OnInit {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  @Input() trades: PortfolioTrade[] = [];
  @Input() tradesLoading = false;
  @Input() tradesError: string | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  // Format date for display - handles both ISO strings and epoch timestamps
  formatDate(dateValue: any): string {
    if (!dateValue) {
      return '-';
    }

    let date: Date;

    // If it's a number (epoch timestamp)
    if (typeof dateValue === 'number') {
      // If the number is less than a reasonable year 2000 timestamp in milliseconds,
      // it's likely in seconds, so convert to milliseconds
      if (dateValue < 10000000000) {
        date = new Date(dateValue * 1000);
      } else {
        date = new Date(dateValue);
      }
    } else if (typeof dateValue === 'string') {
      // Try parsing as ISO string
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return '-';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }

    // Format the date manually
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}
