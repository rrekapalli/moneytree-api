# Implementation Plan

## Quality Assurance Process

After completing each major task, follow these steps:

1. **Verify No Errors/Warnings**: Run `getDiagnostics` on all modified files to ensure TypeScript compilation succeeds without errors or warnings
2. **Commit to Git**: Once error-free, commit changes to local git with a descriptive message following the format:
   - `feat(task-X): [description]` for new features
   - `refactor(task-X): [description]` for refactoring
   - `test(task-X): [description]` for tests
   - `fix(task-X): [description]` for bug fixes
3. **Verify Before Next Task**: Confirm tests pass and application builds successfully

Each major task includes a verification subtask (e.g., 1.2, 2.3, 3.4) to ensure quality before proceeding.

---

- [x] 1. Create PortfolioConfig interface and API service
  - Create TypeScript interface for PortfolioConfig matching backend entity structure
  - Create PortfolioConfigApiService with methods for GET, POST, PUT, DELETE operations
  - Add proper error handling and retry logic to API service
  - _Requirements: 2.1, 2.4_

- [x] 1.1 Write unit tests for PortfolioConfigApiService
  - Test successful API calls with mocked responses
  - Test error handling for various HTTP status codes
  - Test request payload formatting
  - _Requirements: 4.4, 5.2_

- [x] 1.2 Verify and commit task 1
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify TypeScript compilation succeeds
  - Commit to git with message: "feat(task-1): add PortfolioConfig interface and API service with tests"
  - _Requirements: 4.4_

- [x] 2. Create PortfolioDetailsComponent
  - Copy existing configure.component files to new details.component files
  - Rename component class and selector to portfolio-details
  - Update component to be standalone with proper imports
  - Keep existing form structure and functionality intact
  - _Requirements: 1.1, 1.2, 4.1_

- [x] 2.1 Write unit tests for PortfolioDetailsComponent
  - Test component initialization with portfolio data
  - Test form dirty state tracking
  - Test save button enable/disable logic
  - Test form validation
  - _Requirements: 1.3, 5.1_

- [x] 2.2 Write property test for form dirty tracking
  - **Property 1: Form dirty state reflects changes**
  - **Validates: Requirements 1.3, 2.3**

- [x] 2.3 Verify and commit task 2
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify component renders without errors
  - Commit to git with message: "feat(task-2): create PortfolioDetailsComponent with tests"
  - _Requirements: 4.1_

- [x] 3. Update PortfoliosComponent to include Details tab
  - Add PortfolioDetailsComponent to imports
  - Add "details" to tab list between "overview" and "configure"
  - Update tab order in template
  - Add routing support for "details" tab in URL
  - Update default tab selection logic for new portfolios
  - _Requirements: 1.1, 6.1, 6.2, 6.3_

- [x] 3.1 Write integration tests for tab navigation
  - Test tab order is correct
  - Test default tab selection
  - Test tab switching updates URL
  - Test deep linking to Details tab
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 3.2 Write property test for tab URL synchronization
  - **Property 4: Tab switching updates URL**
  - **Validates: Requirements 6.4**

- [x] 3.3 Write property test for deep link navigation
  - **Property 5: Deep link navigation displays correct tab**
  - **Validates: Requirements 6.5**

- [x] 3.4 Verify and commit task 3
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify tab navigation works correctly
  - Commit to git with message: "feat(task-3): add Details tab to PortfoliosComponent with navigation tests"
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Refactor PortfolioConfigureComponent for config management
  - Update component to use PortfolioConfigApiService
  - Add config loading logic in ngOnChanges
  - Implement getDefaultConfig() method with default values from backend entity
  - Update form to use PortfolioConfig interface
  - Add logic to determine POST vs PUT based on config existence
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 4.1 Write unit tests for config loading
  - Test loading existing config
  - Test handling missing config (defaults)
  - Test error handling for failed config load
  - _Requirements: 2.2, 5.2_

- [x] 4.2 Verify and commit task 4
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify config loading works correctly
  - Commit to git with message: "refactor(task-4): update PortfolioConfigureComponent to use config API"
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 5. Create Configure tab form sections
  - Create Trading Configuration section with fields: tradingMode, signalCheckInterval, lookbackDays, enableConditionalLogging, cacheDurationSeconds, exchange, candleInterval
  - Create Historical Cache Configuration section with fields: historicalCacheEnabled, historicalCacheLookbackDays, historicalCacheExchange, historicalCacheInstrumentType, historicalCacheCandleInterval, historicalCacheTtlSeconds
  - Create Redis Configuration section with fields: redisEnabled, redisHost, redisPort, redisPassword, redisDb, redisKeyPrefix
  - Create Entry Conditions section with fields: entryBbLower, entryRsiThreshold, entryMacdTurnPositive, entryVolumeAboveAvg, entryFallbackSmaPeriod, entryFallbackAtrMultiplier
  - Create Exit Conditions section with fields: exitTakeProfitPct, exitStopLossAtrMult, exitAllowTpExitsOnly
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.1 Write unit tests for form sections
  - Test all sections render correctly
  - Test all fields are present in each section
  - Test field types and validation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.2 Verify and commit task 5
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify all form sections render correctly
  - Commit to git with message: "feat(task-5): create Configure tab form sections with tests"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 6. Implement form validation for Configure tab
  - Add required field validation for tradingMode, signalCheckInterval, lookbackDays
  - Add conditional validation for Redis fields when redisEnabled is true
  - Add range validation for entryRsiThreshold (0-100)
  - Add positive number validation for numeric fields
  - Update save button to disable when form is invalid
  - _Requirements: 5.1_

- [x] 6.1 Write property test for required field validation
  - **Property 3: Required field validation disables save**
  - **Validates: Requirements 5.1**

- [x] 6.2 Verify and commit task 6
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify form validation works correctly
  - Commit to git with message: "feat(task-6): implement form validation for Configure tab"
  - _Requirements: 5.1_

- [x] 7. Implement save functionality for Configure tab
  - Add saveConfiguration() method that calls POST or PUT based on configExists flag
  - Add success message display on successful save
  - Add error handling for save failures
  - Update form dirty state after successful save
  - _Requirements: 2.4, 2.5, 5.2_

- [x] 7.1 Write integration tests for config save
  - Test creating new config (POST)
  - Test updating existing config (PUT)
  - Test error handling for failed saves
  - Test success message display
  - _Requirements: 2.4, 2.5, 5.2_

- [x] 7.2 Write property test for API error handling
  - **Property 2: API error handling displays messages**
  - **Validates: Requirements 5.2**

- [x] 7.3 Verify and commit task 7
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify save functionality works for both create and update
  - Commit to git with message: "feat(task-7): implement save functionality for Configure tab with tests"
  - _Requirements: 2.4, 2.5, 5.2_

- [x] 8. Update parent component config loading
  - Add portfolioConfig state variable
  - Add configLoading and configError state variables
  - Add loadPortfolioConfig() method
  - Call loadPortfolioConfig() when Configure tab is activated
  - Pass config data to PortfolioConfigureComponent
  - _Requirements: 2.1, 4.5_

- [x] 8.1 Write unit tests for config loading in parent
  - Test config loading on tab activation
  - Test lazy loading behavior
  - Test error handling
  - _Requirements: 2.1, 4.5_

- [x] 8.2 Verify and commit task 8
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify config loading works on tab activation
  - Commit to git with message: "feat(task-8): add config loading to parent component with tests"
  - _Requirements: 2.1, 4.5_

- [x] 9. Add dropdown options for Configure tab
  - Create tradingModeOptions: ["paper", "live"]
  - Create exchangeOptions: ["NSE", "BSE"]
  - Create candleIntervalOptions: ["minute", "day", "week", "month"]
  - Create instrumentTypeOptions: ["EQ", "FUT", "OPT"]
  - Pass options to PortfolioConfigureComponent
  - _Requirements: 3.2, 3.3_

- [x] 9.1 Verify and commit task 9
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify dropdown options display correctly
  - Commit to git with message: "feat(task-9): add dropdown options for Configure tab"
  - _Requirements: 3.2, 3.3_

- [x] 10. Style Configure tab sections
  - Add CSS for section headers and grouping
  - Add visual separation between sections
  - Ensure consistent spacing and alignment
  - Maintain responsive layout
  - Follow existing design patterns from Details tab
  - _Requirements: 3.1_

- [x] 10.1 Verify and commit task 10
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify styling looks correct and responsive
  - Commit to git with message: "style(task-10): add styling for Configure tab sections"
  - _Requirements: 3.1_

- [-] 11. Update error handling for all API calls
  - Ensure network errors (status 0) show connection message
  - Ensure auth errors (status 401) clear token and redirect
  - Ensure authorization errors (status 403) show permission message
  - Ensure not found errors (status 404) show appropriate message
  - Ensure validation errors (status 400) show specific field errors
  - Ensure server errors (status 500+) show retry option
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 11.1 Write unit tests for error scenarios
  - Test each error status code handling
  - Test error message display
  - Test retry functionality
  - _Requirements: 5.2, 5.3, 5.4_

- [-] 11.2 Verify and commit task 11
  - Run getDiagnostics on all modified files to ensure no errors/warnings
  - Verify error handling works for all scenarios
  - Commit to git with message: "feat(task-11): enhance error handling for all API calls with tests"
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Manual testing and refinement
  - Test creating new portfolio via Details tab
  - Test editing existing portfolio via Details tab
  - Test creating new config via Configure tab
  - Test editing existing config via Configure tab
  - Test switching between all tabs
  - Test deep linking to each tab
  - Test with portfolio that has no config
  - Test validation errors in both tabs
  - Test API error scenarios
  - Test form reset functionality
  - Verify all existing tabs still work (Overview, Holdings, Trades)
  - _Requirements: All_

- [ ] 14. Documentation updates
  - Update component documentation with new Details tab
  - Document PortfolioConfig interface
  - Document API service methods
  - Add inline code comments for complex logic
  - _Requirements: 4.1, 4.2_
