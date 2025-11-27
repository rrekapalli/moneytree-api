import { BaseEntity } from './base-entity';

/**
 * Represents market data for a stock or security
 */
export interface MarketData extends BaseEntity {
  /**
   * The stock symbol or ticker
   */
  symbol: string;

  /**
   * The company or security name
   */
  name: string;

  /**
   * The current price of the stock
   */
  price: number;

  /**
   * The change in price (absolute value)
   */
  change: number;

  /**
   * The percentage change in price
   */
  changePercent: number;

  /**
   * The volume of shares traded
   */
  volume: number;

  /**
   * The market capitalization of the company
   */
  marketCap: number;

  /**
   * The 52-week high price
   */
  high52Week?: number;

  /**
   * The 52-week low price
   */
  low52Week?: number;

  /**
   * The price-to-earnings ratio
   */
  pe?: number;

  /**
   * The earnings per share
   */
  eps?: number;

  /**
   * The dividend yield as a percentage
   */
  dividendYield?: number;

  /**
   * The opening price for the day
   */
  open?: number;

  /**
   * The previous closing price
   */
  previousClose?: number;

  /**
   * The day's high price
   */
  dayHigh?: number;

  /**
   * The day's low price
   */
  dayLow?: number;
}
