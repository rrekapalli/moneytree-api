#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${ROOT_DIR}/scripts"

"${SCRIPTS_DIR}/build-frontend.sh"
"${SCRIPTS_DIR}/build-backend.sh"

echo "==> Frontend and backend builds completed successfully."

