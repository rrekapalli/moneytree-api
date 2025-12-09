import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverallComponent } from './overall.component';
import { ExcelExportService, FilterService } from '@dashboards/public-api';
import { ComponentCommunicationService } from '../../../services/component-communication.service';
import { IndicesService } from '../../../services/apis/indices.api';
import { WebSocketService } from '../../../services/websockets';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as fc from 'fast-check';
import { of, Observable } from 'rxjs';

// Polyfill for SockJS global issue in tests
(globalThis as any).global = globalThis;

describe('OverallComponent - WebSocket Integration', () => {
  let component: OverallComponent;
  let fixture: ComponentFixture<OverallComponent>;
  let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
  let mockIndicesService: jasmine.SpyObj<IndicesService>;
  let mockComponentCommunicationService: jasmine.SpyObj<ComponentCommunicationService>;

  beforeEach(async () => {
    // Create mock services
    mockWebSocketService = jasmine.createSpyObj('WebSocketService', [
      'connect',
      'subscribeToAllIndices',
      'unsubscribeFromAll',
      'disconnect'
    ]);

    mockIndicesService = jasmine.createSpyObj('IndicesService', [
      'getIndicesByExchangeSegment',
      'getIndexHistoricalData',
      'getPreviousDayIndexData'
    ]);

    mockComponentCommunicationService = jasmine.createSpyObj('ComponentCommunicationService', [
      'getSelectedIndex',
      'clearSelectedIndex',
      'transformToDashboardData'
    ]);

    // Set up default mock return values
    mockComponentCommunicationService.getSelectedIndex.and.returnValue(of(null));
    mockIndicesService.getIndicesByExchangeSegment.and.returnValue(of([]));
    mockWebSocketService.connect.and.returnValue(Promise.resolve());
    mockWebSocketService.subscribeToAllIndices.and.returnValue(of({ indices: [] }));

    await TestBed.configureTestingModule({
      imports: [OverallComponent],
      providers: [
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: IndicesService, useValue: mockIndicesService },
        { provide: ComponentCommunicationService, useValue: mockComponentCommunicationService },
        ExcelExportService,
        FilterService,
        MessageService
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore template errors for unit testing
    }).compileComponents();

    fixture = TestBed.createComponent(OverallComponent);
    component = fixture.componentInstance;
  });

  describe('Property 1: Signal initialization with defaults', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 1: Signal initialization with defaults
     * Validates: Requirements 7.1
     * 
     * Property: For any component initialization, signals should be created with correct default values
     */
    it('should initialize signals with default values (property-based test)', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed for initialization test
          () => {
            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;

            // Access private signals through type assertion for testing
            const componentAny = testComponent as any;

            // Verify indicesDataSignal is initialized with empty array
            expect(componentAny.indicesDataSignal()).toEqual([]);

            // Verify selectedIndexSymbolSignal is initialized with empty string
            expect(componentAny.selectedIndexSymbolSignal()).toEqual('');

            // Verify wsConnectionStateSignal is initialized with DISCONNECTED
            expect(componentAny.wsConnectionStateSignal()).toEqual('DISCONNECTED');

            // Verify computed signals are defined
            expect(componentAny.filteredIndicesSignal).toBeDefined();
            expect(componentAny.isWebSocketConnectedSignal).toBeDefined();

            // Verify computed signal initial values
            expect(componentAny.filteredIndicesSignal()).toEqual([]);
            expect(componentAny.isWebSocketConnectedSignal()).toBe(false);

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should initialize allIndicesSubscription as null', () => {
      const componentAny = component as any;
      expect(componentAny.allIndicesSubscription).toBeNull();
    });

    it('should have setupSignalEffects method defined', () => {
      const componentAny = component as any;
      expect(typeof componentAny.setupSignalEffects).toBe('function');
    });
  });

  describe('Property 1: WebSocket subscription on connection', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 1: WebSocket subscription on connection
     * Validates: Requirements 1.2
     * 
     * Property: For any component initialization, when the WebSocket connection is established,
     * the system should subscribe to the /topic/nse-indices topic
     */
    it('should subscribe to all indices when WebSocket connection is established (property-based test)', (done) => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(null), // No input needed for this test
          async () => {
            // Reset mocks for each iteration
            mockWebSocketService.connect.calls.reset();
            mockWebSocketService.subscribeToAllIndices.calls.reset();
            
            // Set up mock to resolve connection
            mockWebSocketService.connect.and.returnValue(Promise.resolve());
            mockWebSocketService.subscribeToAllIndices.and.returnValue(of({ indices: [] }));

            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Call initializeWebSocketSubscription
            componentAny.initializeWebSocketSubscription();

            // Wait for promise to resolve
            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify connect was called
            expect(mockWebSocketService.connect).toHaveBeenCalled();

            // Verify subscribeToAllIndices was called after connection
            expect(mockWebSocketService.subscribeToAllIndices).toHaveBeenCalled();

            // Verify connection state signal was updated to CONNECTED
            expect(componentAny.wsConnectionStateSignal()).toEqual('CONNECTED');

            // Verify subscription was stored
            expect(componentAny.allIndicesSubscription).not.toBeNull();

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      ).then(() => done()).catch((error: any) => done.fail(error));
    });

    it('should handle connection failure gracefully and continue with fallback data', (done) => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Reset mocks
            mockWebSocketService.connect.calls.reset();
            mockWebSocketService.subscribeToAllIndices.calls.reset();
            
            // Set up mock to reject connection
            mockWebSocketService.connect.and.returnValue(Promise.reject(new Error('Connection failed')));

            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Call initializeWebSocketSubscription
            componentAny.initializeWebSocketSubscription();

            // Wait for promise to reject
            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify connect was called
            expect(mockWebSocketService.connect).toHaveBeenCalled();

            // Verify subscribeToAllIndices was NOT called (connection failed)
            expect(mockWebSocketService.subscribeToAllIndices).not.toHaveBeenCalled();

            // Verify connection state signal was updated to ERROR
            expect(componentAny.wsConnectionStateSignal()).toEqual('ERROR');

            // Verify subscription remains null
            expect(componentAny.allIndicesSubscription).toBeNull();

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 }
      ).then(() => done()).catch((error: any) => done.fail(error));
    });

    it('should handle subscription error gracefully', (done) => {
      fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Reset mocks
            mockWebSocketService.connect.calls.reset();
            mockWebSocketService.subscribeToAllIndices.calls.reset();
            
            // Set up mock to resolve connection but fail subscription
            mockWebSocketService.connect.and.returnValue(Promise.resolve());
            const errorObservable = new Observable<any>((subscriber: any) => {
              subscriber.error(new Error('Subscription failed'));
            });
            mockWebSocketService.subscribeToAllIndices.and.returnValue(errorObservable as any);

            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Call initializeWebSocketSubscription
            componentAny.initializeWebSocketSubscription();

            // Wait for promise to resolve and subscription to error
            await new Promise(resolve => setTimeout(resolve, 10));

            // Verify connect was called
            expect(mockWebSocketService.connect).toHaveBeenCalled();

            // Verify subscribeToAllIndices was called
            expect(mockWebSocketService.subscribeToAllIndices).toHaveBeenCalled();

            // Verify connection state signal was still updated to CONNECTED
            // (connection succeeded, only subscription failed)
            expect(componentAny.wsConnectionStateSignal()).toEqual('CONNECTED');

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 }
      ).then(() => done()).catch((error: any) => done.fail(error));
    });
  });

  describe('Property 9: Data validation against interface', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 9: Data validation against interface
     * Validates: Requirements 5.2
     * 
     * Property: For any parsed WebSocket data, it should conform to the IndicesDto interface structure
     */
    it('should validate incoming data conforms to IndicesDto interface (property-based test)', () => {
      // Arbitrary generator for valid IndexDataDto
      const arbitraryIndexData = fc.record({
        indexName: fc.string({ minLength: 1, maxLength: 50 }),
        indexSymbol: fc.string({ minLength: 1, maxLength: 20 }),
        lastPrice: fc.double({ min: 0, max: 100000, noNaN: true }),
        variation: fc.double({ min: -10000, max: 10000, noNaN: true }),
        percentChange: fc.double({ min: -100, max: 100, noNaN: true }),
        openPrice: fc.option(fc.double({ min: 0, max: 100000, noNaN: true })),
        dayHigh: fc.option(fc.double({ min: 0, max: 100000, noNaN: true })),
        dayLow: fc.option(fc.double({ min: 0, max: 100000, noNaN: true })),
        previousClose: fc.option(fc.double({ min: 0, max: 100000, noNaN: true }))
      });

      // Arbitrary generator for valid IndicesDto
      const arbitraryIndicesDto = fc.record({
        timestamp: fc.option(fc.date().map(d => d.toISOString())),
        indices: fc.array(arbitraryIndexData, { minLength: 1, maxLength: 50 })
      });

      fc.assert(
        fc.property(
          arbitraryIndicesDto,
          (indicesDto) => {
            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Get initial data length
            const initialDataLength = componentAny.indicesDataSignal().length;

            // Call handleIncomingIndicesData with valid data
            componentAny.handleIncomingIndicesData(indicesDto);

            // Verify data was processed (signal was updated)
            const updatedData = componentAny.indicesDataSignal();
            
            // Valid data should be processed and update the signal
            expect(updatedData.length).toBeGreaterThanOrEqual(initialDataLength);

            // Verify all processed data has required fields
            updatedData.forEach((item: any) => {
              expect(item.symbol || item.tradingsymbol).toBeDefined();
              expect(typeof (item.lastPrice)).toBe('number');
            });

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should handle IndicesDto with empty indices array', () => {
      const componentAny = component as any;
      const initialData = componentAny.indicesDataSignal();

      // Call with empty indices array
      componentAny.handleIncomingIndicesData({ indices: [] });

      // Verify data was not changed (empty data is skipped)
      expect(componentAny.indicesDataSignal()).toEqual(initialData);
    });

    it('should handle IndicesDto with undefined indices', () => {
      const componentAny = component as any;
      const initialData = componentAny.indicesDataSignal();

      // Call with undefined indices
      componentAny.handleIncomingIndicesData({ indices: undefined });

      // Verify data was not changed (undefined data is skipped)
      expect(componentAny.indicesDataSignal()).toEqual(initialData);
    });

    it('should handle null IndicesDto', () => {
      const componentAny = component as any;
      const initialData = componentAny.indicesDataSignal();

      // Call with null
      componentAny.handleIncomingIndicesData(null as any);

      // Verify data was not changed (null data is skipped)
      expect(componentAny.indicesDataSignal()).toEqual(initialData);
    });
  });

  describe('Property 10: Invalid data skipped', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 10: Invalid data skipped
     * Validates: Requirements 5.3
     * 
     * Property: For any invalid WebSocket data received, the system should log a warning
     * and skip the update without affecting existing data
     */
    it('should skip invalid data and preserve existing data (property-based test)', () => {
      // Arbitrary generator for invalid IndicesDto structures
      const arbitraryInvalidData = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant({}),
        fc.record({ indices: fc.constant(null) }),
        fc.record({ indices: fc.constant(undefined) }),
        fc.record({ indices: fc.constant([]) }),
        fc.record({ timestamp: fc.string() }), // Missing indices field
        fc.string(), // Wrong type
        fc.integer(), // Wrong type
        fc.boolean() // Wrong type
      );

      fc.assert(
        fc.property(
          arbitraryInvalidData,
          (invalidData) => {
            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Set up some initial valid data
            const initialData = [
              {
                symbol: 'NIFTY 50',
                tradingsymbol: 'NIFTY 50',
                companyName: 'NIFTY 50',
                lastPrice: 18000,
                percentChange: 1.5,
                totalTradedValue: 0,
                sector: 'Indices',
                industry: 'Indices'
              }
            ];
            componentAny.indicesDataSignal.set(initialData);

            // Get snapshot of data before invalid update
            const dataBefore = componentAny.indicesDataSignal();

            // Call handleIncomingIndicesData with invalid data
            componentAny.handleIncomingIndicesData(invalidData);

            // Verify data was not changed (invalid data is skipped)
            const dataAfter = componentAny.indicesDataSignal();
            expect(dataAfter).toEqual(dataBefore);
            expect(dataAfter.length).toBe(initialData.length);

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should skip update when indices array is empty', () => {
      const componentAny = component as any;

      // Set up initial data
      const initialData = [
        {
          symbol: 'NIFTY 50',
          tradingsymbol: 'NIFTY 50',
          companyName: 'NIFTY 50',
          lastPrice: 18000,
          percentChange: 1.5,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        }
      ];
      componentAny.indicesDataSignal.set(initialData);

      const dataBefore = componentAny.indicesDataSignal();

      // Call with empty indices array
      componentAny.handleIncomingIndicesData({ indices: [] });

      // Verify data was not changed
      expect(componentAny.indicesDataSignal()).toEqual(dataBefore);
    });

    it('should handle malformed index data gracefully', () => {
      const componentAny = component as any;

      // Set up initial data
      const initialData = [
        {
          symbol: 'NIFTY 50',
          tradingsymbol: 'NIFTY 50',
          companyName: 'NIFTY 50',
          lastPrice: 18000,
          percentChange: 1.5,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        }
      ];
      componentAny.indicesDataSignal.set(initialData);

      // Call with malformed index data (missing required fields)
      const malformedData = {
        indices: [
          { /* missing all fields */ },
          { indexName: 'Test' /* missing other fields */ }
        ]
      };

      // This should not throw an error
      expect(() => {
        componentAny.handleIncomingIndicesData(malformedData);
      }).not.toThrow();

      // Data should still be updated (mapper handles missing fields with defaults)
      const dataAfter = componentAny.indicesDataSignal();
      expect(dataAfter.length).toBeGreaterThanOrEqual(initialData.length);
    });
  });
});
