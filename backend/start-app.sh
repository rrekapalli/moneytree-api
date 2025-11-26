#!/bin/bash

# Startup script that loads .env file and starts the Spring Boot application

cd "$(dirname "$0")"

if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    # Source the .env file to load variables into current shell
    set -a
    source .env
    set +a
    echo "Environment variables loaded."
    echo "DB_USERNAME is set: ${DB_USERNAME:+yes}"
    echo "DB_PASSWORD is set: ${DB_PASSWORD:+yes}"
else
    echo "Warning: .env file not found. Using system environment variables."
fi

echo "Starting Spring Boot application..."
mvn spring-boot:run

