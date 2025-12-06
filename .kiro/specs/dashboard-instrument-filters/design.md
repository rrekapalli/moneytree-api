# Design Document

## Overview

This design implements a dynamic filtering system for the Stock Insights Dashboard, replacing the static title with three interactive dropdown filters: Exchange, Index, and Segment. The system consists of backend REST endpoints for fetching distinct filter values and filtered instruments, with Redis-based caching for performance optimization. The frontend integrates these filters into the dashboard header component and updates the Stock List widget based on user selections.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Dashboard Header Component                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │Exchange ▼│  │ Index  ▼ │  │Segment ▼ │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Stock List Widget                               │ │
│  │  Displays filtered instruments from API                 │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (Spring Boot)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      InstrumentFilterController                         │ │
│  │  GET /api/v1/instruments/filters/exchanges             │ │
│  │  GET /api/v1/instruments/filters/indices               │ │
│  │  GET /api/v1/instruments/filters/segments              │ │
│  │  GET /api/v1/instruments/filtered                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      KiteMarketDataRepository                           │ │
│  │  - getDistinctExchanges()                              │ │
│  │  - getDistinctIndices()                                │ │
│  │  - getDistinctSegments()                               │ │
│  │  - getFilteredInstruments()                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Redis Cache (7-day TTL)                         │ │
│  │  - instrumentFilters:exchanges                          │ │
│  │  - instrumentFilters:indices                            │ │
│  │  - instrumentFilters:segments                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ JDBC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL/TimescaleDB                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      kite_instrument_master                             │ │
│  │  - instrument_token (PK)                               │ │
│  │  - exchange (PK)                                       │ │
│  │  - tradingsymbol                                       │ │
│  │  - name                                                │ │
│  │  - segment                                             │ │
│  │  - instrument_type                                     │ │
│  │  - last_price                                          │ │
│  │  - lot_size, tick_size, etc.                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Initial Load**: Dashboard loads → Fetch distinct filter values from cache/DB → Populate dropdowns with default selections (NSE, NIFTY 50, EQ)
2. **Filter Change**: User selects filter → Emit event to parent component → Call filtered instruments API → Update Stock List widget
3. **Cache Strategy**: First request hits DB → Store in Redis with 7-day TTL → Subsequent requests served from cache

## Components and Interfaces

### Backend Components

#### 1. InstrumentFilterController

REST controller providing filter metadata and filtered instrument endpoints.

**Endpoints:**

```java
@RestController
@RequestMapping("/api/v1/instruments")
@Tag(name = "Instrument Filters", description = "Instrument filtering operations")
public class InstrumentFilterController {
    
    @GetMapping("/filters/exchanges")
    @Cacheable(value = "instrumentFilters:exchanges", unless = "#result == null || #result.isEmpty()")
    public ResponseEntity<List<String>> getDistinctExchanges();
    
    @GetMapping("/filters/indices")
    @Cacheable(value = "instrumentFilters:indices", unless = "#result == null || #result.isEmpty()")
    public ResponseEntity<List<String>> getDistinctIndices();
    
    @GetMapping("/filters/segments")
    @Cacheable(value = "instrumentFilters:segments", unless = "#result == null || #result.isEmpty()")
    public ResponseEntity<List<String>> getDistinctSegments();
    
    @GetMapping("/filtered")
    public ResponseEntity<List<InstrumentDto>> getFilteredInstruments(
        @RequestParam(required = false) String exchange,
        @RequestParam(required = false) String index,
        @RequestParam(required = false) String segment
    );
}
```

#### 2. KiteMarketDataRepository (Enhanced)

Add new methods to existing repository for filter operations.

**New Methods:**

```java
public class KiteMarketDataRepository {
    
    /**
     * Get distinct exchange values from kite_instrument_master
     */
    public List<String> getDistinctExchanges() {
        String sql = """
            SELECT DISTINCT exchange 
            FROM kite_instrument_master 
            WHERE exchange IS NOT NULL AND exchange != ''
            ORDER BY exchange
            """;
        return jdbcTemplate.queryForList(sql, String.class);
    }
    
    /**
     * Get distinct index tradingsymbols where segment = 'INDICES'
     */
    public List<String> getDistinctIndices() {
        String sql = """
            SELECT DISTINCT tradingsymbol 
            FROM kite_instrument_master 
            WHERE segment = 'INDICES' 
              AND tradingsymbol IS NOT NULL 
              AND tradingsymbol != ''
            ORDER BY tradingsymbol
            """;
        return jdbcTemplate.queryForList(sql, String.class);
    }
    
    /**
     * Get distinct segment values from kite_instrument_master
     */
    public List<String> getDistinctSegments() {
        String sql = """
            SELECT DISTINCT segment 
            FROM kite_instrument_master 
            WHERE segment IS NOT NULL AND segment != ''
            ORDER BY segment
            """;
        return jdbcTemplate.queryForList(sql, String.class);
    }
    
    /**
     * Get filtered instruments based on exchange, index, and segment
     * When index is provided, it filters by tradingsymbol matching the index
     * and segment = 'INDICES' to get the index constituents
     */
    public List<Map<String, Object>> getFilteredInstruments(
            String exchange, String index, String segment) {
        
        StringBuilder sql = new StringBuilder("""
            SELECT instrument_token, tradingsymbol, name, segment, 
                   exchange, instrument_type, last_price, lot_size, tick_size
            FROM kite_instrument_master
            WHERE 1=1
            """);
        
        List<Object> params = new ArrayList<>();
        
        if (exchange != null && !exchange.isEmpty()) {
            sql.append(" AND UPPER(exchange) = UPPER(?)");
            params.add(exchange);
        }
        
        if (index != null && !index.isEmpty()) {
            // When index is selected, we want instruments that belong to that index
            // This typically means filtering by a specific criteria
            // For now, we'll filter by tradingsymbol matching the index name
            sql.append(" AND UPPER(tradingsymbol) LIKE UPPER(?)");
            params.add("%" + index + "%");
        }
        
        if (segment != null && !segment.isEmpty()) {
            sql.append(" AND UPPER(segment) = UPPER(?)");
            params.add(segment);
        }
        
        sql.append(" ORDER BY tradingsymbol LIMIT 1000");
        
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }
}
```

#### 3. InstrumentDto

Data transfer object for instrument data.

```java
public class InstrumentDto {
    private String instrumentToken;
    private String tradingsymbol;
    private String name;
    private String segment;
    private String exchange;
    private String instrumentType;
    private Double lastPrice;
    private Integer lotSize;
    private Double tickSize;
    
    // Getters, setters, constructors
}
```

#### 4. CacheConfig (Enhanced)

Update cache configuration to include new cache names with 7-day TTL.

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    public static final String INSTRUMENT_FILTERS_EXCHANGES = "instrumentFilters:exchanges";
    public static final String INSTRUMENT_FILTERS_INDICES = "instrumentFilters:indices";
    public static final String INSTRUMENT_FILTERS_SEGMENTS = "instrumentFilters:segments";
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // 7-day TTL for instrument filters (rarely change)
        RedisCacheConfiguration filtersCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofDays(7))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();
        
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_EXCHANGES, filtersCacheConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_INDICES, filtersCacheConfig)
                .withCacheConfiguration(INSTRUMENT_FILTERS_SEGMENTS, filtersCacheConfig)
                .build();
    }
}
```

### Frontend Components

#### 1. InstrumentFilterService

Angular service for fetching filter metadata and filtered instruments.

```typescript
export interface FilterOptions {
  exchanges: string[];
  indices: string[];
  segments: string[];
}

export interface InstrumentFilter {
  exchange?: string;
  index?: string;
  segment?: string;
}

export interface InstrumentDto {
  instrumentToken: string;
  tradingsymbol: string;
  name: string;
  segment: string;
  exchange: string;
  instrumentType: string;
  lastPrice: number;
  lotSize: number;
  tickSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class InstrumentFilterService {
  private baseUrl = '/api/v1/instruments';
  
  constructor(private http: HttpClient) {}
  
  getDistinctExchanges(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/exchanges`);
  }
  
  getDistinctIndices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/indices`);
  }
  
  getDistinctSegments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/filters/segments`);
  }
  
  getFilteredInstruments(filter: InstrumentFilter): Observable<InstrumentDto[]> {
    let params = new HttpParams();
    if (filter.exchange) params = params.set('exchange', filter.exchange);
    if (filter.index) params = params.set('index', filter.index);
    if (filter.segment) params = params.set('segment', filter.segment);
    
    return this.http.get<InstrumentDto[]>(`${this.baseUrl}/filtered`, { params });
  }
}
```

#### 2. DashboardHeaderComponent (Enhanced)

Update dashboard header to include filter dropdowns.

**New Inputs:**
```typescript
@Input() showInstrumentFilters: boolean = false;
@Input() filterOptions: FilterOptions = { exchanges: [], indices: [], segments: [] };
@Input() selectedFilters: InstrumentFilter = {};
@Input() isLoadingFilters: boolean = false;
```

**New Outputs:**
```typescript
@Output() onFilterChange = new EventEmitter<InstrumentFilter>();
```

**Template Addition:**
```html
<!-- Instrument Filters Section -->
<div *ngIf="showInstrumentFilters" class="instrument-filters">
  <div class="filter-group">
    <label>Exchange</label>
    <p-select 
      [options]="exchangeOptions" 
      [(ngModel)]="selectedExchange"
      (onChange)="onExchangeChange()"
      [loading]="isLoadingFilters"
      placeholder="Select Exchange"
      [style]="{'width': '150px'}">
    </p-select>
  </div>
  
  <div class="filter-group">
    <label>Index</label>
    <p-select 
      [options]="indexOptions" 
      [(ngModel)]="selectedIndex"
      (onChange)="onIndexChange()"
      [loading]="isLoadingFilters"
      placeholder="Select Index"
      [style]="{'width': '200px'}">
    </p-select>
  </div>
  
  <div class="filter-group">
    <label>Segment</label>
    <p-select 
      [options]="segmentOptions" 
      [(ngModel)]="selectedSegment"
      (onChange)="onSegmentChange()"
      [loading]="isLoadingFilters"
      placeholder="Select Segment"
      [style]="{'width': '150px'}">
    </p-select>
  </div>
</div>
```

#### 3. StockInsightsComponent (Enhanced)

Update main dashboard component to manage filter state and update widgets.

**New Properties:**
```typescript
// Filter state
public showInstrumentFilters: boolean = true;
public filterOptions: FilterOptions = { exchanges: [], indices: [], segments: [] };
public selectedFilters: InstrumentFilter = {
  exchange: 'NSE',
  index: 'NIFTY 50',
  segment: 'EQ'
};
public isLoadingFilters: boolean = false;
public isLoadingInstruments: boolean = false;

// Debounce timer for filter changes
private filterChangeTimer: any = null;
```

**New Methods:**
```typescript
private loadFilterOptions(): void {
  this.isLoadingFilters = true;
  
  forkJoin({
    exchanges: this.instrumentFilterService.getDistinctExchanges(),
    indices: this.instrumentFilterService.getDistinctIndices(),
    segments: this.instrumentFilterService.getDistinctSegments()
  }).subscribe({
    next: (options) => {
      this.filterOptions = options;
      this.isLoadingFilters = false;
      this.cdr.detectChanges();
      
      // Load initial data with default filters
      this.loadFilteredInstruments();
    },
    error: (error) => {
      console.error('Failed to load filter options:', error);
      this.isLoadingFilters = false;
      this.cdr.detectChanges();
    }
  });
}

public onFilterChange(filters: InstrumentFilter): void {
  this.selectedFilters = { ...filters };
  
  // Debounce filter changes to prevent excessive API calls
  if (this.filterChangeTimer) {
    clearTimeout(this.filterChangeTimer);
  }
  
  this.filterChangeTimer = setTimeout(() => {
    this.loadFilteredInstruments();
  }, 300);
}

private loadFilteredInstruments(): void {
  this.isLoadingInstruments = true;
  
  this.instrumentFilterService.getFilteredInstruments(this.selectedFilters)
    .pipe(
      retry(2), // Retry up to 2 times on failure
      catchError((error) => {
        console.error('Failed to load filtered instruments:', error);
        this.isLoadingInstruments = false;
        this.cdr.detectChanges();
        return of([]);
      })
    )
    .subscribe({
      next: (instruments) => {
        // Map instruments to StockDataDto format
        const mappedData = this.mapInstrumentsToStockData(instruments);
        
        // Update dashboard data
        this.dashboardData = mappedData;
        this.filteredDashboardData = mappedData;
        
        // Update Stock List widget
        this.updateStockListWithFilteredData();
        
        this.isLoadingInstruments = false;
        this.cdr.detectChanges();
      }
    });
}

private mapInstrumentsToStockData(instruments: InstrumentDto[]): StockDataDto[] {
  return instruments.map(inst => ({
    tradingsymbol: inst.tradingsymbol,
    symbol: inst.tradingsymbol,
    companyName: inst.name || inst.tradingsymbol,
    lastPrice: inst.lastPrice || 0,
    percentChange: 0,
    totalTradedValue: 0,
    sector: inst.segment || '',
    industry: inst.instrumentType || ''
  }));
}
```

## Data Models

### Backend DTOs

```java
// InstrumentDto.java
public class InstrumentDto {
    private String instrumentToken;
    private String tradingsymbol;
    private String name;
    private String segment;
    private String exchange;
    private String instrumentType;
    private Double lastPrice;
    private Integer lotSize;
    private Double tickSize;
}

// FilterOptionsDto.java
public class FilterOptionsDto {
    private List<String> exchanges;
    private List<String> indices;
    private List<String> segments;
}
```

### Frontend Interfaces

```typescript
// instrument-filter.interface.ts
export interface FilterOptions {
  exchanges: string[];
  indices: string[];
  segments: string[];
}

export interface InstrumentFilter {
  exchange?: string;
  index?: string;
  segment?: string;
}

export interface InstrumentDto {
  instrumentToken: string;
  tradingsymbol: string;
  name: string;
  segment: string;
  exchange: string;
  instrumentType: string;
  lastPrice: number;
  lotSize: number;
  tickSize: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Filter change triggers widget update

*For any* filter value change (exchange, index, or segment), the Stock List widget should receive updated data matching the new filter criteria.
**Validates: Requirements 1.3**

### Property 2: Filter state persistence

*For any* filter selection made by the user, the selected values should remain in the component state throughout the session until explicitly changed.
**Validates: Requirements 1.4**

### Property 3: AND logic for multiple filters

*For any* combination of exchange, index, and segment filter values, the returned instruments should satisfy all three filter conditions simultaneously (AND logic, not OR).
**Validates: Requirements 1.5, 4.3**

### Property 4: Distinct values exclude nulls and empty strings

*For any* distinct value query (exchanges, indices, segments), the returned list should not contain null values or empty strings.
**Validates: Requirements 2.4**

### Property 5: Distinct values are sorted alphabetically

*For any* distinct value query (exchanges, indices, segments), the returned list should be sorted in alphabetical order.
**Validates: Requirements 2.5**

### Property 6: Cache hit avoids database access

*For any* cached filter value that has not expired, subsequent requests should return the cached data without querying the database.
**Validates: Requirements 3.2**

### Property 7: Query includes all provided filters

*For any* combination of filter parameters provided to the filtered instruments endpoint, the database query should include WHERE clauses for all non-null parameters.
**Validates: Requirements 4.2**

### Property 8: Response includes required fields

*For any* instrument returned by the filtered instruments endpoint, the response should include all required fields: instrument_token, tradingsymbol, name, segment, exchange, instrument_type, last_price, lot_size, tick_size.
**Validates: Requirements 4.4**

### Property 9: Dropdown selection emits event

*For any* option selected in any of the three filter dropdowns, a filter change event should be emitted to the parent component with the updated filter values.
**Validates: Requirements 5.4**

## Error Handling

### Backend Error Handling

1. **Database Connection Failures**: Return HTTP 500 with error message "Failed to fetch filter values" or "Failed to fetch instruments"
2. **Invalid Filter Parameters**: Return HTTP 400 with descriptive validation error
3. **Cache Failures**: Log error and fall back to database query
4. **Empty Result Sets**: Return HTTP 200 with empty array (not an error condition)

### Frontend Error Handling

1. **API Failures**: Display toast notification with user-friendly error message
2. **Network Errors**: Implement retry logic (up to 2 retries with exponential backoff)
3. **Empty Results**: Display "No instruments match the selected filters" message in Stock List widget
4. **Loading States**: Show loading indicators in dropdowns and widget during data fetch

### Error Recovery

1. **Retry Strategy**: Use RxJS `retry(2)` operator for transient network failures
2. **State Preservation**: Maintain previous data state when errors occur
3. **User Feedback**: Always provide clear error messages to users
4. **Graceful Degradation**: If filter options fail to load, allow manual entry or use cached values

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Test `getDistinctExchanges()` returns non-empty list
- Test `getDistinctIndices()` returns indices where segment='INDICES'
- Test `getDistinctSegments()` returns non-empty list
- Test `getFilteredInstruments()` with single filter parameter
- Test `getFilteredInstruments()` with all three filter parameters
- Test `getFilteredInstruments()` with no filter parameters
- Test error handling when database is unavailable
- Test cache hit scenario (mock cache)
- Test cache miss scenario (mock cache)

**Frontend Unit Tests:**
- Test `InstrumentFilterService.getDistinctExchanges()` calls correct endpoint
- Test `InstrumentFilterService.getFilteredInstruments()` builds correct query params
- Test `DashboardHeaderComponent` initializes with default filter values
- Test `DashboardHeaderComponent` emits event on filter change
- Test `StockInsightsComponent.onFilterChange()` updates selected filters
- Test `StockInsightsComponent.loadFilteredInstruments()` maps instruments correctly
- Test debounce logic prevents excessive API calls
- Test error handling displays error notification
- Test loading states are set correctly

### Property-Based Testing

**Property Tests:**

1. **Property 1: Filter change triggers widget update**
   - Generate random filter combinations
   - Verify widget receives updated data for each change
   - Tag: `Feature: dashboard-instrument-filters, Property 1: Filter change triggers widget update`

2. **Property 2: Filter state persistence**
   - Generate random filter selections
   - Verify state persists after each selection
   - Tag: `Feature: dashboard-instrument-filters, Property 2: Filter state persistence`

3. **Property 3: AND logic for multiple filters**
   - Generate random combinations of exchange, index, segment
   - Verify all returned instruments match all three criteria
   - Tag: `Feature: dashboard-instrument-filters, Property 3: AND logic for multiple filters`

4. **Property 4: Distinct values exclude nulls and empty strings**
   - Test all three distinct value endpoints
   - Verify no null or empty string values in results
   - Tag: `Feature: dashboard-instrument-filters, Property 4: Distinct values exclude nulls and empty strings`

5. **Property 5: Distinct values are sorted alphabetically**
   - Test all three distinct value endpoints
   - Verify results are in alphabetical order
   - Tag: `Feature: dashboard-instrument-filters, Property 5: Distinct values are sorted alphabetically`

6. **Property 6: Cache hit avoids database access**
   - Generate random filter value requests
   - Verify second request uses cache (mock database to verify no call)
   - Tag: `Feature: dashboard-instrument-filters, Property 6: Cache hit avoids database access`

7. **Property 7: Query includes all provided filters**
   - Generate random combinations of filter parameters
   - Verify SQL query includes WHERE clauses for all provided parameters
   - Tag: `Feature: dashboard-instrument-filters, Property 7: Query includes all provided filters`

8. **Property 8: Response includes required fields**
   - Generate random filter combinations
   - Verify all returned instruments have required fields
   - Tag: `Feature: dashboard-instrument-filters, Property 8: Response includes required fields`

9. **Property 9: Dropdown selection emits event**
   - Generate random dropdown selections
   - Verify event is emitted with correct filter values
   - Tag: `Feature: dashboard-instrument-filters, Property 9: Dropdown selection emits event`

### Integration Testing

- Test end-to-end flow: Load dashboard → Select filters → Verify Stock List updates
- Test cache expiration after 7 days (use shorter TTL for testing)
- Test concurrent filter changes
- Test filter changes with slow network (simulate delays)
- Test filter changes with database containing 10,000+ instruments

### Performance Testing

- Measure response time for distinct value queries
- Measure response time for filtered instruments query with various result set sizes
- Verify cache reduces database load
- Test debounce prevents excessive API calls during rapid filter changes

## Implementation Notes

### Database Considerations

1. **Indexes**: Existing indexes on `exchange`, `segment`, and `tradingsymbol` columns will optimize distinct value queries
2. **Query Performance**: DISTINCT queries on indexed columns should be fast (<100ms)
3. **Result Set Limits**: Implement LIMIT 1000 on filtered instruments query to prevent excessive data transfer

### Caching Strategy

1. **Cache Keys**: Use simple string keys: "instrumentFilters:exchanges", "instrumentFilters:indices", "instrumentFilters:segments"
2. **TTL**: 7 days (604800 seconds) for filter metadata
3. **Cache Warming**: Consider pre-loading cache on application startup
4. **Cache Invalidation**: Manual cache clear endpoint for admin use (optional)

### Frontend Performance

1. **Debouncing**: 300ms debounce on filter changes prevents excessive API calls
2. **Request Cancellation**: Cancel pending requests when new filter change occurs
3. **Lazy Loading**: Load filter options on dashboard initialization, not on app startup
4. **Memoization**: Consider memoizing filter options in service to avoid repeated API calls

### Backward Compatibility

1. **Dashboard Title**: Remove dynamic title based on selected index, replace with filter dropdowns
2. **Existing APIs**: No changes to existing endpoints, only new endpoints added
3. **Stock List Widget**: Update to accept filtered data, maintain existing display logic

### Security Considerations

1. **Input Validation**: Validate filter parameters on backend to prevent SQL injection
2. **Rate Limiting**: Consider rate limiting on filter endpoints to prevent abuse
3. **Authorization**: No special authorization required (public market data)

## Deployment Considerations

### Database Migration

No schema changes required. Existing `kite_instrument_master` table has all necessary columns and indexes.

### Cache Configuration

1. Ensure Redis is running and accessible
2. Update `application.properties` with Redis connection details
3. Verify cache configuration includes new cache names with 7-day TTL

### Frontend Build

1. Update Angular dependencies if needed (PrimeNG Select component)
2. Build and deploy frontend with new filter components
3. Verify API endpoints are accessible from frontend

### Rollback Plan

1. **Backend**: Remove new controller and repository methods
2. **Frontend**: Revert dashboard header to show static title
3. **Cache**: Clear instrument filter caches if needed

### Monitoring

1. **Metrics**: Track API response times for filter endpoints
2. **Cache Hit Rate**: Monitor Redis cache hit/miss ratio
3. **Error Rates**: Track error rates for filter operations
4. **User Behavior**: Track which filters are most commonly used
