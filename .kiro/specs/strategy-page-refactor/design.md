# Design Document

## Overview

This design document outlines the technical approach for refactoring the Strategy page in the MoneyTree application. The refactor will transform the current Strategy page to match the proven UI/UX patterns established by the Portfolios page, providing a consistent and intuitive user experience for managing trading strategies.

The Strategy page will feature a two-panel layout with a left sidebar for browsing strategies and a right panel with tabbed views for detailed strategy management. The implementation will leverage Angular 20, PrimeNG components, and follow the existing architectural patterns in the MoneyTree codebase.

## Architecture

### High-Level Architecture

The Strategy page follows a component-based architecture with clear separation of concerns:

```
StrategiesComponent (Main Container)
├── Left Sidebar
│   ├── Search & Filter Controls
│   ├── Strategy List (ScrollPanel)
│   │   └── Strategy Cards
│   ├── Loading State
│   └── Error State
└── Right Panel
    ├── No Selection State
    └── Strategy Detail (Tabs)
        ├── Overview Tab
        ├── Details Tab
        ├── Configure Tab
        │   ├── Universe Accordion
        │   ├── Allocations Accordion
        │   ├── Entry Conditions Accordion
        │   └── Exit Conditions Accordion
        └── Backtest Results Tab
            ├── Summary Metrics
            ├── Performance Chart
            └── Trades Table
```

### Component Structure

Following the Portfolios page pattern, the Strategy page will be organized as:

```
frontend/src/app/features/strategies/
├── strategies.component.ts          # Main container component
├── strategies.component.html        # Main template
├── strategies.component.scss        # Main styles
├── strategy.types.ts                # TypeScript interfaces
├── overview/
│   ├── overview.component.ts
│   ├── overview.component.html
│   └── overview.component.scss
├── details/
│   ├── details.component.ts
│   ├── details.component.html
│   └── details.component.scss
├── configure/
│   ├── configure.component.ts
│   ├── configure.component.html
│   └── configure.component.scss
└── backtest-results/
    ├── backtest-results.component.ts
    ├── backtest-results.component.html
    └── backtest-results.component.scss
```

### Service Layer

```
frontend/src/app/services/apis/
├── strategy.api.ts                  # Strategy CRUD operations
├── strategy-config.api.ts           # Strategy configuration operations
├── strategy-metrics.api.ts          # Strategy metrics operations
└── backtest.api.ts                  # Backtest execution and results
```

## Components and Interfaces

### Main Component: StrategiesComponent

**Responsibilities:**
- Manage strategy list state and filtering
- Handle strategy selection and navigation
- Coordinate tab switching and lazy loading
- Manage caching for performance optimization

**Key Properties:**
```typescript
strategies: StrategyWithMetrics[]
filteredStrategies: StrategyWithMetrics[]
selectedStrategy: StrategyWithMetrics | null
activeTab: 'overview' | 'details' | 'configure' | 'backtest-results'
loading: boolean
error: string | null
searchText: string
sortField: string
sortOrder: number
```

**Key Methods:**
```typescript
loadStrategies(): Promise<void>
selectStrategy(strategy: StrategyWithMetrics): void
createStrategy(): void
deleteStrategy(strategyId: string): void
onTabChange(tab: string): void
applyFilters(): void
```

### Child Components

#### OverviewComponent
- Display performance dashboard with key metrics
- Show performance chart (strategy vs benchmark)
- Display recent trades and current positions
- Show strategy status indicators

#### DetailsComponent
- Editable form for strategy name, description, risk profile
- Form validation and dirty state tracking
- Save/Cancel operations
- Integration with strategy API service

#### ConfigureComponent
- Four accordion sections: Universe, Allocations, Entry Conditions, Exit Conditions
- Rule builder interface for conditions
- Backtest execution trigger
- Configuration validation

#### BacktestResultsComponent
- Summary metrics display
- Equity curve chart
- Trades table with sorting and filtering
- Empty state when no results exist

## Data Models

### TypeScript Interfaces

```typescript
// strategy.types.ts

export interface StrategyDto {
  id: string;
  userId: string;
  name: string;
  description: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyWithMetrics extends StrategyDto {
  // Performance metrics
  totalReturn?: number;
  cagr?: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  winRate?: number;
  totalTrades?: number;
  lastBacktestDate?: string;
  status?: 'Active' | 'Inactive' | 'Backtesting' | 'Error';
}

export interface StrategyConfig {
  id: string;
  strategyId: string;
  universeDefinition: UniverseDefinition;
  allocations: AllocationRules;
  entryConditions: TradingCondition[];
  exitConditions: TradingCondition[];
  riskParameters: RiskParameters;
  updatedAt: string;
}

export interface UniverseDefinition {
  type: 'INDEX' | 'SECTOR' | 'CUSTOM';
  indices?: string[];        // e.g., ['NIFTY_500', 'NIFTY_MIDCAP']
  sectors?: string[];        // e.g., ['Technology', 'Finance']
  symbols?: string[];        // e.g., ['RELIANCE', 'TCS', 'INFY']
}

export interface AllocationRules {
  positionSizingMethod: 'EQUAL_WEIGHT' | 'RISK_PARITY' | 'CUSTOM';
  maxPositionSize: number;   // Percentage (e.g., 10 = 10%)
  maxPortfolioAllocation: number; // Percentage
  cashReserve: number;       // Percentage
}

export interface TradingCondition {
  id: string;
  type: 'TECHNICAL' | 'PRICE' | 'VOLUME' | 'CUSTOM';
  indicator?: string;        // e.g., 'RSI', 'MACD', 'SMA'
  operator: 'GT' | 'LT' | 'EQ' | 'CROSS_ABOVE' | 'CROSS_BELOW';
  value: number | string;
  timeframe?: string;        // e.g., 'day', 'week'
  logicalOperator?: 'AND' | 'OR'; // For combining multiple conditions
}

export interface RiskParameters {
  stopLossPercent?: number;
  takeProfitPercent?: number;
  trailingStopPercent?: number;
  maxDrawdownPercent?: number;
  maxDailyLoss?: number;
}

export interface BacktestRun {
  runId: string;
  strategyName: string;
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalEquity: number;
  totalReturnPct: number;
  cagr: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPct: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  createdAt: string;
}

export interface BacktestTrade {
  tradeId: string;
  runId: string;
  tradeDate: string;
  tradeType: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  shares: number;
  principal: number;
  profit: number;
  profitPct: number;
  holdingDays: number;
}
```

### Database Schema

#### strategies table
```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  risk_profile VARCHAR(50) CHECK (risk_profile IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT strategies_user_name_uk UNIQUE (user_id, name)
);

CREATE INDEX idx_strategies_user ON strategies(user_id);
CREATE INDEX idx_strategies_active ON strategies(is_active);
CREATE INDEX idx_strategies_updated ON strategies(updated_at DESC);
```

#### strategy_config table
```sql
CREATE TABLE strategy_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  universe_definition JSONB NOT NULL,
  allocations JSONB NOT NULL,
  entry_conditions JSONB NOT NULL,
  exit_conditions JSONB NOT NULL,
  risk_parameters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT strategy_config_strategy_uk UNIQUE (strategy_id)
);

CREATE INDEX idx_strategy_config_strategy ON strategy_config(strategy_id);
```

#### strategy_metrics table
```sql
CREATE TABLE strategy_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_return NUMERIC(10, 4),
  cagr NUMERIC(10, 4),
  sharpe_ratio NUMERIC(10, 4),
  sortino_ratio NUMERIC(10, 4),
  max_drawdown NUMERIC(10, 4),
  win_rate NUMERIC(5, 4),
  total_trades INTEGER,
  profit_factor NUMERIC(10, 4),
  avg_win NUMERIC(15, 2),
  avg_loss NUMERIC(15, 2),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT strategy_metrics_strategy_date_uk UNIQUE (strategy_id, metric_date)
);

CREATE INDEX idx_strategy_metrics_strategy ON strategy_metrics(strategy_id);
CREATE INDEX idx_strategy_metrics_date ON strategy_metrics(metric_date DESC);
```

**Note:** The existing `backtest_runs` and `backtest_trades` tables will be reused for storing backtest results. These tables already have the necessary structure for strategy backtesting.

## Error Handling

### Frontend Error Handling

**API Error Handling:**
```typescript
private handleStrategyLoadError(error: any): void {
  if (error.status === 0) {
    this.error = 'Unable to connect to the server. Please check your internet connection.';
  } else if (error.status === 401) {
    this.error = 'Your session has expired. Please log in again.';
    localStorage.removeItem('auth_token');
  } else if (error.status === 403) {
    this.error = 'You do not have permission to view strategies.';
  } else if (error.status === 404) {
    this.error = 'Strategy service not found. Please contact support.';
  } else if (error.status >= 500) {
    this.error = 'Server error occurred. Please try again later.';
  } else {
    this.error = error.error?.message || 'Failed to load strategies.';
  }
}
```

**Validation Errors:**
- Display inline validation messages for form fields
- Show toast notifications for save/delete operations
- Prevent invalid state transitions (e.g., activating incomplete strategies)

### Backend Error Handling

**Service Layer:**
- Validate all inputs before database operations
- Return appropriate HTTP status codes (400, 404, 500)
- Log errors with context for debugging
- Use custom exception classes for domain-specific errors

**Database Constraints:**
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate strategy names per user
- Check constraints validate enum values (risk_profile, status)

## Testing Strategy

### Unit Tests

**Component Tests:**
- Test strategy list filtering and sorting logic
- Test form validation in Details and Configure components
- Test tab switching and lazy loading behavior
- Test error state handling and display

**Service Tests:**
- Test API service methods with mocked HTTP responses
- Test data transformation and mapping logic
- Test error handling and retry logic

**Example Test Cases:**
```typescript
describe('StrategiesComponent', () => {
  it('should filter strategies by search text', () => {
    // Test search functionality
  });
  
  it('should sort strategies by different fields', () => {
    // Test sorting logic
  });
  
  it('should handle strategy selection', () => {
    // Test selection state management
  });
  
  it('should display error message when API fails', () => {
    // Test error handling
  });
});
```

### Integration Tests

- Test complete user flows (create → configure → backtest → view results)
- Test navigation between tabs
- Test data persistence and retrieval
- Test concurrent user operations

### End-to-End Tests

- Test full strategy lifecycle from creation to deletion
- Test backtest execution and results display
- Test strategy activation/deactivation
- Test UI consistency with Portfolios page

## Implementation Notes

### Reusing Portfolios Page Patterns

**Component Structure:**
- Copy the two-panel layout structure from `portfolios.component.html`
- Reuse the same SCSS classes and styling patterns
- Use the same PrimeNG components (ScrollPanel, Tabs, Accordion, etc.)

**State Management:**
- Implement the same caching strategy for performance
- Use the same lazy loading pattern for tab content
- Follow the same change detection strategy (OnPush)

**API Integration:**
- Follow the same service injection and usage patterns
- Use the same RxJS operators for error handling and retries
- Implement the same loading and error state management

### Performance Optimization

**Caching:**
```typescript
private strategyCache: Map<string, StrategyWithMetrics[]> = new Map();
private strategyCacheTimestamp: number = 0;
private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
```

**Lazy Loading:**
- Load backtest results only when Backtest Results tab is activated
- Load strategy configuration only when Configure tab is activated
- Use flags to prevent duplicate loads

**Change Detection:**
- Use `ChangeDetectionStrategy.OnPush` for better performance
- Manually trigger change detection with `ChangeDetectorRef.markForCheck()`

### Accessibility

- Use semantic HTML elements (nav, main, article)
- Provide ARIA labels for interactive elements
- Ensure keyboard navigation works for all controls
- Use role attributes for custom components
- Provide screen reader announcements for state changes

### Responsive Design

- Use the same responsive breakpoints as Portfolios page
- Ensure two-panel layout adapts to smaller screens
- Make tables scrollable on mobile devices
- Optimize touch targets for mobile interaction

## Migration Path

### Phase 1: Database Setup
1. Create migration script for new tables (strategies, strategy_config, strategy_metrics)
2. Add indexes for performance
3. Test migration on development environment

### Phase 2: Backend API Development
1. Implement Strategy API endpoints (CRUD operations)
2. Implement Strategy Config API endpoints
3. Implement Strategy Metrics API endpoints
4. Integrate with existing backtest_runs and backtest_trades tables
5. Add validation and error handling

### Phase 3: Frontend Component Development
1. Create main StrategiesComponent with two-panel layout
2. Implement strategy list sidebar with search/filter
3. Create child components (Overview, Details, Configure, Backtest Results)
4. Implement tab navigation and lazy loading
5. Add form validation and error handling

### Phase 4: Integration and Testing
1. Connect frontend to backend APIs
2. Test complete user flows
3. Perform accessibility audit
4. Conduct performance testing
5. Fix bugs and refine UX

### Phase 5: Deployment
1. Deploy database migrations
2. Deploy backend services
3. Deploy frontend application
4. Monitor for errors and performance issues
5. Gather user feedback for improvements

## Dependencies

### Frontend Dependencies
- Angular 20.3.3
- PrimeNG (latest version compatible with Angular 20)
- RxJS for reactive programming
- TypeScript 5.8.3

### Backend Dependencies
- Java 21
- Spring Boot (existing MoneyTree stack)
- PostgreSQL with TimescaleDB
- Flyway for database migrations

### External Services
- Existing backtest execution service
- Market data services for universe selection
- Technical indicator calculation services

## Security Considerations

### Authentication & Authorization
- Verify user authentication before loading strategies
- Ensure users can only access their own strategies
- Validate user permissions for strategy operations

### Data Validation
- Sanitize all user inputs on frontend and backend
- Validate JSON structures for configuration data
- Prevent SQL injection through parameterized queries
- Validate numeric ranges for allocation percentages

### API Security
- Use HTTPS for all API communications
- Implement rate limiting for API endpoints
- Add CSRF protection for state-changing operations
- Log security-relevant events for audit trail

## Monitoring and Observability

### Metrics to Track
- Strategy page load time
- API response times for strategy operations
- Backtest execution duration
- Error rates by operation type
- User engagement metrics (strategies created, backtests run)

### Logging
- Log all strategy CRUD operations with user context
- Log backtest executions and results
- Log API errors with stack traces
- Log performance metrics for optimization

### Alerts
- Alert on high error rates
- Alert on slow API responses
- Alert on backtest failures
- Alert on database connection issues
