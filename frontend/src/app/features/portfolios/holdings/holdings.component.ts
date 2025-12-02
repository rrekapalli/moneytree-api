import { Component, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioHolding } from '../../../services/entities/portfolio.entities';

interface HoldingEditForm {
  quantity: number;
  avgCost: number;
  takeProfit: number | null;
  stopLoss: number | null;
}

@Component({
  selector: 'app-portfolio-holdings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
    ButtonModule,
    InputNumberModule
  ],
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.scss']
})
export class PortfolioHoldingsComponent implements OnInit, OnChanges {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  @Input() holdings: PortfolioHolding[] = [];
  @Input() holdingsLoading = false;
  @Input() holdingsError: string | null = null;
  @Output() holdingUpdated = new EventEmitter<{ symbol: string; data: HoldingEditForm }>();

  editForms: Map<string, HoldingEditForm> = new Map();
  originalForms: Map<string, HoldingEditForm> = new Map();
  activeAccordionValue: number | null = null; // Control which accordion panel is open

  ngOnInit(): void {
    this.initializeEditForms();
  }

  ngOnChanges(): void {
    this.initializeEditForms();
  }

  initializeEditForms(): void {
    this.editForms.clear();
    this.originalForms.clear();
    this.holdings.forEach(holding => {
      const formData = {
        quantity: holding.quantity || 0,
        avgCost: holding.avgCost || 0,
        takeProfit: holding.takeProfit || null,
        stopLoss: holding.stopLoss || null
      };
      this.editForms.set(holding.symbol, { ...formData });
      this.originalForms.set(holding.symbol, { ...formData });
    });
  }

  getEditForm(symbol: string): HoldingEditForm {
    return this.editForms.get(symbol) || {
      quantity: 0,
      avgCost: 0,
      takeProfit: null,
      stopLoss: null
    };
  }

  calculateUnrealizedPnL(holding: PortfolioHolding): number {
    if (!holding.lastPositionValue || !holding.openPrincipal) {
      return 0;
    }
    return holding.lastPositionValue - holding.openPrincipal;
  }

  calculateUnrealizedPnLPct(holding: PortfolioHolding): number {
    if (!holding.openPrincipal || holding.openPrincipal === 0) {
      return 0;
    }
    const unrealizedPnL = this.calculateUnrealizedPnL(holding);
    return (unrealizedPnL / holding.openPrincipal) * 100;
  }

  onSaveHolding(holding: PortfolioHolding): void {
    const form = this.getEditForm(holding.symbol);
    this.holdingUpdated.emit({
      symbol: holding.symbol,
      data: form
    });
  }

  isFormDirty(symbol: string): boolean {
    const currentForm = this.editForms.get(symbol);
    const originalForm = this.originalForms.get(symbol);
    
    if (!currentForm || !originalForm) {
      return false;
    }

    return (
      currentForm.quantity !== originalForm.quantity ||
      currentForm.avgCost !== originalForm.avgCost ||
      currentForm.takeProfit !== originalForm.takeProfit ||
      currentForm.stopLoss !== originalForm.stopLoss
    );
  }

  onResetForm(holding: PortfolioHolding): void {
    const originalForm = this.originalForms.get(holding.symbol);
    if (originalForm) {
      this.editForms.set(holding.symbol, { ...originalForm });
    }
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
