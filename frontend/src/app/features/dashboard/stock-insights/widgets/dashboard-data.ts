// Shared data model for all widgets - Flat structure
export interface DashboardDataRow {
  id: string;
  assetCategory: string;  // For Asset Allocation, Risk vs Return
  month: string;          // For Monthly Income/Expenses, Portfolio Performance
  market: string;         // For Investment Distribution map
  totalValue: number;     // Primary value for most charts
  riskValue?: number;     // For Risk vs Return scatter
  returnValue?: number;   // For Risk vs Return scatter
  description?: string;   // Additional context
}

// Initial dashboard data - Flat structure
export const INITIAL_DASHBOARD_DATA: DashboardDataRow[] = [
  // Asset Allocation & Risk vs Return data (same categories for all charts)
  { id: '1', assetCategory: 'Stocks', month: 'Jan', market: 'United States', totalValue: 45, riskValue: 0.12, returnValue: 0.15 },
  { id: '2', assetCategory: 'Bonds', month: 'Jan', market: 'United States', totalValue: 25, riskValue: 0.05, returnValue: 0.08 },
  { id: '3', assetCategory: 'Cash', month: 'Jan', market: 'United States', totalValue: 15, riskValue: 0.03, returnValue: 0.05 },
  { id: '4', assetCategory: 'Real Estate', month: 'Jan', market: 'United States', totalValue: 10, riskValue: 0.08, returnValue: 0.10 },
  { id: '5', assetCategory: 'Commodities', month: 'Jan', market: 'United States', totalValue: 5, riskValue: 0.20, returnValue: 0.25 },
  
  // Monthly Income/Expenses data (using same categories)
  { id: '6', assetCategory: 'Stocks', month: 'Feb', market: 'United States', totalValue: 48, riskValue: 0.13, returnValue: 0.16 },
  { id: '7', assetCategory: 'Bonds', month: 'Feb', market: 'United States', totalValue: 26, riskValue: 0.06, returnValue: 0.09 },
  { id: '8', assetCategory: 'Cash', month: 'Feb', market: 'United States', totalValue: 16, riskValue: 0.04, returnValue: 0.06 },
  { id: '9', assetCategory: 'Real Estate', month: 'Feb', market: 'United States', totalValue: 11, riskValue: 0.09, returnValue: 0.11 },
  { id: '10', assetCategory: 'Commodities', month: 'Feb', market: 'United States', totalValue: 6, riskValue: 0.21, returnValue: 0.26 },
  
  // Portfolio Performance data (using same categories)
  { id: '11', assetCategory: 'Stocks', month: 'Mar', market: 'United States', totalValue: 50, riskValue: 0.14, returnValue: 0.17 },
  { id: '12', assetCategory: 'Bonds', month: 'Mar', market: 'United States', totalValue: 27, riskValue: 0.07, returnValue: 0.10 },
  { id: '13', assetCategory: 'Cash', month: 'Mar', market: 'United States', totalValue: 17, riskValue: 0.05, returnValue: 0.07 },
  { id: '14', assetCategory: 'Real Estate', month: 'Mar', market: 'United States', totalValue: 12, riskValue: 0.10, returnValue: 0.12 },
  { id: '15', assetCategory: 'Commodities', month: 'Mar', market: 'United States', totalValue: 7, riskValue: 0.22, returnValue: 0.27 },
  
  // Additional months for time series
  { id: '16', assetCategory: 'Stocks', month: 'Apr', market: 'United States', totalValue: 52, riskValue: 0.15, returnValue: 0.18 },
  { id: '17', assetCategory: 'Bonds', month: 'Apr', market: 'United States', totalValue: 28, riskValue: 0.08, returnValue: 0.11 },
  { id: '18', assetCategory: 'Cash', month: 'Apr', market: 'United States', totalValue: 18, riskValue: 0.06, returnValue: 0.08 },
  { id: '19', assetCategory: 'Real Estate', month: 'Apr', market: 'United States', totalValue: 13, riskValue: 0.11, returnValue: 0.13 },
  { id: '20', assetCategory: 'Commodities', month: 'Apr', market: 'United States', totalValue: 8, riskValue: 0.23, returnValue: 0.28 },
  
  { id: '21', assetCategory: 'Stocks', month: 'May', market: 'United States', totalValue: 55, riskValue: 0.16, returnValue: 0.19 },
  { id: '22', assetCategory: 'Bonds', month: 'May', market: 'United States', totalValue: 29, riskValue: 0.09, returnValue: 0.12 },
  { id: '23', assetCategory: 'Cash', month: 'May', market: 'United States', totalValue: 19, riskValue: 0.07, returnValue: 0.09 },
  { id: '24', assetCategory: 'Real Estate', month: 'May', market: 'United States', totalValue: 14, riskValue: 0.12, returnValue: 0.14 },
  { id: '25', assetCategory: 'Commodities', month: 'May', market: 'United States', totalValue: 9, riskValue: 0.24, returnValue: 0.29 },
  
  { id: '26', assetCategory: 'Stocks', month: 'Jun', market: 'United States', totalValue: 58, riskValue: 0.17, returnValue: 0.20 },
  { id: '27', assetCategory: 'Bonds', month: 'Jun', market: 'United States', totalValue: 30, riskValue: 0.10, returnValue: 0.13 },
  { id: '28', assetCategory: 'Cash', month: 'Jun', market: 'United States', totalValue: 20, riskValue: 0.08, returnValue: 0.10 },
  { id: '29', assetCategory: 'Real Estate', month: 'Jun', market: 'United States', totalValue: 15, riskValue: 0.13, returnValue: 0.15 },
  { id: '30', assetCategory: 'Commodities', month: 'Jun', market: 'United States', totalValue: 10, riskValue: 0.25, returnValue: 0.30 },
  
  // Test Filter data (using same categories)
  { id: '31', assetCategory: 'Stocks', month: 'Jan', market: 'Germany', totalValue: 35, riskValue: 0.10, returnValue: 0.12 },
  { id: '32', assetCategory: 'Bonds', month: 'Jan', market: 'Germany', totalValue: 20, riskValue: 0.04, returnValue: 0.06 },
  { id: '33', assetCategory: 'Cash', month: 'Jan', market: 'Germany', totalValue: 12, riskValue: 0.02, returnValue: 0.04 },
  { id: '34', assetCategory: 'Real Estate', month: 'Jan', market: 'Germany', totalValue: 8, riskValue: 0.06, returnValue: 0.08 },
  { id: '35', assetCategory: 'Commodities', month: 'Jan', market: 'Germany', totalValue: 4, riskValue: 0.18, returnValue: 0.22 },
  
  // Additional market data for map charts
  { id: '36', assetCategory: 'Stocks', month: 'Jan', market: 'China', totalValue: 40, riskValue: 0.15, returnValue: 0.18 },
  { id: '37', assetCategory: 'Bonds', month: 'Jan', market: 'China', totalValue: 18, riskValue: 0.06, returnValue: 0.09 },
  { id: '38', assetCategory: 'Cash', month: 'Jan', market: 'China', totalValue: 14, riskValue: 0.03, returnValue: 0.05 },
  { id: '39', assetCategory: 'Real Estate', month: 'Jan', market: 'China', totalValue: 9, riskValue: 0.09, returnValue: 0.11 },
  { id: '40', assetCategory: 'Commodities', month: 'Jan', market: 'China', totalValue: 6, riskValue: 0.19, returnValue: 0.23 },
  
  { id: '41', assetCategory: 'Stocks', month: 'Jan', market: 'Japan', totalValue: 25, riskValue: 0.20, returnValue: 0.25 },
  { id: '42', assetCategory: 'Bonds', month: 'Jan', market: 'Japan', totalValue: 12, riskValue: 0.08, returnValue: 0.11 },
  { id: '43', assetCategory: 'Cash', month: 'Jan', market: 'Japan', totalValue: 10, riskValue: 0.05, returnValue: 0.07 },
  { id: '44', assetCategory: 'Real Estate', month: 'Jan', market: 'Japan', totalValue: 7, riskValue: 0.12, returnValue: 0.14 },
  { id: '45', assetCategory: 'Commodities', month: 'Jan', market: 'Japan', totalValue: 5, riskValue: 0.22, returnValue: 0.27 }
]; 