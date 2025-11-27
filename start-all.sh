#!/bin/bash
cd "$(dirname "$0")"

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

