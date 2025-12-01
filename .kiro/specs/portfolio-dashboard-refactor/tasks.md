# Implementation Plan

**Important:** After completing each task successfully without errors or warnings, commit the changes to local git with an appropriate summary message following the format: `feat(portfolios): [description]`, `test(portfolios): [description]`, `refactor(portfolios): [description]`, or `style(portfolios): [description]`.

- [x] 1. Update data models and API services
  - Create or update TypeScript interfaces for Portfolio, PortfolioHolding, PortfolioTrade, and PortfolioConfigForm
  - Update PortfolioApiService to include all CRUD operations
  - Create PortfolioHoldingApiService with methods for fetching and managing holdings
  - Create PortfolioTradeApiService with methods for fetching and managing trades
  - _Requirements: 1.1, 3.1, 6.1, 7.1_

- [x] 1.1 Write property test for API service methods
  - **Property 13: Save configuration API call**
  - **Validates: Requirements 5.2**

- [x] 1.2 Write property test for API service methods
  - **Property 21: Create portfolio API call**
  - **Validates: Requirements 8.3**

- [x] 2. Refactor main portfolios component structure
  - Update portfolios.component.html to implement two-panel layout (left sidebar + right detail panel)
  - Remove existing tab structure and prepare for new tab implementation
  - Update portfolios.component.ts to manage selectedPortfolio state and activeTab state
  - Update portfolios.component.scss to style the two-panel layout
  - _Requirements: 9.1_

- [x] 3. Implement portfolio sidebar with search and list
  - Create portfolio sidebar section in the template with search input
  - Implement search filtering logic in component
  - Create portfolio card template for sidebar items
  - Display all required portfolio fields (name, description, return %, stock count, outperformance, last executed, status)
  - Implement portfolio selection handler
  - Add visual highlighting for selected portfolio
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.1 Write property test for search filtering
  - **Property 4: Search filtering accuracy**
  - **Validates: Requirements 1.5**

- [x] 3.2 Write property test for portfolio display
  - **Property 1: Portfolio display completeness**
  - **Validates: Requirements 1.2**

- [x] 3.3 Write property test for portfolio selection
  - **Property 2: Portfolio selection updates detail panel**
  - **Validates: Requirements 1.3**

- [x] 3.4 Write property test for selection highlighting
  - **Property 3: Selected portfolio highlighting**
  - **Validates: Requirements 1.4**

- [ ] 4. Implement summary statistics cards
  - Update summary cards section to calculate and display total portfolios count
  - Add logic to calculate active portfolios count
  - Add logic to calculate conservative portfolios count
  - Add logic to calculate moderate portfolios count
  - Add logic to calculate aggressive portfolios count
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.1 Write property tests for summary statistics
  - **Property 5: Total portfolios count accuracy**
  - **Validates: Requirements 2.1**

- [ ] 4.2 Write property tests for summary statistics
  - **Property 6: Active portfolios count accuracy**
  - **Validates: Requirements 2.2**

- [ ] 4.3 Write property tests for summary statistics
  - **Property 7: Conservative portfolios count accuracy**
  - **Validates: Requirements 2.3**

- [ ] 4.4 Write property tests for summary statistics
  - **Property 8: Moderate portfolios count accuracy**
  - **Validates: Requirements 2.4**

- [ ] 4.5 Write property tests for summary statistics
  - **Property 9: Aggressive portfolios count accuracy**
  - **Validates: Requirements 2.5**

- [ ] 5. Implement tab navigation structure
  - Create new tab structure with Overview, Configure, Holdings, and Trades tabs
  - Implement tab switching logic
  - Ensure selected portfolio context is preserved across tab switches
  - _Requirements: 3.1, 3.5_

- [ ] 5.1 Write property test for tab visibility
  - **Property 10: Tab visibility on portfolio selection**
  - **Validates: Requirements 3.1**

- [ ] 5.2 Write property test for portfolio context preservation
  - **Property 11: Portfolio context preservation across tab switches**
  - **Validates: Requirements 3.5**

- [ ] 6. Implement Configure tab
  - Create Configure tab component or template section
  - Implement Basic Settings section (name, description inputs)
  - Implement Risk Profile section (risk profile and risk tolerance dropdowns)
  - Implement Rebalancing Strategy section (strategy dropdown and threshold input)
  - Implement Execution Preferences section (automated execution and notification toggles)
  - Implement Advanced Options section (tax harvesting toggle)
  - Add Save Configuration and Reset buttons
  - Implement form state management and validation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6.1 Write property test for configuration changes
  - **Property 12: Configuration changes enable save button**
  - **Validates: Requirements 5.1**

- [ ] 6.2 Write property test for form validation
  - **Property 20: Form validation enables save button**
  - **Validates: Requirements 8.2**

- [ ] 7. Implement save and reset functionality
  - Implement save handler that calls portfolio API service
  - Handle successful save response (update UI, show notification)
  - Handle save errors (display error message)
  - Implement reset handler that restores original form values
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7.1 Write property test for reset functionality
  - **Property 15: Reset restores original values**
  - **Validates: Requirements 5.5**

- [ ] 7.2 Write property test for error handling
  - **Property 14: API error handling displays error message**
  - **Validates: Requirements 5.4, 6.5, 7.5**

- [ ] 8. Implement Holdings tab
  - Create Holdings tab component or template section
  - Implement data fetching from PortfolioHoldingApiService when tab is activated
  - Create holdings table with columns: symbol, quantity, average cost, current price, unrealized PnL
  - Implement loading state with spinner
  - Implement empty state for no holdings
  - Implement error state for failed API calls
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8.1 Write property test for holdings API fetch
  - **Property 16: Holdings tab triggers API fetch**
  - **Validates: Requirements 6.1**

- [ ] 8.2 Write property test for holdings display
  - **Property 17: Holdings data display completeness**
  - **Validates: Requirements 6.2**

- [ ] 9. Implement Trades tab
  - Create Trades tab component or template section
  - Implement data fetching from PortfolioTradeApiService when tab is activated
  - Create trades table with columns: symbol, entry date, entry price, exit date, exit price, quantity, profit, profit %
  - Implement loading state with spinner
  - Implement empty state for no trades
  - Implement error state for failed API calls
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9.1 Write property test for trades API fetch
  - **Property 18: Trades tab triggers API fetch**
  - **Validates: Requirements 7.1**

- [ ] 9.2 Write property test for trades display
  - **Property 19: Trades data display completeness**
  - **Validates: Requirements 7.2**

- [ ] 10. Implement create portfolio functionality
  - Update Create Portfolio button handler to initialize empty portfolio form
  - Switch to Configure tab when creating new portfolio
  - Implement POST request to create new portfolio
  - Handle successful creation (add to sidebar, show notification)
  - Handle creation errors (display error message)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10.1 Write property test for successful creation
  - **Property 22: Successful creation updates sidebar**
  - **Validates: Requirements 8.4**

- [ ] 11. Implement visual styling and color coding
  - Apply color coding to portfolio return percentages (green for positive, red for negative)
  - Style portfolio cards with proper spacing and borders
  - Style selected portfolio with highlight
  - Apply consistent button styling (primary for Save, secondary for Reset)
  - Ensure responsive layout for different screen sizes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11.1 Write property test for return color coding
  - **Property 23: Return color coding**
  - **Validates: Requirements 9.2**

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement error handling and loading states
  - Add error handling for all API calls
  - Implement loading indicators for async operations
  - Add user-friendly error messages
  - Implement retry mechanisms where appropriate
  - _Requirements: 5.4, 6.3, 6.5, 7.3, 7.5_

- [ ] 14. Add accessibility features
  - Add ARIA labels to all interactive elements
  - Implement keyboard navigation support
  - Add screen reader announcements for dynamic content
  - Ensure proper focus management
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 14.1 Write unit tests for accessibility features
  - Test ARIA labels presence
  - Test keyboard navigation
  - Test focus management

- [ ] 15. Performance optimization
  - Implement debouncing for search input
  - Add caching for portfolio data
  - Optimize change detection strategy
  - Implement lazy loading for tab content
  - _Requirements: 1.5, 3.1, 6.1, 7.1_

- [ ] 15.1 Write unit tests for performance optimizations
  - Test search debouncing
  - Test caching behavior
  - Test lazy loading

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
