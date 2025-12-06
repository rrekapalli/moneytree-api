# Requirements Document

## Introduction

This feature enhances the Stock Insights Dashboard by replacing the static dashboard title with dynamic filter dropdowns for Exchange, Index (instrument_type), and Segment. These filters will allow users to dynamically filter the Stock List widget data from the kite_instrument_master table. The backend will provide cached endpoints for fetching distinct filter values and filtered instrument data.

## Glossary

- **Dashboard**: The Stock Insights Dashboard component that displays financial market data
- **Stock List Widget**: A table widget displaying a list of financial instruments (stocks, indices, etc.)
- **kite_instrument_master**: Database table containing master data for all tradable instruments
- **Exchange**: The trading exchange where instruments are listed (e.g., NSE, BSE, MCX)
- **Index**: The trading symbol of instruments in the INDICES segment (e.g., NIFTY 50, NIFTY BANK, NIFTY MIDCAP 50)
- **Segment**: The market segment classification (e.g., EQ for equity, FO for futures & options)
- **Filter Dropdown**: A UI select component allowing users to choose from available options
- **Cache**: Server-side temporary storage for frequently accessed data with time-based expiration
- **Backend API**: The Java Spring-based REST API service
- **Frontend Component**: The Angular-based dashboard UI component

## Requirements

### Requirement 1

**User Story:** As a trader, I want to filter instruments by Exchange, Index, and Segment using dropdown selectors in the dashboard header, so that I can quickly view relevant instruments without manual searching.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL display three dropdown filters in the header area: Exchange, Index, and Segment
2. WHEN the dashboard initializes THEN the system SHALL set default filter values to Exchange='NSE', Index='NIFTY 50', and Segment='EQ'
3. WHEN a user changes any filter dropdown value THEN the system SHALL update the Stock List widget with filtered instruments matching all selected criteria
4. WHEN filter values change THEN the system SHALL preserve the user's selection state during the session
5. WHEN all three filters are applied THEN the system SHALL display only instruments that match all three criteria simultaneously

### Requirement 2

**User Story:** As a system administrator, I want the backend to provide distinct Exchange, Index, and Segment values from the database, so that the frontend can populate filter dropdowns with valid options.

#### Acceptance Criteria

1. WHEN the frontend requests distinct exchange values THEN the backend SHALL execute "SELECT DISTINCT exchange FROM kite_instrument_master" and return the results
2. WHEN the frontend requests distinct index values THEN the backend SHALL execute "SELECT DISTINCT tradingsymbol FROM kite_instrument_master WHERE segment = 'INDICES'" and return the results
3. WHEN the frontend requests distinct segment values THEN the backend SHALL execute "SELECT DISTINCT segment FROM kite_instrument_master" and return the results
4. WHEN the backend queries distinct values THEN the system SHALL exclude NULL and empty string values from the results
5. WHEN the backend returns distinct values THEN the system SHALL sort the results alphabetically for consistent display

### Requirement 3

**User Story:** As a system architect, I want filter metadata endpoints to use server-side caching with weekly expiration, so that database load is minimized for rarely-changing reference data.

#### Acceptance Criteria

1. WHEN the backend receives a request for distinct filter values THEN the system SHALL check the cache before querying the database
2. WHEN cached filter values exist and are not expired THEN the system SHALL return cached data without database access
3. WHEN cached filter values do not exist or are expired THEN the system SHALL query the database and store results in cache with 7-day expiration
4. WHEN the cache stores filter values THEN the system SHALL use Spring Cache abstraction with appropriate cache configuration
5. WHEN the cache expires after 7 days THEN the system SHALL automatically refresh data on the next request

### Requirement 4

**User Story:** As a trader, I want the Stock List widget to display instruments filtered by my selected Exchange, Index, and Segment values, so that I see only relevant instruments for my trading strategy.

#### Acceptance Criteria

1. WHEN the Stock List widget loads THEN the system SHALL call the backend API with current filter values as query parameters
2. WHEN the backend receives filter parameters THEN the system SHALL query kite_instrument_master table with WHERE clauses matching all provided filters
3. WHEN filter parameters include Exchange, Index, and Segment THEN the system SHALL apply all three filters using AND logic
4. WHEN the backend returns filtered instruments THEN the system SHALL include fields: instrument_token, tradingsymbol, name, segment, exchange, instrument_type, last_price, lot_size, tick_size
5. WHEN the Stock List widget receives filtered data THEN the system SHALL display the instruments in the table with proper formatting

### Requirement 5

**User Story:** As a developer, I want the dashboard header component to support filter dropdowns, so that the UI can display and manage filter selections.

#### Acceptance Criteria

1. WHEN the dashboard header renders THEN the system SHALL display three dropdown components positioned horizontally in the header area
2. WHEN the dashboard header initializes THEN the system SHALL load available options for each dropdown from the backend API
3. WHEN a user interacts with a dropdown THEN the system SHALL display all available options in a scrollable list
4. WHEN a user selects a dropdown option THEN the system SHALL emit a filter change event to the parent dashboard component
5. WHEN filter options are loading THEN the system SHALL display a loading indicator in each dropdown

### Requirement 6

**User Story:** As a trader, I want the dashboard to maintain responsive performance when applying filters, so that I can quickly switch between different instrument views without delays.

#### Acceptance Criteria

1. WHEN a user changes a filter value THEN the system SHALL debounce the API request by 300 milliseconds to prevent excessive calls
2. WHEN the Stock List widget is loading filtered data THEN the system SHALL display a loading indicator to provide user feedback
3. WHEN the backend processes a filter request THEN the system SHALL return results within 2 seconds for datasets under 10,000 instruments
4. WHEN multiple filter changes occur rapidly THEN the system SHALL cancel pending requests and execute only the most recent filter combination
5. WHEN the filtered result set is empty THEN the system SHALL display a user-friendly message indicating no instruments match the criteria

### Requirement 7

**User Story:** As a system architect, I want proper error handling for filter operations, so that users receive clear feedback when issues occur.

#### Acceptance Criteria

1. WHEN the backend fails to fetch distinct filter values THEN the system SHALL return an HTTP 500 error with a descriptive error message
2. WHEN the backend fails to fetch filtered instruments THEN the system SHALL return an HTTP 500 error with a descriptive error message
3. WHEN the frontend receives an error response THEN the system SHALL display a user-friendly error notification
4. WHEN a network error occurs during filter operations THEN the system SHALL retry the request up to 2 times with exponential backoff
5. WHEN all retry attempts fail THEN the system SHALL display an error message and maintain the previous data state

### Requirement 8

**User Story:** As a developer, I want the filter implementation to follow existing code patterns and architecture, so that the codebase remains maintainable and consistent.

#### Acceptance Criteria

1. WHEN implementing backend endpoints THEN the system SHALL use Spring Boot REST controller patterns consistent with existing controllers
2. WHEN implementing caching THEN the system SHALL use Spring Cache annotations (@Cacheable) with appropriate cache names
3. WHEN implementing frontend services THEN the system SHALL use Angular HttpClient with RxJS observables consistent with existing API services
4. WHEN implementing UI components THEN the system SHALL use PrimeNG components consistent with the existing dashboard design system
5. WHEN implementing data models THEN the system SHALL create TypeScript interfaces and Java DTOs following existing naming conventions
