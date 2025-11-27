import { BaseEntity } from './base-entity';

/**
 * Represents a summary of all positions
 */
export interface PositionsSummary extends BaseEntity {
  /**
   * The total number of open positions
   */
  totalOpenPositions: number;
  
  /**
   * The total number of closed positions
   */
  totalClosedPositions?: number;
  
  /**
   * The total cost of all open positions
   */
  totalCost: number;
  
  /**
   * The total current value of all open positions
   */
  totalCurrentValue: number;
  
  /**
   * The total profit or loss amount (totalCurrentValue - totalCost)
   */
  totalProfitLoss: number;
  
  /**
   * The total profit or loss percentage ((totalCurrentValue - totalCost) / totalCost * 100)
   */
  totalProfitLossPercentage: number;
  
  /**
   * The number of profitable positions
   */
  profitablePositions?: number;
  
  /**
   * The number of losing positions
   */
  losingPositions?: number;
  
  /**
   * The total profit from profitable positions
   */
  totalProfit?: number;
  
  /**
   * The total loss from losing positions
   */
  totalLoss?: number;
  
  /**
   * The date when the summary was last updated
   */
  lastUpdated: string;
  
  /**
   * The win rate (profitablePositions / (profitablePositions + losingPositions) * 100)
   */
  winRate?: number;
  
  /**
   * The average profit per winning position
   */
  averageProfit?: number;
  
  /**
   * The average loss per losing position
   */
  averageLoss?: number;
}