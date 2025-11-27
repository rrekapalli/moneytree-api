import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ScreenerStateService } from '../../../services/state/screener.state';
import { ScreenerApiService } from '../../../services/apis/screener.api';
import { ScreenerResp } from '../../../services/entities/screener.entities';
import { ScreenersOverviewComponent } from '../overview';
import { ScreenersConfigureComponent } from '../configure';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-screeners-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, ButtonModule, TableModule, CardModule,
    TabsModule, DialogModule, ConfirmDialogModule, ToastModule, InputTextModule,
    PaginatorModule, TagModule, TooltipModule, CheckboxModule, MessageModule,
    SelectModule, ScreenersOverviewComponent, ScreenersConfigureComponent, PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './screeners-list.component.html',
  styleUrl: './screeners-list.component.scss'
})
export class ScreenersListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // State properties
  screeners: ScreenerResp[] = [];
  myScreeners: ScreenerResp[] = [];
  publicScreeners: ScreenerResp[] = [];
  starredScreeners: ScreenerResp[] = [];
  filteredScreeners: ScreenerResp[] = [];
  loading = true;
  error: string | null = null;  
  searchQuery = '';
  dataLoaded = false;
  
  // Pagination
  pagination = {
    page: 0,
    size: 25,
    totalElements: 0,
    totalPages: 0
  };

  // UI State
  selectedScreener: ScreenerResp | null = null;
  activeTabIndex: string = "0";
  
  // Filter options
  selectedVisibility: string | null = null;
  selectedCategory: string | null = null;

  // Summary statistics
  get totalScreeners(): number {
    return this.screeners.length;
  }

  get activeScreeners(): number {
    return this.screeners.length; // Assuming all screeners are active for now
  }

  get publicScreenersCount(): number {
    return this.screeners.filter(s => s.isPublic).length;
  }

  get privateScreeners(): number {
    return this.screeners.filter(s => !s.isPublic).length;
  }

  get starredScreenersCount(): number {
    return this.starredScreeners.length;
  }
  
  visibilityOptions = [
    { label: 'All Visibility', value: null },
    { label: 'Public', value: 'public' },
    { label: 'Private', value: 'private' }
  ];
  
  categoryOptions = [
    { label: 'All Categories', value: null },
    { label: 'Technical', value: 'technical' },
    { label: 'Fundamental', value: 'fundamental' },
    { label: 'Custom', value: 'custom' }
  ];

  constructor(
    private screenerState: ScreenerStateService,
    private screenerApi: ScreenerApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions() {
    combineLatest([
      this.screenerState.screeners$,
      this.screenerState.myScreeners$,
      this.screenerState.publicScreeners$,
      this.screenerState.starredScreeners$,
      this.screenerState.loading$,
      this.screenerState.error$,
      this.screenerState.pagination$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([screeners, myScreeners, publicScreeners, starredScreeners, loading, error, pagination]) => {
      this.screeners = screeners;
      this.myScreeners = myScreeners;
      this.publicScreeners = publicScreeners;
      this.starredScreeners = starredScreeners;
      this.loading = loading;
      this.error = error;
      this.pagination = pagination;
      
      // Mark data as loaded when we're not loading and have received the first response
      if (!loading) {
        this.dataLoaded = true;
      }
      
      this.updateFilteredScreeners();
    });
  }  

  private loadInitialData() {
    this.loadScreeners();
    this.loadMyScreeners();
    this.loadPublicScreeners();
    this.loadStarredScreeners();
  }

  loadScreeners() {
    const params = {
      q: this.searchQuery || undefined,
      page: this.pagination.page,
      size: this.pagination.size
    };
    this.screenerState.loadScreeners(params).subscribe();
  }

  loadMyScreeners() {
    this.screenerState.loadMyScreeners().subscribe();
  }

  loadPublicScreeners() {
    this.screenerState.loadPublicScreeners().subscribe();
  }

  loadStarredScreeners() {
    this.screenerState.loadStarredScreeners().subscribe();
  }

  onSearch() {
    this.pagination.page = 0;
    this.updateFilteredScreeners();
    this.loadScreeners();
  }

  onPageChange(event: any) {
    this.pagination.page = event.page;
    this.pagination.size = event.rows;
    this.loadScreeners();
  }

  onTabChange(index: string | number | undefined): void {
    if (index !== undefined) {
      this.activeTabIndex = typeof index === 'string' ? index : index.toString();
      
      // Clear selection when switching back to overview tab
      if (this.activeTabIndex === "0") {
        this.clearSelection();
      }
    }
  }

  updateFilteredScreeners(): void {
    let filtered = [...this.screeners];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(screener =>
        screener.name.toLowerCase().includes(query) ||
        (screener.description && screener.description.toLowerCase().includes(query))
      );
    }

    if (this.selectedVisibility) {
      filtered = filtered.filter(screener => {
        if (this.selectedVisibility === 'public') return screener.isPublic;
        if (this.selectedVisibility === 'private') return !screener.isPublic;
        return true;
      });
    }

    this.filteredScreeners = filtered;
  }
  
  getFilteredScreeners(): ScreenerResp[] {
    return this.filteredScreeners;
  }

  onFilterChange(): void {
    this.updateFilteredScreeners();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedVisibility = null;
    this.selectedCategory = null;
    this.updateFilteredScreeners();
  }

  trackScreenerById(_index: number, screener: ScreenerResp): string {
    return screener.screenerId;
  }

  runScreener(screener: ScreenerResp) {
    this.messageService.add({
      severity: 'info',
      summary: 'Running Screener',
      detail: `Running screener: ${screener.name}`
    });
  }

  viewResults(screener: ScreenerResp) {
    this.router.navigate(['/screeners', screener.screenerId]);
  }

  createScreener() {
    this.router.navigate(['/screeners/new']);
  }

  configureScreener(screener: ScreenerResp) {
    this.selectedScreener = screener;
    this.activeTabIndex = "1";
  }
  
  clearSelection(): void {
    this.selectedScreener = null;
  }

  deleteScreener(screener: ScreenerResp) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${screener.name}"?`,
      header: 'Delete Screener',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.screenerApi.deleteScreener(screener.screenerId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Screener deleted successfully'
            });
            this.loadScreeners();
          },
          error: () => {
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

  toggleStar(screener: ScreenerResp) {
    const isCurrentlyStarred = this.isStarred(screener);
    const action = isCurrentlyStarred ? 'unstar' : 'star';
    
    this.screenerApi.toggleStar(screener.screenerId, { starred: !isCurrentlyStarred }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Screener ${action}red successfully`
        });
        this.loadStarredScreeners();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${action} screener`
        });
      }
    });
  }

  isStarred(screener: ScreenerResp): boolean {
    return this.starredScreeners.some(s => s.screenerId === screener.screenerId);
  }  

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
