import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfoliosComponent } from './portfolios.component';
import { PortfolioApiService } from '../../services/apis/portfolio.api';
import { of, throwError } from 'rxjs';
import { PortfolioWithMetrics } from './portfolio.types';
import * as fc from 'fast-check';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('PortfoliosComponent', () => {
  let component: PortfoliosComponent;
  let fixture: ComponentFixture<PortfoliosComponent>;
  let mockPortfolioApiService: jasmine.SpyObj<PortfolioApiService>;

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
    // Create a spy object for PortfolioApiService
    mockPortfolioApiService = jasmine.createSpyObj('PortfolioApiService', ['getPortfolios']);
    mockPortfolioApiService.getPortfolios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PortfoliosComponent],
      providers: [
        { provide: PortfolioApiService, useValue: mockPortfolioApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfoliosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Portfolio Sidebar', () => {
    it('should display search input', () => {
      fixture.detectChanges();
      const searchInput = fixture.debugElement.query(By.css('.search-input'));
      expect(searchInput).toBeTruthy();
    });

    it('should display portfolio list when portfolios are loaded', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', name: 'Portfolio 1' }),
        createMockPortfolio({ id: '2', name: 'Portfolio 2' })
      ];
      component.portfolios = mockPortfolios;
      component.filteredPortfolios = mockPortfolios;
      fixture.detectChanges();

      const portfolioCards = fixture.debugElement.queryAll(By.css('.portfolio-card'));
      expect(portfolioCards.length).toBe(2);
    });

    it('should highlight selected portfolio', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', name: 'Portfolio 1' }),
        createMockPortfolio({ id: '2', name: 'Portfolio 2' })
      ];
      component.portfolios = mockPortfolios;
      component.filteredPortfolios = mockPortfolios;
      component.selectedPortfolio = mockPortfolios[0];
      fixture.detectChanges();

      const portfolioCards = fixture.debugElement.queryAll(By.css('.portfolio-card'));
      expect(portfolioCards[0].nativeElement.classList.contains('selected')).toBe(true);
      expect(portfolioCards[1].nativeElement.classList.contains('selected')).toBe(false);
    });
  });

  describe('Property-Based Tests', () => {
    // **Feature: portfolio-dashboard-refactor, Property 4: Search filtering accuracy**
    // **Validates: Requirements 1.5**
    describe('Property 4: Search filtering accuracy', () => {
      it('should filter portfolios by name (case-insensitive)', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                description: fc.string({ maxLength: 200 }),
                riskProfile: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'),
                isActive: fc.boolean()
              }),
              { minLength: 0, maxLength: 20 }
            ),
            fc.string({ maxLength: 20 }),
            (portfolioData, searchQuery) => {
              // Create portfolios with the generated data
              const portfolios: PortfolioWithMetrics[] = portfolioData.map(data =>
                createMockPortfolio({
                  id: data.id,
                  name: data.name,
                  description: data.description,
                  riskProfile: data.riskProfile,
                  isActive: data.isActive
                })
              );

              component.portfolios = portfolios;
              component.searchText = searchQuery;
              component.onSearchChange();

              const searchLower = searchQuery.toLowerCase().trim();
              
              // If search is empty, all portfolios should be shown
              if (!searchLower) {
                expect(component.filteredPortfolios.length).toBe(portfolios.length);
                return;
              }

              // Verify each filtered portfolio contains the search text
              component.filteredPortfolios.forEach(portfolio => {
                const nameMatch = portfolio.name.toLowerCase().includes(searchLower);
                const descMatch = portfolio.description.toLowerCase().includes(searchLower);
                expect(nameMatch || descMatch).toBe(true);
              });

              // Verify no portfolio was incorrectly excluded
              portfolios.forEach(portfolio => {
                const nameMatch = portfolio.name.toLowerCase().includes(searchLower);
                const descMatch = portfolio.description.toLowerCase().includes(searchLower);
                const shouldBeIncluded = nameMatch || descMatch;
                const isIncluded = component.filteredPortfolios.some(p => p.id === portfolio.id);
                expect(isIncluded).toBe(shouldBeIncluded);
              });
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    // **Feature: portfolio-dashboard-refactor, Property 1: Portfolio display completeness**
    // **Validates: Requirements 1.2**
    describe('Property 1: Portfolio display completeness', () => {
      it('should display all required fields for each portfolio', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                description: fc.string({ minLength: 1, maxLength: 200 }),
                totalReturn: fc.double({ min: -100, max: 200 }),
                stockCount: fc.integer({ min: 0, max: 100 }),
                outperformance: fc.double({ min: -50, max: 50 }),
                lastRebalance: fc.string({ minLength: 1, maxLength: 20 }),
                isActive: fc.boolean(),
                riskProfile: fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')
              }),
              { minLength: 1, maxLength: 10 }
            ),
            (portfolioData) => {
              const portfolios: PortfolioWithMetrics[] = portfolioData.map(data =>
                createMockPortfolio(data)
              );

              component.portfolios = portfolios;
              component.filteredPortfolios = portfolios;
              fixture.detectChanges();

              const portfolioCards = fixture.debugElement.queryAll(By.css('.portfolio-card'));
              
              portfolioCards.forEach((card, index) => {
                const portfolio = portfolios[index];
                const cardElement = card.nativeElement;
                const cardText = cardElement.textContent;

                // Verify name is displayed
                expect(cardText).toContain(portfolio.name);

                // Verify description is displayed
                expect(cardText).toContain(portfolio.description);

                // Verify return percentage is displayed
                const returnText = component.formatReturn(portfolio.totalReturn || 0);
                expect(cardText).toContain(returnText);

                // Verify stock count is displayed
                expect(cardText).toContain(portfolio.stockCount?.toString() || '0');

                // Verify outperformance is displayed
                const outperformanceText = component.formatReturn(portfolio.outperformance || 0);
                expect(cardText).toContain(outperformanceText);

                // Verify last execution date is displayed
                expect(cardText).toContain(portfolio.lastRebalance || 'N/A');

                // Verify status is displayed
                const statusTag = card.query(By.css('p-tag'));
                expect(statusTag).toBeTruthy();
              });
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    // **Feature: portfolio-dashboard-refactor, Property 2: Portfolio selection updates detail panel**
    // **Validates: Requirements 1.3**
    describe('Property 2: Portfolio selection updates detail panel', () => {
      it('should update selectedPortfolio when a portfolio is clicked', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 50 }),
                description: fc.string({ maxLength: 200 })
              }),
              { minLength: 1, maxLength: 10 }
            ),
            fc.integer({ min: 0, max: 9 }),
            (portfolioData, selectionIndex) => {
              // Ensure we have at least one portfolio
              if (portfolioData.length === 0) return;

              const portfolios: PortfolioWithMetrics[] = portfolioData.map(data =>
                createMockPortfolio(data)
              );

              // Adjust selection index to be within bounds
              const actualIndex = selectionIndex % portfolios.length;
              const portfolioToSelect = portfolios[actualIndex];

              component.portfolios = portfolios;
              component.filteredPortfolios = portfolios;
              component.selectedPortfolio = null;

              // Simulate portfolio selection
              component.selectPortfolio(portfolioToSelect);

              // Verify the selected portfolio is updated
              expect(component.selectedPortfolio).toBeTruthy();
              expect(component.selectedPortfolio).not.toBeNull();
              // Use non-null assertion since we've verified it's not null
              expect(component.selectedPortfolio!.id).toBe(portfolioToSelect.id);
              expect(component.selectedPortfolio!.name).toBe(portfolioToSelect.name);
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    // **Feature: portfolio-dashboard-refactor, Property 3: Selected portfolio highlighting**
    // **Validates: Requirements 1.4**
    describe('Property 3: Selected portfolio highlighting', () => {
      it('should apply selected class to the selected portfolio card', () => {
        fc.assert(
          fc.property(
            fc.array(
              fc.record({
                id: fc.uuid(),
                name: fc.string({ minLength: 1, maxLength: 50 })
              }),
              { minLength: 2, maxLength: 10 }
            ),
            fc.integer({ min: 0, max: 9 }),
            (portfolioData, selectionIndex) => {
              // Ensure we have at least 2 portfolios
              if (portfolioData.length < 2) return;

              const portfolios: PortfolioWithMetrics[] = portfolioData.map(data =>
                createMockPortfolio(data)
              );

              // Adjust selection index to be within bounds
              const actualIndex = selectionIndex % portfolios.length;
              const selectedPortfolio = portfolios[actualIndex];

              component.portfolios = portfolios;
              component.filteredPortfolios = portfolios;
              component.selectedPortfolio = selectedPortfolio;
              fixture.detectChanges();

              const portfolioCards = fixture.debugElement.queryAll(By.css('.portfolio-card'));

              portfolioCards.forEach((card, index) => {
                const hasSelectedClass = card.nativeElement.classList.contains('selected');
                const shouldBeSelected = index === actualIndex;
                expect(hasSelectedClass).toBe(shouldBeSelected);
              });
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate total portfolios correctly', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1' }),
        createMockPortfolio({ id: '2' }),
        createMockPortfolio({ id: '3' })
      ];
      component.portfolios = mockPortfolios;
      expect(component.totalPortfolios).toBe(3);
    });

    it('should calculate active portfolios correctly', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', isActive: true }),
        createMockPortfolio({ id: '2', isActive: false }),
        createMockPortfolio({ id: '3', isActive: true })
      ];
      component.portfolios = mockPortfolios;
      expect(component.activePortfolios).toBe(2);
    });

    it('should calculate conservative portfolios correctly', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', riskProfile: 'CONSERVATIVE' }),
        createMockPortfolio({ id: '2', riskProfile: 'MODERATE' }),
        createMockPortfolio({ id: '3', riskProfile: 'CONSERVATIVE' })
      ];
      component.portfolios = mockPortfolios;
      expect(component.conservativePortfolios).toBe(2);
    });

    it('should calculate moderate portfolios correctly', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', riskProfile: 'MODERATE' }),
        createMockPortfolio({ id: '2', riskProfile: 'MODERATE' }),
        createMockPortfolio({ id: '3', riskProfile: 'AGGRESSIVE' })
      ];
      component.portfolios = mockPortfolios;
      expect(component.moderatePortfolios).toBe(2);
    });

    it('should calculate aggressive portfolios correctly', () => {
      const mockPortfolios = [
        createMockPortfolio({ id: '1', riskProfile: 'AGGRESSIVE' }),
        createMockPortfolio({ id: '2', riskProfile: 'MODERATE' }),
        createMockPortfolio({ id: '3', riskProfile: 'AGGRESSIVE' })
      ];
      component.portfolios = mockPortfolios;
      expect(component.aggressivePortfolios).toBe(2);
    });
  });
});
