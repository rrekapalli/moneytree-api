import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';

import { ScreenerResp, ScreenerCreateReq, ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
// QueryBuilder imports
import { 
  QueryBuilderComponent, 
  QueryBuilderConfig, 
  RuleSet, 
  Rule, 
  STOCK_FIELDS,
  QueryConverterService
} from 'querybuilder';

@Component({
  selector: 'app-screeners-configure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    MessageModule,
    QueryBuilderComponent
  ],
  templateUrl: './screeners-configure.component.html',
  styleUrl: './screeners-configure.component.scss'
})
export class ScreenersConfigureComponent implements OnInit, OnChanges {
  @Input() selectedScreener: ScreenerResp | null = null;
  @Input() loading = false;
  @Input() universeOptions: any[] = [];

  // ViewChild reference for query builder component
  @ViewChild(QueryBuilderComponent) queryBuilder!: QueryBuilderComponent;

  constructor(
    private cdr: ChangeDetectorRef,
    private queryConverter: QueryConverterService
  ) {
    // Initialize query builder configuration with stock fields
    this.queryConfig = {
      fields: STOCK_FIELDS,
      allowEmptyRulesets: true,
      allowRuleset: true
    };
  }

  @Output() createScreener = new EventEmitter<void>();
  @Output() clearSelection = new EventEmitter<void>();
  @Output() saveScreener = new EventEmitter<ScreenerCreateReq>();

  screenerForm: ScreenerCreateReq = {
    name: '',
    description: '',
    isPublic: false,
    defaultUniverse: '',
    criteria: undefined
  };

  // Basic Info Edit State
  isEditingBasicInfo = false;
  originalBasicInfo: Partial<ScreenerCreateReq> = {};

  // Query Builder Configuration and State
  queryConfig: QueryBuilderConfig;
  currentQuery: RuleSet = { condition: 'and', rules: [] };
  queryValidationState = true;
  queryValidationErrors: string[] = [];
  saveAttempted = false;


  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedScreener'] && changes['selectedScreener'].currentValue) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    // Reset validation state
    this.saveAttempted = false;
    this.queryValidationErrors = [];
    
    if (this.selectedScreener) {
      this.screenerForm = {
        name: this.selectedScreener.name,
        description: this.selectedScreener.description || '',
        isPublic: this.selectedScreener.isPublic,
        defaultUniverse: this.selectedScreener.defaultUniverse || '',
        criteria: this.selectedScreener.criteria
      };
      
      // Initialize query from existing criteria
      this.currentQuery = this.convertScreenerCriteriaToQuery(this.selectedScreener.criteria);
      
      // Reset edit state
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    } else {
      this.screenerForm = {
        name: '',
        description: '',
        isPublic: false,
        defaultUniverse: '',
        criteria: undefined
      };
      
      // Initialize empty query
      this.currentQuery = { condition: 'and', rules: [] };
      
      this.isEditingBasicInfo = false;
      this.originalBasicInfo = {};
    }
  }

  onCreateScreener(): void {
    this.createScreener.emit();
  }

  onClearSelection(): void {
    this.clearSelection.emit();
  }

  onSaveScreener(): void {
    if (!this.screenerForm.name.trim()) {
      return;
    }
    
    // Mark that save was attempted
    this.saveAttempted = true;
    
    // Convert and validate query before saving
    const criteria = this.convertQueryToScreenerCriteria(this.currentQuery);
    
    if (!criteria) {
      // Show validation errors
      this.updateQueryValidationErrors();
      return;
    }
    
    // Update form with validated criteria
    this.screenerForm.criteria = criteria;
    
    // Clear any previous validation errors
    this.queryValidationErrors = [];
    
    this.saveScreener.emit(this.screenerForm);
  }


  onVisibilityChange(event: any): void {
    this.screenerForm.isPublic = event.target.checked;
  }

  // Basic Info Edit Methods
  toggleBasicInfoEdit(): void {
    if (this.isEditingBasicInfo) {
      // Save changes
      if (this.hasBasicInfoChanges()) {
        this.saveBasicInfoChanges();
      }
      this.isEditingBasicInfo = false;
    } else {
      // Enter edit mode
      this.isEditingBasicInfo = true;
      this.storeOriginalBasicInfo();
    }
  }

  private storeOriginalBasicInfo(): void {
    this.originalBasicInfo = {
      name: this.screenerForm.name,
      description: this.screenerForm.description,
      defaultUniverse: this.screenerForm.defaultUniverse,
      isPublic: this.screenerForm.isPublic
    };
  }

  hasBasicInfoChanges(): boolean {
    return (
      this.screenerForm.name !== this.originalBasicInfo.name ||
      this.screenerForm.description !== this.originalBasicInfo.description ||
      this.screenerForm.defaultUniverse !== this.originalBasicInfo.defaultUniverse ||
      this.screenerForm.isPublic !== this.originalBasicInfo.isPublic
    );
  }

  private saveBasicInfoChanges(): void {
    // Emit the save event to parent component
    this.onSaveScreener();
  }

  cancelBasicInfoEdit(): void {
    // Simple approach: always discard changes and exit edit mode
    this.discardBasicInfoChanges();
  }

  private discardBasicInfoChanges(): void {
    // Restore original values
    this.screenerForm.name = this.originalBasicInfo.name || '';
    this.screenerForm.description = this.originalBasicInfo.description || '';
    this.screenerForm.defaultUniverse = this.originalBasicInfo.defaultUniverse || '';
    this.screenerForm.isPublic = this.originalBasicInfo.isPublic || false;
    
    // Exit edit mode
    this.isEditingBasicInfo = false;
    this.originalBasicInfo = {};
  }

  // Query Builder Event Handlers
  onQueryChange(query: RuleSet): void {
    this.currentQuery = query;
    // Clear any previous validation errors when editing
    this.queryValidationErrors = [];
    // Reset save attempted flag so errors don't show while editing
    this.saveAttempted = false;
    // Don't trigger change detection on every keystroke
  }

  onQueryValidationChange(isValid: boolean): void {
    this.queryValidationState = isValid;
    // Don't show validation errors during editing
    // They will be shown when user tries to save
    // Don't trigger change detection on every keystroke
  }

  private updateQueryValidationErrors(): void {
    this.queryValidationErrors = [];
    
    if (!this.queryValidationState) {
      this.queryValidationErrors.push('Query contains invalid rules or incomplete conditions');
    }
    
    // Check API compatibility
    if (this.currentQuery) {
      const apiErrors = this.queryConverter.validateApiCompatibility(this.currentQuery);
      if (apiErrors.length > 0) {
        this.queryValidationErrors.push(...apiErrors.map(error => error.message));
      }
    }
  }

  // Conversion Methods between Query Format and Screener Criteria using QueryConverterService
  private convertQueryToScreenerCriteria(query: RuleSet): ScreenerCriteria | undefined {
    const result = this.queryConverter.convertQueryToScreenerCriteria(query);
    
    if (!result.success) {
      // Store errors for display when saving
      this.queryValidationErrors = result.errors?.map(error => error.message) || ['Conversion failed'];
      console.warn('Query conversion validation:', result.errors);
      return undefined;
    }
    
    return result.data;
  }

  private convertScreenerCriteriaToQuery(criteria: ScreenerCriteria | undefined): RuleSet {
    const result = this.queryConverter.convertScreenerCriteriaToQuery(criteria);
    
    if (!result.success) {
      // Handle conversion errors
      console.error('Failed to convert screener criteria to query:', result.errors);
      this.queryValidationErrors = result.errors?.map(error => error.message) || ['Conversion failed'];
      return { condition: 'and', rules: [] };
    }
    
    return result.data || { condition: 'and', rules: [] };
  }

  // Validation Methods
  isQueryValid(): boolean {
    return this.queryValidationState && this.hasValidQuery() && this.isApiCompatible();
  }

  hasValidQuery(): boolean {
    return this.currentQuery && this.currentQuery.rules && this.currentQuery.rules.length > 0;
  }

  private isApiCompatible(): boolean {
    if (!this.currentQuery) {
      return true; // Empty query is valid
    }
    
    const validationErrors = this.queryConverter.validateApiCompatibility(this.currentQuery);
    return validationErrors.length === 0;
  }

  getQueryValidationMessage(): string {
    if (!this.queryValidationState) {
      return 'Query contains invalid rules or incomplete conditions';
    }
    if (!this.hasValidQuery()) {
      return 'Please add at least one screening condition';
    }
    return '';
  }
}