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

# Logging functions
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
else
    log_warn ".env file not found: ${ENV_FILE}"
    log_warn "SSH credentials and API keys will be prompted"
fi

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

log_info "=========================================="
log_info "MoneyTree SocketEngine Deployment"
log_info "=========================================="
echo ""
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
    log_warn "SSH credentials and API keys will be prompted"
fi
echo ""

# Collect SSH connection details
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    log_info "SSH Connection Details"
    log_info "---------------------"
    prompt_with_default "SSH Username" "${SSH_USER:-$USER}" SSH_USER
    prompt_with_default "Server Hostname" "${SOCKETENGINE_HOST:-socketengine.tailce422e.ts.net}" SERVER_HOST
    if [[ -z "${SSH_PASSWORD:-}" ]]; then
        prompt_password "SSH Password" SSH_PASSWORD
    else
        log_info "SSH Password loaded from .env file"
    fi
else
    SSH_USER="${SSH_USER:-$USER}"
    SERVER_HOST="${SOCKETENGINE_HOST:-socketengine.tailce422e.ts.net}"
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
log_info "Database Configuration"
log_info "---------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "PostgreSQL Host" "${DB_HOST:-postgres.tailce422e.ts.net}" DB_HOST
    prompt_with_default "PostgreSQL Port" "${DB_PORT:-5432}" DB_PORT
    prompt_with_default "Database Name" "${DB_NAME:-MoneyTree}" DB_NAME
    prompt_with_default "Database Username" "${DB_USERNAME:-postgres}" DB_USERNAME
    prompt_password "Database Password" DB_PASSWORD
else
    DB_HOST="${DB_HOST:-postgres.tailce422e.ts.net}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-MoneyTree}"
    DB_USERNAME="${DB_USERNAME:-postgres}"
    if [[ -z "${DB_PASSWORD:-}" ]]; then
        log_error "DB_PASSWORD not found in .env file. Cannot use --accept-defaults without DB_PASSWORD in .env"
        exit 1
    fi
fi

echo ""
log_info "Redis Configuration"
log_info "------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Redis Host" "${REDIS_HOST:-redis.tailce422e.ts.net}" REDIS_HOST
    prompt_with_default "Redis Port" "${REDIS_PORT:-6379}" REDIS_PORT
    prompt_password "Redis Password (leave empty if none)" REDIS_PASSWORD
else
    REDIS_HOST="${REDIS_HOST:-redis.tailce422e.ts.net}"
    REDIS_PORT="${REDIS_PORT:-6379}"
    REDIS_PASSWORD="${REDIS_PASSWORD:-}"
fi

echo ""
log_info "Kite API Configuration"
log_info "----------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    if [[ -z "${KITE_API_KEY:-}" ]]; then
        prompt_with_default "Kite API Key" "" KITE_API_KEY
    else
        log_info "Kite API Key loaded from .env file"
        prompt_with_default "Kite API Key" "${KITE_API_KEY}" KITE_API_KEY
    fi
    if [[ -z "${KITE_API_SECRET:-}" ]]; then
        prompt_password "Kite API Secret" KITE_API_SECRET
    else
        log_info "Kite API Secret loaded from .env file"
    fi
    if [[ -z "${KITE_ACCESS_TOKEN:-}" ]]; then
        prompt_password "Kite Access Token" KITE_ACCESS_TOKEN
    else
        log_info "Kite Access Token loaded from .env file"
        # Still prompt to allow override if needed
        log_prompt "Kite Access Token [press Enter to use from .env]: "
        read -rs input
        echo
        if [[ -n "$input" ]]; then
            KITE_ACCESS_TOKEN="$input"
        fi
    fi
    if [[ -z "${KITE_WEBSOCKET_URL:-}" ]]; then
        prompt_with_default "Kite WebSocket URL" "${KITE_WEBSOCKET_URL:-wss://ws.kite.trade}" KITE_WEBSOCKET_URL
    else
        log_info "Kite WebSocket URL loaded from .env file"
        prompt_with_default "Kite WebSocket URL" "${KITE_WEBSOCKET_URL}" KITE_WEBSOCKET_URL
    fi
else
    if [[ -z "${KITE_API_KEY:-}" ]]; then
        log_error "KITE_API_KEY not found in .env file. Cannot use --accept-defaults without KITE_API_KEY in .env"
        exit 1
    fi
    if [[ -z "${KITE_API_SECRET:-}" ]]; then
        log_error "KITE_API_SECRET not found in .env file. Cannot use --accept-defaults without KITE_API_SECRET in .env"
        exit 1
    fi
    if [[ -z "${KITE_ACCESS_TOKEN:-}" ]]; then
        log_error "KITE_ACCESS_TOKEN not found in .env file. Cannot use --accept-defaults without KITE_ACCESS_TOKEN in .env"
        exit 1
    fi
    KITE_WEBSOCKET_URL="${KITE_WEBSOCKET_URL:-wss://ws.kite.trade}"
    log_info "Using Kite API credentials from .env file (KITE_API_KEY, KITE_API_SECRET, KITE_ACCESS_TOKEN, KITE_WEBSOCKET_URL)"
fi

echo ""
log_info "WebSocket Configuration"
log_info "-----------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "WebSocket Allowed Origins" "${WEBSOCKET_ALLOWED_ORIGINS:-https://moneytree.tailce422e.ts.net}" WEBSOCKET_ALLOWED_ORIGINS
    prompt_with_default "CORS Allowed Origins" "${CORS_ALLOWED_ORIGINS:-https://moneytree.tailce422e.ts.net}" CORS_ALLOWED_ORIGINS
    prompt_with_default "Max WebSocket Sessions" "${WEBSOCKET_MAX_SESSIONS:-1000}" WEBSOCKET_MAX_SESSIONS
    prompt_with_default "Max Message Size" "${WEBSOCKET_MAX_MESSAGE_SIZE:-65536}" WEBSOCKET_MAX_MESSAGE_SIZE
else
    WEBSOCKET_ALLOWED_ORIGINS="${WEBSOCKET_ALLOWED_ORIGINS:-https://moneytree.tailce422e.ts.net}"
    CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-https://moneytree.tailce422e.ts.net}"
    WEBSOCKET_MAX_SESSIONS="${WEBSOCKET_MAX_SESSIONS:-1000}"
    WEBSOCKET_MAX_MESSAGE_SIZE="${WEBSOCKET_MAX_MESSAGE_SIZE:-65536}"
fi

echo ""
log_info "Persistence Configuration"
log_info "-----------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Batch Size" "${PERSISTENCE_BATCH_SIZE:-1000}" PERSISTENCE_BATCH_SIZE
    prompt_with_default "Max Buffer Size" "${PERSISTENCE_MAX_BUFFER_SIZE:-100000}" PERSISTENCE_MAX_BUFFER_SIZE
    prompt_with_default "Batch Interval (minutes)" "${PERSISTENCE_BATCH_INTERVAL_MINUTES:-15}" PERSISTENCE_BATCH_INTERVAL_MINUTES
else
    PERSISTENCE_BATCH_SIZE="${PERSISTENCE_BATCH_SIZE:-1000}"
    PERSISTENCE_MAX_BUFFER_SIZE="${PERSISTENCE_MAX_BUFFER_SIZE:-100000}"
    PERSISTENCE_BATCH_INTERVAL_MINUTES="${PERSISTENCE_BATCH_INTERVAL_MINUTES:-15}"
fi

echo ""
log_info "Application Settings"
log_info "-------------------"
if [[ "$ACCEPT_DEFAULTS" == false ]]; then
    prompt_with_default "Application Port" "${SOCKETENGINE_PORT:-8081}" APP_PORT
    prompt_with_default "Application User" "${SOCKETENGINE_USER:-moneytree-socketengine}" APP_USER
else
    APP_PORT="${SOCKETENGINE_PORT:-8081}"
    APP_USER="${SOCKETENGINE_USER:-moneytree-socketengine}"
fi

# Verify artifact exists
JAR_FILE="${ARTIFACTS_DIR}/socketengine.jar"
if [[ ! -f "$JAR_FILE" ]]; then
    log_error "SocketEngine JAR file not found: ${JAR_FILE}"
    log_info "Please run ./prepare-artifacts.sh first to build artifacts"
    exit 1
fi

log_success "Found artifact: ${JAR_FILE}"

# Validate artifact JAR has Main-Class before deploying
log_info "Validating artifact JAR..."
if ! unzip -p "$JAR_FILE" META-INF/MANIFEST.MF 2>/dev/null | grep -q "Main-Class:"; then
    log_error "Artifact JAR does not have Main-Class attribute!"
    log_error "This JAR is not executable. Please rebuild artifacts:"
    log_error "  cd deployment && ./prepare-artifacts.sh"
    log_error "JAR file: $JAR_FILE"
    log_error "Manifest contents:"
    unzip -p "$JAR_FILE" META-INF/MANIFEST.MF 2>/dev/null | head -10 || true
    exit 1
fi
log_info "Artifact JAR validated: Main-Class attribute found"

# Create environment file content
ENV_CONTENT=$(cat <<EOF
# SocketEngine Environment Variables
DATABASE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
DATABASE_USERNAME=${DB_USERNAME}
DATABASE_PASSWORD=${DB_PASSWORD}
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
KITE_WEBSOCKET_URL=${KITE_WEBSOCKET_URL}
KITE_API_KEY=${KITE_API_KEY}
KITE_API_SECRET=${KITE_API_SECRET}
KITE_ACCESS_TOKEN=${KITE_ACCESS_TOKEN}
WEBSOCKET_ALLOWED_ORIGINS=${WEBSOCKET_ALLOWED_ORIGINS}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
PERSISTENCE_BATCH_SIZE=${PERSISTENCE_BATCH_SIZE}
PERSISTENCE_MAX_BUFFER_SIZE=${PERSISTENCE_MAX_BUFFER_SIZE}
PERSISTENCE_BATCH_INTERVAL_MINUTES=${PERSISTENCE_BATCH_INTERVAL_MINUTES}
WEBSOCKET_MAX_SESSIONS=${WEBSOCKET_MAX_SESSIONS}
WEBSOCKET_MAX_MESSAGE_SIZE=${WEBSOCKET_MAX_MESSAGE_SIZE}
EOF
)

# Create temporary remote deploy script
REMOTE_DEPLOY_SCRIPT=$(mktemp)
cat > "$REMOTE_DEPLOY_SCRIPT" <<'REMOTE_SCRIPT'
#!/bin/bash
set -euo pipefail

COMPONENT="socketengine"
JAR_FILE="$1"
ENV_CONTENT="$2"
APP_USER="$3"
APP_PORT="$4"
SUDO_PASSWORD="${5:-}"

# Function to run sudo commands
run_sudo() {
    if [[ -n "$SUDO_PASSWORD" ]]; then
        echo "$SUDO_PASSWORD" | sudo -S "$@"
    else
        sudo "$@"
    fi
}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

log_info "Starting remote deployment for ${COMPONENT}..."

# Install Java 21 if not present
if ! command -v java >/dev/null 2>&1 || ! java -version 2>&1 | grep -q "21"; then
    log_info "Installing Java 21..."
    run_sudo apt-get update -qq
    run_sudo apt-get install -y -qq openjdk-21-jdk > /dev/null 2>&1
    # Verify Java installation
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -1)
        log_info "Java installed: $JAVA_VERSION"
    else
        log_error "Java installation failed!"
        exit 1
    fi
fi

# Verify Java path
JAVA_PATH=$(which java 2>/dev/null || echo "/usr/bin/java")
log_info "Using Java at: $JAVA_PATH"

# Create application user if not exists
if ! id "$APP_USER" &>/dev/null; then
    log_info "Creating user: ${APP_USER}..."
    run_sudo useradd -m -s /bin/bash "$APP_USER"
fi

# Setup application directory
APP_DIR="/home/${APP_USER}/app"
run_sudo mkdir -p "${APP_DIR}/jar" "${APP_DIR}/logs" "${APP_DIR}/backup"
run_sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

# Detect if this is an update or fresh install
SERVICE_NAME="moneytree-socketengine"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
IS_UPDATE=false
PREVIOUS_JAR=""
BACKUP_JAR=""

if run_sudo systemctl list-unit-files | grep -q "^${SERVICE_NAME}.service" && (run_sudo test -f "${APP_DIR}/app.jar" || run_sudo test -L "${APP_DIR}/app.jar"); then
    IS_UPDATE=true
    PREVIOUS_JAR=$(run_sudo readlink -f "${APP_DIR}/app.jar" 2>/dev/null || echo "")
    log_info "Detected existing installation - performing update..."
else
    log_info "Fresh installation detected..."
fi

# Backup previous version if updating
if [[ "$IS_UPDATE" == true ]] && [[ -n "$PREVIOUS_JAR" ]] && [[ -f "$PREVIOUS_JAR" ]]; then
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_JAR="${APP_DIR}/backup/app_${BACKUP_TIMESTAMP}.jar"
    # Copy to temp first, then move with sudo
    TEMP_BACKUP="/tmp/backup_${BACKUP_TIMESTAMP}.jar"
    cp "$PREVIOUS_JAR" "$TEMP_BACKUP"
    run_sudo mv "$TEMP_BACKUP" "$BACKUP_JAR"
    run_sudo chown "${APP_USER}:${APP_USER}" "$BACKUP_JAR"
    log_info "Backed up previous version to: $(basename $BACKUP_JAR)"
fi

# Gracefully stop service if running
if [[ "$IS_UPDATE" == true ]]; then
    if run_sudo systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
        log_info "Stopping service gracefully..."
        run_sudo systemctl stop "${SERVICE_NAME}" || true
        # Wait for graceful shutdown (max 30 seconds)
        for i in {1..30}; do
            if ! run_sudo systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
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
# Ensure jar directory exists
run_sudo mkdir -p "${APP_DIR}/jar"
run_sudo chown "${APP_USER}:${APP_USER}" "${APP_DIR}/jar"
# Copy to temp first, then move with sudo
TEMP_JAR="/tmp/${JAR_FILENAME}"
cp "$JAR_FILE" "$TEMP_JAR"
# Verify temp file was created
if [[ ! -f "$TEMP_JAR" ]]; then
    log_error "Failed to copy JAR to temp location: $TEMP_JAR"
    exit 1
fi
log_info "Moving JAR from temp to ${APP_DIR}/jar/${JAR_FILENAME}..."
if run_sudo mv "$TEMP_JAR" "${APP_DIR}/jar/${JAR_FILENAME}"; then
    run_sudo chown "${APP_USER}:${APP_USER}" "${APP_DIR}/jar/${JAR_FILENAME}"
    # Verify JAR was moved successfully (check with sudo since file was created with sudo)
    if run_sudo test -f "${APP_DIR}/jar/${JAR_FILENAME}"; then
        log_info "JAR file deployed successfully: ${APP_DIR}/jar/${JAR_FILENAME}"
    else
        log_error "JAR file verification failed after move"
        log_error "Checking directory contents..."
        run_sudo ls -la "${APP_DIR}/jar/" || true
        exit 1
    fi
else
    log_error "Failed to move JAR file from $TEMP_JAR to ${APP_DIR}/jar/${JAR_FILENAME}"
    log_error "Checking directory permissions..."
    run_sudo ls -ld "${APP_DIR}/jar" || true
    run_sudo ls -la "${APP_DIR}/jar/" || true
    if [[ -f "$TEMP_JAR" ]]; then
        log_error "Temp file still exists: $TEMP_JAR"
        run_sudo ls -lh "$TEMP_JAR" || true
    fi
    exit 1
fi
# Create symlink
run_sudo ln -sf "${APP_DIR}/jar/${JAR_FILENAME}" "${APP_DIR}/app.jar"
run_sudo chown -h "${APP_USER}:${APP_USER}" "${APP_DIR}/app.jar"
# Verify symlink was created and points to valid file (use sudo for checks)
if ! run_sudo test -L "${APP_DIR}/app.jar" && ! run_sudo test -f "${APP_DIR}/app.jar"; then
    log_error "Failed to create symlink: ${APP_DIR}/app.jar"
    exit 1
fi
SYMLINK_TARGET=$(run_sudo readlink -f "${APP_DIR}/app.jar" 2>/dev/null || echo "")
if [[ -n "$SYMLINK_TARGET" ]] && run_sudo test -f "$SYMLINK_TARGET"; then
    log_info "Deployed new JAR: ${JAR_FILENAME}"
    log_info "Symlink verified: ${APP_DIR}/app.jar -> $SYMLINK_TARGET"
else
    log_error "Symlink target is invalid: $SYMLINK_TARGET"
    log_error "Checking symlink..."
    run_sudo ls -la "${APP_DIR}/app.jar" || true
    exit 1
fi

# Create environment file
# Write to temp first, then move with sudo
TEMP_ENV="/tmp/moneytree_env_$$"
echo "$ENV_CONTENT" > "$TEMP_ENV"
run_sudo mv "$TEMP_ENV" "${APP_DIR}/.env"
run_sudo chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
run_sudo chmod 600 "${APP_DIR}/.env"

# Create/update systemd service
# Write to temp file first, then move with sudo
TEMP_SERVICE="/tmp/${SERVICE_NAME}_service_$$"
# Find Java path
JAVA_PATH=$(which java 2>/dev/null || echo "/usr/bin/java")
cat > "$TEMP_SERVICE" <<EOF
[Unit]
Description=MoneyTree SocketEngine Service
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=${JAVA_PATH} -jar -Dspring.profiles.active=production ${APP_DIR}/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
run_sudo mv "$TEMP_SERVICE" "$SERVICE_FILE"
run_sudo chmod 644 "$SERVICE_FILE"
log_info "Service file created at: $SERVICE_FILE"

# Configure firewall
if command -v ufw >/dev/null 2>&1; then
    run_sudo ufw allow ${APP_PORT}/tcp > /dev/null 2>&1 || true
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

# Verify prerequisites before starting service
log_info "Verifying prerequisites..."
# Check if app.jar exists (as symlink or file) and points to valid file (use sudo for checks)
if run_sudo test -L "${APP_DIR}/app.jar"; then
    SYMLINK_TARGET=$(run_sudo readlink -f "${APP_DIR}/app.jar" 2>/dev/null || echo "")
    if [[ -z "$SYMLINK_TARGET" ]] || ! run_sudo test -f "$SYMLINK_TARGET"; then
        log_error "Symlink ${APP_DIR}/app.jar points to invalid file: $SYMLINK_TARGET"
        # Try to fix by finding latest JAR
        LATEST_JAR=$(run_sudo ls -t "${APP_DIR}/jar"/*.jar 2>/dev/null | head -1 || echo "")
        if [[ -n "$LATEST_JAR" ]] && run_sudo test -f "$LATEST_JAR"; then
            log_info "Fixing symlink to point to: $(basename $LATEST_JAR)"
            run_sudo ln -sf "$LATEST_JAR" "${APP_DIR}/app.jar"
            run_sudo chown -h "${APP_USER}:${APP_USER}" "${APP_DIR}/app.jar"
        else
            log_error "No valid JAR files found in ${APP_DIR}/jar/"
            exit 1
        fi
    else
        log_info "JAR file verified: ${APP_DIR}/app.jar -> $SYMLINK_TARGET"
    fi
elif run_sudo test -f "${APP_DIR}/app.jar"; then
    log_info "JAR file verified: ${APP_DIR}/app.jar"
else
    log_error "JAR file not found: ${APP_DIR}/app.jar"
    # Check if any JAR exists in jar directory
    LATEST_JAR=$(run_sudo ls -t "${APP_DIR}/jar"/*.jar 2>/dev/null | head -1 || echo "")
    if [[ -n "$LATEST_JAR" ]] && run_sudo test -f "$LATEST_JAR"; then
        log_info "Creating symlink to latest JAR: $(basename $LATEST_JAR)"
        run_sudo ln -sf "$LATEST_JAR" "${APP_DIR}/app.jar"
        run_sudo chown -h "${APP_USER}:${APP_USER}" "${APP_DIR}/app.jar"
    else
        log_error "No JAR files found in ${APP_DIR}/jar/"
        exit 1
    fi
fi
# Verify JAR has Main-Class attribute (executable JAR)
JAR_TO_CHECK="${APP_DIR}/app.jar"
if run_sudo test -L "$JAR_TO_CHECK"; then
    JAR_TO_CHECK=$(run_sudo readlink -f "$JAR_TO_CHECK" 2>/dev/null || echo "$JAR_TO_CHECK")
fi
# Extract manifest to temp file to avoid pipe issues with run_sudo
TEMP_MANIFEST="/tmp/manifest_check_$$"
if run_sudo unzip -p "$JAR_TO_CHECK" META-INF/MANIFEST.MF > "$TEMP_MANIFEST" 2>/dev/null; then
    if grep -q "Main-Class:" "$TEMP_MANIFEST" 2>/dev/null; then
        log_info "JAR manifest verified: Main-Class attribute found"
        rm -f "$TEMP_MANIFEST"
    else
        log_error "JAR file does not have Main-Class attribute in manifest!"
        log_error "This JAR is not executable. Please rebuild with Spring Boot Maven plugin configured correctly."
        log_error "JAR file: $JAR_TO_CHECK"
        log_error "Manifest contents:"
        cat "$TEMP_MANIFEST" 2>/dev/null || true
        rm -f "$TEMP_MANIFEST"
        exit 1
    fi
else
    log_warn "Could not extract manifest from JAR (unzip may not be available)"
    log_warn "Skipping manifest validation - assuming JAR is valid"
    rm -f "$TEMP_MANIFEST"
fi
if ! run_sudo test -f "${APP_DIR}/.env"; then
    log_error "Environment file not found: ${APP_DIR}/.env"
    exit 1
fi
if ! command -v java >/dev/null 2>&1; then
    log_error "Java not found in PATH"
    exit 1
fi
log_info "All prerequisites verified"

# Enable and start service
log_info "Reloading systemd daemon..."
run_sudo systemctl daemon-reload

log_info "Enabling service..."
run_sudo systemctl enable "${SERVICE_NAME}" > /dev/null 2>&1

# Validate service file before starting
log_info "Validating service file..."
if run_sudo systemd-analyze verify "${SERVICE_NAME}.service" >/dev/null 2>&1; then
    log_info "Service file is valid"
else
    log_warn "Service file validation warnings (may still work):"
    run_sudo systemd-analyze verify "${SERVICE_NAME}.service" 2>&1 || true
fi

log_info "Starting service..."
# If service is already running, restart it to pick up new JAR
if run_sudo systemctl is-active --quiet "${SERVICE_NAME}" 2>/dev/null; then
    log_info "Service is already running, restarting to pick up new JAR..."
    run_sudo systemctl restart "${SERVICE_NAME}" || {
        log_error "Failed to restart service"
        run_sudo systemctl status "${SERVICE_NAME}" --no-pager -l | head -20 || true
        exit 1
    }
    log_info "Service restarted successfully"
elif run_sudo systemctl start "${SERVICE_NAME}"; then
    log_info "Service start command executed"
else
    log_error "Failed to execute systemctl start command"
    run_sudo systemctl status "${SERVICE_NAME}" --no-pager -l | head -20 || true
    exit 1
fi

# Wait for service to start
sleep 3

# Health check
HEALTH_CHECK_FAILED=false
if run_sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
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
        log_error "Checking service status and logs..."
        run_sudo systemctl status ${SERVICE_NAME} --no-pager -l | head -20 || true
        log_error ""
        log_error "Recent logs:"
        run_sudo journalctl -u ${SERVICE_NAME} -n 30 --no-pager || true
        if [[ -n "${BACKUP_JAR:-}" ]] && [[ -f "${BACKUP_JAR}" ]]; then
            log_error ""
            log_error "To rollback, run: sudo systemctl stop ${SERVICE_NAME} && sudo ln -sf ${BACKUP_JAR} ${APP_DIR}/app.jar && sudo systemctl start ${SERVICE_NAME}"
        fi
        exit 1
    fi
else
    log_error "Service ${SERVICE_NAME} failed to start"
    log_error "Checking service status..."
    run_sudo systemctl status ${SERVICE_NAME} --no-pager -l | head -20 || true
    log_error ""
    log_error "Recent logs:"
    run_sudo journalctl -u ${SERVICE_NAME} -n 30 --no-pager || true
    log_error ""
    if [[ -n "${BACKUP_JAR:-}" ]] && [[ -f "${BACKUP_JAR}" ]]; then
        log_error "Previous version backed up at: ${BACKUP_JAR}"
        log_error "To rollback, run: sudo ln -sf ${BACKUP_JAR} ${APP_DIR}/app.jar && sudo systemctl start ${SERVICE_NAME}"
    fi
    log_error ""
    log_error "Common issues:"
    log_error "  1. Check if Java is installed: java -version"
    log_error "  2. Check if JAR file exists: ls -lh ${APP_DIR}/app.jar"
    log_error "  3. Check if .env file exists: ls -lh ${APP_DIR}/.env"
    log_error "  4. Check service file: cat ${SERVICE_FILE}"
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
    
    log_info "Copying JAR file..."
    sshpass -e scp -o StrictHostKeyChecking=no "$JAR_FILE" "${SSH_USER}@${SERVER_HOST}:/tmp/socketengine.jar"
    
    log_info "Copying remote deploy script..."
    sshpass -e scp -o StrictHostKeyChecking=no "$REMOTE_DEPLOY_SCRIPT" "${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    
    log_info "Executing remote deployment..."
    # Use SSH_PASSWORD as SUDO_PASSWORD if SUDO_PASSWORD is not set
    SUDO_PASSWORD="${SUDO_PASSWORD:-$SSH_PASSWORD}"
    sshpass -e ssh -o StrictHostKeyChecking=no "${SSH_USER}@${SERVER_HOST}" \
        "chmod +x /tmp/remote-deploy.sh && /tmp/remote-deploy.sh /tmp/socketengine.jar '${ENV_CONTENT}' '${APP_USER}' '${APP_PORT}' '${SUDO_PASSWORD}'"
    
    unset SSHPASS
else
    log_warn "sshpass not found. Manual steps required:"
    echo ""
    echo "1. scp ${JAR_FILE} ${SSH_USER}@${SERVER_HOST}:/tmp/socketengine.jar"
    echo "2. scp ${REMOTE_DEPLOY_SCRIPT} ${SSH_USER}@${SERVER_HOST}:/tmp/remote-deploy.sh"
    echo "3. ssh ${SSH_USER}@${SERVER_HOST}"
    echo "4. chmod +x /tmp/remote-deploy.sh"
    echo "5. sudo /tmp/remote-deploy.sh /tmp/socketengine.jar '${ENV_CONTENT}' '${APP_USER}' '${APP_PORT}'"
    echo ""
    read -p "Press Enter after completing manual steps..."
fi

rm -f "$REMOTE_DEPLOY_SCRIPT"

log_success "SocketEngine deployment completed!"
log_info "Service is running on ${SERVER_HOST}:${APP_PORT}"
log_info "Health check: curl http://${SERVER_HOST}:${APP_PORT}/actuator/health"
