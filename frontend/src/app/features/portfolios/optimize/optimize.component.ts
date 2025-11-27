import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';

@Component({
  selector: 'app-portfolio-optimize',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    FormsModule
  ],
  templateUrl: './optimize.component.html',
  styleUrls: ['./optimize.component.scss']
})
export class PortfolioOptimizeComponent {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;

  @Output() applyOptimization = new EventEmitter<PortfolioWithMetrics>();

  // Utility methods for performance display
  formatReturn(value: number): string {
    if (value === undefined || value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  getPerformanceColor(value: number): string {
    if (value === undefined || value === null) return 'var(--text-color-secondary)';
    return value >= 0 ? 'var(--green-600)' : 'var(--red-600)';
  }

  onApplyOptimization(): void {
    if (this.selectedPortfolio) {
      this.applyOptimization.emit(this.selectedPortfolio);
    }
  }
}
