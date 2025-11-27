#!/bin/bash
cd "$(dirname "$0")"

# Function to kill process on a port
kill_port() {
  local port=$1
  local service_name=$2
  local pid=$(lsof -ti:$port 2>/dev/null)
  
  if [ -n "$pid" ]; then
    echo "Port $port is already in use (PID: $pid). Terminating $service_name..."
    kill -9 $pid 2>/dev/null
    sleep 1
    # Verify the port is free
    if lsof -ti:$port >/dev/null 2>&1; then
      echo "Warning: Port $port is still in use. Trying again..."
      sleep 1
      kill -9 $(lsof -ti:$port 2>/dev/null) 2>/dev/null
    fi
    echo "Port $port is now free."
  fi
}

# Check and free ports before starting
echo "Checking for existing processes on ports 8080 and 4200..."
kill_port 8080 "backend"
kill_port 4200 "frontend"

# Start backend in background
echo "Starting backend on port 8080..."
cd backend
./start-app.sh &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Start frontend in background
echo "Starting frontend on port 4200..."
cd frontend
./start-dev.sh &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:4200"
echo "API Docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait

