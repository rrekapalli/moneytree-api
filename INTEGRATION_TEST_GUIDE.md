# Strategy Page Integration Testing Guide

This document provides comprehensive instructions for testing the integration between the frontend and backend APIs for the Strategy page refactor.

## Prerequisites

1. **Backend Running**: Start the backend server
   ```bash
   cd backend
   ./start-app.sh
   # Or: mvn spring-boot:run
   ```

2. **Frontend Running**: Start the frontend development server
   ```bash
   cd frontend
   npm start
   # Or: ng serve
   ```

3. **Database**: Ensure PostgreSQL is running with the required schema

## API Endpoints to Test

### 1. Strategy CRUD Operations

#### GET /api/strategies
**Purpose**: List all strategies for the user

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with array of strategies
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "My Strategy",
    "description": "Strategy description",
    "riskProfile": "MODERATE",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/strategies/{id}
**Purpose**: Get a specific strategy by ID

**Test with curl**:
```bash
# Replace {id} with actual strategy UUID
curl -X GET http://localhost:8080/api/strategies/{id} \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with strategy details or 404 Not Found

#### POST /api/strategies
**Purpose**: Create a new strategy

**Test with curl**:
```bash
curl -X POST http://localhost:8080/api/strategies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Strategy",
    "description": "A test strategy for integration testing",
    "riskProfile": "MODERATE",
    "isActive": false
  }'
```

**Expected Response**: 200 OK with created strategy (includes generated ID)

#### PUT /api/strategies/{id}
**Purpose**: Update an existing strategy

**Test with curl**:
```bash
# Replace {id} with actual strategy UUID
curl -X PUT http://localhost:8080/api/strategies/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Strategy Name",
    "description": "Updated description",
    "isActive": true
  }'
```

**Expected Response**: 200 OK with updated strategy or 404 Not Found

#### DELETE /api/strategies/{id}
**Purpose**: Delete a strategy

**Test with curl**:
```bash
# Replace {id} with actual strategy UUID
curl -X DELETE http://localhost:8080/api/strategies/{id} \
  -H "Content-Type: application/json"
```

**Expected Response**: 204 No Content or 404 Not Found

### 2. Strategy Configuration Operations

#### GET /api/strategies/{id}/config
**Purpose**: Get strategy configuration

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/{id}/config \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with configuration or 404 Not Found

#### PUT /api/strategies/{id}/config
**Purpose**: Update strategy configuration

**Test with curl**:
```bash
curl -X PUT http://localhost:8080/api/strategies/{id}/config \
  -H "Content-Type: application/json" \
  -d '{
    "universeDefinition": {
      "type": "INDEX",
      "indices": ["NIFTY_500"]
    },
    "allocations": {
      "positionSizingMethod": "EQUAL_WEIGHT",
      "maxPositionSize": 10,
      "maxPortfolioAllocation": 100,
      "cashReserve": 5
    },
    "entryConditions": [
      {
        "type": "TECHNICAL",
        "indicator": "RSI",
        "operator": "LT",
        "value": 30
      }
    ],
    "exitConditions": [
      {
        "type": "TECHNICAL",
        "indicator": "RSI",
        "operator": "GT",
        "value": 70
      }
    ],
    "riskParameters": {
      "stopLossPercent": 5,
      "takeProfitPercent": 10
    }
  }'
```

**Expected Response**: 200 OK with saved configuration

#### POST /api/strategies/{id}/validate-config
**Purpose**: Validate configuration without saving

**Test with curl**:
```bash
curl -X POST http://localhost:8080/api/strategies/{id}/validate-config \
  -H "Content-Type: application/json" \
  -d '{
    "universeDefinition": {"type": "INDEX", "indices": ["NIFTY_500"]},
    "allocations": {"positionSizingMethod": "EQUAL_WEIGHT", "maxPositionSize": 10},
    "entryConditions": [{"type": "TECHNICAL", "indicator": "RSI", "operator": "LT", "value": 30}],
    "exitConditions": [{"type": "TECHNICAL", "indicator": "RSI", "operator": "GT", "value": 70}],
    "riskParameters": {}
  }'
```

**Expected Response**: 200 OK with validation result

### 3. Strategy Metrics Operations

#### GET /api/strategies/{id}/metrics
**Purpose**: Get latest strategy metrics

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/{id}/metrics \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with metrics or 404 Not Found

#### GET /api/strategies/{id}/metrics/history
**Purpose**: Get historical metrics

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/{id}/metrics/history \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with array of historical metrics

### 4. Backtest Operations

#### POST /api/strategies/{id}/backtest
**Purpose**: Trigger backtest execution

**Test with curl**:
```bash
curl -X POST http://localhost:8080/api/strategies/{id}/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2023-01-01",
    "endDate": "2023-12-31",
    "initialCapital": 100000,
    "symbol": "RELIANCE"
  }'
```

**Expected Response**: 200 OK with backtest run details

#### GET /api/strategies/{id}/backtests
**Purpose**: List all backtests for a strategy

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/{id}/backtests \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with array of backtest runs

#### GET /api/strategies/backtests/{runId}
**Purpose**: Get backtest run details

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/backtests/{runId} \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with backtest run details or 404 Not Found

#### GET /api/strategies/backtests/{runId}/trades
**Purpose**: Get backtest trades

**Test with curl**:
```bash
curl -X GET http://localhost:8080/api/strategies/backtests/{runId}/trades \
  -H "Content-Type: application/json"
```

**Expected Response**: 200 OK with array of trades

## Frontend Integration Testing

### Manual Testing Steps

1. **Navigate to Strategy Page**
   - Open browser to `http://localhost:4200/strategies`
   - Verify the page loads without errors
   - Check browser console for any errors

2. **Test Strategy List Loading**
   - Verify strategies appear in the left sidebar
   - Check that strategy cards show:
     - Strategy name
     - Status badge
     - Key metrics (if available)
     - Last updated date
   - Verify loading spinner appears during data fetch
   - Verify error message appears if API fails

3. **Test Search and Filtering**
   - Type in the search box
   - Verify strategies filter in real-time
   - Clear search and verify all strategies reappear
   - Test sort dropdown
   - Verify strategies reorder correctly

4. **Test Strategy Selection**
   - Click on a strategy card
   - Verify it highlights
   - Verify right panel shows strategy details
   - Verify URL updates with strategy ID

5. **Test Tab Navigation**
   - Click on each tab (Overview, Details, Configure, Backtest Results)
   - Verify tab content loads
   - Verify URL updates with tab name
   - Verify deep linking works (refresh page, URL should persist)

6. **Test Create Strategy**
   - Click "Create Strategy" button
   - Verify Details tab opens with empty form
   - Fill in strategy name and description
   - Click Save
   - Verify strategy appears in sidebar
   - Verify success notification appears

7. **Test Update Strategy**
   - Select a strategy
   - Go to Details tab
   - Modify name or description
   - Click Save
   - Verify changes persist
   - Verify sidebar updates
   - Verify success notification appears

8. **Test Strategy Configuration**
   - Select a strategy
   - Go to Configure tab
   - Expand each accordion section
   - Fill in configuration details
   - Click Save Configuration
   - Verify success notification appears

9. **Test Backtest Execution**
   - Select a strategy with configuration
   - Go to Configure tab
   - Click "Run Backtest" button
   - Fill in backtest parameters
   - Submit
   - Verify backtest starts
   - Go to Backtest Results tab
   - Verify results appear (may take time)

10. **Test Strategy Activation**
    - Click the toggle switch on a strategy card
    - Verify confirmation dialog (if implemented)
    - Verify status changes to "Active"
    - Verify success notification appears

11. **Test Strategy Deletion**
    - Click delete button on a strategy card
    - Verify confirmation dialog appears
    - Confirm deletion
    - Verify strategy disappears from sidebar
    - Verify success notification appears

### Error Handling Tests

1. **Test Network Errors**
   - Stop the backend server
   - Try to load strategies
   - Verify error message appears
   - Verify retry option is available

2. **Test Validation Errors**
   - Try to create strategy with empty name
   - Verify validation error appears
   - Try to save invalid configuration
   - Verify validation errors appear

3. **Test 404 Errors**
   - Navigate to non-existent strategy ID in URL
   - Verify appropriate error message

4. **Test Permission Errors**
   - If authentication is implemented, test with unauthorized user
   - Verify 403 error handling

## Automated Testing Script

Create a file `test-strategy-api.sh`:

```bash
#!/bin/bash

# Strategy API Integration Test Script
# This script tests all strategy API endpoints

BASE_URL="http://localhost:8080/api"
STRATEGY_ID=""

echo "=== Strategy API Integration Tests ==="
echo ""

# Test 1: List Strategies
echo "Test 1: GET /api/strategies"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✓ PASS: List strategies returned 200"
    echo "Response: $body"
else
    echo "✗ FAIL: Expected 200, got $http_code"
fi
echo ""

# Test 2: Create Strategy
echo "Test 2: POST /api/strategies"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/strategies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test Strategy",
    "description": "Created by integration test",
    "riskProfile": "MODERATE",
    "isActive": false
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✓ PASS: Create strategy returned 200"
    STRATEGY_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Created strategy ID: $STRATEGY_ID"
else
    echo "✗ FAIL: Expected 200, got $http_code"
fi
echo ""

# Test 3: Get Strategy by ID
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 3: GET /api/strategies/$STRATEGY_ID"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASS: Get strategy returned 200"
    else
        echo "✗ FAIL: Expected 200, got $http_code"
    fi
    echo ""
fi

# Test 4: Update Strategy
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 4: PUT /api/strategies/$STRATEGY_ID"
    response=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/strategies/$STRATEGY_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Updated Integration Test Strategy",
        "description": "Updated by integration test",
        "isActive": true
      }')
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASS: Update strategy returned 200"
    else
        echo "✗ FAIL: Expected 200, got $http_code"
    fi
    echo ""
fi

# Test 5: Delete Strategy
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 5: DELETE /api/strategies/$STRATEGY_ID"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/strategies/$STRATEGY_ID")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "204" ]; then
        echo "✓ PASS: Delete strategy returned 204"
    else
        echo "✗ FAIL: Expected 204, got $http_code"
    fi
    echo ""
fi

echo "=== Tests Complete ==="
```

Make it executable:
```bash
chmod +x test-strategy-api.sh
```

Run the tests:
```bash
./test-strategy-api.sh
```

## Verification Checklist

### Backend API
- [ ] All endpoints compile without errors
- [ ] GET /api/strategies returns 200
- [ ] POST /api/strategies creates strategy
- [ ] PUT /api/strategies/{id} updates strategy
- [ ] DELETE /api/strategies/{id} deletes strategy
- [ ] Configuration endpoints work
- [ ] Metrics endpoints work
- [ ] Backtest endpoints work
- [ ] Error responses are appropriate (400, 404, 500)

### Frontend
- [ ] Frontend builds without errors
- [ ] Strategy page loads without console errors
- [ ] Strategy list displays correctly
- [ ] Search and filtering work
- [ ] Strategy selection works
- [ ] Tab navigation works
- [ ] Deep linking works
- [ ] Create strategy works
- [ ] Update strategy works
- [ ] Delete strategy works
- [ ] Configuration save works
- [ ] Backtest execution works
- [ ] Error messages display correctly
- [ ] Loading states display correctly

### Integration
- [ ] Frontend successfully calls backend APIs
- [ ] Data flows correctly from backend to frontend
- [ ] Error handling works end-to-end
- [ ] Authentication works (if implemented)
- [ ] All user flows complete successfully

## Common Issues and Solutions

### Issue: CORS Errors
**Solution**: Ensure backend has CORS configuration for `http://localhost:4200`

### Issue: 404 on API Calls
**Solution**: Check that backend is running on port 8080 and API paths match

### Issue: Empty Strategy List
**Solution**: Create test data in database or use mock data

### Issue: Authentication Errors
**Solution**: Check AuthService implementation and token handling

### Issue: Validation Errors
**Solution**: Verify request body matches backend entity structure

## Next Steps

After completing integration testing:
1. Document any issues found
2. Fix all critical issues
3. Proceed to subtask 16.2 (Test complete user flows)
4. Perform accessibility audit (subtask 16.3)
5. Conduct performance testing (subtask 16.4)
