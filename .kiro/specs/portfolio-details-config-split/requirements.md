# Requirements Document

## Introduction

This feature refactors the portfolio page in the Angular frontend to separate portfolio details from portfolio configuration settings. Currently, the "Configure" tab contains all portfolio information (name, description, risk profile, etc.). This refactoring will:

1. Create a new "Details" tab that contains the current portfolio information
2. Update the "Configure" tab to work with the `portfolio_config` table and its dedicated backend endpoints
3. Maintain all other existing tabs (Overview, Holdings, Trades) without changes

## Glossary

- **Portfolio**: A collection of investment holdings managed as a single unit
- **Portfolio Details**: Basic portfolio information (name, description, risk profile, currency, capital, etc.) stored in the `portfolio` table
- **Portfolio Configuration**: Trading and technical configuration settings (trading mode, signal intervals, entry/exit conditions, Redis settings, etc.) stored in the `portfolio_config` table
- **Frontend**: The Angular 20 application located in the `./frontend` directory
- **Backend**: The Java Spring Boot API that provides REST endpoints for portfolio operations
- **Tab Component**: A child component displayed within the portfolio page's tab interface

## Requirements

### Requirement 1

**User Story:** As a portfolio manager, I want to view and edit basic portfolio information in a dedicated "Details" tab, so that I can manage portfolio metadata separately from technical configuration.

#### Acceptance Criteria

1. WHEN the user selects a portfolio THEN the system SHALL display a "Details" tab as the second tab after "Overview"
2. WHEN the user clicks the "Details" tab THEN the system SHALL display all fields currently shown in the "Configure" component (name, description, base currency, risk profile, initial capital, current cash, strategy name, trading mode, demat account, is active, last signal check, created at, updated at)
3. WHEN the user modifies any field in the "Details" tab THEN the system SHALL enable the "Save" button and mark the form as dirty
4. WHEN the user clicks "Save" in the "Details" tab THEN the system SHALL call the existing portfolio update endpoint (PUT /api/portfolio/{id})
5. WHEN the save operation succeeds THEN the system SHALL display a success message and update the portfolio list

### Requirement 2

**User Story:** As a portfolio manager, I want to configure trading parameters in the "Configure" tab, so that I can manage technical settings for automated trading strategies.

#### Acceptance Criteria

1. WHEN the user clicks the "Configure" tab THEN the system SHALL display a form based on the `portfolio_config` table structure
2. WHEN the portfolio has no configuration THEN the system SHALL display default values from the PortfolioConfig entity
3. WHEN the user modifies any configuration field THEN the system SHALL enable the "Save Configuration" button
4. WHEN the user clicks "Save Configuration" THEN the system SHALL call POST /api/portfolio/{id}/config (if creating) or PUT /api/portfolio/{id}/config (if updating)
5. WHEN the configuration save succeeds THEN the system SHALL display a success message

### Requirement 3

**User Story:** As a portfolio manager, I want the "Configure" tab to organize settings into logical sections, so that I can easily find and modify specific configuration parameters.

#### Acceptance Criteria

1. WHEN the "Configure" tab loads THEN the system SHALL display configuration fields grouped into sections: Trading Configuration, Historical Cache Configuration, Redis Configuration, Entry Conditions, and Exit Conditions
2. WHEN displaying Trading Configuration THEN the system SHALL show fields: trading mode, signal check interval, lookback days, enable conditional logging, cache duration seconds, exchange, candle interval
3. WHEN displaying Historical Cache Configuration THEN the system SHALL show fields: enabled, lookback days, exchange, instrument type, candle interval, TTL seconds
4. WHEN displaying Redis Configuration THEN the system SHALL show fields: enabled, host, port, password, database, key prefix
5. WHEN displaying Entry Conditions THEN the system SHALL show fields: BB lower, RSI threshold, MACD turn positive, volume above average, fallback SMA period, fallback ATR multiplier
6. WHEN displaying Exit Conditions THEN the system SHALL show fields: take profit percentage, stop loss ATR multiplier, allow TP exits only

### Requirement 4

**User Story:** As a developer, I want the component structure to follow Angular best practices, so that the code is maintainable and testable.

#### Acceptance Criteria

1. WHEN creating the new "Details" component THEN the system SHALL create it as a standalone Angular component in the portfolios feature directory
2. WHEN refactoring the "Configure" component THEN the system SHALL update it to use the portfolio config API endpoints
3. WHEN implementing form handling THEN the system SHALL use Angular reactive forms or template-driven forms consistently
4. WHEN making API calls THEN the system SHALL use the existing service pattern with proper error handling
5. WHEN updating the parent component THEN the system SHALL maintain the existing tab navigation structure and lazy loading behavior

### Requirement 5

**User Story:** As a portfolio manager, I want proper validation and error handling, so that I can understand and correct any issues when saving changes.

#### Acceptance Criteria

1. WHEN required fields are empty THEN the system SHALL disable the save button and display validation messages
2. WHEN an API call fails THEN the system SHALL display a user-friendly error message with the failure reason
3. WHEN the backend is unavailable THEN the system SHALL display a message indicating the service is temporarily unavailable
4. WHEN validation fails on the backend THEN the system SHALL display the validation errors returned by the API
5. WHEN the user navigates away with unsaved changes THEN the system SHALL prompt for confirmation (optional enhancement)

### Requirement 6

**User Story:** As a portfolio manager, I want the tab order to be logical, so that I can navigate through portfolio information efficiently.

#### Acceptance Criteria

1. WHEN viewing the portfolio tabs THEN the system SHALL display tabs in this order: Overview, Details, Configure, Holdings, Trades
2. WHEN selecting a portfolio from the list THEN the system SHALL default to the "Overview" tab
3. WHEN creating a new portfolio THEN the system SHALL navigate to the "Details" tab
4. WHEN switching tabs THEN the system SHALL update the URL to support deep linking
5. WHEN loading a portfolio via deep link THEN the system SHALL display the correct tab based on the URL
