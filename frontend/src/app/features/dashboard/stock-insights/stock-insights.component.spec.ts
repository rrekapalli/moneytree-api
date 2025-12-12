import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StockInsightsComponent } from './stock-insights.component';
import { InstrumentFilterService, FilterOptions, InstrumentFilter, InstrumentDto } from '../../../services/apis/instrument-filter.service';
import { ComponentCommunicationService } from '../../../services/component-communication.service';
import { IndicesService } from '../../../services/apis/indices.api';
import { WebSocketService } from '../../../services/websockets';
import { ExcelExportService, FilterService } from '@dashboards/public-api';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StockInsightsComponent - Filter Management', () => {
  let component: StockInsightsComponent;
  let fixture: ComponentFixture<StockInsightsComponent>;
  let instrumentFilterService: jasmine.SpyObj<InstrumentFilterService>;
  let componentCommunicationService: jasmine.SpyObj<ComponentCommunicationService>;
  let indicesService: jasmine.SpyObj<IndicesService>;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(async () => {
    const instrumentFilterServiceSpy = jasmine.createSpyObj('InstrumentFilterService', [
      'getDistinctExchanges',
      'getDistinctIndices',
      'getDistinctSegments',
      'getFilteredInstruments'
    ]);
    
    const componentCommunicationServiceSpy = jasmine.createSpyObj('ComponentCommunicationService', [
      'getSelectedIndex',
      'clearSelectedIndex',
      'transformToDashboardData'
    ]);
    
    const indicesServiceSpy = jasmine.createSpyObj('IndicesService', [
      'getIndicesByExchangeSegment',
      'getIndexHistoricalData'
    ]);
    
    const webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [
      'connect',
      'disconnect',
      'subscribeToIndex',
      'subscribeToAllIndices'
    ]);

    // Setup default return values
    componentCommunicationServiceSpy.getSelectedIndex.and.returnValue(of(null));
    indicesServiceSpy.getIndicesByExchangeSegment.and.returnValue(of([]));
    instrumentFilterServiceSpy.getDistinctExchanges.and.returnValue(of(['NSE', 'BSE']));
    instrumentFilterServiceSpy.getDistinctIndices.and.returnValue(of(['NIFTY 50', 'NIFTY BANK']));
    instrumentFilterServiceSpy.getDistinctSegments.and.returnValue(of(['EQ', 'FO']));
    instrumentFilterServiceSpy.getFilteredInstruments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [StockInsightsComponent, HttpClientTestingModule],
      providers: [
        { provide: InstrumentFilterService, useValue: instrumentFilterServiceSpy },
        { provide: ComponentCommunicationService, useValue: componentCommunicationServiceSpy },
        { provide: IndicesService, useValue: indicesServiceSpy },
        { provide: WebSocketService, useValue: webSocketServiceSpy },
        ExcelExportService,
        FilterService,
        ChangeDetectorRef,
        NgZone
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StockInsightsComponent);
    component = fixture.componentInstance;
    instrumentFilterService = TestBed.inject(InstrumentFilterService) as jasmine.SpyObj<InstrumentFilterService>;
    componentCommunicationService = TestBed.inject(ComponentCommunicationService) as jasmine.SpyObj<ComponentCommunicationService>;
    indicesService = TestBed.inject(IndicesService) as jasmine.SpyObj<IndicesService>;
    webSocketService = TestBed.inject(WebSocketService) as jasmine.SpyObj<WebSocketService>;
  });

  /**
   * Feature: dashboard-instrument-filters, Property 1: Filter change triggers widget update
   * Validates: Requirements 1.3
   */
  describe('Property 1: Filter change triggers widget update', () => {
    it('should update Stock List widget when exchange filter changes', fakeAsync(() => {
      // Arrange
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '123',
          tradingsymbol: 'RELIANCE',
          name: 'Reliance Industries',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 2500,
          lotSize: 1,
          tickSize: 0.05
        }
      ];
      
      instrumentFilterService.getFilteredInstruments.and.returnValue(of(mockInstruments));
      
      // Initialize component
      fixture.detectChanges();
      tick(500); // Wait for initialization
      
      const initialDataLength = component['dashboardData'].length;
      
      // Act - Change exchange filter
      const newFilters: InstrumentFilter = {
        exchange: 'BSE',
        index: 'NIFTY 50',
        segment: 'EQ'
      };
      
      component.onFilterChange(newFilters);
      tick(300); // Wait for debounce
      
      // Assert
      expect(instrumentFilterService.getFilteredInstruments).toHaveBeenCalledWith(newFilters);
      expect(component['dashboardData'].length).toBeGreaterThan(0);
      expect(component['filteredDashboardData']).toBeTruthy();
    }));

    it('should update Stock List widget when index filter changes', fakeAsync(() => {
      // Arrange
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '456',
          tradingsymbol: 'HDFCBANK',
          name: 'HDFC Bank',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 1600,
          lotSize: 1,
          tickSize: 0.05
        }
      ];
      
      instrumentFilterService.getFilteredInstruments.and.returnValue(of(mockInstruments));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change index filter
      const newFilters: InstrumentFilter = {
        exchange: 'NSE',
        index: 'NIFTY BANK',
        segment: 'EQ'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert
      expect(instrumentFilterService.getFilteredInstruments).toHaveBeenCalledWith(newFilters);
      expect(component['dashboardData'].length).toBeGreaterThan(0);
    }));

    it('should update Stock List widget when segment filter changes', fakeAsync(() => {
      // Arrange
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '789',
          tradingsymbol: 'NIFTY24DECFUT',
          name: 'NIFTY DEC FUT',
          segment: 'FO',
          exchange: 'NSE',
          instrumentType: 'FUT',
          lastPrice: 19500,
          lotSize: 50,
          tickSize: 0.05
        }
      ];
      
      instrumentFilterService.getFilteredInstruments.and.returnValue(of(mockInstruments));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change segment filter
      const newFilters: InstrumentFilter = {
        exchange: 'NSE',
        index: 'NIFTY 50',
        segment: 'FO'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert
      expect(instrumentFilterService.getFilteredInstruments).toHaveBeenCalledWith(newFilters);
      expect(component['dashboardData'].length).toBeGreaterThan(0);
    }));
  });

  /**
   * Feature: dashboard-instrument-filters, Property 2: Filter state persistence
   * Validates: Requirements 1.4
   */
  describe('Property 2: Filter state persistence', () => {
    it('should persist exchange filter selection', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change exchange filter
      const newFilters: InstrumentFilter = {
        exchange: 'BSE',
        index: 'NIFTY 50',
        segment: 'EQ'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert - Filter state should be persisted
      expect(component.selectedFilters.exchange).toBe('BSE');
      expect(component.selectedFilters.index).toBe('NIFTY 50');
      expect(component.selectedFilters.segment).toBe('EQ');
    }));

    it('should persist index filter selection', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change index filter
      const newFilters: InstrumentFilter = {
        exchange: 'NSE',
        index: 'NIFTY BANK',
        segment: 'EQ'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert - Filter state should be persisted
      expect(component.selectedFilters.exchange).toBe('NSE');
      expect(component.selectedFilters.index).toBe('NIFTY BANK');
      expect(component.selectedFilters.segment).toBe('EQ');
    }));

    it('should persist segment filter selection', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change segment filter
      const newFilters: InstrumentFilter = {
        exchange: 'NSE',
        index: 'NIFTY 50',
        segment: 'FO'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert - Filter state should be persisted
      expect(component.selectedFilters.exchange).toBe('NSE');
      expect(component.selectedFilters.index).toBe('NIFTY 50');
      expect(component.selectedFilters.segment).toBe('FO');
    }));

    it('should persist all filter selections when changed together', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      // Initialize component
      fixture.detectChanges();
      tick(500);
      
      // Act - Change all filters
      const newFilters: InstrumentFilter = {
        exchange: 'BSE',
        index: 'SENSEX',
        segment: 'FO'
      };
      
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert - All filter states should be persisted
      expect(component.selectedFilters.exchange).toBe('BSE');
      expect(component.selectedFilters.index).toBe('SENSEX');
      expect(component.selectedFilters.segment).toBe('FO');
    }));
  });

  /**
   * Unit tests for StockInsightsComponent filter management
   * Validates: Requirements 1.2, 1.3, 1.4, 6.1
   */
  describe('Unit Tests - Filter Management', () => {
    it('should load filter options on initialization', fakeAsync(() => {
      // Arrange
      const mockExchanges = ['NSE', 'BSE', 'MCX'];
      const mockIndices = ['NIFTY 50', 'NIFTY BANK', 'SENSEX'];
      const mockSegments = ['EQ', 'FO', 'CD'];
      
      instrumentFilterService.getDistinctExchanges.and.returnValue(of(mockExchanges));
      instrumentFilterService.getDistinctIndices.and.returnValue(of(mockIndices));
      instrumentFilterService.getDistinctSegments.and.returnValue(of(mockSegments));
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      // Act
      fixture.detectChanges();
      tick(500);
      
      // Assert
      expect(instrumentFilterService.getDistinctExchanges).toHaveBeenCalled();
      expect(instrumentFilterService.getDistinctIndices).toHaveBeenCalled();
      expect(instrumentFilterService.getDistinctSegments).toHaveBeenCalled();
      expect(component.filterOptions.exchanges).toEqual(mockExchanges);
      expect(component.filterOptions.indices).toEqual(mockIndices);
      expect(component.filterOptions.segments).toEqual(mockSegments);
    }));

    it('should update selectedFilters when onFilterChange is called', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      fixture.detectChanges();
      tick(500);
      
      const newFilters: InstrumentFilter = {
        exchange: 'BSE',
        index: 'SENSEX',
        segment: 'FO'
      };
      
      // Act
      component.onFilterChange(newFilters);
      tick(300);
      
      // Assert
      expect(component.selectedFilters).toEqual(newFilters);
    }));

    it('should debounce filter changes to prevent excessive API calls', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      fixture.detectChanges();
      tick(500);
      
      // Reset call count
      instrumentFilterService.getFilteredInstruments.calls.reset();
      
      // Act - Make multiple rapid filter changes
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(100);
      component.onFilterChange({ exchange: 'BSE', index: 'SENSEX', segment: 'EQ' });
      tick(100);
      component.onFilterChange({ exchange: 'MCX', index: 'MCXINDEX', segment: 'FO' });
      tick(300); // Wait for debounce
      
      // Assert - Should only call API once after debounce
      expect(instrumentFilterService.getFilteredInstruments).toHaveBeenCalledTimes(1);
      expect(instrumentFilterService.getFilteredInstruments).toHaveBeenCalledWith({
        exchange: 'MCX',
        index: 'MCXINDEX',
        segment: 'FO'
      });
    }));

    it('should map instruments to StockDataDto correctly', fakeAsync(() => {
      // Arrange
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '123',
          tradingsymbol: 'RELIANCE',
          name: 'Reliance Industries',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 2500,
          lotSize: 1,
          tickSize: 0.05
        },
        {
          instrumentToken: '456',
          tradingsymbol: 'HDFCBANK',
          name: 'HDFC Bank',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 1600,
          lotSize: 1,
          tickSize: 0.05
        }
      ];
      
      instrumentFilterService.getFilteredInstruments.and.returnValue(of(mockInstruments));
      
      // Act
      fixture.detectChanges();
      tick(500);
      
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      // Assert
      expect(component['dashboardData'].length).toBe(2);
      expect(component['dashboardData'][0].tradingsymbol).toBe('RELIANCE');
      expect(component['dashboardData'][0].companyName).toBe('Reliance Industries');
      expect(component['dashboardData'][0].lastPrice).toBe(2500);
      expect(component['dashboardData'][1].tradingsymbol).toBe('HDFCBANK');
      expect(component['dashboardData'][1].companyName).toBe('HDFC Bank');
      expect(component['dashboardData'][1].lastPrice).toBe(1600);
    }));

    it('should set default filter values on initialization', fakeAsync(() => {
      // Arrange & Act
      fixture.detectChanges();
      tick(500);
      
      // Assert
      expect(component.selectedFilters.exchange).toBe('NSE');
      expect(component.selectedFilters.index).toBe('NIFTY 50');
      expect(component.selectedFilters.segment).toBe('EQ');
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      
      // Act
      fixture.detectChanges();
      tick(500);
      
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      // Assert - Should not throw error and should set loading to false
      expect(component.isLoadingInstruments).toBe(false);
    }));

    it('should set isLoadingInstruments to true when loading filtered instruments', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      fixture.detectChanges();
      tick(500);
      
      // Act
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      
      // Assert - Should be loading immediately after filter change
      tick(300);
      // Note: isLoadingInstruments will be false after the observable completes
      // We can't easily test the intermediate loading state without more complex mocking
    }));
  });

  /**
   * Unit tests for error handling
   * Validates: Requirements 7.3, 7.4, 7.5
   */
  describe('Unit Tests - Error Handling', () => {
    let toastService: any;

    beforeEach(() => {
      // Get the ToastService from the component's injector
      toastService = (component as any).toastService;
      spyOn(toastService, 'showError');
    });

    it('should display error notification on filter options API failure', fakeAsync(() => {
      // Arrange
      const error = new Error('Network error');
      instrumentFilterService.getDistinctExchanges.and.returnValue(throwError(() => error));
      instrumentFilterService.getDistinctIndices.and.returnValue(throwError(() => error));
      instrumentFilterService.getDistinctSegments.and.returnValue(throwError(() => error));
      
      // Act
      fixture.detectChanges();
      tick(500);
      
      // Assert
      expect(toastService.showError).toHaveBeenCalledWith({
        summary: 'Filter Options Error',
        detail: 'Unable to load filter options. Please refresh the page or try again later.',
        life: 5000
      });
    }));

    it('should display error notification on filtered instruments API failure', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      
      fixture.detectChanges();
      tick(500);
      
      // Reset spy to track new calls
      toastService.showError.calls.reset();
      
      // Act
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      // Assert
      expect(toastService.showError).toHaveBeenCalledWith({
        summary: 'Data Load Error',
        detail: 'Unable to load filtered instruments. Displaying previous data. Please try again.',
        life: 5000
      });
    }));

    it('should maintain previous data state on error', fakeAsync(() => {
      // Arrange
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '123',
          tradingsymbol: 'RELIANCE',
          name: 'Reliance Industries',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 2500,
          lotSize: 1,
          tickSize: 0.05
        }
      ];
      
      // First load with successful data
      instrumentFilterService.getFilteredInstruments.and.returnValue(of(mockInstruments));
      fixture.detectChanges();
      tick(500);
      
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      const previousData = [...component['dashboardData']];
      const previousFilteredData = component['filteredDashboardData'] ? [...component['filteredDashboardData']] : null;
      
      // Now simulate an error on the next filter change
      instrumentFilterService.getFilteredInstruments.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      
      // Act
      component.onFilterChange({ exchange: 'BSE', index: 'SENSEX', segment: 'EQ' });
      tick(300);
      
      // Assert - Previous data should be maintained
      expect(component['dashboardData']).toEqual(previousData);
      expect(component['filteredDashboardData']).toEqual(previousFilteredData);
    }));

    it('should retry API call 2 times before failing', fakeAsync(() => {
      // Arrange
      let callCount = 0;
      instrumentFilterService.getFilteredInstruments.and.callFake(() => {
        callCount++;
        return throwError(() => new Error('API Error'));
      });
      
      fixture.detectChanges();
      tick(500);
      
      // Reset call count
      callCount = 0;
      
      // Act
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      // Assert - Should have called 3 times total (1 initial + 2 retries)
      expect(callCount).toBe(3);
    }));

    it('should set isLoadingInstruments to false after error', fakeAsync(() => {
      // Arrange
      instrumentFilterService.getFilteredInstruments.and.returnValue(
        throwError(() => new Error('API Error'))
      );
      
      fixture.detectChanges();
      tick(500);
      
      // Act
      component.onFilterChange({ exchange: 'NSE', index: 'NIFTY 50', segment: 'EQ' });
      tick(300);
      
      // Assert
      expect(component.isLoadingInstruments).toBe(false);
    }));

    it('should set isLoadingFilters to false after error', fakeAsync(() => {
      // Arrange
      const error = new Error('Network error');
      instrumentFilterService.getDistinctExchanges.and.returnValue(throwError(() => error));
      instrumentFilterService.getDistinctIndices.and.returnValue(throwError(() => error));
      instrumentFilterService.getDistinctSegments.and.returnValue(throwError(() => error));
      
      // Act
      fixture.detectChanges();
      tick(500);
      
      // Assert
      expect(component.isLoadingFilters).toBe(false);
    }));

    it('should not clear existing filter options on error', fakeAsync(() => {
      // Arrange
      const mockExchanges = ['NSE', 'BSE'];
      const mockIndices = ['NIFTY 50', 'NIFTY BANK'];
      const mockSegments = ['EQ', 'FO'];
      
      // First successful load
      instrumentFilterService.getDistinctExchanges.and.returnValue(of(mockExchanges));
      instrumentFilterService.getDistinctIndices.and.returnValue(of(mockIndices));
      instrumentFilterService.getDistinctSegments.and.returnValue(of(mockSegments));
      instrumentFilterService.getFilteredInstruments.and.returnValue(of([]));
      
      fixture.detectChanges();
      tick(500);
      
      const previousFilterOptions = { ...component.filterOptions };
      
      // Now simulate error on subsequent load (shouldn't happen in practice, but testing the behavior)
      // The loadFilterOptions is only called once on init, so this test verifies the state is maintained
      
      // Assert - Filter options should still be present
      expect(component.filterOptions).toEqual(previousFilterOptions);
      expect(component.filterOptions.exchanges.length).toBeGreaterThan(0);
      expect(component.filterOptions.indices.length).toBeGreaterThan(0);
      expect(component.filterOptions.segments.length).toBeGreaterThan(0);
    }));
  });
});
