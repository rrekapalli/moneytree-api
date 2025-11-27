# API Contracts: Backend API Endpoints

**Feature**: `002-angular-frontend`  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Overview

This document describes the backend API endpoints that the frontend application will consume. All endpoints use UUID strings for entity identifiers and are accessible at `http://localhost:8080/api/**` (proxied through frontend dev server on port 4200).

## Base URL

- **Development**: `http://localhost:8080` (proxied via frontend dev server)
- **Frontend Proxy**: Requests to `/api/**` are automatically proxied to `http://localhost:8080/api/**`

## Authentication

**Status**: No authentication required for development setup  
**Headers**: Standard HTTP headers only

## API Endpoints

### Portfolio Management

#### List Portfolios
- **Method**: `GET`
- **Path**: `/api/portfolio`
- **Response**: `200 OK`
- **Body**: Array of `Portfolio` objects
- **Example**:
  ```json
  [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Portfolio",
      "description": "Portfolio description",
      "baseCurrency": "INR",
      "isActive": true,
      "createdAt": "2025-01-27T10:30:00Z",
      "updatedAt": "2025-01-27T10:30:00Z"
    }
  ]
  ```

#### Get Portfolio by ID
- **Method**: `GET`
- **Path**: `/api/portfolio/{id}`
- **Path Parameters**: `id` (UUID string)
- **Response**: `200 OK` or `404 Not Found`
- **Body**: `Portfolio` object

#### Create Portfolio
- **Method**: `POST`
- **Path**: `/api/portfolio`
- **Request Body**: `Portfolio` object (without `id`, `createdAt`, `updatedAt`)
- **Response**: `200 OK`
- **Body**: Created `Portfolio` object with generated UUID

#### Update Portfolio
- **Method**: `PUT`
- **Path**: `/api/portfolio/{id}`
- **Path Parameters**: `id` (UUID string)
- **Request Body**: `Portfolio` object
- **Response**: `200 OK` or `404 Not Found`
- **Body**: Updated `Portfolio` object

#### Delete Portfolio
- **Method**: `DELETE`
- **Path**: `/api/portfolio/{id}`
- **Path Parameters**: `id` (UUID string)
- **Response**: `204 No Content` or `404 Not Found`

### Market Data

#### Get Historical Price Data
- **Method**: `POST`
- **Path**: `/api/marketdata/kite/{tradingsymbol}/history`
- **Path Parameters**: `tradingsymbol` (string, e.g., "RELIANCE")
- **Request Body**:
  ```json
  {
    "interval": "day",
    "from": "2025-01-01T00:00:00Z",
    "to": "2025-01-27T23:59:59Z",
    "exchange": "NSE",
    "instrumenttoken": "optional"
  }
  ```
- **Response**: `200 OK`
- **Body**: Array of `PriceData` objects

#### Get Current Quotes
- **Method**: `GET`
- **Path**: `/api/marketdata/kite/quotes?symbols={symbols}`
- **Query Parameters**: `symbols` (comma-separated string, e.g., "RELIANCE,TCS,INFY")
- **Response**: `200 OK`
- **Body**: Array of `Quote` objects

### Signals

#### List Signals
- **Method**: `GET`
- **Path**: `/api/signals`
- **Query Parameters**: Optional filters (portfolioId, etc.)
- **Response**: `200 OK`
- **Body**: Array of `Signal` objects with UUID `signalId`

#### Get Signal by ID
- **Method**: `GET`
- **Path**: `/api/signals/{id}`
- **Path Parameters**: `id` (UUID string)
- **Response**: `200 OK` or `404 Not Found`

#### Create Signal
- **Method**: `POST`
- **Path**: `/api/signals`
- **Request Body**: `Signal` object
- **Response**: `200 OK`
- **Body**: Created `Signal` object with generated UUID `signalId`

### Screeners

#### List Screeners
- **Method**: `GET`
- **Path**: `/api/screeners`
- **Response**: `200 OK`
- **Body**: Array of `Screener` objects with UUID `id`

#### Get Screener by ID
- **Method**: `GET`
- **Path**: `/api/screeners/{id}`
- **Path Parameters**: `id` (UUID string)
- **Response**: `200 OK` or `404 Not Found`

#### Create Screener
- **Method**: `POST`
- **Path**: `/api/screeners`
- **Request Body**: `Screener` object
- **Response**: `200 OK`
- **Body**: Created `Screener` object with generated UUID

### Backtests

#### List Backtest Runs
- **Method**: `GET`
- **Path**: `/api/backtests`
- **Response**: `200 OK`
- **Body**: Array of `BacktestRun` objects with UUID `runId`

#### Get Backtest Run by ID
- **Method**: `GET`
- **Path**: `/api/backtests/{id}`
- **Path Parameters**: `id` (UUID string)
- **Response**: `200 OK` or `404 Not Found`

#### Get Backtest Trades
- **Method**: `GET`
- **Path**: `/api/backtests/{id}/trades`
- **Path Parameters**: `id` (UUID string - backtest run ID)
- **Response**: `200 OK`
- **Body**: Array of `BacktestTrade` objects with UUID `tradeId`

### Portfolio Operations

#### Get Portfolio Holdings
- **Method**: `GET`
- **Path**: `/api/portfolio/{id}/holdings`
- **Path Parameters**: `id` (UUID string - portfolio ID)
- **Response**: `200 OK`
- **Body**: Array of holding objects

#### Get Open Positions
- **Method**: `GET`
- **Path**: `/api/portfolio/{id}/positions`
- **Path Parameters**: `id` (UUID string - portfolio ID)
- **Response**: `200 OK`
- **Body**: Array of `OpenPosition` objects with UUID `positionId`

#### Get Pending Orders
- **Method**: `GET`
- **Path**: `/api/portfolio/{id}/pending-orders`
- **Path Parameters**: `id` (UUID string - portfolio ID)
- **Response**: `200 OK`
- **Body**: Array of `PendingOrder` objects with UUID `orderId`

#### Get Portfolio Trades
- **Method**: `GET`
- **Path**: `/api/portfolio/{id}/trades`
- **Path Parameters**: `id` (UUID string - portfolio ID)
- **Response**: `200 OK`
- **Body**: Array of `PortfolioTrade` objects with UUID `tradeId`

## Common Response Formats

### Success Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Entity Name",
  "createdAt": "2025-01-27T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

### Array Response
```json
[
  { "id": "uuid1", ... },
  { "id": "uuid2", ... }
]
```

## UUID Format

All entity IDs in API requests and responses use UUID v4 format:
- **Format**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Example**: `550e8400-e29b-41d4-a716-446655440000`
- **Type**: String (not numeric)

## Date/Time Format

All timestamps use ISO 8601 format:
- **Format**: `YYYY-MM-DDTHH:mm:ssZ`
- **Example**: `2025-01-27T10:30:00Z`
- **Type**: String

## Frontend Service Implementation

Frontend services should:
1. Use Angular `HttpClient` for API calls
2. Configure base URL via environment configuration
3. Use proxy configuration for development (port 4200 → 8080)
4. Handle UUID strings for all entity IDs
5. Parse ISO 8601 date strings
6. Handle error responses appropriately

## API Documentation

Full API documentation is available via Swagger UI:
- **URL**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Spec**: `http://localhost:8080/api-docs`

Frontend developers should refer to Swagger UI for complete endpoint documentation, request/response schemas, and examples.

