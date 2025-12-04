import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize, catchError, throwError } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { StrategyWithMetrics, StrategyUpdateRequest } from '../strategy.types';
import { StrategyApiService } from '../../../services/apis/strategy.api';
import { ToastService } from '../../../services/toast.service';

/**
 * Details Component
 * 
 * Provides an editable form for managing strategy details including:
 * - Strategy name (required)
 * - Description (optional)
 * - Risk profile (CONSERVATIVE, MODERATE, AGGRESSIVE)
 * 
 * Features:
 * - Form validation with error messages
 * - Dirty state tracking to detect unsaved changes
 * - Save and Cancel operations
 * - Success/error notifications
 * - Updates parent component on successful save
 * 
 * This component is displayed in the Details tab when a strategy is selected.
 * It follows the patterns established in the Portfolios page for consistency.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 * 
 * @see {@link StrategyWithMetrics} for the strategy data model
 * @see {@link StrategyUpdateRequest} for the update request payload
 */
@Component({
  selector: 'app-strategy-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /**
   * The strategy to display and edit
   * This is passed from the parent StrategiesComponent
   */
  @Input() strategy!: StrategyWithMetrics;

  /**
   * Event emitted when the strategy is successfully saved
   * Parent component should refresh the strategy list
   */
  @Output() strategySaved = new EventEmitter<StrategyWithMetrics>();

  // Form and state
  detailsForm!: FormGroup;
  saving = false;
  error: string | null = null;

  // Risk profile options
  riskProfileOptions = [
    { label: 'Conservative (Low Risk)', value: 'CONSERVATIVE' },
    { label: 'Moderate (Medium Risk)', value: 'MODERATE' },
    { label: 'Aggressive (High Risk)', value: 'AGGRESSIVE' }
  ];

  constructor(
    private fb: FormBuilder,
    private strategyApiService: StrategyApiService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the reactive form with strategy data
   */
  private initializeForm(): void {
    this.detailsForm = this.fb.group({
      name: [this.strategy?.name || '', [Validators.required, Validators.maxLength(200)]],
      description: [this.strategy?.description || '', [Validators.maxLength(1000)]],
      riskProfile: [this.strategy?.riskProfile || 'MODERATE', [Validators.required]]
    });

    // Mark form as pristine after initialization
    this.detailsForm.markAsPristine();
  }

  /**
   * Checks if the form has unsaved changes
   */
  get isDirty(): boolean {
    return this.detailsForm.dirty;
  }

  /**
   * Checks if the form is valid
   */
  get isValid(): boolean {
    return this.detailsForm.valid;
  }

  /**
   * Gets the name form control for template access
   */
  get nameControl() {
    return this.detailsForm.get('name');
  }

  /**
   * Gets the description form control for template access
   */
  get descriptionControl() {
    return this.detailsForm.get('description');
  }

  /**
   * Gets the risk profile form control for template access
   */
  get riskProfileControl() {
    return this.detailsForm.get('riskProfile');
  }

  /**
   * Saves the strategy details
   * Validates the form, calls the API, and emits success event
   */
  onSave(): void {
    // Mark all fields as touched to show validation errors
    this.detailsForm.markAllAsTouched();

    if (!this.detailsForm.valid) {
      this.error = 'Please fix the validation errors before saving.';
      this.cdr.markForCheck();
      return;
    }

    const formValue = this.detailsForm.value;
    const updateRequest: StrategyUpdateRequest = {
      name: formValue.name,
      description: formValue.description,
      riskProfile: formValue.riskProfile
    };

    this.saving = true;
    this.error = null;
    this.cdr.markForCheck();

    this.strategyApiService.updateStrategy(this.strategy.id, updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleSaveError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (updatedStrategy) => {
          // Update the local strategy object with the response
          this.strategy = {
            ...this.strategy,
            ...updatedStrategy
          };

          // Mark form as pristine after successful save
          this.detailsForm.markAsPristine();

          // Show success notification
          this.toastService.show('success', 'Strategy Updated', 'Strategy details have been saved successfully.');

          // Emit event to parent component to refresh the sidebar
          this.strategySaved.emit(this.strategy);

          this.error = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Cancels editing and reverts changes
   * Resets the form to the original strategy values
   */
  onCancel(): void {
    // Reset form to original values
    this.detailsForm.patchValue({
      name: this.strategy.name,
      description: this.strategy.description,
      riskProfile: this.strategy.riskProfile
    });

    // Mark form as pristine
    this.detailsForm.markAsPristine();

    // Clear any errors
    this.error = null;

    this.cdr.markForCheck();
  }

  /**
   * Handles errors when saving strategy details
   */
  private handleSaveError(error: any): void {
    console.error('Error saving strategy details:', error);

    if (error.status === 0) {
      this.error = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 400) {
      // Validation error
      if (error.error?.validationErrors) {
        // Display field-specific validation errors
        const validationErrors = error.error.validationErrors;
        const errorMessages: string[] = [];

        Object.keys(validationErrors).forEach(field => {
          errorMessages.push(`${field}: ${validationErrors[field]}`);
        });

        this.error = errorMessages.join(', ');
      } else {
        this.error = error.error?.message || 'Invalid data. Please check your inputs.';
      }
    } else if (error.status === 401) {
      this.error = 'Your session has expired. Please log in again.';
      localStorage.removeItem('auth_token');
    } else if (error.status === 403) {
      this.error = 'You do not have permission to update this strategy.';
    } else if (error.status === 404) {
      this.error = 'Strategy not found. It may have been deleted.';
    } else if (error.status === 409) {
      this.error = 'A strategy with this name already exists. Please choose a different name.';
    } else if (error.status >= 500) {
      this.error = 'Server error occurred. Please try again later.';
    } else {
      this.error = error.error?.message || 'Failed to save strategy details. Please try again.';
    }

    // Show error toast
    this.toastService.showError({
      summary: 'Save Failed',
      detail: this.error || 'An error occurred while saving the strategy.'
    });

    this.cdr.markForCheck();
  }

  /**
   * Gets the label for a risk profile value
   */
  getRiskProfileLabel(riskProfile: string): string {
    const option = this.riskProfileOptions.find(opt => opt.value === riskProfile);
    return option ? option.label : riskProfile;
  }
}
