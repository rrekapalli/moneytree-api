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
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
CONFIG_FILE="${SCRIPT_DIR}/deployment.conf"
ENV_FILE="${ROOT_DIR}/.env"

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

# Parse command line arguments
ACCEPT_DEFAULTS=false
for arg in "$@"; do
    case $arg in
        --accept-defaults|--accept-default)
            ACCEPT_DEFAULTS=true
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --accept-defaults    Use all defaults from config file and .env, skip prompts"
            echo "  --help, -h           Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

prompt_with_default() {
    local prompt_text="$1"
    local default_value="$2"
    local var_name="$3"
    
    if [[ -n "$default_value" ]]; then
        log_prompt "${prompt_text} [${default_value}]: "
    else
        log_prompt "${prompt_text}: "
    fi
    
    read -r input
    if [[ -z "$input" && -n "$default_value" ]]; then
        eval "$var_name=\"$default_value\""
    else
        eval "$var_name=\"$input\""
    fi
}

prompt_password() {
    local prompt_text="$1"
    local var_name="$2"
    
    log_prompt "${prompt_text}: "
    read -rs input
    echo
    eval "$var_name=\"$input\""
}

log_info "=========================================="
log_info "MoneyTree Frontend Deployment"
log_info "=========================================="
echo ""

# Load configuration file if it exists
if [[ -f "$CONFIG_FILE" ]]; then
    log_info "Loading configuration from ${CONFIG_FILE}..."
    # Source the config file, ignoring comments and empty lines
    set -a
    source <(grep -v '^#' "$CONFIG_FILE" | grep -v '^$' | grep '=')
    set +a
else
    log_warn "Configuration file not found: ${CONFIG_FILE}"
    log_warn "Using default values. Consider creating deployment.conf"
fi

# Load .env file from root directory if it exists
if [[ -f "$ENV_FILE" ]]; then
    log_info "Loading credentials from ${ENV_FILE}..."
    # Source the .env file, ignoring comments and empty lines
    set -a
    source <(grep -v '^#' "$ENV_FILE" | grep -v '^$' | grep '=')
    set +a
    # Use SSH_PASSWORD as SUDO_PASSWORD if SUDO_PASSWORD is not set
    SUDO_PASSWORD="${SUDO_PASSWORD:-$SSH_PASSWORD}"
else
    log_warn ".env file not found: ${ENV_FILE}"
    log_warn "SSH credentials will be prompted"
fi
echo ""

# Collect SSH connection details
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    log_info "SSH Connection Details"
    log_info "---------------------"
    prompt_with_default "SSH Username" "${SSH_USER:-$USER}" SSH_USER
    prompt_with_default "Server Hostname" "${FRONTEND_HOST:-moneytree.tailce422e.ts.net}" SERVER_HOST
    if [[ -z "${SSH_PASSWORD:-}" ]]; then
        prompt_password "SSH Password" SSH_PASSWORD
    else
        log_info "SSH Password loaded from .env file"
    fi
else
    SSH_USER="${SSH_USER:-$USER}"
    SERVER_HOST="${FRONTEND_HOST:-moneytree.tailce422e.ts.net}"
    if [[ -z "${SSH_USER:-}" ]]; then
        log_error "SSH_USER not found in .env file. Cannot use --accept-defaults without SSH_USER in .env"
        exit 1
    fi
    if [[ -z "${SSH_PASSWORD:-}" ]]; then
        log_error "SSH_PASSWORD not found in .env file. Cannot use --accept-defaults without SSH_PASSWORD in .env"
        exit 1
    fi
    log_info "Using SSH credentials from .env file (SSH_USER: ${SSH_USER})"
fi

echo ""
log_info "Backend API Configuration"
log_info "-------------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Backend API URL" "${BACKEND_API_URL:-https://backend.tailce422e.ts.net:8080/api}" BACKEND_API_URL
else
    BACKEND_API_URL="${BACKEND_API_URL:-https://backend.tailce422e.ts.net:8080/api}"
fi

echo ""
log_info "SocketEngine Configuration"
log_info "-------------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "SocketEngine API URL" "${SOCKETENGINE_API_URL:-https://socketengine.tailce422e.ts.net:8081/engines}" SOCKETENGINE_API_URL
    prompt_with_default "SocketEngine WebSocket URL" "${SOCKETENGINE_WS_URL:-wss://socketengine.tailce422e.ts.net:8081/engines}" SOCKETENGINE_WS_URL
    prompt_with_default "SocketEngine HTTP URL" "${SOCKETENGINE_HTTP_URL:-https://socketengine.tailce422e.ts.net:8081/engines}" SOCKETENGINE_HTTP_URL
else
    SOCKETENGINE_API_URL="${SOCKETENGINE_API_URL:-https://socketengine.tailce422e.ts.net:8081/engines}"
    SOCKETENGINE_WS_URL="${SOCKETENGINE_WS_URL:-wss://socketengine.tailce422e.ts.net:8081/engines}"
    SOCKETENGINE_HTTP_URL="${SOCKETENGINE_HTTP_URL:-https://socketengine.tailce422e.ts.net:8081/engines}"
fi

echo ""
log_info "Frontend Configuration"
log_info "---------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Frontend URL (for OAuth redirects)" "${FRONTEND_URL:-https://moneytree.tailce422e.ts.net}" FRONTEND_URL
else
    FRONTEND_URL="${FRONTEND_URL:-https://moneytree.tailce422e.ts.net}"
fi

echo ""
log_info "OAuth Configuration"
log_info "------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Google Client ID" "${GOOGLE_CLIENT_ID:-}" GOOGLE_CLIENT_ID
    prompt_with_default "Microsoft Client ID" "${MICROSOFT_CLIENT_ID:-}" MICROSOFT_CLIENT_ID
else
    GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
    MICROSOFT_CLIENT_ID="${MICROSOFT_CLIENT_ID:-}"
fi

echo ""
log_info "Application Settings"
log_info "-------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Server Name" "${FRONTEND_HOST:-moneytree.tailce422e.ts.net}" SERVER_NAME
    prompt_with_default "Application User" "${FRONTEND_USER:-moneytree-frontend}" APP_USER
else
    SERVER_NAME="${FRONTEND_HOST:-moneytree.tailce422e.ts.net}"
    APP_USER="${FRONTEND_USER:-moneytree-frontend}"
fi

# Verify artifact exists
ARTIFACT_FILE="${ARTIFACTS_DIR}/frontend-dist.zip"
if [[ ! -f "$ARTIFACT_FILE" ]]; then
    log_error "Frontend artifact not found: ${ARTIFACT_FILE}"
    log_info "Please run ./prepare-artifacts.sh first to build artifacts"
    exit 1
fi

log_success "Found artifact: ${ARTIFACT_FILE}"

# Create temporary remote deploy script
REMOTE_DEPLOY_SCRIPT=$(mktemp)
cat > "$REMOTE_DEPLOY_SCRIPT" <<'REMOTE_SCRIPT'
#!/bin/bash
set -euo pipefail

ARTIFACT_FILE="$1"
BACKEND_API_URL="$2"
SOCKETENGINE_API_URL="$3"
SOCKETENGINE_WS_URL="$4"
SOCKETENGINE_HTTP_URL="$5"
GOOGLE_CLIENT_ID="$6"
MICROSOFT_CLIENT_ID="$7"
SERVER_NAME="$8"
FRONTEND_URL="$9"
APP_USER="${10}"
SUDO_PASSWORD="${11:-}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to run sudo commands
run_sudo() {
    if [[ -n "$SUDO_PASSWORD" ]]; then
        echo "$SUDO_PASSWORD" | sudo -S "$@"
    else
        sudo "$@"
    fi
}

log_info "Starting frontend deployment..."

# Install unzip if not present
if ! command -v unzip >/dev/null 2>&1; then
    log_info "Installing unzip..."
    run_sudo apt-get update -qq
    run_sudo apt-get install -y -qq unzip > /dev/null 2>&1
fi

# Detect if this is an update or fresh install
WEB_ROOT="/var/www/moneytree"
IS_UPDATE=false
BACKUP_DIR=""

if run_sudo test -d "$WEB_ROOT" && run_sudo test -f "${WEB_ROOT}/index.html"; then
    IS_UPDATE=true
    log_info "Detected existing installation - performing update..."
else
    log_info "Fresh installation detected..."
fi

# Backup previous version if updating
if [[ "$IS_UPDATE" == true ]]; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/var/www/moneytree_backup_${BACKUP_TIMESTAMP}"
    run_sudo cp -r "$WEB_ROOT" "$BACKUP_DIR" 2>/dev/null || true
    run_sudo chown -R www-data:www-data "$BACKUP_DIR" 2>/dev/null || true
    log_info "Backed up previous version to: $(basename $BACKUP_DIR)"
fi

# Install Node.js if not present (for potential future builds)
if ! command -v node >/dev/null 2>&1; then
    log_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    run_sudo apt-get install -y -qq nodejs > /dev/null 2>&1
fi

# Install Nginx if not present
if ! command -v nginx >/dev/null 2>&1; then
    log_info "Installing Nginx..."
    run_sudo apt-get update -qq
    run_sudo apt-get install -y -qq nginx > /dev/null 2>&1
    # Verify Nginx installation
    if command -v nginx >/dev/null 2>&1; then
        NGINX_VERSION=$(nginx -v 2>&1)
        log_info "Nginx installed: $NGINX_VERSION"
    else
        log_error "Nginx installation failed!"
        exit 1
    fi
fi

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    log_info "Creating user: ${APP_USER}..."
    run_sudo useradd -m -s /bin/bash "$APP_USER"
fi

# Setup application directory
APP_DIR="/home/${APP_USER}/app"
run_sudo mkdir -p "${APP_DIR}/dist" "${APP_DIR}/backup"
run_sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# Extract and deploy frontend artifact
TEMP_DIR=$(mktemp -d)
unzip -q "$ARTIFACT_FILE" -d "$TEMP_DIR"

# Find dist directory (Angular 20 outputs to dist/moneytree-app/browser/)
if [[ -f "$TEMP_DIR/index.html" ]]; then
    # Artifact already contains the browser files directly
    DIST_SOURCE="$TEMP_DIR"
elif [[ -d "$TEMP_DIR/browser" ]]; then
    # Artifact contains browser subdirectory
    DIST_SOURCE="$TEMP_DIR/browser"
elif [[ -d "$TEMP_DIR/dist" ]]; then
    DIST_SOURCE="$TEMP_DIR/dist"
else
    log_error "Could not find dist directory or index.html in artifact"
    log_error "Contents of artifact:"
    ls -la "$TEMP_DIR" || true
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy to app directory (use temp location first, then move with sudo)
run_sudo rm -rf "${APP_DIR}/dist"
TEMP_DIST="/tmp/moneytree_dist_$$"
cp -r "$DIST_SOURCE" "$TEMP_DIST"
run_sudo mv "$TEMP_DIST" "${APP_DIR}/dist"
run_sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/dist"

# Verify dist directory was created and contains index.html (use sudo for checks)
if ! run_sudo test -d "${APP_DIR}/dist"; then
    log_error "Failed to create dist directory: ${APP_DIR}/dist"
    exit 1
fi
if ! run_sudo test -f "${APP_DIR}/dist/index.html"; then
    log_error "index.html not found in ${APP_DIR}/dist/"
    log_error "Contents of dist directory:"
    run_sudo ls -la "${APP_DIR}/dist/" || true
    exit 1
fi
log_info "Frontend files verified: index.html found in ${APP_DIR}/dist/"

# Update environment configuration in built files if needed
# Note: This is a simple approach. For production, you might want to rebuild with proper env vars
# Find all JavaScript files recursively (Angular 20 uses chunked files)
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|http://localhost:8080/api|${BACKEND_API_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|https://backend.tailce422e.ts.net:8080/api|${BACKEND_API_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|http://localhost:8081/engines|${SOCKETENGINE_API_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|https://socketengine.tailce422e.ts.net:8081/engines|${SOCKETENGINE_API_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|ws://localhost:8081/engines|${SOCKETENGINE_WS_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|wss://socketengine.tailce422e.ts.net:8081/engines|${SOCKETENGINE_WS_URL}|g" {} + 2>/dev/null || true
# Replace OAuth redirect URIs
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|http://localhost:4200|${FRONTEND_URL}|g" {} + 2>/dev/null || true
find "${APP_DIR}/dist" -type f -name "*.js" -exec sed -i "s|https://moneytree.tailce422e.ts.net|${FRONTEND_URL}|g" {} + 2>/dev/null || true

rm -rf "$TEMP_DIR"

# Deploy to web root (atomic operation)
NEW_WEB_ROOT="/var/www/moneytree_new_$$"
run_sudo mkdir -p "$NEW_WEB_ROOT"
# Use sh -c to avoid glob expansion issues with sudo
run_sudo sh -c "cp -r '${APP_DIR}/dist'/* '$NEW_WEB_ROOT/'"
run_sudo chown -R www-data:www-data "$NEW_WEB_ROOT"

# Verify web root was created and contains index.html (use sudo for checks)
if ! run_sudo test -d "$NEW_WEB_ROOT"; then
    log_error "Failed to create new web root: $NEW_WEB_ROOT"
    exit 1
fi
if ! run_sudo test -f "$NEW_WEB_ROOT/index.html"; then
    log_error "index.html not found in new web root: $NEW_WEB_ROOT"
    run_sudo rm -rf "$NEW_WEB_ROOT"
    exit 1
fi
log_info "New web root verified: $NEW_WEB_ROOT"

# Extract backend proxy URL (convert https to http for proxy_pass)
# BACKEND_API_URL format: https://backend.tailce422e.ts.net:8080/api
# We need: http://backend.tailce422e.ts.net:8080/api
BACKEND_PROXY_URL=$(echo "$BACKEND_API_URL" | sed 's|^https://|http://|')
log_info "Backend proxy URL: $BACKEND_PROXY_URL"

# Test Nginx configuration before switching
NGINX_CONFIG="/etc/nginx/sites-available/moneytree"

# Write config to temp file first, then move with sudo
TEMP_NGINX_CONFIG="/tmp/moneytree_nginx_$$"
cat > "$TEMP_NGINX_CONFIG" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SERVER_NAME};

    root ${WEB_ROOT};
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/x-javascript text/x-js;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy - forward /api requests to backend
    location /api {
        # BACKEND_PROXY_URL is already converted to http:// in the script
        proxy_pass ${BACKEND_PROXY_URL};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        # CORS headers (backend should set these, but adding as fallback)
        add_header Access-Control-Allow-Origin "${FRONTEND_URL}" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        # Handle preflight requests
        if (\$request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "${FRONTEND_URL}" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # Angular routing - serve index.html for all routes (must come after /api)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML files
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }
}
EOF
# Move config file with sudo
run_sudo mv "$TEMP_NGINX_CONFIG" "$NGINX_CONFIG"
run_sudo chmod 644 "$NGINX_CONFIG"
log_info "Nginx config file created at: $NGINX_CONFIG"

# Test configuration
log_info "Testing Nginx configuration..."
if ! run_sudo nginx -t 2>&1; then
    log_error "Nginx configuration test failed"
    run_sudo rm -rf "$NEW_WEB_ROOT"
    exit 1
fi
log_info "Nginx configuration is valid"

# Atomic switch: move old to temp, new to web root
if [[ "$IS_UPDATE" == true ]]; then
    OLD_WEB_ROOT="/var/www/moneytree_old_$$"
    run_sudo mv "$WEB_ROOT" "$OLD_WEB_ROOT" 2>/dev/null || true
fi

run_sudo mv "$NEW_WEB_ROOT" "$WEB_ROOT"

# Verify web root switch was successful (use sudo for checks)
if ! run_sudo test -d "$WEB_ROOT" || ! run_sudo test -f "$WEB_ROOT/index.html"; then
    log_error "Web root switch failed: $WEB_ROOT"
    if [[ -n "${OLD_WEB_ROOT:-}" ]] && run_sudo test -d "$OLD_WEB_ROOT"; then
        log_info "Rolling back to previous version..."
        run_sudo mv "$OLD_WEB_ROOT" "$WEB_ROOT"
    fi
    exit 1
fi
log_info "Web root switched successfully: $WEB_ROOT"

# Enable site
run_sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/moneytree
run_sudo rm -f /etc/nginx/sites-enabled/default

# Configure firewall
if command -v ufw >/dev/null 2>&1; then
    run_sudo ufw allow 80/tcp > /dev/null 2>&1 || true
    run_sudo ufw allow 443/tcp > /dev/null 2>&1 || true
fi

# Reload Nginx gracefully (reload instead of restart to avoid downtime)
if run_sudo systemctl is-active --quiet nginx 2>/dev/null; then
    log_info "Reloading Nginx gracefully..."
    if run_sudo systemctl reload nginx; then
        log_info "Nginx reloaded successfully"
    else
        log_warn "Nginx reload failed, attempting restart..."
        run_sudo systemctl restart nginx
    fi
else
    log_info "Starting Nginx..."
    run_sudo systemctl enable nginx > /dev/null 2>&1
    if ! run_sudo systemctl start nginx; then
        log_error "Failed to start Nginx"
        run_sudo systemctl status nginx --no-pager -l | head -20 || true
        log_error "Nginx error logs:"
        run_sudo tail -30 /var/log/nginx/error.log 2>/dev/null || true
        exit 1
    fi
fi

# Verify Nginx is running
sleep 2
if run_sudo systemctl is-active --quiet nginx; then
    log_success "Nginx reloaded successfully"
    
    # Clean up old web root if update succeeded
    if [[ -n "${OLD_WEB_ROOT:-}" ]] && [[ -d "$OLD_WEB_ROOT" ]]; then
        run_sudo rm -rf "$OLD_WEB_ROOT"
    fi
    
    # Clean up old backups (keep last 3)
    OLD_BACKUPS=$(run_sudo ls -dt /var/www/moneytree_backup_* 2>/dev/null | tail -n +4 || echo "")
    if [[ -n "$OLD_BACKUPS" ]]; then
        log_info "Cleaning up old backups (keeping last 3)..."
        echo "$OLD_BACKUPS" | xargs -I {} run_sudo rm -rf {} 2>/dev/null || true
    fi
else
    log_error "Nginx failed to start/reload"
    log_error "Checking Nginx status..."
    run_sudo systemctl status nginx --no-pager -l | head -20 || true
    log_error ""
    log_error "Nginx error logs:"
    run_sudo tail -50 /var/log/nginx/error.log 2>/dev/null || true
    log_error ""
    # Rollback to previous version
    if [[ -n "${BACKUP_DIR:-}" ]] && [[ -d "$BACKUP_DIR" ]]; then
        log_error "Rolling back to previous version..."
        run_sudo rm -rf "$WEB_ROOT"
        run_sudo mv "$BACKUP_DIR" "$WEB_ROOT"
        run_sudo systemctl reload nginx || run_sudo systemctl restart nginx
        log_info "Rolled back to previous version"
    fi
    log_error ""
    log_error "Common issues:"
    log_error "  1. Check Nginx config: sudo nginx -t"
    log_error "  2. Check web root exists: ls -lh $WEB_ROOT"
    log_error "  3. Check permissions: ls -ld $WEB_ROOT"
    exit 1
fi
REMOTE_SCRIPT

chmod +x "$REMOTE_DEPLOY_SCRIPT"

# Copy files to server
log_info "Copying files to server..."

# Check for sshpass and provide helpful error if missing
if ! command -v sshpass >/dev/null 2>&1; then
    log_error "sshpass is not installed. Automated deployment requires sshpass."
    log_info "To install sshpass, run:"
    log_info "  sudo apt-get install sshpass    # Ubuntu/Debian"
    log_info "  brew install hudochenkov/sshpass/sshpass    # macOS"
    log_info ""
    log_info "Or run: ${SCRIPT_DIR}/install-sshpass.sh"
    log_info ""
fi

if command -v sshpass >/dev/null 2>&1; then
    export SSHPASS="$SSH_PASSWORD"
    
    log_info "Copying frontend artifact..."
    sshpass -e scp -o StrictHostKeyChecking=no "$ARTIFACT_FILE" "${SSH_USER}@${SERVER_HOST}:/tmp/frontend-dist.zip"
    
    log_info "Copying remote deploy script..."
    sshpass -e scp -o StrictHostKeyChecking=no "$REMOTE_DEPLOY_SCRIPT" "${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    
    log_info "Executing remote deployment..."
    # Use SSH_PASSWORD as SUDO_PASSWORD if SUDO_PASSWORD is not set
    SUDO_PASSWORD="${SUDO_PASSWORD:-$SSH_PASSWORD}"
    sshpass -e ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_HOST}" \
        "chmod +x /tmp/remote-deploy.sh && /tmp/remote-deploy.sh /tmp/frontend-dist.zip '${BACKEND_API_URL}' '${SOCKETENGINE_API_URL}' '${SOCKETENGINE_WS_URL}' '${SOCKETENGINE_HTTP_URL}' '${GOOGLE_CLIENT_ID}' '${MICROSOFT_CLIENT_ID}' '${SERVER_NAME}' '${FRONTEND_URL}' '${APP_USER}' '${SUDO_PASSWORD}'"
    
    unset SSHPASS
else
    log_warn "sshpass not found. Manual steps required:"
    echo ""
    echo "1. scp ${ARTIFACT_FILE} ${SSH_USER}@${SERVER_HOST}:/tmp/frontend-dist.zip"
    echo "2. scp ${REMOTE_DEPLOY_SCRIPT} ${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    echo "3. ssh ${SSH_USER}@${SERVER_HOST}"
    echo "4. chmod +x /tmp/remote-deploy.sh"
    echo "5. sudo /tmp/remote-deploy.sh /tmp/frontend-dist.zip '${BACKEND_API_URL}' '${SOCKETENGINE_API_URL}' '${SOCKETENGINE_WS_URL}' '${SOCKETENGINE_HTTP_URL}' '${GOOGLE_CLIENT_ID}' '${MICROSOFT_CLIENT_ID}' '${SERVER_NAME}' '${FRONTEND_URL}' '${APP_USER}'"
    echo ""
    read -p "Press Enter after completing manual steps..."
fi

rm -f "$REMOTE_DEPLOY_SCRIPT"

log_success "Frontend deployment completed!"
log_info "Frontend is accessible at: http://${SERVER_NAME}"
