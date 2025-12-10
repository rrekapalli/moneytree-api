# Requirements Document

## Introduction

This specification defines the integration of the `/ws/indices/all` WebSocket endpoint into the Angular dashboard's overall component. The feature will enable real-time streaming of all NSE indices data to automatically update the Index List widget without requiring manual refresh or individual index subscriptions.

## Glossary

- **WebSocket**: A communication protocol providing full-duplex communication channels over a single TCP connection
- **STOMP**: Simple Text Oriented Messaging Protocol used for WebSocket messaging
- **Overall Component**: The Angular component (`overall.component.ts`) that displays the financial dashboard with index data
- **Index List Widget**: The stock list table widget displaying all available NSE indices
- **SocketEngine**: The backend WebSocket server module that streams real-time market data
- **Subscription**: A WebSocket topic subscription that receives real-time data updates
- **Component Lifecycle**: Angular component initialization and destruction phases
- **Angular Signals**: Angular v20's reactive primitive for managing state changes and automatic UI updates
- **Signal**: A reactive value container that notifies consumers when its value changes
- **Computed Signal**: A derived signal that automatically recomputes when its dependencies change
- **Effect**: A side effect that runs when signal dependencies change

## Requirements

### Requirement 1

**User Story:** As a dashboard user, I want to see real-time updates of all NSE indices in the Index List widget, so that I can monitor market movements without manual refresh.

#### Acceptance Criteria

1. WHEN the overall component initializes THEN the system SHALL display existing fallback data from REST API immediately
2. WHEN the WebSocket connection is established THEN the system SHALL subscribe to the `/topic/nse-indices` topic for all indices data
3. WHEN indices data is received via WebSocket THEN the system SHALL update the Index List widget by merging with existing fallback data
4. WHEN the user navigates away from the dashboard THEN the system SHALL unsubscribe from the WebSocket topic
5. WHEN the user closes the application THEN the system SHALL disconnect the WebSocket connection

### Requirement 2

**User Story:** As a developer, I want the WebSocket subscription to be managed within the component lifecycle, so that resources are properly allocated and cleaned up.

#### Acceptance Criteria

1. WHEN the component enters the `ngOnInit` lifecycle hook THEN the system SHALL initiate the WebSocket connection
2. WHEN the component enters the `ngOnDestroy` lifecycle hook THEN the system SHALL clean up all WebSocket subscriptions
3. WHEN the WebSocket connection fails THEN the system SHALL log the error and continue displaying cached or fallback data
4. WHEN multiple components attempt to connect simultaneously THEN the system SHALL reuse the existing WebSocket connection
5. WHEN the component is destroyed THEN the system SHALL ensure no memory leaks from active subscriptions

### Requirement 3

**User Story:** As a dashboard user, I want the Index List widget to display real-time price changes with visual indicators, so that I can quickly identify market trends.

#### Acceptance Criteria

1. WHEN an index price increases THEN the system SHALL display the change with a positive indicator
2. WHEN an index price decreases THEN the system SHALL display the change with a negative indicator
3. WHEN indices data is updated via WebSocket THEN the system SHALL preserve the currently selected index highlighting
4. WHEN the WebSocket provides updated data THEN the system SHALL merge it with existing data without losing user context
5. WHEN the data update occurs THEN the system SHALL use Angular signals to automatically propagate changes to the UI

### Requirement 4

**User Story:** As a system administrator, I want the WebSocket integration to handle connection failures gracefully, so that the dashboard remains functional during network issues.

#### Acceptance Criteria

1. WHEN the WebSocket connection fails to establish THEN the system SHALL continue displaying the existing fallback data from REST API
2. WHEN the WebSocket connection is lost THEN the system SHALL attempt automatic reconnection with exponential backoff
3. WHEN reconnection attempts exceed the maximum limit THEN the system SHALL stop attempting and continue with fallback data only
4. WHEN the WebSocket reconnects successfully THEN the system SHALL resubscribe to the `/topic/nse-indices` topic
5. WHEN operating without WebSocket connection THEN the system SHALL continue to function normally with fallback data

### Requirement 5

**User Story:** As a developer, I want the WebSocket data to be properly typed and validated, so that the application handles data consistently and safely.

#### Acceptance Criteria

1. WHEN WebSocket data is received THEN the system SHALL parse it using the existing `parseStompMessageToJson` utility
2. WHEN the parsed data is processed THEN the system SHALL validate it against the `IndicesDto` interface
3. WHEN invalid data is received THEN the system SHALL log a warning and skip the update
4. WHEN the data structure changes THEN the system SHALL handle missing fields with default values
5. WHEN mapping WebSocket data to widget format THEN the system SHALL use the existing `mapIndicesToStockData` method

### Requirement 6

**User Story:** As a dashboard user, I want the system to efficiently handle high-frequency data updates, so that the UI remains responsive and doesn't freeze.

#### Acceptance Criteria

1. WHEN WebSocket data arrives at high frequency THEN the system SHALL use Angular signals to efficiently propagate updates
2. WHEN multiple data updates arrive rapidly THEN the system SHALL leverage signal batching for optimal performance
3. WHEN the UI is updating THEN the system SHALL not block user interactions with the dashboard
4. WHEN computed signals depend on WebSocket data THEN the system SHALL automatically recompute derived values
5. WHEN signal values change THEN the system SHALL trigger minimal, targeted UI updates only for affected components

### Requirement 7

**User Story:** As a developer, I want to use Angular v20 signals for reactive state management, so that the UI automatically updates when WebSocket data changes.

#### Acceptance Criteria

1. WHEN the component initializes THEN the system SHALL create a signal to hold the indices data array
2. WHEN WebSocket data is received THEN the system SHALL update the signal value using the `set()` or `update()` method
3. WHEN the indices signal changes THEN the system SHALL automatically trigger UI updates without manual change detection
4. WHEN derived data is needed THEN the system SHALL use computed signals to transform the indices data
5. WHEN side effects are required THEN the system SHALL use the `effect()` function to react to signal changes

### Requirement 8

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN a WebSocket error occurs THEN the system SHALL log the error with context information
2. WHEN data parsing fails THEN the system SHALL log the raw message and the parsing error
3. WHEN subscription fails THEN the system SHALL log the topic name and error details
4. WHEN the connection state changes THEN the system SHALL log the state transition
5. WHEN operating in debug mode THEN the system SHALL provide verbose logging of all WebSocket operations
