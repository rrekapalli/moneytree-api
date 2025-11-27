#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"

echo "==> Building backend (Spring Boot) ..."
cd "${BACKEND_DIR}"

# Clean and package the backend; skip tests for faster local rebuilds.
mvn clean package -DskipTests

echo "==> Backend build complete (artifacts under backend/target)"

