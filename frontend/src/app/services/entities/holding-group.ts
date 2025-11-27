import { BaseEntity } from './base-entity';
import { Holding } from './holding';

/**
 * Represents a group or category of holdings
 */
export interface HoldingGroup extends BaseEntity {
  /**
   * The name of the holding group
   */
  name: string;
  
  /**
   * A description of the holding group
   */
  description?: string;
  
  /**
   * The holdings that belong to this group
   */
  holdings?: Holding[];
  
  /**
   * The total investment value of all holdings in the group
   */
  totalInvestmentValue?: number;
  
  /**
   * The total current market value of all holdings in the group
   */
  totalCurrentValue?: number;
  
  /**
   * The total profit or loss amount for the group
   */
  totalProfitLoss?: number;
  
  /**
   * The profit or loss percentage for the group
   */
  profitLossPercentage?: number;
  
  /**
   * The date when the group was last updated
   */
  lastUpdated?: string;
  
  /**
   * The color or icon associated with this group for UI display
   */
  color?: string;
  
  /**
   * The icon associated with this group for UI display
   */
  icon?: string;
  
  /**
   * The order or position of this group in a list
   */
  order?: number;
}