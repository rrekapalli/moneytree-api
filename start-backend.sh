#!/bin/bash
# Start Backend with root .env file
set -e

echo "Starting Backend with root .env configuration..."

# Load environment variables from root .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Loaded environment variables from root .env file"
else
    echo "ERROR: Root .env file not found!"
    exit 1
fi

# Change to backend directory and start
cd backend
echo "Starting Backend..."
./start-app.sh