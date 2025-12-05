# Implementation Plan

- [x] 1. Set up backend infrastructure for instrument filtering
  - Create InstrumentDto class for data transfer
  - Update CacheConfig to include new cache names with 7-day TTL
  - Add cache name constants for exchanges, indices, and segments
  - Verify no compilation errors or warnings using getDiagnostics
  - Run backend build to ensure no errors: `mvn clean compile -DskipTests`
  - Commit changes: "feat: add InstrumentDto and cache config for instrument filters"
  - _Requirements: 3.1, 3.2, 3.3, 8.2_

- [x] 2. Implement backend repository methods for distinct filter values
  - Add getDistinctExchanges() method to KiteMarketDataRepository
  - Add getDistinctIndices() method to KiteMarketDataRepository (query tradingsymbol where segment='INDICES')
  - Add getDistinctSegments() method to KiteMarketDataRepository
  - Ensure all methods exclude NULL and empty strings, and sort results alphabetically
  - Verify no compilation errors or warnings using getDiagnostics
  - Run backend build: `mvn clean compile -DskipTests`
  - Commit changes: "feat: add repository methods for distinct filter values"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Write property test for distinct values
  - **Property 4: Distinct values exclude nulls and empty strings**
  - **Validates: Requirements 2.4**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for distinct values excluding nulls"

- [x] 2.2 Write property test for alphabetical sorting
  - **Property 5: Distinct values are sorted alphabetically**
  - **Validates: Requirements 2.5**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for alphabetical sorting of distinct values"

- [x] 3. Implement backend repository method for filtered instruments
  - Add getFilteredInstruments(exchange, index, segment) method to KiteMarketDataRepository
  - Implement dynamic SQL query building with WHERE clauses for provided filters
  - Apply AND logic when multiple filters are provided
  - Include LIMIT 1000 to prevent excessive data transfer
  - Return all required fields: instrument_token, tradingsymbol, name, segment, exchange, instrument_type, last_price, lot_size, tick_size
  - Verify no compilation errors or warnings using getDiagnostics
  - Run backend build: `mvn clean compile -DskipTests`
  - Commit changes: "feat: add getFilteredInstruments method with dynamic query building"
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.1 Write property test for query filter inclusion
  - **Property 7: Query includes all provided filters**
  - **Validates: Requirements 4.2**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for query filter inclusion"

- [x] 3.2 Write property test for AND logic
  - **Property 3: AND logic for multiple filters**
  - **Validates: Requirements 4.3**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for AND logic in multiple filters"

- [x] 3.3 Write property test for response fields
  - **Property 8: Response includes required fields**
  - **Validates: Requirements 4.4**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for response field validation"

- [x] 4. Create InstrumentFilterController with REST endpoints
  - Create GET /api/v1/instruments/filters/exchanges endpoint with @Cacheable annotation
  - Create GET /api/v1/instruments/filters/indices endpoint with @Cacheable annotation
  - Create GET /api/v1/instruments/filters/segments endpoint with @Cacheable annotation
  - Create GET /api/v1/instruments/filtered endpoint with query parameters (exchange, index, segment)
  - Add Swagger/OpenAPI documentation for all endpoints
  - Implement error handling with appropriate HTTP status codes
  - Verify no compilation errors or warnings using getDiagnostics
  - Run backend build: `mvn clean compile -DskipTests`
  - Commit changes: "feat: add InstrumentFilterController with cached filter endpoints"
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 7.1, 7.2, 8.1_

- [x] 4.1 Write unit tests for controller endpoints
  - Test each distinct value endpoint returns non-empty list
  - Test filtered instruments endpoint with various parameter combinations
  - Test error handling returns HTTP 500 on database failure
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `mvn test -Dtest=InstrumentFilterControllerTest`
  - Commit changes: "test: add unit tests for InstrumentFilterController endpoints"
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 7.1, 7.2_

- [x] 4.2 Write property test for cache hit behavior
  - **Property 6: Cache hit avoids database access**
  - **Validates: Requirements 3.2**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `mvn test -Dtest=<TestClassName>#<testMethod>`
  - Commit changes: "test: add property test for cache hit behavior"

- [x] 5. Create frontend service for instrument filtering
  - Create InstrumentFilterService with HttpClient injection
  - Implement getDistinctExchanges() method
  - Implement getDistinctIndices() method
  - Implement getDistinctSegments() method
  - Implement getFilteredInstruments(filter) method with HttpParams
  - Add retry logic (retry(2)) for network failures
  - Add error handling with catchError operator
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build` (or `ng build`)
  - Commit changes: "feat: add InstrumentFilterService with retry and error handling"
  - _Requirements: 4.1, 7.4, 8.3_

- [x] 5.1 Write unit tests for InstrumentFilterService
  - Test each method calls correct endpoint
  - Test getFilteredInstruments builds correct query parameters
  - Test retry logic on network errors
  - Test error handling with catchError
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `npm test -- --include='**/instrument-filter.service.spec.ts'`
  - Commit changes: "test: add unit tests for InstrumentFilterService"
  - _Requirements: 4.1, 7.4_

- [x] 6. Create TypeScript interfaces for filter data models
  - Create FilterOptions interface (exchanges, indices, segments arrays)
  - Create InstrumentFilter interface (exchange, index, segment optional fields)
  - Create InstrumentDto interface matching backend DTO
  - Place interfaces in appropriate shared location
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "feat: add TypeScript interfaces for instrument filter data models"
  - _Requirements: 8.5_

- [x] 7. Update DashboardHeaderComponent to support filter dropdowns
  - Add @Input() showInstrumentFilters: boolean property
  - Add @Input() filterOptions: FilterOptions property
  - Add @Input() selectedFilters: InstrumentFilter property
  - Add @Input() isLoadingFilters: boolean property
  - Add @Output() onFilterChange: EventEmitter<InstrumentFilter>
  - Update component template to include three PrimeNG Select dropdowns
  - Implement filter change handlers that emit onFilterChange event
  - Style filter dropdowns to fit horizontally in header
  - Add loading indicators to dropdowns
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "feat: add instrument filter dropdowns to DashboardHeaderComponent"
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 5.4, 5.5, 8.4_

- [x] 7.1 Write property test for dropdown event emission
  - **Property 9: Dropdown selection emits event**
  - **Validates: Requirements 5.4**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `npm test -- --include='**/dashboard-header.component.spec.ts'`
  - Commit changes: "test: add property test for dropdown event emission"

- [x] 7.2 Write unit tests for DashboardHeaderComponent filter functionality
  - Test component initializes with provided filter options
  - Test filter change handlers emit correct events
  - Test loading state displays loading indicators
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `npm test -- --include='**/dashboard-header.component.spec.ts'`
  - Commit changes: "test: add unit tests for DashboardHeaderComponent filter functionality"
  - _Requirements: 5.2, 5.4, 5.5_

- [x] 8. Update StockInsightsComponent to manage filter state
  - Add showInstrumentFilters property (set to true)
  - Add filterOptions property with empty arrays
  - Add selectedFilters property with defaults (NSE, NIFTY 50, EQ)
  - Add isLoadingFilters and isLoadingInstruments properties
  - Inject InstrumentFilterService
  - Implement loadFilterOptions() method using forkJoin
  - Implement onFilterChange(filters) method with debouncing (300ms)
  - Implement loadFilteredInstruments() method
  - Implement mapInstrumentsToStockData() helper method
  - Update onChildInit() to call loadFilterOptions()
  - Update template to pass filter props to dashboard header
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "feat: add filter state management to StockInsightsComponent"
  - _Requirements: 1.2, 1.3, 1.4, 5.2, 6.1, 6.4_

- [x] 8.1 Write property test for filter change triggering update
  - **Property 1: Filter change triggers widget update**
  - **Validates: Requirements 1.3**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `npm test -- --include='**/stock-insights.component.spec.ts'`
  - Commit changes: "test: add property test for filter change triggering widget update"

- [x] 8.2 Write property test for filter state persistence
  - **Property 2: Filter state persistence**
  - **Validates: Requirements 1.4**
  - Verify test compiles without errors using getDiagnostics
  - Run test to ensure it passes: `npm test -- --include='**/stock-insights.component.spec.ts'`
  - Commit changes: "test: add property test for filter state persistence"

- [x] 8.3 Write unit tests for StockInsightsComponent filter management
  - Test loadFilterOptions() calls service and populates filterOptions
  - Test onFilterChange() updates selectedFilters
  - Test debouncing prevents excessive API calls
  - Test loadFilteredInstruments() maps data correctly
  - Test default filter values are set on initialization
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `npm test -- --include='**/stock-insights.component.spec.ts'`
  - Commit changes: "test: add unit tests for StockInsightsComponent filter management"
  - _Requirements: 1.2, 1.3, 1.4, 6.1_

- [-] 9. Update Stock List widget to display filtered instruments
  - Ensure Stock List widget receives updated data when filters change
  - Update widget to show loading indicator during data fetch
  - Add empty state message when no instruments match filters
  - Verify widget displays all required instrument fields
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "feat: update Stock List widget to display filtered instruments"
  - _Requirements: 1.3, 4.5, 6.2, 6.5_

- [-] 9.1 Write unit tests for Stock List widget updates
  - Test widget displays loading indicator when isLoadingInstruments is true
  - Test widget displays empty state message when data is empty
  - Test widget displays instruments when data is provided
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `npm test -- --include='**/stock-list-table.component.spec.ts'`
  - Commit changes: "test: add unit tests for Stock List widget updates"
  - _Requirements: 6.2, 6.5_

- [ ] 10. Implement error handling and user feedback
  - Add error notification display in StockInsightsComponent
  - Implement error handling in loadFilterOptions() with user-friendly messages
  - Implement error handling in loadFilteredInstruments() with user-friendly messages
  - Ensure previous data state is maintained on errors
  - Add toast notifications for errors using PrimeNG Toast
  - Verify no TypeScript errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "feat: add error handling and user feedback for filter operations"
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 10.1 Write unit tests for error handling
  - Test error notification displays on API failure
  - Test previous data state is maintained on error
  - Test retry logic attempts 2 retries before failing
  - Verify tests compile without errors using getDiagnostics
  - Run tests to ensure they pass: `npm test -- --include='**/stock-insights.component.spec.ts'`
  - Commit changes: "test: add unit tests for error handling"
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 11. Add CSS styling for filter dropdowns in dashboard header
  - Style filter dropdowns to display horizontally
  - Add appropriate spacing between dropdowns
  - Ensure dropdowns are responsive on smaller screens
  - Add labels above each dropdown
  - Match existing dashboard design system
  - Verify no CSS/SCSS errors or warnings
  - Run frontend build: `npm run build`
  - Commit changes: "style: add CSS styling for instrument filter dropdowns"
  - _Requirements: 5.1, 8.4_

- [ ] 12. Update dashboard header template to remove dynamic title
  - Remove or hide the dynamic title display that shows selected index symbol
  - Ensure filter dropdowns are prominently displayed in header
  - Maintain other header functionality (export, highlighting, search)
  - Verify no TypeScript/HTML errors or warnings using getDiagnostics
  - Run frontend build: `npm run build`
  - Commit changes: "refactor: replace dynamic title with filter dropdowns in dashboard header"
  - _Requirements: 1.1_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Run all backend tests: `mvn test`
  - Run all frontend tests: `npm test`
  - Verify no compilation errors in backend: `mvn clean compile`
  - Verify no compilation errors in frontend: `npm run build`
  - Ensure all tests pass, ask the user if questions arise
  - Commit changes if any fixes were made: "fix: resolve test failures and compilation errors"

- [ ] 14. Test end-to-end filter functionality
  - Manually test loading dashboard with default filters
  - Manually test changing each filter individually
  - Manually test changing all three filters together
  - Manually test with various filter combinations
  - Verify Stock List widget updates correctly
  - Verify loading indicators appear during data fetch
  - Verify error messages display on API failures
  - Test cache behavior (second request should be faster)
  - Document any issues found and resolve them
  - Commit changes if any fixes were made: "fix: resolve end-to-end testing issues"
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 6.2, 7.3_

- [ ] 15. Performance optimization and final polish
  - Verify debouncing works correctly (300ms delay)
  - Verify request cancellation on rapid filter changes
  - Test with large datasets (1000+ instruments)
  - Optimize SQL queries if needed
  - Add database query logging for debugging
  - Verify cache reduces database load
  - Run performance tests and document results
  - Verify no errors or warnings using getDiagnostics
  - Commit changes: "perf: optimize filter operations and add performance logging"
  - _Requirements: 6.1, 6.3, 6.4_

- [ ] 16. Final Checkpoint - Ensure all tests pass
  - Run all backend tests: `mvn test`
  - Run all frontend tests: `npm test`
  - Verify no compilation errors in backend: `mvn clean compile`
  - Verify no compilation errors in frontend: `npm run build`
  - Verify no TypeScript/Java errors or warnings using getDiagnostics
  - Ensure all tests pass, ask the user if questions arise
  - Create final commit: "feat: complete dashboard instrument filters implementation"
