#!/bin/bash
set -e

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start Spring Boot application
echo "Starting SocketEngine module on port 8081..."
./mvnw spring-boot:run
