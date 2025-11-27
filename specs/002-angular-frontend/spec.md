# Feature Specification: Frontend Application Integration

**Feature Branch**: `002-angular-frontend`  
**Created**: 2025-11-27  
**Status**: Draft  
**Input**: User description: "createa new modulith in this project called 'frontend' to contain an angular (V20) application. This application should be copied from '/home/raja/code/MoneyPlant/frontend' as it is since it's developed using the same './backend' api (older version). The applciation should be configured as a static resource in './backend' so that when we run backend applciation this front end is also available, and should be accessible on port 4200,. This applciation uses api end points from './backend' project. Check the actual implementation and how it is integrated in the '/home/raja/code/MoneyPlant/backend' project and implement here in a similar (or better) way."

## Clarifications

### Session 2025-11-27

- Q: Should the frontend integration preserve the existing authentication/authorization from the source application, or are there new security requirements? → A: No authentication required (development-only, unauthenticated access)
- Q: If API contract incompatibilities are discovered during integration, how should they be handled? → A: Document incompatibilities and update frontend to match new backend API
- Q: What should be included or excluded when copying the frontend application from the source location? → A: Copy source files only, exclude build artifacts (dist/, node_modules/, .angular/) and install dependencies fresh
- Q: How should the frontend and backend applications be started - independently or with coordination? → A: Coordinated startup - provide scripts/tools to start both services together
- Q: Additional requirement - Database ID migration: All entities, services, etc. must be updated to use UUIDs instead of long/bigint IDs, and nse_* tables should not be used (kept only for backward compatibility)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Frontend Application (Priority: P1)

Users need to access the frontend web application through a web browser when the backend application is running. The frontend should be available as a unified application alongside the backend API, allowing users to interact with the trading system through a web interface.

**Why this priority**: This is the foundational requirement - without the frontend being accessible, no other functionality can be used. Users must be able to reach the application to perform any trading or portfolio management tasks.

**Independent Test**: Can be fully tested by using the provided startup scripts/tools to start both the backend application and frontend development server together, then navigating to the frontend URL (port 4200) in a web browser. The frontend should load and display the application interface.

**Acceptance Scenarios**:

1. **Given** both the backend application and frontend development server are running, **When** a user navigates to the frontend URL on port 4200, **Then** the frontend application loads and displays the main interface
2. **Given** both the backend application and frontend development server are running, **When** a user navigates to a frontend route (e.g., `/portfolios`, `/dashboard`), **Then** the client-side router handles the route and displays the appropriate component
3. **Given** both the backend application and frontend development server are running, **When** a user requests a static asset (e.g., JavaScript, CSS, images), **Then** the asset is served correctly with appropriate content types

---

### User Story 2 - Frontend API Integration (Priority: P1)

The frontend web application must successfully communicate with the backend API endpoints to fetch and submit data. All API calls from the frontend should reach the backend API and receive appropriate responses.

**Why this priority**: The frontend is not useful without API connectivity. Users need to view portfolio data, execute trades, and interact with market data through the frontend, all of which require successful API communication.

**Independent Test**: Can be fully tested by opening the frontend application, navigating to a feature that requires API data (e.g., portfolio list), and verifying that data loads correctly from the backend API endpoints.

**Acceptance Scenarios**:

1. **Given** the frontend is loaded and the backend API is running, **When** the frontend makes an API request to fetch portfolio data, **Then** the request reaches the backend API and returns the expected data
2. **Given** the frontend is loaded and the backend API is running, **When** the frontend makes an API request to submit a trade, **Then** the request is processed by the backend and the frontend receives a success or error response
3. **Given** the frontend is loaded, **When** the frontend makes API requests, **Then** all requests are routed to the correct backend API endpoints without CORS errors

---

### User Story 3 - UUID Migration and Data Model Updates (Priority: P1)

The frontend application must be updated to work with the new database schema where all entity IDs have been migrated from long/bigint to UUIDs. All entities, services, and data models in the frontend must be updated to reflect this change.

**Why this priority**: This is a critical data model change that affects all data operations. Without updating the frontend to use UUIDs, the application will not be able to correctly interact with the backend API that now uses UUID-based identifiers.

**Independent Test**: Can be fully tested by verifying that all entity models, service methods, and API interactions use UUID strings instead of numeric IDs, and that the frontend correctly handles UUID values from the backend API.

**Acceptance Scenarios**:

1. **Given** the frontend modulith is created, **When** examining entity models and service interfaces, **Then** all ID fields are defined as UUID strings (not numeric types)
2. **Given** the frontend is integrated with the backend, **When** the frontend receives API responses containing entity IDs, **Then** all IDs are UUID strings and are correctly handled by the frontend
3. **Given** the frontend makes API requests that include entity IDs, **When** the requests are sent to the backend, **Then** all IDs are sent as UUID strings in the correct format
4. **Given** the frontend application is running, **When** users interact with entities (view, create, update, delete), **Then** all operations correctly use UUID-based identifiers

---

### User Story 4 - Frontend Application Structure Preservation (Priority: P2)

The frontend web application should be copied from the source location with its complete structure, dependencies, and configuration preserved. After copying, the application must be updated to work with the new backend API and database schema.

**Why this priority**: Preserving the existing application structure ensures that all features, components, and functionality continue to work without requiring modifications. This reduces risk and development time.

**Independent Test**: Can be fully tested by comparing the copied frontend structure with the source, verifying that all source files, configuration files, and dependencies are present, and confirming that the application builds successfully.

**Acceptance Scenarios**:

1. **Given** the frontend modulith is created, **When** comparing the directory structure with the source application, **Then** all source files, components, services, and configuration files are present (excluding build artifacts and dependencies)
2. **Given** the frontend modulith is created, **When** building the frontend application, **Then** the build completes successfully without errors
3. **Given** the frontend modulith is created, **When** examining the application configuration, **Then** all API endpoint configurations point to the correct backend endpoints

---

### Edge Cases

- What happens when the backend API is unavailable but the frontend is served? The frontend should display appropriate error messages to users
- How does the system handle frontend routes that don't exist? The client-side router should handle 404 cases and redirect appropriately
- What happens when static assets (JS, CSS) fail to load? The frontend should gracefully handle missing assets and provide user feedback
- How does the system handle API requests that return errors? The frontend should display error messages and allow users to retry or navigate away
- What happens when users navigate directly to a deep frontend route (e.g., `/portfolios/123`)? The backend should serve the main HTML file to allow client-side routing to handle it
- How does the system handle concurrent requests for the same static resource? The backend should serve static resources efficiently without blocking
- What happens when API contract incompatibilities are discovered? Incompatibilities are documented and the frontend is updated to match the new backend API contract
- What happens if the frontend tries to use numeric IDs instead of UUIDs? The frontend must be updated to use UUID strings for all entity identifiers
- What happens if the frontend references nse_* tables? The frontend must not use nse_* tables; only the new database schema (with UUID-based IDs) should be used

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create a new modulith directory called 'frontend' in the project root
- **FR-002**: System MUST copy source files from '/home/raja/code/MoneyPlant/frontend' to the new 'frontend' modulith directory, preserving source code, configuration files, and directory structure, but excluding build artifacts (dist/, node_modules/, .angular/, and similar generated directories)
- **FR-015**: System MUST install frontend dependencies fresh in the new location using the dependency management tool (e.g., npm install)
- **FR-003**: System MUST configure the frontend development server to run on port 4200
- **FR-004**: System MUST configure the frontend development server to proxy API requests to the backend application running on port 8080
- **FR-005**: System MUST ensure the frontend development server can run as a separate process alongside the backend application
- **FR-006**: System MUST configure the frontend application to use API endpoints from the backend project (running on port 8080)
- **FR-007**: System MUST ensure the frontend application is accessible on port 4200 when both the frontend development server and backend application are running
- **FR-008**: System MUST handle client-side router deep links correctly when accessing the frontend on port 4200
- **FR-009**: System MUST preserve the frontend application's existing functionality, features, and user interface
- **FR-010**: System MUST ensure API requests from the frontend (on port 4200) are properly routed to backend endpoints (on port 8080) without CORS errors
- **FR-011**: System MUST support hot-reload functionality during development when using the separate frontend development server
- **FR-012**: System MUST allow unauthenticated access to the frontend application during development (no authentication required)
- **FR-013**: System MUST document any API contract incompatibilities discovered between the frontend and backend
- **FR-014**: System MUST update the frontend application to match the new backend API contract when incompatibilities are found
- **FR-016**: System MUST provide scripts or tools to start both the frontend development server and backend application together in a coordinated manner
- **FR-017**: System MUST update all frontend entity models to use UUID strings instead of long/bigint numeric IDs
- **FR-018**: System MUST update all frontend services to handle UUID-based entity identifiers in all operations (create, read, update, delete, list)
- **FR-019**: System MUST ensure the frontend does not reference or use nse_* database tables (these tables are kept only for backward compatibility and should not be used)
- **FR-020**: System MUST update all API request/response handling to work with UUID-based entity identifiers
- **FR-021**: System MUST update all frontend components that display or manipulate entity IDs to work with UUID strings

### Key Entities *(include if feature involves data)*

- **Frontend Modulith**: The directory structure containing the frontend web application source code, configuration files, and build outputs
- **Frontend Development Server**: A separate process that serves the frontend application on port 4200 during development, providing hot-reload capabilities
- **Frontend Routes**: Client-side application routes that are handled by the frontend router
- **API Endpoints**: Backend REST API endpoints (on port 8080) that the frontend consumes for data operations
- **API Proxy**: Configuration that routes API requests from the frontend development server to the backend application
- **Entity IDs**: All entity identifiers in the database and API use UUID strings instead of numeric long/bigint IDs
- **Database Schema**: The new database schema uses UUID-based primary keys; nse_* tables exist for backward compatibility but are not used in this implementation

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access the frontend application on port 4200 within 3 seconds of both the frontend development server and backend application starting
- **SC-002**: 100% of frontend static assets (JavaScript, CSS, images) load successfully when the frontend application is accessed
- **SC-003**: 100% of API requests from the frontend successfully reach the backend API endpoints and receive responses
- **SC-004**: Users can navigate to any frontend route (including deep links) and the application loads correctly without 404 errors
- **SC-005**: The frontend application displays and functions identically to the source application when integrated with the backend
- **SC-006**: The frontend build process completes successfully and produces assets that can be served by the backend
- **SC-007**: All existing frontend features and functionality work correctly after integration with the backend
- **SC-008**: 100% of entity ID fields in the frontend use UUID strings (not numeric types)
- **SC-009**: All API interactions correctly handle UUID-based entity identifiers without errors
- **SC-010**: The frontend does not reference or attempt to use nse_* database tables

## Assumptions

- The source frontend web application at '/home/raja/code/MoneyPlant/frontend' is a complete, working application
- The frontend application includes a development server that can run on port 4200
- The frontend development server supports API proxying to route requests to the backend on port 8080
- The frontend application's API endpoint configuration can be updated to point to the backend API endpoints (port 8080)
- If API contract incompatibilities exist between the frontend and backend, they will be documented and the frontend will be updated to match the new backend API contract
- The database schema has been migrated from long/bigint IDs to UUIDs for all entities; the frontend must be updated to reflect this change
- nse_* tables exist in the database for backward compatibility but should not be used in this implementation; the frontend must use the new schema with UUID-based IDs
- Build tools are available in the build environment for building and running the frontend application
- CORS configuration allows the frontend on port 4200 to communicate with the backend on port 8080, or the frontend development server can proxy requests to avoid CORS issues
- The frontend application's environment configuration can be adjusted to work with the new backend
- Only source files and configuration files are copied from the source location; build artifacts and dependencies are excluded and installed fresh in the new location
- Both the frontend development server and backend application can run simultaneously on the same machine
- No authentication or authorization is required for this development setup (unauthenticated access is acceptable)

## Dependencies

- Existing backend modulith application must be functional and running on port 8080
- Source frontend web application at '/home/raja/code/MoneyPlant/frontend' must be accessible and complete
- Frontend development server must be available and configurable to run on port 4200
- Frontend development server must support API proxying to route requests to backend on port 8080
- Frontend build tools and dependencies
- Build environment tools for building and running the frontend application

## Notes

- The frontend will be served on port 4200 as a separate development server process, running alongside the backend application on port 8080. This allows for hot-reload during development and matches the typical Angular development workflow.
- The frontend development server will proxy API requests to the backend application on port 8080, ensuring seamless communication between frontend and backend.
- The integration approach should follow or improve upon the implementation in '/home/raja/code/MoneyPlant/backend', adapting it for the separate development server setup rather than static resource serving.
- For production deployments, a separate build and static resource serving strategy may be needed, but this specification focuses on the development setup with port 4200.
- This is a development-only setup with no authentication requirements. Production deployments would require separate security considerations.
- If API contract differences are discovered between the source frontend and the new backend, they will be documented and the frontend will be updated to align with the new backend API rather than modifying the backend to match the old frontend expectations.
- When copying the frontend application, only source files and configuration files are copied. Build artifacts (dist/, .angular/, etc.) and dependencies (node_modules/) are excluded and will be generated/installed fresh in the new location.
- Startup scripts or tools are provided to coordinate starting both the frontend development server and backend application together, simplifying the development workflow.
- All entity models, services, and data handling in the frontend must be updated to use UUID strings instead of numeric IDs to match the new database schema. This includes updating TypeScript interfaces, service methods, API request/response handling, and any components that display or manipulate entity IDs.
- The frontend must not reference or use nse_* database tables. These tables are kept in the database for backward compatibility but are not part of this implementation. All data operations must use the new schema with UUID-based identifiers.
