# Requirements Document

## Introduction

This specification defines the requirements for refactoring the Strategy page in the MoneyTree application to match the UI/UX patterns established by the Portfolios page. The Strategy page will provide a comprehensive interface for creating, configuring, and managing trading strategies with a two-panel layout: a left sidebar showing all available strategies and a right panel with tabbed views for strategy details, configuration, and metrics.

## Glossary

- **Strategy**: A defined set of rules and conditions for automated or semi-automated trading decisions
- **Universe**: The set of stocks/instruments that a strategy will consider for trading
- **Allocations**: Position sizing rules and capital allocation percentages that determine how much capital to deploy per trade
- **Entry Conditions**: Rules that determine when to open a position (buy signal)
- **Exit Conditions**: Rules that determine when to close a position (sell signal)
- **Strategy Configuration**: Technical parameters defining how a strategy operates (universe, entry/exit rules, risk parameters)
- **Strategy Metrics**: Performance indicators and statistics for a strategy (returns, win rate, Sharpe ratio, etc.)
- **Backtest**: Historical simulation of a strategy's performance
- **Paper Trading**: Simulated trading with virtual money to test strategies
- **MoneyTree System**: The web-based investment management application
- **Left Sidebar**: The navigation panel displaying the list of all strategies
- **Right Panel**: The detail view panel showing tabs for selected strategy information
- **Backtest Results**: Historical performance data from running a strategy against past market data
- **CRUD Operations**: Create, Read, Update, Delete operations for strategy management

## Requirements

### Requirement 1

**User Story:** As a trader, I want to view all my strategies in a left sidebar, so that I can quickly browse and select strategies to manage.

#### Acceptance Criteria

1. WHEN the Strategy page loads, THE MoneyTree System SHALL display a left sidebar containing all user strategies
2. WHEN displaying strategies in the sidebar, THE MoneyTree System SHALL show strategy name, status (Active/Inactive/Backtesting), key metrics (CAGR, Sharpe ratio), and last execution time
3. WHEN a user clicks on a strategy card in the sidebar, THE MoneyTree System SHALL highlight the selected strategy and display its details in the right panel
4. WHEN the sidebar contains more strategies than can fit in the viewport, THE MoneyTree System SHALL provide vertical scrolling functionality
5. WHEN a user searches for strategies using the search input, THE MoneyTree System SHALL filter the displayed strategies based on name or description matching the search text

### Requirement 2

**User Story:** As a trader, I want to create new strategies, so that I can define and test different trading approaches.

#### Acceptance Criteria

1. WHEN a user clicks the "Create Strategy" button, THE MoneyTree System SHALL open the Details tab with an empty strategy form
2. WHEN creating a new strategy, THE MoneyTree System SHALL require the user to provide a strategy name and description
3. WHEN a user saves a new strategy, THE MoneyTree System SHALL persist the strategy to the database and add it to the sidebar list
4. WHEN a user cancels strategy creation, THE MoneyTree System SHALL discard the unsaved changes and return to the previous view
5. WHEN a new strategy is created, THE MoneyTree System SHALL assign it a unique identifier and set default values for all configuration parameters

### Requirement 3

**User Story:** As a trader, I want to view strategy details in an Overview tab, so that I can see a dashboard of the strategy's performance and status.

#### Acceptance Criteria

1. WHEN a user selects a strategy, THE MoneyTree System SHALL display the Overview tab by default
2. WHEN displaying the Overview tab, THE MoneyTree System SHALL show key performance metrics including total return, CAGR, Sharpe ratio, maximum drawdown, and win rate
3. WHEN displaying the Overview tab, THE MoneyTree System SHALL show a performance chart comparing strategy returns against a benchmark
4. WHEN displaying the Overview tab, THE MoneyTree System SHALL show recent trades and current positions
5. WHEN displaying the Overview tab, THE MoneyTree System SHALL show strategy status indicators (Active, Paused, Backtesting, Error)

### Requirement 4

**User Story:** As a trader, I want to edit strategy details in a Details tab, so that I can update basic strategy information.

#### Acceptance Criteria

1. WHEN a user switches to the Details tab, THE MoneyTree System SHALL display an editable form with strategy name, description, and risk profile
2. WHEN a user modifies strategy details, THE MoneyTree System SHALL enable the Save button to indicate unsaved changes
3. WHEN a user saves strategy details, THE MoneyTree System SHALL validate all required fields before persisting changes
4. WHEN a user cancels detail edits, THE MoneyTree System SHALL revert all changes to the last saved state
5. WHEN strategy details are successfully saved, THE MoneyTree System SHALL display a success notification and update the sidebar display

### Requirement 5

**User Story:** As a trader, I want to configure strategy parameters in a Configure tab, so that I can define the universe, allocations, entry conditions, and exit conditions for my strategy.

#### Acceptance Criteria

1. WHEN a user switches to the Configure tab, THE MoneyTree System SHALL display four accordion sections: Universe, Allocations, Entry Conditions, and Exit Conditions
2. WHEN configuring the Universe section, THE MoneyTree System SHALL allow the user to select stocks by index (e.g., "Nifty 500"), sector, or individual symbols
3. WHEN configuring the Allocations section, THE MoneyTree System SHALL allow the user to define position sizing rules and capital allocation percentages for the strategy
4. WHEN configuring Entry Conditions, THE MoneyTree System SHALL provide a rule builder interface for defining buy signals using technical indicators and price conditions
5. WHEN configuring Exit Conditions, THE MoneyTree System SHALL provide a rule builder interface for defining sell signals including stop-loss, take-profit, and trailing stops
6. WHEN a user saves configuration changes, THE MoneyTree System SHALL validate that at least one entry condition and one exit condition are defined

### Requirement 6

**User Story:** As a trader, I want to run backtests on my strategies, so that I can evaluate their historical performance before deploying them.

#### Acceptance Criteria

1. WHEN a user clicks the "Run Backtest" button in the Configure tab, THE MoneyTree System SHALL prompt for backtest parameters (start date, end date, initial capital)
2. WHEN a backtest is initiated, THE MoneyTree System SHALL update the strategy status to "Backtesting" and display progress indicators
3. WHEN a backtest completes, THE MoneyTree System SHALL store the results in the backtest_runs and backtest_trades tables and enable the Backtest Results tab
4. WHEN a backtest fails, THE MoneyTree System SHALL display an error message with details about the failure
5. WHEN multiple backtests exist for a strategy, THE MoneyTree System SHALL display the most recent backtest results by default in the Backtest Results tab

### Requirement 7

**User Story:** As a trader, I want to view backtest results in a dedicated tab, so that I can analyze the historical performance and individual trades of my strategy.

#### Acceptance Criteria

1. WHEN a user switches to the Backtest Results tab, THE MoneyTree System SHALL display a summary section with key performance metrics from the most recent backtest
2. WHEN displaying the backtest summary, THE MoneyTree System SHALL show total return, CAGR, Sharpe ratio, Sortino ratio, maximum drawdown, win rate, total trades, and profit factor
3. WHEN displaying the Backtest Results tab, THE MoneyTree System SHALL show a performance chart comparing strategy equity curve against buy-and-hold benchmark
4. WHEN displaying the Backtest Results tab, THE MoneyTree System SHALL show a trades table with columns for entry date, exit date, symbol, entry price, exit price, shares, profit/loss, and holding period
5. WHEN no backtest results exist for a strategy, THE MoneyTree System SHALL display a message prompting the user to run a backtest from the Configure tab

### Requirement 9

**User Story:** As a trader, I want to activate or deactivate strategies, so that I can control which strategies are actively trading.

#### Acceptance Criteria

1. WHEN a user toggles a strategy's active status, THE MoneyTree System SHALL update the is_active field in the database
2. WHEN a strategy is activated, THE MoneyTree System SHALL validate that all required configuration is complete before allowing activation
3. WHEN a strategy is deactivated, THE MoneyTree System SHALL stop generating new signals but preserve existing positions
4. WHEN displaying strategies in the sidebar, THE MoneyTree System SHALL visually distinguish active strategies from inactive ones
5. WHEN a strategy status changes, THE MoneyTree System SHALL display a confirmation notification

### Requirement 10

**User Story:** As a trader, I want to delete strategies I no longer need, so that I can keep my strategy list organized.

#### Acceptance Criteria

1. WHEN a user clicks the delete button for a strategy, THE MoneyTree System SHALL display a confirmation dialog warning about data loss
2. WHEN a user confirms strategy deletion, THE MoneyTree System SHALL remove the strategy and all associated configuration from the database
3. WHEN a strategy with active positions is deleted, THE MoneyTree System SHALL prevent deletion and display an error message
4. WHEN a strategy is successfully deleted, THE MoneyTree System SHALL remove it from the sidebar and display a success notification
5. WHEN the last strategy is deleted, THE MoneyTree System SHALL display an empty state message encouraging the user to create a new strategy

### Requirement 11

**User Story:** As a trader, I want the Strategy page to follow the same UI patterns as the Portfolios page, so that I have a consistent user experience across the application.

#### Acceptance Criteria

1. WHEN the Strategy page renders, THE MoneyTree System SHALL use the same two-panel layout as the Portfolios page
2. WHEN displaying strategy cards in the sidebar, THE MoneyTree System SHALL use the same card styling and layout as portfolio cards
3. WHEN displaying tabs in the right panel, THE MoneyTree System SHALL use the same tab component and styling as the Portfolios page
4. WHEN displaying forms and inputs, THE MoneyTree System SHALL use the same PrimeNG components and styling as the Portfolios page
5. WHEN displaying loading states and errors, THE MoneyTree System SHALL use the same patterns and components as the Portfolios page

### Requirement 12

**User Story:** As a system administrator, I want strategy data to be properly structured in the database, so that it can be efficiently queried and maintained.

#### Acceptance Criteria

1. THE MoneyTree System SHALL store strategy master data in a strategies table with fields for id, user_id, name, description, risk_profile, is_active, created_at, and updated_at
2. THE MoneyTree System SHALL store strategy configuration in a strategy_config table with fields for strategy_id, universe_definition, entry_conditions, exit_conditions, risk_parameters, and updated_at
3. THE MoneyTree System SHALL store strategy performance metrics in a strategy_metrics table with fields for strategy_id, metric_date, total_return, cagr, sharpe_ratio, max_drawdown, win_rate, total_trades, and other performance indicators
4. THE MoneyTree System SHALL establish foreign key relationships between strategies, strategy_config, and strategy_metrics tables
5. THE MoneyTree System SHALL create appropriate indexes on frequently queried columns (user_id, strategy_id, is_active, metric_date)
