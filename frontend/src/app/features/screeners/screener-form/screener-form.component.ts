import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../../services/state/screener.state';
import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-screener-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    TabsModule,
    PageHeaderComponent,
  ],
  providers: [MessageService],
  templateUrl: './screener-form.component.html',
  styleUrl: './screener-form.component.scss'
})
export class ScreenerFormComponent implements OnInit, OnDestroy {
  /** Subscription management for component cleanup */
  private destroy$ = new Subject<void>();

  // === Component State ===
  screener: ScreenerResp | null = null;
  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  // === UI State ===
  loading = false;
  isEdit = false;
  activeTab = 'basic';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screenerStateService: ScreenerStateService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component subscriptions
   */
  private initializeSubscriptions(): void {
    // Subscribe to route parameters to determine if editing
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const screenerId = params['id'];
      if (screenerId) {
        this.isEdit = true;
        this.loadScreener(screenerId);
      } else {
        this.isEdit = false;
        this.initializeNewScreener();
      }
    });
  }

  /**
   * Load existing screener for editing
   */
  private loadScreener(screenerId: string): void {
    this.loading = true;
    this.screenerStateService.loadScreener(screenerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (screener: ScreenerResp) => {
          this.screener = screener;
          this.initializeFormFromScreener(screener);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Failed to load screener:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load screener'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Initialize form with existing screener data
   */
  private initializeFormFromScreener(screener: ScreenerResp): void {
            this.screenerForm = {
              name: screener.name,
              description: screener.description || '',
              isPublic: screener.isPublic,
              defaultUniverse: screener.defaultUniverse || '',
              criteria: screener.criteria
            };
  }

  /**
   * Initialize form for new screener
   */
  private initializeNewScreener(): void {
    this.screenerForm = {
      name: '',
      description: '',
      isPublic: false,
      defaultUniverse: '',
      criteria: undefined
    };
    this.screener = null;
  }

  /**
   * Handle tab change
   */
  onTabChange(tab: string | number | undefined): void {
    if (typeof tab === 'string') {
      this.activeTab = tab;
    }
  }

  /**
   * Save screener
   */
  saveScreener(): void {
    if (!this.screenerForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Screener name is required'
      });
      return;
    }

    this.loading = true;

    if (this.isEdit && this.screener) {
      // Update existing screener
      this.screenerStateService.updateScreener(this.screener.screenerId, this.screenerForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener updated successfully'
            });
            this.router.navigate(['/screeners']);
          },
          error: (error) => {
            console.error('Failed to update screener:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update screener'
            });
            this.loading = false;
          }
        });
    } else {
      // Create new screener
      this.screenerStateService.createScreener(this.screenerForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener created successfully'
        });
        this.router.navigate(['/screeners']);
      },
          error: (error) => {
            console.error('Failed to create screener:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create screener'
        });
            this.loading = false;
          }
        });
    }
  }

  /**
   * Cancel and navigate back
   */
  cancel(): void {
    this.router.navigate(['/screeners']);
  }

  /**
   * Clear all criteria
   */
  clearCriteria(): void {
      this.screenerForm.criteria = undefined;
      this.messageService.add({
        severity: 'info',
        summary: 'Criteria Cleared',
      detail: 'All criteria have been cleared'
      });
  }

  /**
   * Check if criteria exists
   */
  hasCriteria(): boolean {
    return !!this.screenerForm.criteria;
  }

  /**
   * Get criteria count
   */
  getCriteriaCount(): number {
    // Simple implementation - return 0 for now
    return 0;
  }

  /**
   * Handle validity change (placeholder for future implementation)
   */
  onValidityChange(isValid: boolean): void {
    // Placeholder method for future implementation
  }
}