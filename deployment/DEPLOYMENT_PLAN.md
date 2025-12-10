# MoneyTree API Deployment Plan

## Overview

This document outlines the deployment plan for the MoneyTree API system, which consists of three independently deployable components:

**Important Security Configuration:**
- All components are configured with proper CORS settings using Tailscale addresses
- Backend and SocketEngine default CORS origins: `https://moneytree.tailce422e.ts.net`
- Frontend uses absolute Tailscale URLs for API endpoints
- CORS credentials are enabled for secure cross-origin requests

**Configuration Files:**
- **`deployment/deployment.conf`**: Common deployment settings (server addresses, ports, CORS, etc.)
- **Root `.env` file**: Sensitive credentials including **SSH_USER and SSH_PASSWORD** for unattended deployment
- Scripts automatically load both files
- Use `--accept-defaults` flag for completely unattended deployment (requires all values in config files)

1. **Backend** - Spring Boot REST API (Java 21)
2. **SocketEngine** - Spring Boot WebSocket service for real-time market data (Java 21)
3. **Frontend** - Angular 20 web application

All components will be deployed on separate Linux virtual machines in a Proxmox environment, accessible via Tailscale addresses.

## Deployment Approach

This plan supports two deployment methods:

1. **Interactive Component-Specific Deployment (Recommended)** - Component-specific scripts that interactively collect configuration, transfer artifacts, and deploy to remote servers.
2. **Manual Deployment** - Step-by-step manual installation for each component (documented in later sections).

### Interactive Deployment Scripts

The deployment system consists of:

- **`deploy-backend.sh`** - Interactive script for backend deployment
- **`deploy-socketengine.sh`** - Interactive script for SocketEngine deployment  
- **`deploy-frontend.sh`** - Interactive script for frontend deployment
- **`deploy-all.sh`** - Orchestrator script to deploy all components
- **`deployment.conf`** - Configuration file with common deployment settings

Each component script:
- Loads configuration from `deployment.conf` (if present) for common settings
- Interactively prompts only for SSH credentials and sensitive values (passwords, API keys)
- Uses config file values as defaults for all prompts (can be overridden)
- Transfers artifacts to the target server via SCP
- Executes remote deployment script on the server
- Handles prerequisite installation automatically
- Configures systemd services
- Sets up environment variables
- Configures firewall rules

**Configuration File (`deployment.conf`):**
- Contains all common/static deployment settings
- Includes Tailscale addresses, ports, CORS settings, etc.
- Sensitive values (passwords, API keys) are NOT stored in config file
- Edit this file once to set your environment defaults
- Scripts will use these values as defaults, but you can still override them during deployment

The scripts use `sshpass` for automated password-based SSH/SCP operations. If `sshpass` is not available, they provide manual instructions.

### Quick Start with Interactive Deployment Scripts

1. **Configure Deployment Settings (First Time Setup)**

   **Edit `deployment/deployment.conf`** to set your environment-specific values:
   ```bash
   cd deployment
   nano deployment.conf
   ```
   
   Update Tailscale addresses, ports, and other common settings.

   **Create `.env` file in root directory** with sensitive credentials:
   ```bash
   cd ..  # Go to root directory
   nano .env
   ```
   
   Add the following variables (replace with your actual values):
   ```bash
   # SSH Credentials (REQUIRED for unattended deployment)
   SSH_USER=your-ssh-username
   SSH_PASSWORD=your-ssh-password
   
   # Database Credentials
   DB_PASSWORD=your-database-password
   
   # Kite API Credentials
   KITE_WEBSOCKET_URL=wss://ws.kite.trade
   KITE_API_KEY=your-kite-api-key
   KITE_API_SECRET=your-kite-api-secret
   KITE_ACCESS_TOKEN=your-kite-access-token
   
   # Optional: Redis password (if Redis requires authentication)
   REDIS_PASSWORD=
   
   # Optional: OAuth client IDs (for frontend)
   GOOGLE_CLIENT_ID=
   MICROSOFT_CLIENT_ID=
   ```
   
   **Important**: 
   - `.env` is already in `.gitignore` - never commit this file
   - SSH_USER and SSH_PASSWORD are required for `--accept-defaults` mode
   - Scripts automatically load from root `.env` file
   - If `.env` is missing or values are missing, scripts will prompt for them
   - For completely unattended deployment, ensure all required variables are set

2. **Prepare Artifacts**

   **Option A: Use Helper Script (Recommended)**
   ```bash
   # Run the artifact preparation script
   cd deployment
   ./prepare-artifacts.sh
   
   # This will create all artifacts in deployment/artifacts/ directory:
   # - deployment/artifacts/moneytree-backend.jar
   # - deployment/artifacts/socketengine.jar
   # - deployment/artifacts/frontend-dist.zip
   ```

   **Option B: Build Manually**
   ```bash
   # Build backend
   cd backend && mvn clean package -DskipTests
   cp target/moneytree-backend-0.0.1-SNAPSHOT.jar ../artifacts/moneytree-backend.jar
   
   # Build socketengine
   cd ../socketengine && ./mvnw clean package -DskipTests
   cp target/socketengine-0.0.1-SNAPSHOT.jar ../artifacts/socketengine.jar
   
   # Build frontend
   cd ../frontend && npm install && npm run build:prod
   cd dist && zip -r ../../artifacts/frontend-dist.zip .
   ```

3. **Install sshpass (Optional but Recommended)**
   
   For automated password-based SSH/SCP operations:
   ```bash
   # Ubuntu/Debian
   sudo apt install sshpass
   
   # macOS
   brew install hudochenkov/sshpass/sshpass
   ```
   
   If `sshpass` is not installed, the scripts will provide manual instructions.

4. **Deploy Components**

   **Option A: Deploy All Components**
   ```bash
   # Run the orchestrator script
   cd deployment
   ./deploy-all.sh
   
   # This will:
   # - Check for artifacts
   # - Ask which components to deploy
   # - Run each component's deployment script interactively
   ```

   **Option B: Deploy Individual Components**
   ```bash
   cd deployment
   
   # Deploy backend only
   ./deploy-backend.sh
   
   # Deploy socketengine only
   ./deploy-socketengine.sh
   
   # Deploy frontend only
   ./deploy-frontend.sh
   ```

5. **Interactive Configuration**

   **Normal Mode (with prompts):**
   ```bash
   ./deploy-backend.sh
   ```
   Each script will:
   - Load values from `deployment.conf` as defaults
   - Load credentials from root `.env` file (if present)
   - Prompt for any missing values or allow overriding defaults
   - Show defaults from config file for all settings (press Enter to accept)
   - If credentials are in `.env`, they're used automatically (no prompt)

   **Automatic Mode (no prompts, completely unattended):**
   ```bash
   ./deploy-backend.sh --accept-defaults
   ```
   - Uses all values from `deployment.conf` and root `.env` file
   - Skips all prompts - completely unattended
   - Requires all necessary values to be present in config files:
     - `deployment/deployment.conf`: Server addresses, ports, CORS settings, etc.
     - Root `.env`: **SSH_USER, SSH_PASSWORD** (required), DB_PASSWORD, Kite API credentials
   - Fails immediately if required credentials are missing
   - Perfect for CI/CD pipelines or automated deployments
   - **Critical**: SSH_USER and SSH_PASSWORD must be in root `.env` file for unattended deployment

   The scripts will:
   - Transfer artifacts to the server
   - Execute remote deployment automatically
   - Configure all services
   - Start and enable systemd services

### Configuration Files

#### `deployment/deployment.conf`

Contains all common/static deployment settings. Scripts load this file automatically and use its values as defaults for prompts.

**What's in the config file:**
- Tailscale server addresses (BACKEND_HOST, SOCKETENGINE_HOST, FRONTEND_HOST)
- Application ports (BACKEND_PORT, SOCKETENGINE_PORT, FRONTEND_PORT)
- Application users (BACKEND_USER, SOCKETENGINE_USER, FRONTEND_USER)
- Database configuration (DB_HOST, DB_PORT, DB_NAME, DB_USERNAME)
- Redis configuration (REDIS_HOST, REDIS_PORT)
- CORS settings (CORS_ALLOWED_ORIGINS, CORS_ALLOWED_METHODS, etc.)
- WebSocket configuration (WEBSOCKET_ALLOWED_ORIGINS, etc.)
- Frontend API URLs (BACKEND_API_URL, SOCKETENGINE_API_URL, etc.)
- Kite API base URLs

#### `.env` (Root Directory)

Contains sensitive credentials. Scripts automatically load from root `.env` file.

**Required variables for `--accept-defaults` mode:**
- `SSH_USER` - SSH username
- `SSH_PASSWORD` - SSH password
- `DB_PASSWORD` - Database password
- `KITE_API_KEY` - Kite API key
- `KITE_API_SECRET` - Kite API secret
- `KITE_ACCESS_TOKEN` - Kite access token

**Optional variables:**
- `REDIS_PASSWORD` - Redis password (if Redis requires authentication)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (for frontend)
- `MICROSOFT_CLIENT_ID` - Microsoft OAuth client ID (for frontend)

**Example `.env` file (create in root directory):**
```bash
# ==============================================================================
# SSH Credentials (REQUIRED for --accept-defaults mode)
# ==============================================================================
SSH_USER=deploy-user
SSH_PASSWORD=your-secure-password

# ==============================================================================
# Database Credentials (REQUIRED for --accept-defaults mode)
# ==============================================================================
DB_PASSWORD=your-database-password

# ==============================================================================
# Redis Credentials (optional, if Redis requires authentication)
# ==============================================================================
REDIS_PASSWORD=your-redis-password

# ==============================================================================
# Kite API Credentials (REQUIRED for --accept-defaults mode)
# ==============================================================================
KITE_API_KEY=your-kite-api-key
KITE_API_SECRET=your-kite-api-secret
KITE_ACCESS_TOKEN=your-kite-access-token

# ==============================================================================
# OAuth Configuration (optional, for frontend)
# ==============================================================================
GOOGLE_CLIENT_ID=your-google-client-id
MICROSOFT_CLIENT_ID=your-microsoft-client-id
```

**Important Notes:**
- SSH_USER and SSH_PASSWORD enable completely unattended deployments
- All scripts use the same SSH credentials for all servers
- If you need different SSH credentials per server, you'll need to modify the scripts or use SSH keys instead

**Security Note:**
- `.env` file is already in `.gitignore` - never commit this file
- Scripts will prompt for missing values if not using `--accept-defaults`

**Usage:**
1. Edit `deployment/deployment.conf` to match your environment
2. Create `.env` file in root directory with credentials
3. Run deployment scripts:
   - Normal mode: Scripts use config values as defaults, prompt for missing/override values
   - `--accept-defaults` mode: Uses all values from config files, skips prompts (requires all values in files)

### What Each Script Prompts For

**deploy-backend.sh:**
- SSH username and password (loaded from root `.env` if present, otherwise prompted)
- Server hostname (default from config: `BACKEND_HOST`)
- PostgreSQL host, port, database name, username, password (host/port/name/username from config)
- Redis host and port (from config)
- Kite API key, secret, access token, base URL (base URL from config, credentials from `.env` if present)
- CORS settings (from config, can override)
- Application port and user (from config, can override)

**Note**: With `--accept-defaults`, SSH_USER and SSH_PASSWORD must be in root `.env` file for unattended deployment.

**deploy-socketengine.sh:**
- SSH username and password (loaded from root `.env` if present, otherwise prompted)
- Server hostname (default from config: `SOCKETENGINE_HOST`)
- PostgreSQL host, port, database name, username, password (host/port/name/username from config)
- Redis host, port, password (host/port from config)
- Kite API key, secret, access token, WebSocket URL (WebSocket URL from config, credentials from `.env` if present)
- WebSocket and CORS settings (from config, can override)
- Persistence settings (from config, can override)
- Application port and user (from config, can override)

**Note**: With `--accept-defaults`, SSH_USER and SSH_PASSWORD must be in root `.env` file for unattended deployment.

**deploy-frontend.sh:**
- SSH username and password (loaded from root `.env` if present, otherwise prompted)
- Server hostname (default from config: `FRONTEND_HOST`)
- Backend API URL (default from config: `BACKEND_API_URL`)
- SocketEngine API URL, WebSocket URL, HTTP URL (defaults from config)
- Google OAuth Client ID (from `.env` if present, otherwise prompted)
- Microsoft OAuth Client ID (from `.env` if present, otherwise prompted)
- Server name for Nginx (default from config: `FRONTEND_HOST`)
- Frontend URL for OAuth redirects (default from config: `FRONTEND_URL`)
- Application user (default from config: `FRONTEND_USER`)

**Note**: With `--accept-defaults`, SSH_USER and SSH_PASSWORD must be in root `.env` file for unattended deployment.

### Deployment Script Features

Each component-specific script provides:

- **Interactive Configuration Collection**
  - Prompts for all required settings
  - Provides sensible defaults
  - Validates inputs

- **Automated File Transfer**
  - Uses SCP to transfer artifacts
  - Supports password-based authentication via sshpass
  - Falls back to manual instructions if sshpass unavailable

- **Remote Deployment Execution**
  - Generates remote deployment script dynamically
  - Transfers and executes on target server
  - Handles all server-side operations

- **Automatic Prerequisite Installation**
  - Java 21 for backend/socketengine
  - Node.js 18+ for frontend
  - Nginx for frontend

- **User and Directory Management**
  - Creates dedicated application users
  - Sets up application directories with proper permissions

- **Service Management**
  - Creates systemd service files
  - Enables and starts services automatically
  - Configures automatic restart on failure

- **Environment Configuration**
  - Creates `.env` files with collected settings
  - Secures environment files with proper permissions

- **Firewall Configuration**
  - Automatically opens required ports

### Script Usage Examples

```bash
# Navigate to deployment directory
cd deployment

# Deploy all components interactively (with prompts)
./deploy-all.sh

# Deploy all components automatically (no prompts, uses config files)
./deploy-all.sh --accept-defaults

# Deploy individual components with prompts
./deploy-backend.sh
./deploy-socketengine.sh
./deploy-frontend.sh

# Deploy individual components automatically
./deploy-backend.sh --accept-defaults
./deploy-socketengine.sh --accept-defaults
./deploy-frontend.sh --accept-defaults

# Show help
./deploy-backend.sh --help
```

### Updating Deployed Components (Redeployment)

The deployment scripts are designed to handle frequent redeployments in development environments. Simply run the component-specific script again with the same or updated configuration:

```bash
cd deployment

# Update backend
./deploy-backend.sh
# Enter same server details, script will detect existing installation and update

# Update socketengine
./deploy-socketengine.sh

# Update frontend
./deploy-frontend.sh
```

#### Redeployment Features

**Automatic Update Detection:**
- Scripts detect if a service is already installed
- Different messaging for updates vs fresh installs
- Previous versions are automatically backed up

**Graceful Service Management:**
- **Backend/SocketEngine**: Services are gracefully stopped before updating files
- **Frontend**: Nginx configuration is tested before applying, uses reload instead of restart for zero-downtime updates
- Services wait up to 30 seconds for graceful shutdown

**Version Management:**
- JAR files are timestamped (e.g., `moneytree-backend_20241210_160530.jar`)
- Previous version is backed up before update
- Automatic cleanup: keeps last 5 JAR versions and last 3 backups
- Old versions are automatically removed to prevent disk space issues

**Health Checks:**
- After deployment, scripts perform health checks on `/actuator/health` endpoint
- Retries up to 3 times with 5-second intervals
- If health check fails, rollback instructions are provided

**Rollback Capability:**
- Previous versions are stored in `/home/<app-user>/app/backup/` directory
- Frontend backups are stored in `/var/www/moneytree_backup_<timestamp>/`
- Rollback instructions are displayed if deployment fails

#### Manual Rollback Procedure

If a deployment fails or you need to rollback to a previous version:

**Backend/SocketEngine:**
```bash
# SSH to the server
ssh user@server-hostname

# Stop the service
sudo systemctl stop moneytree-backend  # or moneytree-socketengine

# List available backups
ls -lh /home/moneytree-backend/app/backup/

# Rollback to a specific backup
sudo ln -sf /home/moneytree-backend/app/backup/app_20241210_160530.jar /home/moneytree-backend/app/app.jar

# Start the service
sudo systemctl start moneytree-backend
```

**Frontend:**
```bash
# SSH to the server
ssh user@server-hostname

# List available backups
ls -ld /var/www/moneytree_backup_*

# Rollback to a specific backup
sudo rm -rf /var/www/moneytree
sudo cp -r /var/www/moneytree_backup_20241210_160530 /var/www/moneytree
sudo chown -R www-data:www-data /var/www/moneytree
sudo systemctl reload nginx
```

#### Cleanup Old Versions

The scripts automatically clean up old versions, but you can manually clean up if needed:

**Backend/SocketEngine:**
```bash
# Keep only last 3 JAR files
cd /home/moneytree-backend/app/jar
ls -t *.jar | tail -n +4 | xargs rm -f

# Keep only last 2 backups
cd /home/moneytree-backend/app/backup
ls -t *.jar | tail -n +3 | xargs rm -f
```

**Frontend:**
```bash
# Keep only last 2 backups
ls -dt /var/www/moneytree_backup_* | tail -n +3 | xargs rm -rf
```

The scripts are idempotent and safe to run multiple times, making them ideal for frequent development deployments.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Proxmox Virtual Environment              │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐ │
│  │  Backend VM      │  │ SocketEngine VM  │  │ Frontend  │ │
│  │                  │  │                  │  │    VM     │ │
│  │ backend.tailce   │  │ socketengine.    │  │ moneytree.│ │
│  │ 422e.ts.net      │  │ tailce422e.ts.net│  │ tailce422e│ │
│  │                  │  │                  │  │ .ts.net   │ │
│  │ Port: 8080       │  │ Port: 8081       │  │ Port: 80  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └─────┬─────┘ │
│           │                     │                    │       │
│           └──────────┬──────────┘                    │       │
│                      │                               │       │
│           ┌──────────▼──────────┐                    │       │
│           │  PostgreSQL VM      │                    │       │
│           │ postgres.tailce422e │                    │       │
│           │      .ts.net        │                    │       │
│           └─────────────────────┘                    │       │
│                                                       │       │
│           ┌─────────────────────┐                    │       │
│           │    Redis VM         │                    │       │
│           │ redis.tailce422e.   │                    │       │
│           │      ts.net         │                    │       │
│           └─────────────────────┘                    │       │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Backend Application

**Technology Stack:**
- Spring Boot 3.2.5
- Java 21
- Maven
- PostgreSQL (TimescaleDB)
- Redis

**Deployment Target:**
- VM Hostname: `backend.tailce422e.ts.net`
- Port: `8080`
- Build Artifact: `backend/target/moneytree-backend-0.0.1-SNAPSHOT.jar`

**Dependencies:**
- PostgreSQL database at `postgres.tailce422e.ts.net:5432`
- Redis at `redis.tailce422e.ts.net:6379`

**Environment Variables:**
```bash
DB_USERNAME=postgres
DB_PASSWORD=<secure_password>
KITE_API_KEY=<kite_api_key>
KITE_API_SECRET=<kite_api_secret>
KITE_ACCESS_TOKEN=<kite_access_token>
KITE_BASE_URL=https://api.kite.trade
```

**Configuration Files:**
- `backend/src/main/resources/application.yaml` - Database and Redis connection settings

**Build Command:**
```bash
cd backend && mvn clean package -DskipTests
```

**Startup Command:**
```bash
java -jar -Dspring.profiles.active=production target/moneytree-backend-0.0.1-SNAPSHOT.jar
```

---

### 2. SocketEngine Application

**Technology Stack:**
- Spring Boot 3.2.5
- Java 21
- Maven
- PostgreSQL (TimescaleDB)
- Redis
- WebSocket support

**Deployment Target:**
- VM Hostname: `socketengine.tailce422e.ts.net`
- Port: `8081`
- Build Artifact: `socketengine/target/socketengine-0.0.1-SNAPSHOT.jar`

**Dependencies:**
- PostgreSQL database at `postgres.tailce422e.ts.net:5432`
- Redis at `redis.tailce422e.ts.net:6379`

**Environment Variables:**
```bash
DATABASE_URL=jdbc:postgresql://postgres.tailce422e.ts.net:5432/MoneyTree
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=<secure_password>
REDIS_HOST=redis.tailce422e.ts.net
REDIS_PORT=6379
REDIS_PASSWORD=<redis_password_if_set>
KITE_WEBSOCKET_URL=wss://ws.kite.trade
KITE_API_KEY=<kite_api_key>
KITE_API_SECRET=<kite_api_secret>
KITE_ACCESS_TOKEN=<kite_access_token>
WEBSOCKET_ALLOWED_ORIGINS=https://moneytree.tailce422e.ts.net
CORS_ALLOWED_ORIGINS=https://moneytree.tailce422e.ts.net
PERSISTENCE_BATCH_SIZE=1000
PERSISTENCE_MAX_BUFFER_SIZE=100000
PERSISTENCE_BATCH_INTERVAL_MINUTES=15
WEBSOCKET_MAX_SESSIONS=1000
WEBSOCKET_MAX_MESSAGE_SIZE=65536
```

**Configuration Files:**
- `socketengine/src/main/resources/application.yml` - Database, Redis, and WebSocket configuration

**Build Command:**
```bash
cd socketengine && ./mvnw clean package -DskipTests
```

**Startup Command:**
```bash
java -jar -Dspring.profiles.active=production target/socketengine-0.0.1-SNAPSHOT.jar
```

---

### 3. Frontend Application

**Technology Stack:**
- Angular 20
- Node.js (v18+)
- npm
- Nginx (for production serving)

**Deployment Target:**
- VM Hostname: `moneytree.tailce422e.ts.net`
- Port: `80` (HTTP) / `443` (HTTPS)
- Build Artifact: `frontend/dist/` directory (static files)

**Dependencies:**
- Backend API at `https://backend.tailce422e.ts.net:8080`
- SocketEngine WebSocket at `wss://socketengine.tailce422e.ts.net:8081`

**Environment Configuration:**
The frontend needs to be built with production environment settings pointing to the deployed backend and socketengine services.

**Build Command:**
```bash
cd frontend && npm install && npm run build:prod
```

**Production Build Output:**
- Static files in `frontend/dist/` directory
- These files need to be served via Nginx

---

## Infrastructure Requirements

### Virtual Machines

Each component requires a Linux VM with the following minimum specifications:

**Backend VM:**
- OS: Ubuntu 22.04 LTS or Debian 12
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Java 21 JDK
- Maven (for building)

**SocketEngine VM:**
- OS: Ubuntu 22.04 LTS or Debian 12
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Java 21 JDK
- Maven (for building)

**Frontend VM:**
- OS: Ubuntu 22.04 LTS or Debian 12
- CPU: 1 core
- RAM: 2GB
- Storage: 10GB
- Node.js 18+ (for building)
- Nginx (for serving)

### External Services

**PostgreSQL Database:**
- Hostname: `postgres.tailce422e.ts.net`
- Port: `5432`
- Database: `MoneyTree`
- Requires TimescaleDB extension for time-series data

**Redis:**
- Hostname: `redis.tailce422e.ts.net`
- Port: `6379`
- Used for caching and session management

---

## Deployment Steps

### Option A: Automated Deployment (Recommended)

Use the `deploy.sh` script for automated deployment. See "Quick Start with Automated Script" section above.

### Option B: Manual Deployment

Follow the detailed manual steps below if you prefer step-by-step installation.

### Phase 1: Infrastructure Setup

1. **Create Virtual Machines in Proxmox**
   - Create 3 VMs (backend, socketengine, frontend)
   - Install Ubuntu 22.04 LTS or Debian 12 on each
   - Configure Tailscale on each VM
   - Assign Tailscale hostnames:
     - `backend.tailce422e.ts.net`
     - `socketengine.tailce422e.ts.net`
     - `moneytree.tailce422e.ts.net`

2. **Setup PostgreSQL Database**
   - Ensure PostgreSQL VM is accessible at `postgres.tailce422e.ts.net`
   - Verify database `MoneyTree` exists
   - Ensure TimescaleDB extension is installed
   - Create database user with appropriate permissions

3. **Setup Redis**
   - Ensure Redis VM is accessible at `redis.tailce422e.ts.net`
   - Configure Redis authentication if required
   - Test connectivity from backend and socketengine VMs

### Phase 2: Backend Deployment

1. **Prepare Backend VM**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Java 21
   sudo apt install openjdk-21-jdk -y
   
   # Install Maven
   sudo apt install maven -y
   
   # Create application user
   sudo useradd -m -s /bin/bash moneytree-backend
   ```

2. **Clone Repository**
   ```bash
   sudo -u moneytree-backend git clone <github_repo_url> /home/moneytree-backend/app
   cd /home/moneytree-backend/app
   ```

3. **Build Application**
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```

4. **Create Environment File**
   ```bash
   sudo -u moneytree-backend nano /home/moneytree-backend/app/.env
   ```
   Add all required environment variables (see Backend section above)

5. **Create Systemd Service**
   Create `/etc/systemd/system/moneytree-backend.service`:
   ```ini
   [Unit]
   Description=MoneyTree Backend Service
   After=network.target

   [Service]
   Type=simple
   User=moneytree-backend
   WorkingDirectory=/home/moneytree-backend/app/backend
   EnvironmentFile=/home/moneytree-backend/app/.env
   ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production /home/moneytree-backend/app/backend/target/moneytree-backend-0.0.1-SNAPSHOT.jar
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable moneytree-backend
   sudo systemctl start moneytree-backend
   sudo systemctl status moneytree-backend
   ```

7. **Configure Firewall**
   ```bash
   sudo ufw allow 8080/tcp
   ```

### Phase 3: SocketEngine Deployment

1. **Prepare SocketEngine VM**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Java 21
   sudo apt install openjdk-21-jdk -y
   
   # Install Maven
   sudo apt install maven -y
   
   # Create application user
   sudo useradd -m -s /bin/bash moneytree-socketengine
   ```

2. **Clone Repository**
   ```bash
   sudo -u moneytree-socketengine git clone <github_repo_url> /home/moneytree-socketengine/app
   cd /home/moneytree-socketengine/app
   ```

3. **Build Application**
   ```bash
   cd socketengine
   ./mvnw clean package -DskipTests
   ```

4. **Create Environment File**
   ```bash
   sudo -u moneytree-socketengine nano /home/moneytree-socketengine/app/.env
   ```
   Add all required environment variables (see SocketEngine section above)

5. **Create Systemd Service**
   Create `/etc/systemd/system/moneytree-socketengine.service`:
   ```ini
   [Unit]
   Description=MoneyTree SocketEngine Service
   After=network.target

   [Service]
   Type=simple
   User=moneytree-socketengine
   WorkingDirectory=/home/moneytree-socketengine/app/socketengine
   EnvironmentFile=/home/moneytree-socketengine/app/.env
   ExecStart=/usr/bin/java -jar -Dspring.profiles.active=production /home/moneytree-socketengine/app/socketengine/target/socketengine-0.0.1-SNAPSHOT.jar
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable moneytree-socketengine
   sudo systemctl start moneytree-socketengine
   sudo systemctl status moneytree-socketengine
   ```

7. **Configure Firewall**
   ```bash
   sudo ufw allow 8081/tcp
   ```

### Phase 4: Frontend Deployment

1. **Prepare Frontend VM**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Create application user
   sudo useradd -m -s /bin/bash moneytree-frontend
   ```

2. **Clone Repository**
   ```bash
   sudo -u moneytree-frontend git clone <github_repo_url> /home/moneytree-frontend/app
   cd /home/moneytree-frontend/app
   ```

3. **Update Production Environment Configuration**
   Update `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://backend.tailce422e.ts.net:8080/api',
     enginesApiUrl: 'https://socketengine.tailce422e.ts.net:8081/engines',
     enginesWebSocketUrl: 'wss://socketengine.tailce422e.ts.net:8081/engines',
     enginesHttpUrl: 'https://socketengine.tailce422e.ts.net:8081/engines',
     oauth: {
       google: {
         clientId: '<google_client_id>',
         redirectUri: 'https://moneytree.tailce422e.ts.net'
       },
       microsoft: {
         clientId: '<microsoft_client_id>',
         redirectUri: 'https://moneytree.tailce422e.ts.net'
       }
     }
   };
   ```

4. **Build Application**
   ```bash
   cd frontend
   npm install
   npm run build:prod
   ```

5. **Deploy Static Files**
   ```bash
   sudo mkdir -p /var/www/moneytree
   sudo cp -r /home/moneytree-frontend/app/frontend/dist/* /var/www/moneytree/
   sudo chown -R www-data:www-data /var/www/moneytree
   ```

6. **Configure Nginx**
   Create `/etc/nginx/sites-available/moneytree`:
   ```nginx
   server {
       listen 80;
       server_name moneytree.tailce422e.ts.net;

       root /var/www/moneytree;
       index index.html;

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

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
   }
   ```

7. **Enable Site and Restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/moneytree /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Configure Firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Phase 5: SSL/TLS Configuration (Optional but Recommended)

For HTTPS support, configure SSL certificates using Let's Encrypt:

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d moneytree.tailce422e.ts.net
   ```

3. **Update Nginx Configuration**
   Certbot will automatically update the Nginx configuration to use HTTPS.

4. **Update Frontend Environment**
   Update `environment.prod.ts` to use `https://` URLs instead of `http://`.

---

## Post-Deployment Verification

### Backend Health Check
```bash
curl https://backend.tailce422e.ts.net:8080/actuator/health
```

### SocketEngine Health Check
```bash
curl https://socketengine.tailce422e.ts.net:8081/actuator/health
```

### Frontend Access
- Navigate to `https://moneytree.tailce422e.ts.net` in a browser
- Verify the application loads correctly
- Test API connectivity by performing actions that require backend data
- Test WebSocket connectivity by checking real-time data updates

### API Documentation
- Backend Swagger UI: `https://backend.tailce422e.ts.net:8080/swagger-ui.html`
- SocketEngine Swagger UI: `https://socketengine.tailce422e.ts.net:8081/swagger-ui.html`

---

## Continuous Deployment Setup

### GitHub Actions Workflow (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Backend
        run: |
          # SSH to backend VM and deploy
          # Implementation depends on your SSH setup
          
  deploy-socketengine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy SocketEngine
        run: |
          # SSH to socketengine VM and deploy
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy Frontend
        run: |
          # SSH to frontend VM and deploy
```

### Manual Deployment Scripts

Create deployment scripts for each component:

**`scripts/deploy-backend.sh`:**
```bash
#!/bin/bash
set -e

VM_HOST="backend.tailce422e.ts.net"
APP_USER="moneytree-backend"
APP_DIR="/home/${APP_USER}/app"

echo "Deploying backend to ${VM_HOST}..."

# Build locally or on VM
ssh ${APP_USER}@${VM_HOST} "cd ${APP_DIR} && git pull && cd backend && mvn clean package -DskipTests"

# Restart service
ssh ${APP_USER}@${VM_HOST} "sudo systemctl restart moneytree-backend"

echo "Backend deployment complete!"
```

Similar scripts for socketengine and frontend.

---

## Monitoring and Logging

### Application Logs

**Backend:**
```bash
sudo journalctl -u moneytree-backend -f
```

**SocketEngine:**
```bash
sudo journalctl -u moneytree-socketengine -f
```

**Frontend (Nginx):**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Monitoring

Set up monitoring for:
- Application health endpoints (`/actuator/health`)
- Database connectivity
- Redis connectivity
- Disk space and memory usage
- Service uptime

---

## Backup and Recovery

### Database Backups
- Set up automated PostgreSQL backups
- Store backups in a secure location
- Test restore procedures regularly

### Application Backups
- Version control in GitHub provides code backup
- Document configuration changes
- Keep deployment scripts versioned

---

## Security Considerations

1. **Firewall Configuration**
   - Only expose necessary ports
   - Use Tailscale for secure inter-service communication

2. **Environment Variables**
   - Store sensitive credentials securely
   - Use secrets management (consider HashiCorp Vault or similar)

3. **SSL/TLS**
   - Enable HTTPS for all services
   - Use valid SSL certificates

4. **Access Control**
   - Limit SSH access to authorized users
   - Use key-based authentication
   - Regularly update system packages

5. **Application Security**
   - Keep dependencies updated
   - Regularly review and update CORS settings
   - Monitor for security vulnerabilities

---

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   - Check logs: `sudo journalctl -u <service-name> -n 50`
   - Verify environment variables are set correctly
   - Check database/Redis connectivity
   - **For redeployments**: Check if previous version is still running and blocking port

2. **Database Connection Errors**
   - Verify PostgreSQL is accessible from application VM
   - Check firewall rules
   - Verify credentials in environment file

3. **Frontend Can't Connect to Backend**
   - Verify CORS settings in backend
   - Check network connectivity between VMs
   - Verify API URLs in frontend environment configuration

4. **WebSocket Connection Issues**
   - Check WebSocket allowed origins in SocketEngine config
   - Verify firewall allows WebSocket connections
   - Check browser console for connection errors

5. **Deployment Fails After Update**
   - Check if health check endpoint is accessible: `curl http://localhost:PORT/actuator/health`
   - Review service logs for startup errors
   - Use rollback procedure to restore previous version
   - Previous version is automatically backed up before update

6. **Health Check Fails After Deployment**
   - Service may need more time to start (scripts wait up to 15 seconds)
   - Check application logs for errors
   - Verify all dependencies (database, Redis) are accessible
   - Rollback instructions are provided in the error message

### Redeployment Best Practices

1. **Before Redeploying:**
   - Ensure you have the latest artifacts built: `./prepare-artifacts.sh`
   - Verify target servers are accessible
   - Have database/Redis credentials ready

2. **During Redeployment:**
   - Scripts handle graceful shutdown automatically
   - Previous versions are backed up automatically
   - Health checks ensure service is working after update

3. **After Redeployment:**
   - Verify health endpoints are responding
   - Test critical functionality
   - Monitor logs for any errors: `sudo journalctl -u <service-name> -f`

4. **If Deployment Fails:**
   - Don't panic - previous version is backed up
   - Follow rollback instructions provided in error message
   - Check logs to identify the issue
   - Fix the issue and redeploy

---

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Review application logs
   - Check disk space usage
   - Verify backups are running

2. **Monthly:**
   - Update system packages
   - Review security advisories
   - Update application dependencies

3. **Quarterly:**
   - Review and update deployment documentation
   - Test disaster recovery procedures
   - Performance optimization review

---

## Appendix

### Deployment Script Reference

**Script Locations:**
All deployment scripts are located in the `deployment/` directory:
- `deployment/deploy-backend.sh` - Interactive backend deployment script
- `deployment/deploy-socketengine.sh` - Interactive SocketEngine deployment script
- `deployment/deploy-frontend.sh` - Interactive frontend deployment script
- `deployment/deploy-all.sh` - Orchestrator script for deploying all components
- `deployment/prepare-artifacts.sh` - Artifact preparation script (run locally before deployment)
- `deployment/deployment.conf` - Configuration file with common deployment settings
- `deployment/deploy.sh` - Legacy single-script deployment (still available for manual use)

**Configuration Files:**

- **`deployment/deployment.conf`**: Common/static deployment settings
  - Includes: Tailscale addresses, ports, CORS settings, database/Redis hosts, etc.
  - Edit once to customize your environment defaults
  - Scripts use these values as defaults but allow overriding during deployment

- **`.env` (root directory)**: Sensitive credentials
  - **SSH_USER, SSH_PASSWORD** - Required for unattended deployment
  - DB_PASSWORD - Database password
  - **KITE_WEBSOCKET_URL, KITE_API_KEY, KITE_API_SECRET, KITE_ACCESS_TOKEN** - Kite API credentials (all four are loaded and passed to deployment scripts)
  - Optional: REDIS_PASSWORD, GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID
  - Scripts automatically load from root `.env` file
  - **Required for `--accept-defaults` mode**: SSH_USER, SSH_PASSWORD, DB_PASSWORD, KITE_API_KEY, KITE_API_SECRET, KITE_ACCESS_TOKEN (KITE_WEBSOCKET_URL defaults to `wss://ws.kite.trade` if not set)
  - **Never commit this file to version control** (already in .gitignore)
  
  **Example `.env` file structure:**
  ```bash
  SSH_USER=deploy-user
  SSH_PASSWORD=your-ssh-password
  DB_PASSWORD=your-db-password
  KITE_WEBSOCKET_URL=wss://ws.kite.trade
  KITE_API_KEY=your-kite-key
  KITE_API_SECRET=your-kite-secret
  KITE_ACCESS_TOKEN=your-kite-token
  ```

**Component Script Features:**
- Interactive configuration collection
- Automated artifact transfer via SCP
- Remote deployment execution
- Idempotent (can be run multiple times safely)
- Automatic prerequisite detection and installation
- Comprehensive error handling and logging
- Colored output for better readability

**Script Dependencies:**
- Bash 4.0+
- `sshpass` (optional, for automated password-based SSH)
- Internet connection (for package installation on target servers)
- Standard Linux utilities (scp, ssh, curl, unzip, etc.)

**Prepare Artifacts Script:**
- Builds all components locally
- Packages artifacts for deployment
- Creates standardized artifact names in `deployment/artifacts/`:
  - `deployment/artifacts/moneytree-backend.jar`
  - `deployment/artifacts/socketengine.jar`
  - `deployment/artifacts/frontend-dist.zip`
- Requires Maven and npm to be installed locally
- Must be run from the `deployment/` directory or with correct path references

### Network Ports Summary

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| Backend | 8080 | HTTP | REST API |
| SocketEngine | 8081 | HTTP/WS | WebSocket and REST API |
| Frontend | 80/443 | HTTP/HTTPS | Web application |
| PostgreSQL | 5432 | TCP | Database |
| Redis | 6379 | TCP | Cache/Session store |

### File Locations Summary

**Backend:**
- Application: `/home/moneytree-backend/app/backend/`
- JAR: `/home/moneytree-backend/app/backend/target/moneytree-backend-0.0.1-SNAPSHOT.jar`
- Config: `/home/moneytree-backend/app/.env`
- Service: `/etc/systemd/system/moneytree-backend.service`

**SocketEngine:**
- Application: `/home/moneytree-socketengine/app/socketengine/`
- JAR: `/home/moneytree-socketengine/app/socketengine/target/socketengine-0.0.1-SNAPSHOT.jar`
- Config: `/home/moneytree-socketengine/app/.env`
- Service: `/etc/systemd/system/moneytree-socketengine.service`

**Frontend:**
- Application: `/home/moneytree-frontend/app/frontend/`
- Build Output: `/var/www/moneytree/`
- Nginx Config: `/etc/nginx/sites-available/moneytree`

---

## Revision History

- **Version 1.0** - Initial deployment plan created
