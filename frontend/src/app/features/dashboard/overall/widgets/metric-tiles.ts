import { TileBuilder, StockTileBuilder } from '@dashboards/public-api';
import { StockDataDto } from '../../../../services/entities/stock-ticks';
import { IndexDataDto } from '../../../../services/entities/indices-websocket';
import { IndicesService } from '../../../../services/apis/indices.api';
import { WebSocketService } from '../../../../services/websockets/websocket.service';
import { WebSocketConnectionState } from '../../../../services/entities/indices-websocket';

/**
 * Create metric tiles that display key statistics from stock ticks data and indices data
 * 
 * WebSocket Integration:
 * - Stock tiles are configured with data events to receive real-time updates
 * - When an index is selected, the stock tile listens for WebSocket data matching that index
 * - Market overview tiles listen for general market data updates
 * - Data events automatically update the tile display with new values
 * - Includes fallback to historical data API when WebSocket is not available
 */

// Minimal debug logging toggle for this module
const DEBUG_LOGGING = false;

// Helper to force change detection by creating new object references
const refreshWidgetReferences = (widget: any) => {
  try {
    if (widget?.config?.options) {
      widget.config = { ...widget.config, options: { ...widget.config.options } };
    } else if (widget?.config) {
      widget.config = { ...widget.config };
    }
    if (widget?.data) {
      widget.data = { ...widget.data };
    }
  } catch {
    // no-op
  }
};

// Helper function to check WebSocket health and get fallback data
const getFallbackIndexData = async (
  indexName: string, 
  indicesService?: IndicesService,
  webSocketService?: WebSocketService
): Promise<any | null> => {
  if (!indicesService) return null;
  
  // Only fetch previous-day if WebSocket is not healthy
  if (webSocketService?.connected === true) {
    return null;
  }

  try {

    
    // Try to get previous day's data from the new endpoint
    const previousDayData = await indicesService.getPreviousDayIndexData(indexName).toPromise();

    
    if (previousDayData && previousDayData.indices && previousDayData.indices.length > 0) {
      // Return the first index data
      return previousDayData.indices[0];
    }
  } catch (error) {
    if (DEBUG_LOGGING) {
      console.warn(`Failed to get fallback data for index ${indexName}:`, error);
    }
  }
  return null;
};

// Normalize different index identifiers to a comparable form
const normalizeIndexId = (s: string | number | undefined | null): string => {
  try {
    return s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  } catch {
    return '';
  }
};

// Unified builder for the index stock tile
function buildIndexStockTile(params: {
  indexName: string;
  initialPrice?: number;
  initialPercent?: number;
  initialHigh?: number;
  initialLow?: number;
  currency?: string;
  webSocketService?: WebSocketService;
  indicesService?: IndicesService;
  matchToName?: string;
}) {
  const {
    indexName,
    initialPrice = 0,
    initialPercent = 0,
    initialHigh = 0,
    initialLow = 0,
    currency = '₹',
    webSocketService,
    indicesService,
    matchToName
  } = params;

  const targetToMatch = matchToName || indexName;

  const stockTile = StockTileBuilder.createStockTile(
    initialPrice,
    initialPercent,
    indexName,
    initialHigh,
    initialLow,
    currency
  )
    .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
    .build();

  // Helper to perform actual subscription and updates
  const subscribeToLive = () => {
    try {
      webSocketService!.subscribeToIndex(targetToMatch).subscribe({
        next: (data) => {
          if (data && (data.indexName || data.indexSymbol)) {
            // Verify this is the correct index by comparing symbols
            const incomingIndexSymbol = data.indexSymbol || data.indexName || '';
            const isSameIndex = normalizeIndexId(incomingIndexSymbol) !== '' && normalizeIndexId(targetToMatch) !== ''
              ? normalizeIndexId(incomingIndexSymbol) === normalizeIndexId(targetToMatch)
              : false;

            if (isSameIndex && stockTile?.config?.options) {
              // WebSocket is working - update with real-time data using exact field names
              const newPrice = data.lastPrice || 0;
              const newPercentChange = data.percentChange || 0;
              const newVariation = data.variation || 0;
              const newHigh = data.dayHigh || 0;
              const newLow = data.dayLow || 0;

              // Update the stock tile with WebSocket data using the specified fields
              const options = stockTile.config.options as any;
              options.value = Number(newPrice).toLocaleString();
              options.change = `${(newVariation >= 0 ? '+' : '')}${Number(newVariation).toFixed(2)}`;
              options.changeType = (newPercentChange >= 0 ? 'positive' : 'negative');
              options.highValue = Number(newHigh).toLocaleString();
              options.lowValue = Number(newLow).toLocaleString();
              options.description = data.indexName || data.indexSymbol || indexName;
              
              // Force widget refresh to display updated values
              refreshWidgetReferences(stockTile);
            }
          }
        },
        error: () => {
          // Silent error handling
        }
      });
    } catch {
      // Silent error handling
    }
  };

  // Subscribe to WebSocket data when connected; otherwise, wait for connection
  if (webSocketService) {
    if ((webSocketService as any).connected === true) {
      subscribeToLive();
    } else {
      // Fetch fallback immediately while offline
      if (indicesService) {
        getFallbackIndexData(indexName, indicesService, webSocketService).then(fallbackData => {
          if (fallbackData && stockTile?.config?.options) {
            const lastPrice = fallbackData.lastPrice || (fallbackData as any).last || 0;
            const options = stockTile.config.options as any;
            options.value = Number(lastPrice).toLocaleString();
            options.change = 'Historical Data';
            options.changeType = 'neutral';
            options.highValue = Number(fallbackData.dayHigh || (fallbackData as any).high || 0).toLocaleString();
            options.lowValue = Number(fallbackData.dayLow || (fallbackData as any).low || 0).toLocaleString();
            refreshWidgetReferences(stockTile);
          }
        }).catch(() => {/* no-op */});
      }

      // Defer subscribing until the WebSocket connects
      try {
        (webSocketService as any).connectionState?.subscribe?.((state: any) => {
          if (state === WebSocketConnectionState.CONNECTED) {
            subscribeToLive();
          }
        });
      } catch {
        // no-op
      }
    }
  }

  return stockTile;
}

export function createMetricTiles(
  stockTicksData: StockDataDto[] | null, 
  selectedIndexData?: IndexDataDto | null,
  webSocketService?: WebSocketService,
  indicesService?: IndicesService
) {
  // Handle null or undefined stockTicksData
  if (!stockTicksData) {
    return createEmptyMetricTiles(selectedIndexData, webSocketService, indicesService);
  }

  // Calculate metrics from stockTicksData
  const stocksCount = stockTicksData.length || 0;
  const declines = stockTicksData.filter(stock => (stock.percentChange || 0.0 ) < 0.0).length;
  const advances = stockTicksData.filter(stock => (stock.percentChange || 0.0) > 0.0).length;
  const unchanged = stockTicksData.filter(stock => (stock.percentChange || 0.0) === 0.0).length;
  
  // Calculate total traded value and volume
  const totalTradedValue = stockTicksData.reduce((sum: number, stock: any) => {
    const value = stock.totalTradedValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0) || 0;
  
  const totalTradedVolume = stockTicksData.reduce((sum: number, stock: any) => {
    const volume = stock.totalTradedVolume || 0;
    return isNaN(volume) || !isFinite(volume) ? sum : sum + volume;
  }, 0) || 0;

  const safeTotalTradedValue = isNaN(totalTradedValue) || !isFinite(totalTradedValue) ? 0 : totalTradedValue;
  const safeTotalTradedVolume = isNaN(totalTradedVolume) || !isFinite(totalTradedVolume) ? 0 : totalTradedVolume;

  // Create tiles
  const tiles = [];

  // Check if selectedIndexData exists and has valid data
  const hasValidIndexData = selectedIndexData && 
    (selectedIndexData.indexName || (selectedIndexData as any).index) && 
    (selectedIndexData.lastPrice !== undefined || (selectedIndexData as any).last !== undefined) && 
    (selectedIndexData.lastPrice !== null || (selectedIndexData as any).last !== null) &&
    (selectedIndexData.lastPrice !== 0 || (selectedIndexData as any).last !== 0);

  if (hasValidIndexData) {
    // Extract data using actual WebSocket field names
    const indexName = selectedIndexData.indexName || selectedIndexData.index || 'Index';
    const lastPrice = selectedIndexData.lastPrice || (selectedIndexData as any).last || 0;
    const percentChange = selectedIndexData.percentChange || 0;
    const dayHigh = selectedIndexData.dayHigh || selectedIndexData.high || 0;
    const dayLow = selectedIndexData.dayLow || selectedIndexData.low || 0;
    
    // Index Price Tile - use unified builder
    tiles.push(
      buildIndexStockTile({
        indexName,
        initialPrice: lastPrice,
        initialPercent: percentChange,
        initialHigh: dayHigh,
        initialLow: dayLow,
        currency: '',
        webSocketService,
        indicesService,
        matchToName: (selectedIndexData.index || selectedIndexData.indexName || indexName) as any
      })
    );
  } else {
    // No valid index data - create default tile
    tiles.push(
      buildIndexStockTile({
        indexName: 'NIFTY 50',
        initialPrice: 0,
        initialPercent: 0,
        initialHigh: 0,
        initialLow: 0,
        currency: '₹',
        webSocketService,
        indicesService,
        matchToName: 'NIFTY 50'
      })
    );
  }

  // Add remaining tiles
  tiles.push(
    // Declines
    TileBuilder.createInfoTile(
      'Declines',
      declines.toString(),
      'Declining Stocks',
      'fas fa-arrow-down',
      '#dc2626'
    )
      .setBackgroundColor('#fecaca')
      .setBorder('#f87171', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    // Advances
    TileBuilder.createInfoTile(
      'Advances',
      advances.toString(),
      'Advancing Stocks',
      'fas fa-arrow-up',
      '#16a34a'
    )
      .setBackgroundColor('#bbf7d0')
      .setBorder('#4ade80', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    // Unchanged
    TileBuilder.createInfoTile(
      'Unchanged',
      unchanged.toString(),
      'Unchanged Stocks',
      'fas fa-minus',
      '#6b7280'
    )
      .setBackgroundColor('#e5e7eb')
      .setBorder('#9ca3af', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Value
    TileBuilder.createFinancialTile(
      safeTotalTradedValue,
      0,
      'Traded Value',
      '₹',
      'fas fa-rupee-sign'
    )
      .setColor('#047857')
      .setBackgroundColor('#a7f3d0')
      .setBorder('#5eead4', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Volume
    TileBuilder.createInfoTile(
      'Traded Volume',
      safeTotalTradedVolume.toLocaleString(),
      'Total Volume',
      'fas fa-chart-bar',
      '#7c3aed'
    )
      .setBackgroundColor('#ddd6fe')
      .setBorder('#a78bfa', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  );

  return tiles;
}

/**
 * Create empty metric tiles when stockTicksData is null or unavailable
 */
function createEmptyMetricTiles(
  selectedIndexData?: IndexDataDto | null,
  webSocketService?: WebSocketService,
  indicesService?: IndicesService
) {
  const tiles = [
    // Default stock tile
    buildIndexStockTile({
      indexName: 'NIFTY 50',
      initialPrice: 0,
      initialPercent: 0,
      initialHigh: 0,
      initialLow: 0,
      currency: '₹',
      webSocketService,
      indicesService,
      matchToName: 'NIFTY 50'
    }),

    // Empty state tiles
    TileBuilder.createInfoTile(
      'Declines',
      '0',
      'Declining Stocks',
      'fas fa-arrow-down',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    TileBuilder.createInfoTile(
      'Advances',
      '0',
      'Advancing Stocks',
      'fas fa-arrow-up',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    TileBuilder.createInfoTile(
      'Unchanged',
      '0',
      'Unchanged Stocks',
      'fas fa-minus',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    TileBuilder.createFinancialTile(
      0,
      0,
      'Traded Value',
      '₹',
      'fas fa-rupee-sign'
    )
      .setColor('#6b7280')
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    TileBuilder.createInfoTile(
      'Traded Volume',
      '0',
      'Total Volume',
      'fas fa-chart-bar',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  ];

  return tiles;
}
