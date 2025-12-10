#!/bin/bash
# Start SocketEngine with root .env file
set -e

echo "Starting SocketEngine with root .env configuration..."

# Load environment variables from root .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Loaded environment variables from root .env file"
else
    echo "ERROR: Root .env file not found!"
    exit 1
fi

# Change to socketengine directory and start
cd socketengine
echo "Starting SocketEngine on port 8081..."
./mvnw spring-boot:run