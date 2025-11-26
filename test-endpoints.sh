#!/bin/bash

# Test script for MoneyTree API endpoints
# Waits for application to start, then tests all endpoints

BASE_URL="http://localhost:8080"
MAX_WAIT=120
WAIT_INTERVAL=5

echo "Waiting for application to start on $BASE_URL..."
elapsed=0
while [ $elapsed -lt $MAX_WAIT ]; do
    if curl -s -f "$BASE_URL/actuator/health" > /dev/null 2>&1; then
        echo "✓ Application is running!"
        break
    fi
    echo "  Waiting... (${elapsed}s/${MAX_WAIT}s)"
    sleep $WAIT_INTERVAL
    elapsed=$((elapsed + WAIT_INTERVAL))
done

if [ $elapsed -ge $MAX_WAIT ]; then
    echo "✗ Application did not start within ${MAX_WAIT}s"
    exit 1
fi

echo ""
echo "========================================="
echo "Testing MoneyTree API Endpoints"
echo "========================================="
echo ""

# Test health endpoint
echo "1. Testing Health Endpoint:"
echo "   GET $BASE_URL/actuator/health"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/actuator/health")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')
echo "   Status: $http_code"
echo "   Response: $body"
echo ""

# Test Kite Market Data - History endpoint
echo "2. Testing Kite History Endpoint:"
echo "   POST $BASE_URL/api/marketdata/kite/{tradingsymbol}/history"
# Using a sample trading symbol (you may need to adjust this)
trading_symbol="NIFTY50"  # Example: NIFTY 50
instrument_token="408065"  # Example instrument token
from=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "2024-01-01T00:00:00Z")
to=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo "2024-01-08T00:00:00Z")
url="$BASE_URL/api/marketdata/kite/$trading_symbol/history"
payload=$(cat <<EOF
{
  "tradingsymbol": "$trading_symbol",
  "instrumenttoken": "$instrument_token",
  "exchange": "NSE",
  "interval": "day",
  "from": "$from",
  "to": "$to"
}
EOF
)
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST -H "Content-Type: application/json" -d "$payload" "$url")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test Kite Market Data - Quotes endpoint
echo "3. Testing Kite Quotes Endpoint:"
echo "   GET $BASE_URL/api/marketdata/kite/quotes"
url="$BASE_URL/api/marketdata/kite/quotes?symbols=INFY,NIFTY50"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$url")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test Portfolio endpoint
echo "4. Testing Portfolio Endpoint:"
echo "   GET $BASE_URL/api/portfolio"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/portfolio")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test Screeners endpoint
echo "5. Testing Screeners Endpoint:"
echo "   GET $BASE_URL/api/screeners"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/screeners")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test Backtests endpoint
echo "6. Testing Backtests Endpoint:"
echo "   GET $BASE_URL/api/backtests"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/backtests")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test Signals endpoint
echo "7. Testing Signals Endpoint:"
echo "   GET $BASE_URL/api/signals"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/signals")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

# Test error handling - invalid date range
echo "8. Testing Error Handling (Invalid Date Range):"
echo "   POST $BASE_URL/api/marketdata/kite/$trading_symbol/history"
invalid_url="$BASE_URL/api/marketdata/kite/$trading_symbol/history"
invalid_payload=$(cat <<EOF
{
  "tradingsymbol": "$trading_symbol",
  "instrumenttoken": "$instrument_token",
  "exchange": "NSE",
  "interval": "day",
  "from": "$to",
  "to": "$from"
}
EOF
)
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST -H "Content-Type: application/json" -d "$invalid_payload" "$invalid_url")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d' | head -c 200)
echo "   Status: $http_code"
echo "   Response (first 200 chars): $body"
echo ""

echo "========================================="
echo "Endpoint Testing Complete"
echo "========================================="

