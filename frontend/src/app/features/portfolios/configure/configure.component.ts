import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioConfigApiService } from '../../../services/apis/portfolio-config.api';
import { 
  PortfolioConfig, 
  PortfolioConfigCreateRequest, 
  PortfolioConfigUpdateRequest 
} from '../../../services/entities/portfolio.entities';

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
export class PortfolioConfigureComponent implements OnInit, OnChanges {
  @Input() selectedPortfolio: PortfolioWithMetrics | null = null;

  @Output() saveChanges = new EventEmitter<PortfolioConfig>();
  @Output() cancel = new EventEmitter<void>();
  @Output() goToOverview = new EventEmitter<void>();

  // Inject the portfolio config API service
  private portfolioConfigApiService = inject(PortfolioConfigApiService);

  // Local copy for editing
  portfolioConfig: PortfolioConfig | null = null;
  
  // Original config for dirty checking
  originalConfig: PortfolioConfig | null = null;
  
  // Flag to track if config exists (determines POST vs PUT)
  configExists = false;

  // Loading state for config load operation
  isLoading = false;

  // Loading state for save operation
  isSaving = false;

  // Form dirty state
  isFormDirty = false;

  // Error state
  errorMessage: string | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPortfolio'] && this.selectedPortfolio?.id) {
      // Load config when portfolio changes
      this.loadConfig(this.selectedPortfolio.id);
    } else if (!this.selectedPortfolio) {
      // Reset state when no portfolio is selected
      this.portfolioConfig = null;
      this.originalConfig = null;
      this.configExists = false;
      this.isFormDirty = false;
      this.errorMessage = null;
    }
  }

  /**
   * Load portfolio configuration from API
   */
  loadConfig(portfolioId: string): void {
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
          // Other errors - show error message
          this.errorMessage = error.userMessage || 'Failed to load configuration';
          this.portfolioConfig = null;
          this.originalConfig = null;
          this.configExists = false;
        }
      }
    });
  }

  /**
   * Get default configuration values matching backend entity defaults
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
   * Track form changes
   */
  onFormChange(): void {
    this.isFormDirty = this.hasFormChanged();
  }

  /**
   * Check if form has changed from original config
   */
  private hasFormChanged(): boolean {
    if (!this.portfolioConfig || !this.originalConfig) {
      return false;
    }

    // Compare all config fields
    return JSON.stringify(this.portfolioConfig) !== JSON.stringify(this.originalConfig);
  }

  /**
   * Save configuration using POST (create) or PUT (update) based on configExists flag
   */
  saveConfiguration(): void {
    if (!this.portfolioConfig || !this.selectedPortfolio?.id || this.isSaving) {
      return;
    }

    // Validate required fields
    if (!this.portfolioConfig.tradingMode) {
      alert('Trading mode is required');
      return;
    }
    
    if (!this.portfolioConfig.signalCheckInterval || this.portfolioConfig.signalCheckInterval <= 0) {
      alert('Signal check interval must be a positive number');
      return;
    }
    
    if (!this.portfolioConfig.lookbackDays || this.portfolioConfig.lookbackDays <= 0) {
      alert('Lookback days must be a positive number');
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
        
        // Show user-friendly error message
        this.errorMessage = error.userMessage || 'Failed to save configuration';
        alert(this.errorMessage);
      }
    });
  }

  /**
   * Cancel editing and reset to original values
   */
  cancelEdit(): void {
    if (this.originalConfig) {
      this.portfolioConfig = { ...this.originalConfig };
    }
    this.isFormDirty = false;
    this.errorMessage = null;
  }

  /**
   * Emit cancel event
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Navigate to overview tab
   */
  navigateToOverview(): void {
    this.goToOverview.emit();
  }
}
