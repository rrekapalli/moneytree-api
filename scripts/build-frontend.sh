#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

echo "==> Building frontend (Angular) ..."
cd "${FRONTEND_DIR}"

# Ensure dependencies are installed before building
if [ ! -d node_modules ]; then
  echo "node_modules not found – running npm install ..."
  npm install
fi

# Always make sure lockfile is honored
npm install

npm run build

echo "==> Frontend build complete (artifacts under frontend/dist)"

