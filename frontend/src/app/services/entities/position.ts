import { BaseEntity } from './base-entity';

/**
 * Represents a trading position (open or closed)
 */
export interface Position extends BaseEntity {
  /**
   * The symbol or identifier of the security
   */
  symbol: string;
  
  /**
   * The name of the security or asset
   */
  name: string;
  
  /**
   * The type of position (e.g., 'long', 'short')
   */
  type: 'long' | 'short';
  
  /**
   * The quantity or number of shares/contracts
   */
  quantity: number;
  
  /**
   * The entry price per share/contract
   */
  entryPrice: number;
  
  /**
   * The current market price per share/contract
   */
  currentPrice: number;
  
  /**
   * The target price for taking profit
   */
  targetPrice?: number;
  
  /**
   * The stop loss price
   */
  stopLossPrice?: number;
  
  /**
   * The date when the position was opened
   */
  openDate: string;
  
  /**
   * The date when the position was closed (if applicable)
   */
  closeDate?: string;
  
  /**
   * The exit price when the position was closed (if applicable)
   */
  exitPrice?: number;
  
  /**
   * The status of the position (e.g., 'open', 'closed')
   */
  status: 'open' | 'closed';
  
  /**
   * The total cost of the position (quantity * entryPrice)
   */
  cost: number;
  
  /**
   * The current value of the position (quantity * currentPrice)
   */
  currentValue: number;
  
  /**
   * The profit or loss amount (currentValue - cost)
   */
  profitLoss: number;
  
  /**
   * The profit or loss percentage ((currentValue - cost) / cost * 100)
   */
  profitLossPercentage: number;
  
  /**
   * Any notes or comments about the position
   */
  notes?: string;
  
  /**
   * Tags or categories associated with this position
   */
  tags?: string[];
}