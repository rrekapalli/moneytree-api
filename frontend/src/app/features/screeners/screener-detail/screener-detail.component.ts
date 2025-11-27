import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ScreenerStateService } from '../../../services/state/screener.state';
import { ScreenerApiService } from '../../../services/apis/screener.api';
import { 
  ScreenerResp, 
  ScreenerVersionResp, 
  RunResp, 
  ResultResp,
  ScreenerVersionCreateReq,
  RunCreateReq
} from '../../../services/entities/screener.entities';

@Component({
  selector: 'app-screener-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TabsModule,
    TableModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './screener-detail.component.html',
  styleUrl: './screener-detail.component.scss'
})
export class ScreenerDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State
  screener: ScreenerResp | null = null;
  versions: ScreenerVersionResp[] = [];
  runs: RunResp[] = [];
  currentRun: RunResp | null = null;
  runResults: ResultResp[] = [];
  loading = false;
  error: string | null = null;
  
  // UI State
  activeTab = 'overview';
  showCreateVersionDialog = false;
  showRunDialog = false;
  showResultsDialog = false;
  
  // Forms
  versionForm: ScreenerVersionCreateReq = {
    versionNumber: 1,
    engine: 'SQL',
    compiledSql: '',
    paramsSchemaJson: {}
  };
  
  runForm: RunCreateReq = {
    screenerVersionId: '',
    runForTradingDay: new Date().toISOString().split('T')[0],
    universeSymbolIds: []
  };

  // Tabs
  tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Versions', value: 'versions' },
    { label: 'Runs', value: 'runs' },
    { label: 'Results', value: 'results' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private screenerState: ScreenerStateService,
    private screenerApi: ScreenerApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadScreener();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    combineLatest([
      this.screenerState.currentScreener$,
      this.screenerState.screenerVersions$,
      this.screenerState.screenerRuns$,
      this.screenerState.currentRun$,
      this.screenerState.runResults$,
      this.screenerState.loading$,
      this.screenerState.error$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([screener, versions, runs, currentRun, runResults, loading, error]) => {
      this.screener = screener;
      this.versions = versions;
      this.runs = runs;
      this.currentRun = currentRun;
      this.runResults = runResults;
      this.loading = loading;
      this.error = error;
    });
  }

  private loadScreener() {
    const screenerId = this.route.snapshot.paramMap.get('id');
    if (screenerId) {
      this.screenerState.loadScreener(screenerId).subscribe({
        next: () => {
          this.loadVersions();
          this.loadRuns();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load screener details'
          });
        }
      });
    }
  }

  private loadVersions() {
    if (this.screener) {
      this.screenerState.loadScreenerVersions(this.screener.screenerId).subscribe();
    }
  }

  private loadRuns() {
    if (this.screener) {
      this.screenerState.loadScreenerRuns(this.screener.screenerId).subscribe();
    }
  }

  onTabChange(tab: any) {
    this.activeTab = tab.value;
    
    if (tab.value === 'results' && this.runs.length > 0 && !this.currentRun) {
      this.currentRun = this.runs[0];
      this.loadRunResults();
    }
  }

  createVersion() {
    if (this.screener) {
      this.versionForm.versionNumber = this.versions.length + 1;
      this.showCreateVersionDialog = true;
    }
  }

  saveVersion() {
    if (!this.screener) return;

    this.screenerApi.createVersion(this.screener.screenerId, this.versionForm).subscribe({
      next: () => {
        this.showCreateVersionDialog = false;
        this.loadVersions();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Version created successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create version'
        });
      }
    });
  }

  runScreener() {
    if (this.screener && this.versions.length > 0) {
      this.runForm.screenerVersionId = this.versions[0].screenerVersionId;
      this.showRunDialog = true;
    }
  }

  executeRun() {
    if (!this.screener) return;

    this.screenerApi.createRun(this.screener.screenerId, this.runForm).subscribe({
      next: () => {
        this.showRunDialog = false;
        this.loadRuns();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Screener run started'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to start screener run'
        });
      }
    });
  }

  viewResults(run: RunResp) {
    this.currentRun = run;
    this.screenerState.setCurrentRun(run);
    this.loadRunResults();
    this.showResultsDialog = true;
  }

  loadRunResults() {
    if (this.currentRun) {
      this.screenerState.loadRunResults(this.currentRun.screenerRunId).subscribe();
    }
  }

  retryRun(run: RunResp) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to retry this run?',
      header: 'Confirm Retry',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerApi.retryRun(run.screenerRunId).subscribe({
          next: () => {
            this.loadRuns();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Run retry initiated'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to retry run'
            });
          }
        });
      }
    });
  }

  deleteScreener() {
    if (!this.screener) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${this.screener.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerState.deleteScreener(this.screener!.screenerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener deleted successfully'
            });
            this.router.navigate(['/screeners']);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete screener'
            });
          }
        });
      }
    });
  }

  editScreener() {
    if (this.screener) {
      this.router.navigate(['/screeners', this.screener.screenerId, 'edit']);
    }
  }

  goBack() {
    this.router.navigate(['/screeners']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'RUNNING':
        return 'info';
      case 'FAILED':
        return 'danger';
      case 'PENDING':
        return 'warn';
      default:
        return 'info';
    }
  }

  getVersionStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warn';
      case 'ARCHIVED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getDuration(startedAt: string, finishedAt: string): string {
    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    const diffMs = end.getTime() - start.getTime();
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getSuccessfulRunsCount(): number {
    return this.runs.filter((r: RunResp) => r.status === 'SUCCESS').length;
  }

  getFailedRunsCount(): number {
    return this.runs.filter((r: RunResp) => r.status === 'FAILED').length;
  }

  cancelDialog() {
    this.showCreateVersionDialog = false;
    this.showRunDialog = false;
    this.showResultsDialog = false;
  }
}
