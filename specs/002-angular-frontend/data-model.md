# Data Model: Angular Frontend Modulith Integration

**Feature**: `002-angular-frontend`  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Overview

This document describes the data models used in the frontend application. All entity models must use UUID strings for identifiers instead of numeric types (long/bigint) to match the new backend database schema.

## Entity Models

### Core Principle: UUID-Based Identifiers

All entity IDs in the frontend must be defined as `string` (TypeScript) to represent UUID values. The backend API returns UUID strings for all entity identifiers.

**Migration Requirement**: All existing entity models that use `number` or `bigint` for IDs must be updated to use `string`.

### Portfolio Entity

**Type**: `Portfolio`  
**ID Field**: `id: string` (UUID)  
**Key Fields**:
- `id: string` - UUID identifier
- `name: string` - Portfolio name
- `description?: string` - Optional description
- `baseCurrency: string` - Base currency (default: "INR")
- `inceptionDate?: string` - ISO date string
- `riskProfile?: string` - Risk profile classification
- `isActive: boolean` - Active status
- `targetAllocation?: object` - Target allocation map
- `createdAt: string` - ISO timestamp
- `updatedAt: string` - ISO timestamp
- `initialCapital?: number` - Initial capital amount
- `currentCash?: number` - Current cash balance
- `tradingMode?: string` - Trading mode

**Relationships**:
- References `User` via `userId` (UUID string)

### Signal Entity

**Type**: `Signal`  
**ID Field**: `signalId: string` (UUID)  
**Key Fields**:
- `signalId: string` - UUID identifier
- `portfolioId: string` - UUID reference to Portfolio
- `symbol: string` - Stock symbol
- `timestamp: string` - ISO timestamp
- `signalType: string` - "ENTRY" or "EXIT"
- `price: number` - Signal price
- `conditionsMet?: object` - Conditions that triggered signal
- `executed: boolean` - Execution status
- `createdAt: string` - ISO timestamp

**Relationships**:
- References `Portfolio` via `portfolioId` (UUID string)

### BacktestRun Entity

**Type**: `BacktestRun`  
**ID Field**: `runId: string` (UUID)  
**Key Fields**:
- `runId: string` - UUID identifier
- `strategyName: string` - Strategy name
- `symbol: string` - Stock symbol
- `startDate: string` - ISO date string
- `endDate: string` - ISO date string
- `initialCapital: number` - Initial capital
- `finalEquity?: number` - Final equity value
- `finalCash?: number` - Final cash value
- `accumulatedShares?: number` - Accumulated shares
- `totalReturnPct?: number` - Total return percentage
- `maxDrawdownPct?: number` - Maximum drawdown percentage
- `totalTrades?: number` - Total number of trades
- `winningTrades?: number` - Number of winning trades
- `losingTrades?: number` - Number of losing trades
- `hitRatio?: number` - Win/loss ratio
- `avgProfitPerTrade?: number` - Average profit per trade
- `avgHoldingDays?: number` - Average holding period
- `sharpeRatio?: number` - Sharpe ratio
- `createdAt: string` - ISO timestamp

**Relationships**:
- Has many `BacktestTrade` via `runId` (UUID string)

### BacktestTrade Entity

**Type**: `BacktestTrade`  
**ID Field**: `tradeId: string` (UUID)  
**Key Fields**:
- `tradeId: string` - UUID identifier
- `runId: string` - UUID reference to BacktestRun
- `tradeDate: string` - ISO date string
- `tradeType: string` - Trade type
- `entryPrice?: number` - Entry price
- `exitPrice?: number` - Exit price
- `shares?: number` - Number of shares
- `principal?: number` - Principal amount
- `profit?: number` - Profit amount
- `profitPct?: number` - Profit percentage
- `keptShares?: number` - Shares kept
- `holdingDays?: number` - Holding period in days
- `createdAt: string` - ISO timestamp

**Relationships**:
- References `BacktestRun` via `runId` (UUID string)

### Screener Entity

**Type**: `Screener`  
**ID Field**: `id: string` (UUID)  
**Key Fields**:
- `id: string` - UUID identifier
- `name: string` - Screener name
- `description?: string` - Optional description
- `isActive: boolean` - Active status
- `createdAt: string` - ISO timestamp
- `updatedAt: string` - ISO timestamp

**Relationships**:
- Has many `ScreenerRun` via screener ID
- Has many `ScreenerFunction` via screener ID

### ScreenerRun Entity

**Type**: `ScreenerRun`  
**ID Field**: `runId: string` (UUID)  
**Key Fields**:
- `runId: string` - UUID identifier
- `screenerId: string` - UUID reference to Screener
- `status: string` - Run status
- `startedAt?: string` - ISO timestamp
- `completedAt?: string` - ISO timestamp
- `resultCount?: number` - Number of results

**Relationships**:
- References `Screener` via `screenerId` (UUID string)
- Has many `ScreenerResult` via `runId`

### PortfolioTrade Entity

**Type**: `PortfolioTrade`  
**ID Field**: `tradeId: string` (UUID)  
**Key Fields**:
- `tradeId: string` - UUID identifier
- `portfolioId: string` - UUID reference to Portfolio
- `symbol: string` - Stock symbol
- `tradeDate: string` - ISO date string
- `tradeType: string` - Trade type
- `quantity: number` - Number of shares
- `price: number` - Trade price
- `totalAmount: number` - Total trade amount
- `createdAt: string` - ISO timestamp

**Relationships**:
- References `Portfolio` via `portfolioId` (UUID string)

### OpenPosition Entity

**Type**: `OpenPosition`  
**ID Field**: `positionId: string` (UUID)  
**Key Fields**:
- `positionId: string` - UUID identifier
- `portfolioId: string` - UUID reference to Portfolio
- `symbol: string` - Stock symbol
- `quantity: number` - Number of shares
- `averagePrice: number` - Average purchase price
- `currentPrice?: number` - Current market price
- `unrealizedPnL?: number` - Unrealized profit/loss
- `lastUpdated: string` - ISO timestamp

**Relationships**:
- References `Portfolio` via `portfolioId` (UUID string)

### PendingOrder Entity

**Type**: `PendingOrder`  
**ID Field**: `orderId: string` (UUID)  
**Key Fields**:
- `orderId: string` - UUID identifier
- `portfolioId: string` - UUID reference to Portfolio
- `symbol: string` - Stock symbol
- `orderType: string` - Order type
- `quantity: number` - Number of shares
- `price?: number` - Order price (if limit order)
- `status: string` - Order status
- `createdAt: string` - ISO timestamp

**Relationships**:
- References `Portfolio` via `portfolioId` (UUID string)

## Type Definitions

### UUID Type

All entity IDs should use TypeScript `string` type to represent UUIDs:

```typescript
type UUID = string;

interface Portfolio {
  id: UUID;
  // ... other fields
}
```

### Date/Time Fields

All date and timestamp fields should use ISO 8601 string format:

```typescript
type ISODateString = string; // Format: "2025-01-27T10:30:00Z"
type ISODate = string;        // Format: "2025-01-27"
```

## Validation Rules

### UUID Format Validation

Frontend should validate UUID format when receiving data from API:

```typescript
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### Required Fields

- All entity IDs are required and must be valid UUID strings
- Foreign key references (e.g., `portfolioId`) must be valid UUID strings
- Timestamps must be valid ISO 8601 strings

## Migration Checklist

When updating entity models from numeric IDs to UUIDs:

- [ ] Change all `id: number` to `id: string` in entity interfaces
- [ ] Change all `id: bigint` to `id: string` in entity interfaces
- [ ] Update all foreign key fields (e.g., `portfolioId: number` → `portfolioId: string`)
- [ ] Update service methods that accept/return IDs
- [ ] Update API request/response DTOs
- [ ] Update components that display or manipulate IDs
- [ ] Add UUID validation where appropriate
- [ ] Update any ID comparison logic (use string comparison, not numeric)
- [ ] Remove any numeric ID parsing/formatting logic
- [ ] Update route parameters that use IDs (Angular routes)

## Excluded Entities

The following database tables/entities should **NOT** be used in the frontend:

- **nse_*** tables: These tables are kept for backward compatibility only and should not be referenced by the frontend. All data operations must use the new schema with UUID-based identifiers.

## API Response Format

All API responses from the backend use UUID strings for entity identifiers:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My Portfolio",
  "createdAt": "2025-01-27T10:30:00Z"
}
```

Frontend entity models must match this format exactly.

