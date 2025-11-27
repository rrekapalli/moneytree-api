import { Injectable } from '@angular/core';
import { Field } from '../models/field.model';
import { Option } from '../models/option.model';
import { QueryBuilderConfig } from '../models/query-builder.models';
import { 
  STOCK_FIELDS, 
  FIELD_TYPE_OPERATORS, 
  INPUT_TYPE_MAPPINGS,
  SECTOR_OPTIONS,
  MARKET_CAP_OPTIONS,
  EXCHANGE_OPTIONS
} from '../models/stock-fields.model';
import { OPERATORS, DEFAULT_OPERATORS_BY_TYPE } from '../models/operators.model';
import { ValidationContext } from '../models/validation.model';

/**
 * QueryBuilderConfigService following Angular-QueryBuilder pattern
 * Provides configuration and field management for stock screening
 */
@Injectable({
  providedIn: 'root'
})
export class QueryBuilderConfigService {

  /**
   * Get stock field configurations in Angular-QueryBuilder format
   * @returns Array of stock field definitions
   */
  getStockFields(): Field[] {
    return [...STOCK_FIELDS];
  }

  /**
   * Get a specific field by name
   * @param fieldName Name of the field to retrieve
   * @returns Field definition or undefined if not found
   */
  getField(fieldName: string): Field | undefined {
    return STOCK_FIELDS.find(field => field.name === fieldName);
  }

  /**
   * Get operators for specific field types using same logic as Angular-QueryBuilder
   * @param fieldType Type of field to get operators for
   * @returns Array of operator strings
   */
  getOperatorsForFieldType(fieldType: string): string[] {
    return FIELD_TYPE_OPERATORS[fieldType] || DEFAULT_OPERATORS_BY_TYPE[fieldType] || [OPERATORS.equal, OPERATORS.notEqual];
  }

  /**
   * Get operators for a specific field, exactly as in Angular-QueryBuilder
   * @param field Field to get operators for
   * @returns Array of operator strings
   */
  getOperatorsForField(field: Field): string[] {
    if (field.operators && field.operators.length > 0) {
      return field.operators;
    }
    
    return this.getOperatorsForFieldType(field.type);
  }

  /**
   * Get input type for field and operator combination, matching Angular-QueryBuilder behavior
   * @param field Field definition
   * @param operator Selected operator
   * @returns Input type string
   */
  getInputTypeForField(field: Field, operator: string): string {
    // Check field-specific input type mappings first
    const fieldTypeMappings = INPUT_TYPE_MAPPINGS[field.type];
    if (fieldTypeMappings && fieldTypeMappings[operator]) {
      return fieldTypeMappings[operator];
    }

    // Handle between operator specially
    if (operator === OPERATORS.between) {
      return 'between';
    }

    // Handle multiselect operators
    if (operator === OPERATORS.in || operator === OPERATORS.notIn) {
      if (field.options && field.options.length > 0) {
        return 'multiselect';
      }
      return 'text';
    }

    // Default field type mapping
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
        if (field.options && field.options.length > 0) {
          return 'select';
        }
        return 'text';
      case 'multiselect':
        return 'multiselect';
      default:
        return 'text';
    }
  }

  /**
   * Get options for a field, exactly as in Angular-QueryBuilder
   * @param field Field to get options for
   * @returns Array of options or empty array
   */
  getOptionsForField(field: Field): Option[] {
    return field.options || [];
  }

  /**
   * Create complete QueryBuilder configuration for stock screening
   * @param options Configuration options
   * @returns Complete QueryBuilderConfig object
   */
  createStockQueryBuilderConfig(options: {
    allowEmptyRulesets?: boolean;
    allowRuleset?: boolean;
    customFields?: Field[];
  } = {}): QueryBuilderConfig {
    const fields = options.customFields || this.getStockFields();
    
    return {
      fields,
      allowEmptyRulesets: options.allowEmptyRulesets ?? false,
      allowRuleset: options.allowRuleset ?? true,
      getOperators: (fieldName: string, field: Field) => this.getOperatorsForField(field),
      getInputType: (field: Field, operator: string) => this.getInputTypeForField(field, operator),
      getOptions: (field: Field) => this.getOptionsForField(field)
    };
  }

  /**
   * Validate field configuration and constraints matching Angular-QueryBuilder behavior
   * @param field Field to validate
   * @returns Validation result with any constraint violations
   */
  validateFieldConfiguration(field: Field): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required properties
    if (!field.name || field.name.trim() === '') {
      errors.push('Field name is required');
    }

    if (!field.type || field.type.trim() === '') {
      errors.push('Field type is required');
    }

    // Validate field type
    const validTypes = ['string', 'number', 'date', 'boolean', 'category', 'multiselect'];
    if (field.type && !validTypes.includes(field.type)) {
      errors.push(`Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate operators
    if (field.operators) {
      const validOperators = Object.values(OPERATORS) as string[];
      const invalidOperators = field.operators.filter(op => !validOperators.includes(op));
      if (invalidOperators.length > 0) {
        errors.push(`Invalid operators: ${invalidOperators.join(', ')}`);
      }
    }

    // Validate default operator
    if (field.defaultOperator) {
      const fieldOperators = this.getOperatorsForField(field);
      if (!fieldOperators.includes(field.defaultOperator)) {
        errors.push(`Default operator '${field.defaultOperator}' is not valid for this field`);
      }
    }

    // Validate options for category fields
    if (field.type === 'category' || field.type === 'multiselect') {
      if (!field.options || field.options.length === 0) {
        errors.push(`Field type '${field.type}' requires options to be defined`);
      } else {
        // Validate option structure
        for (let i = 0; i < field.options.length; i++) {
          const option = field.options[i];
          if (!option.name || option.value === undefined || option.value === null) {
            errors.push(`Option at index ${i} must have both 'name' and 'value' properties`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get field constraints for validation context
   * @param validationContext Optional validation context
   * @returns Field constraints object
   */
  getFieldConstraints(validationContext?: ValidationContext): Record<string, any> {
    const constraints: Record<string, any> = {};

    // Add default constraints for stock fields
    STOCK_FIELDS.forEach(field => {
      constraints[field.name] = {
        type: field.type,
        required: !field.nullable,
        operators: this.getOperatorsForField(field),
        options: field.options || []
      };

      // Add type-specific constraints
      switch (field.type) {
        case 'number':
          constraints[field.name].min = field.name === 'price' ? 0 : undefined;
          constraints[field.name].max = field.name === 'dividendYield' ? 100 : undefined;
          break;
        case 'string':
          constraints[field.name].minLength = 1;
          constraints[field.name].maxLength = field.name === 'symbol' ? 10 : 100;
          break;
        case 'date':
          constraints[field.name].minDate = new Date('1900-01-01');
          constraints[field.name].maxDate = new Date();
          break;
      }
    });

    // Apply custom validation context if provided
    if (validationContext) {
      if (validationContext.requiredFields) {
        validationContext.requiredFields.forEach(fieldName => {
          if (constraints[fieldName]) {
            constraints[fieldName].required = true;
          }
        });
      }

      if (validationContext.customValidators) {
        Object.keys(validationContext.customValidators).forEach(fieldName => {
          if (constraints[fieldName]) {
            constraints[fieldName].customValidator = validationContext.customValidators![fieldName];
          }
        });
      }
    }

    return constraints;
  }

  /**
   * Get default field configuration for creating new rules
   * @returns Default field (first field in stock fields)
   */
  getDefaultField(): Field {
    return STOCK_FIELDS[0];
  }

  /**
   * Get fields by category/type
   * @param category Category to filter by ('financial', 'technical', 'fundamental', etc.)
   * @returns Array of fields matching the category
   */
  getFieldsByCategory(category: string): Field[] {
    const categoryMappings: Record<string, string[]> = {
      'basic': ['symbol', 'companyName', 'sector', 'exchange', 'isListed'],
      'financial': ['marketCap', 'pe', 'pb', 'roe', 'debtToEquity', 'currentRatio', 'eps', 'bookValue'],
      'dividend': ['dividendYield', 'paysDividend'],
      'trading': ['price', 'volume', 'lastUpdated'],
      'boolean': ['hasEarnings', 'paysDividend', 'isListed']
    };

    const fieldNames = categoryMappings[category] || [];
    return STOCK_FIELDS.filter(field => fieldNames.includes(field.name));
  }

  /**
   * Get sector options for sector field
   * @returns Array of sector options
   */
  getSectorOptions(): Option[] {
    return [...SECTOR_OPTIONS];
  }

  /**
   * Get market cap options for market cap field
   * @returns Array of market cap options
   */
  getMarketCapOptions(): Option[] {
    return [...MARKET_CAP_OPTIONS];
  }

  /**
   * Get exchange options for exchange field
   * @returns Array of exchange options
   */
  getExchangeOptions(): Option[] {
    return [...EXCHANGE_OPTIONS];
  }

  /**
   * Check if a field supports a specific operator
   * @param fieldName Name of the field
   * @param operator Operator to check
   * @returns True if field supports the operator
   */
  isOperatorSupportedByField(fieldName: string, operator: string): boolean {
    const field = this.getField(fieldName);
    if (!field) {
      return false;
    }

    const supportedOperators = this.getOperatorsForField(field);
    return supportedOperators.includes(operator);
  }

  /**
   * Get human-readable label for an operator
   * @param operator Operator string
   * @returns Human-readable label
   */
  getOperatorLabel(operator: string): string {
    const operatorLabels: Record<string, string> = {
      [OPERATORS.equal]: 'equals',
      [OPERATORS.notEqual]: 'not equals',
      [OPERATORS.lessThan]: 'less than',
      [OPERATORS.lessThanOrEqual]: 'less than or equal',
      [OPERATORS.greaterThan]: 'greater than',
      [OPERATORS.greaterThanOrEqual]: 'greater than or equal',
      [OPERATORS.in]: 'in',
      [OPERATORS.notIn]: 'not in',
      [OPERATORS.contains]: 'contains',
      [OPERATORS.between]: 'between'
    };

    return operatorLabels[operator] || operator;
  }

  /**
   * Create a custom field configuration
   * @param config Field configuration parameters
   * @returns New field configuration
   */
  createCustomField(config: {
    name: string;
    type: string;
    label?: string;
    operators?: string[];
    options?: Option[];
    defaultValue?: any;
    defaultOperator?: string;
    nullable?: boolean;
  }): Field {
    const field: Field = {
      name: config.name,
      type: config.type,
      label: config.label || config.name,
      operators: config.operators || this.getOperatorsForFieldType(config.type),
      defaultOperator: config.defaultOperator || OPERATORS.equal,
      nullable: config.nullable ?? false
    };

    if (config.options) {
      field.options = config.options;
    }

    if (config.defaultValue !== undefined) {
      field.defaultValue = config.defaultValue;
    }

    return field;
  }
}