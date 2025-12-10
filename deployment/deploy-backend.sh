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

# Function to prompt for input with default value
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

# Function to prompt for password (hidden input)
prompt_password() {
    local prompt_text="$1"
    local var_name="$2"
    
    log_prompt "${prompt_text}: "
    read -rs input
    echo
    eval "$var_name=\"$input\""
}

# Function to prompt for yes/no
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
log_info "MoneyTree Backend Deployment"
log_info "=========================================="
echo ""

# Collect SSH connection details
log_info "SSH Connection Details"
log_info "---------------------"
prompt_with_default "SSH Username" "$USER" SSH_USER
prompt_with_default "Server Hostname" "backend.tailce422e.ts.net" SERVER_HOST
prompt_password "SSH Password" SSH_PASSWORD

echo ""
log_info "Backend Configuration"
log_info "---------------------"

# Database configuration
prompt_with_default "PostgreSQL Host" "postgres.tailce422e.ts.net" DB_HOST
prompt_with_default "PostgreSQL Port" "5432" DB_PORT
prompt_with_default "Database Name" "MoneyTree" DB_NAME
prompt_with_default "Database Username" "postgres" DB_USERNAME
prompt_password "Database Password" DB_PASSWORD

# Redis configuration
prompt_with_default "Redis Host" "redis.tailce422e.ts.net" REDIS_HOST
prompt_with_default "Redis Port" "6379" REDIS_PORT

# Kite API configuration
echo ""
log_info "Kite API Configuration"
log_info "----------------------"
prompt_with_default "Kite API Key" "" KITE_API_KEY
prompt_password "Kite API Secret" KITE_API_SECRET
prompt_password "Kite Access Token" KITE_ACCESS_TOKEN
prompt_with_default "Kite Base URL" "https://api.kite.trade" KITE_BASE_URL

# Application settings
echo ""
log_info "Application Settings"
log_info "-------------------"
prompt_with_default "Application Port" "8080" APP_PORT
prompt_with_default "Application User" "moneytree-backend" APP_USER

# Verify artifact exists
JAR_FILE="${ARTIFACTS_DIR}/moneytree-backend.jar"
if [[ ! -f "$JAR_FILE" ]]; then
    log_error "Backend JAR file not found: ${JAR_FILE}"
    log_info "Please run ./prepare-artifacts.sh first to build artifacts"
    exit 1
fi

log_success "Found artifact: ${JAR_FILE}"

# Create environment file content
ENV_CONTENT=$(cat <<EOF
# Backend Environment Variables
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
KITE_API_KEY=${KITE_API_KEY}
KITE_API_SECRET=${KITE_API_SECRET}
KITE_ACCESS_TOKEN=${KITE_ACCESS_TOKEN}
KITE_BASE_URL=${KITE_BASE_URL}
EOF
)

# Create temporary remote deploy script
REMOTE_DEPLOY_SCRIPT=$(mktemp)
cat > "$REMOTE_DEPLOY_SCRIPT" <<'REMOTE_SCRIPT'
#!/bin/bash
set -euo pipefail

COMPONENT="backend"
JAR_FILE="$1"
ENV_CONTENT="$2"
APP_USER="$3"
APP_PORT="$4"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Starting remote deployment for ${COMPONENT}..."

# Install Java 21 if not present
if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | grep -q "21"; then
    log_info "Installing Java 21..."
    apt-get update -qq
    apt-get install -y -qq openjdk-21-jdk > /dev/null 2>&1
fi

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    log_info "Creating user: ${APP_USER}..."
    useradd -m -s /bin/bash "$APP_USER"
fi

# Setup application directory
APP_DIR="/home/${APP_USER}/app"
mkdir -p "${APP_DIR}/jar" "${APP_DIR}/logs" "${APP_DIR}/backup"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# Detect if this is an update or fresh install
SERVICE_NAME="moneytree-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
IS_UPDATE=false
PREVIOUS_JAR=""

if systemctl list-unit-files | grep -q "^${SERVICE_NAME}.service" && [[ -f "${APP_DIR}/app.jar" ]]; then
    IS_UPDATE=true
    PREVIOUS_JAR=$(readlink -f "${APP_DIR}/app.jar" 2>/dev/null || echo "")
    log_info "Detected existing installation - performing update..."
else
    log_info "Fresh installation detected..."
fi

# Backup previous version if updating
if [[ "$IS_UPDATE" == true ]] && [[ -n "$PREVIOUS_JAR" ]] && [[ -f "$PREVIOUS_JAR" ]]; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_JAR="${APP_DIR}/backup/app_${BACKUP_TIMESTAMP}.jar"
    cp "$PREVIOUS_JAR" "$BACKUP_JAR"
    chown "${APP_USER}:${APP_USER}" "$BACKUP_JAR"
    log_info "Backed up previous version to: $(basename $BACKUP_JAR)"
fi

# Gracefully stop service if running
if [[ "$IS_UPDATE" == true ]]; then
    if systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
        log_info "Stopping service gracefully..."
        systemctl stop "${SERVICE_NAME}" || true
        # Wait for graceful shutdown (max 30 seconds)
        for i in {1..30}; do
            if ! systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
                break
            fi
            sleep 1
        done
        log_info "Service stopped"
    fi
fi

# Deploy JAR file with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
JAR_BASENAME=$(basename "$JAR_FILE" .jar)
JAR_FILENAME="${JAR_BASENAME}_${TIMESTAMP}.jar"
cp "$JAR_FILE" "${APP_DIR}/jar/${JAR_FILENAME}"
ln -sf "${APP_DIR}/jar/${JAR_FILENAME}" "${APP_DIR}/app.jar"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/jar/${JAR_FILENAME}" "${APP_DIR}/app.jar"
log_info "Deployed new JAR: ${JAR_FILENAME}"

# Create environment file
echo "$ENV_CONTENT" > "${APP_DIR}/.env"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"

# Create/update systemd service
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=MoneyTree Backend Service
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production ${APP_DIR}/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Configure firewall
if command -v ufw >/dev/null 2>&1; then
    ufw allow ${APP_PORT}/tcp > /dev/null 2>&1 || true
fi

# Clean up old JAR files (keep last 5 versions)
if [[ -d "${APP_DIR}/jar" ]]; then
    OLD_JARS=$(ls -t "${APP_DIR}/jar"/*.jar 2>/dev/null | tail -n +6)
    if [[ -n "$OLD_JARS" ]]; then
        log_info "Cleaning up old JAR files (keeping last 5 versions)..."
        echo "$OLD_JARS" | xargs rm -f 2>/dev/null || true
    fi
fi

# Clean up old backups (keep last 3 backups)
if [[ -d "${APP_DIR}/backup" ]]; then
    OLD_BACKUPS=$(ls -t "${APP_DIR}/backup"/*.jar 2>/dev/null | tail -n +4)
    if [[ -n "$OLD_BACKUPS" ]]; then
        log_info "Cleaning up old backups (keeping last 3)..."
        echo "$OLD_BACKUPS" | xargs rm -f 2>/dev/null || true
    fi
fi

# Enable and start service
systemctl daemon-reload
systemctl enable "${SERVICE_NAME}" > /dev/null 2>&1
log_info "Starting service..."
systemctl start "${SERVICE_NAME}"

# Wait for service to start
sleep 3

# Health check
HEALTH_CHECK_FAILED=false
if systemctl is-active --quiet "${SERVICE_NAME}"; then
    log_info "Service is running, performing health check..."
    # Try health endpoint up to 3 times with 5 second intervals
    for i in {1..3}; do
        if curl -sf "http://localhost:${APP_PORT}/actuator/health" > /dev/null 2>&1; then
            log_success "Service ${SERVICE_NAME} started successfully and health check passed"
            HEALTH_CHECK_FAILED=false
            break
        else
            HEALTH_CHECK_FAILED=true
            if [[ $i -lt 3 ]]; then
                log_info "Health check attempt $i failed, retrying..."
                sleep 5
            fi
        fi
    done
    
    if [[ "$HEALTH_CHECK_FAILED" == true ]]; then
        log_error "Service started but health check failed"
        log_error "Previous version backed up at: ${APP_DIR}/backup/"
        log_error "To rollback, run: sudo systemctl stop ${SERVICE_NAME} && sudo ln -sf ${BACKUP_JAR} ${APP_DIR}/app.jar && sudo systemctl start ${SERVICE_NAME}"
        log_error "Check logs: journalctl -u ${SERVICE_NAME} -n 50"
        exit 1
    fi
else
    log_error "Service ${SERVICE_NAME} failed to start"
    if [[ -n "$BACKUP_JAR" ]] && [[ -f "$BACKUP_JAR" ]]; then
        log_error "Previous version backed up at: ${BACKUP_JAR}"
        log_error "To rollback, run: sudo ln -sf ${BACKUP_JAR} ${APP_DIR}/app.jar && sudo systemctl start ${SERVICE_NAME}"
    fi
    log_error "Check logs: journalctl -u ${SERVICE_NAME} -n 50"
    exit 1
fi
REMOTE_SCRIPT

chmod +x "$REMOTE_DEPLOY_SCRIPT"

# Copy files to server using sshpass if available, otherwise use expect or manual scp
log_info "Copying files to server..."

if command -v sshpass >/dev/null 2>&1; then
    # Use sshpass for password authentication
    export SSHPASS="$SSH_PASSWORD"
    
    log_info "Copying JAR file..."
    sshpass -e scp -o StrictHostKeyChecking=no "$JAR_FILE" "${SSH_USER}@${SERVER_HOST}:/tmp/moneytree-backend.jar"
    
    log_info "Copying remote deploy script..."
    sshpass -e scp -o StrictHostKeyChecking=no "$REMOTE_DEPLOY_SCRIPT" "${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    
    log_info "Executing remote deployment..."
    sshpass -e ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_HOST}" \
        "chmod +x /tmp/remote-deploy.sh && sudo /tmp/remote-deploy.sh /tmp/moneytree-backend.jar '${ENV_CONTENT}' '${APP_USER}' '${APP_PORT}'"
    
    unset SSHPASS
else
    log_warn "sshpass not found. You'll need to copy files manually:"
    echo ""
    echo "1. Copy JAR file:"
    echo "   scp ${JAR_FILE} ${SSH_USER}@${SERVER_HOST}:/tmp/moneytree-backend.jar"
    echo ""
    echo "2. Copy deploy script:"
    echo "   scp ${REMOTE_DEPLOY_SCRIPT} ${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    echo ""
    echo "3. SSH and run:"
    echo "   ssh ${SSH_USER}@${SERVER_HOST}"
    echo "   chmod +x /tmp/remote-deploy.sh"
    echo "   sudo /tmp/remote-deploy.sh /tmp/moneytree-backend.jar '${ENV_CONTENT}' '${APP_USER}' '${APP_PORT}'"
    echo ""
    read -p "Press Enter after completing manual steps..."
fi

# Cleanup
rm -f "$REMOTE_DEPLOY_SCRIPT"

log_success "Backend deployment completed!"
log_info "Service is running on ${SERVER_HOST}:${APP_PORT}"
log_info "Health check: curl http://${SERVER_HOST}:${APP_PORT}/actuator/health"
