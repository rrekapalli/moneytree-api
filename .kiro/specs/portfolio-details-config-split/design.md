# Design Document

## Overview

This design refactors the portfolio page to separate portfolio details from portfolio configuration. The current "Configure" tab contains all portfolio information, which mixes basic portfolio metadata with technical trading configuration. This refactoring creates a clearer separation of concerns:

- **Details Tab**: Manages basic portfolio information (name, description, risk profile, capital, etc.) using the existing `portfolio` table and endpoints
- **Configure Tab**: Manages technical trading configuration (signal intervals, entry/exit conditions, Redis settings, etc.) using the new `portfolio_config` table and endpoints

The refactoring maintains all existing functionality while improving the user experience through better organization and clearer purpose for each tab.

## Architecture

### Component Structure

```
portfolios.component (parent)
├── overview.component (existing, unchanged)
├── details.component (NEW - moved from configure)
├── configure.component (REFACTORED - new config form)
├── holdings.component (existing, unchanged)
└── trades.component (existing, unchanged)
```

### Data Flow

1. **Details Tab Flow**:
   - User selects portfolio → Parent loads portfolio data → Details component receives portfolio
   - User edits fields → Form marked dirty → User saves → PUT /api/portfolio/{id}
   - Success → Parent refreshes portfolio list → Details component shows updated data

2. **Configure Tab Flow**:
   - User switches to Configure tab → Parent loads config via GET /api/portfolio/{id}/config
   - If no config exists → Display defaults from PortfolioConfig entity
   - User edits fields → Form marked dirty → User saves
   - If new config → POST /api/portfolio/{id}/config
   - If existing config → PUT /api/portfolio/{id}/config
   - Success → Display success message

### API Integration

**Existing Endpoints (for Details tab)**:
- GET /api/portfolio - List all portfolios
- GET /api/portfolio/{id} - Get portfolio by ID
- POST /api/portfolio - Create portfolio
- PUT /api/portfolio/{id} - Update portfolio
- DELETE /api/portfolio/{id} - Delete portfolio

**New Endpoints (for Configure tab)**:
- GET /api/portfolio/{id}/config - Get portfolio configuration
- POST /api/portfolio/{id}/config - Create portfolio configuration
- PUT /api/portfolio/{id}/config - Update portfolio configuration
- DELETE /api/portfolio/{id}/config - Delete portfolio configuration

## Components and Interfaces

### PortfolioDetailsComponent (NEW)

**Purpose**: Display and edit basic portfolio information

**Inputs**:
```typescript
@Input() selectedPortfolio: PortfolioWithMetrics | null
@Input() riskProfileOptions: SelectOption[]
@Input() currencyOptions: SelectOption[]
```

**Outputs**:
```typescript
@Output() saveChanges = new EventEmitter<PortfolioUpdateRequest>()
@Output() cancel = new EventEmitter<void>()
```

**State**:
```typescript
editingPortfolio: PortfolioWithMetrics | null
originalPortfolio: PortfolioWithMetrics | null
isFormDirty: boolean
isSaving: boolean
isCreationMode: boolean
```

**Methods**:
- `ngOnChanges()` - Initialize form when portfolio changes
- `onFormChange()` - Track form modifications
- `saveDetails()` - Save portfolio details via API
- `cancelEdit()` - Reset form to original values
- `formatDate(date)` - Format dates for display

### PortfolioConfigureComponent (REFACTORED)

**Purpose**: Display and edit technical trading configuration

**Inputs**:
```typescript
@Input() selectedPortfolio: PortfolioWithMetrics | null
```

**Outputs**:
```typescript
@Output() saveChanges = new EventEmitter<PortfolioConfig>()
@Output() cancel = new EventEmitter<void>()
```

**State**:
```typescript
portfolioConfig: PortfolioConfig | null
originalConfig: PortfolioConfig | null
isFormDirty: boolean
isSaving: boolean
configExists: boolean
```

**Methods**:
- `ngOnChanges()` - Load config when portfolio changes
- `loadConfig(portfolioId)` - Fetch config from API
- `getDefaultConfig()` - Return default config values
- `onFormChange()` - Track form modifications
- `saveConfiguration()` - Save config via POST or PUT
- `cancelEdit()` - Reset form to original values

### PortfoliosComponent (UPDATED)

**Changes**:
- Add "Details" tab to tab list
- Update tab order: Overview, Details, Configure, Holdings, Trades
- Add config loading logic for Configure tab
- Update navigation to handle new tab
- Update deep linking to support "details" route

**New State**:
```typescript
portfolioConfig: PortfolioConfig | null
configLoading: boolean
configError: string | null
```

**New Methods**:
- `loadPortfolioConfig(portfolioId)` - Load config for selected portfolio
- `onDetailsSave(portfolio)` - Handle details save event
- `onConfigSave(config)` - Handle config save event

## Data Models

### PortfolioConfig Interface (Frontend)

```typescript
export interface PortfolioConfig {
  portfolioId: string;
  
  // Trading Configuration
  tradingMode: string;
  signalCheckInterval: number;
  lookbackDays: number;
  
  // Historical Cache Configuration
  historicalCacheEnabled: boolean;
  historicalCacheLookbackDays: number;
  historicalCacheExchange: string;
  historicalCacheInstrumentType: string;
  historicalCacheCandleInterval: string;
  historicalCacheTtlSeconds: number;
  
  // Redis Configuration
  redisEnabled: boolean;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  redisDb: number;
  redisKeyPrefix: string;
  
  // Additional Trading Settings
  enableConditionalLogging: boolean;
  cacheDurationSeconds: number;
  exchange: string;
  candleInterval: string;
  
  // Entry Conditions
  entryBbLower: boolean;
  entryRsiThreshold: number;
  entryMacdTurnPositive: boolean;
  entryVolumeAboveAvg: boolean;
  entryFallbackSmaPeriod: number;
  entryFallbackAtrMultiplier: number;
  
  // Exit Conditions
  exitTakeProfitPct: number;
  exitStopLossAtrMult: number;
  exitAllowTpExitsOnly: boolean;
  
  // Custom JSON
  customJson?: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### SelectOption Interface

```typescript
export interface SelectOption {
  label: string;
  value: string | number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form dirty state reflects changes

*For any* form field in the Details or Configure tab, when the field value is modified from its original value, the form dirty flag should be set to true and the save button should be enabled.

**Validates: Requirements 1.3, 2.3**

### Property 2: API error handling displays messages

*For any* API call failure (Details save, Config save, Config load), the system should display a user-friendly error message to the user.

**Validates: Requirements 5.2**

### Property 3: Required field validation disables save

*For any* required field that is empty or invalid, the save button should be disabled and validation messages should be displayed.

**Validates: Requirements 5.1**

### Property 4: Tab switching updates URL

*For any* tab switch operation, the URL should be updated to reflect the current tab, enabling deep linking.

**Validates: Requirements 6.4**

### Property 5: Deep link navigation displays correct tab

*For any* valid portfolio and tab combination in the URL, loading the page should display the specified portfolio with the specified tab active.

**Validates: Requirements 6.5**

## Error Handling

### API Error Scenarios

1. **Network Errors (status 0)**:
   - Message: "Unable to connect to the server. Please check your internet connection."
   - Action: Allow retry

2. **Authentication Errors (status 401)**:
   - Message: "Your session has expired. Please log in again."
   - Action: Clear token, redirect to login

3. **Authorization Errors (status 403)**:
   - Message: "You do not have permission to perform this action."
   - Action: Display error, no retry

4. **Not Found Errors (status 404)**:
   - Message: "Portfolio or configuration not found."
   - Action: Refresh portfolio list

5. **Validation Errors (status 400)**:
   - Message: Display specific validation errors from backend
   - Action: Highlight invalid fields

6. **Server Errors (status 500+)**:
   - Message: "Server error occurred. Please try again later."
   - Action: Allow retry

### Form Validation

**Details Tab**:
- Name: Required, max 255 characters
- Description: Optional, max 1000 characters
- Base Currency: Required, must be valid currency code
- Risk Profile: Required, must be one of: CONSERVATIVE, MODERATE, AGGRESSIVE
- Initial Capital: Optional, must be positive number
- Current Cash: Optional, must be non-negative number

**Configure Tab**:
- Trading Mode: Required, must be "paper" or "live"
- Signal Check Interval: Required, must be positive integer
- Lookback Days: Required, must be positive integer
- Redis Host: Required if Redis enabled
- Redis Port: Required if Redis enabled, must be 1-65535
- Entry RSI Threshold: Required, must be 0-100
- Exit Take Profit Pct: Required, must be positive
- Exit Stop Loss ATR Mult: Required, must be positive

## Testing Strategy

### Unit Testing

**Component Tests**:
- Test component initialization with various portfolio states
- Test form validation rules
- Test save button enable/disable logic
- Test error message display
- Test form reset functionality

**Service Tests**:
- Test API service methods with mocked HTTP client
- Test error handling for different HTTP status codes
- Test request/response transformations

### Integration Testing

**Tab Navigation Tests**:
- Test switching between all tabs
- Test URL updates on tab switch
- Test deep linking to specific tabs
- Test lazy loading of tab data

**Form Submission Tests**:
- Test Details tab save with valid data
- Test Details tab save with invalid data
- Test Configure tab save (create new config)
- Test Configure tab save (update existing config)
- Test error handling for failed saves

**Data Loading Tests**:
- Test portfolio list loading
- Test portfolio config loading
- Test handling of missing config (defaults)
- Test cache behavior

### Property-Based Testing

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based tests.

Each property-based test should run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Test 1: Form dirty tracking**
- Generate random form field modifications
- Verify dirty flag is set correctly
- Verify save button state matches dirty flag
- **Feature: portfolio-details-config-split, Property 1: Form dirty state reflects changes**

**Property Test 2: API error handling**
- Generate random HTTP error responses
- Verify error messages are displayed
- Verify error messages are user-friendly
- **Feature: portfolio-details-config-split, Property 2: API error handling displays messages**

**Property Test 3: Required field validation**
- Generate random combinations of empty/filled required fields
- Verify save button is disabled when any required field is empty
- Verify validation messages are shown
- **Feature: portfolio-details-config-split, Property 3: Required field validation disables save**

**Property Test 4: Tab URL synchronization**
- Generate random tab switches
- Verify URL is updated correctly
- Verify URL format is consistent
- **Feature: portfolio-details-config-split, Property 4: Tab switching updates URL**

**Property Test 5: Deep link navigation**
- Generate random valid portfolio/tab URL combinations
- Verify correct portfolio is selected
- Verify correct tab is active
- **Feature: portfolio-details-config-split, Property 5: Deep link navigation displays correct tab**

### Manual Testing Checklist

- [ ] Create new portfolio via Details tab
- [ ] Edit existing portfolio via Details tab
- [ ] Create new config via Configure tab
- [ ] Edit existing config via Configure tab
- [ ] Switch between all tabs
- [ ] Test deep linking to each tab
- [ ] Test with portfolio that has no config
- [ ] Test validation errors
- [ ] Test API error scenarios
- [ ] Test form reset functionality
- [ ] Verify all existing tabs still work (Overview, Holdings, Trades)

## Implementation Notes

### Quality Assurance Process

After completing each task, the following quality assurance steps MUST be performed:

1. **Verify No Errors or Warnings**:
   - Run `getDiagnostics` on all modified files
   - Ensure TypeScript compilation succeeds without errors
   - Resolve any linting warnings
   - Fix any type errors or missing imports

2. **Commit to Git**:
   - Once the task is error/warning-free, commit changes to local git
   - Use descriptive commit messages following the format:
     - `feat: [brief description of feature added]`
     - `refactor: [brief description of refactoring]`
     - `test: [brief description of tests added]`
     - `fix: [brief description of bug fixed]`
   - Example: `feat: add PortfolioConfig interface and API service with comprehensive tests`
   - Include task number in commit message for traceability

3. **Verification Before Moving to Next Task**:
   - Confirm all tests pass (if tests were written)
   - Verify the application builds successfully
   - Check that no regressions were introduced

### Migration Strategy

1. **Phase 1**: Create PortfolioDetailsComponent
   - Copy existing configure.component files
   - Rename to details.component
   - Keep existing functionality intact
   - Add to parent component imports
   - **QA**: Verify no errors, commit changes

2. **Phase 2**: Update parent component
   - Add "Details" tab to tab list
   - Update tab order
   - Add routing for "details" tab
   - Update default tab selection logic
   - **QA**: Verify no errors, commit changes

3. **Phase 3**: Refactor ConfigureComponent
   - Create PortfolioConfig interface
   - Create PortfolioConfigApiService
   - Update component to load/save config
   - Create new form based on PortfolioConfig structure
   - Organize fields into sections
   - **QA**: Verify no errors, commit changes

4. **Phase 4**: Testing and refinement
   - Write unit tests
   - Write integration tests
   - Write property-based tests
   - Manual testing
   - Bug fixes and refinements

### Code Reuse

- Reuse existing form validation patterns
- Reuse existing error handling utilities
- Reuse existing API service patterns
- Reuse existing loading/saving state management

### Accessibility

- Ensure all form fields have proper labels
- Ensure tab navigation works with keyboard
- Ensure error messages are announced to screen readers
- Ensure form validation messages are associated with fields
- Maintain existing ARIA attributes on tabs

### Performance Considerations

- Lazy load config data only when Configure tab is activated
- Cache config data to avoid redundant API calls
- Use change detection strategy OnPush where possible
- Debounce form change events if needed

## Future Enhancements

1. **Unsaved Changes Warning**: Prompt user when navigating away with unsaved changes
2. **Config Templates**: Allow saving and loading config templates
3. **Config Validation**: Add backend validation for config values
4. **Config History**: Track config changes over time
5. **Bulk Config Update**: Update config for multiple portfolios at once
6. **Config Import/Export**: Import/export config as JSON
