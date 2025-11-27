/**
 * Operator constants matching Angular-QueryBuilder pattern
 */
export const OPERATORS = {
  equal: '=',
  notEqual: '!=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  in: 'in',
  notIn: 'not in',
  contains: 'contains',
  between: 'between'
} as const;

/**
 * Input type constants for different field types
 */
export const INPUT_TYPES = {
  text: 'text',
  number: 'number',
  date: 'date',
  boolean: 'boolean',
  select: 'select',
  multiselect: 'multiselect'
} as const;

/**
 * Utility type for operator values
 */
export type OperatorType = typeof OPERATORS[keyof typeof OPERATORS];

/**
 * Utility type for input types
 */
export type InputType = typeof INPUT_TYPES[keyof typeof INPUT_TYPES];

/**
 * Default operators for different field types
 */
export const DEFAULT_OPERATORS_BY_TYPE: Record<string, string[]> = {
  string: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.contains],
  number: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
  date: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
  boolean: [OPERATORS.equal],
  category: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.in, OPERATORS.notIn],
  multiselect: [OPERATORS.in, OPERATORS.notIn]
};