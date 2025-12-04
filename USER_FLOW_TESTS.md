# Strategy Page User Flow Tests

This document provides detailed test cases for all user flows in the Strategy page refactor.

## Test Environment Setup

Before running these tests:
1. Backend server running on `http://localhost:8080`
2. Frontend server running on `http://localhost:4200`
3. Database with test data (or empty for fresh testing)
4. Browser with developer tools open (to check for console errors)

## User Flow 1: Create → Configure → Backtest → View Results

### Objective
Test the complete lifecycle of creating a new strategy, configuring it, running a backtest, and viewing results.

### Prerequisites
- User is logged in (if authentication is implemented)
- No existing strategy with the name "Test Momentum Strategy"

### Test Steps

#### Step 1: Navigate to Strategy Page
1. Open browser to `http://localhost:4200/strategies`
2. **Expected**: Page loads without errors
3. **Verify**: 
   - No console errors
   - Left sidebar is visible
   - Right panel shows either empty state or first strategy

#### Step 2: Create New Strategy
1. Click the "Create Strategy" button in the sidebar
2. **Expected**: Details tab opens with empty form
3. **Verify**:
   - Form fields are empty
   - Save button is visible
   - Cancel button is visible

4. Fill in the form:
   - Name: "Test Momentum Strategy"
   - Description: "A momentum-based strategy for testing"
   - Risk Profile: Select "MODERATE"

5. Click "Save" button
6. **Expected**: Strategy is created and appears in sidebar
7. **Verify**:
   - Success notification appears
   - Strategy appears in sidebar with name "Test Momentum Strategy"
   - Strategy is selected (highlighted)
   - URL updates to `/strategies/{id}/details`
   - No console errors

#### Step 3: Configure Strategy
1. Click on the "Configure" tab
2. **Expected**: Configure tab opens with four accordion sections
3. **Verify**:
   - Universe accordion is visible
   - Allocations accordion is visible
   - Entry Conditions accordion is visible
   - Exit Conditions accordion is visible

4. Expand "Universe" accordion
5. Select universe type: "INDEX"
6. Select indices: "NIFTY_500"
7. **Verify**: Selection is reflected in UI

8. Expand "Allocations" accordion
9. Fill in:
   - Position Sizing Method: "EQUAL_WEIGHT"
   - Max Position Size: 10%
   - Max Portfolio Allocation: 100%
   - Cash Reserve: 5%
10. **Verify**: Values are accepted

11. Expand "Entry Conditions" accordion
12. Click "Add Condition" button
13. Fill in:
    - Type: "TECHNICAL"
    - Indicator: "RSI"
    - Operator: "LT" (Less Than)
    - Value: 30
14. **Verify**: Condition appears in list

15. Expand "Exit Conditions" accordion
16. Click "Add Condition" button
17. Fill in:
    - Type: "TECHNICAL"
    - Indicator: "RSI"
    - Operator: "GT" (Greater Than)
    - Value: 70
18. **Verify**: Condition appears in list

19. Click "Save Configuration" button
20. **Expected**: Configuration is saved
21. **Verify**:
    - Success notification appears
    - No console errors
    - Configuration persists (refresh page and check)

#### Step 4: Run Backtest
1. In the Configure tab, click "Run Backtest" button
2. **Expected**: Backtest parameters dialog opens
3. **Verify**:
   - Start Date field is visible
   - End Date field is visible
   - Initial Capital field is visible
   - Symbol field is visible (optional)

4. Fill in backtest parameters:
   - Start Date: "2023-01-01"
   - End Date: "2023-12-31"
   - Initial Capital: 100000
   - Symbol: "RELIANCE" (or leave empty for all)

5. Click "Start Backtest" button
6. **Expected**: Backtest execution begins
7. **Verify**:
   - Progress indicator appears
   - Strategy status changes to "Backtesting"
   - No console errors

8. Wait for backtest to complete (may take several seconds)
9. **Expected**: Backtest completes successfully
10. **Verify**:
    - Progress indicator disappears
    - Strategy status changes back to "Inactive" or "Active"
    - Success notification appears

#### Step 5: View Backtest Results
1. Click on the "Backtest Results" tab
2. **Expected**: Backtest results are displayed
3. **Verify**:
   - Summary metrics section is visible
   - Metrics include: Total Return, CAGR, Sharpe Ratio, Sortino Ratio, Max Drawdown, Win Rate, Total Trades, Profit Factor
   - Equity curve chart is visible
   - Trades table is visible with columns: Entry Date, Exit Date, Symbol, Entry Price, Exit Price, Shares, P/L, Holding Period
   - No console errors

4. Scroll through the trades table
5. **Verify**:
   - All trades are displayed
   - Data is formatted correctly
   - Sorting works (if implemented)

6. Check the equity curve chart
7. **Verify**:
   - Chart displays strategy performance over time
   - Benchmark comparison is visible (if implemented)
   - Chart is interactive (tooltips, zoom, etc.)

### Test Result
- [ ] All steps completed successfully
- [ ] No console errors
- [ ] All data persists correctly
- [ ] UI is responsive and intuitive

### Issues Found
_Document any issues encountered during this flow_

---

## User Flow 2: Strategy Activation/Deactivation

### Objective
Test the ability to activate and deactivate strategies.

### Prerequisites
- At least one strategy exists with complete configuration
- Strategy is currently inactive

### Test Steps

#### Step 1: Activate Strategy
1. Navigate to Strategy page
2. Locate the strategy in the sidebar
3. **Verify**: Status badge shows "Inactive"

4. Click the toggle switch or activation button on the strategy card
5. **Expected**: Strategy is activated
6. **Verify**:
   - Status badge changes to "Active"
   - Success notification appears
   - No console errors
   - Change persists (refresh page and check)

#### Step 2: Deactivate Strategy
1. Click the toggle switch or deactivation button on the same strategy card
2. **Expected**: Strategy is deactivated
3. **Verify**:
   - Status badge changes to "Inactive"
   - Success notification appears
   - No console errors
   - Change persists (refresh page and check)

#### Step 3: Attempt to Activate Incomplete Strategy
1. Create a new strategy without configuration
2. Try to activate it
3. **Expected**: Activation is prevented
4. **Verify**:
   - Error message appears explaining configuration is incomplete
   - Strategy remains inactive
   - No console errors

### Test Result
- [ ] All steps completed successfully
- [ ] Validation works correctly
- [ ] Status changes persist

### Issues Found
_Document any issues encountered during this flow_

---

## User Flow 3: Strategy Deletion

### Objective
Test the ability to delete strategies safely.

### Prerequisites
- At least two strategies exist
- One strategy has no active positions

### Test Steps

#### Step 1: Delete Strategy Without Active Positions
1. Navigate to Strategy page
2. Locate a strategy without active positions
3. Click the delete button (trash icon) on the strategy card
4. **Expected**: Confirmation dialog appears
5. **Verify**:
   - Dialog warns about data loss
   - Dialog lists what will be deleted (config, metrics, backtest results)
   - Cancel button is visible
   - Confirm button is visible

6. Click "Cancel" button
7. **Expected**: Dialog closes, strategy is not deleted
8. **Verify**:
   - Strategy still appears in sidebar
   - No changes made

9. Click delete button again
10. Click "Confirm" button in dialog
11. **Expected**: Strategy is deleted
12. **Verify**:
    - Strategy disappears from sidebar
    - Success notification appears
    - If deleted strategy was selected, another strategy is selected automatically
    - No console errors
    - Deletion persists (refresh page and check)

#### Step 2: Attempt to Delete Strategy With Active Positions
1. If you have a strategy with active positions, try to delete it
2. **Expected**: Deletion is prevented
3. **Verify**:
   - Error message appears explaining active positions must be closed first
   - Strategy is not deleted
   - No console errors

#### Step 3: Delete Last Strategy
1. Delete all strategies except one
2. Delete the last strategy
3. **Expected**: Empty state is displayed
4. **Verify**:
   - Empty state message appears
   - "Create Strategy" button is prominent
   - No console errors

### Test Result
- [ ] All steps completed successfully
- [ ] Confirmation dialogs work correctly
- [ ] Validation prevents deletion of strategies with active positions
- [ ] Empty state displays correctly

### Issues Found
_Document any issues encountered during this flow_

---

## User Flow 4: Search and Filtering

### Objective
Test the search and filtering functionality in the strategy list.

### Prerequisites
- At least 5 strategies exist with different names and properties

### Test Steps

#### Step 1: Search by Name
1. Navigate to Strategy page
2. Type a partial strategy name in the search box
3. **Expected**: Strategy list filters in real-time
4. **Verify**:
   - Only strategies matching the search text are displayed
   - Search is case-insensitive
   - Filtering happens as you type (debounced)
   - No console errors

5. Clear the search box
6. **Expected**: All strategies reappear
7. **Verify**:
   - Full list is restored
   - No console errors

#### Step 2: Search by Description
1. Type text that appears in a strategy description
2. **Expected**: Strategies with matching descriptions are displayed
3. **Verify**:
   - Search works on description field
   - Results are correct

#### Step 3: Search with No Results
1. Type text that doesn't match any strategy
2. **Expected**: Empty state is displayed
3. **Verify**:
   - "No strategies found" message appears
   - Clear search button is visible
   - No console errors

#### Step 4: Sort Strategies
1. Click the sort dropdown
2. Select "Name (A-Z)"
3. **Expected**: Strategies are sorted alphabetically
4. **Verify**:
   - Strategies are in alphabetical order
   - No console errors

5. Select "Updated (Recent)"
6. **Expected**: Strategies are sorted by update date (most recent first)
7. **Verify**:
   - Most recently updated strategies appear first
   - No console errors

8. Select "Return (%)"
9. **Expected**: Strategies are sorted by return percentage (highest first)
10. **Verify**:
    - Strategies with highest returns appear first
    - Strategies without returns appear last
    - No console errors

#### Step 5: Combined Search and Sort
1. Enter a search term
2. Change the sort order
3. **Expected**: Filtered results are sorted correctly
4. **Verify**:
   - Both search and sort work together
   - No console errors

### Test Result
- [ ] All steps completed successfully
- [ ] Search works on name and description
- [ ] Sorting works correctly
- [ ] Empty states display correctly

### Issues Found
_Document any issues encountered during this flow_

---

## User Flow 5: Deep Linking and Navigation

### Objective
Test URL-based navigation and deep linking functionality.

### Prerequisites
- At least one strategy exists

### Test Steps

#### Step 1: Direct URL Navigation
1. Copy the URL of a strategy (e.g., `/strategies/{id}/overview`)
2. Open a new browser tab
3. Paste the URL and navigate
4. **Expected**: Strategy page loads with correct strategy and tab selected
5. **Verify**:
   - Correct strategy is selected
   - Correct tab is active
   - Data loads correctly
   - No console errors

#### Step 2: Tab Navigation Updates URL
1. Navigate to Strategy page
2. Select a strategy
3. Click on different tabs (Overview, Details, Configure, Backtest Results)
4. **Expected**: URL updates for each tab
5. **Verify**:
   - URL format is `/strategies/{id}/{tab}`
   - URL updates without page reload
   - No console errors

#### Step 3: Browser Back/Forward Navigation
1. Navigate through several strategies and tabs
2. Click browser back button
3. **Expected**: Previous strategy/tab is displayed
4. **Verify**:
   - Correct strategy and tab are shown
   - Data loads correctly
   - No console errors

5. Click browser forward button
6. **Expected**: Next strategy/tab is displayed
7. **Verify**:
   - Correct strategy and tab are shown
   - Data loads correctly
   - No console errors

#### Step 4: Refresh Page
1. Navigate to a specific strategy and tab
2. Refresh the page (F5 or Ctrl+R)
3. **Expected**: Same strategy and tab are displayed after refresh
4. **Verify**:
   - Strategy selection persists
   - Tab selection persists
   - Data reloads correctly
   - No console errors

#### Step 5: Invalid URL Handling
1. Navigate to a non-existent strategy ID (e.g., `/strategies/invalid-id/overview`)
2. **Expected**: Error message is displayed
3. **Verify**:
   - Appropriate error message appears
   - User can navigate back to strategy list
   - No console errors (except expected 404)

### Test Result
- [ ] All steps completed successfully
- [ ] Deep linking works correctly
- [ ] Browser navigation works correctly
- [ ] Invalid URLs are handled gracefully

### Issues Found
_Document any issues encountered during this flow_

---

## User Flow 6: Error Handling and Recovery

### Objective
Test error handling and recovery mechanisms.

### Prerequisites
- Backend server running
- Frontend server running

### Test Steps

#### Step 1: Network Error Handling
1. Navigate to Strategy page
2. Stop the backend server
3. Try to load strategies (refresh page)
4. **Expected**: Error message is displayed
5. **Verify**:
   - User-friendly error message appears
   - Error message mentions connection issue
   - Retry option is available (if implemented)
   - No unhandled console errors

6. Start the backend server
7. Click retry or refresh page
8. **Expected**: Strategies load successfully
9. **Verify**:
   - Data loads correctly
   - Error message disappears
   - No console errors

#### Step 2: Validation Error Handling
1. Try to create a strategy with empty name
2. Click Save
3. **Expected**: Validation error is displayed
4. **Verify**:
   - Error message appears near the name field
   - Save operation is prevented
   - No console errors

5. Fill in the name
6. Click Save
7. **Expected**: Strategy is created successfully
8. **Verify**:
   - Validation error disappears
   - Strategy is created
   - No console errors

#### Step 3: Server Error Handling
1. If possible, trigger a server error (e.g., database connection issue)
2. Try to perform an operation
3. **Expected**: Error message is displayed
4. **Verify**:
   - User-friendly error message appears
   - Error message suggests trying again later
   - No unhandled console errors

#### Step 4: Concurrent Modification Handling
1. Open the same strategy in two browser tabs
2. Modify the strategy in tab 1 and save
3. Modify the strategy in tab 2 and save
4. **Expected**: Appropriate handling of concurrent modification
5. **Verify**:
   - Either last write wins, or conflict is detected
   - User is notified of the situation
   - No data corruption occurs

### Test Result
- [ ] All steps completed successfully
- [ ] Error messages are user-friendly
- [ ] Recovery mechanisms work correctly
- [ ] No unhandled errors

### Issues Found
_Document any issues encountered during this flow_

---

## Test Summary

### Overall Results
- [ ] User Flow 1: Create → Configure → Backtest → View Results
- [ ] User Flow 2: Strategy Activation/Deactivation
- [ ] User Flow 3: Strategy Deletion
- [ ] User Flow 4: Search and Filtering
- [ ] User Flow 5: Deep Linking and Navigation
- [ ] User Flow 6: Error Handling and Recovery

### Critical Issues Found
_List any critical issues that prevent core functionality_

### Non-Critical Issues Found
_List any minor issues or improvements needed_

### Performance Observations
_Note any performance issues or slow operations_

### Browser Compatibility
Tested on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Recommendations
_List any recommendations for improvements or fixes_

---

## Next Steps

After completing user flow testing:
1. Fix all critical issues
2. Document all issues in issue tracker
3. Proceed to subtask 16.3 (Accessibility audit)
4. Proceed to subtask 16.4 (Performance testing)
