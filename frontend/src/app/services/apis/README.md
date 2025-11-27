# NSE Indices API Service

## Overview

The `NseIndicesService` provides a comprehensive interface to interact with the NSE Indices data ingestion engine. This service connects to the backend `NseIndicesController` endpoints to manage real-time NSE indices data streaming, WebSocket connections, and data retrieval.

## Features

- **Data Ingestion Management**: Start/stop NSE indices data ingestion
- **WebSocket Subscriptions**: Subscribe/unsubscribe to specific indices or all indices
- **Real-time Data Access**: Get latest ingested indices data
- **Connection Health Monitoring**: Check WebSocket connection status
- **System Information**: Retrieve engine configuration and status
- **Manual Data Triggering**: Trigger manual data ingestion for testing

## API Endpoints

### Data Ingestion
- `POST /api/nse-indices/ingestion/start` - Start NSE indices data ingestion
- `POST /api/nse-indices/ingestion/stop` - Stop NSE indices data ingestion
- `POST /api/nse-indices/ingestion/trigger` - Manually trigger data ingestion

### Subscriptions
- `POST /api/nse-indices/subscription/all` - Subscribe to all NSE indices
- `POST /api/nse-indices/subscription/{indexName}` - Subscribe to specific index
- `DELETE /api/nse-indices/subscription/all` - Unsubscribe from all indices
- `DELETE /api/nse-indices/subscription/{indexName}` - Unsubscribe from specific index

### Data Retrieval
- `GET /api/nse-indices/data/latest` - Get latest ingested indices data
- `GET /api/nse-indices/data/{indexName}` - Get latest data for specific index

### Monitoring & Health
- `GET /api/nse-indices/ingestion/status` - Get ingestion status
- `GET /api/nse-indices/health/websocket` - Check WebSocket health
- `GET /api/nse-indices/system/info` - Get system information

## Usage in Components

### Basic Usage

```typescript
import { NseIndicesService } from '../../../services/apis/nse-indices.api';
import { NseIndicesTickDto } from '../../../services/entities/nse-indices';

export class MyComponent {
  constructor(private nseIndicesService: NseIndicesService) {}

  loadIndicesData(): void {
    this.nseIndicesService.getLatestIndicesData().subscribe({
      next: (indicesData: NseIndicesTickDto[]) => {
        console.log('Loaded indices:', indicesData);
      },
      error: (error) => {
        console.error('Failed to load indices:', error);
      }
    });
  }

  startIngestion(): void {
    this.nseIndicesService.startIngestion().subscribe({
      next: (response) => {
        console.log('Ingestion started:', response);
      }
    });
  }
}
```

### Real-time Data Streaming

```typescript
// Start ingestion and subscribe to all indices
this.nseIndicesService.startIngestion().subscribe({
  next: () => {
    this.nseIndicesService.subscribeToAllIndices().subscribe({
      next: () => {
        // Now start getting real-time data
        this.refreshDataPeriodically();
      }
    });
  }
});

private refreshDataPeriodically(): void {
  setInterval(() => {
    this.nseIndicesService.getLatestIndicesData().subscribe({
      next: (data) => this.updateUI(data)
    });
  }, 30000); // Refresh every 30 seconds
}
```

## Data Models

### NseIndicesTickDto
```typescript
interface NseIndicesTickDto {
  indexName: string;           // Full name of the index
  indexSymbol: string;         // Symbol/ticker of the index
  lastPrice: number;           // Current price
  variation: number;           // Price change from previous close
  percentChange: number;       // Percentage change
  openPrice: number;           // Opening price
  highPrice: number;           // Day's high
  lowPrice: number;            // Day's low
  previousClose: number;       // Previous closing price
  totalTradedVolume: number;   // Total volume traded
  totalTradedValue: number;    // Total value traded
  timestamp: string;           // Timestamp of the data
}
```

### Response Types
- `NseIndicesStatusResponse` - Ingestion status information
- `NseIndicesSystemInfo` - System configuration and status
- `NseIndicesWebSocketHealth` - WebSocket connection health
- `NseIndicesOperationResponse` - Generic operation responses
- `NseIndicesSubscriptionResponse` - Subscription operation responses

## Error Handling

The service includes comprehensive error handling with:
- Automatic retry logic (up to 3 attempts)
- Exponential backoff delays
- Detailed error logging
- Graceful fallbacks for failed operations

## Integration with Dashboard

The service is integrated into the `OverallComponent` dashboard to:
- Display real-time NSE indices data in a left-side table widget
- Automatically refresh data every 30 seconds
- Handle WebSocket connections and data streaming
- Provide interactive indices list with clickable rows

## Configuration

The service uses the standard API configuration from `environment.ts`:
- Base URL: `http://localhost:8080` (development)
- Endpoint: `/api/nse-indices`
- Authentication: Bearer token (if available)

## Dependencies

- `ApiService` - Base HTTP service with retry logic
- `HttpClient` - Angular HTTP client
- `Observable` - RxJS observables for reactive programming
- `AuthService` - Authentication service for token management
