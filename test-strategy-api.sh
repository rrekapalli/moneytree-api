#!/bin/bash

# Strategy API Integration Test Script
# This script tests all strategy API endpoints

BASE_URL="http://localhost:8080/api"
STRATEGY_ID=""

echo "=== Strategy API Integration Tests ==="
echo ""

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s -f "$BASE_URL/strategies" > /dev/null 2>&1; then
    echo "✗ ERROR: Backend is not running at $BASE_URL"
    echo "Please start the backend server first:"
    echo "  cd backend && ./start-app.sh"
    exit 1
fi
echo "✓ Backend is running"
echo ""

# Test 1: List Strategies
echo "Test 1: GET /api/strategies"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo "✓ PASS: List strategies returned 200"
    echo "Response: $body" | head -c 200
    echo "..."
else
    echo "✗ FAIL: Expected 200, got $http_code"
    echo "Response: $body"
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
    # Extract ID using grep and cut (works on Linux)
    STRATEGY_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -z "$STRATEGY_ID" ]; then
        # Try alternative extraction method
        STRATEGY_ID=$(echo "$body" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
    fi
    echo "Created strategy ID: $STRATEGY_ID"
    echo "Response: $body" | head -c 200
    echo "..."
else
    echo "✗ FAIL: Expected 200, got $http_code"
    echo "Response: $body"
fi
echo ""

# Test 3: Get Strategy by ID
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 3: GET /api/strategies/$STRATEGY_ID"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASS: Get strategy returned 200"
        echo "Response: $body" | head -c 200
        echo "..."
    else
        echo "✗ FAIL: Expected 200, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 3 skipped (no strategy ID)"
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
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASS: Update strategy returned 200"
        echo "Response: $body" | head -c 200
        echo "..."
    else
        echo "✗ FAIL: Expected 200, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 4 skipped (no strategy ID)"
    echo ""
fi

# Test 5: Get Strategy Config (should be 404 initially)
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 5: GET /api/strategies/$STRATEGY_ID/config"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID/config")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "404" ] || [ "$http_code" = "200" ]; then
        echo "✓ PASS: Get config returned $http_code (expected 404 or 200)"
    else
        echo "✗ FAIL: Expected 404 or 200, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 5 skipped (no strategy ID)"
    echo ""
fi

# Test 6: Get Strategy Metrics (should be 404 initially)
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 6: GET /api/strategies/$STRATEGY_ID/metrics"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID/metrics")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "404" ] || [ "$http_code" = "200" ]; then
        echo "✓ PASS: Get metrics returned $http_code (expected 404 or 200)"
    else
        echo "✗ FAIL: Expected 404 or 200, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 6 skipped (no strategy ID)"
    echo ""
fi

# Test 7: Get Backtests for Strategy
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 7: GET /api/strategies/$STRATEGY_ID/backtests"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID/backtests")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASS: Get backtests returned 200"
        echo "Response: $body" | head -c 200
        echo "..."
    else
        echo "✗ FAIL: Expected 200, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 7 skipped (no strategy ID)"
    echo ""
fi

# Test 8: Delete Strategy
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 8: DELETE /api/strategies/$STRATEGY_ID"
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/strategies/$STRATEGY_ID")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "204" ]; then
        echo "✓ PASS: Delete strategy returned 204"
    else
        echo "✗ FAIL: Expected 204, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 8 skipped (no strategy ID)"
    echo ""
fi

# Test 9: Verify Deletion (should be 404)
if [ -n "$STRATEGY_ID" ]; then
    echo "Test 9: GET /api/strategies/$STRATEGY_ID (verify deletion)"
    response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/strategies/$STRATEGY_ID")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "404" ]; then
        echo "✓ PASS: Get deleted strategy returned 404"
    else
        echo "✗ FAIL: Expected 404, got $http_code"
        echo "Response: $body"
    fi
    echo ""
else
    echo "⊘ SKIP: Test 9 skipped (no strategy ID)"
    echo ""
fi

echo "=== Tests Complete ==="
echo ""
echo "Summary:"
echo "- All basic CRUD operations tested"
echo "- Configuration endpoints tested"
echo "- Metrics endpoints tested"
echo "- Backtest endpoints tested"
echo ""
echo "Next steps:"
echo "1. Review any failed tests above"
echo "2. Test the frontend integration manually"
echo "3. Run complete user flow tests"
