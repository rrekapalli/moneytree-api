# Implementation Plan

## Overview
This implementation plan breaks down the Strategy page refactor into discrete, manageable coding tasks. Each task builds incrementally on previous work, following the architecture and design patterns established in the design document.

---

## Tasks

- [x] 1. Database schema setup
  - Create migration script for strategies, strategy_config, and strategy_metrics tables
  - Add indexes for performance optimization
  - Test migration on development database
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Backend API - Strategy CRUD operations
  - [x] 2.1 Create Strategy entity and repository
    - Implement Strategy JPA entity with UUID primary key
    - Create StrategyRepository interface extending JpaRepository
    - Add custom query methods for filtering by user and status
    - _Requirements: 12.1_
  
  - [x] 2.2 Implement Strategy service layer
    - Create StrategyService with CRUD operations
    - Add validation logic for strategy creation/updates
    - Implement soft delete or cascade delete logic
    - _Requirements: 2.1, 2.2, 2.3, 10.2, 10.3_
  
  - [x] 2.3 Create Strategy REST API endpoints
    - GET /api/strategies - List all strategies for user
    - GET /api/strategies/{id} - Get strategy by ID
    - POST /api/strategies - Create new strategy
    - PUT /api/strategies/{id} - Update strategy
    - DELETE /api/strategies/{id} - Delete strategy
    - _Requirements: 1.1, 2.1, 2.3, 4.3, 10.1, 10.4_

- [x] 3. Backend API - Strategy Configuration
  - [x] 3.1 Create StrategyConfig entity and repository
    - Implement StrategyConfig JPA entity with JSONB fields
    - Create StrategyConfigRepository interface
    - Add validation for JSONB structure
    - _Requirements: 12.2_
  
  - [x] 3.2 Implement StrategyConfig service layer
    - Create StrategyConfigService for configuration management
    - Add validation for universe, allocations, entry/exit conditions
    - Implement configuration versioning if needed
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 3.3 Create StrategyConfig REST API endpoints
    - GET /api/strategies/{id}/config - Get strategy configuration
    - PUT /api/strategies/{id}/config - Update strategy configuration
    - POST /api/strategies/{id}/validate-config - Validate configuration
    - _Requirements: 5.1, 5.6_

- [x] 4. Backend API - Strategy Metrics
  - [x] 4.1 Create StrategyMetrics entity and repository
    - Implement StrategyMetrics JPA entity
    - Create StrategyMetricsRepository with time-series queries
    - Add aggregation methods for performance calculations
    - _Requirements: 12.3_
  
  - [x] 4.2 Implement StrategyMetrics service layer
    - Create StrategyMetricsService for metrics management
    - Add methods to calculate and store performance metrics
    - Implement metrics aggregation logic
    - _Requirements: 3.2, 7.2_
  
  - [x] 4.3 Create StrategyMetrics REST API endpoints
    - GET /api/strategies/{id}/metrics - Get latest metrics
    - GET /api/strategies/{id}/metrics/history - Get historical metrics
    - _Requirements: 3.2, 3.3_

- [x] 5. Backend API - Backtest Integration
  - [x] 5.1 Create Backtest service integration
    - Implement BacktestService to trigger backtest execution
    - Add methods to query backtest_runs and backtest_trades tables
    - Implement backtest status tracking
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 5.2 Create Backtest REST API endpoints
    - POST /api/strategies/{id}/backtest - Trigger backtest execution
    - GET /api/strategies/{id}/backtests - List all backtests for strategy
    - GET /api/backtests/{runId} - Get backtest run details
    - GET /api/backtests/{runId}/trades - Get backtest trades
    - _Requirements: 6.1, 6.3, 6.5, 7.1, 7.3, 7.4, 7.5_

- [x] 5.3 Backend checkpoint - Verify all backend APIs
  - Run `mvn clean compile` - ensure no compilation errors
  - Run `mvn test` - ensure all tests pass
  - Test all API endpoints with Postman or curl
  - Verify database schema is correct
  - Commit: `git commit -m "feat: complete backend API implementation for strategies"`

- [x] 6. Frontend - Core types and interfaces
  - Create strategy.types.ts with all TypeScript interfaces
  - Define StrategyDto, StrategyWithMetrics, StrategyConfig interfaces
  - Define UniverseDefinition, AllocationRules, TradingCondition interfaces
  - Define BacktestRun and BacktestTrade interfaces
  - _Requirements: All (foundational)_

- [x] 7. Frontend - API service layer
  - [x] 7.1 Create StrategyApiService
    - Implement getStrategies() method
    - Implement getStrategy(id) method
    - Implement createStrategy(strategy) method
    - Implement updateStrategy(id, strategy) method
    - Implement deleteStrategy(id) method
    - Add error handling and retry logic
    - _Requirements: 1.1, 2.1, 2.3, 4.3, 10.1, 10.4_
  
  - [x] 7.2 Create StrategyConfigApiService
    - Implement getConfig(strategyId) method
    - Implement updateConfig(strategyId, config) method
    - Implement validateConfig(strategyId, config) method
    - _Requirements: 5.1, 5.6_
  
  - [x] 7.3 Create StrategyMetricsApiService
    - Implement getMetrics(strategyId) method
    - Implement getMetricsHistory(strategyId) method
    - _Requirements: 3.2, 3.3_
  
  - [x] 7.4 Create BacktestApiService
    - Implement triggerBacktest(strategyId, params) method
    - Implement getBacktests(strategyId) method
    - Implement getBacktestRun(runId) method
    - Implement getBacktestTrades(runId) method
    - _Requirements: 6.1, 6.3, 7.1, 7.3, 7.4_

- [x] 8. Frontend - Main StrategiesComponent
  - [x] 8.1 Create component structure and basic layout
    - Generate StrategiesComponent with Angular CLI
    - Set up two-panel layout HTML structure
    - Import required PrimeNG modules
    - Set up ChangeDetectionStrategy.OnPush
    - _Requirements: 11.1_
  
  - [x] 8.2 Implement strategy list sidebar
    - Add search input with debounced filtering
    - Add sort dropdown with multiple sort options
    - Implement strategy card display with metrics
    - Add ScrollPanel for vertical scrolling
    - Implement loading and error states
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 8.3 Implement strategy selection and state management
    - Add click handler for strategy selection
    - Implement selected state highlighting
    - Add keyboard navigation support
    - Update URL with deep linking
    - _Requirements: 1.3_
  
  - [x] 8.4 Implement filtering and sorting logic
    - Add search text filtering
    - Add sort field and order logic
    - Implement applyFilters() method
    - Add clear filters functionality
    - _Requirements: 1.5_
  
  - [x] 8.5 Implement caching and performance optimization
    - Add strategy cache with timestamp
    - Implement cache invalidation logic
    - Add lazy loading flags for tabs
    - Optimize change detection
    - _Requirements: Performance (design doc)_
  
  - [x] 8.6 Add Create Strategy functionality
    - Implement createStrategy() method
    - Create empty strategy object for new creation
    - Switch to Details tab on create
    - _Requirements: 2.1_

- [x] 9. Frontend - Tab navigation and routing
  - [x] 9.1 Implement tab structure with PrimeNG Tabs
    - Add p-tabs component with 4 tabs
    - Set up tab change handler
    - Implement deep linking for tabs
    - Add ARIA labels for accessibility
    - _Requirements: 11.3_
  
  - [x] 9.2 Implement lazy loading for tab content
    - Add flags for each tab (holdingsLoaded, etc.)
    - Load data only when tab is activated
    - Prevent duplicate loads
    - _Requirements: Performance (design doc)_

- [x] 9.3 Main component checkpoint - Verify core functionality
  - Run `npm run build` - ensure no TypeScript errors
  - Test strategy list loading and display
  - Test search and filtering
  - Test strategy selection
  - Test tab navigation
  - Verify no console errors in browser
  - Commit: `git commit -m "feat: complete main strategies component with sidebar and tabs"`

- [x] 10. Frontend - Overview tab component
  - [x] 10.1 Create OverviewComponent structure
    - Generate component with Angular CLI
    - Set up component inputs and outputs
    - Create HTML template structure
    - _Requirements: 3.1_
  
  - [x] 10.2 Implement performance metrics display
    - Display total return, CAGR, Sharpe ratio
    - Display max drawdown, win rate, total trades
    - Add metric cards with icons
    - Format numbers and percentages
    - _Requirements: 3.2_
  
  - [x] 10.3 Implement performance chart
    - Add chart component (strategy vs benchmark)
    - Fetch and display performance data
    - Add chart legend and tooltips
    - _Requirements: 3.3_
  
  - [x] 10.4 Display recent trades and positions
    - Create trades table with recent entries
    - Display current positions if any
    - Add loading states
    - _Requirements: 3.4_
  
  - [x] 10.5 Add strategy status indicators
    - Display status badge (Active, Paused, Backtesting, Error)
    - Add status-specific styling
    - Show last execution time
    - _Requirements: 3.5_

- [x] 11. Frontend - Details tab component
  - [x] 11.1 Create DetailsComponent structure
    - Generate component with Angular CLI
    - Set up form with reactive forms
    - Add component inputs and outputs
    - _Requirements: 4.1_
  
  - [x] 11.2 Implement strategy details form
    - Add input fields for name, description, risk profile
    - Add form validation rules
    - Implement dirty state tracking
    - Add Save and Cancel buttons
    - _Requirements: 4.1, 4.2_
  
  - [x] 11.3 Implement save and cancel operations
    - Add save handler with API integration
    - Add cancel handler to revert changes
    - Show success/error notifications
    - Update sidebar on successful save
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 12. Frontend - Configure tab component
  - [ ] 12.1 Create ConfigureComponent structure
    - Generate component with Angular CLI
    - Set up accordion structure with 4 sections
    - Add component inputs and outputs
    - _Requirements: 5.1_
  
  - [ ] 12.2 Implement Universe accordion
    - Add selection controls for index, sector, custom symbols
    - Implement multi-select for indices and sectors
    - Add symbol search/autocomplete
    - Display selected universe summary
    - _Requirements: 5.2_
  
  - [ ] 12.3 Implement Allocations accordion
    - Add position sizing method dropdown
    - Add input for max position size percentage
    - Add input for max portfolio allocation
    - Add input for cash reserve percentage
    - Add validation for percentage ranges
    - _Requirements: 5.3_
  
  - [ ] 12.4 Implement Entry Conditions accordion
    - Create rule builder interface
    - Add condition type dropdown (Technical, Price, Volume)
    - Add indicator selection dropdown
    - Add operator dropdown (GT, LT, EQ, etc.)
    - Add value input field
    - Allow multiple conditions with AND/OR logic
    - _Requirements: 5.4_
  
  - [ ] 12.5 Implement Exit Conditions accordion
    - Reuse rule builder from Entry Conditions
    - Add stop-loss percentage input
    - Add take-profit percentage input
    - Add trailing stop percentage input
    - _Requirements: 5.5_
  
  - [ ] 12.6 Implement configuration validation and save
    - Validate at least one entry and exit condition
    - Validate percentage ranges
    - Add Save Configuration button
    - Show validation errors
    - _Requirements: 5.6_
  
  - [ ] 12.7 Add Run Backtest functionality
    - Add "Run Backtest" button in Configure tab
    - Create backtest parameters dialog
    - Add date range picker and initial capital input
    - Trigger backtest execution via API
    - Show progress indicators
    - _Requirements: 6.1, 6.2_

- [ ] 13. Frontend - Backtest Results tab component
  - [ ] 13.1 Create BacktestResultsComponent structure
    - Generate component with Angular CLI
    - Set up component inputs and outputs
    - Create HTML template structure
    - _Requirements: 7.1_
  
  - [ ] 13.2 Implement backtest summary metrics
    - Display total return, CAGR, Sharpe ratio, Sortino ratio
    - Display max drawdown, win rate, total trades, profit factor
    - Add metric cards with formatting
    - _Requirements: 7.2_
  
  - [ ] 13.3 Implement equity curve chart
    - Add chart component for equity curve
    - Compare strategy vs buy-and-hold benchmark
    - Add chart legend and tooltips
    - _Requirements: 7.3_
  
  - [ ] 13.4 Implement trades table
    - Create table with all backtest trades
    - Add columns: entry date, exit date, symbol, prices, shares, P/L, holding period
    - Add sorting and filtering
    - Add pagination if needed
    - _Requirements: 7.4_
  
  - [ ] 13.5 Handle empty state
    - Display message when no backtest results exist
    - Add button to navigate to Configure tab
    - _Requirements: 7.5_

- [ ] 14. Frontend - Strategy activation and deletion
  - [ ] 14.1 Implement strategy activation toggle
    - Add toggle button in sidebar or details
    - Validate configuration before activation
    - Call API to update is_active status
    - Show confirmation notification
    - Update UI to reflect status change
    - _Requirements: 9.1, 9.2, 9.4, 9.5_
  
  - [ ] 14.2 Implement strategy deletion
    - Add delete button with confirmation dialog
    - Check for active positions before deletion
    - Call API to delete strategy
    - Remove from sidebar on success
    - Handle empty state after last deletion
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 15. Frontend - Styling and UI consistency
  - [ ] 15.1 Copy and adapt SCSS from Portfolios page
    - Copy portfolios.component.scss as base
    - Adapt class names for strategies
    - Ensure consistent spacing and colors
    - _Requirements: 11.2, 11.4_
  
  - [ ] 15.2 Implement responsive design
    - Test two-panel layout on different screen sizes
    - Add mobile-specific styles if needed
    - Ensure tables are scrollable on mobile
    - _Requirements: 11.1_
  
  - [ ] 15.3 Add loading and error states styling
    - Style loading spinners
    - Style error messages
    - Style empty states
    - _Requirements: 11.5_

- [ ] 15.4 Frontend checkpoint - Verify all components
  - Run `npm run build` - ensure no errors or warnings
  - Test all tabs (Overview, Details, Configure, Backtest Results)
  - Test all CRUD operations (Create, Read, Update, Delete)
  - Test strategy activation/deactivation
  - Test backtest execution and results display
  - Verify UI matches Portfolios page styling
  - Check for console errors and warnings
  - Commit: `git commit -m "feat: complete frontend implementation with all tabs and styling"`

- [ ] 16. Integration and testing
  - [ ] 16.1 Connect frontend to backend APIs
    - Test all API endpoints with frontend
    - Verify data flow for all operations
    - Test error handling
    - Run `npm run build` and `mvn clean compile` - ensure no errors
    - Commit: `git commit -m "feat: integrate frontend with backend APIs"`
  
  - [ ] 16.2 Test complete user flows
    - Test create → configure → backtest → view results flow
    - Test strategy activation/deactivation
    - Test strategy deletion
    - Test search and filtering
    - Document any issues found
    - Fix all issues before proceeding
    - Commit: `git commit -m "test: verify all user flows work correctly"`
  
  - [ ] 16.3 Perform accessibility audit
    - Test keyboard navigation
    - Verify ARIA labels
    - Test with screen reader
    - Fix accessibility issues
    - Run `npm run build` - ensure no errors
    - Commit: `git commit -m "a11y: fix accessibility issues"`
  
  - [ ] 16.4 Performance testing
    - Test with large number of strategies (50+)
    - Verify caching works correctly
    - Test lazy loading behavior
    - Optimize if needed
    - Run `npm run build` - ensure no errors
    - Commit: `git commit -m "perf: optimize strategy page performance"`

- [ ] 17. Final checkpoint - Complete verification
  - Run `mvn clean compile` - ensure backend compiles without errors
  - Run `npm run build` - ensure frontend builds without errors or warnings
  - Run `mvn test` - ensure all backend tests pass
  - Test the complete application end-to-end
  - Verify all requirements are met
  - Check for any console errors or warnings
  - Review all git commits for completeness
  - Create final commit: `git commit -m "feat: complete strategy page refactor - all features implemented and tested"`
  - Ask the user if any questions or issues arise

---

## Task Completion Guidelines

### Before Marking a Task Complete:
1. **Verify No Errors/Warnings:**
   - Run `npm run build` for frontend changes (ensure no TypeScript errors or warnings)
   - Run `mvn clean compile` for backend changes (ensure no compilation errors)
   - Run `getDiagnostics` tool to check for any code issues
   - Fix all errors and warnings before proceeding

2. **Test the Changes:**
   - Manually test the implemented functionality
   - Verify the feature works as expected
   - Check for console errors in browser (for frontend)
   - Check application logs (for backend)

3. **Git Commit:**
   - Stage all changes: `git add .`
   - Commit with descriptive message: `git commit -m "feat: [task description] - [summary of changes]"`
   - Example: `git commit -m "feat: implement strategy CRUD API endpoints - added GET, POST, PUT, DELETE endpoints for strategies"`

### Commit Message Format:
- Use conventional commit format: `type: description`
- Types: `feat` (new feature), `fix` (bug fix), `refactor` (code refactoring), `style` (formatting), `test` (adding tests)
- Include task number in description when applicable
- Keep messages concise but descriptive

### Example Workflow:
```bash
# After completing task 2.3
npm run build                    # Verify no errors
git add .
git commit -m "feat(task-2.3): add strategy REST API endpoints - implemented GET, POST, PUT, DELETE for /api/strategies"

# After completing task 8.2
npm run build                    # Verify no errors
git add .
git commit -m "feat(task-8.2): implement strategy list sidebar - added search, sort, and strategy cards with ScrollPanel"
```

## Notes

- Tasks marked with sub-items should be completed in order
- Each task references specific requirements from the requirements document
- Frontend tasks follow the patterns established in the Portfolios page
- Backend tasks follow Spring Boot and JPA best practices
- All tasks should include appropriate error handling and validation
- **IMPORTANT:** Do not proceed to the next task until current task is error-free and committed to git
