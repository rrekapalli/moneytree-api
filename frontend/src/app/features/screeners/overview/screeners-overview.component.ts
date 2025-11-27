import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ScreenerResp } from '../../../services/entities/screener.entities';

@Component({
  selector: 'app-screeners-overview',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './screeners-overview.component.html',
  styleUrl: './screeners-overview.component.scss'
})
export class ScreenersOverviewComponent {
  @Input() screeners: ScreenerResp[] = [];
  @Input() starredScreeners: ScreenerResp[] = [];

  @Output() runScreener = new EventEmitter<ScreenerResp>();
  @Output() viewResults = new EventEmitter<ScreenerResp>();
  @Output() configureScreener = new EventEmitter<ScreenerResp>();
  @Output() deleteScreener = new EventEmitter<ScreenerResp>();
  @Output() toggleStar = new EventEmitter<ScreenerResp>();

  trackScreenerById(index: number, screener: ScreenerResp): number {
    return screener.screenerId;
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isStarred(screener: ScreenerResp): boolean {
    return this.starredScreeners.some(s => s.screenerId === screener.screenerId);
  }

  onRunScreener(screener: ScreenerResp): void {
    this.runScreener.emit(screener);
  }

  onViewResults(screener: ScreenerResp): void {
    this.viewResults.emit(screener);
  }

  onConfigureScreener(screener: ScreenerResp): void {
    this.configureScreener.emit(screener);
  }

  onDeleteScreener(screener: ScreenerResp): void {
    this.deleteScreener.emit(screener);
  }

  onToggleStar(screener: ScreenerResp): void {
    this.toggleStar.emit(screener);
  }
}