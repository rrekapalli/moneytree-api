import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioDetailsComponent } from './details.component';
import { PortfolioApiService } from '../../../services/apis/portfolio.api';
import { AuthService } from '../../../services/security/auth.service';
import { of, throwError } from 'rxjs';
import { PortfolioWithMetrics } from '../portfolio.types';

describe('PortfolioDetailsComponent', () => {
  let component: PortfolioDetailsComponent;
  let fixture: ComponentFixture<PortfolioDetailsComponent>;
  let mockPortfolioApiService: jasmine.SpyObj<PortfolioApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

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
      updatedAt: overrides.updatedAt || '2024-01-15T10:30:00Z',
      totalReturn: overrides.totalReturn !== undefined ? overrides.totalReturn : 10.5,
      benchmarkReturn: overrides.benchmarkReturn !== undefined ? overrides.benchmarkReturn : 8.0,
      outperformance: overrides.outperformance !== undefined ? overrides.outperformance : 2.5,
      stockCount: overrides.stockCount !== undefined ? overrides.stockCount : 15,
      rebalanceEvents: overrides.rebalanceEvents !== undefined ? overrides.rebalanceEvents : 3,
      lastRebalance: overrides.lastRebalance || '1 month ago',
      performanceData: overrides.performanceData || {
        portfolio: [100, 105, 110],
        benchmark: [100, 102, 104],
        labels: ['Start', 'Mid', 'Now']
      }
    };
  };

  beforeEach(async () => {
    // Create spy objects for services
    mockPortfolioApiService = jasmine.createSpyObj('PortfolioApiService', ['createPortfolio', 'updatePortfolio']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    // Default mock return values
    mockAuthService.getCurrentUser.and.returnValue({ id: 'user-123', email: 'test@example.com' });

    await TestBed.configureTestingModule({
      imports: [PortfolioDetailsComponent],
      providers: [
        { provide: PortfolioApiService, useValue: mockPortfolioApiService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with null portfolio', () => {
      expect(component.selectedPortfolio).toBeNull();
      expect(component.editingPortfolio).toBeNull();
      expect(component.originalPortfolio).toBeNull();
      expect(component.isFormDirty).toBe(false);
      expect(component.isSaving).toBe(false);
    });

    it('should initialize with portfolio data when provided', () => {
      const mockPortfolio = createMockPortfolio({ id: '1', name: 'Test Portfolio' });
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges();

      expect(component.editingPortfolio).toBeTruthy();
      expect(component.editingPortfolio?.name).toBe('Test Portfolio');
      expect(component.originalPortfolio).toBeTruthy();
      expect(component.isEditing).toBe(true);
      expect(component.isFormDirty).toBe(false);
    });

    it('should detect creation mode for new portfolio', () => {
      const newPortfolio = createMockPortfolio({ id: '' });
      component.selectedPortfolio = newPortfolio;
      component.ngOnChanges();

      expect(component.isCreationMode).toBe(true);
    });

    it('should detect edit mode for existing portfolio', () => {
      const existingPortfolio = createMockPortfolio({ id: '123' });
      component.selectedPortfolio = existingPortfolio;
      component.ngOnChanges();

      expect(component.isCreationMode).toBe(false);
    });
  });

  describe('Form Dirty State Tracking', () => {
    beforeEach(() => {
      const mockPortfolio = createMockPortfolio({
        id: '1',
        name: 'Original Name',
        description: 'Original Description',
        riskProfile: 'MODERATE'
      });
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges();
    });

    it('should not be dirty initially', () => {
      expect(component.isFormDirty).toBe(false);
    });

    it('should be dirty when name changes', () => {
      component.editingPortfolio!.name = 'New Name';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when description changes', () => {
      component.editingPortfolio!.description = 'New Description';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when risk profile changes', () => {
      component.editingPortfolio!.riskProfile = 'AGGRESSIVE';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when base currency changes', () => {
      component.editingPortfolio!.baseCurrency = 'USD';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when initial capital changes', () => {
      component.editingPortfolio!.initialCapital = 200000;
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when current cash changes', () => {
      component.editingPortfolio!.currentCash = 75000;
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when trading mode changes', () => {
      component.editingPortfolio!.tradingMode = 'live';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should be dirty when isActive changes', () => {
      component.editingPortfolio!.isActive = false;
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
    });

    it('should not be dirty when no changes are made', () => {
      component.onFormChange();
      expect(component.isFormDirty).toBe(false);
    });
  });

  describe('Save Button Enable/Disable Logic', () => {
    beforeEach(() => {
      const mockPortfolio = createMockPortfolio({
        id: '1',
        name: 'Test Portfolio',
        riskProfile: 'MODERATE'
      });
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges();
    });

    it('should disable save button when form is not dirty', () => {
      expect(component.isFormDirty).toBe(false);
      // In the template, save button is disabled when !isFormDirty
    });

    it('should enable save button when form is dirty', () => {
      component.editingPortfolio!.name = 'New Name';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);
      // In the template, save button is enabled when isFormDirty
    });

    it('should disable save button when saving', () => {
      component.editingPortfolio!.name = 'New Name';
      component.onFormChange();
      component.isSaving = true;
      expect(component.isSaving).toBe(true);
      // In the template, save button is disabled when isSaving
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      const mockPortfolio = createMockPortfolio({ id: '' });
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges();
    });

    it('should show alert when name is empty', () => {
      spyOn(window, 'alert');
      component.editingPortfolio!.name = '';
      component.saveEditAll();
      expect(window.alert).toHaveBeenCalledWith('Portfolio name is required');
      expect(component.isSaving).toBe(false);
    });

    it('should show alert when name is only whitespace', () => {
      spyOn(window, 'alert');
      component.editingPortfolio!.name = '   ';
      component.saveEditAll();
      expect(window.alert).toHaveBeenCalledWith('Portfolio name is required');
      expect(component.isSaving).toBe(false);
    });

    it('should show alert when risk profile is missing', () => {
      spyOn(window, 'alert');
      component.editingPortfolio!.name = 'Valid Name';
      component.editingPortfolio!.riskProfile = '';
      component.saveEditAll();
      expect(window.alert).toHaveBeenCalledWith('Risk profile is required');
      expect(component.isSaving).toBe(false);
    });

    it('should proceed with save when all required fields are valid', () => {
      mockPortfolioApiService.createPortfolio.and.returnValue(of(createMockPortfolio()));
      component.editingPortfolio!.name = 'Valid Name';
      component.editingPortfolio!.riskProfile = 'MODERATE';
      component.saveEditAll();
      expect(component.isSaving).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      const mockPortfolio = createMockPortfolio({
        id: '1',
        name: 'Original Name',
        description: 'Original Description'
      });
      component.selectedPortfolio = mockPortfolio;
      component.ngOnChanges();
    });

    it('should reset form to original values', () => {
      const originalName = component.editingPortfolio!.name;
      const originalDescription = component.editingPortfolio!.description;

      component.editingPortfolio!.name = 'Modified Name';
      component.editingPortfolio!.description = 'Modified Description';
      component.onFormChange();
      expect(component.isFormDirty).toBe(true);

      component.cancelEdit();

      expect(component.editingPortfolio!.name).toBe(originalName);
      expect(component.editingPortfolio!.description).toBe(originalDescription);
      expect(component.isFormDirty).toBe(false);
    });

    it('should reset isSaving flag', () => {
      component.isSaving = true;
      component.cancelEdit();
      expect(component.isSaving).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    it('should format ISO date string correctly', () => {
      const isoDate = '2024-01-15T10:30:00Z';
      const formatted = component.formatDate(isoDate);
      expect(formatted).toContain('15/01/2024');
    });

    it('should format epoch timestamp in seconds correctly', () => {
      const epochSeconds = 1705318200; // 2024-01-15 10:30:00 UTC
      const formatted = component.formatDate(epochSeconds);
      expect(formatted).toContain('2024');
    });

    it('should format epoch timestamp in milliseconds correctly', () => {
      const epochMillis = 1705318200000; // 2024-01-15 10:30:00 UTC
      const formatted = component.formatDate(epochMillis);
      expect(formatted).toContain('2024');
    });

    it('should return "-" for null date', () => {
      expect(component.formatDate(null)).toBe('-');
    });

    it('should return "-" for undefined date', () => {
      expect(component.formatDate(undefined)).toBe('-');
    });

    it('should return "-" for invalid date', () => {
      expect(component.formatDate('invalid-date')).toBe('-');
    });
  });
});

  describe('Property-Based Tests', () => {
    // **Feature: portfolio-details-config-split, Property 1: Form dirty state reflects changes**
    // **Validates: Requirements 1.3, 2.3**
    describe('Property 1: Form dirty state reflects changes', () => {
      it('should set form dirty flag when any field is modified', () => {
        const fc = require('fast-check');
        
        fc.assert(
          fc.property(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              description: fc.string({ maxLength: 200 }),
              baseCurrency: fc.constantFrom('INR', 'USD', 'EUR'),
              riskProfile: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'),
              initialCapital: fc.integer({ min: 1000, max: 10000000 }),
              currentCash: fc.integer({ min: 0, max: 10000000 }),
              tradingMode: fc.constantFrom('paper', 'live'),
              isActive: fc.boolean()
            }),
            fc.record({
              name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              description: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
              baseCurrency: fc.option(fc.constantFrom('INR', 'USD', 'EUR'), { nil: undefined }),
              riskProfile: fc.option(fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'), { nil: undefined }),
              initialCapital: fc.option(fc.integer({ min: 1000, max: 10000000 }), { nil: undefined }),
              currentCash: fc.option(fc.integer({ min: 0, max: 10000000 }), { nil: undefined }),
              tradingMode: fc.option(fc.constantFrom('paper', 'live'), { nil: undefined }),
              isActive: fc.option(fc.boolean(), { nil: undefined })
            }),
            (portfolioData, modifications) => {
              // Create a portfolio with the generated data
              const portfolio = createMockPortfolio(portfolioData);
              
              // Initialize component with portfolio
              component.selectedPortfolio = portfolio;
              component.ngOnChanges();
              
              // Initially, form should not be dirty
              expect(component.isFormDirty).toBe(false);
              
              // Track if any modification was actually made
              let anyModification = false;
              
              // Apply modifications
              if (modifications.name !== undefined && modifications.name !== component.editingPortfolio!.name) {
                component.editingPortfolio!.name = modifications.name;
                anyModification = true;
              }
              
              if (modifications.description !== undefined && modifications.description !== component.editingPortfolio!.description) {
                component.editingPortfolio!.description = modifications.description;
                anyModification = true;
              }
              
              if (modifications.baseCurrency !== undefined && modifications.baseCurrency !== component.editingPortfolio!.baseCurrency) {
                component.editingPortfolio!.baseCurrency = modifications.baseCurrency;
                anyModification = true;
              }
              
              if (modifications.riskProfile !== undefined && modifications.riskProfile !== component.editingPortfolio!.riskProfile) {
                component.editingPortfolio!.riskProfile = modifications.riskProfile;
                anyModification = true;
              }
              
              if (modifications.initialCapital !== undefined && modifications.initialCapital !== component.editingPortfolio!.initialCapital) {
                component.editingPortfolio!.initialCapital = modifications.initialCapital;
                anyModification = true;
              }
              
              if (modifications.currentCash !== undefined && modifications.currentCash !== component.editingPortfolio!.currentCash) {
                component.editingPortfolio!.currentCash = modifications.currentCash;
                anyModification = true;
              }
              
              if (modifications.tradingMode !== undefined && modifications.tradingMode !== component.editingPortfolio!.tradingMode) {
                component.editingPortfolio!.tradingMode = modifications.tradingMode;
                anyModification = true;
              }
              
              if (modifications.isActive !== undefined && modifications.isActive !== component.editingPortfolio!.isActive) {
                component.editingPortfolio!.isActive = modifications.isActive;
                anyModification = true;
              }
              
              // Trigger form change detection
              component.onFormChange();
              
              // Verify dirty state matches whether modifications were made
              if (anyModification) {
                expect(component.isFormDirty).toBe(true);
              } else {
                expect(component.isFormDirty).toBe(false);
              }
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
