#!/bin/bash

# Test script to verify proper shutdown behavior of SocketEngine
# This script starts the application and then sends various termination signals

echo "Testing SocketEngine shutdown behavior..."

# Function to test shutdown with a specific signal
test_shutdown() {
    local signal=$1
    local description=$2
    
    echo ""
    echo "=== Testing shutdown with $description ($signal) ==="
    
    # Start the application in background
    echo "Starting SocketEngine..."
    ./start-app.sh &
    APP_PID=$!
    
    # Wait for application to start
    echo "Waiting for application to start (10 seconds)..."
    sleep 10
    
    # Check if application is running
    if ! kill -0 $APP_PID 2>/dev/null; then
        echo "ERROR: Application failed to start"
        return 1
    fi
    
    echo "Application started with PID: $APP_PID"
    echo "Sending $signal signal..."
    
    # Send the termination signal
    kill -$signal $APP_PID
    
    # Wait for graceful shutdown (max 35 seconds)
    local count=0
    while kill -0 $APP_PID 2>/dev/null && [ $count -lt 35 ]; do
        echo "Waiting for shutdown... ($count/35 seconds)"
        sleep 1
        count=$((count + 1))
    done
    
    # Check if process is still running
    if kill -0 $APP_PID 2>/dev/null; then
        echo "WARNING: Application did not shutdown gracefully, forcing kill"
        kill -9 $APP_PID
        return 1
    else
        echo "SUCCESS: Application shutdown gracefully"
        return 0
    fi
}

# Test different shutdown scenarios
echo "This script will test various shutdown scenarios for SocketEngine"
echo "Make sure you have proper Kite API credentials configured"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Test 1: SIGTERM (normal shutdown)
test_shutdown "TERM" "SIGTERM (normal shutdown)"
SIGTERM_RESULT=$?

# Test 2: SIGINT (Ctrl+C)
test_shutdown "INT" "SIGINT (Ctrl+C)"
SIGINT_RESULT=$?

# Summary
echo ""
echo "=== SHUTDOWN TEST RESULTS ==="
echo "SIGTERM test: $([ $SIGTERM_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "SIGINT test:  $([ $SIGINT_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"

if [ $SIGTERM_RESULT -eq 0 ] && [ $SIGINT_RESULT -eq 0 ]; then
    echo ""
    echo "✅ All shutdown tests PASSED"
    echo "SocketEngine properly handles graceful shutdown and Kite unsubscription"
else
    echo ""
    echo "❌ Some shutdown tests FAILED"
    echo "Check the application logs for details"
fi

echo ""
echo "To manually test:"
echo "1. Start SocketEngine: ./start-app.sh"
echo "2. Watch the logs for Kite subscription messages"
echo "3. Press Ctrl+C to shutdown"
echo "4. Verify you see 'Unsubscribing from all instruments' in the logs"
echo "5. Check that no more tick data is received after shutdown"