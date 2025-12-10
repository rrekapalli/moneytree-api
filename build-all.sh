#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${ROOT_DIR}/scripts"

"${SCRIPTS_DIR}/build-frontend.sh"
"${SCRIPTS_DIR}/build-backend.sh"

echo "==> Building socketengine module..."
cd "${ROOT_DIR}/socketengine" && ./mvnw clean package -DskipTests && cd "${ROOT_DIR}"
echo "==> Socketengine build completed successfully."

echo "==> All builds completed successfully."

