#!/bin/bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
COMPONENT=""
JAR_FILE=""
ARTIFACT_FILE=""
ENV_FILE=""
SERVICE_USER=""
APP_DIR=""
SERVICE_NAME=""
PORT=""
SKIP_INSTALL=false
SKIP_SERVICE=false

# Function to print colored output
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

# Function to display usage
usage() {
    cat << EOF
Usage: $0 --component=<component> [OPTIONS]

Deploy MoneyTree application components to Linux VM.

COMPONENTS:
    backend       - Deploy backend Spring Boot application
    socketengine  - Deploy SocketEngine Spring Boot application
    frontend      - Deploy frontend Angular application

OPTIONS:
    --component=<name>     Component to deploy (required)
    --jar=<path>           Path to JAR file (required for backend/socketengine)
    --artifact=<path>      Path to frontend artifact zip file (required for frontend)
    --env-file=<path>      Path to environment variables file (optional)
    --skip-install         Skip prerequisite installation
    --skip-service         Skip systemd service setup
    --help                 Show this help message

EXAMPLES:
    # Deploy backend with JAR file
    sudo $0 --component=backend --jar=./moneytree-backend-0.0.1-SNAPSHOT.jar

    # Deploy socketengine with JAR and env file
    sudo $0 --component=socketengine --jar=./socketengine-0.0.1-SNAPSHOT.jar --env-file=./.env

    # Deploy frontend with artifact zip
    sudo $0 --component=frontend --artifact=./frontend-dist.zip

EOF
    exit 1
}

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --component=*)
            COMPONENT="${arg#*=}"
            ;;
        --jar=*)
            JAR_FILE="${arg#*=}"
            ;;
        --artifact=*)
            ARTIFACT_FILE="${arg#*=}"
            ;;
        --env-file=*)
            ENV_FILE="${arg#*=}"
            ;;
        --skip-install)
            SKIP_INSTALL=true
            ;;
        --skip-service)
            SKIP_SERVICE=true
            ;;
        --help)
            usage
            ;;
        *)
            log_error "Unknown option: $arg"
            usage
            ;;
    esac
done

# Validate component
if [[ -z "$COMPONENT" ]]; then
    log_error "Component is required. Use --component=<name>"
    usage
fi

if [[ ! "$COMPONENT" =~ ^(backend|socketengine|frontend)$ ]]; then
    log_error "Invalid component: $COMPONENT. Must be one of: backend, socketengine, frontend"
    exit 1
fi

# Set component-specific variables
case $COMPONENT in
    backend)
        SERVICE_USER="moneytree-backend"
        APP_DIR="/home/${SERVICE_USER}/app"
        SERVICE_NAME="moneytree-backend"
        PORT="8080"
        if [[ -z "$JAR_FILE" ]]; then
            log_error "JAR file is required for backend. Use --jar=<path>"
            exit 1
        fi
        ;;
    socketengine)
        SERVICE_USER="moneytree-socketengine"
        APP_DIR="/home/${SERVICE_USER}/app"
        SERVICE_NAME="moneytree-socketengine"
        PORT="8081"
        if [[ -z "$JAR_FILE" ]]; then
            log_error "JAR file is required for socketengine. Use --jar=<path>"
            exit 1
        fi
        ;;
    frontend)
        SERVICE_USER="moneytree-frontend"
        APP_DIR="/home/${SERVICE_USER}/app"
        SERVICE_NAME="moneytree-frontend"
        PORT="80"
        if [[ -z "$ARTIFACT_FILE" ]]; then
            log_error "Artifact file is required for frontend. Use --artifact=<path>"
            exit 1
        fi
        ;;
esac

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

log_info "Starting deployment of ${COMPONENT} component..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Java 21
install_java() {
    log_info "Installing Java 21..."
    if command_exists java && java -version 2>&1 | grep -q "21"; then
        log_success "Java 21 is already installed"
        return
    fi
    
    apt-get update -qq
    apt-get install -y -qq openjdk-21-jdk > /dev/null 2>&1
    
    if command_exists java && java -version 2>&1 | grep -q "21"; then
        log_success "Java 21 installed successfully"
    else
        log_error "Failed to install Java 21"
        exit 1
    fi
}

# Function to install Node.js
install_nodejs() {
    log_info "Installing Node.js..."
    if command_exists node && node --version | grep -qE "v(18|19|20|21|22)"; then
        log_success "Node.js is already installed"
        return
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt-get install -y -qq nodejs > /dev/null 2>&1
    
    if command_exists node; then
        log_success "Node.js installed successfully: $(node --version)"
    else
        log_error "Failed to install Node.js"
        exit 1
    fi
}

# Function to install Nginx
install_nginx() {
    log_info "Installing Nginx..."
    if command_exists nginx; then
        log_success "Nginx is already installed"
        return
    fi
    
    apt-get update -qq
    apt-get install -y -qq nginx > /dev/null 2>&1
    
    if command_exists nginx; then
        log_success "Nginx installed successfully"
        systemctl enable nginx > /dev/null 2>&1
    else
        log_error "Failed to install Nginx"
        exit 1
    fi
}

# Function to create application user
create_user() {
    log_info "Creating application user: ${SERVICE_USER}..."
    if id "$SERVICE_USER" &>/dev/null; then
        log_success "User ${SERVICE_USER} already exists"
    else
        useradd -m -s /bin/bash "$SERVICE_USER"
        log_success "User ${SERVICE_USER} created"
    fi
}

# Function to setup application directory
setup_app_dir() {
    log_info "Setting up application directory: ${APP_DIR}..."
    mkdir -p "${APP_DIR}"
    
    # Create subdirectories
    case $COMPONENT in
        backend|socketengine)
            mkdir -p "${APP_DIR}/jar"
            mkdir -p "${APP_DIR}/logs"
            ;;
        frontend)
            mkdir -p "${APP_DIR}/dist"
            ;;
    esac
    
    chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}"
    log_success "Application directory setup complete"
}

# Function to deploy JAR file
deploy_jar() {
    log_info "Deploying JAR file: ${JAR_FILE}..."
    
    if [[ ! -f "$JAR_FILE" ]]; then
        log_error "JAR file not found: ${JAR_FILE}"
        exit 1
    fi
    
    # Get JAR filename
    JAR_FILENAME=$(basename "$JAR_FILE")
    
    # Copy JAR to app directory
    cp "$JAR_FILE" "${APP_DIR}/jar/${JAR_FILENAME}"
    chown "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}/jar/${JAR_FILENAME}"
    
    # Create symlink for easier reference
    ln -sf "${APP_DIR}/jar/${JAR_FILENAME}" "${APP_DIR}/app.jar"
    
    log_success "JAR file deployed: ${APP_DIR}/jar/${JAR_FILENAME}"
}

# Function to deploy frontend artifact
deploy_frontend() {
    log_info "Deploying frontend artifact: ${ARTIFACT_FILE}..."
    
    if [[ ! -f "$ARTIFACT_FILE" ]]; then
        log_error "Artifact file not found: ${ARTIFACT_FILE}"
        exit 1
    fi
    
    # Extract artifact
    TEMP_DIR=$(mktemp -d)
    unzip -q "$ARTIFACT_FILE" -d "$TEMP_DIR"
    
    # Find the dist directory (could be in root or nested)
    if [[ -d "$TEMP_DIR/dist" ]]; then
        DIST_SOURCE="$TEMP_DIR/dist"
    elif [[ -d "$TEMP_DIR" ]] && [[ -f "$TEMP_DIR/index.html" ]]; then
        DIST_SOURCE="$TEMP_DIR"
    else
        log_error "Could not find dist directory or index.html in artifact"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # Copy to app directory
    rm -rf "${APP_DIR}/dist"
    cp -r "$DIST_SOURCE" "${APP_DIR}/dist"
    chown -R "${SERVICE_USER}:${SERVICE_USER}" "${APP_DIR}/dist"
    
    # Deploy to web root
    rm -rf /var/www/moneytree
    mkdir -p /var/www/moneytree
    cp -r "${APP_DIR}/dist"/* /var/www/moneytree/
    chown -R www-data:www-data /var/www/moneytree
    
    rm -rf "$TEMP_DIR"
    
    log_success "Frontend artifact deployed"
}

# Function to setup environment variables
setup_env() {
    log_info "Setting up environment variables..."
    
    ENV_FILE_PATH="${APP_DIR}/.env"
    
    if [[ -n "$ENV_FILE" ]] && [[ -f "$ENV_FILE" ]]; then
        log_info "Copying environment file from ${ENV_FILE}..."
        cp "$ENV_FILE" "$ENV_FILE_PATH"
        chown "${SERVICE_USER}:${SERVICE_USER}" "$ENV_FILE_PATH"
        chmod 600 "$ENV_FILE_PATH"
        log_success "Environment file copied"
    else
        log_warn "No environment file provided. Creating template..."
        
        case $COMPONENT in
            backend)
                cat > "$ENV_FILE_PATH" << EOF
# Backend Environment Variables
DB_USERNAME=postgres
DB_PASSWORD=changeme
KITE_API_KEY=
KITE_API_SECRET=
KITE_ACCESS_TOKEN=
KITE_BASE_URL=https://api.kite.trade
EOF
                ;;
            socketengine)
                cat > "$ENV_FILE_PATH" << EOF
# SocketEngine Environment Variables
DATABASE_URL=jdbc:postgresql://postgres.tailce422e.ts.net:5432/MoneyTree
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=changeme
REDIS_HOST=redis.tailce422e.ts.net
REDIS_PORT=6379
REDIS_PASSWORD=
KITE_WEBSOCKET_URL=wss://ws.kite.trade
KITE_API_KEY=
KITE_API_SECRET=
KITE_ACCESS_TOKEN=
WEBSOCKET_ALLOWED_ORIGINS=https://moneytree.tailce422e.ts.net
CORS_ALLOWED_ORIGINS=https://moneytree.tailce422e.ts.net
EOF
                ;;
        esac
        
        chown "${SERVICE_USER}:${SERVICE_USER}" "$ENV_FILE_PATH"
        chmod 600 "$ENV_FILE_PATH"
        log_warn "Template environment file created at ${ENV_FILE_PATH}"
        log_warn "Please edit this file with your actual values before starting the service"
    fi
}

# Function to create systemd service for Java applications
create_java_service() {
    log_info "Creating systemd service: ${SERVICE_NAME}..."
    
    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
    
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=MoneyTree ${COMPONENT^} Service
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production ${APP_DIR}/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

# Resource limits
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    log_success "Systemd service created: ${SERVICE_FILE}"
}

# Function to configure Nginx for frontend
configure_nginx() {
    log_info "Configuring Nginx for frontend..."
    
    NGINX_CONFIG="/etc/nginx/sites-available/moneytree"
    
    cat > "$NGINX_CONFIG" << 'EOF'
server {
    listen 80;
    server_name moneytree.tailce422e.ts.net;

    root /var/www/moneytree;
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
        try_files $uri $uri/ /index.html;
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
    
    # Enable site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/moneytree
    
    # Remove default site if exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    if nginx -t > /dev/null 2>&1; then
        systemctl reload nginx
        log_success "Nginx configured and reloaded"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to configure firewall
configure_firewall() {
    log_info "Configuring firewall for port ${PORT}..."
    
    if command_exists ufw; then
        ufw allow ${PORT}/tcp > /dev/null 2>&1
        log_success "Firewall rule added for port ${PORT}"
    else
        log_warn "UFW not found, skipping firewall configuration"
    fi
}

# Function to start service
start_service() {
    log_info "Starting service: ${SERVICE_NAME}..."
    
    case $COMPONENT in
        backend|socketengine)
            systemctl enable "${SERVICE_NAME}" > /dev/null 2>&1
            systemctl restart "${SERVICE_NAME}"
            sleep 2
            if systemctl is-active --quiet "${SERVICE_NAME}"; then
                log_success "Service ${SERVICE_NAME} started successfully"
            else
                log_error "Service ${SERVICE_NAME} failed to start"
                log_error "Check logs with: sudo journalctl -u ${SERVICE_NAME} -n 50"
                exit 1
            fi
            ;;
        frontend)
            systemctl restart nginx
            if systemctl is-active --quiet nginx; then
                log_success "Nginx started successfully"
            else
                log_error "Nginx failed to start"
                exit 1
            fi
            ;;
    esac
}

# Main deployment flow
main() {
    log_info "=========================================="
    log_info "MoneyTree ${COMPONENT^} Deployment"
    log_info "=========================================="
    
    # Install prerequisites
    if [[ "$SKIP_INSTALL" == false ]]; then
        case $COMPONENT in
            backend|socketengine)
                install_java
                ;;
            frontend)
                install_nodejs
                install_nginx
                ;;
        esac
    else
        log_warn "Skipping prerequisite installation"
    fi
    
    # Create user and directories
    create_user
    setup_app_dir
    
    # Deploy application
    case $COMPONENT in
        backend|socketengine)
            deploy_jar
            setup_env
            ;;
        frontend)
            deploy_frontend
            configure_nginx
            ;;
    esac
    
    # Create systemd service
    if [[ "$SKIP_SERVICE" == false ]]; then
        case $COMPONENT in
            backend|socketengine)
                create_java_service
                ;;
        esac
    else
        log_warn "Skipping systemd service setup"
    fi
    
    # Configure firewall
    configure_firewall
    
    # Start service
    if [[ "$SKIP_SERVICE" == false ]]; then
        start_service
    fi
    
    log_info "=========================================="
    log_success "Deployment completed successfully!"
    log_info "=========================================="
    
    case $COMPONENT in
        backend)
            log_info "Backend is running on port ${PORT}"
            log_info "Health check: curl http://localhost:${PORT}/actuator/health"
            log_info "API docs: http://localhost:${PORT}/swagger-ui.html"
            log_info "Service logs: sudo journalctl -u ${SERVICE_NAME} -f"
            ;;
        socketengine)
            log_info "SocketEngine is running on port ${PORT}"
            log_info "Health check: curl http://localhost:${PORT}/actuator/health"
            log_info "API docs: http://localhost:${PORT}/swagger-ui.html"
            log_info "Service logs: sudo journalctl -u ${SERVICE_NAME} -f"
            ;;
        frontend)
            log_info "Frontend is running on port ${PORT}"
            log_info "Access: http://moneytree.tailce422e.ts.net"
            log_info "Nginx logs: sudo tail -f /var/log/nginx/access.log"
            ;;
    esac
    
    log_warn "Don't forget to update environment variables in ${APP_DIR}/.env"
}

# Run main function
main
