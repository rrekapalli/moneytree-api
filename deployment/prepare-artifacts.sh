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
RED='\033[0;31m'
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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
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
    # Find the JAR file (should be the Spring Boot executable JAR)
    JAR_FILE=$(find target -name "moneytree-backend-*.jar" -type f | head -1)
    if [[ -z "$JAR_FILE" ]]; then
        log_warn "No JAR file found in target directory"
    else
        # Verify the JAR has a Main-Class attribute
        if unzip -p "$JAR_FILE" META-INF/MANIFEST.MF 2>/dev/null | grep -q "Main-Class:"; then
            cp "$JAR_FILE" "${ARTIFACTS_DIR}/moneytree-backend.jar"
            log_success "Backend JAR created: ${ARTIFACTS_DIR}/moneytree-backend.jar"
        else
            log_warn "JAR file does not have Main-Class attribute. This may not be an executable JAR."
            log_warn "Attempting to use it anyway..."
            cp "$JAR_FILE" "${ARTIFACTS_DIR}/moneytree-backend.jar"
            log_success "Backend JAR copied: ${ARTIFACTS_DIR}/moneytree-backend.jar"
        fi
    fi
else
    log_warn "Maven not found. Skipping backend build."
fi

# Build SocketEngine
log_info "Building socketengine..."
cd "${ROOT_DIR}/socketengine"
if [[ -f "./mvnw" ]]; then
    ./mvnw clean package -DskipTests
    # Find the JAR file (should be the Spring Boot executable JAR)
    JAR_FILE=$(find target -name "socketengine-*.jar" -type f | head -1)
    if [[ -z "$JAR_FILE" ]]; then
        log_warn "No JAR file found in target directory"
    else
        # Verify the JAR has a Main-Class attribute
        if unzip -p "$JAR_FILE" META-INF/MANIFEST.MF 2>/dev/null | grep -q "Main-Class:"; then
            cp "$JAR_FILE" "${ARTIFACTS_DIR}/socketengine.jar"
            log_success "SocketEngine JAR created: ${ARTIFACTS_DIR}/socketengine.jar"
        else
            log_warn "JAR file does not have Main-Class attribute. This may not be an executable JAR."
            log_warn "Attempting to use it anyway..."
            cp "$JAR_FILE" "${ARTIFACTS_DIR}/socketengine.jar"
            log_success "SocketEngine JAR copied: ${ARTIFACTS_DIR}/socketengine.jar"
        fi
    fi
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
    
    # Clean dist directory before build to remove old artifacts (especially test-out)
    if [[ -d "dist" ]]; then
        log_info "Cleaning dist directory..."
        rm -rf dist/test-out dist/dashboards dist/querybuilder dist/money-plant-frontend 2>/dev/null || true
    fi
    
    npm run build:prod
    
    # Create zip file from production build directory only
    # Angular 20 outputs to dist/moneytree-app/browser/
    PROD_BUILD_DIR=""
    if [[ -d "dist/moneytree-app/browser" ]]; then
        PROD_BUILD_DIR="dist/moneytree-app/browser"
    elif [[ -d "dist/moneytree-app" ]]; then
        PROD_BUILD_DIR="dist/moneytree-app"
    else
        log_error "Production build directory not found!"
        log_error "Expected: dist/moneytree-app/browser or dist/moneytree-app"
        log_error "Found in dist:"
        ls -la dist/ 2>/dev/null || true
        exit 1
    fi
    
    log_info "Creating zip from production build: ${PROD_BUILD_DIR}"
    cd "${PROD_BUILD_DIR}"
    # Exclude source maps and other unnecessary files
    zip -r "${ARTIFACTS_DIR}/frontend-dist.zip" . \
        -x "*.map" \
        -x "*.ts" \
        -x "*.scss" \
        -x "*.css.map" \
        -x "test-out/*" \
        -x "*.spec.js" \
        > /dev/null 2>&1
    
    ZIP_SIZE=$(du -h "${ARTIFACTS_DIR}/frontend-dist.zip" | cut -f1)
    log_success "Frontend artifact created: ${ARTIFACTS_DIR}/frontend-dist.zip (${ZIP_SIZE})"
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
