import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverallComponent } from './overall.component';
import { ExcelExportService, FilterService } from '@dashboards/public-api';
import { ComponentCommunicationService } from '../../../services/component-communication.service';
import { IndicesService } from '../../../services/apis/indices.api';
import { WebSocketService } from '../../../services/websockets';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import * as fc from 'fast-check';
import { of } from 'rxjs';

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
});
