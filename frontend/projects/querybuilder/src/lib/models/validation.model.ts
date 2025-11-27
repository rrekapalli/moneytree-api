/**
 * Validation error interface for query builder
 */
export interface QueryValidationError {
  type: 'field' | 'operator' | 'value' | 'structure';
  field?: string;
  message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: QueryValidationError[];
}

/**
 * Validation context for rules and rulesets
 */
export interface ValidationContext {
  allowEmpty?: boolean;
  requiredFields?: string[];
  customValidators?: Record<string, (value: any) => boolean>;
}