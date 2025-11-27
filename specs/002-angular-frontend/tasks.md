# Tasks: Angular Frontend Modulith Integration

**Input**: Design documents from `/specs/002-angular-frontend/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature focuses on integration and migration; tests are deferred to implementation verification through build and runtime checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create frontend modulith directory and copy source files from MoneyPlant frontend

- [ ] T001 Create frontend modulith directory at repository root in `frontend/`
- [ ] T002 Copy source files from `/home/raja/code/MoneyPlant/frontend` to `frontend/` excluding build artifacts (node_modules/, dist/, .angular/, *.log, .DS_Store, .idea/, .vscode/)
- [ ] T003 Install frontend dependencies by running `npm install` in `frontend/` directory
- [ ] T004 Verify frontend structure matches source application (compare directory structure excluding build artifacts)

**Phase 1 Checkpoint**: Verify frontend directory exists, source files copied, and dependencies installed. Run `cd frontend && npm list --depth=0` to verify dependencies. Commit with message: "feat(frontend): Setup frontend modulith - copy source files and install dependencies"

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create API proxy configuration file `frontend/proxy.conf.json` to proxy `/api/**` requests to `http://localhost:8080`
- [ ] T006 Update `frontend/angular.json` serve configuration to use proxy config and set port to 4200
- [ ] T007 Update `frontend/src/environments/environment.ts` to set `apiUrl: '/api'` (use proxy, not absolute URL)
- [ ] T008 Create frontend startup script `frontend/start-dev.sh` to start Angular dev server on port 4200 with proxy config
- [ ] T009 Create root-level coordinated startup script `start-all.sh` to start both backend and frontend services together
- [ ] T010 Make startup scripts executable (`chmod +x frontend/start-dev.sh` and `chmod +x start-all.sh`)

**Phase 2 Checkpoint**: Verify proxy configuration exists, Angular config updated, environment configured, and startup scripts created. Test that `cd frontend && ng serve --port 4200 --proxy-config proxy.conf.json` starts without errors (can cancel after verification). Commit with message: "feat(frontend): Configure development server, API proxy, and startup scripts"

---

## Phase 3: User Story 1 - Access Frontend Application (Priority: P1) 🎯 MVP

**Goal**: Users can access the frontend web application on port 4200 when both backend and frontend services are running

**Independent Test**: Start both services using `./start-all.sh`, navigate to http://localhost:4200 in browser, verify frontend loads and displays main interface. Test routing by navigating to `/portfolios` or `/dashboard` routes.

### Implementation for User Story 1

- [ ] T011 [US1] Verify frontend application builds successfully by running `cd frontend && npm run build` (should complete without errors)
- [ ] T012 [US1] Test frontend development server starts correctly by running `cd frontend && ng serve --port 4200 --proxy-config proxy.conf.json` (verify it starts, then cancel)
- [ ] T013 [US1] Verify static assets are served correctly by checking that JavaScript, CSS, and image files load with correct content types
- [ ] T014 [US1] Test client-side routing by navigating to frontend routes (e.g., `/portfolios`, `/dashboard`) and verifying routes load correctly
- [ ] T015 [US1] Verify frontend is accessible on port 4200 when both backend (port 8080) and frontend (port 4200) are running simultaneously

**Phase 3 Checkpoint**: Frontend application loads on port 4200, routes work correctly, static assets load. Build completes without errors/warnings. Commit with message: "feat(frontend): Enable frontend access on port 4200 with routing and static asset serving"

---

## Phase 4: User Story 2 - Frontend API Integration (Priority: P1)

**Goal**: Frontend successfully communicates with backend API endpoints to fetch and submit data without CORS errors

**Independent Test**: Start both services, open frontend in browser, navigate to a feature requiring API data (e.g., portfolio list), verify data loads from backend API. Check browser Network tab to confirm API requests reach `http://localhost:8080/api/**` and return data.

### Implementation for User Story 2

- [ ] T016 [US2] Verify API proxy configuration works by making a test API request from frontend and confirming it reaches backend on port 8080
- [ ] T017 [US2] Test API connectivity by navigating to a frontend feature that requires API data (e.g., portfolio list) and verifying data loads correctly
- [ ] T018 [US2] Verify API requests are properly routed without CORS errors by checking browser console and Network tab
- [ ] T019 [US2] Test API error handling by temporarily stopping backend and verifying frontend displays appropriate error messages
- [ ] T020 [US2] Document any API contract incompatibilities discovered between frontend service calls and backend API endpoints in `frontend/API_COMPATIBILITY_NOTES.md`

**Phase 4 Checkpoint**: Frontend successfully communicates with backend API, all API requests work correctly, no CORS errors. Build completes without errors/warnings. Commit with message: "feat(frontend): Enable API integration with backend - proxy configuration and connectivity verified"

---

## Phase 5: User Story 3 - UUID Migration and Data Model Updates (Priority: P1)

**Goal**: All frontend entity models, services, and components updated to use UUID strings instead of numeric IDs

**Independent Test**: Verify all entity interfaces use `string` for ID fields, all service methods accept/return UUID strings, API requests/responses use UUID format, and components handle UUID strings correctly. Check TypeScript compilation for type errors.

### Implementation for User Story 3

- [ ] T021 [US3] Search for all `id: number` or `id: bigint` in entity models in `frontend/src/app/entities/` and `frontend/src/app/services/entities/` and update to `id: string`
- [ ] T022 [P] [US3] Update Portfolio entity interface in `frontend/src/app/entities/portfolio.ts` (or equivalent) to use `id: string` instead of numeric ID
- [ ] T023 [P] [US3] Update Signal entity interface in `frontend/src/app/entities/signal.ts` (or equivalent) to use `signalId: string` instead of numeric ID
- [ ] T024 [P] [US3] Update BacktestRun entity interface in `frontend/src/app/entities/backtest-run.ts` (or equivalent) to use `runId: string` instead of numeric ID
- [ ] T025 [P] [US3] Update BacktestTrade entity interface in `frontend/src/app/entities/backtest-trade.ts` (or equivalent) to use `tradeId: string` instead of numeric ID
- [ ] T026 [P] [US3] Update Screener entity interface in `frontend/src/app/entities/screener.ts` (or equivalent) to use `id: string` instead of numeric ID
- [ ] T027 [P] [US3] Update ScreenerRun entity interface in `frontend/src/app/entities/screener-run.ts` (or equivalent) to use `runId: string` instead of numeric ID
- [ ] T028 [P] [US3] Update PortfolioTrade entity interface in `frontend/src/app/entities/portfolio-trade.ts` (or equivalent) to use `tradeId: string` instead of numeric ID
- [ ] T029 [P] [US3] Update OpenPosition entity interface in `frontend/src/app/entities/open-position.ts` (or equivalent) to use `positionId: string` instead of numeric ID
- [ ] T030 [P] [US3] Update PendingOrder entity interface in `frontend/src/app/entities/pending-order.ts` (or equivalent) to use `orderId: string` instead of numeric ID
- [ ] T031 [US3] Update all foreign key fields (e.g., `portfolioId`, `screenerId`, `runId`) in entity interfaces to use `string` type instead of numeric
- [ ] T032 [US3] Update all service methods in `frontend/src/app/services/` that accept or return entity IDs to use `string` type instead of numeric
- [ ] T033 [US3] Update API request/response DTOs in `frontend/src/app/services/apis/` to use UUID strings for all ID fields
- [ ] T034 [US3] Update all components in `frontend/src/app/features/` and `frontend/src/app/shared/` that display or manipulate entity IDs to work with UUID strings
- [ ] T035 [US3] Update Angular route parameters that use IDs to accept UUID strings (check route definitions in `frontend/src/app/app.routes.ts` and feature route files)
- [ ] T036 [US3] Remove any numeric ID parsing/formatting logic and replace with UUID string handling
- [ ] T037 [US3] Update ID comparison logic to use string comparison instead of numeric comparison
- [ ] T038 [US3] Add UUID validation utility function in `frontend/src/app/services/utils/uuid-validator.ts` (or equivalent) if needed
- [ ] T039 [US3] Search for "nse_" references in `frontend/src/` and remove/update to use new API endpoints (no nse_* table references)
- [ ] T040 [US3] Verify TypeScript compilation succeeds with no type errors: `cd frontend && npm run build` (should complete without errors/warnings)

**Phase 5 Checkpoint**: All entity models use UUID strings, all services updated, components handle UUIDs correctly, no nse_* references, TypeScript compilation succeeds. Build completes without errors/warnings. Commit with message: "feat(frontend): Migrate all entity models and services to use UUID strings instead of numeric IDs"

---

## Phase 6: User Story 4 - Frontend Application Structure Preservation (Priority: P2)

**Goal**: Verify frontend application structure is preserved and application builds successfully with all features functional

**Independent Test**: Compare directory structure with source application (excluding build artifacts), verify all source files present, build completes successfully, and all existing features work correctly after integration.

### Implementation for User Story 4

- [ ] T041 [US4] Compare directory structure of `frontend/` with source at `/home/raja/code/MoneyPlant/frontend` and verify all source files, components, services, and configuration files are present (excluding build artifacts)
- [ ] T042 [US4] Verify `frontend/package.json` and `frontend/package-lock.json` are present and match source application structure
- [ ] T043 [US4] Verify `frontend/angular.json` configuration is present and properly configured
- [ ] T044 [US4] Verify `frontend/tsconfig.json` and related TypeScript configuration files are present
- [ ] T045 [US4] Verify all Angular library projects (dashboards, querybuilder) are present in `frontend/projects/` if they exist in source
- [ ] T046 [US4] Run production build to verify build process completes successfully: `cd frontend && npm run build:prod` (should complete without errors/warnings)
- [ ] T047 [US4] Verify all API endpoint configurations in `frontend/src/environments/` point to correct backend endpoints (port 8080 or proxy)
- [ ] T048 [US4] Test that all existing frontend features work correctly after integration by manually testing key features (portfolios, screeners, dashboard, etc.)

**Phase 6 Checkpoint**: Frontend structure verified, build succeeds, all configuration correct, features functional. Build completes without errors/warnings. Commit with message: "feat(frontend): Verify structure preservation and successful build - all features functional"

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation, and cleanup

- [ ] T049 [P] Verify frontend loads within 3 seconds of both services starting (success criteria SC-001)
- [ ] T050 [P] Verify 100% of static assets load successfully (success criteria SC-002)
- [ ] T051 [P] Verify 100% of API requests reach backend and receive responses (success criteria SC-003)
- [ ] T052 [P] Verify all frontend routes (including deep links) load correctly without 404 errors (success criteria SC-004)
- [ ] T053 [P] Verify 100% of entity ID fields use UUID strings (success criteria SC-008)
- [ ] T054 [P] Verify all API interactions handle UUID-based identifiers without errors (success criteria SC-009)
- [ ] T055 [P] Verify frontend does not reference nse_* database tables (success criteria SC-010)
- [ ] T056 Run final build verification: `cd frontend && npm run build` (must complete without errors/warnings)
- [ ] T057 Run final TypeScript type check: `cd frontend && npx tsc --noEmit` (must complete without errors/warnings)
- [ ] T058 Update `frontend/README.md` (or create if missing) with setup instructions and usage information
- [ ] T059 Document any API contract differences discovered during integration in `frontend/API_COMPATIBILITY_NOTES.md` if not already documented

**Phase 7 Checkpoint**: All success criteria verified, build succeeds, documentation updated. Build completes without errors/warnings. Commit with message: "feat(frontend): Final verification and documentation - all success criteria met"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Depends on US1 for frontend to be accessible
  - User Story 3 (Phase 5): Can start after Foundational - Can run in parallel with US2 but should complete before US4
  - User Story 4 (Phase 6): Can start after Foundational - Depends on US1, US2, US3 completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Benefits from US1 but can be tested independently
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Critical for API functionality, should complete before US4
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Should verify all previous stories work together

### Within Each User Story

- Setup tasks before implementation
- Core implementation before integration
- Verification before moving to next phase
- Build verification and git commit after each phase completion

### Parallel Opportunities

- All Setup tasks (T001-T004) can run sequentially (copy must complete before install)
- Foundational tasks T005-T007 can run in parallel (different files)
- Entity interface updates in US3 (T022-T030) can run in parallel (different files)
- Service updates in US3 can run in parallel after entity updates complete
- Component updates in US3 can run in parallel after service updates complete
- Verification tasks in Phase 7 (T049-T055) can run in parallel

---

## Parallel Example: User Story 3 Entity Updates

```bash
# Launch all entity interface updates in parallel:
Task: "Update Portfolio entity interface in frontend/src/app/entities/portfolio.ts"
Task: "Update Signal entity interface in frontend/src/app/entities/signal.ts"
Task: "Update BacktestRun entity interface in frontend/src/app/entities/backtest-run.ts"
Task: "Update BacktestTrade entity interface in frontend/src/app/entities/backtest-trade.ts"
Task: "Update Screener entity interface in frontend/src/app/entities/screener.ts"
# ... etc for all entities
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently, verify build succeeds, commit changes
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (commit after each phase)
2. Add User Story 1 → Test independently → Build verification → Commit (MVP!)
3. Add User Story 2 → Test independently → Build verification → Commit
4. Add User Story 3 → Test independently → Build verification → Commit
5. Add User Story 4 → Test independently → Build verification → Commit
6. Each story adds value without breaking previous stories

### Build Verification & Git Commits

After each phase completion:
1. Run build verification: `cd frontend && npm run build` (must succeed without errors/warnings)
2. Run TypeScript type check: `cd frontend && npx tsc --noEmit` (must succeed without errors/warnings)
3. Test phase functionality manually to verify it works
4. Commit changes with appropriate summary message (see checkpoint messages above)
5. Only proceed to next phase after successful build and commit

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (frontend access)
   - Developer B: User Story 2 (API integration) - can start after US1 basic setup
   - Developer C: User Story 3 (UUID migration) - entity updates can be parallelized
3. Stories complete and integrate independently
4. Each developer commits their phase after build verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: After each phase, verify build succeeds without errors/warnings before committing
- **CRITICAL**: Commit changes after each phase with appropriate summary message
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Build verification commands:
  - `cd frontend && npm run build` - Full production build
  - `cd frontend && npx tsc --noEmit` - TypeScript type checking
  - `cd frontend && npm run build:prod` - Production build with optimizations

