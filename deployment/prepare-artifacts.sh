#!/bin/bash

# Script to prepare deployment artifacts for MoneyTree components
# This script builds all components and packages them for deployment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Create artifacts directory
mkdir -p "$ARTIFACTS_DIR"
log_info "Created artifacts directory: ${ARTIFACTS_DIR}"

# Get root directory (parent of deployment folder)
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Build Backend
log_info "Building backend..."
cd "${ROOT_DIR}/backend"
if command -v mvn >/dev/null 2>&1; then
    mvn clean package -DskipTests
    cp target/moneytree-backend-*.jar "${ARTIFACTS_DIR}/moneytree-backend.jar"
    log_success "Backend JAR created: ${ARTIFACTS_DIR}/moneytree-backend.jar"
else
    log_warn "Maven not found. Skipping backend build."
fi

# Build SocketEngine
log_info "Building socketengine..."
cd "${ROOT_DIR}/socketengine"
if [[ -f "./mvnw" ]]; then
    ./mvnw clean package -DskipTests
    cp target/socketengine-*.jar "${ARTIFACTS_DIR}/socketengine.jar"
    log_success "SocketEngine JAR created: ${ARTIFACTS_DIR}/socketengine.jar"
else
    log_warn "Maven wrapper not found. Skipping socketengine build."
fi

# Build Frontend
log_info "Building frontend..."
cd "${ROOT_DIR}/frontend"
if command -v npm >/dev/null 2>&1; then
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    npm run build:prod
    
    # Create zip file from dist directory
    cd dist
    zip -r "${ARTIFACTS_DIR}/frontend-dist.zip" . > /dev/null 2>&1
    log_success "Frontend artifact created: ${ARTIFACTS_DIR}/frontend-dist.zip"
else
    log_warn "npm not found. Skipping frontend build."
fi

# Summary
echo ""
log_success "Artifact preparation complete!"
echo ""
log_info "Artifacts ready for deployment:"
ls -lh "${ARTIFACTS_DIR}" | tail -n +2 | awk '{print "  - " $9 " (" $5 ")"}'
echo ""
log_info "To deploy, copy these files to your VMs:"
echo "  scp ${ARTIFACTS_DIR}/* user@vm-hostname:~/"
