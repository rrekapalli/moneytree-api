#!/bin/bash

# Comprehensive endpoint testing script for MoneyTree API
# Tests all endpoints and reports failures

BASE_URL="http://localhost:8080"
MAX_WAIT=120
WAIT_INTERVAL=5
FAILED_ENDPOINTS=()
PASSED_COUNT=0
FAILED_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Waiting for application to start on $BASE_URL..."
elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
    if curl -s -f "$BASE_URL/actuator/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Application is running!${NC}"
        break
    fi
    echo "  Waiting... (${elapsed}s/${MAX_WAIT}s)"
    sleep $WAIT_INTERVAL
    elapsed=$((elapsed + WAIT_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
    echo -e "${RED}✗ Application did not start within ${MAX_WAIT}s${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "Testing All MoneyTree API Endpoints"
echo "========================================="
echo ""

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local data=$4
    local expected_status=${5:-200}
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url" 2>&1)
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 500)
    
    if [ "$http_code" = "$expected_status" ] || [ "$http_code" = "404" ] || [ "$http_code" = "400" ]; then
        # 404 and 400 are acceptable for GET requests (resource not found or bad request)
        if [ "$method" = "GET" ] && ([ "$http_code" = "404" ] || [ "$http_code" = "400" ]); then
            echo -e "${GREEN}✓${NC} $description"
            echo "   Status: $http_code (acceptable for GET)"
            ((PASSED_COUNT++))
        elif [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}✓${NC} $description"
            echo "   Status: $http_code"
            ((PASSED_COUNT++))
        else
            echo -e "${RED}✗${NC} $description"
            echo "   Expected: $expected_status, Got: $http_code"
            echo "   Response: $body"
            FAILED_ENDPOINTS+=("$description - Expected: $expected_status, Got: $http_code")
            ((FAILED_COUNT++))
        fi
    else
        echo -e "${RED}✗${NC} $description"
        echo "   Status: $http_code"
        echo "   Response: $body"
        FAILED_ENDPOINTS+=("$description - Status: $http_code, Response: $body")
        ((FAILED_COUNT++))
    fi
}

# 1. Health Endpoint
echo "=== Health Endpoints ==="
test_endpoint "GET" "$BASE_URL/actuator/health" "Health Check"

# 2. Market Data Endpoints
echo ""
echo "=== Market Data Endpoints ==="
from=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "2024-01-01T00:00:00Z")
to=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "2024-01-08T00:00:00Z")
history_payload="{\"tradingsymbol\":\"NIFTY50\",\"instrumenttoken\":\"408065\",\"exchange\":\"NSE\",\"interval\":\"day\",\"from\":\"$from\",\"to\":\"$to\"}"
test_endpoint "POST" "$BASE_URL/api/marketdata/kite/NIFTY50/history" "Kite History" "$history_payload"
test_endpoint "GET" "$BASE_URL/api/marketdata/kite/quotes?symbols=INFY,NIFTY50" "Kite Quotes"

# 3. Portfolio Endpoints
echo ""
echo "=== Portfolio Endpoints ==="
test_endpoint "GET" "$BASE_URL/api/portfolio" "List Portfolios"
# Use a valid UUID format for testing (entities now use UUID, not Long)
test_uuid="550e8400-e29b-41d4-a716-446655440000"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid" "Get Portfolio by ID"
portfolio_payload="{\"name\":\"Test Portfolio\",\"description\":\"Test\"}"
test_endpoint "POST" "$BASE_URL/api/portfolio" "Create Portfolio" "$portfolio_payload" "200"
test_endpoint "PUT" "$BASE_URL/api/portfolio/$test_uuid" "Update Portfolio" "$portfolio_payload" "200"
test_endpoint "DELETE" "$BASE_URL/api/portfolio/$test_uuid" "Delete Portfolio" "" "204"

# 4. Portfolio Sub-resources
echo ""
echo "=== Portfolio Sub-resources ==="
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/open-positions" "List Open Positions"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/open-positions/1" "Get Open Position by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/open-positions/symbol/RELIANCE" "Get Open Position by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/pending-orders" "List Pending Orders"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/pending-orders/1" "Get Pending Order by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/pending-orders/order-id/ORD123" "Get Pending Order by Order ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holdings" "List Holdings"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holdings/RELIANCE" "Get Holding by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trades" "List Trades"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trades?symbol=RELIANCE" "List Trades by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trades/1" "Get Trade by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/benchmarks" "List Benchmarks"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/benchmarks/NIFTY50" "Get Benchmark by Index"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/cash-flows" "List Cash Flows"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/cash-flows?startDate=2024-01-01&endDate=2024-12-31" "List Cash Flows by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/cash-flows/1" "Get Cash Flow by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/transactions" "List Transactions"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/transactions?startDate=2024-01-01&endDate=2024-12-31" "List Transactions by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/transactions/1" "Get Transaction by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trade-logs" "List Trade Logs"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trade-logs?symbol=RELIANCE" "List Trade Logs by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/trade-logs/1" "Get Trade Log by ID"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/valuations-daily" "List Daily Valuations"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/valuations-daily?startDate=2024-01-01&endDate=2024-12-31" "List Daily Valuations by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/valuations-daily/2024-01-01" "Get Daily Valuation by Date"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/metrics-daily" "List Daily Metrics"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/metrics-daily?startDate=2024-01-01&endDate=2024-12-31" "List Daily Metrics by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/metrics-daily/2024-01-01" "Get Daily Metrics by Date"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/stock-metrics-daily" "List Stock Metrics Daily"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/stock-metrics-daily?symbol=RELIANCE" "List Stock Metrics Daily by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/stock-metrics-daily?startDate=2024-01-01&endDate=2024-12-31" "List Stock Metrics Daily by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/stock-metrics-daily/RELIANCE/2024-01-01" "Get Stock Metrics Daily by Symbol and Date"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holding-valuations" "List Holding Valuations"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holding-valuations?symbol=RELIANCE" "List Holding Valuations by Symbol"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holding-valuations?startDate=2024-01-01&endDate=2024-12-31" "List Holding Valuations by Date Range"
test_endpoint "GET" "$BASE_URL/api/portfolio/$test_uuid/holding-valuations/RELIANCE/2024-01-01" "Get Holding Valuation by Symbol and Date"

# 5. Screener Endpoints
echo ""
echo "=== Screener Endpoints ==="
test_endpoint "GET" "$BASE_URL/api/screeners" "List Screeners"
screener_uuid="660e8400-e29b-41d4-a716-446655440000"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid" "Get Screener by ID"
screener_payload="{\"name\":\"Test Screener\",\"description\":\"Test\"}"
test_endpoint "POST" "$BASE_URL/api/screeners" "Create Screener" "$screener_payload" "200"
test_endpoint "PUT" "$BASE_URL/api/screeners/$screener_uuid" "Update Screener" "$screener_payload" "200"
test_endpoint "DELETE" "$BASE_URL/api/screeners/$screener_uuid" "Delete Screener" "" "204"

# 6. Screener Sub-resources
echo ""
echo "=== Screener Sub-resources ==="
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/versions" "List Screener Versions"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/versions/1" "Get Screener Version by ID"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/versions/version/1" "Get Screener Version by Number"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/runs" "List Screener Runs"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/runs?status=COMPLETED" "List Screener Runs by Status"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/runs?tradingDay=2024-01-01" "List Screener Runs by Trading Day"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/runs/1" "Get Screener Run by ID"
test_endpoint "GET" "$BASE_URL/api/screener-runs/1/results" "List Screener Results"
test_endpoint "GET" "$BASE_URL/api/screener-runs/1/results?matched=true" "List Screener Results by Matched"
test_endpoint "GET" "$BASE_URL/api/screener-runs/1/results?sortBy=score" "List Screener Results by Score"
test_endpoint "GET" "$BASE_URL/api/screener-runs/1/results/RELIANCE" "Get Screener Result by Symbol"
test_endpoint "GET" "$BASE_URL/api/screener-versions/1/paramsets" "List Screener Paramsets"
test_endpoint "GET" "$BASE_URL/api/screener-versions/1/paramsets/1" "Get Screener Paramset by ID"
test_endpoint "GET" "$BASE_URL/api/screener-versions/1/paramsets/name/test" "Get Screener Paramset by Name"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/alerts" "List Screener Alerts"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/alerts/1" "Get Screener Alert by ID"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/saved-views" "List Screener Saved Views"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/saved-views/1" "Get Screener Saved View by ID"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/schedules" "List Screener Schedules"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/schedules/1" "Get Screener Schedule by ID"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/stars" "List Screener Stars"
test_endpoint "GET" "$BASE_URL/api/screeners/$screener_uuid/stars/1" "Get Screener Star by User ID"

# 7. Screener Functions
echo ""
echo "=== Screener Functions ==="
test_endpoint "GET" "$BASE_URL/api/screener-functions" "List Screener Functions"
test_endpoint "GET" "$BASE_URL/api/screener-functions?category=technical" "List Screener Functions by Category"
test_endpoint "GET" "$BASE_URL/api/screener-functions/1" "Get Screener Function by ID"
test_endpoint "GET" "$BASE_URL/api/screener-functions/name/test" "Get Screener Function by Name"
test_endpoint "GET" "$BASE_URL/api/screener-functions/1/params" "List Screener Function Params"
test_endpoint "GET" "$BASE_URL/api/screener-functions/1/params/1" "Get Screener Function Param by ID"

# 8. Backtest Endpoints
echo ""
echo "=== Backtest Endpoints ==="
test_endpoint "GET" "$BASE_URL/api/backtests" "List Backtests"
test_endpoint "GET" "$BASE_URL/api/backtests/00000000-0000-0000-0000-000000000000" "Get Backtest by UUID"
test_endpoint "GET" "$BASE_URL/api/backtests/00000000-0000-0000-0000-000000000000/trades" "Get Backtest Trades"

# 9. Signal Endpoints
echo ""
echo "=== Signal Endpoints ==="
test_endpoint "GET" "$BASE_URL/api/signals" "List Signals"
signal_uuid="770e8400-e29b-41d4-a716-446655440000"
test_endpoint "GET" "$BASE_URL/api/signals/1" "Get Signal by ID"
test_endpoint "GET" "$BASE_URL/api/signals/portfolio/$test_uuid" "List Signals by Portfolio"
test_endpoint "GET" "$BASE_URL/api/signals/portfolio/$test_uuid/pending" "List Pending Signals"

# Summary
echo ""
echo "========================================="
echo "Testing Summary"
echo "========================================="
echo -e "${GREEN}Passed: $PASSED_COUNT${NC}"
echo -e "${RED}Failed: $FAILED_COUNT${NC}"
echo ""

if [ ${#FAILED_ENDPOINTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed Endpoints:${NC}"
    for endpoint in "${FAILED_ENDPOINTS[@]}"; do
        echo "  - $endpoint"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}All endpoints passed!${NC}"
    exit 0
fi

