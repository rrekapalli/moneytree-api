import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioConfigureComponent } from './configure.component';
import { PortfolioConfigApiService } from '../../../services/apis/portfolio-config.api';
import { of, throwError } from 'rxjs';
import { PortfolioWithMetrics } from '../portfolio.types';
import { PortfolioConfig } from '../../../services/entities/portfolio.entities';
import * as fc from 'fast-check';

describe('PortfolioConfigureComponent', () => {
  let component: PortfolioConfigureComponent;
  let fixture: ComponentFixture<PortfolioConfigureComponent>;
  let mockPortfolioConfigApiService: jasmine.SpyObj<PortfolioConfigApiService>;

  // Helper function to create a mock portfolio
  const createMockPortfolio = (overrides: Partial<PortfolioWithMetrics> = {}): PortfolioWithMetrics => {
    return {
      id: overrides.id || '1',
      name: overrides.name || 'Test Portfolio',
      description: overrides.description || 'Test Description',
      baseCurrency: overrides.baseCurrency || 'INR',
      inceptionDate: overrides.inceptionDate || '2024-01-01',
      riskProfile: overrides.riskProfile || 'MODERATE',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      initialCapital: overrides.initialCapital || 100000,
      currentCash: overrides.currentCash || 50000,
      tradingMode: overrides.tradingMode || 'paper',
      strategyName: overrides.strategyName || 'Momentum Investing',
      dematAccount: overrides.dematAccount || 'AB1234567B',
      lastSignalCheck: overrides.lastSignalCheck || '2024-01-15T10:30:00Z',
      createdAt: overrides.createdAt || '2024-01-01T00:00:00Z',
      updatedAt: overrides.updatedAt || '2024-01-15T10:30:00Z'
    };
  };

  // Helper function to create a mock config
  const createMockConfig = (portfolioId: string, overrides: Partial<PortfolioConfig> = {}): PortfolioConfig => {
    return {
      portfolioId: portfolioId,
      tradingMode: overrides.tradingMode || 'paper',
      signalCheckInterval: overrides.signalCheckInterval || 300,
      lookbackDays: overrides.lookbackDays || 30,
      historicalCacheEnabled: overrides.historicalCacheEnabled !== undefined ? overrides.historicalCacheEnabled : false,
      historicalCacheLookbackDays: overrides.historicalCacheLookbackDays || 365,
      historicalCacheExchange: overrides.historicalCacheExchange || 'NSE',
      historicalCacheInstrumentType: overrides.historicalCacheInstrumentType || 'EQ',
      historicalCacheCandleInterval: overrides.historicalCacheCandleInterval || 'day',
      historicalCacheTtlSeconds: overrides.historicalCacheTtlSeconds || 86400,
      redisEnabled: overrides.redisEnabled !== undefined ? overrides.redisEnabled : false,
      redisHost: overrides.redisHost || 'localhost',
      redisPort: overrides.redisPort || 6379,
      redisPassword: overrides.redisPassword,
      redisDb: overrides.redisDb || 0,
      redisKeyPrefix: overrides.redisKeyPrefix || 'portfolio:',
      enableConditionalLogging: overrides.enableConditionalLogging !== undefined ? overrides.enableConditionalLogging : false,
      cacheDurationSeconds: overrides.cacheDurationSeconds || 300,
      exchange: overrides.exchange || 'NSE',
      candleInterval: overrides.candleInterval || 'day',
      entryBbLower: overrides.entryBbLower !== undefined ? overrides.entryBbLower : true,
      entryRsiThreshold: overrides.entryRsiThreshold || 30,
      entryMacdTurnPositive: overrides.entryMacdTurnPositive !== undefined ? overrides.entryMacdTurnPositive : true,
      entryVolumeAboveAvg: overrides.entryVolumeAboveAvg !== undefined ? overrides.entryVolumeAboveAvg : true,
      entryFallbackSmaPeriod: overrides.entryFallbackSmaPeriod || 20,
      entryFallbackAtrMultiplier: overrides.entryFallbackAtrMultiplier || 2.0,
      exitTakeProfitPct: overrides.exitTakeProfitPct || 5.0,
      exitStopLossAtrMult: overrides.exitStopLossAtrMult || 2.0,
      exitAllowTpExitsOnly: overrides.exitAllowTpExitsOnly !== undefined ? overrides.exitAllowTpExitsOnly : false,
      customJson: overrides.customJson,
      createdAt: overrides.createdAt || '2024-01-01T00:00:00Z',
      updatedAt: overrides.updatedAt || '2024-01-15T10:30:00Z'
    };
  };

  beforeEach(async () => {
    // Create spy objects for services
    mockPortfolioConfigApiService = jasmine.createSpyObj('PortfolioConfigApiService', [
      'getConfig',
      'createConfig',
      'updateConfig',
      'deleteConfig'
    ]);

    await TestBed.configureTestingModule({
      imports: [PortfolioConfigureComponent],
      providers: [
        { provide: PortfolioConfigApiService, useValue: mockPortfolioConfigApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioConfigureComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Config Loading', () => {
    it('should load existing config when portfolio is selected', (done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Wait for async operation
      setTimeout(() => {
        expect(mockPortfolioConfigApiService.getConfig).toHaveBeenCalledWith('1');
        expect(component.portfolioConfig).toBeTruthy();
        expect(component.portfolioConfig?.tradingMode).toBe('paper');
        expect(component.configExists).toBe(true);
        expect(component.isFormDirty).toBe(false);
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should use default config when config does not exist (404)', (done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const error404 = { status: 404, userMessage: 'Portfolio configuration not found.' };
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(throwError(() => error404));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Wait for async operation
      setTimeout(() => {
        expect(mockPortfolioConfigApiService.getConfig).toHaveBeenCalledWith('1');
        expect(component.portfolioConfig).toBeTruthy();
        expect(component.portfolioConfig?.portfolioId).toBe('1');
        expect(component.portfolioConfig?.tradingMode).toBe('paper');
        expect(component.portfolioConfig?.signalCheckInterval).toBe(300);
        expect(component.configExists).toBe(false);
        expect(component.isFormDirty).toBe(false);
        expect(component.errorMessage).toBeNull();
        done();
      }, 100);
    });

    it('should show error message when config load fails with non-404 error', (done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const error500 = { status: 500, userMessage: 'Server error occurred. Please try again later.' };
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(throwError(() => error500));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Wait for async operation
      setTimeout(() => {
        expect(mockPortfolioConfigApiService.getConfig).toHaveBeenCalledWith('1');
        expect(component.portfolioConfig).toBeNull();
        expect(component.configExists).toBe(false);
        expect(component.errorMessage).toBe('Server error occurred. Please try again later.');
        expect(component.isLoading).toBe(false);
        done();
      }, 100);
    });

    it('should reset state when no portfolio is selected', () => {
      // First set a portfolio
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // Then clear it
      component.selectedPortfolio = null;
      component.ngOnChanges({ selectedPortfolio: { currentValue: null, previousValue: mockPortfolio, firstChange: false, isFirstChange: () => false } });
      
      expect(component.portfolioConfig).toBeNull();
      expect(component.originalConfig).toBeNull();
      expect(component.configExists).toBe(false);
      expect(component.isFormDirty).toBe(false);
      expect(component.errorMessage).toBeNull();
    });

    it('should set loading state while loading config', () => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      
      // Create a delayed observable to test loading state
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      
      // Before ngOnChanges, loading should be false
      expect(component.isLoading).toBe(false);
      
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      // During load, loading should be true
      expect(component.isLoading).toBe(true);
    });
  });

  describe('Default Config Generation', () => {
    it('should generate default config with correct portfolio ID', (done) => {
      const mockPortfolio = createMockPortfolio({ id: 'test-portfolio-123' });
      const error404 = { status: 404, userMessage: 'Portfolio configuration not found.' };
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(throwError(() => error404));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      setTimeout(() => {
        expect(component.portfolioConfig?.portfolioId).toBe('test-portfolio-123');
        done();
      }, 100);
    });

    it('should generate default config with expected default values', (done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const error404 = { status: 404, userMessage: 'Portfolio configuration not found.' };
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(throwError(() => error404));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      setTimeout(() => {
        const config = component.portfolioConfig!;
        
        // Trading Configuration defaults
        expect(config.tradingMode).toBe('paper');
        expect(config.signalCheckInterval).toBe(300);
        expect(config.lookbackDays).toBe(30);
        
        // Historical Cache defaults
        expect(config.historicalCacheEnabled).toBe(false);
        expect(config.historicalCacheLookbackDays).toBe(365);
        expect(config.historicalCacheExchange).toBe('NSE');
        
        // Redis defaults
        expect(config.redisEnabled).toBe(false);
        expect(config.redisHost).toBe('localhost');
        expect(config.redisPort).toBe(6379);
        
        // Entry conditions defaults
        expect(config.entryBbLower).toBe(true);
        expect(config.entryRsiThreshold).toBe(30);
        
        // Exit conditions defaults
        expect(config.exitTakeProfitPct).toBe(5.0);
        expect(config.exitStopLossAtrMult).toBe(2.0);
        
        done();
      }, 100);
    });
  });

  describe('Form Sections Rendering', () => {
    beforeEach((done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      setTimeout(() => {
        fixture.detectChanges();
        done();
      }, 100);
    });

    it('should render Trading Configuration section', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      expect(sections.length).toBeGreaterThanOrEqual(5);
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      expect(sectionTitles).toContain('Trading Configuration');
    });

    it('should render all Trading Configuration fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#tradingMode')).toBeTruthy();
      expect(compiled.querySelector('#signalCheckInterval')).toBeTruthy();
      expect(compiled.querySelector('#lookbackDays')).toBeTruthy();
      expect(compiled.querySelector('#enableConditionalLogging')).toBeTruthy();
      expect(compiled.querySelector('#cacheDurationSeconds')).toBeTruthy();
      expect(compiled.querySelector('#exchange')).toBeTruthy();
      expect(compiled.querySelector('#candleInterval')).toBeTruthy();
    });

    it('should render Historical Cache Configuration section', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      expect(sectionTitles).toContain('Historical Cache Configuration');
    });

    it('should render all Historical Cache Configuration fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#historicalCacheEnabled')).toBeTruthy();
      expect(compiled.querySelector('#historicalCacheLookbackDays')).toBeTruthy();
      expect(compiled.querySelector('#historicalCacheExchange')).toBeTruthy();
      expect(compiled.querySelector('#historicalCacheInstrumentType')).toBeTruthy();
      expect(compiled.querySelector('#historicalCacheCandleInterval')).toBeTruthy();
      expect(compiled.querySelector('#historicalCacheTtlSeconds')).toBeTruthy();
    });

    it('should render Redis Configuration section', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      expect(sectionTitles).toContain('Redis Configuration');
    });

    it('should render all Redis Configuration fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#redisEnabled')).toBeTruthy();
      expect(compiled.querySelector('#redisHost')).toBeTruthy();
      expect(compiled.querySelector('#redisPort')).toBeTruthy();
      expect(compiled.querySelector('#redisPassword')).toBeTruthy();
      expect(compiled.querySelector('#redisDb')).toBeTruthy();
      expect(compiled.querySelector('#redisKeyPrefix')).toBeTruthy();
    });

    it('should render Entry Conditions section', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      expect(sectionTitles).toContain('Entry Conditions');
    });

    it('should render all Entry Conditions fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#entryBbLower')).toBeTruthy();
      expect(compiled.querySelector('#entryRsiThreshold')).toBeTruthy();
      expect(compiled.querySelector('#entryMacdTurnPositive')).toBeTruthy();
      expect(compiled.querySelector('#entryVolumeAboveAvg')).toBeTruthy();
      expect(compiled.querySelector('#entryFallbackSmaPeriod')).toBeTruthy();
      expect(compiled.querySelector('#entryFallbackAtrMultiplier')).toBeTruthy();
    });

    it('should render Exit Conditions section', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      expect(sectionTitles).toContain('Exit Conditions');
    });

    it('should render all Exit Conditions fields', () => {
      const compiled = fixture.nativeElement;
      
      expect(compiled.querySelector('#exitTakeProfitPct')).toBeTruthy();
      expect(compiled.querySelector('#exitStopLossAtrMult')).toBeTruthy();
      expect(compiled.querySelector('#exitAllowTpExitsOnly')).toBeTruthy();
    });

    it('should render all five config sections in correct order', () => {
      const compiled = fixture.nativeElement;
      const sections = compiled.querySelectorAll('.config-section');
      
      expect(sections.length).toBe(5);
      
      const sectionTitles = Array.from(sections).map((section: any) => 
        section.querySelector('.section-title')?.textContent?.trim()
      );
      
      expect(sectionTitles[0]).toBe('Trading Configuration');
      expect(sectionTitles[1]).toBe('Historical Cache Configuration');
      expect(sectionTitles[2]).toBe('Redis Configuration');
      expect(sectionTitles[3]).toBe('Entry Conditions');
      expect(sectionTitles[4]).toBe('Exit Conditions');
    });
  });

  describe('Field Types and Validation', () => {
    beforeEach((done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      setTimeout(() => {
        fixture.detectChanges();
        done();
      }, 100);
    });

    it('should have number type for numeric fields', () => {
      const compiled = fixture.nativeElement;
      
      const numericFields = [
        '#signalCheckInterval',
        '#lookbackDays',
        '#cacheDurationSeconds',
        '#historicalCacheLookbackDays',
        '#historicalCacheTtlSeconds',
        '#redisPort',
        '#redisDb',
        '#entryRsiThreshold',
        '#entryFallbackSmaPeriod',
        '#entryFallbackAtrMultiplier',
        '#exitTakeProfitPct',
        '#exitStopLossAtrMult'
      ];
      
      numericFields.forEach(selector => {
        const field = compiled.querySelector(selector);
        expect(field).toBeTruthy();
        expect(field.type).toBe('number');
      });
    });

    it('should have text type for text fields', () => {
      const compiled = fixture.nativeElement;
      
      const textFields = [
        '#tradingMode',
        '#exchange',
        '#candleInterval',
        '#historicalCacheExchange',
        '#historicalCacheInstrumentType',
        '#historicalCacheCandleInterval',
        '#redisHost',
        '#redisKeyPrefix'
      ];
      
      textFields.forEach(selector => {
        const field = compiled.querySelector(selector);
        expect(field).toBeTruthy();
        expect(field.type).toBe('text');
      });
    });

    it('should have password type for password field', () => {
      const compiled = fixture.nativeElement;
      const passwordField = compiled.querySelector('#redisPassword');
      
      expect(passwordField).toBeTruthy();
      expect(passwordField.type).toBe('password');
    });

    it('should have toggle switches for boolean fields', () => {
      const compiled = fixture.nativeElement;
      
      const toggleFields = [
        '#enableConditionalLogging',
        '#historicalCacheEnabled',
        '#redisEnabled',
        '#entryBbLower',
        '#entryMacdTurnPositive',
        '#entryVolumeAboveAvg',
        '#exitAllowTpExitsOnly'
      ];
      
      toggleFields.forEach(selector => {
        const field = compiled.querySelector(selector);
        expect(field).toBeTruthy();
        expect(field.tagName.toLowerCase()).toBe('p-toggleswitch');
      });
    });

    it('should mark required fields with asterisk', () => {
      const compiled = fixture.nativeElement;
      
      const tradingModeLabel = compiled.querySelector('label[for="tradingMode"]');
      const signalCheckIntervalLabel = compiled.querySelector('label[for="signalCheckInterval"]');
      const lookbackDaysLabel = compiled.querySelector('label[for="lookbackDays"]');
      
      expect(tradingModeLabel?.textContent).toContain('*');
      expect(signalCheckIntervalLabel?.textContent).toContain('*');
      expect(lookbackDaysLabel?.textContent).toContain('*');
    });
  });

  /**
   * Property-Based Tests for Form Validation
   * Feature: portfolio-details-config-split, Property 3: Required field validation disables save
   * Validates: Requirements 5.1
   */
  describe('Property-Based Tests: Required Field Validation', () => {
    beforeEach((done) => {
      const mockPortfolio = createMockPortfolio({ id: '1' });
      const mockConfig = createMockConfig('1');
      
      mockPortfolioConfigApiService.getConfig.and.returnValue(of(mockConfig));
      
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges({ selectedPortfolio: { currentValue: mockPortfolio, previousValue: null, firstChange: true, isFirstChange: () => true } });
      
      setTimeout(() => {
        fixture.detectChanges();
        done();
      }, 100);
    });

    it('Property 3: Required field validation disables save - tradingMode', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant(null as any),
            fc.constant(undefined as any)
          ),
          (invalidValue) => {
            // Set tradingMode to invalid value
            component.portfolioConfig!.tradingMode = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('tradingMode')).toBe(true);
            expect(component.getValidationError('tradingMode')).toBe('Trading mode is required');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Required field validation disables save - signalCheckInterval', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0),
            fc.constant(-1),
            fc.integer({ max: -1 }),
            fc.constant(null as any),
            fc.constant(undefined as any)
          ),
          (invalidValue) => {
            // Set signalCheckInterval to invalid value
            component.portfolioConfig!.signalCheckInterval = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('signalCheckInterval')).toBe(true);
            expect(component.getValidationError('signalCheckInterval')).toBe('Signal check interval must be a positive number');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Required field validation disables save - lookbackDays', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0),
            fc.constant(-1),
            fc.integer({ max: -1 }),
            fc.constant(null as any),
            fc.constant(undefined as any)
          ),
          (invalidValue) => {
            // Set lookbackDays to invalid value
            component.portfolioConfig!.lookbackDays = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('lookbackDays')).toBe(true);
            expect(component.getValidationError('lookbackDays')).toBe('Lookback days must be a positive number');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Conditional validation - Redis host required when Redis enabled', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant(null as any),
            fc.constant(undefined as any)
          ),
          (invalidValue) => {
            // Enable Redis
            component.portfolioConfig!.redisEnabled = true;
            // Set redisHost to invalid value
            component.portfolioConfig!.redisHost = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('redisHost')).toBe(true);
            expect(component.getValidationError('redisHost')).toBe('Redis host is required when Redis is enabled');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Conditional validation - Redis port required when Redis enabled', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0),
            fc.constant(-1),
            fc.constant(65536),
            fc.integer({ min: 65536 }),
            fc.integer({ max: 0 }),
            fc.constant(null as any),
            fc.constant(undefined as any)
          ),
          (invalidValue) => {
            // Enable Redis
            component.portfolioConfig!.redisEnabled = true;
            // Set redisPort to invalid value
            component.portfolioConfig!.redisPort = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('redisPort')).toBe(true);
            expect(component.getValidationError('redisPort')).toBe('Redis port must be between 1 and 65535');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Range validation - RSI threshold must be 0-100', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ max: -1 }),
            fc.integer({ min: 101 })
          ),
          (invalidValue) => {
            // Set entryRsiThreshold to invalid value
            component.portfolioConfig!.entryRsiThreshold = invalidValue;
            component.onFormChange();
            
            // Verify validation error exists
            expect(component.hasValidationError('entryRsiThreshold')).toBe(true);
            expect(component.getValidationError('entryRsiThreshold')).toBe('RSI threshold must be between 0 and 100');
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Positive number validation for numeric fields', () => {
      fc.assert(
        fc.property(
          fc.integer({ max: -1 }),
          (negativeValue) => {
            // Test multiple numeric fields
            const fieldsToTest = [
              { field: 'cacheDurationSeconds', error: 'Cache duration must be a positive number' },
              { field: 'historicalCacheLookbackDays', error: 'Historical cache lookback days must be a positive number' },
              { field: 'historicalCacheTtlSeconds', error: 'Historical cache TTL must be a positive number' },
              { field: 'redisDb', error: 'Redis database must be a positive number' },
              { field: 'entryFallbackSmaPeriod', error: 'Fallback SMA period must be a positive number' },
              { field: 'entryFallbackAtrMultiplier', error: 'Fallback ATR multiplier must be a positive number' },
              { field: 'exitTakeProfitPct', error: 'Take profit percentage must be a positive number' },
              { field: 'exitStopLossAtrMult', error: 'Stop loss ATR multiplier must be a positive number' }
            ];

            fieldsToTest.forEach(({ field, error }) => {
              // Reset validation errors
              component.validationErrors.clear();
              
              // Set field to negative value
              (component.portfolioConfig as any)[field] = negativeValue;
              component.onFormChange();
              
              // Verify validation error exists
              expect(component.hasValidationError(field)).toBe(true);
              expect(component.getValidationError(field)).toBe(error);
              
              // Verify form is invalid
              expect(component.isFormValid()).toBe(false);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Valid values should not produce validation errors', () => {
      fc.assert(
        fc.property(
          fc.record({
            tradingMode: fc.oneof(fc.constant('paper'), fc.constant('live')),
            signalCheckInterval: fc.integer({ min: 1, max: 3600 }),
            lookbackDays: fc.integer({ min: 1, max: 365 }),
            entryRsiThreshold: fc.integer({ min: 0, max: 100 }),
            cacheDurationSeconds: fc.integer({ min: 0, max: 3600 }),
            historicalCacheLookbackDays: fc.integer({ min: 0, max: 1000 }),
            historicalCacheTtlSeconds: fc.integer({ min: 0, max: 86400 }),
            redisDb: fc.integer({ min: 0, max: 15 }),
            entryFallbackSmaPeriod: fc.integer({ min: 0, max: 200 }),
            entryFallbackAtrMultiplier: fc.float({ min: 0, max: 10 }),
            exitTakeProfitPct: fc.float({ min: 0, max: 100 }),
            exitStopLossAtrMult: fc.float({ min: 0, max: 10 })
          }),
          (validValues) => {
            // Set all fields to valid values
            component.portfolioConfig!.tradingMode = validValues.tradingMode;
            component.portfolioConfig!.signalCheckInterval = validValues.signalCheckInterval;
            component.portfolioConfig!.lookbackDays = validValues.lookbackDays;
            component.portfolioConfig!.entryRsiThreshold = validValues.entryRsiThreshold;
            component.portfolioConfig!.cacheDurationSeconds = validValues.cacheDurationSeconds;
            component.portfolioConfig!.historicalCacheLookbackDays = validValues.historicalCacheLookbackDays;
            component.portfolioConfig!.historicalCacheTtlSeconds = validValues.historicalCacheTtlSeconds;
            component.portfolioConfig!.redisDb = validValues.redisDb;
            component.portfolioConfig!.entryFallbackSmaPeriod = validValues.entryFallbackSmaPeriod;
            component.portfolioConfig!.entryFallbackAtrMultiplier = validValues.entryFallbackAtrMultiplier;
            component.portfolioConfig!.exitTakeProfitPct = validValues.exitTakeProfitPct;
            component.portfolioConfig!.exitStopLossAtrMult = validValues.exitStopLossAtrMult;
            
            // Disable Redis to avoid conditional validation
            component.portfolioConfig!.redisEnabled = false;
            
            component.onFormChange();
            
            // Verify no validation errors
            expect(component.isFormValid()).toBe(true);
            expect(component.validationErrors.size).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 3: Save button should be disabled when form is invalid', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   ')
          ),
          (invalidTradingMode) => {
            // Make form dirty
            component.portfolioConfig!.tradingMode = 'paper';
            component.onFormChange();
            expect(component.isFormDirty).toBe(true);
            
            // Now make it invalid
            component.portfolioConfig!.tradingMode = invalidTradingMode;
            component.onFormChange();
            
            // Verify form is invalid
            expect(component.isFormValid()).toBe(false);
            
            // In the template, save button is disabled when: !isFormDirty || isSaving || !isFormValid()
            // Since form is dirty and not saving, button should be disabled due to !isFormValid()
            const shouldBeDisabled = !component.isFormDirty || component.isSaving || !component.isFormValid();
            expect(shouldBeDisabled).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
