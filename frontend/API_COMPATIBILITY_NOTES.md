# API Compatibility Notes

This document tracks API contract differences discovered during frontend integration.

## Path Mismatches

### Portfolio API
- **Frontend expects**: `/api/v1/portfolio`
- **Backend provides**: `/api/portfolio`
- **Issue**: Frontend API service paths include `/api` prefix, but `apiUrl` is already set to `/api`, causing double `/api` in URLs
- **Status**: Needs update - paths should be `/portfolio` (without `/api` prefix) since `apiUrl` already includes `/api`

### API Versioning
- **Frontend uses**: `/api/v1/...` paths
- **Backend uses**: `/api/...` paths (no version prefix)
- **Status**: Frontend paths need to be updated to remove `/v1` prefix

## ID Type Mismatches

### Portfolio IDs
- **Frontend expects**: `number` type
- **Backend provides**: `UUID` (string) type
- **Status**: Will be fixed in Phase 5 (UUID migration)

### Other Entity IDs
- All entity IDs in frontend are currently `number` type
- Backend uses UUID strings for all entity IDs
- **Status**: Will be fixed in Phase 5 (UUID migration)

## Recommendations

1. Update all API service paths to:
   - Remove `/api` prefix (since `apiUrl` already includes it)
   - Remove `/v1` version prefix to match backend
   - Example: Change `/api/v1/portfolio` to `/portfolio`

2. Update all ID types from `number` to `string` (UUID) in:
   - Entity interfaces
   - Service method parameters and return types
   - Component properties and route parameters

3. Test all API endpoints after path and ID type updates

