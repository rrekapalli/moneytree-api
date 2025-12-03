import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';

import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioConfigApiService } from '../../../services/apis/portfolio-config.api';
import { 
  PortfolioConfig, 
  PortfolioConfigCreateRequest, 
  PortfolioConfigUpdateRequest 
} from '../../../services/entities/portfolio.entities';

/**
 * Portfolio Configure Component
 * 
 * Manages technical trading configuration for portfolios including signal intervals,
 * entry/exit conditions, Redis settings, and historical cache configuration.
 * This component is part of the portfolio details/config split refactoring that
 * separates technical trading settings from basic portfolio metadata.
 * 
 * Features:
 * - Load existing configuration or display defaults
 * - Organize settings into logical sections (Trading, Cache, Redis, Entry/Exit)
 * - Comprehensive form validation with field-level error messages
 * - Automatic POST/PUT selection based on config existence
 * - Conditional validation (e.g., Redis fields required when Redis enabled)
 * - Comprehensive error handling with user-friendly messages
 * 
 * Configuration Sections:
 * 1. Trading Configuration: Mode, intervals, lookback periods
 * 2. Historical Cache: Cache settings for historical data
 * 3. Redis Configuration: Redis connection and caching settings
 * 4. Entry Conditions: Technical indicators for trade entry
 * 5. Exit Conditions: Take profit and stop loss settings
 * 
 * Usage:
 * ```html
 * <app-portfolio-configure
 *   [selectedPortfolio]="portfolio"
 *   [tradingModeOptions]="tradingModes"
 *   [exchangeOptions]="exchanges"
 *   [candleIntervalOptions]="intervals"
 *   [instrumentTypeOptions]="instruments"
 *   (saveChanges)="onConfigSave($event)"
 *   (cancel)="onCancel()">
 * </app-portfolio-configure>
 * ```
 * 
 * @see {@link PortfolioDetailsComponent} for basic portfolio information
 * @see {@link PortfolioConfig} for the configuration data model
 * @see {@link PortfolioConfigApiService} for API operations
 */
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
    FormsModule,
    AccordionModule
  ],
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.scss']
})
export class PortfolioConfigureComponent implements OnInit, OnChanges {
  /** The portfolio to configure. Configuration is loaded based on this portfolio's ID. */
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;
  
  /** Available trading mode options (paper, live) */
  @Input() tradingModeOptions: { label: string; value: string }[] = [];
  
  /** Available exchange options (NSE, BSE) */
  @Input() exchangeOptions: { label: string; value: string }[] = [];
  
  /** Available candle interval options (minute, day, week, month) */
  @Input() candleIntervalOptions: { label: string; value: string }[] = [];
  
  /** Available instrument type options (EQ, FUT, OPT) */
  @Input() instrumentTypeOptions: { label: string; value: string }[] = [];

  /** Emitted when configuration is successfully saved */
  @Output() saveChanges = new EventEmitter<PortfolioConfig>();
  
  /** Emitted when user cancels editing */
  @Output() cancel = new EventEmitter<void>();
  
  /** Emitted when user wants to navigate to overview tab */
  @Output() goToOverview = new EventEmitter<void>();

  /** Portfolio config API service for CRUD operations */
  private portfolioConfigApiService = inject(PortfolioConfigApiService);

  /** Current configuration being edited */
  portfolioConfig: PortfolioConfig | null = null;
  
  /** Original configuration for dirty checking and reset */
  originalConfig: PortfolioConfig | null = null;
  
  /** True if config exists in database (determines POST vs PUT) */
  configExists = false;

  /** True when loading configuration from API */
  isLoading = false;

  /** True when save operation is in progress */
  isSaving = false;

  /** True when form has unsaved changes */
  isFormDirty = false;

  /** Map of field names to validation error messages */
  validationErrors: Map<string, string> = new Map();

  /** Current error message to display to user, or null if no error */
  errorMessage: string | null = null;

  /** Active accordion panel value (only one panel open at a time) */
  activeAccordionValue: number = 0; // Open first panel by default

  /**
   * Component initialization lifecycle hook
   */
  ngOnInit(): void {
    // Component initialization
  }

  /**
   * Lifecycle hook called when input properties change
   * Loads configuration when a new portfolio is selected
   * 
   * @param changes - Object containing changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('[ConfigureComponent] ngOnChanges called', {
      hasChanges: !!changes['selectedPortfolio'],
      portfolioId: this.selectedPortfolio?.id,
      portfolioName: this.selectedPortfolio?.name
    });
    
    if (changes['selectedPortfolio'] && this.selectedPortfolio?.id) {
      // Load config when portfolio changes
      console.log('[ConfigureComponent] Loading config for portfolio:', this.selectedPortfolio.id);
      this.loadConfig(this.selectedPortfolio.id);
    } else if (!this.selectedPortfolio) {
      // Reset state when no portfolio is selected
      console.log('[ConfigureComponent] No portfolio selected, resetting state');
      this.portfolioConfig = null;
      this.originalConfig = null;
      this.configExists = false;
      this.isFormDirty = false;
      this.errorMessage = null;
    }
  }

  /**
   * Loads portfolio configuration from the API
   * 
   * If configuration exists (status 200): Loads and displays it
   * If configuration doesn't exist (status 404): Displays default values
   * For other errors: Displays error message with retry option if applicable
   * 
   * @param portfolioId - The ID of the portfolio to load configuration for
   */
  loadConfig(portfolioId: string): void {
    console.log('[ConfigureComponent] loadConfig called for portfolio:', portfolioId);
    this.isLoading = true;
    this.errorMessage = null;

    this.portfolioConfigApiService.getConfig(portfolioId).subscribe({
      next: (config) => {
        // Config exists, use it
        this.portfolioConfig = { ...config };
        this.originalConfig = { ...config };
        this.configExists = true;
        this.isLoading = false;
        this.isFormDirty = false;
      },
      error: (error) => {
        this.isLoading = false;
        
        // If 404, config doesn't exist yet - use defaults
        if (error.status === 404) {
          this.portfolioConfig = this.getDefaultConfig(portfolioId);
          this.originalConfig = { ...this.portfolioConfig };
          this.configExists = false;
          this.isFormDirty = false;
        } else {
          // Other errors - show error message with retry option for retryable errors
          this.errorMessage = error.userMessage || 'Failed to load configuration';
          if (error.canRetry) {
            this.errorMessage += ' Click here to retry.';
          }
          this.portfolioConfig = null;
          this.originalConfig = null;
          this.configExists = false;
        }
      }
    });
  }

  /**
   * Returns default configuration values matching backend entity defaults
   * 
   * These defaults are used when no configuration exists for a portfolio.
   * Values match the default values defined in the backend PortfolioConfig entity.
   * 
   * Default Values:
   * - Trading Mode: paper
   * - Signal Check Interval: 300 seconds (5 minutes)
   * - Lookback Days: 30
   * - Historical Cache: Disabled
   * - Redis: Disabled
   * - Entry RSI Threshold: 30
   * - Exit Take Profit: 5%
   * - Exit Stop Loss: 2x ATR
   * 
   * @param portfolioId - The portfolio ID to associate with the config
   * @returns A PortfolioConfig object with default values
   * @private
   */
  private getDefaultConfig(portfolioId: string): PortfolioConfig {
    return {
      portfolioId: portfolioId,
      
      // Trading Configuration
      tradingMode: 'paper',
      signalCheckInterval: 300,
      lookbackDays: 30,
      
      // Historical Cache Configuration
      historicalCacheEnabled: false,
      historicalCacheLookbackDays: 365,
      historicalCacheExchange: 'NSE',
      historicalCacheInstrumentType: 'EQ',
      historicalCacheCandleInterval: 'day',
      historicalCacheTtlSeconds: 86400,
      
      // Redis Configuration
      redisEnabled: false,
      redisHost: 'localhost',
      redisPort: 6379,
      redisPassword: undefined,
      redisDb: 0,
      redisKeyPrefix: 'portfolio:',
      
      // Additional Trading Settings
      enableConditionalLogging: false,
      cacheDurationSeconds: 300,
      exchange: 'NSE',
      candleInterval: 'day',
      
      // Entry Conditions
      entryBbLower: true,
      entryRsiThreshold: 30,
      entryMacdTurnPositive: true,
      entryVolumeAboveAvg: true,
      entryFallbackSmaPeriod: 20,
      entryFallbackAtrMultiplier: 2.0,
      
      // Exit Conditions
      exitTakeProfitPct: 5.0,
      exitStopLossAtrMult: 2.0,
      exitAllowTpExitsOnly: false,
      
      // Custom JSON
      customJson: undefined,
      
      // Timestamps (will be set by backend)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Called when any form field changes
   * Updates dirty state and runs validation
   */
  onFormChange(): void {
    this.isFormDirty = this.hasFormChanged();
    this.validateForm();
  }

  /**
   * Checks if form has unsaved changes by comparing with original config
   * Uses JSON serialization for deep comparison
   * 
   * @returns True if any field has been modified, false otherwise
   * @private
   */
  private hasFormChanged(): boolean {
    if (!this.portfolioConfig || !this.originalConfig) {
      return false;
    }

    // Compare all config fields
    return JSON.stringify(this.portfolioConfig) !== JSON.stringify(this.originalConfig);
  }

  /**
   * Validates all form fields and populates validationErrors map
   * 
   * Validation Rules:
   * - Required fields: tradingMode, signalCheckInterval, lookbackDays
   * - Conditional required: Redis fields when redisEnabled is true
   * - Range validation: entryRsiThreshold (0-100), redisPort (1-65535)
   * - Positive number validation: All numeric fields must be >= 0
   * 
   * Validation errors are stored in the validationErrors Map and can be
   * retrieved using getValidationError() or hasValidationError()
   */
  validateForm(): void {
    this.validationErrors.clear();

    if (!this.portfolioConfig) {
      return;
    }

    // Required field validation
    if (!this.portfolioConfig.tradingMode || this.portfolioConfig.tradingMode.trim() === '') {
      this.validationErrors.set('tradingMode', 'Trading mode is required');
    }

    if (!this.portfolioConfig.signalCheckInterval || this.portfolioConfig.signalCheckInterval <= 0) {
      this.validationErrors.set('signalCheckInterval', 'Signal check interval must be a positive number');
    }

    if (!this.portfolioConfig.lookbackDays || this.portfolioConfig.lookbackDays <= 0) {
      this.validationErrors.set('lookbackDays', 'Lookback days must be a positive number');
    }

    // Conditional validation for Redis fields when redisEnabled is true
    if (this.portfolioConfig.redisEnabled) {
      if (!this.portfolioConfig.redisHost || this.portfolioConfig.redisHost.trim() === '') {
        this.validationErrors.set('redisHost', 'Redis host is required when Redis is enabled');
      }

      if (!this.portfolioConfig.redisPort || this.portfolioConfig.redisPort < 1 || this.portfolioConfig.redisPort > 65535) {
        this.validationErrors.set('redisPort', 'Redis port must be between 1 and 65535');
      }
    }

    // Range validation for entryRsiThreshold (0-100)
    if (this.portfolioConfig.entryRsiThreshold < 0 || this.portfolioConfig.entryRsiThreshold > 100) {
      this.validationErrors.set('entryRsiThreshold', 'RSI threshold must be between 0 and 100');
    }

    // Positive number validation for numeric fields
    if (this.portfolioConfig.cacheDurationSeconds !== undefined && this.portfolioConfig.cacheDurationSeconds < 0) {
      this.validationErrors.set('cacheDurationSeconds', 'Cache duration must be a positive number');
    }

    if (this.portfolioConfig.historicalCacheLookbackDays < 0) {
      this.validationErrors.set('historicalCacheLookbackDays', 'Historical cache lookback days must be a positive number');
    }

    if (this.portfolioConfig.historicalCacheTtlSeconds < 0) {
      this.validationErrors.set('historicalCacheTtlSeconds', 'Historical cache TTL must be a positive number');
    }

    if (this.portfolioConfig.redisDb < 0) {
      this.validationErrors.set('redisDb', 'Redis database must be a positive number');
    }

    if (this.portfolioConfig.entryFallbackSmaPeriod < 0) {
      this.validationErrors.set('entryFallbackSmaPeriod', 'Fallback SMA period must be a positive number');
    }

    if (this.portfolioConfig.entryFallbackAtrMultiplier < 0) {
      this.validationErrors.set('entryFallbackAtrMultiplier', 'Fallback ATR multiplier must be a positive number');
    }

    if (this.portfolioConfig.exitTakeProfitPct < 0) {
      this.validationErrors.set('exitTakeProfitPct', 'Take profit percentage must be a positive number');
    }

    if (this.portfolioConfig.exitStopLossAtrMult < 0) {
      this.validationErrors.set('exitStopLossAtrMult', 'Stop loss ATR multiplier must be a positive number');
    }
  }

  /**
   * Checks if the form passes all validation rules
   * 
   * @returns True if no validation errors exist, false otherwise
   */
  isFormValid(): boolean {
    return this.validationErrors.size === 0;
  }

  /**
   * Retrieves the validation error message for a specific field
   * 
   * @param fieldName - The name of the field to check
   * @returns The error message if validation failed, undefined otherwise
   */
  getValidationError(fieldName: string): string | undefined {
    return this.validationErrors.get(fieldName);
  }

  /**
   * Checks if a specific field has a validation error
   * 
   * @param fieldName - The name of the field to check
   * @returns True if the field has a validation error, false otherwise
   */
  hasValidationError(fieldName: string): boolean {
    return this.validationErrors.has(fieldName);
  }

  /**
   * Saves configuration using POST (create) or PUT (update) based on configExists flag
   * 
   * Behavior:
   * - If configExists is false: Calls POST /api/portfolio/{id}/config (create)
   * - If configExists is true: Calls PUT /api/portfolio/{id}/config (update)
   * 
   * Validation:
   * - Runs full form validation before saving
   * - Prevents save if validation fails
   * 
   * Error Handling:
   * - Network errors (status 0): Connection message
   * - Auth errors (status 401): Session expired message
   * - Permission errors (status 403): Permission denied message
   * - Validation errors (status 400): Displays field-specific errors
   * - Server errors (status 500+): Service unavailable message
   * 
   * On Success:
   * - Updates local state with saved config
   * - Sets configExists to true
   * - Resets form dirty state
   * - Displays success message
   * - Emits saveChanges event to parent
   */
  saveConfiguration(): void {
    if (!this.portfolioConfig || !this.selectedPortfolio?.id || this.isSaving) {
      return;
    }

    // Validate form before saving
    this.validateForm();
    if (!this.isFormValid()) {
      alert('Please fix validation errors before saving');
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    // Prepare request payload (exclude portfolioId, createdAt, updatedAt)
    const request: PortfolioConfigCreateRequest = {
      tradingMode: this.portfolioConfig.tradingMode,
      signalCheckInterval: this.portfolioConfig.signalCheckInterval,
      lookbackDays: this.portfolioConfig.lookbackDays,
      historicalCacheEnabled: this.portfolioConfig.historicalCacheEnabled,
      historicalCacheLookbackDays: this.portfolioConfig.historicalCacheLookbackDays,
      historicalCacheExchange: this.portfolioConfig.historicalCacheExchange,
      historicalCacheInstrumentType: this.portfolioConfig.historicalCacheInstrumentType,
      historicalCacheCandleInterval: this.portfolioConfig.historicalCacheCandleInterval,
      historicalCacheTtlSeconds: this.portfolioConfig.historicalCacheTtlSeconds,
      redisEnabled: this.portfolioConfig.redisEnabled,
      redisHost: this.portfolioConfig.redisHost,
      redisPort: this.portfolioConfig.redisPort,
      redisPassword: this.portfolioConfig.redisPassword,
      redisDb: this.portfolioConfig.redisDb,
      redisKeyPrefix: this.portfolioConfig.redisKeyPrefix,
      enableConditionalLogging: this.portfolioConfig.enableConditionalLogging,
      cacheDurationSeconds: this.portfolioConfig.cacheDurationSeconds,
      exchange: this.portfolioConfig.exchange,
      candleInterval: this.portfolioConfig.candleInterval,
      entryBbLower: this.portfolioConfig.entryBbLower,
      entryRsiThreshold: this.portfolioConfig.entryRsiThreshold,
      entryMacdTurnPositive: this.portfolioConfig.entryMacdTurnPositive,
      entryVolumeAboveAvg: this.portfolioConfig.entryVolumeAboveAvg,
      entryFallbackSmaPeriod: this.portfolioConfig.entryFallbackSmaPeriod,
      entryFallbackAtrMultiplier: this.portfolioConfig.entryFallbackAtrMultiplier,
      exitTakeProfitPct: this.portfolioConfig.exitTakeProfitPct,
      exitStopLossAtrMult: this.portfolioConfig.exitStopLossAtrMult,
      exitAllowTpExitsOnly: this.portfolioConfig.exitAllowTpExitsOnly,
      customJson: this.portfolioConfig.customJson
    };

    const saveObservable = this.configExists
      ? this.portfolioConfigApiService.updateConfig(this.selectedPortfolio.id, request)
      : this.portfolioConfigApiService.createConfig(this.selectedPortfolio.id, request);

    saveObservable.subscribe({
      next: (savedConfig) => {
        // Update local state with saved config
        this.portfolioConfig = { ...savedConfig };
        this.originalConfig = { ...savedConfig };
        this.configExists = true;
        this.isSaving = false;
        this.isFormDirty = false;
        
        // Show success message
        alert('Configuration saved successfully');
        
        // Emit the saved config
        this.saveChanges.emit(savedConfig);
      },
      error: (error) => {
        this.isSaving = false;
        
        // Show user-friendly error message with validation errors if present
        if (error.validationErrors) {
          // Display validation errors
          const errorMessages = Object.entries(error.validationErrors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
            .join('\n');
          this.errorMessage = `${error.userMessage}\n\n${errorMessages}`;
        } else {
          this.errorMessage = error.userMessage || 'Failed to save configuration';
        }
        
        // Add retry option for retryable errors
        if (error.canRetry) {
          this.errorMessage += '\n\nClick Save to retry.';
        }
        
        alert(this.errorMessage);
      }
    });
  }

  /**
   * Cancels editing and resets form to original configuration values
   * Clears all validation errors and error messages
   */
  cancelEdit(): void {
    if (this.originalConfig) {
      this.portfolioConfig = { ...this.originalConfig };
    }
    this.isFormDirty = false;
    this.validationErrors.clear();
    this.errorMessage = null;
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
