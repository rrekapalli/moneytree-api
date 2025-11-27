import { BaseEntity } from './base-entity';

/**
 * Represents a summary of market data for an index or market segment
 */
export interface MarketSummary extends BaseEntity {
  /**
   * The name of the index or market segment
   */
  name: string;

  /**
   * The display name of the index
   */
  indexName: string;

  /**
   * The current value of the index
   */
  value: number;

  /**
   * The change in value (absolute)
   */
  change: number;

  /**
   * The percentage change in value
   */
  changePercent: number;

  /**
   * The volume of shares traded
   */
  volume?: number;

  /**
   * The opening value for the day
   */
  open?: number;

  /**
   * The previous closing value
   */
  previousClose?: number;

  /**
   * The day's high value
   */
  dayHigh?: number;

  /**
   * The day's low value
   */
  dayLow?: number;

  /**
   * The number of advancing stocks
   */
  advancers?: number;

  /**
   * The number of declining stocks
   */
  decliners?: number;

  /**
   * The number of unchanged stocks
   */
  unchanged?: number;

  /**
   * The timestamp of the data
   */
  timestamp?: string;
}
