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
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"

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

# Collect SSH connection details
log_info "SSH Connection Details"
log_info "---------------------"
prompt_with_default "SSH Username" "$USER" SSH_USER
prompt_with_default "Server Hostname" "moneytree.tailce422e.ts.net" SERVER_HOST
prompt_password "SSH Password" SSH_PASSWORD

echo ""
log_info "Backend API Configuration"
log_info "-------------------------"
prompt_with_default "Backend API URL" "https://backend.tailce422e.ts.net:8080/api" BACKEND_API_URL

echo ""
log_info "SocketEngine Configuration"
log_info "-------------------------"
prompt_with_default "SocketEngine API URL" "https://socketengine.tailce422e.ts.net:8081/engines" SOCKETENGINE_API_URL
prompt_with_default "SocketEngine WebSocket URL" "wss://socketengine.tailce422e.ts.net:8081/engines" SOCKETENGINE_WS_URL
prompt_with_default "SocketEngine HTTP URL" "https://socketengine.tailce422e.ts.net:8081/engines" SOCKETENGINE_HTTP_URL

echo ""
log_info "OAuth Configuration"
log_info "------------------"
prompt_with_default "Google Client ID" "" GOOGLE_CLIENT_ID
prompt_with_default "Microsoft Client ID" "" MICROSOFT_CLIENT_ID

echo ""
log_info "Application Settings"
log_info "-------------------"
prompt_with_default "Server Name" "moneytree.tailce422e.ts.net" SERVER_NAME
prompt_with_default "Application User" "moneytree-frontend" APP_USER

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
APP_USER="$9"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Starting frontend deployment..."

# Detect if this is an update or fresh install
WEB_ROOT="/var/www/moneytree"
IS_UPDATE=false
BACKUP_DIR=""

if [[ -d "$WEB_ROOT" ]] && [[ -f "${WEB_ROOT}/index.html" ]]; then
    IS_UPDATE=true
    log_info "Detected existing installation - performing update..."
else
    log_info "Fresh installation detected..."
fi

# Backup previous version if updating
if [[ "$IS_UPDATE" == true ]]; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/var/www/moneytree_backup_${BACKUP_TIMESTAMP}"
    cp -r "$WEB_ROOT" "$BACKUP_DIR" 2>/dev/null || true
    log_info "Backed up previous version to: $(basename $BACKUP_DIR)"
fi

# Install Node.js if not present (for potential future builds)
if ! command -v node >/dev/null 2>&1; then
    log_info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null 2>&1
fi

# Install Nginx if not present
if ! command -v nginx >/dev/null 2>&1; then
    log_info "Installing Nginx..."
    apt-get update -qq
    apt-get install -y -qq nginx > /dev/null 2>&1
fi

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    log_info "Creating user: ${APP_USER}..."
    useradd -m -s /bin/bash "$APP_USER"
fi

# Setup application directory
APP_DIR="/home/${APP_USER}/app"
mkdir -p "${APP_DIR}/dist" "${APP_DIR}/backup"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# Extract and deploy frontend artifact
TEMP_DIR=$(mktemp -d)
unzip -q "$ARTIFACT_FILE" -d "$TEMP_DIR"

# Find dist directory
if [[ -d "$TEMP_DIR/dist" ]]; then
    DIST_SOURCE="$TEMP_DIR/dist"
elif [[ -f "$TEMP_DIR/index.html" ]]; then
    DIST_SOURCE="$TEMP_DIR"
else
    log_error "Could not find dist directory or index.html in artifact"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copy to app directory
rm -rf "${APP_DIR}/dist"
cp -r "$DIST_SOURCE" "${APP_DIR}/dist"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/dist"

# Update environment configuration in built files if needed
# Note: This is a simple approach. For production, you might want to rebuild with proper env vars
if [[ -f "${APP_DIR}/dist/main.js" ]]; then
    # Replace API URLs in the built JavaScript (simple string replacement)
    sed -i "s|http://localhost:8080/api|${BACKEND_API_URL}|g" "${APP_DIR}/dist"/*.js 2>/dev/null || true
    sed -i "s|http://localhost:8081/engines|${SOCKETENGINE_API_URL}|g" "${APP_DIR}/dist"/*.js 2>/dev/null || true
    sed -i "s|ws://localhost:8081/engines|${SOCKETENGINE_WS_URL}|g" "${APP_DIR}/dist"/*.js 2>/dev/null || true
fi

rm -rf "$TEMP_DIR"

# Deploy to web root (atomic operation)
NEW_WEB_ROOT="/var/www/moneytree_new_$$"
mkdir -p "$NEW_WEB_ROOT"
cp -r "${APP_DIR}/dist"/* "$NEW_WEB_ROOT/"
chown -R www-data:www-data "$NEW_WEB_ROOT"

# Test Nginx configuration before switching
NGINX_CONFIG="/etc/nginx/sites-available/moneytree"

cat > "$NGINX_CONFIG" <<EOF
server {
    listen 80;
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

    # Angular routing - serve index.html for all routes
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

# Test configuration
if ! nginx -t > /dev/null 2>&1; then
    log_error "Nginx configuration test failed"
    rm -rf "$NEW_WEB_ROOT"
    exit 1
fi

# Atomic switch: move old to temp, new to web root
if [[ "$IS_UPDATE" == true ]]; then
    OLD_WEB_ROOT="/var/www/moneytree_old_$$"
    mv "$WEB_ROOT" "$OLD_WEB_ROOT" 2>/dev/null || true
fi

mv "$NEW_WEB_ROOT" "$WEB_ROOT"

# Enable site
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/moneytree
rm -f /etc/nginx/sites-enabled/default

# Configure firewall
if command -v ufw >/dev/null 2>&1; then
    ufw allow 80/tcp > /dev/null 2>&1 || true
    ufw allow 443/tcp > /dev/null 2>&1 || true
fi

# Reload Nginx gracefully (reload instead of restart to avoid downtime)
if systemctl is-active --quiet nginx 2>/dev/null; then
    log_info "Reloading Nginx gracefully..."
    systemctl reload nginx || systemctl restart nginx
else
    log_info "Starting Nginx..."
    systemctl enable nginx > /dev/null 2>&1
    systemctl start nginx
fi

# Verify Nginx is running
sleep 2
if systemctl is-active --quiet nginx; then
    log_success "Nginx reloaded successfully"
    
    # Clean up old web root if update succeeded
    if [[ -n "$OLD_WEB_ROOT" ]] && [[ -d "$OLD_WEB_ROOT" ]]; then
        rm -rf "$OLD_WEB_ROOT"
    fi
    
    # Clean up old backups (keep last 3)
    OLD_BACKUPS=$(ls -dt /var/www/moneytree_backup_* 2>/dev/null | tail -n +4)
    if [[ -n "$OLD_BACKUPS" ]]; then
        log_info "Cleaning up old backups (keeping last 3)..."
        echo "$OLD_BACKUPS" | xargs rm -rf 2>/dev/null || true
    fi
else
    log_error "Nginx failed to start/reload"
    # Rollback to previous version
    if [[ -n "$BACKUP_DIR" ]] && [[ -d "$BACKUP_DIR" ]]; then
        log_error "Rolling back to previous version..."
        rm -rf "$WEB_ROOT"
        mv "$BACKUP_DIR" "$WEB_ROOT"
        systemctl reload nginx || systemctl restart nginx
        log_info "Rolled back to previous version"
    fi
    exit 1
fi
REMOTE_SCRIPT

chmod +x "$REMOTE_DEPLOY_SCRIPT"

# Copy files to server
log_info "Copying files to server..."

if command -v sshpass >/dev/null 2>&1; then
    export SSHPASS="$SSH_PASSWORD"
    
    log_info "Copying frontend artifact..."
    sshpass -e scp -o StrictHostKeyChecking=no "$ARTIFACT_FILE" "${SSH_USER}@${SERVER_HOST}:/tmp/frontend-dist.zip"
    
    log_info "Copying remote deploy script..."
    sshpass -e scp -o StrictHostKeyChecking=no "$REMOTE_DEPLOY_SCRIPT" "${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    
    log_info "Executing remote deployment..."
    sshpass -e ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_HOST}" \
        "chmod +x /tmp/remote-deploy.sh && sudo /tmp/remote-deploy.sh /tmp/frontend-dist.zip '${BACKEND_API_URL}' '${SOCKETENGINE_API_URL}' '${SOCKETENGINE_WS_URL}' '${SOCKETENGINE_HTTP_URL}' '${GOOGLE_CLIENT_ID}' '${MICROSOFT_CLIENT_ID}' '${SERVER_NAME}' '${APP_USER}'"
    
    unset SSHPASS
else
    log_warn "sshpass not found. Manual steps required:"
    echo ""
    echo "1. scp ${ARTIFACT_FILE} ${SSH_USER}@${SERVER_HOST}:/tmp/frontend-dist.zip"
    echo "2. scp ${REMOTE_DEPLOY_SCRIPT} ${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    echo "3. ssh ${SSH_USER}@${SERVER_HOST}"
    echo "4. chmod +x /tmp/remote-deploy.sh"
    echo "5. sudo /tmp/remote-deploy.sh /tmp/frontend-dist.zip '${BACKEND_API_URL}' '${SOCKETENGINE_API_URL}' '${SOCKETENGINE_WS_URL}' '${SOCKETENGINE_HTTP_URL}' '${GOOGLE_CLIENT_ID}' '${MICROSOFT_CLIENT_ID}' '${SERVER_NAME}' '${APP_USER}'"
    echo ""
    read -p "Press Enter after completing manual steps..."
fi

rm -f "$REMOTE_DEPLOY_SCRIPT"

log_success "Frontend deployment completed!"
log_info "Frontend is accessible at: http://${SERVER_NAME}"
