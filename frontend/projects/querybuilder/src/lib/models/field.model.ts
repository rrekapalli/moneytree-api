import { Option } from './option.model';

/**
 * Field interface matching Angular-QueryBuilder pattern.
 * Defines the structure and behavior of a queryable field.
 * 
 * @example
 * ```typescript
 * const stockField: Field = {
 *   name: 'marketCap',
 *   type: 'number',
 *   label: 'Market Cap',
 *   operators: ['>', '<', '=', 'between'],
 *   defaultOperator: '>',
 *   defaultValue: 1000000000
 * };
 * ```
 */
export interface Field {
  /** Unique identifier for the field */
  name: string;
  
  /** Data type of the field (string, number, date, boolean, category, multiselect) */
  type: string;
  
  /** Human-readable label for display purposes */
  label?: string;
  
  /** Available options for category/multiselect fields */
  options?: Option[];
  
  /** Allowed operators for this field. If not specified, defaults based on type */
  operators?: string[];
  
  /** Default value when creating new rules with this field */
  defaultValue?: any;
  
  /** Default operator when creating new rules with this field */
  defaultOperator?: string;
  
  /** Whether the field can have null/empty values */
  nullable?: boolean;
  
  /** Entity or table name for database queries */
  entity?: string;
}

/**
 * Field type constants for type safety and consistency.
 * These match the supported field types in Angular-QueryBuilder.
 */
export const FIELD_TYPES = {
  /** Text/string fields */
  string: 'string',
  /** Numeric fields */
  number: 'number',
  /** Date/datetime fields */
  date: 'date',
  /** Boolean/checkbox fields */
  boolean: 'boolean',
  /** Single-select dropdown fields with predefined options */
  category: 'category',
  /** Multi-select fields with predefined options */
  multiselect: 'multiselect'
} as const;

/**
 * Utility type for field types providing type safety.
 * Use this type when you need to ensure a value is a valid field type.
 */
export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];