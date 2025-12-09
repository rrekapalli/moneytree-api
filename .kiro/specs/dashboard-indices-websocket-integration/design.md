# Design Document: Dashboard Indices WebSocket Integration

## Overview

This design document outlines the integration of the `/ws/indices/all` WebSocket endpoint into the Angular dashboard's overall component. The solution leverages Angular v20 signals for reactive state management, enabling real-time updates of NSE indices data in the Index List widget while maintaining the existing fallback data mechanism.

The design follows a progressive enhancement approach: the component displays REST API fallback data immediately on load, then enhances it with real-time WebSocket updates when available. This ensures the dashboard remains functional even when WebSocket connectivity is unavailable.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Overall Component                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Angular Signals Layer                       │  │
│  │  • indicesData: WritableSignal<StockDataDto[]>      │  │
│  │  • selectedIndex: WritableSignal<string>             │  │
│  │  • wsConnected: WritableSignal<boolean>              │  │
│  │  • filteredIndices: Computed<StockDataDto[]>        │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         WebSocket Integration Layer                   │  │
│  │  • Subscribe to /topic/nse-indices                   │  │
│  │  • Parse incoming STOMP messages                     │  │
│  │  • Merge with fallback data                          │  │
│  │  • Update signals on data arrival                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            WebSocket Service                          │  │
│  │  • Connection management                             │  │
│  │  • STOMP client wrapper                              │  │
│  │  • Subscription lifecycle                            │  │
│  │  • Error handling & reconnection                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  SocketEngine Backend                        │
│  • /ws/indices/all endpoint                                 │
│  • STOMP broker                                             │
│  • Real-time NSE indices streaming                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Integration Flow

1. **Initialization Phase**
   - Component loads and displays fallback data from REST API
   - Signals are initialized with fallback data
   - WebSocket connection is established asynchronously

2. **Connection Phase**
   - WebSocket service connects to SocketEngine
   - Component subscribes to `/topic/nse-indices`
   - Connection state signal is updated

3. **Streaming Phase**
   - Real-time indices data arrives via WebSocket
   - Data is parsed and validated
   - Signals are updated, triggering automatic UI refresh
   - Existing fallback data is merged with real-time updates

4. **Cleanup Phase**
   - Component destruction triggers unsubscribe
   - WebSocket connection is cleaned up
   - All subscriptions are disposed

## Components and Interfaces

### Angular Signals Structure

```typescript
// Writable signals for mutable state
private indicesData = signal<StockDataDto[]>([]);
private selectedIndexSymbol = signal<string>('');
private wsConnectionState = signal<WebSocketConnectionState>(
  WebSocketConnectionState.DISCONNECTED
);

// Computed signals for derived state
protected filteredIndices = computed(() => {
  const data = this.indicesData();
  const selected = this.selectedIndexSymbol();
  // Apply filtering logic
  return data;
});

protected isWebSocketConnected = computed(() => 
  this.wsConnectionState() === WebSocketConnectionState.CONNECTED
);

// Effects for side effects
constructor() {
  // Log connection state changes
  effect(() => {
    const state = this.wsConnectionState();
    console.log('WebSocket state changed:', state);
  });
  
  // Update widget when data changes
  effect(() => {
    const data = this.indicesData();
    this.updateIndexListWidget(data);
  });
}
```

### WebSocket Integration Methods

```typescript
/**
 * Initialize WebSocket connection and subscribe to all indices
 */
private initializeWebSocketSubscription(): void {
  // Connect to WebSocket
  this.webSocketService.connect()
    .then(() => {
      // Subscribe to all indices topic
      this.allIndicesSubscription = this.webSocketService
        .subscribeToAllIndices()
        .subscribe({
          next: (indicesDto: IndicesDto) => {
            this.handleIncomingIndicesData(indicesDto);
          },
          error: (error) => {
            console.warn('WebSocket subscription error:', error);
            // Continue with fallback data
          }
        });
      
      // Update connection state signal
      this.wsConnectionState.set(WebSocketConnectionState.CONNECTED);
    })
    .catch((error) => {
      console.warn('WebSocket connection failed:', error);
      // Continue with fallback data
    });
}

/**
 * Handle incoming indices data from WebSocket
 */
private handleIncomingIndicesData(indicesDto: IndicesDto): void {
  if (!indicesDto?.indices || indicesDto.indices.length === 0) {
    return;
  }
  
  // Map WebSocket data to component format
  const newData = this.mapIndicesToStockData(indicesDto.indices);
  
  // Merge with existing data, preserving fallback entries
  const merged = this.mergeIndicesData(this.indicesData(), newData);
  
  // Update signal - this automatically triggers UI updates
  this.indicesData.set(merged);
}

/**
 * Merge WebSocket data with existing fallback data
 */
private mergeIndicesData(
  existing: StockDataDto[], 
  incoming: StockDataDto[]
): StockDataDto[] {
  const merged = new Map<string, StockDataDto>();
  
  // Add existing data
  existing.forEach(item => {
    const key = item.symbol || item.tradingsymbol;
    if (key) merged.set(key, item);
  });
  
  // Overlay incoming data
  incoming.forEach(item => {
    const key = item.symbol || item.tradingsymbol;
    if (key) merged.set(key, item);
  });
  
  return Array.from(merged.values());
}

/**
 * Cleanup WebSocket subscription
 */
private cleanupWebSocketSubscription(): void {
  if (this.allIndicesSubscription) {
    this.allIndicesSubscription.unsubscribe();
    this.allIndicesSubscription = null;
  }
  
  this.webSocketService.unsubscribeFromAll();
  this.wsConnectionState.set(WebSocketConnectionState.DISCONNECTED);
}
```

### Lifecycle Integration

```typescript
protected override onChildInit(): void {
  super.onChildInit();
  
  // Initialize signals with fallback data
  this.loadFallbackData();
  
  // Start WebSocket subscription (non-blocking)
  this.initializeWebSocketSubscription();
}

protected override onChildDestroy(): void {
  // Cleanup WebSocket
  this.cleanupWebSocketSubscription();
  
  super.onChildDestroy();
}

private loadFallbackData(): void {
  this.indicesService.getIndicesByExchangeSegment('NSE', 'INDICES')
    .subscribe({
      next: (indices) => {
        const mappedData = this.mapIndicesToStockData(indices || []);
        this.indicesData.set(mappedData);
      },
      error: (error) => {
        console.warn('Failed to load fallback data:', error);
      }
    });
}
```

## Data Models

### Existing Interfaces (No Changes Required)

The design reuses existing interfaces from the codebase:

- `IndicesDto` - WebSocket message wrapper containing array of indices
- `IndexDataDto` - Individual index data from WebSocket
- `StockDataDto` - Component's internal data format
- `WebSocketConnectionState` - Enum for connection states

### Signal Type Definitions

```typescript
// Signal types for type safety
type IndicesDataSignal = WritableSignal<StockDataDto[]>;
type SelectedIndexSignal = WritableSignal<string>;
type ConnectionStateSignal = WritableSignal<WebSocketConnectionState>;
type FilteredIndicesSignal = Signal<StockDataDto[]>;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: WebSocket subscription on connection
*For any* component initialization, when the WebSocket connection is established, the system should subscribe to the `/topic/nse-indices` topic
**Validates: Requirements 1.2**

### Property 2: Data merge preserves fallback
*For any* incoming WebSocket data, merging it with existing fallback data should preserve all fallback entries that are not updated
**Validates: Requirements 1.3, 3.4**

### Property 3: Connection failure preserves data
*For any* WebSocket connection failure, the existing fallback data should remain unchanged and displayed
**Validates: Requirements 2.3, 4.1**

### Property 4: Connection reuse
*For any* multiple component instances, only one WebSocket connection should be established and reused
**Validates: Requirements 2.4**

### Property 5: Price increase shows positive indicator
*For any* index where the new price is greater than the previous price, the system should display a positive change indicator
**Validates: Requirements 3.1**

### Property 6: Price decrease shows negative indicator
*For any* index where the new price is less than the previous price, the system should display a negative change indicator
**Validates: Requirements 3.2**

### Property 7: Selection persists across updates
*For any* selected index, when WebSocket data updates occur, the selection highlighting should be preserved
**Validates: Requirements 3.3**

### Property 8: Exponential backoff on reconnection
*For any* WebSocket connection loss, reconnection attempts should follow an exponential backoff pattern
**Validates: Requirements 4.2**

### Property 9: Data validation against interface
*For any* parsed WebSocket data, it should conform to the `IndicesDto` interface structure
**Validates: Requirements 5.2**

### Property 10: Invalid data skipped
*For any* invalid WebSocket data received, the system should log a warning and skip the update without affecting existing data
**Validates: Requirements 5.3**

### Property 11: Missing fields use defaults
*For any* WebSocket data with missing fields, the system should apply default values according to the interface definition
**Validates: Requirements 5.4**

### Property 12: Signal batching for rapid updates
*For any* sequence of rapid WebSocket updates, Angular signals should batch them for optimal performance
**Validates: Requirements 6.2**

### Property 13: Computed signals auto-recompute
*For any* change to source signals, computed signals that depend on them should automatically recompute their values
**Validates: Requirements 6.4**

### Property 14: Targeted UI updates
*For any* signal value change, only the components that depend on that signal should be updated
**Validates: Requirements 6.5**

### Property 15: Signal triggers automatic UI updates
*For any* indices signal change, the UI should update automatically without manual change detection calls
**Validates: Requirements 7.3**

## Error Handling

### Connection Errors

```typescript
private handleConnectionError(error: any): void {
  console.error('WebSocket connection error:', {
    message: error.message || error,
    timestamp: new Date().toISOString(),
    connectionState: this.wsConnectionState()
  });
  
  // Update connection state signal
  this.wsConnectionState.set(WebSocketConnectionState.ERROR);
  
  // Continue with fallback data - no user-facing error
}
```

### Data Parsing Errors

```typescript
private handleParsingError(rawMessage: string, error: any): void {
  console.warn('Failed to parse WebSocket message:', {
    rawMessage: rawMessage.substring(0, 200), // Log first 200 chars
    error: error.message || error,
    timestamp: new Date().toISOString()
  });
  
  // Skip this update, continue with existing data
}
```

### Subscription Errors

```typescript
private handleSubscriptionError(topic: string, error: any): void {
  console.error('WebSocket subscription error:', {
    topic,
    error: error.message || error,
    timestamp: new Date().toISOString()
  });
  
  // Attempt resubscription after delay
  setTimeout(() => {
    this.retrySubscription(topic);
  }, 5000);
}
```

### Validation Errors

```typescript
private validateIndicesData(data: any): data is IndicesDto {
  if (!data || typeof data !== 'object') {
    console.warn('Invalid data type received:', typeof data);
    return false;
  }
  
  if (!Array.isArray(data.indices)) {
    console.warn('Missing or invalid indices array');
    return false;
  }
  
  return true;
}
```

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Signal initialization with correct default values
- WebSocket subscription lifecycle (connect, subscribe, unsubscribe, disconnect)
- Data merging logic preserves fallback data
- Error handling logs errors and continues with fallback data
- Component cleanup properly disposes subscriptions

Example unit test structure:
```typescript
describe('OverallComponent WebSocket Integration', () => {
  let component: OverallComponent;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  
  beforeEach(() => {
    webSocketService = jasmine.createSpyObj('WebSocketService', [
      'connect', 'subscribeToAllIndices', 'unsubscribeFromAll', 'disconnect'
    ]);
    
    // Setup component with mocked service
  });
  
  it('should initialize signals with fallback data', () => {
    // Test signal initialization
  });
  
  it('should subscribe to WebSocket on init', () => {
    // Test subscription
  });
  
  it('should merge WebSocket data with fallback', () => {
    // Test data merging
  });
  
  it('should cleanup subscriptions on destroy', () => {
    // Test cleanup
  });
});
```

### Property-Based Testing

Property-based tests will use **fast-check** library (JavaScript/TypeScript property testing framework) to verify universal properties across many randomly generated inputs.

Each property-based test will run a minimum of 100 iterations with randomly generated data to ensure robustness.

Property tests will verify:
- Data merge always preserves fallback entries not in incoming data
- Invalid data never corrupts existing state
- Signal updates always trigger UI refresh
- Selection state persists across any data update
- Connection failures never lose existing data

Example property test structure:
```typescript
import * as fc from 'fast-check';

describe('Property-Based Tests', () => {
  it('Property 2: Data merge preserves fallback', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryStockData()),
        fc.array(arbitraryStockData()),
        (fallbackData, incomingData) => {
          const merged = component.mergeIndicesData(fallbackData, incomingData);
          
          // All fallback items not in incoming should be preserved
          fallbackData.forEach(item => {
            const inIncoming = incomingData.some(i => 
              i.symbol === item.symbol
            );
            if (!inIncoming) {
              expect(merged).toContain(item);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify:
- End-to-end flow from WebSocket message to UI update
- Interaction between WebSocketService and component
- Signal effects trigger correct side effects
- Widget updates reflect signal changes

### Manual Testing

Manual testing checklist:
1. Load dashboard and verify fallback data displays immediately
2. Observe WebSocket connection in browser DevTools
3. Verify real-time updates appear in Index List widget
4. Select an index and verify selection persists during updates
5. Disconnect network and verify dashboard continues with fallback data
6. Reconnect network and verify WebSocket reconnects automatically
7. Navigate away and verify subscriptions are cleaned up

## Performance Considerations

### Signal Optimization

- Use `computed()` for derived values to avoid redundant calculations
- Leverage Angular's automatic signal batching for multiple rapid updates
- Avoid unnecessary signal reads in templates

### WebSocket Optimization

- Single connection shared across all components
- Subscription to `/topic/nse-indices` provides all indices in one stream
- No per-index subscriptions needed, reducing overhead

### Memory Management

- Proper cleanup of subscriptions in `ngOnDestroy`
- Signal effects are automatically cleaned up by Angular
- Map-based merging for O(n) performance

### Change Detection

- Signals trigger targeted updates only for affected components
- No manual `detectChanges()` calls needed
- OnPush change detection strategy compatible

## Security Considerations

- WebSocket connection uses existing authentication from WebSocketService
- No sensitive data stored in signals (only market data)
- STOMP messages validated before processing
- Error messages sanitized to avoid information leakage

## Deployment Considerations

- Feature can be deployed independently (progressive enhancement)
- Fallback data ensures functionality without WebSocket
- No database schema changes required
- No backend API changes required (uses existing SocketEngine endpoint)

## Future Enhancements

1. **Selective Subscriptions**: Allow users to subscribe to specific indices only
2. **Historical Playback**: Replay historical WebSocket data for testing
3. **Performance Metrics**: Track WebSocket message rates and latency
4. **Offline Support**: Cache WebSocket data in IndexedDB for offline viewing
5. **Visual Connection Indicator**: Show WebSocket connection status in UI
