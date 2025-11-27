import { Injectable } from '@angular/core';
import { Rule, RuleSet } from '../models/query-builder.models';
import { isRule, isRuleSet } from '../models/ruleset.model';

/**
 * API format interfaces for conversion
 */
export interface ScreenerCriteria {
  condition: 'and' | 'or';
  rules: (ScreenerRule | ScreenerCriteria)[];
  collapsed?: boolean;
}

export interface ScreenerRule {
  field: string;
  operator: string;
  value: any;
  entity?: string;
}

/**
 * Validation error interface for conversion operations
 */
export interface ConversionValidationError {
  type: 'field' | 'operator' | 'value' | 'structure';
  field?: string;
  message: string;
  path?: string;
}

/**
 * Conversion result interface
 */
export interface ConversionResult<T> {
  success: boolean;
  data?: T;
  errors?: ConversionValidationError[];
}

/**
 * Service for converting between QueryBuilder RuleSet format and API ScreenerCriteria format
 * Handles bidirectional conversion with validation and error handling
 */
@Injectable({
  providedIn: 'root'
})
export class QueryConverterService {

  /**
   * Convert RuleSet to ScreenerCriteria format for API submission
   * @param query The RuleSet to convert
   * @returns ConversionResult with ScreenerCriteria or validation errors
   */
  convertQueryToScreenerCriteria(query: RuleSet): ConversionResult<ScreenerCriteria> {
    try {
      // Validate input
      const validationErrors = this.validateRuleSet(query);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Handle empty query
      if (!query || !query.rules || query.rules.length === 0) {
        return {
          success: true,
          data: undefined
        };
      }

      // Convert RuleSet to ScreenerCriteria format
      const criteria: ScreenerCriteria = {
        condition: this.normalizeCondition(query.condition),
        rules: this.convertRuleSetToScreenerRules(query.rules)
      };

      return {
        success: true,
        data: criteria
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'structure',
          message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * Convert ScreenerCriteria to RuleSet format for QueryBuilder
   * @param criteria The ScreenerCriteria to convert
   * @returns ConversionResult with RuleSet or validation errors
   */
  convertScreenerCriteriaToQuery(criteria: ScreenerCriteria | undefined): ConversionResult<RuleSet> {
    try {
      // Handle undefined or empty criteria
      if (!criteria || !criteria.rules) {
        return {
          success: true,
          data: { condition: 'and', rules: [] }
        };
      }

      // Validate input
      const validationErrors = this.validateScreenerCriteria(criteria);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Convert ScreenerCriteria to RuleSet format
      const query: RuleSet = {
        condition: criteria.condition,
        rules: this.convertScreenerRulesToQueryRules(criteria.rules)
      };

      return {
        success: true,
        data: query
      };
    } catch (error) {
      return {
        success: false,
        errors: [{
          type: 'structure',
          message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * Validate API compatibility of a RuleSet before conversion
   * @param query The RuleSet to validate
   * @returns Array of validation errors
   */
  validateApiCompatibility(query: RuleSet): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];
    
    if (!query) {
      errors.push({
        type: 'structure',
        message: 'Query is null or undefined'
      });
      return errors;
    }

    // Validate condition
    if (!this.isValidCondition(query.condition)) {
      errors.push({
        type: 'structure',
        message: `Invalid condition: ${query.condition}. Must be 'and' or 'or'`
      });
    }

    // Validate rules recursively
    if (query.rules) {
      errors.push(...this.validateRulesRecursively(query.rules, ''));
    }

    return errors;
  }

  /**
   * Convert RuleSet rules to ScreenerRule/ScreenerCriteria array
   * @private
   */
  private convertRuleSetToScreenerRules(rules: Array<Rule | RuleSet>): Array<ScreenerRule | ScreenerCriteria> {
    const screenerRules: Array<ScreenerRule | ScreenerCriteria> = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      
      if (isRule(rule)) {
        // Convert individual rule
        screenerRules.push({
          field: rule.field,
          operator: rule.operator,
          value: this.normalizeValue(rule.value, rule.operator),
          entity: rule.entity
        });
      } else if (isRuleSet(rule)) {
        // Convert nested ruleset
        screenerRules.push({
          condition: this.normalizeCondition(rule.condition),
          rules: this.convertRuleSetToScreenerRules(rule.rules)
        });
      }
    }

    return screenerRules;
  }

  /**
   * Convert ScreenerRule/ScreenerCriteria array to RuleSet rules
   * @private
   */
  private convertScreenerRulesToQueryRules(screenerRules: Array<ScreenerRule | ScreenerCriteria>): Array<Rule | RuleSet> {
    const rules: Array<Rule | RuleSet> = [];

    for (const screenerRule of screenerRules) {
      if ('field' in screenerRule) {
        // Convert ScreenerRule to Rule
        rules.push({
          field: screenerRule.field,
          operator: screenerRule.operator,
          value: screenerRule.value,
          entity: screenerRule.entity
        });
      } else {
        // Convert ScreenerCriteria to RuleSet
        rules.push({
          condition: screenerRule.condition,
          rules: this.convertScreenerRulesToQueryRules(screenerRule.rules)
        });
      }
    }

    return rules;
  }

  /**
   * Validate RuleSet structure
   * @private
   */
  private validateRuleSet(query: RuleSet, path: string = ''): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    if (!query) {
      errors.push({
        type: 'structure',
        message: 'RuleSet is null or undefined',
        path
      });
      return errors;
    }

    // Validate condition
    if (!this.isValidCondition(query.condition)) {
      errors.push({
        type: 'structure',
        message: `Invalid condition: ${query.condition}. Must be 'and' or 'or'`,
        path
      });
    }

    // Validate rules
    if (!Array.isArray(query.rules)) {
      errors.push({
        type: 'structure',
        message: 'Rules must be an array',
        path
      });
    } else {
      errors.push(...this.validateRulesRecursively(query.rules, path));
    }

    return errors;
  }

  /**
   * Validate ScreenerCriteria structure
   * @private
   */
  private validateScreenerCriteria(criteria: ScreenerCriteria, path: string = ''): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    if (!criteria) {
      errors.push({
        type: 'structure',
        message: 'ScreenerCriteria is null or undefined',
        path
      });
      return errors;
    }

    // Validate condition
    if (!this.isValidCondition(criteria.condition)) {
      errors.push({
        type: 'structure',
        message: `Invalid condition: ${criteria.condition}. Must be 'and' or 'or'`,
        path
      });
    }

    // Validate rules
    if (!Array.isArray(criteria.rules)) {
      errors.push({
        type: 'structure',
        message: 'Rules must be an array',
        path
      });
    } else {
      errors.push(...this.validateScreenerRulesRecursively(criteria.rules, path));
    }

    return errors;
  }

  /**
   * Validate rules array recursively
   * @private
   */
  private validateRulesRecursively(rules: Array<Rule | RuleSet>, path: string): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const rulePath = `${path}.rules[${i}]`;

      if (isRule(rule)) {
        errors.push(...this.validateRule(rule, rulePath));
      } else if (isRuleSet(rule)) {
        errors.push(...this.validateRuleSet(rule, rulePath));
      } else {
        errors.push({
          type: 'structure',
          message: 'Invalid rule type. Must be Rule or RuleSet',
          path: rulePath
        });
      }
    }

    return errors;
  }

  /**
   * Validate screener rules array recursively
   * @private
   */
  private validateScreenerRulesRecursively(rules: Array<ScreenerRule | ScreenerCriteria>, path: string): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const rulePath = `${path}.rules[${i}]`;

      if ('field' in rule) {
        errors.push(...this.validateScreenerRule(rule, rulePath));
      } else {
        errors.push(...this.validateScreenerCriteria(rule, rulePath));
      }
    }

    return errors;
  }

  /**
   * Validate individual Rule
   * @private
   */
  private validateRule(rule: Rule, path: string): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    if (!rule.field || typeof rule.field !== 'string') {
      errors.push({
        type: 'field',
        field: rule.field,
        message: 'Field name is required and must be a string',
        path
      });
    }

    if (!rule.operator || typeof rule.operator !== 'string') {
      errors.push({
        type: 'operator',
        field: rule.field,
        message: 'Operator is required and must be a string',
        path
      });
    }

    // Validate value based on operator
    if (this.requiresValue(rule.operator) && (rule.value === null || rule.value === undefined)) {
      errors.push({
        type: 'value',
        field: rule.field,
        message: `Value is required for operator '${rule.operator}'`,
        path
      });
    }

    return errors;
  }

  /**
   * Validate individual ScreenerRule
   * @private
   */
  private validateScreenerRule(rule: ScreenerRule, path: string): ConversionValidationError[] {
    const errors: ConversionValidationError[] = [];

    if (!rule.field || typeof rule.field !== 'string') {
      errors.push({
        type: 'field',
        field: rule.field,
        message: 'Field name is required and must be a string',
        path
      });
    }

    if (!rule.operator || typeof rule.operator !== 'string') {
      errors.push({
        type: 'operator',
        field: rule.field,
        message: 'Operator is required and must be a string',
        path
      });
    }

    // Validate value based on operator
    if (this.requiresValue(rule.operator) && (rule.value === null || rule.value === undefined)) {
      errors.push({
        type: 'value',
        field: rule.field,
        message: `Value is required for operator '${rule.operator}'`,
        path
      });
    }

    return errors;
  }

  /**
   * Check if condition is valid
   * @private
   */
  private isValidCondition(condition: string): condition is 'and' | 'or' {
    return condition === 'and' || condition === 'or';
  }

  /**
   * Normalize condition to ensure it's valid
   * @private
   */
  private normalizeCondition(condition: string): 'and' | 'or' {
    const normalized = condition?.toLowerCase();
    return normalized === 'or' ? 'or' : 'and';
  }

  /**
   * Check if operator requires a value
   * @private
   */
  private requiresValue(operator: string): boolean {
    const noValueOperators = ['is_null', 'is_not_null', 'is_empty', 'is_not_empty'];
    return !noValueOperators.includes(operator?.toLowerCase());
  }

  /**
   * Normalize value based on operator type
   * @private
   */
  private normalizeValue(value: any, operator: string): any {
    if (!this.requiresValue(operator)) {
      return null;
    }

    // Handle array values for 'in' and 'not in' operators
    if (['in', 'not_in', 'not in'].includes(operator?.toLowerCase())) {
      if (!Array.isArray(value)) {
        return value !== null && value !== undefined ? [value] : [];
      }
    }

    // Handle between operator - ensure array with two values
    if (operator?.toLowerCase() === 'between') {
      if (!Array.isArray(value)) {
        return [value, value];
      }
      if (value.length === 1) {
        return [value[0], value[0]];
      }
      return value.slice(0, 2); // Only take first two values
    }

    return value;
  }
}