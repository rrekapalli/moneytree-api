import { BaseEntity } from './base-entity';

/**
 * Represents an item in a watchlist
 */
export interface WatchlistItem extends BaseEntity {
  /**
   * The symbol or identifier of the security
   */
  symbol: string;
  
  /**
   * The name of the security or asset
   */
  name: string;
  
  /**
   * The current price of the security
   */
  currentPrice?: number;
  
  /**
   * The change in price (absolute value)
   */
  change?: number;
  
  /**
   * The percentage change in price
   */
  changePercent?: number;
  
  /**
   * The date when the item was added to the watchlist
   */
  addedAt?: string;
  
  /**
   * The date when the item was last updated
   */
  updatedAt?: string;
  
  /**
   * The ID of the watchlist this item belongs to
   */
  watchlistId: string;
  
  /**
   * Notes or comments about this watchlist item
   */
  notes?: string;
  
  /**
   * Alert price level (high) - notify when price goes above this level
   */
  alertHigh?: number;
  
  /**
   * Alert price level (low) - notify when price goes below this level
   */
  alertLow?: number;
  
  /**
   * The order or position of this item in the watchlist
   */
  order?: number;
  
  /**
   * Tags or categories associated with this watchlist item
   */
  tags?: string[];
}