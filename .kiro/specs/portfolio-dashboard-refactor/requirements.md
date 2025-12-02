# Requirements Document

## Introduction

This document outlines the requirements for refactoring the Portfolios component to provide an enhanced user experience with a two-panel layout, improved portfolio management capabilities, and comprehensive integration with backend APIs for portfolios, holdings, and trades.

## Glossary

- **Portfolios Component**: The main interface for managing investment portfolios
- **Portfolio**: A collection of investment holdings with associated configuration and performance metrics
- **Holding**: A specific stock position within a portfolio, including quantity and cost basis
- **Trade**: A completed buy/sell transaction record for portfolio analysis
- **Risk Profile**: The investment risk tolerance level (Conservative, Moderate, Aggressive)
- **Rebalancing Strategy**: The automated approach for maintaining target portfolio allocation
- **Risk Tolerance**: The acceptable level of portfolio volatility
- **Execution Preferences**: Settings for automated trading and notifications
- **Tax Harvesting**: Strategy for optimizing tax implications of trades

## Requirements

### Requirement 1

**User Story:** As a portfolio manager, I want to view all my portfolios in a sidebar list, so that I can quickly navigate between different portfolios.

#### Acceptance Criteria

1. WHEN the Portfolios component loads THEN the system SHALL display a left sidebar containing all portfolios
2. WHEN portfolios are displayed in the sidebar THEN the system SHALL show portfolio name, description, total return percentage, stock count, outperformance, last execution date, and status for each portfolio
3. WHEN a user clicks on a portfolio in the sidebar THEN the system SHALL display that portfolio's details in the right panel
4. WHEN the sidebar displays portfolios THEN the system SHALL highlight the currently selected portfolio
5. WHEN the sidebar contains multiple portfolios THEN the system SHALL provide a search input to filter portfolios by name

### Requirement 2

**User Story:** As a portfolio manager, I want to see summary statistics at the top of the page, so that I can quickly understand my portfolio distribution.

#### Acceptance Criteria

1. WHEN the Portfolios component loads THEN the system SHALL display summary cards showing total portfolios count
2. WHEN the Portfolios component loads THEN the system SHALL display summary cards showing active portfolios count
3. WHEN the Portfolios component loads THEN the system SHALL display summary cards showing conservative portfolios count
4. WHEN the Portfolios component loads THEN the system SHALL display summary cards showing moderate portfolios count
5. WHEN the Portfolios component loads THEN the system SHALL display summary cards showing aggressive portfolios count

### Requirement 3

**User Story:** As a portfolio manager, I want to view portfolio details in multiple tabs, so that I can access different aspects of portfolio information efficiently.

#### Acceptance Criteria

1. WHEN a portfolio is selected THEN the system SHALL display tabs for Overview, Configure, Holdings, and Trades
2. WHEN the Configure tab is active THEN the system SHALL display portfolio configuration options
3. WHEN the Holdings tab is active THEN the system SHALL display current portfolio holdings
4. WHEN the Trades tab is active THEN the system SHALL display completed trade history
5. WHEN a user switches tabs THEN the system SHALL preserve the selected portfolio context

### Requirement 4

**User Story:** As a portfolio manager, I want to configure portfolio settings including name, description, risk profile, and rebalancing strategy, so that I can customize portfolio behavior.

#### Acceptance Criteria

1. WHEN the Configure tab displays THEN the system SHALL show input fields for portfolio name and description
2. WHEN the Configure tab displays THEN the system SHALL show dropdown selectors for risk profile and risk tolerance
3. WHEN the Configure tab displays THEN the system SHALL show dropdown selectors for rebalancing strategy and threshold percentage
4. WHEN the Configure tab displays THEN the system SHALL show toggle switches for automated execution and notification settings
5. WHEN the Configure tab displays THEN the system SHALL show a toggle switch for tax harvesting in advanced options

### Requirement 5

**User Story:** As a portfolio manager, I want to save portfolio configuration changes, so that my settings are persisted.

#### Acceptance Criteria

1. WHEN a user modifies portfolio configuration THEN the system SHALL enable the Save Configuration button
2. WHEN a user clicks Save Configuration THEN the system SHALL send a PUT request to the portfolio API endpoint
3. WHEN the save operation succeeds THEN the system SHALL display a success notification
4. WHEN the save operation fails THEN the system SHALL display an error message
5. WHEN a user clicks Reset THEN the system SHALL restore the original portfolio configuration values

### Requirement 6

**User Story:** As a portfolio manager, I want to view current holdings for a selected portfolio, so that I can see what stocks I own and their performance.

#### Acceptance Criteria

1. WHEN the Holdings tab is selected THEN the system SHALL fetch holdings data from the portfolio holdings API endpoint
2. WHEN holdings data is received THEN the system SHALL display a table with symbol, quantity, average cost, current price, and unrealized PnL
3. WHEN holdings data is loading THEN the system SHALL display a loading indicator
4. WHEN no holdings exist THEN the system SHALL display an empty state message
5. WHEN holdings data fetch fails THEN the system SHALL display an error message

### Requirement 7

**User Story:** As a portfolio manager, I want to view completed trades for a selected portfolio, so that I can analyze my trading history and performance.

#### Acceptance Criteria

1. WHEN the Trades tab is selected THEN the system SHALL fetch trades data from the portfolio trades API endpoint
2. WHEN trades data is received THEN the system SHALL display a table with symbol, entry date, entry price, exit date, exit price, quantity, profit, and profit percentage
3. WHEN trades data is loading THEN the system SHALL display a loading indicator
4. WHEN no trades exist THEN the system SHALL display an empty state message
5. WHEN trades data fetch fails THEN the system SHALL display an error message

### Requirement 8

**User Story:** As a portfolio manager, I want to create a new portfolio, so that I can start tracking a new investment strategy.

#### Acceptance Criteria

1. WHEN a user clicks the Create Portfolio button THEN the system SHALL display an empty portfolio form in the Configure tab
2. WHEN a user fills in required portfolio fields THEN the system SHALL enable the Save Configuration button
3. WHEN a user saves a new portfolio THEN the system SHALL send a POST request to the portfolio API endpoint
4. WHEN the create operation succeeds THEN the system SHALL add the new portfolio to the sidebar list
5. WHEN the create operation succeeds THEN the system SHALL display a success notification

### Requirement 9

**User Story:** As a portfolio manager, I want the UI to match the provided design specifications, so that the interface is consistent and professional.

#### Acceptance Criteria

1. WHEN the Portfolios component renders THEN the system SHALL use a two-column layout with sidebar and detail panel
2. WHEN portfolio cards render in the sidebar THEN the system SHALL display metrics with appropriate color coding for positive and negative returns
3. WHEN the Configure tab renders THEN the system SHALL organize settings into sections for Basic Settings, Risk Profile, Rebalancing Strategy, Execution Preferences, and Advanced Options
4. WHEN form controls render THEN the system SHALL use consistent styling with proper spacing and alignment
5. WHEN action buttons render THEN the system SHALL use primary color for Save and secondary color for Reset
