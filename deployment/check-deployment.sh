#!/bin/bash

# Script to check deployment status on all servers

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Load .env file
if [[ -f "$ENV_FILE" ]]; then
    set -a
    source <(grep -v '^#' "$ENV_FILE" | grep -v '^$' | grep '=')
    set +a
fi

SSH_USER="${SSH_USER:-$USER}"

echo ""
log_info "=========================================="
log_info "MoneyTree Deployment Status Check"
log_info "=========================================="
echo ""

# Check Backend
log_info "Checking Backend (backend.tailce422e.ts.net)..."
echo "----------------------------------------"
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${SSH_USER}@backend.tailce422e.ts.net" "test -d /home/moneytree-backend/app" 2>/dev/null; then
    log_success "✓ Application directory exists: /home/moneytree-backend/app"
    
    # Check if JAR exists
    if ssh "${SSH_USER}@backend.tailce422e.ts.net" "test -f /home/moneytree-backend/app/app.jar" 2>/dev/null; then
        log_success "✓ JAR file exists"
        ssh "${SSH_USER}@backend.tailce422e.ts.net" "ls -lh /home/moneytree-backend/app/app.jar" 2>/dev/null || true
    else
        log_error "✗ JAR file NOT found"
    fi
    
    # Check systemd service
    if ssh "${SSH_USER}@backend.tailce422e.ts.net" "systemctl list-unit-files | grep -q moneytree-backend" 2>/dev/null; then
        log_success "✓ Systemd service exists"
        ssh "${SSH_USER}@backend.tailce422e.ts.net" "systemctl status moneytree-backend --no-pager -l | head -10" 2>/dev/null || true
    else
        log_error "✗ Systemd service NOT found"
    fi
    
    # Check if service is running
    if ssh "${SSH_USER}@backend.tailce422e.ts.net" "systemctl is-active moneytree-backend" 2>/dev/null | grep -q "active"; then
        log_success "✓ Service is RUNNING"
    else
        log_error "✗ Service is NOT running"
        log_info "Last 10 lines of logs:"
        ssh "${SSH_USER}@backend.tailce422e.ts.net" "journalctl -u moneytree-backend -n 10 --no-pager" 2>/dev/null || true
    fi
else
    log_error "✗ Application directory NOT found - Backend NOT DEPLOYED"
fi
echo ""

# Check SocketEngine
log_info "Checking SocketEngine (socketengine.tailce422e.ts.net)..."
echo "----------------------------------------"
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${SSH_USER}@socketengine.tailce422e.ts.net" "test -d /home/moneytree-socketengine/app" 2>/dev/null; then
    log_success "✓ Application directory exists: /home/moneytree-socketengine/app"
    
    # Check if JAR exists
    if ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "test -f /home/moneytree-socketengine/app/app.jar" 2>/dev/null; then
        log_success "✓ JAR file exists"
        ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "ls -lh /home/moneytree-socketengine/app/app.jar" 2>/dev/null || true
    else
        log_error "✗ JAR file NOT found"
    fi
    
    # Check systemd service
    if ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "systemctl list-unit-files | grep -q moneytree-socketengine" 2>/dev/null; then
        log_success "✓ Systemd service exists"
        ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "systemctl status moneytree-socketengine --no-pager -l | head -10" 2>/dev/null || true
    else
        log_error "✗ Systemd service NOT found"
    fi
    
    # Check if service is running
    if ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "systemctl is-active moneytree-socketengine" 2>/dev/null | grep -q "active"; then
        log_success "✓ Service is RUNNING"
    else
        log_error "✗ Service is NOT running"
        log_info "Last 10 lines of logs:"
        ssh "${SSH_USER}@socketengine.tailce422e.ts.net" "journalctl -u moneytree-socketengine -n 10 --no-pager" 2>/dev/null || true
    fi
else
    log_error "✗ Application directory NOT found - SocketEngine NOT DEPLOYED"
fi
echo ""

# Check Frontend
log_info "Checking Frontend (moneytree.tailce422e.ts.net)..."
echo "----------------------------------------"
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${SSH_USER}@moneytree.tailce422e.ts.net" "test -d /var/www/moneytree" 2>/dev/null; then
    log_success "✓ Web root exists: /var/www/moneytree"
    
    # Check if index.html exists
    if ssh "${SSH_USER}@moneytree.tailce422e.ts.net" "test -f /var/www/moneytree/index.html" 2>/dev/null; then
        log_success "✓ index.html exists"
        ssh "${SSH_USER}@moneytree.tailce422e.ts.net" "ls -lh /var/www/moneytree/index.html" 2>/dev/null || true
    else
        log_error "✗ index.html NOT found"
    fi
    
    # Check Nginx
    if ssh "${SSH_USER}@moneytree.tailce422e.ts.net" "systemctl is-active nginx" 2>/dev/null | grep -q "active"; then
        log_success "✓ Nginx is RUNNING"
    else
        log_error "✗ Nginx is NOT running"
    fi
    
    # Check Nginx config
    if ssh "${SSH_USER}@moneytree.tailce422e.ts.net" "test -f /etc/nginx/sites-available/moneytree" 2>/dev/null; then
        log_success "✓ Nginx config exists"
    else
        log_warn "⚠ Nginx config NOT found"
    fi
else
    log_error "✗ Web root NOT found - Frontend NOT DEPLOYED"
fi
echo ""

log_info "=========================================="
log_info "Summary"
log_info "=========================================="
log_info "Backend location: /home/moneytree-backend/app"
log_info "SocketEngine location: /home/moneytree-socketengine/app"
log_info "Frontend location: /var/www/moneytree"
echo ""
