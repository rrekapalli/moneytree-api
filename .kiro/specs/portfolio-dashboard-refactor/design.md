# Design Document

## Overview

The Portfolios component refactoring introduces a modern two-panel layout that enhances portfolio management capabilities. The left panel displays a searchable list of portfolios with key metrics, while the right panel provides detailed views through four tabs: Overview, Configure, Holdings, and Trades. This design integrates seamlessly with existing backend APIs (PortfolioController, PortfolioHoldingController, PortfolioTradeController) and follows Angular best practices with reactive state management.

## Architecture

### Component Structure

```
PortfoliosComponent (Container)
├── Summary Cards Section
├── Two-Panel Layout
│   ├── Left Sidebar
│   │   ├── Search Input
│   │   ├── View Toggle (Grid/List)
│   │   └── Portfolio List
│   │       └── Portfolio Card (repeated)
│   └── Right Panel
│       └── Tab Container
│           ├── Overview Tab
│           ├── Configure Tab
│           ├── Holdings Tab
│           └── Trades Tab
```

### State Management

- Component-level state for UI interactions (selected portfolio, active tab)
- RxJS observables for API data streams
- Local state for form inputs in Configure tab
- Derived state for computed values (summary statistics, filtered lists)

### API Integration

**Portfolio API** (`/api/portfolio`)
- GET `/api/portfolio` - List all portfolios
- POST `/api/portfolio` - Create new portfolio
- GET `/api/portfolio/{id}` - Get portfolio details
- PUT `/api/portfolio/{id}` - Update portfolio
- DELETE `/api/portfolio/{id}` - Delete portfolio

**Holdings API** (`/api/portfolio/{portfolioId}/holdings`)
- GET `/api/portfolio/{portfolioId}/holdings` - List holdings
- GET `/api/portfolio/{portfolioId}/holdings/{symbol}` - Get specific holding
- POST `/api/portfolio/{portfolioId}/holdings` - Create holding
- PUT `/api/portfolio/{portfolioId}/holdings/{id}` - Update holding
- DELETE `/api/portfolio/{portfolioId}/holdings/{id}` - Delete holding

**Trades API** (`/api/portfolio/{portfolioId}/trades`)
- GET `/api/portfolio/{portfolioId}/trades` - List trades (with optional symbol filter)
- GET `/api/portfolio/{portfolioId}/trades/{id}` - Get specific trade
- POST `/api/portfolio/{portfolioId}/trades` - Create trade
- PUT `/api/portfolio/{portfolioId}/trades/{id}` - Update trade
- DELETE `/api/portfolio/{portfolioId}/trades/{id}` - Delete trade

## Components and Interfaces

### PortfoliosComponent

**Responsibilities:**
- Manage overall layout and state
- Fetch portfolio list from API
- Handle portfolio selection
- Coordinate tab navigation
- Manage summary statistics

**Key Properties:**
```typescript
portfolios: Portfolio[]
selectedPortfolio: Portfolio | null
activeTab: 'overview' | 'configure' | 'holdings' | 'trades'
searchText: string
viewMode: 'grid' | 'list'
loading: boolean
error: string | null
```

**Key Methods:**
```typescript
loadPortfolios(): void
selectPortfolio(portfolio: Portfolio): void
createPortfolio(): void
onTabChange(tab: string): void
filterPortfolios(): Portfolio[]
```

### Portfolio Sidebar Card

**Display Fields:**
- Portfolio name
- Description (truncated)
- Total return percentage (with color coding)
- Stock count
- Outperformance vs benchmark
- Last execution date
- Status indicator (Active/Inactive)

### Configure Tab Component

**Form Sections:**

1. **Basic Settings**
   - Name (text input)
   - Description (textarea)

2. **Risk Profile**
   - Risk Profile dropdown (Conservative, Moderate, Aggressive)
   - Risk Tolerance dropdown (Low, Medium, High)

3. **Rebalancing Strategy**
   - Strategy dropdown (Quarterly, Monthly, Threshold-based)
   - Threshold percentage input

4. **Execution Preferences**
   - Automated Execution toggle
   - Notification Settings toggle

5. **Advanced Options**
   - Tax Harvesting toggle

**Actions:**
- Save Configuration button (primary)
- Reset button (secondary)

### Holdings Tab Component

**Table Columns:**
- Symbol
- Quantity
- Average Cost
- Current Price (fetched from market data)
- Unrealized P&L
- Unrealized P&L %

**Features:**
- Sortable columns
- Loading state
- Empty state
- Error handling

### Trades Tab Component

**Table Columns:**
- Symbol
- Entry Date
- Entry Price
- Exit Date
- Exit Price
- Quantity
- Profit/Loss
- Profit/Loss %
- Exit Type (TP/SL)
- Holding Days

**Features:**
- Sortable columns
- Date range filter
- Symbol filter
- Loading state
- Empty state
- Error handling

## Data Models

### Portfolio Interface
```typescript
interface Portfolio {
  id: string;
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  isActive: boolean;
  targetAllocation?: Record<string, any>;
  initialCapital?: number;
  currentCash?: number;
  tradingMode?: 'paper' | 'live';
  strategyName?: string;
  strategyParams?: Record<string, any>;
  // Extended properties for UI
  totalReturn?: number;
  benchmarkReturn?: number;
  outperformance?: number;
  stockCount?: number;
  lastExecuted?: string;
}
```

### PortfolioHolding Interface
```typescript
interface PortfolioHolding {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  lastUpdated: string;
  // Computed properties
  currentPrice?: number;
  unrealizedPnl?: number;
  unrealizedPnlPct?: number;
}
```

### PortfolioTrade Interface
```typescript
interface PortfolioTrade {
  tradeId: string;
  portfolioId: string;
  symbol: string;
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  quantity: number;
  principal: number;
  profit: number;
  profitPct: number;
  exitType: 'TP' | 'SL';
  keptShares?: number;
  keptCash?: number;
  holdingDays: number;
  orderIdEntry?: string;
  orderIdExit?: string;
}
```

### PortfolioConfigForm Interface
```typescript
interface PortfolioConfigForm {
  name: string;
  description: string;
  riskProfile: string;
  riskTolerance: string;
  rebalancingStrategy: string;
  rebalancingThreshold: number;
  automatedExecution: boolean;
  notificationSettings: boolean;
  taxHarvesting: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


Property 1: Portfolio display completeness
*For any* portfolio in the sidebar list, all required fields (name, description, total return percentage, stock count, outperformance, last execution date, and status) should be rendered
**Validates: Requirements 1.2**

Property 2: Portfolio selection updates detail panel
*For any* portfolio in the sidebar, clicking it should update the right panel to display that portfolio's details
**Validates: Requirements 1.3**

Property 3: Selected portfolio highlighting
*For any* selected portfolio, the sidebar should apply a highlight style to that portfolio card
**Validates: Requirements 1.4**

Property 4: Search filtering accuracy
*For any* search query, the filtered portfolio list should only include portfolios whose names contain the search text (case-insensitive)
**Validates: Requirements 1.5**

Property 5: Total portfolios count accuracy
*For any* portfolio list, the total portfolios summary card should display a count equal to the length of the portfolio array
**Validates: Requirements 2.1**

Property 6: Active portfolios count accuracy
*For any* portfolio list, the active portfolios summary card should display a count equal to the number of portfolios where isActive is true
**Validates: Requirements 2.2**

Property 7: Conservative portfolios count accuracy
*For any* portfolio list, the conservative portfolios summary card should display a count equal to the number of portfolios where riskProfile equals 'CONSERVATIVE'
**Validates: Requirements 2.3**

Property 8: Moderate portfolios count accuracy
*For any* portfolio list, the moderate portfolios summary card should display a count equal to the number of portfolios where riskProfile equals 'MODERATE'
**Validates: Requirements 2.4**

Property 9: Aggressive portfolios count accuracy
*For any* portfolio list, the aggressive portfolios summary card should display a count equal to the number of portfolios where riskProfile equals 'AGGRESSIVE'
**Validates: Requirements 2.5**

Property 10: Tab visibility on portfolio selection
*For any* selected portfolio, all four tabs (Overview, Configure, Holdings, Trades) should be rendered and visible
**Validates: Requirements 3.1**

Property 11: Portfolio context preservation across tab switches
*For any* portfolio and any sequence of tab switches, the selected portfolio should remain unchanged
**Validates: Requirements 3.5**

Property 12: Configuration changes enable save button
*For any* modification to portfolio configuration form fields, the Save Configuration button should become enabled
**Validates: Requirements 5.1**

Property 13: Save configuration API call
*For any* portfolio update via Save Configuration, a PUT request should be sent to `/api/portfolio/{id}` with the updated portfolio data
**Validates: Requirements 5.2**

Property 14: API error handling displays error message
*For any* failed API request (save, fetch holdings, fetch trades), an error message should be displayed to the user
**Validates: Requirements 5.4, 6.5, 7.5**

Property 15: Reset restores original values
*For any* portfolio configuration, modifying form fields and then clicking Reset should restore all fields to their original values
**Validates: Requirements 5.5**

Property 16: Holdings tab triggers API fetch
*For any* portfolio, when the Holdings tab is selected, a GET request should be sent to `/api/portfolio/{portfolioId}/holdings`
**Validates: Requirements 6.1**

Property 17: Holdings data display completeness
*For any* holdings data received from the API, the table should display all required columns (symbol, quantity, average cost, current price, unrealized PnL)
**Validates: Requirements 6.2**

Property 18: Trades tab triggers API fetch
*For any* portfolio, when the Trades tab is selected, a GET request should be sent to `/api/portfolio/{portfolioId}/trades`
**Validates: Requirements 7.1**

Property 19: Trades data display completeness
*For any* trades data received from the API, the table should display all required columns (symbol, entry date, entry price, exit date, exit price, quantity, profit, profit percentage)
**Validates: Requirements 7.2**

Property 20: Form validation enables save button
*For any* new portfolio form, when all required fields are filled with valid data, the Save Configuration button should be enabled
**Validates: Requirements 8.2**

Property 21: Create portfolio API call
*For any* new portfolio creation, a POST request should be sent to `/api/portfolio` with the portfolio data
**Validates: Requirements 8.3**

Property 22: Successful creation updates sidebar
*For any* successfully created portfolio, the new portfolio should appear in the sidebar list
**Validates: Requirements 8.4**

Property 23: Return color coding
*For any* portfolio with positive total return, the return percentage should be displayed in green color, and for negative return, in red color
**Validates: Requirements 9.2**

## Error Handling

### API Error Scenarios

1. **Network Errors**
   - Display user-friendly error message
   - Provide retry mechanism
   - Log error details for debugging

2. **Authentication Errors (401)**
   - Clear invalid tokens
   - Redirect to login page
   - Display session expired message

3. **Not Found Errors (404)**
   - Display "Portfolio not found" message
   - Offer to refresh portfolio list
   - Handle gracefully without breaking UI

4. **Server Errors (500)**
   - Display generic error message
   - Log error details
   - Provide contact support option

### Form Validation Errors

1. **Required Field Validation**
   - Display inline error messages
   - Disable save button until valid
   - Highlight invalid fields

2. **Data Type Validation**
   - Validate numeric inputs (threshold percentage)
   - Validate date formats
   - Validate dropdown selections

### Loading States

1. **Initial Load**
   - Display skeleton loaders for portfolio cards
   - Show loading spinner in summary cards
   - Disable interactions during load

2. **Tab Data Loading**
   - Display loading spinner in tab content area
   - Maintain tab navigation availability
   - Show loading message

3. **Save Operation**
   - Disable save button during save
   - Show loading indicator on button
   - Prevent duplicate submissions

## Code Quality and Version Control

### Error-Free Implementation

All code changes must be implemented without errors or warnings:
- Run TypeScript compiler checks after each task
- Use `getDiagnostics` tool to verify no compilation errors
- Fix all linting warnings before proceeding
- Ensure all tests pass before marking task complete

### Git Commit Strategy

After each task is successfully completed without errors or warnings:
1. Stage all related changes
2. Commit with a descriptive message following this format:
   - `feat(portfolios): [task description]` for new features
   - `refactor(portfolios): [task description]` for refactoring
   - `test(portfolios): [task description]` for test additions
   - `style(portfolios): [task description]` for styling changes
3. Example commit messages:
   - `feat(portfolios): implement two-panel layout with sidebar`
   - `feat(portfolios): add portfolio search and filtering`
   - `test(portfolios): add property tests for summary statistics`
   - `refactor(portfolios): update Configure tab with new form sections`

### Quality Gates

Before completing each task:
- [ ] All TypeScript compilation errors resolved
- [ ] All linting warnings addressed
- [ ] All related tests passing
- [ ] Code formatted according to project standards
- [ ] Changes committed to local git with appropriate message

## Testing Strategy

### Unit Testing

**Component Tests:**
- Test component initialization and lifecycle
- Test event handlers (click, input change)
- Test computed properties (summary statistics)
- Test form validation logic
- Test API service integration (mocked)

**Service Tests:**
- Test API service methods
- Test HTTP request construction
- Test response parsing
- Test error handling

**Pipe/Utility Tests:**
- Test date formatting
- Test number formatting
- Test currency formatting
- Test search/filter functions

### Property-Based Testing

Property-based tests will be implemented using **fast-check** (for TypeScript/JavaScript). Each property test should run a minimum of 100 iterations to ensure comprehensive coverage across random inputs.

**Test Tagging Convention:**
Each property-based test must include a comment tag in this exact format:
```typescript
// **Feature: portfolio-dashboard-refactor, Property {number}: {property_text}**
```

**Property Test Coverage:**
- Portfolio list filtering with random search queries
- Summary statistics calculations with random portfolio arrays
- Form validation with random input combinations
- API request construction with random portfolio data
- Color coding logic with random return values
- Tab navigation with random tab sequences

### Integration Testing

**Component Integration:**
- Test sidebar and detail panel interaction
- Test tab switching with data loading
- Test form submission with API calls
- Test error handling across components

**API Integration:**
- Test portfolio CRUD operations
- Test holdings data fetching
- Test trades data fetching
- Test error responses

### End-to-End Testing

**User Workflows:**
- Create new portfolio workflow
- Update existing portfolio workflow
- View holdings and trades workflow
- Search and filter portfolios workflow
- Tab navigation workflow

## Performance Considerations

### Optimization Strategies

1. **Virtual Scrolling**
   - Implement virtual scrolling for large portfolio lists
   - Render only visible portfolio cards
   - Improve initial load performance

2. **Lazy Loading**
   - Load tab content only when tab is activated
   - Defer non-critical data fetching
   - Implement pagination for large datasets

3. **Caching**
   - Cache portfolio list data
   - Cache holdings and trades data with TTL
   - Implement smart cache invalidation

4. **Debouncing**
   - Debounce search input (300ms)
   - Debounce form input changes
   - Prevent excessive API calls

5. **Change Detection**
   - Use OnPush change detection strategy
   - Minimize unnecessary re-renders
   - Optimize computed properties

### Performance Metrics

- Initial load time: < 2 seconds
- Tab switch time: < 500ms
- Search response time: < 200ms
- Form save time: < 1 second

## Accessibility

### ARIA Labels

- Add aria-labels to all interactive elements
- Use aria-live regions for dynamic content updates
- Implement aria-expanded for collapsible sections

### Keyboard Navigation

- Support tab navigation through all interactive elements
- Implement keyboard shortcuts for common actions
- Ensure focus management during tab switches

### Screen Reader Support

- Provide descriptive labels for form inputs
- Announce loading states
- Announce error messages
- Provide context for data tables

## Security Considerations

### Data Protection

- Sanitize user inputs to prevent XSS
- Validate all form inputs on client and server
- Use HTTPS for all API communications
- Implement CSRF protection

### Authentication

- Verify authentication tokens before API calls
- Handle token expiration gracefully
- Implement secure token storage
- Clear sensitive data on logout

### Authorization

- Verify user permissions for portfolio operations
- Implement role-based access control
- Validate portfolio ownership before operations
- Prevent unauthorized data access
