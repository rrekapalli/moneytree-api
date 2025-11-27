/**
 * Rule interface matching Angular-QueryBuilder pattern
 */
export interface Rule {
  field: string;
  operator: string;
  value?: any;
  entity?: string;
}

/**
 * Local rule metadata interface for internal component state
 */
export interface LocalRuleMeta {
  ruleset: boolean;
  invalid: boolean;
}