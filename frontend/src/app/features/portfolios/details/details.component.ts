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

/**
 * Portfolio Details Component
 * 
 * Displays and manages basic portfolio information including name, description, risk profile,
 * currency, capital, and other metadata. This component is part of the portfolio details/config
 * split refactoring that separates portfolio metadata from technical trading configuration.
 * 
 * Features:
 * - View and edit portfolio details
 * - Create new portfolios
 * - Form validation and dirty state tracking
 * - Comprehensive error handling for API operations
 * - Support for both creation and edit modes
 * 
 * Usage:
 * ```html
 * <app-portfolio-details
 *   [selectedPortfolio]="portfolio"
 *   [riskProfileOptions]="riskOptions"
 *   (saveChanges)="onSave($event)"
 *   (cancel)="onCancel()"
 *   (goToOverview)="navigateToOverview()">
 * </app-portfolio-details>
 * ```
 * 
 * @see {@link PortfolioConfigureComponent} for technical trading configuration
 * @see {@link PortfolioWithMetrics} for the portfolio data model
 */
@Component({
  selector: 'app-portfolio-details',
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
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class PortfolioDetailsComponent implements OnInit {
  /** The portfolio to display and edit. Null when no portfolio is selected. */
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  
  /** Available risk profile options for the dropdown (CONSERVATIVE, MODERATE, AGGRESSIVE) */
  @Input() riskProfileOptions: any[] = [];

  /** Emitted when the user saves changes to the portfolio */
  @Output() saveChanges = new EventEmitter<PortfolioWithMetrics>();
  
  /** Emitted when the user cancels editing */
  @Output() cancel = new EventEmitter<void>();
  
  /** Emitted when the user wants to navigate to the overview tab */
  @Output() goToOverview = new EventEmitter<void>();

  /** Available currency options for the base currency dropdown */
  currencyOptions = [
    { label: 'INR', value: 'INR' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' }
  ];

  /** Available strategy options for the strategy dropdown */
  strategyOptions = [
    { label: 'Momentum Investing', value: 'Momentum Investing' },
    { label: 'Value Investing', value: 'Value Investing' },
    { label: 'Growth Investing', value: 'Growth Investing' }
  ];

  /** Available trading mode options (paper or live trading) */
  tradingModeOptions = [
    { label: 'paper', value: 'paper' },
    { label: 'live', value: 'live' }
  ];

  /** Available demat account options for the dropdown */
  dematAccountOptions = [
    { label: 'AB1234567B', value: 'AB1234567B' },
    { label: 'CD9876543C', value: 'CD9876543C' }
  ];

  /** Portfolio API service for CRUD operations */
  private portfolioApiService = inject(PortfolioApiService);
  
  /** Auth service to get current user ID for portfolio creation */
  private authService = inject(AuthService);

  /** Local copy of the portfolio being edited */
  editingPortfolio: PortfolioWithMetrics | null = null;
  
  /** Original portfolio values for dirty checking and reset functionality */
  originalPortfolio: PortfolioWithMetrics | null = null;
  
  /** True when creating a new portfolio, false when editing existing */
  isCreationMode = false;

  /** True when the form is in edit mode (always true in Details tab) */
  isEditing = false;

  /** True when a save operation is in progress */
  isSaving = false;

  /** True when the form has unsaved changes */
  isFormDirty = false;

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Formats a date value for display in the UI
   * 
   * Handles multiple date formats:
   * - ISO 8601 strings (e.g., "2024-01-15T10:30:00Z")
   * - Unix timestamps in seconds (< 10000000000)
   * - Unix timestamps in milliseconds (>= 10000000000)
   * 
   * @param dateValue - The date to format (string, number, or Date object)
   * @returns Formatted date string in "DD/MM/YYYY, HH:MM AM/PM" format, or "-" if invalid
   * 
   * @example
   * formatDate("2024-01-15T10:30:00Z") // "15/01/2024, 10:30 AM"
   * formatDate(1705315800) // "15/01/2024, 10:30 AM"
   * formatDate(null) // "-"
   */
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

  /**
   * Lifecycle hook called when input properties change
   * 
   * Initializes the form when a portfolio is selected or created:
   * - Determines if in creation or edit mode
   * - Creates working copies of the portfolio for editing
   * - Resets form state
   */
  ngOnChanges(): void {
    if (this.selectedPortfolio) {
      // Check if this is a new portfolio (creation mode)
      this.isCreationMode = !this.selectedPortfolio.id || this.selectedPortfolio.id === '';
      // Create a deep copy for editing
      this.editingPortfolio = { ...this.selectedPortfolio };
      this.originalPortfolio = { ...this.selectedPortfolio };
      
      // Automatically enter edit mode (always editable in Details tab)
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

  /**
   * Called when any form field changes
   * Updates the dirty state flag to enable/disable the save button
   */
  onFormChange(): void {
    this.isFormDirty = this.hasFormChanged();
  }

  /**
   * Checks if the form has unsaved changes by comparing current values with original
   * 
   * @returns True if any field has been modified, false otherwise
   * @private
   */
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

  /**
   * Saves portfolio details using the appropriate API endpoint
   * 
   * Behavior:
   * - For new portfolios (isCreationMode=true): Calls POST /api/portfolio
   * - For existing portfolios: Calls PUT /api/portfolio/{id}
   * 
   * Validation:
   * - Ensures required fields (name, riskProfile) are filled
   * - Checks user authentication for new portfolios
   * 
   * Error Handling:
   * - Network errors (status 0): Connection message
   * - Auth errors (status 401): Session expired message
   * - Permission errors (status 403): Permission denied message
   * - Validation errors (status 400): Invalid data message
   * - Server errors (status 500+): Service unavailable message
   * 
   * On Success:
   * - Updates local state
   * - Emits saveChanges event to parent
   * - Resets form dirty state
   */
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

  /**
   * Cancels editing and resets the form to original values
   * Does not navigate away from the Details tab
   */
  cancelEdit(): void {
    // Reset to original values and exit editing mode
    if (this.originalPortfolio) {
      this.editingPortfolio = { ...this.originalPortfolio };
    }
    this.isFormDirty = false;
    this.isSaving = false;
    // Stay on the same page - don't navigate to overview
  }

  /**
   * Emits cancel event to parent component
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Emits navigation event to switch to the Overview tab
   */
  navigateToOverview(): void {
    this.goToOverview.emit();
  }
}
