# Database Migrations

This directory contains SQL migration scripts for the MoneyTree database schema.

## Migration Files

- `V1__kite_schema_placeholder.sql` - Initial schema with kite and portfolio tables
- `V2__migrate_to_uuid_primary_keys.sql` - Migration to UUID primary keys
- `V3__create_strategy_tables.sql` - Strategy management tables (NEW)

## Running Migrations

Since Flyway is not currently configured in this project, migrations must be run manually using `psql` or your preferred PostgreSQL client.

### Prerequisites

- PostgreSQL client (`psql`) installed
- Database connection details from `application.yaml`:
  - Host: postgres.tailce422e.ts.net
  - Port: 5432
  - Database: MoneyTree
  - Username: postgres (or from DB_USERNAME env var)
  - Password: mysecretpassword (or from DB_PASSWORD env var)

### Running V3 Migration (Strategy Tables)

#### Option 1: Using psql command line

```bash
# Set environment variables (optional)
export PGHOST=postgres.tailce422e.ts.net
export PGPORT=5432
export PGDATABASE=MoneyTree
export PGUSER=postgres
export PGPASSWORD=mysecretpassword

# Run the migration
psql -f backend/src/main/resources/db/V3__create_strategy_tables.sql
```

#### Option 2: Using psql interactive mode

```bash
# Connect to database
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyTree

# Run the migration file
\i backend/src/main/resources/db/V3__create_strategy_tables.sql

# Verify tables were created
\dt strategies*
\d strategies
\d strategy_config
\d strategy_metrics
```

#### Option 3: Using a GUI tool (DBeaver, pgAdmin, etc.)

1. Connect to the database using the credentials above
2. Open the `V3__create_strategy_tables.sql` file
3. Execute the SQL script

### Verifying the Migration

After running the migration, verify that the tables were created successfully:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('strategies', 'strategy_config', 'strategy_metrics');

-- Check table structure
\d strategies
\d strategy_config
\d strategy_metrics

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('strategies', 'strategy_config', 'strategy_metrics');

-- Check foreign key constraints
SELECT
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name IN ('strategies', 'strategy_config', 'strategy_metrics')
  AND tc.constraint_type = 'FOREIGN KEY';
```

## V3 Migration Details

The V3 migration creates three new tables for strategy management:

### 1. strategies
Master table for trading strategies with basic metadata:
- `id` (UUID, PK) - Unique identifier
- `user_id` (UUID, FK to users) - Owner of the strategy
- `name` (VARCHAR) - Strategy name
- `description` (TEXT) - Optional description
- `risk_profile` (VARCHAR) - CONSERVATIVE, MODERATE, or AGGRESSIVE
- `is_active` (BOOLEAN) - Whether strategy is active
- `created_at`, `updated_at` (TIMESTAMPTZ) - Timestamps

**Indexes:**
- `idx_strategies_user` - Query by user
- `idx_strategies_active` - Query active strategies
- `idx_strategies_updated` - Query by update time
- `idx_strategies_user_active` - Composite index for user + active status

### 2. strategy_config
Configuration details stored as JSONB for flexibility:
- `id` (UUID, PK) - Unique identifier
- `strategy_id` (UUID, FK to strategies) - Parent strategy
- `universe_definition` (JSONB) - Stock universe (indices, sectors, symbols)
- `allocations` (JSONB) - Position sizing and capital allocation rules
- `entry_conditions` (JSONB) - Buy signal conditions
- `exit_conditions` (JSONB) - Sell signal conditions
- `risk_parameters` (JSONB) - Stop-loss, take-profit, etc.
- `created_at`, `updated_at` (TIMESTAMPTZ) - Timestamps

**Indexes:**
- `idx_strategy_config_strategy` - Query by strategy
- `idx_strategy_config_updated` - Query by update time
- GIN indexes on all JSONB columns for efficient querying

### 3. strategy_metrics
Performance metrics tracked over time:
- `id` (UUID, PK) - Unique identifier
- `strategy_id` (UUID, FK to strategies) - Parent strategy
- `metric_date` (DATE) - Date of metrics
- Performance metrics: `total_return`, `cagr`, `sharpe_ratio`, `sortino_ratio`, etc.
- Trade statistics: `total_trades`, `win_rate`, `profit_factor`, etc.
- `created_at` (TIMESTAMPTZ) - Timestamp

**Indexes:**
- `idx_strategy_metrics_strategy` - Query by strategy
- `idx_strategy_metrics_date` - Query by date
- `idx_strategy_metrics_strategy_date` - Composite index
- `idx_strategy_metrics_performance` - Query by performance metrics

### Automatic Timestamp Updates

The migration includes triggers that automatically update the `updated_at` column when records are modified in the `strategies` and `strategy_config` tables.

### Integration with Existing Tables

The migration reuses the existing `backtest_runs` and `backtest_trades` tables for storing backtest results. No modifications to these tables are needed.

## Rollback

If you need to rollback the V3 migration:

```sql
-- Drop tables in reverse order (respects foreign key constraints)
DROP TABLE IF EXISTS strategy_metrics CASCADE;
DROP TABLE IF EXISTS strategy_config CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Future Migrations

When adding new migrations:
1. Create a new file with the naming pattern: `V{number}__{description}.sql`
2. Increment the version number (e.g., V4, V5, etc.)
3. Document the migration in this README
4. Test the migration on a development database before running on production
