import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Subject, takeUntil, finalize, catchError, throwError } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { AccordionModule } from 'primeng/accordion';

import { 
  StrategyWithMetrics, 
  StrategyConfig, 
  UniverseDefinition, 
  AllocationRules, 
  TradingCondition, 
  RiskParameters,
  StrategyConfigUpdateRequest,
  BacktestParameters
} from '../strategy.types';
import { StrategyConfigApiService } from '../../../services/apis/strategy-config.api';
import { BacktestApiService, BacktestExecutionResponse } from '../../../services/apis/backtest.api';
import { ToastService } from '../../../services/toast.service';

/**
 * Configure Component
 * 
 * Provides a comprehensive interface for configuring strategy parameters including:
 * - Universe: Define which stocks to trade (by index, sector, or custom symbols)
 * - Allocations: Position sizing and capital allocation rules
 * - Entry Conditions: Rules for opening positions (buy signals)
 * - Exit Conditions: Rules for closing positions (sell signals)
 * 
 * Features:
 * - Four accordion sections for organized configuration
 * - Rule builder interface for entry/exit conditions
 * - Validation for all configuration parameters
 * - Save configuration with API integration
 * - Run backtest functionality
 * 
 * This component is displayed in the Configure tab when a strategy is selected.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2
 * 
 * @see {@link StrategyConfig} for the configuration data model
 * @see {@link StrategyConfigUpdateRequest} for the update request payload
 */
@Component({
  selector: 'app-strategy-configure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    InputNumberModule,
    MultiSelectModule,
    AutoCompleteModule,
    ChipModule,
    TooltipModule,
    DialogModule,
    DatePickerModule,
    AccordionModule
  ],
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigureComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /**
   * The strategy to configure
   * This is passed from the parent StrategiesComponent
   */
  @Input() strategy!: StrategyWithMetrics;

  /**
   * Event emitted when the configuration is successfully saved
   */
  @Output() configSaved = new EventEmitter<StrategyConfig>();

  /**
   * Event emitted when backtest is triggered
   */
  @Output() backtestTriggered = new EventEmitter<void>();

  // Form and state
  configForm!: FormGroup;
  loading = false;
  saving = false;
  error: string | null = null;
  config: StrategyConfig | null = null;

  // Backtest dialog state
  showBacktestDialog = false;
  backtestForm!: FormGroup;
  runningBacktest = false;
  backtestError: string | null = null;

  // Accordion state
  activeAccordionValue: number | number[] = 0;

  // Options for dropdowns
  universeTypeOptions = [
    { label: 'Index', value: 'INDEX' },
    { label: 'Sector', value: 'SECTOR' },
    { label: 'Custom Symbols', value: 'CUSTOM' }
  ];

  indexOptions = [
    { label: 'Nifty 50', value: 'NIFTY_50' },
    { label: 'Nifty 100', value: 'NIFTY_100' },
    { label: 'Nifty 200', value: 'NIFTY_200' },
    { label: 'Nifty 500', value: 'NIFTY_500' },
    { label: 'Nifty Midcap 100', value: 'NIFTY_MIDCAP_100' },
    { label: 'Nifty Smallcap 100', value: 'NIFTY_SMALLCAP_100' }
  ];

  sectorOptions = [
    { label: 'Technology', value: 'Technology' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Energy', value: 'Energy' },
    { label: 'Consumer Goods', value: 'Consumer Goods' },
    { label: 'Industrials', value: 'Industrials' },
    { label: 'Materials', value: 'Materials' },
    { label: 'Telecommunications', value: 'Telecommunications' },
    { label: 'Utilities', value: 'Utilities' }
  ];

  symbolSuggestions: string[] = [];

  positionSizingOptions = [
    { label: 'Equal Weight', value: 'EQUAL_WEIGHT' },
    { label: 'Risk Parity', value: 'RISK_PARITY' },
    { label: 'Custom', value: 'CUSTOM' }
  ];

  conditionTypeOptions = [
    { label: 'Technical Indicator', value: 'TECHNICAL' },
    { label: 'Price', value: 'PRICE' },
    { label: 'Volume', value: 'VOLUME' },
    { label: 'Custom', value: 'CUSTOM' }
  ];

  indicatorOptions = [
    { label: 'RSI (Relative Strength Index)', value: 'RSI' },
    { label: 'MACD (Moving Average Convergence Divergence)', value: 'MACD' },
    { label: 'SMA (Simple Moving Average)', value: 'SMA' },
    { label: 'EMA (Exponential Moving Average)', value: 'EMA' },
    { label: 'Bollinger Bands', value: 'BOLLINGER_BANDS' },
    { label: 'Stochastic Oscillator', value: 'STOCHASTIC' },
    { label: 'ATR (Average True Range)', value: 'ATR' },
    { label: 'ADX (Average Directional Index)', value: 'ADX' }
  ];

  operatorOptions = [
    { label: 'Greater Than (>)', value: 'GT' },
    { label: 'Less Than (<)', value: 'LT' },
    { label: 'Equal To (=)', value: 'EQ' },
    { label: 'Cross Above', value: 'CROSS_ABOVE' },
    { label: 'Cross Below', value: 'CROSS_BELOW' }
  ];

  timeframeOptions = [
    { label: 'Daily', value: 'day' },
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
    { label: 'Intraday (1 hour)', value: '1h' },
    { label: 'Intraday (15 min)', value: '15m' }
  ];

  logicalOperatorOptions = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' }
  ];

  constructor(
    private fb: FormBuilder,
    private strategyConfigApiService: StrategyConfigApiService,
    private backtestApiService: BacktestApiService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeBacktestForm();
    this.loadConfiguration();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the reactive form with default values
   */
  private initializeForm(): void {
    this.configForm = this.fb.group({
      // Universe section
      universe: this.fb.group({
        type: ['INDEX', Validators.required],
        indices: [[]],
        sectors: [[]],
        symbols: [[]]
      }),
      
      // Allocations section
      allocations: this.fb.group({
        positionSizingMethod: ['EQUAL_WEIGHT', Validators.required],
        maxPositionSize: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
        maxPortfolioAllocation: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
        cashReserve: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
      }),
      
      // Entry conditions section
      entryConditions: this.fb.array([]),
      
      // Exit conditions section
      exitConditions: this.fb.array([]),
      
      // Risk parameters (part of exit conditions)
      riskParameters: this.fb.group({
        stopLossPercent: [null, [Validators.min(0), Validators.max(100)]],
        takeProfitPercent: [null, [Validators.min(0)]],
        trailingStopPercent: [null, [Validators.min(0), Validators.max(100)]],
        maxDrawdownPercent: [null, [Validators.min(0), Validators.max(100)]],
        maxDailyLoss: [null, [Validators.min(0)]]
      })
    });
  }

  /**
   * Loads the strategy configuration from the API
   */
  private loadConfiguration(): void {
    if (!this.strategy || !this.strategy.id) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.strategyConfigApiService.getConfig(this.strategy.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          // If config doesn't exist (404), that's okay - we'll create a new one
          if (error.status === 404) {
            console.log('No configuration found for strategy, will create new one on save');
            return throwError(() => error);
          }
          this.handleLoadError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (config) => {
          this.config = config;
          this.populateForm(config);
          this.error = null;
          this.cdr.markForCheck();
        },
        error: (err) => {
          // 404 is expected for new strategies
          if (err.status !== 404) {
            console.error('Error loading configuration:', err);
          }
        }
      });
  }

  /**
   * Populates the form with loaded configuration data
   */
  private populateForm(config: StrategyConfig): void {
    // Populate universe
    this.configForm.patchValue({
      universe: {
        type: config.universeDefinition.type,
        indices: config.universeDefinition.indices || [],
        sectors: config.universeDefinition.sectors || [],
        symbols: config.universeDefinition.symbols || []
      },
      allocations: config.allocations,
      riskParameters: config.riskParameters
    });

    // Populate entry conditions
    const entryConditionsArray = this.configForm.get('entryConditions') as FormArray;
    entryConditionsArray.clear();
    config.entryConditions.forEach(condition => {
      entryConditionsArray.push(this.createConditionFormGroup(condition));
    });

    // Populate exit conditions
    const exitConditionsArray = this.configForm.get('exitConditions') as FormArray;
    exitConditionsArray.clear();
    config.exitConditions.forEach(condition => {
      exitConditionsArray.push(this.createConditionFormGroup(condition));
    });

    this.configForm.markAsPristine();
  }

  /**
   * Creates a form group for a trading condition
   */
  private createConditionFormGroup(condition?: TradingCondition): FormGroup {
    return this.fb.group({
      id: [condition?.id || this.generateConditionId()],
      type: [condition?.type || 'TECHNICAL', Validators.required],
      indicator: [condition?.indicator || ''],
      operator: [condition?.operator || 'GT', Validators.required],
      value: [condition?.value || '', Validators.required],
      timeframe: [condition?.timeframe || 'day'],
      logicalOperator: [condition?.logicalOperator || 'AND']
    });
  }

  /**
   * Generates a unique ID for a condition
   */
  private generateConditionId(): string {
    return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets the entry conditions form array
   */
  get entryConditions(): FormArray {
    return this.configForm.get('entryConditions') as FormArray;
  }

  /**
   * Gets the exit conditions form array
   */
  get exitConditions(): FormArray {
    return this.configForm.get('exitConditions') as FormArray;
  }

  /**
   * Checks if the form has unsaved changes
   */
  get isDirty(): boolean {
    return this.configForm.dirty;
  }

  /**
   * Checks if the form is valid
   */
  get isValid(): boolean {
    return this.configForm.valid && this.validateConfiguration();
  }

  /**
   * Validates the configuration
   * Ensures at least one entry and one exit condition are defined
   */
  private validateConfiguration(): boolean {
    const entryConditions = this.entryConditions.value;
    const exitConditions = this.exitConditions.value;

    if (entryConditions.length === 0) {
      return false;
    }

    if (exitConditions.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Saves the strategy configuration
   */
  onSave(): void {
    // Mark all fields as touched to show validation errors
    this.configForm.markAllAsTouched();

    if (!this.configForm.valid) {
      this.error = 'Please fix the validation errors before saving.';
      this.cdr.markForCheck();
      return;
    }

    if (!this.validateConfiguration()) {
      this.error = 'Please define at least one entry condition and one exit condition.';
      this.cdr.markForCheck();
      return;
    }

    const formValue = this.configForm.value;
    const updateRequest: StrategyConfigUpdateRequest = {
      universeDefinition: formValue.universe,
      allocations: formValue.allocations,
      entryConditions: formValue.entryConditions,
      exitConditions: formValue.exitConditions,
      riskParameters: formValue.riskParameters
    };

    this.saving = true;
    this.error = null;
    this.cdr.markForCheck();

    this.strategyConfigApiService.updateConfig(this.strategy.id, updateRequest)
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
        next: (updatedConfig) => {
          this.config = updatedConfig;

          // Mark form as pristine after successful save
          this.configForm.markAsPristine();

          // Show success notification
          this.toastService.show('success', 'Configuration Saved', 'Strategy configuration has been saved successfully.');

          // Emit event to parent component
          this.configSaved.emit(updatedConfig);

          this.error = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Handles errors when loading configuration
   */
  private handleLoadError(error: any): void {
    console.error('Error loading configuration:', error);

    if (error.status === 0) {
      this.error = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 401) {
      this.error = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.error = 'You do not have permission to view this configuration.';
    } else if (error.status >= 500) {
      this.error = 'Server error occurred. Please try again later.';
    } else {
      this.error = error.error?.message || 'Failed to load configuration.';
    }

    this.cdr.markForCheck();
  }

  /**
   * Handles errors when saving configuration
   */
  private handleSaveError(error: any): void {
    console.error('Error saving configuration:', error);

    if (error.status === 0) {
      this.error = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 400) {
      this.error = error.error?.message || 'Invalid configuration. Please check your inputs.';
    } else if (error.status === 401) {
      this.error = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.error = 'You do not have permission to update this configuration.';
    } else if (error.status === 404) {
      this.error = 'Strategy not found. It may have been deleted.';
    } else if (error.status >= 500) {
      this.error = 'Server error occurred. Please try again later.';
    } else {
      this.error = error.error?.message || 'Failed to save configuration. Please try again.';
    }

    this.toastService.showError({
      summary: 'Save Failed',
      detail: this.error || 'An error occurred while saving the configuration.'
    });

    this.cdr.markForCheck();
  }

  /**
   * Adds a new entry condition to the form array
   */
  addEntryCondition(): void {
    this.entryConditions.push(this.createConditionFormGroup());
    this.configForm.markAsDirty();
  }

  /**
   * Removes an entry condition from the form array
   */
  removeEntryCondition(index: number): void {
    this.entryConditions.removeAt(index);
    this.configForm.markAsDirty();
  }

  /**
   * Adds a new exit condition to the form array
   */
  addExitCondition(): void {
    this.exitConditions.push(this.createConditionFormGroup());
    this.configForm.markAsDirty();
  }

  /**
   * Removes an exit condition from the form array
   */
  removeExitCondition(index: number): void {
    this.exitConditions.removeAt(index);
    this.configForm.markAsDirty();
  }

  /**
   * Searches for symbols based on user input
   * This would typically call an API to get symbol suggestions
   */
  searchSymbols(event: any): void {
    const query = event.query.toUpperCase();
    
    // Mock symbol suggestions - in production, this would call an API
    const allSymbols = [
      'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK',
      'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK',
      'LT', 'AXISBANK', 'ASIANPAINT', 'MARUTI', 'TITAN',
      'WIPRO', 'ULTRACEMCO', 'NESTLEIND', 'BAJFINANCE', 'HCLTECH'
    ];

    this.symbolSuggestions = allSymbols.filter(symbol => 
      symbol.includes(query)
    );
  }

  /**
   * Gets a summary of the selected universe
   */
  getUniverseSummary(): string {
    const universeType = this.configForm.get('universe.type')?.value;
    
    if (universeType === 'INDEX') {
      const indices = this.configForm.get('universe.indices')?.value || [];
      if (indices.length === 0) return '';
      return `${indices.length} index/indices selected: ${indices.join(', ')}`;
    } else if (universeType === 'SECTOR') {
      const sectors = this.configForm.get('universe.sectors')?.value || [];
      if (sectors.length === 0) return '';
      return `${sectors.length} sector(s) selected: ${sectors.join(', ')}`;
    } else if (universeType === 'CUSTOM') {
      const symbols = this.configForm.get('universe.symbols')?.value || [];
      if (symbols.length === 0) return '';
      return `${symbols.length} symbol(s) selected: ${symbols.join(', ')}`;
    }

    return '';
  }

  /**
   * Initializes the backtest parameters form
   */
  private initializeBacktestForm(): void {
    // Set default date range: last 1 year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    this.backtestForm = this.fb.group({
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
      initialCapital: [100000, [Validators.required, Validators.min(1000)]],
      symbol: [''] // Optional
    });
  }

  /**
   * Opens the backtest parameters dialog
   */
  onRunBacktest(): void {
    // Validate that configuration is saved
    if (this.isDirty) {
      this.toastService.showError({
        summary: 'Unsaved Changes',
        detail: 'Please save your configuration before running a backtest.'
      });
      return;
    }

    // Validate that configuration is complete
    if (!this.isValid) {
      this.toastService.showError({
        summary: 'Incomplete Configuration',
        detail: 'Please complete the strategy configuration before running a backtest.'
      });
      return;
    }

    // Reset form and show dialog
    this.backtestError = null;
    this.showBacktestDialog = true;
    this.cdr.markForCheck();
  }

  /**
   * Closes the backtest parameters dialog
   */
  onCancelBacktest(): void {
    this.showBacktestDialog = false;
    this.backtestError = null;
    this.cdr.markForCheck();
  }

  /**
   * Executes the backtest with the specified parameters
   */
  onExecuteBacktest(): void {
    // Mark all fields as touched to show validation errors
    this.backtestForm.markAllAsTouched();

    if (!this.backtestForm.valid) {
      this.backtestError = 'Please fix the validation errors before running the backtest.';
      this.cdr.markForCheck();
      return;
    }

    const formValue = this.backtestForm.value;
    
    // Validate date range
    if (formValue.startDate >= formValue.endDate) {
      this.backtestError = 'End date must be after start date.';
      this.cdr.markForCheck();
      return;
    }

    // Format dates to ISO 8601 format (YYYY-MM-DD)
    const params: BacktestParameters = {
      startDate: this.formatDate(formValue.startDate),
      endDate: this.formatDate(formValue.endDate),
      initialCapital: formValue.initialCapital
    };

    // Add optional symbol if provided
    if (formValue.symbol && formValue.symbol.trim()) {
      params.symbol = formValue.symbol.trim().toUpperCase();
    }

    this.runningBacktest = true;
    this.backtestError = null;
    this.cdr.markForCheck();

    this.backtestApiService.triggerBacktest(this.strategy.id, params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.runningBacktest = false;
          this.cdr.markForCheck();
        }),
        catchError((error) => {
          this.handleBacktestError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response: BacktestExecutionResponse) => {
          // Close dialog
          this.showBacktestDialog = false;

          // Show success notification
          this.toastService.show('success', 'Backtest Started', 
            `Backtest has been queued for execution. Run ID: ${response.runId}`);

          // Emit event to parent component
          this.backtestTriggered.emit();

          this.backtestError = null;
          this.cdr.markForCheck();
        },
        error: () => {
          // Error already handled in catchError
        }
      });
  }

  /**
   * Formats a Date object to ISO 8601 date string (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Handles errors when triggering backtest
   */
  private handleBacktestError(error: any): void {
    console.error('Error triggering backtest:', error);

    if (error.status === 0) {
      this.backtestError = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.status === 400) {
      this.backtestError = error.error?.message || 'Invalid backtest parameters or incomplete strategy configuration.';
    } else if (error.status === 401) {
      this.backtestError = 'Your session has expired. Please log in again.';
    } else if (error.status === 403) {
      this.backtestError = 'You do not have permission to run backtests for this strategy.';
    } else if (error.status === 404) {
      this.backtestError = 'Strategy not found. It may have been deleted.';
    } else if (error.status === 409) {
      this.backtestError = 'A backtest is already running for this strategy. Please wait for it to complete.';
    } else if (error.status >= 500) {
      this.backtestError = 'Server error occurred. Please try again later.';
    } else {
      this.backtestError = error.error?.message || 'Failed to start backtest. Please try again.';
    }

    this.toastService.showError({
      summary: 'Backtest Failed',
      detail: this.backtestError || 'An error occurred while starting the backtest.'
    });

    this.cdr.markForCheck();
  }

  /**
   * Public method to reload configuration (for retry button)
   */
  reloadConfiguration(): void {
    this.loadConfiguration();
  }
}
