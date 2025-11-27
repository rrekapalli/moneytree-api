# Research: Angular Frontend Modulith Integration

**Feature**: `002-angular-frontend`  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions & Findings

### 1. Angular V20 Development Server Configuration

**Question**: How to configure Angular development server to run on port 4200 and proxy API requests to backend on port 8080?

**Decision**: Use Angular CLI's built-in development server with proxy configuration file.

**Rationale**: 
- Angular CLI (`ng serve`) natively supports proxy configuration via `proxy.conf.json`
- This is the standard approach for Angular development and avoids CORS issues
- The proxy configuration can route `/api/**` requests to `http://localhost:8080`
- Port 4200 is the default Angular development server port and can be explicitly configured

**Alternatives Considered**:
- CORS configuration on backend: Would require backend changes and is less flexible
- Reverse proxy (nginx): Adds unnecessary complexity for development setup
- Webpack dev server proxy: Angular CLI already uses this under the hood

**Implementation Notes**:
- Create `proxy.conf.json` in frontend root with configuration to proxy `/api/**` to `http://localhost:8080`
- Update `angular.json` serve configuration to use proxy config
- Use `ng serve --port 4200 --proxy-config proxy.conf.json` or configure in `angular.json`

### 2. Coordinated Startup Scripts

**Question**: How to create scripts that start both frontend and backend services together?

**Decision**: Create shell scripts at both frontend level and repository root level using background processes.

**Rationale**:
- Shell scripts are portable and work across Unix-like systems
- Can use background processes (`&`) to run both services concurrently
- Can capture process IDs for graceful shutdown
- Simple and maintainable approach

**Alternatives Considered**:
- Docker Compose: Adds containerization overhead, not needed for development
- Process managers (PM2, Foreman): Additional dependency, overkill for two services
- npm scripts with concurrently: Requires npm at root level, less flexible

**Implementation Notes**:
- Create `frontend/start-dev.sh` that starts Angular dev server
- Create `start-all.sh` at repository root that starts both backend and frontend
- Use `&` to run processes in background
- Capture PIDs for potential cleanup/shutdown functionality
- Ensure proper error handling if one service fails to start

### 3. UUID Migration Strategy for Frontend

**Question**: How to systematically update all entity models and services from numeric IDs to UUID strings?

**Decision**: Use TypeScript type system and systematic search/replace approach with validation.

**Rationale**:
- TypeScript's type system will catch type mismatches during compilation
- Systematic approach ensures consistency across all entities
- Can use grep/search tools to find all ID references
- Update entity interfaces first, then services, then components

**Alternatives Considered**:
- Automated migration script: Risk of missing edge cases, manual review still needed
- Gradual migration: Would create inconsistency and complexity
- Type aliases: Doesn't solve the runtime value issue

**Implementation Notes**:
- Search for all `id: number` or `id: bigint` in entity models
- Replace with `id: string` (UUIDs are strings)
- Update all service methods that accept/return IDs
- Update API request/response DTOs
- Update components that display or manipulate IDs
- Add validation to ensure UUID format where needed
- Test all CRUD operations with UUID values

### 4. Source File Copy Strategy

**Question**: How to copy source files while excluding build artifacts and dependencies?

**Decision**: Use `rsync` or `cp` with exclusion patterns, then run `npm install` in new location.

**Rationale**:
- `rsync` with `--exclude` patterns is efficient and reliable
- Standard approach for copying project files
- Fresh `npm install` ensures dependencies match current environment
- Excludes: `node_modules/`, `dist/`, `.angular/`, `*.log`, `.DS_Store`, etc.

**Alternatives Considered**:
- Git clone: Source is not a git repository or would require different approach
- Manual copy: Error-prone and time-consuming
- Archive/extract: Unnecessary complexity

**Implementation Notes**:
- Use `rsync -av --exclude` or `cp -r` with find to exclude patterns
- Exclude: `node_modules/`, `dist/`, `.angular/`, `*.log`, `.DS_Store`, `.idea/`, `.vscode/`
- Copy all source files, configuration files, and project structure
- After copy, run `npm install` in new location
- Verify `package.json` and `package-lock.json` are copied

### 5. API Contract Compatibility

**Question**: How to identify and handle API contract differences between source frontend and new backend?

**Decision**: Systematic comparison of API endpoints, request/response shapes, and documentation.

**Rationale**:
- Need to identify differences before integration
- Backend API documentation (OpenAPI/Swagger) can be compared with frontend service calls
- Update frontend to match new backend API contract
- Document all incompatibilities for reference

**Alternatives Considered**:
- Modify backend to match frontend: Violates requirement to update frontend to match backend
- Create adapter layer: Adds unnecessary complexity
- Ignore differences: Will cause runtime errors

**Implementation Notes**:
- Review backend API documentation (OpenAPI/Swagger at `/swagger-ui.html`)
- Compare with frontend service methods and API calls
- Identify differences in:
  - Endpoint URLs
  - Request/response shapes
  - HTTP methods
  - Status codes
  - Error response formats
- Document all differences in integration notes
- Update frontend services to match new API contract

### 6. nse_* Table Exclusion

**Question**: How to ensure frontend does not reference nse_* tables?

**Decision**: Search codebase for nse_* references and remove/update them to use new schema endpoints.

**Rationale**:
- nse_* tables are kept for backward compatibility but not used
- Frontend should only call backend API endpoints, not access tables directly
- Need to find any hardcoded references to nse_* table names or endpoints
- Update to use new API endpoints that use UUID-based schema

**Alternatives Considered**:
- Leave nse_* references: Violates requirement
- Add runtime checks: Unnecessary if code is properly updated

**Implementation Notes**:
- Search for "nse_" in frontend codebase
- Check for any API endpoint references that include "nse"
- Update to use new backend API endpoints
- Ensure all data operations go through backend API, not direct table access
- Frontend should never have database table names in code

## Technology Decisions

### Angular V20
- **Decision**: Use Angular V20 as specified
- **Rationale**: Matches source application version, ensures compatibility
- **Version**: Angular 20.3.3 (from source application)

### Development Server Port
- **Decision**: Port 4200 for frontend, port 8080 for backend
- **Rationale**: Standard Angular dev server port, backend already on 8080
- **Configuration**: Via `angular.json` and `proxy.conf.json`

### Proxy Configuration
- **Decision**: Use Angular CLI proxy configuration
- **Rationale**: Built-in, well-documented, avoids CORS issues
- **File**: `proxy.conf.json` in frontend root

### Startup Coordination
- **Decision**: Shell scripts with background processes
- **Rationale**: Simple, portable, no additional dependencies
- **Files**: `frontend/start-dev.sh`, `start-all.sh` at root

## Integration Points

### Backend API
- **Base URL**: `http://localhost:8080`
- **API Prefix**: `/api/**`
- **Endpoints**: All backend REST API endpoints (portfolio, screener, backtest, signal, marketdata)
- **Authentication**: None required for development setup

### Database Schema
- **ID Type**: UUID strings (not numeric)
- **Tables**: Use new schema with UUID-based primary keys
- **Excluded**: nse_* tables (backward compatibility only, not used)

## Open Questions Resolved

All technical questions from the specification have been resolved through research. No remaining NEEDS CLARIFICATION items.

## References

- Angular CLI Proxy Configuration: https://angular.io/guide/build#proxying-to-a-backend-server
- Angular Development Server: https://angular.io/cli/serve
- TypeScript UUID Types: Standard string type for UUID values
- Shell Scripting for Process Management: Standard Unix background processes

