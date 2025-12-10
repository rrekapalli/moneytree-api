#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

log_prompt() {
    echo -e "${CYAN}[?]${NC} $1"
}

prompt_yes_no() {
    local prompt_text="$1"
    local var_name="$2"
    local default="${3:-n}"
    
    local default_text="y/N"
    if [[ "$default" == "y" ]]; then
        default_text="Y/n"
    fi
    
    log_prompt "${prompt_text} [${default_text}]: "
    read -r input
    input="${input:-$default}"
    
    if [[ "$input" =~ ^[Yy]$ ]]; then
        eval "$var_name=\"y\""
    else
        eval "$var_name=\"n\""
    fi
}

log_info "=========================================="
log_info "MoneyTree Complete Deployment"
log_info "=========================================="
echo ""

# Check if artifacts exist
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
if [[ ! -d "$ARTIFACTS_DIR" ]] || [[ -z "$(ls -A "$ARTIFACTS_DIR" 2>/dev/null)" ]]; then
    log_warn "Artifacts directory is empty or doesn't exist."
    log_info "Would you like to build artifacts now?"
    prompt_yes_no "Build artifacts?" BUILD_ARTIFACTS "y"
    
    if [[ "$BUILD_ARTIFACTS" == "y" ]]; then
        if [[ -f "${SCRIPT_DIR}/prepare-artifacts.sh" ]]; then
            log_info "Building artifacts..."
            "${SCRIPT_DIR}/prepare-artifacts.sh"
        else
            log_error "prepare-artifacts.sh not found!"
            exit 1
        fi
    else
        log_error "Cannot proceed without artifacts. Exiting."
        exit 1
    fi
fi

# Deployment order
COMPONENTS=("backend" "socketengine" "frontend")
COMPONENT_SCRIPTS=(
    "${SCRIPT_DIR}/deploy-backend.sh"
    "${SCRIPT_DIR}/deploy-socketengine.sh"
    "${SCRIPT_DIR}/deploy-frontend.sh"
)

# Ask which components to deploy
echo ""
log_info "Select components to deploy:"
echo ""

DEPLOY_BACKEND="n"
DEPLOY_SOCKETENGINE="n"
DEPLOY_FRONTEND="n"

prompt_yes_no "Deploy Backend?" DEPLOY_BACKEND "y"
prompt_yes_no "Deploy SocketEngine?" DEPLOY_SOCKETENGINE "y"
prompt_yes_no "Deploy Frontend?" DEPLOY_FRONTEND "y"

if [[ "$DEPLOY_BACKEND" != "y" ]] && [[ "$DEPLOY_SOCKETENGINE" != "y" ]] && [[ "$DEPLOY_FRONTEND" != "y" ]]; then
    log_warn "No components selected. Exiting."
    exit 0
fi

# Deploy selected components
echo ""
log_info "Starting deployment..."
echo ""

if [[ "$DEPLOY_BACKEND" == "y" ]]; then
    log_info "=========================================="
    log_info "Deploying Backend"
    log_info "=========================================="
    if [[ -f "${COMPONENT_SCRIPTS[0]}" ]]; then
        "${COMPONENT_SCRIPTS[0]}"
        if [[ $? -eq 0 ]]; then
            log_success "Backend deployment completed successfully!"
        else
            log_error "Backend deployment failed!"
            exit 1
        fi
    else
        log_error "deploy-backend.sh not found!"
        exit 1
    fi
    echo ""
fi

if [[ "$DEPLOY_SOCKETENGINE" == "y" ]]; then
    log_info "=========================================="
    log_info "Deploying SocketEngine"
    log_info "=========================================="
    if [[ -f "${COMPONENT_SCRIPTS[1]}" ]]; then
        "${COMPONENT_SCRIPTS[1]}"
        if [[ $? -eq 0 ]]; then
            log_success "SocketEngine deployment completed successfully!"
        else
            log_error "SocketEngine deployment failed!"
            exit 1
        fi
    else
        log_error "deploy-socketengine.sh not found!"
        exit 1
    fi
    echo ""
fi

if [[ "$DEPLOY_FRONTEND" == "y" ]]; then
    log_info "=========================================="
    log_info "Deploying Frontend"
    log_info "=========================================="
    if [[ -f "${COMPONENT_SCRIPTS[2]}" ]]; then
        "${COMPONENT_SCRIPTS[2]}"
        if [[ $? -eq 0 ]]; then
            log_success "Frontend deployment completed successfully!"
        else
            log_error "Frontend deployment failed!"
            exit 1
        fi
    else
        log_error "deploy-frontend.sh not found!"
        exit 1
    fi
    echo ""
fi

log_info "=========================================="
log_success "All selected components deployed successfully!"
log_info "=========================================="
echo ""
log_info "Deployment Summary:"
[[ "$DEPLOY_BACKEND" == "y" ]] && log_info "  ✓ Backend"
[[ "$DEPLOY_SOCKETENGINE" == "y" ]] && log_info "  ✓ SocketEngine"
[[ "$DEPLOY_FRONTEND" == "y" ]] && log_info "  ✓ Frontend"
echo ""
