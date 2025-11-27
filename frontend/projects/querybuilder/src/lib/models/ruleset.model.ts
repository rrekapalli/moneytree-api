import { Rule } from './rule.model';

/**
 * RuleSet interface matching Angular-QueryBuilder pattern
 */
export interface RuleSet {
  condition: string;
  rules: Array<Rule | RuleSet>;
}

/**
 * Type guard to check if a rule is a RuleSet
 */
export function isRuleSet(rule: Rule | RuleSet): rule is RuleSet {
  return 'condition' in rule && 'rules' in rule;
}

/**
 * Type guard to check if a rule is a Rule
 */
export function isRule(rule: Rule | RuleSet): rule is Rule {
  return 'field' in rule && 'operator' in rule;
}