# MoneyTree Application Deployment Locations

## Overview
This document describes where each component is deployed on the servers.

## Backend (backend.tailce422e.ts.net)

**Application Directory:**
- `/home/moneytree-backend/app/`
  - `app.jar` - Symlink to current JAR file
  - `jar/` - Directory containing all JAR versions
  - `logs/` - Application logs
  - `.env` - Environment variables
  - `backup/` - Backup JAR files

**Systemd Service:**
- Service name: `moneytree-backend`
- Service file: `/etc/systemd/system/moneytree-backend.service`
- User: `moneytree-backend`
- Port: `8080`

**Check Status:**
```bash
ssh raja@backend.tailce422e.ts.net
sudo systemctl status moneytree-backend
sudo journalctl -u moneytree-backend -n 50
ls -lh /home/moneytree-backend/app/
```

## SocketEngine (socketengine.tailce422e.ts.net)

**Application Directory:**
- `/home/moneytree-socketengine/app/`
  - `app.jar` - Symlink to current JAR file
  - `jar/` - Directory containing all JAR versions
  - `logs/` - Application logs
  - `.env` - Environment variables
  - `backup/` - Backup JAR files

**Systemd Service:**
- Service name: `moneytree-socketengine`
- Service file: `/etc/systemd/system/moneytree-socketengine.service`
- User: `moneytree-socketengine`
- Port: `8081`

**Check Status:**
```bash
ssh raja@socketengine.tailce422e.ts.net
sudo systemctl status moneytree-socketengine
sudo journalctl -u moneytree-socketengine -n 50
ls -lh /home/moneytree-socketengine/app/
```

## Frontend (moneytree.tailce422e.ts.net)

**Web Root:**
- `/var/www/moneytree/` - Nginx web root
  - `index.html` - Main HTML file
  - `*.js` - JavaScript bundles
  - `*.css` - Stylesheets
  - Other static assets

**Application Directory (for backups):**
- `/home/moneytree-frontend/app/dist/` - Backup/staging location

**Nginx Configuration:**
- Config file: `/etc/nginx/sites-available/moneytree`
- Enabled link: `/etc/nginx/sites-enabled/moneytree`
- Port: `80` (HTTP)

**Check Status:**
```bash
ssh raja@moneytree.tailce422e.ts.net
sudo systemctl status nginx
ls -lh /var/www/moneytree/
sudo tail -50 /var/log/nginx/error.log
```

## Quick Status Check Script

Run the provided script to check all deployments:

```bash
cd /home/raja/code/moneytree-api/deployment
./check-deployment.sh
```

This will show:
- Whether application directories exist
- Whether JAR files/services are deployed
- Service status (running/stopped)
- Recent logs if services are not running

## Troubleshooting

### If applications are not deployed:

1. **Install sshpass** (required for automated deployment):
   ```bash
   sudo apt-get install sshpass
   ```

2. **Rebuild artifacts**:
   ```bash
   cd /home/raja/code/moneytree-api/deployment
   ./prepare-artifacts.sh
   ```

3. **Redeploy**:
   ```bash
   ./deploy-all.sh --accept-defaults
   ```

### If services are deployed but not running:

1. **Check logs**:
   ```bash
   # Backend
   ssh raja@backend.tailce422e.ts.net "sudo journalctl -u moneytree-backend -n 50"
   
   # SocketEngine
   ssh raja@socketengine.tailce422e.ts.net "sudo journalctl -u moneytree-socketengine -n 50"
   
   # Frontend
   ssh raja@moneytree.tailce422e.ts.net "sudo tail -50 /var/log/nginx/error.log"
   ```

2. **Start services manually**:
   ```bash
   # Backend
   ssh raja@backend.tailce422e.ts.net "sudo systemctl start moneytree-backend"
   
   # SocketEngine
   ssh raja@socketengine.tailce422e.ts.net "sudo systemctl start moneytree-socketengine"
   
   # Frontend (Nginx)
   ssh raja@moneytree.tailce422e.ts.net "sudo systemctl start nginx"
   ```
