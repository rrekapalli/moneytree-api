/**
 * Interface representing stock historical OHLCV data.
 * Based on the Java StockHistoricalDataDto from com.moneyplant.stock.dtos.StockHistoricalDataDto
 */
export interface StockHistoricalData {
  symbol: string;
  date: string; // ISO date string representation of LocalDate
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
