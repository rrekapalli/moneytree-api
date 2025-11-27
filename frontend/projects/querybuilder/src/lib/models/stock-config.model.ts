import { QueryBuilderConfig } from './query-builder.models';
import { Field } from './field.model';
import { Option } from './option.model';
import { STOCK_FIELDS, FIELD_TYPE_OPERATORS, INPUT_TYPE_MAPPINGS } from './stock-fields.model';

/**
 * Stock screener query builder configuration following Angular-QueryBuilder pattern
 */
export class StockQueryBuilderConfig implements QueryBuilderConfig {
  fields: Field[] = STOCK_FIELDS;
  allowEmptyRulesets: boolean = true;
  allowRuleset: boolean = true;

  /**
   * Get operators for a specific field following Angular-QueryBuilder pattern
   */
  getOperators = (fieldName: string, field: Field): string[] => {
    if (field.operators && field.operators.length > 0) {
      return field.operators;
    }
    return FIELD_TYPE_OPERATORS[field.type] || [];
  };

  /**
   * Get input type for field and operator combination following Angular-QueryBuilder pattern
   */
  getInputType = (field: Field, operator: string): string => {
    const typeMapping = INPUT_TYPE_MAPPINGS[field.type];
    if (typeMapping && typeMapping[operator]) {
      return typeMapping[operator];
    }
    
    // Default input types based on field type
    switch (field.type) {
      case 'string':
        return 'text';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'boolean':
        return 'boolean';
      case 'category':
        return operator === 'in' || operator === 'not in' ? 'multiselect' : 'select';
      case 'multiselect':
        return 'multiselect';
      default:
        return 'text';
    }
  };

  /**
   * Get options for a field following Angular-QueryBuilder pattern
   */
  getOptions = (field: Field): Option[] => {
    return field.options || [];
  };
}

/**
 * Factory function to create stock query builder configuration
 */
export function createStockQueryBuilderConfig(): QueryBuilderConfig {
  return new StockQueryBuilderConfig();
}

/**
 * Default stock query builder configuration instance
 */
export const DEFAULT_STOCK_CONFIG: QueryBuilderConfig = createStockQueryBuilderConfig();