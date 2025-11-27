# MoneyTree Frontend

Angular frontend application for the MoneyTree API modulith.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (installed globally or via npx)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
   - The `src/environments/environment.ts` file is configured to use `/api` as the API URL, which proxies to `http://localhost:8080` via the development server proxy.

## Development

### Start Development Server

Start the frontend development server on port 4200:

```bash
./start-dev.sh
```

Or manually:
```bash
ng serve --port 4200 --proxy-config proxy.conf.json
```

### Start Both Services (Frontend + Backend)

From the repository root:

```bash
./start-all.sh
```

This will start:
- Backend on http://localhost:8080
- Frontend on http://localhost:4200
- API documentation on http://localhost:8080/swagger-ui.html

## Build

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build:prod
```

## Configuration

### API Proxy

The development server uses a proxy configuration (`proxy.conf.json`) to forward `/api/**` requests to the backend at `http://localhost:8080`. This avoids CORS issues during development.

### Environment Variables

- `apiUrl`: Set to `/api` to use the proxy (development) or absolute URL (production)
- See `src/environments/environment.ts` for configuration options

## Project Structure

- `src/app/` - Main application code
  - `features/` - Feature modules (portfolios, screeners, dashboard, etc.)
  - `services/` - Services and API clients
  - `shared/` - Shared components and utilities
  - `core/` - Core application components (header, footer, guards, etc.)
- `projects/` - Angular library projects
  - `dashboards/` - Dashboard widget library
  - `querybuilder/` - Query builder component library

## UUID Migration

All entity IDs have been migrated from numeric types to UUID strings to match the backend API. This includes:
- Portfolio IDs
- Screener IDs
- All related entity IDs (holdings, transactions, runs, etc.)

## API Integration

The frontend communicates with the backend API through:
- REST API endpoints under `/api/**`
- WebSocket connections for real-time data (if configured)

See `API_COMPATIBILITY_NOTES.md` for details on API contract compatibility.

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Clear Angular cache: `rm -rf .angular`
3. Rebuild: `npm run build`

### Proxy Issues

If API requests fail:
1. Verify backend is running on port 8080
2. Check `proxy.conf.json` configuration
3. Verify `environment.ts` has `apiUrl: '/api'`

## License

See repository root for license information.

