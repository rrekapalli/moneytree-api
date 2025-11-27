#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

echo "==> Building backend (Spring Boot) ..."
cd "${BACKEND_DIR}"

# Clean and package the backend; skip tests for faster local rebuilds.
mvn clean package -DskipTests

echo "==> Backend build complete (artifacts under backend/target)"

