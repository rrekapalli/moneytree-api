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

  describe('Property 2: Data merge preserves fallback', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 2: Data merge preserves fallback
     * Validates: Requirements 1.3, 3.4
     * 
     * Property: For any incoming WebSocket data, merging it with existing fallback data
     * should preserve all fallback entries that are not updated
     */
    it('should preserve fallback entries not in incoming data (property-based test)', () => {
      // Arbitrary generator for StockDataDto
      const arbitraryStockData = fc.record({
        symbol: fc.string({ minLength: 1, maxLength: 20 }),
        tradingsymbol: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        companyName: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        lastPrice: fc.double({ min: 0, max: 100000, noNaN: true }),
        percentChange: fc.double({ min: -100, max: 100, noNaN: true }),
        totalTradedValue: fc.option(fc.double({ min: 0, max: 1e12, noNaN: true })),
        sector: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        industry: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
      });

      fc.assert(
        fc.property(
          fc.array(arbitraryStockData, { minLength: 1, maxLength: 20 }),
          fc.array(arbitraryStockData, { minLength: 1, maxLength: 20 }),
          (fallbackData, incomingData) => {
            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Call mergeIndicesData
            const merged = componentAny.mergeIndicesData(fallbackData, incomingData);

            // Verify all fallback items not in incoming are preserved
            fallbackData.forEach((fallbackItem: any) => {
              const key = fallbackItem.symbol || fallbackItem.tradingsymbol;
              const inIncoming = incomingData.some((incomingItem: any) => {
                const incomingKey = incomingItem.symbol || incomingItem.tradingsymbol;
                return incomingKey === key;
              });

              if (!inIncoming) {
                // This fallback item should be preserved in merged data
                const foundInMerged = merged.some((mergedItem: any) => {
                  const mergedKey = mergedItem.symbol || mergedItem.tradingsymbol;
                  return mergedKey === key;
                });
                expect(foundInMerged).toBe(true);
              }
            });

            // Verify all incoming items are in merged data
            incomingData.forEach((incomingItem: any) => {
              const key = incomingItem.symbol || incomingItem.tradingsymbol;
              const foundInMerged = merged.some((mergedItem: any) => {
                const mergedKey = mergedItem.symbol || mergedItem.tradingsymbol;
                return mergedKey === key;
              });
              expect(foundInMerged).toBe(true);
            });

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should overlay incoming data on top of fallback data', () => {
      const componentAny = component as any;

      const fallbackData = [
        {
          symbol: 'NIFTY 50',
          tradingsymbol: 'NIFTY 50',
          companyName: 'NIFTY 50',
          lastPrice: 18000,
          percentChange: 1.5,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        },
        {
          symbol: 'NIFTY BANK',
          tradingsymbol: 'NIFTY BANK',
          companyName: 'NIFTY BANK',
          lastPrice: 42000,
          percentChange: 2.0,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        }
      ];

      const incomingData = [
        {
          symbol: 'NIFTY 50',
          tradingsymbol: 'NIFTY 50',
          companyName: 'NIFTY 50',
          lastPrice: 18100, // Updated price
          percentChange: 2.0, // Updated change
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        }
      ];

      const merged = componentAny.mergeIndicesData(fallbackData, incomingData);

      // Verify NIFTY 50 has updated values from incoming data
      const nifty50 = merged.find((item: any) => item.symbol === 'NIFTY 50');
      expect(nifty50).toBeDefined();
      expect(nifty50.lastPrice).toBe(18100);
      expect(nifty50.percentChange).toBe(2.0);

      // Verify NIFTY BANK is preserved from fallback
      const niftyBank = merged.find((item: any) => item.symbol === 'NIFTY BANK');
      expect(niftyBank).toBeDefined();
      expect(niftyBank.lastPrice).toBe(42000);
      expect(niftyBank.percentChange).toBe(2.0);

      // Verify merged array has both items
      expect(merged.length).toBe(2);
    });

    it('should handle empty fallback data', () => {
      const componentAny = component as any;

      const fallbackData: any[] = [];
      const incomingData = [
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

      const merged = componentAny.mergeIndicesData(fallbackData, incomingData);

      // Verify incoming data is in merged result
      expect(merged.length).toBe(1);
      expect(merged[0].symbol).toBe('NIFTY 50');
    });

    it('should handle empty incoming data', () => {
      const componentAny = component as any;

      const fallbackData = [
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
      const incomingData: any[] = [];

      const merged = componentAny.mergeIndicesData(fallbackData, incomingData);

      // Verify fallback data is preserved
      expect(merged.length).toBe(1);
      expect(merged[0].symbol).toBe('NIFTY 50');
    });

    it('should use Map for efficient O(n) merging', () => {
      const componentAny = component as any;

      // Create large datasets to test performance
      const fallbackData = Array.from({ length: 1000 }, (_, i) => ({
        symbol: `INDEX_${i}`,
        tradingsymbol: `INDEX_${i}`,
        companyName: `Index ${i}`,
        lastPrice: 10000 + i,
        percentChange: 0,
        totalTradedValue: 0,
        sector: 'Indices',
        industry: 'Indices'
      }));

      const incomingData = Array.from({ length: 500 }, (_, i) => ({
        symbol: `INDEX_${i}`,
        tradingsymbol: `INDEX_${i}`,
        companyName: `Index ${i}`,
        lastPrice: 11000 + i, // Updated prices
        percentChange: 1.0,
        totalTradedValue: 0,
        sector: 'Indices',
        industry: 'Indices'
      }));

      const startTime = performance.now();
      const merged = componentAny.mergeIndicesData(fallbackData, incomingData);
      const endTime = performance.now();

      // Verify merge completed in reasonable time (should be O(n), not O(n^2))
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms

      // Verify correct merge
      expect(merged.length).toBe(1000); // All unique indices
      
      // Verify first 500 have updated prices
      for (let i = 0; i < 500; i++) {
        const item = merged.find((m: any) => m.symbol === `INDEX_${i}`);
        expect(item.lastPrice).toBe(11000 + i);
      }
      
      // Verify last 500 have original prices
      for (let i = 500; i < 1000; i++) {
        const item = merged.find((m: any) => m.symbol === `INDEX_${i}`);
        expect(item.lastPrice).toBe(10000 + i);
      }
    });
  });

  describe('Property 11: Missing fields use defaults', () => {
    /**
     * Feature: dashboard-indices-websocket-integration, Property 11: Missing fields use defaults
     * Validates: Requirements 5.4
     * 
     * Property: For any WebSocket data with missing fields, the system should apply
     * default values according to the interface definition
     */
    it('should apply default values for missing fields (property-based test)', () => {
      // Arbitrary generator for IndexDataDto with optional fields
      const arbitraryPartialIndexData = fc.record({
        indexName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
        indexSymbol: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
        lastPrice: fc.option(fc.double({ min: 0, max: 100000, noNaN: true })),
        variation: fc.option(fc.double({ min: -10000, max: 10000, noNaN: true })),
        percentChange: fc.option(fc.double({ min: -100, max: 100, noNaN: true }))
      });

      fc.assert(
        fc.property(
          fc.array(arbitraryPartialIndexData, { minLength: 1, maxLength: 20 }),
          (partialIndices) => {
            // Create a fresh component instance
            const testFixture = TestBed.createComponent(OverallComponent);
            const testComponent = testFixture.componentInstance;
            const componentAny = testComponent as any;

            // Create IndicesDto with partial data
            const indicesDto = { indices: partialIndices };

            // Call handleIncomingIndicesData
            componentAny.handleIncomingIndicesData(indicesDto);

            // Get the mapped data
            const mappedData = componentAny.indicesDataSignal();

            // Verify all mapped items have default values for missing fields
            mappedData.forEach((item: any) => {
              // symbol or tradingsymbol should be defined (defaults to 'N/A')
              expect(item.symbol || item.tradingsymbol).toBeDefined();
              
              // companyName should be defined (defaults to 'Unknown Index')
              expect(item.companyName).toBeDefined();
              
              // lastPrice should be a number (defaults to 0)
              expect(typeof item.lastPrice).toBe('number');
              
              // percentChange should be a number (defaults to 0)
              expect(typeof item.percentChange).toBe('number');
              
              // totalTradedValue should be a number (defaults to 0)
              expect(typeof item.totalTradedValue).toBe('number');
              
              // sector should be defined (defaults to 'Indices')
              expect(item.sector).toBe('Indices');
              
              // industry should be defined (defaults to 'Indices')
              expect(item.industry).toBe('Indices');
            });

            // Cleanup
            testFixture.destroy();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    it('should handle completely missing fields with defaults', () => {
      const componentAny = component as any;

      // Create data with all fields missing
      const indicesDto = {
        indices: [
          {} // Empty object - all fields missing
        ]
      };

      // Call handleIncomingIndicesData
      componentAny.handleIncomingIndicesData(indicesDto);

      // Get the mapped data
      const mappedData = componentAny.indicesDataSignal();

      // Verify defaults are applied
      expect(mappedData.length).toBeGreaterThan(0);
      const item = mappedData[mappedData.length - 1]; // Get the last added item

      // Verify default values
      expect(item.symbol || item.tradingsymbol).toBe('N/A');
      expect(item.companyName).toBe('Unknown Index');
      expect(item.lastPrice).toBe(0);
      expect(item.percentChange).toBe(0);
      expect(item.totalTradedValue).toBe(0);
      expect(item.sector).toBe('Indices');
      expect(item.industry).toBe('Indices');
    });

    it('should preserve provided values and only default missing ones', () => {
      const componentAny = component as any;

      // Create data with some fields provided
      const indicesDto = {
        indices: [
          {
            indexName: 'NIFTY 50',
            indexSymbol: 'NIFTY50',
            lastPrice: 18000
            // Missing: variation, percentChange, etc.
          }
        ]
      };

      // Call handleIncomingIndicesData
      componentAny.handleIncomingIndicesData(indicesDto);

      // Get the mapped data
      const mappedData = componentAny.indicesDataSignal();

      // Verify provided values are preserved
      expect(mappedData.length).toBeGreaterThan(0);
      const item = mappedData[mappedData.length - 1];

      expect(item.companyName).toBe('NIFTY 50');
      expect(item.symbol || item.tradingsymbol).toBe('NIFTY50');
      expect(item.lastPrice).toBe(18000);

      // Verify missing fields have defaults
      expect(item.percentChange).toBe(0);
      expect(item.totalTradedValue).toBe(0);
      expect(item.sector).toBe('Indices');
      expect(item.industry).toBe('Indices');
    });

    it('should handle null and undefined values with defaults', () => {
      const componentAny = component as any;

      // Create data with null and undefined values
      const indicesDto = {
        indices: [
          {
            indexName: null,
            indexSymbol: undefined,
            lastPrice: null,
            variation: undefined,
            percentChange: null
          }
        ]
      };

      // Call handleIncomingIndicesData
      componentAny.handleIncomingIndicesData(indicesDto);

      // Get the mapped data
      const mappedData = componentAny.indicesDataSignal();

      // Verify defaults are applied for null/undefined values
      expect(mappedData.length).toBeGreaterThan(0);
      const item = mappedData[mappedData.length - 1];

      expect(item.symbol || item.tradingsymbol).toBe('N/A');
      expect(item.companyName).toBe('Unknown Index');
      expect(item.lastPrice).toBe(0);
      expect(item.percentChange).toBe(0);
    });
  });

  describe('Lifecycle Integration', () => {
    /**
     * Feature: dashboard-indices-websocket-integration
     * Task: 5.1 Write unit test for lifecycle integration
     * Requirements: 1.1, 2.1
     * 
     * Tests that WebSocket subscription occurs after fallback data loads
     * and that the component displays fallback data immediately
     */
    it('should schedule WebSocket initialization after fallback data in onChildInit', () => {
      const componentAny = component as any;
      
      // Spy on initializeWebSocketSubscription
      spyOn(componentAny, 'initializeWebSocketSubscription');

      // Call onChildInit
      componentAny.onChildInit();

      // Verify initializeWebSocketSubscription is not called immediately
      // (it's scheduled with setTimeout for 150ms)
      expect(componentAny.initializeWebSocketSubscription).not.toHaveBeenCalled();
    });

    it('should update indicesDataSignal when fallback data is set', () => {
      const componentAny = component as any;

      // Set up fallback data
      const fallbackData = [
        {
          symbol: 'NIFTY 50',
          tradingsymbol: 'NIFTY 50',
          companyName: 'NIFTY 50',
          lastPrice: 18000,
          percentChange: 1.5,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        },
        {
          symbol: 'NIFTY BANK',
          tradingsymbol: 'NIFTY BANK',
          companyName: 'NIFTY BANK',
          lastPrice: 42000,
          percentChange: 2.0,
          totalTradedValue: 0,
          sector: 'Indices',
          industry: 'Indices'
        }
      ];

      // Update signal directly (simulating what loadDefaultNifty50Data does)
      componentAny.indicesDataSignal.set(fallbackData);

      // Verify signal was updated
      const signalData = componentAny.indicesDataSignal();
      expect(signalData.length).toBe(2);
      
      // Verify data content
      const nifty50 = signalData.find((item: any) => 
        (item.symbol || item.tradingsymbol) === 'NIFTY 50'
      );
      expect(nifty50).toBeDefined();
      expect(nifty50.lastPrice).toBe(18000);

      const niftyBank = signalData.find((item: any) => 
        (item.symbol || item.tradingsymbol) === 'NIFTY BANK'
      );
      expect(niftyBank).toBeDefined();
      expect(niftyBank.lastPrice).toBe(42000);
    });

    it('should make WebSocket initialization non-blocking with setTimeout', () => {
      const componentAny = component as any;
      
      // Spy on setTimeout to verify it's used for WebSocket initialization
      const setTimeoutSpy = spyOn(window, 'setTimeout').and.callThrough();
      
      // Spy on initializeWebSocketSubscription
      spyOn(componentAny, 'initializeWebSocketSubscription');

      // Call onChildInit
      componentAny.onChildInit();

      // Verify setTimeout was called (for WebSocket initialization)
      expect(setTimeoutSpy).toHaveBeenCalled();
      
      // Verify initializeWebSocketSubscription is not called immediately
      expect(componentAny.initializeWebSocketSubscription).not.toHaveBeenCalled();
    });

    it('should handle WebSocket connection failure gracefully', (done) => {
      // Set up mock to reject WebSocket connection
      mockWebSocketService.connect.and.returnValue(Promise.reject(new Error('Connection failed')));

      const componentAny = component as any;

      // Call initializeWebSocketSubscription
      componentAny.initializeWebSocketSubscription();

      // Wait for promise to reject
      setTimeout(() => {
        // Verify connection state signal was updated to ERROR
        expect(componentAny.wsConnectionStateSignal()).toBe('ERROR');

        // Verify subscription remains null
        expect(componentAny.allIndicesSubscription).toBeNull();

        done();
      }, 50);
    });

    it('should preserve fallback data when WebSocket fails', (done) => {
      // Set up fallback data
      const fallbackData = [
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
      
      const componentAny = component as any;
      componentAny.indicesDataSignal.set(fallbackData);

      // Set up mock to reject WebSocket connection
      mockWebSocketService.connect.and.returnValue(Promise.reject(new Error('Connection failed')));

      // Call initializeWebSocketSubscription
      componentAny.initializeWebSocketSubscription();

      // Wait for promise to reject
      setTimeout(() => {
        // Verify fallback data is still present
        const signalData = componentAny.indicesDataSignal();
        expect(signalData.length).toBe(1);
        expect(signalData[0].symbol).toBe('NIFTY 50');
        expect(signalData[0].lastPrice).toBe(18000);

        done();
      }, 50);
    });
  });
});
