import { TileBuilder } from '@dashboards/public-api';
import { DashboardDataRow } from './dashboard-data';

/**
 * Create metric tiles that display key statistics from dashboard data
 */
export function createMetricTiles(data: DashboardDataRow[]) {
  // Calculate metrics with safe handling
  const totalRows = data.length;
  const distinctAssetCategories = new Set(data.map(row => row.assetCategory)).size;
  const distinctMarkets = new Set(data.map(row => row.market)).size;
  const distinctMonths = new Set(data.map(row => row.month)).size;
  
  // Safe total value calculation
  const totalValue = data.reduce((sum, row) => {
    const value = row.totalValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0);
  
  // Safe average value calculation
  const safeTotalValue = isNaN(totalValue) || !isFinite(totalValue) ? 0 : totalValue;
  const averageValue = totalRows > 0 ? safeTotalValue / totalRows : 0;
  const safeAverageValue = isNaN(averageValue) || !isFinite(averageValue) ? 0 : averageValue;

  // Calculate growth rate (comparing first and last month)
  const firstMonthData = data.filter(row => row.month === 'Jan');
  const lastMonthData = data.filter(row => row.month === 'Jun');
  
  const firstMonthTotal = firstMonthData.reduce((sum, row) => {
    const value = row.totalValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0);
  
  const lastMonthTotal = lastMonthData.reduce((sum, row) => {
    const value = row.totalValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0);
  
  // Calculate growth rate with proper error handling
  let growthRate = 0;
  const safeFirstMonthTotal = isNaN(firstMonthTotal) || !isFinite(firstMonthTotal) ? 0 : firstMonthTotal;
  const safeLastMonthTotal = isNaN(lastMonthTotal) || !isFinite(lastMonthTotal) ? 0 : lastMonthTotal;
  
  if (safeFirstMonthTotal > 0) {
    growthRate = ((safeLastMonthTotal - safeFirstMonthTotal) / safeFirstMonthTotal) * 100;
  } else if (safeLastMonthTotal > 0) {
    growthRate = 100; // If starting from 0, any positive value is 100% growth
  }
  
  // Ensure growth rate is a valid number
  if (isNaN(growthRate) || !isFinite(growthRate)) {
    growthRate = 0;
  }

  // Create tiles
  const tiles = [
    // Total Records - Static tile (won't update with filters)
    TileBuilder.createInfoTile(
      'Total Records',
      totalRows.toString(),
      'Data Points',
      'fas fa-database',
      '#1e40af'
    )
      .setBackgroundColor('#bfdbfe')
      .setBorder('#7dd3fc', 1, 8)
      .setUpdateOnDataChange(false) // Static tile
      .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
      .build(),

    // Asset Categories - Dynamic tile (will update with filters)
    TileBuilder.createInfoTile(
      'Asset Categories',
      distinctAssetCategories.toString(),
      'Distinct Types',
      'fas fa-chart-pie',
      '#047857'
    )
      .setBackgroundColor('#a7f3d0')
      .setBorder('#5eead4', 1, 8)
      .setUpdateOnDataChange(true) // Dynamic tile
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    // Markets - Dynamic tile (will update with filters)
    TileBuilder.createInfoTile(
      'Markets',
      distinctMarkets.toString(),
      'Countries',
      'fas fa-globe',
      '#d97706'
    )
      .setBackgroundColor('#fbbf24')
      .setBorder('#f59e0b', 1, 8)
      .setUpdateOnDataChange(true) // Dynamic tile
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    // Total Value - Dynamic tile (will update with filters)
    TileBuilder.createFinancialTile(
      safeTotalValue,
      growthRate,
      'Portfolio Value',
      '$',
      'fas fa-dollar-sign'
    )
      .setColor('#047857')
      .setBackgroundColor('#a7f3d0')
      .setBorder('#5eead4', 1, 8)
      .setUpdateOnDataChange(true) // Dynamic tile
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    // Average Value - Dynamic tile (will update with filters)
    TileBuilder.createFinancialTile(
      safeAverageValue,
      0, // No change for average
      'Average Value',
      '$',
      'fas fa-calculator'
    )
      .setColor('#6b7280')
      .setBackgroundColor('#cbd5e1')
      .setBorder('#94a3b8', 1, 8)
      .setUpdateOnDataChange(true) // Dynamic tile
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    // Time Period - Static tile (won't update with filters)
    TileBuilder.createInfoTile(
      'Time Period',
      `${distinctMonths} months`,
      'Jan - Jun',
      'fas fa-calendar',
      '#7c3aed'
    )
      .setBackgroundColor('#c4b5fd')
      .setBorder('#a78bfa', 1, 8)
      .setUpdateOnDataChange(false) // Static tile
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  ];

  return tiles;
}

/**
 * Create alternative metric tiles with different styling
 */
export function createAlternativeMetricTiles(data: DashboardDataRow[]) {
  // Calculate additional metrics with safe handling
  const totalRows = data.length;
  const distinctAssetCategories = new Set(data.map(row => row.assetCategory)).size;
  const distinctMarkets = new Set(data.map(row => row.market)).size;
  
  // Safe total value calculation
  const totalValue = data.reduce((sum, row) => {
    const value = row.totalValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0);
  const safeTotalValue = isNaN(totalValue) || !isFinite(totalValue) ? 0 : totalValue;
  
  // Calculate risk metrics with safe handling
  const riskData = data.filter(row => row.riskValue !== undefined && row.riskValue !== null);
  const averageRisk = riskData.length > 0 
    ? riskData.reduce((sum, row) => {
        const value = row.riskValue || 0;
        return isNaN(value) || !isFinite(value) ? sum : sum + value;
      }, 0) / riskData.length 
    : 0;
  
  // Calculate return metrics with safe handling
  const returnData = data.filter(row => row.returnValue !== undefined && row.returnValue !== null);
  const averageReturn = returnData.length > 0 
    ? returnData.reduce((sum, row) => {
        const value = row.returnValue || 0;
        return isNaN(value) || !isFinite(value) ? sum : sum + value;
      }, 0) / returnData.length 
    : 0;

  // Ensure averages are valid numbers
  const safeAverageRisk = isNaN(averageRisk) || !isFinite(averageRisk) ? 0 : averageRisk;
  const safeAverageReturn = isNaN(averageReturn) || !isFinite(averageReturn) ? 0 : averageReturn;

  return [
    // Data Coverage
    TileBuilder.createStatusTile(
      'Data Coverage',
      `${totalRows} records`,
      true,
      'fas fa-check-circle',
      '#047857'
    )
      .setBackgroundColor('#a7f3d0')
      .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
      .build(),

    // Asset Diversity
    TileBuilder.createPercentageTile(
      totalRows > 0 ? (distinctAssetCategories / totalRows) * 100 : 0,
      'Asset Diversity',
      'fas fa-layer-group',
      '#1e40af'
    )
      .setBackgroundColor('#bfdbfe')
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    // Global Reach
    TileBuilder.createMetricTile(
      distinctMarkets.toString(),
      '+100%',
      'Global Markets',
      'fas fa-map-marked-alt',
      '#d97706'
    )
      .setBackgroundColor('#fbbf24')
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    // Portfolio Value
    TileBuilder.createFinancialTile(
      safeTotalValue,
      12.5, // Mock growth rate
      'Portfolio Value',
      '$',
      'fas fa-chart-line'
    )
      .setColor('#047857')
      .setBackgroundColor('#a7f3d0')
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    // Average Risk
    TileBuilder.createPercentageTile(
      safeAverageRisk * 100,
      'Average Risk',
      'fas fa-shield-alt',
      '#dc2626'
    )
      .setBackgroundColor('#fca5a5')
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    // Average Return
    TileBuilder.createPercentageTile(
      safeAverageReturn * 100,
      'Average Return',
      'fas fa-trending-up',
      '#047857'
    )
      .setBackgroundColor('#a7f3d0')
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  ];
} 