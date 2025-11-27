import { BaseEntity } from './base-entity';
import { WatchlistItem } from './watchlist-item';

/**
 * Represents a watchlist of securities or assets
 */
export interface Watchlist extends BaseEntity {
  /**
   * The name of the watchlist
   */
  name: string;
  
  /**
   * A description of the watchlist
   */
  description?: string;
  
  /**
   * The items in the watchlist
   */
  items?: WatchlistItem[];
  
  /**
   * The date when the watchlist was created
   */
  createdAt?: string;
  
  /**
   * The date when the watchlist was last updated
   */
  updatedAt?: string;
  
  /**
   * The user ID of the owner of the watchlist
   */
  userId?: string;
  
  /**
   * Whether the watchlist is public or private
   */
  isPublic?: boolean;
  
  /**
   * The color associated with this watchlist for UI display
   */
  color?: string;
  
  /**
   * The icon associated with this watchlist for UI display
   */
  icon?: string;
  
  /**
   * The order or position of this watchlist in a list
   */
  order?: number;
  
  /**
   * Tags or categories associated with this watchlist
   */
  tags?: string[];
}