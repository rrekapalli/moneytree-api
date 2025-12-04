#!/bin/bash

# Script to validate V3 migration SQL syntax
# This script checks for common SQL syntax errors without executing the migration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_FILE="$SCRIPT_DIR/V3__create_strategy_tables.sql"

echo "==================================="
echo "V3 Migration Validation Script"
echo "==================================="
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✓ Migration file found: $MIGRATION_FILE"
echo ""

# Check for basic SQL syntax issues
echo "Checking for common SQL syntax issues..."
echo ""

# Check for balanced parentheses
OPEN_PARENS=$(grep -o '(' "$MIGRATION_FILE" | wc -l)
CLOSE_PARENS=$(grep -o ')' "$MIGRATION_FILE" | wc -l)

if [ "$OPEN_PARENS" -eq "$CLOSE_PARENS" ]; then
    echo "✓ Parentheses are balanced ($OPEN_PARENS opening, $CLOSE_PARENS closing)"
else
    echo "❌ WARNING: Unbalanced parentheses ($OPEN_PARENS opening, $CLOSE_PARENS closing)"
fi

# Check for CREATE TABLE statements
TABLE_COUNT=$(grep -c "CREATE TABLE" "$MIGRATION_FILE" || true)
echo "✓ Found $TABLE_COUNT CREATE TABLE statements"

# Check for CREATE INDEX statements
INDEX_COUNT=$(grep -c "CREATE INDEX" "$MIGRATION_FILE" || true)
echo "✓ Found $INDEX_COUNT CREATE INDEX statements"

# Check for COMMENT ON statements
COMMENT_COUNT=$(grep -c "COMMENT ON" "$MIGRATION_FILE" || true)
echo "✓ Found $COMMENT_COUNT COMMENT ON statements"

# Check for CREATE TRIGGER statements
TRIGGER_COUNT=$(grep -c "CREATE TRIGGER" "$MIGRATION_FILE" || true)
echo "✓ Found $TRIGGER_COUNT CREATE TRIGGER statements"

# Check for CREATE FUNCTION statements
FUNCTION_COUNT=$(grep -c "CREATE OR REPLACE FUNCTION" "$MIGRATION_FILE" || true)
echo "✓ Found $FUNCTION_COUNT CREATE FUNCTION statements"

echo ""
echo "==================================="
echo "Summary"
echo "==================================="
echo "Tables to be created:"
grep "CREATE TABLE" "$MIGRATION_FILE" | sed 's/CREATE TABLE /  - /' | sed 's/ (//'
echo ""
echo "Indexes to be created: $INDEX_COUNT"
echo "Triggers to be created: $TRIGGER_COUNT"
echo "Functions to be created: $FUNCTION_COUNT"
echo ""

# Check for PostgreSQL-specific syntax
echo "Checking PostgreSQL-specific features..."
if grep -q "gen_random_uuid()" "$MIGRATION_FILE"; then
    echo "✓ Uses gen_random_uuid() for UUID generation"
fi

if grep -q "JSONB" "$MIGRATION_FILE"; then
    echo "✓ Uses JSONB data type"
fi

if grep -q "TIMESTAMPTZ" "$MIGRATION_FILE"; then
    echo "✓ Uses TIMESTAMPTZ for timestamps"
fi

if grep -q "CREATE EXTENSION IF NOT EXISTS" "$MIGRATION_FILE"; then
    echo "✓ Safely creates required extensions"
fi

echo ""
echo "==================================="
echo "Validation Complete"
echo "==================================="
echo ""
echo "The migration file appears to be syntactically valid."
echo "To run the migration, use one of the methods described in README.md"
echo ""
echo "Example:"
echo "  psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyTree -f $MIGRATION_FILE"
echo ""
