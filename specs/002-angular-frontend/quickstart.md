# Quick Start Guide: Angular Frontend Modulith Integration

**Feature**: `002-angular-frontend`  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Java 21 (for backend)
- Maven (for backend)
- Access to source frontend at `/home/raja/code/MoneyPlant/frontend`
- Backend application running on port 8080

## Setup Steps

### 1. Copy Frontend Source Files

```bash
# From repository root
cd /home/raja/code/moneytree-api

# Create frontend modulith directory
mkdir -p frontend

# Copy source files (excluding build artifacts and dependencies)
rsync -av --exclude 'node_modules' \
           --exclude 'dist' \
           --exclude '.angular' \
           --exclude '*.log' \
           --exclude '.DS_Store' \
           --exclude '.idea' \
           --exclude '.vscode' \
           /home/raja/code/MoneyPlant/frontend/ \
           frontend/
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure API Proxy

Create or update `frontend/proxy.conf.json`:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  },
  "/swagger-ui.html": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  },
  "/api-docs": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### 4. Update Angular Configuration

Update `frontend/angular.json` to use proxy configuration:

```json
{
  "projects": {
    "moneytree-app": {
      "architect": {
        "serve": {
          "builder": "@angular/build:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.json",
            "port": 4200
          }
        }
      }
    }
  }
}
```

### 5. Update Environment Configuration

Update `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',  // Use proxy, not absolute URL
  // ... other configuration
};
```

### 6. Create Startup Scripts

Create `frontend/start-dev.sh`:

```bash
#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Angular development server on port 4200..."
ng serve --port 4200 --proxy-config proxy.conf.json
```

Make it executable:
```bash
chmod +x frontend/start-dev.sh
```

Create `start-all.sh` at repository root:

```bash
#!/bin/bash
cd "$(dirname "$0")"

# Start backend in background
echo "Starting backend on port 8080..."
cd backend
./start-app.sh &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Start frontend in background
echo "Starting frontend on port 4200..."
cd frontend
./start-dev.sh &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:4200"
echo "API Docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
```

Make it executable:
```bash
chmod +x start-all.sh
```

## Running the Application

### Option 1: Start Both Services Together

```bash
# From repository root
./start-all.sh
```

### Option 2: Start Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
./start-app.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# or
./start-dev.sh
```

## Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **API Documentation**: http://localhost:8080/swagger-ui.html

## UUID Migration Tasks

After initial setup, update all entity models to use UUID strings:

1. **Update Entity Interfaces**
   ```typescript
   // Before
   interface Portfolio {
     id: number;
   }
   
   // After
   interface Portfolio {
     id: string;  // UUID
   }
   ```

2. **Update Service Methods**
   ```typescript
   // Before
   getPortfolio(id: number): Observable<Portfolio> {
     return this.http.get<Portfolio>(`/api/portfolio/${id}`);
   }
   
   // After
   getPortfolio(id: string): Observable<Portfolio> {
     return this.http.get<Portfolio>(`/api/portfolio/${id}`);
   }
   ```

3. **Update Components**
   - Change all ID type references from `number` to `string`
   - Update route parameters to accept UUID strings
   - Update ID display/formatting logic

4. **Remove nse_* References**
   - Search for "nse_" in codebase
   - Update to use new API endpoints
   - Ensure no direct table references

## Verification

### Check Frontend Loads
1. Navigate to http://localhost:4200
2. Verify frontend application loads
3. Check browser console for errors

### Check API Connectivity
1. Open browser developer tools
2. Navigate to Network tab
3. Perform an action that calls the API
4. Verify requests are proxied to `http://localhost:8080/api/**`
5. Verify responses contain UUID strings for entity IDs

### Check UUID Migration
1. Inspect API responses in browser dev tools
2. Verify all entity IDs are UUID strings (not numbers)
3. Check TypeScript compilation for type errors
4. Verify no references to numeric ID types remain

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 4200
lsof -i :4200

# Kill process if needed
kill -9 <PID>
```

### Backend Not Starting
- Check backend logs
- Verify database connection
- Check `.env` file in `backend/` directory

### Frontend Build Errors
- Run `npm install` again
- Clear Angular cache: `rm -rf .angular node_modules`
- Reinstall: `npm install`

### API Proxy Not Working
- Verify `proxy.conf.json` exists and is correct
- Check `angular.json` has proxy configuration
- Restart Angular dev server

### CORS Errors
- Ensure proxy configuration is correct
- Verify backend allows requests from frontend origin
- Check browser console for specific CORS error messages

## Next Steps

After successful setup:
1. Update all entity models to use UUID strings
2. Update all services to handle UUID-based IDs
3. Update components that display/manipulate IDs
4. Test all CRUD operations with UUID values
5. Verify no nse_* table references remain
6. Document any API contract differences discovered

