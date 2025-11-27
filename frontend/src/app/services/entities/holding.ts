import { BaseEntity } from './base-entity';

/**
 * Represents a holding of a security or asset
 */
export interface Holding extends BaseEntity {
  /**
   * The symbol or identifier of the security
   */
  symbol: string;
  
  /**
   * The name of the security or asset
   */
  name: string;
  
  /**
   * The quantity or number of shares held
   */
  quantity: number;
  
  /**
   * The average purchase price per share
   */
  averagePrice: number;
  
  /**
   * The current market price per share
   */
  currentPrice: number;
  
  /**
   * The total investment value (quantity * averagePrice)
   */
  investmentValue: number;
  
  /**
   * The current market value (quantity * currentPrice)
   */
  currentValue: number;
  
  /**
   * The profit or loss amount (currentValue - investmentValue)
   */
  profitLoss: number;
  
  /**
   * The profit or loss percentage ((currentValue - investmentValue) / investmentValue * 100)
   */
  profitLossPercentage: number;
  
  /**
   * The date when the holding was last updated
   */
  lastUpdated?: string;
  
  /**
   * The group or category this holding belongs to
   */
  groupId?: string;
  
  /**
   * Any additional notes or information about the holding
   */
  notes?: string;
}