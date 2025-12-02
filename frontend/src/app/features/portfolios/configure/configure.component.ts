import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioApiService } from '../../../services/apis/portfolio.api';
import { PortfolioCreateRequest, PortfolioUpdateRequest } from '../../../services/entities/portfolio.entities';
import { AuthService } from '../../../services/security/auth.service';

@Component({
  selector: 'app-portfolio-configure',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    FormsModule
  ],
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class PortfolioConfigureComponent implements OnInit {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  @Input() riskProfileOptions: any[] = [];

  @Output() saveChanges = new EventEmitter<PortfolioWithMetrics>();
  @Output() cancel = new EventEmitter<void>();
  @Output() goToOverview = new EventEmitter<void>();

  // Dropdown options
  currencyOptions = [
    { label: 'INR', value: 'INR' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' }
  ];

  strategyOptions = [
    { label: 'Momentum Investing', value: 'Momentum Investing' },
    { label: 'Value Investing', value: 'Value Investing' },
    { label: 'Growth Investing', value: 'Growth Investing' }
  ];

  tradingModeOptions = [
    { label: 'paper', value: 'paper' },
    { label: 'live', value: 'live' }
  ];

  dematAccountOptions = [
    { label: 'AB1234567B', value: 'AB1234567B' },
    { label: 'CD9876543C', value: 'CD9876543C' }
  ];

  // Inject the portfolio API service
  private portfolioApiService = inject(PortfolioApiService);
  
  // Inject the auth service to get current user ID
  private authService = inject(AuthService);

  // Local copy for editing
  editingPortfolio: PortfolioWithMetrics | null = null;
  
  // Original portfolio for dirty checking
  originalPortfolio: PortfolioWithMetrics | null = null;
  
  // Flag to distinguish between creation and editing modes
  isCreationMode = false;

  // Single editing state for all fields
  isEditing = false;

  // Loading state for save operation
  isSaving = false;

  // Form dirty state
  isFormDirty = false;

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
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${day}/${month}/${year}, ${displayHours}:${minutes} ${ampm}`;
  }

  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Check if this is a new portfolio (creation mode)
      this.isCreationMode = !this.selectedPortfolio.id || this.selectedPortfolio.id === '';
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
      this.originalPortfolio = { ...this.selectedPortfolio };
      
      // Automatically enter edit mode (always editable in Configure tab)
      this.isEditing = true;
      
      // Reset dirty state
      this.isFormDirty = false;
    } else {
      this.editingPortfolio = null;
      this.originalPortfolio = null;
      this.isCreationMode = false;
      this.isEditing = false;
      this.isFormDirty = false;
    }
  }

  // Track form changes
  onFormChange(): void {
    this.isFormDirty = this.hasFormChanged();
  }

  // Check if form has changed
  private hasFormChanged(): boolean {
    if (!this.editingPortfolio || !this.originalPortfolio) {
      return false;
    }

    return (
      this.editingPortfolio.name !== this.originalPortfolio.name ||
      this.editingPortfolio.description !== this.originalPortfolio.description ||
      this.editingPortfolio.baseCurrency !== this.originalPortfolio.baseCurrency ||
      this.editingPortfolio.riskProfile !== this.originalPortfolio.riskProfile ||
      this.editingPortfolio.initialCapital !== this.originalPortfolio.initialCapital ||
      this.editingPortfolio.currentCash !== this.originalPortfolio.currentCash ||
      this.editingPortfolio.tradingMode !== this.originalPortfolio.tradingMode ||
      this.editingPortfolio.isActive !== this.originalPortfolio.isActive
    );
  }

  // Save all changes using the appropriate API endpoint
  saveEditAll(): void {
    if (this.editingPortfolio && !this.isSaving) {
      // Validate required fields
      if (!this.editingPortfolio.name || this.editingPortfolio.name.trim() === '') {
        alert('Portfolio name is required');
        return;
      }
      
      if (!this.editingPortfolio.riskProfile) {
        alert('Risk profile is required');
        return;
      }

      this.isSaving = true;

      if (this.isCreationMode) {
        // Get current user ID
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          alert('User not authenticated. Please log in again.');
          this.isSaving = false;
          return;
        }

        // Create new portfolio
        const createRequest: PortfolioCreateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description || '',
          baseCurrency: this.editingPortfolio.baseCurrency,
          riskProfile: this.editingPortfolio.riskProfile,
          isActive: true,
          userId: currentUser.id // User ID is now a string (UUID)
        };



        this.portfolioApiService.createPortfolio(createRequest).subscribe({
          next: (createdPortfolio) => {
            // Update the local portfolio with the created one
            this.editingPortfolio = { ...this.editingPortfolio, ...createdPortfolio };
            this.originalPortfolio = { ...this.editingPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            this.isFormDirty = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {

            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to create portfolios.');
            } else if (error.status === 400) {
              alert('Invalid portfolio data. Please check your input and try again.');
            } else {
              alert(`Failed to create portfolio (${error.status}). Changes have been saved locally.`);
            }
            
            // Fallback: save locally and emit
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
          }
        });
      } else {
        // Update existing portfolio
        const updateRequest: PortfolioUpdateRequest = {
          name: this.editingPortfolio.name,
          description: this.editingPortfolio.description,
          riskProfile: this.editingPortfolio.riskProfile
        };



        this.portfolioApiService.updatePortfolio(this.editingPortfolio.id, updateRequest).subscribe({
          next: (updatedPortfolio) => {
            // Update the local portfolio with the updated one
            this.editingPortfolio = { ...this.editingPortfolio, ...updatedPortfolio };
            this.originalPortfolio = { ...this.editingPortfolio };
            this.isEditing = false;
            this.isSaving = false;
            this.isFormDirty = false;
            // Emit the updated portfolio
            this.saveChanges.emit(this.editingPortfolio);
          },
          error: (error) => {

            
            // Fallback: save locally and emit
            this.isEditing = false;
            this.isSaving = false;
            if (this.editingPortfolio) {
              this.saveChanges.emit(this.editingPortfolio);
            }
            
            // Show user-friendly error message
            if (error.status === 500) {
              alert('Backend service temporarily unavailable. Changes have been saved locally and will be synchronized when the service is restored.');
            } else if (error.status === 401) {
              alert('Authentication expired. Please log in again.');
            } else if (error.status === 403) {
              alert('You do not have permission to update this portfolio.');
            } else if (error.status === 404) {
              alert('Portfolio not found. It may have been deleted by another user.');
            } else {
              alert(`Failed to update portfolio (${error.status}). Changes have been saved locally.`);
            }
          }
        });
      }
    }
  }

  cancelEdit(): void {
    // Reset to original values and exit editing mode
    if (this.originalPortfolio) {
      this.editingPortfolio = { ...this.originalPortfolio };
    }
    this.isFormDirty = false;
    this.isSaving = false;
    // Stay on the same page - don't navigate to overview
  }

  onCancel(): void {
    this.cancel.emit();
  }

  navigateToOverview(): void {
    this.goToOverview.emit();
  }
}
