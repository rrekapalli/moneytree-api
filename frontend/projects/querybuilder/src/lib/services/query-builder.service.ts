import { Injectable } from '@angular/core';
import { Field } from '../models/field.model';
import { Option } from '../models/option.model';
import { Rule } from '../models/rule.model';
import { RuleSet, isRuleSet, isRule } from '../models/ruleset.model';
import { OPERATORS, DEFAULT_OPERATORS_BY_TYPE, INPUT_TYPES } from '../models/operators.model';
import { QueryValidationError, ValidationResult } from '../models/validation.model';

/**
 * QueryBuilderService replicating exact Angular-QueryBuilder logic
 * Provides core functionality for query building operations
 */
@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {

  /**
   * Get available operators for a field, exactly as in Angular-QueryBuilder
   * @param field Field to get operators for
   * @returns Array of operator strings
   */
  getOperators(field: Field): string[] {
    if (field.operators && field.operators.length > 0) {
      return field.operators;
    }
    
    return DEFAULT_OPERATORS_BY_TYPE[field.type] || [OPERATORS.equal, OPERATORS.notEqual];
  }

  /**
   * Get input type for field and operator combination, exactly as in Angular-QueryBuilder
   * @param field Field definition
   * @param operator Selected operator
   * @returns Input type string
   */
  getInputType(field: Field, operator: string): string {
    // Handle between operator specially
    if (operator === OPERATORS.between) {
      return 'between';
    }

    // Handle multiselect operators
    if (operator === OPERATORS.in || operator === OPERATORS.notIn) {
      if (field.options && field.options.length > 0) {
        return INPUT_TYPES.multiselect;
      }
      return INPUT_TYPES.text;
    }

    // Handle field type mapping
    switch (field.type) {
      case 'string':
        return INPUT_TYPES.text;
      case 'number':
        return INPUT_TYPES.number;
      case 'date':
        return INPUT_TYPES.date;
      case 'boolean':
        return INPUT_TYPES.boolean;
      case 'category':
        if (field.options && field.options.length > 0) {
          return INPUT_TYPES.select;
        }
        return INPUT_TYPES.text;
      case 'multiselect':
        return INPUT_TYPES.multiselect;
      default:
        return INPUT_TYPES.text;
    }
  }

  /**
   * Get options for a field, exactly as in Angular-QueryBuilder
   * @param field Field to get options for
   * @returns Array of options or empty array
   */
  getOptions(field: Field): Option[] {
    return field.options || [];
  }

  /**
   * Add a new rule to a ruleset, exactly as in Angular-QueryBuilder
   * @param ruleset Parent ruleset to add rule to
   * @param field Optional field to initialize rule with
   * @returns The newly created rule
   */
  addRule(ruleset: RuleSet, field?: Field): Rule {
    const newRule: Rule = {
      field: field?.name || '',
      operator: field?.defaultOperator || OPERATORS.equal,
      value: field?.defaultValue || null
    };

    if (field?.entity) {
      newRule.entity = field.entity;
    }

    ruleset.rules.push(newRule);
    return newRule;
  }

  /**
   * Add a new ruleset to a parent ruleset, exactly as in Angular-QueryBuilder
   * @param parent Parent ruleset to add new ruleset to
   * @returns The newly created ruleset
   */
  addRuleSet(parent: RuleSet): RuleSet {
    const newRuleSet: RuleSet = {
      condition: 'and',
      rules: []
    };

    parent.rules.push(newRuleSet);
    return newRuleSet;
  }

  /**
   * Remove a rule from a ruleset, exactly as in Angular-QueryBuilder
   * @param rule Rule to remove
   * @param ruleset Parent ruleset containing the rule
   */
  removeRule(rule: Rule, ruleset: RuleSet): void {
    const index = ruleset.rules.findIndex(r => r === rule);
    if (index !== -1) {
      ruleset.rules.splice(index, 1);
    }
  }

  /**
   * Remove a ruleset from a parent ruleset, exactly as in Angular-QueryBuilder
   * @param ruleset Ruleset to remove
   * @param parent Parent ruleset containing the ruleset
   */
  removeRuleSet(ruleset: RuleSet, parent: RuleSet): void {
    const index = parent.rules.findIndex(r => r === ruleset);
    if (index !== -1) {
      parent.rules.splice(index, 1);
    }
  }

  /**
   * Validate a complete ruleset, exactly as in Angular-QueryBuilder
   * @param ruleset Ruleset to validate
   * @param fields Available fields for validation
   * @param allowEmpty Whether to allow empty rulesets
   * @returns Validation result with errors
   */
  validateRuleset(ruleset: RuleSet, fields: Field[], allowEmpty: boolean = false): ValidationResult {
    const errors: QueryValidationError[] = [];

    // Check if ruleset is empty
    if (!ruleset.rules || ruleset.rules.length === 0) {
      if (!allowEmpty) {
        errors.push({
          type: 'structure',
          message: 'Ruleset cannot be empty'
        });
      }
      return { valid: errors.length === 0, errors };
    }

    // Validate each rule/ruleset recursively
    for (const rule of ruleset.rules) {
      if (isRuleSet(rule)) {
        const nestedResult = this.validateRuleset(rule, fields, allowEmpty);
        errors.push(...nestedResult.errors);
      } else if (isRule(rule)) {
        const ruleErrors = this.validateRule(rule, fields);
        errors.push(...ruleErrors);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate a single rule
   * @param rule Rule to validate
   * @param fields Available fields for validation
   * @returns Array of validation errors
   */
  private validateRule(rule: Rule, fields: Field[]): QueryValidationError[] {
    const errors: QueryValidationError[] = [];

    // Check if field exists
    const field = fields.find(f => f.name === rule.field);
    if (!field) {
      errors.push({
        type: 'field',
        field: rule.field,
        message: `Field '${rule.field}' is not valid`
      });
      return errors;
    }

    // Check if operator is valid for field
    const validOperators = this.getOperators(field);
    if (!validOperators.includes(rule.operator)) {
      errors.push({
        type: 'operator',
        field: rule.field,
        message: `Operator '${rule.operator}' is not valid for field '${rule.field}'`
      });
    }

    // Check if value is provided when required
    if (this.isValueRequired(rule.operator) && (rule.value === null || rule.value === undefined || rule.value === '')) {
      errors.push({
        type: 'value',
        field: rule.field,
        message: `Value is required for operator '${rule.operator}'`
      });
    }

    // Validate value type
    if (rule.value !== null && rule.value !== undefined && rule.value !== '') {
      const valueErrors = this.validateValue(rule.value, field, rule.operator);
      errors.push(...valueErrors);
    }

    return errors;
  }

  /**
   * Check if a value is required for an operator
   * @param operator Operator to check
   * @returns True if value is required
   */
  private isValueRequired(operator: string): boolean {
    // Some operators don't require values
    const noValueOperators = ['is null', 'is not null', 'is empty', 'is not empty'];
    return !noValueOperators.includes(operator);
  }

  /**
   * Validate a rule value against field constraints
   * @param value Value to validate
   * @param field Field definition
   * @param operator Selected operator
   * @returns Array of validation errors
   */
  private validateValue(value: any, field: Field, operator: string): QueryValidationError[] {
    const errors: QueryValidationError[] = [];

    // Handle between operator (expects array of two values)
    if (operator === OPERATORS.between) {
      if (!Array.isArray(value) || value.length !== 2) {
        errors.push({
          type: 'value',
          field: field.name,
          message: 'Between operator requires two values'
        });
        return errors;
      }

      // Validate both values in between array
      for (let i = 0; i < 2; i++) {
        const betweenErrors = this.validateSingleValue(value[i], field);
        errors.push(...betweenErrors);
      }
      return errors;
    }

    // Handle in/not in operators (expects array)
    if (operator === OPERATORS.in || operator === OPERATORS.notIn) {
      if (!Array.isArray(value)) {
        errors.push({
          type: 'value',
          field: field.name,
          message: `${operator} operator requires an array of values`
        });
        return errors;
      }

      // Validate each value in array
      for (const arrayValue of value) {
        const arrayErrors = this.validateSingleValue(arrayValue, field);
        errors.push(...arrayErrors);
      }
      return errors;
    }

    // Validate single value
    const singleValueErrors = this.validateSingleValue(value, field);
    errors.push(...singleValueErrors);

    return errors;
  }

  /**
   * Validate a single value against field type
   * @param value Value to validate
   * @param field Field definition
   * @returns Array of validation errors
   */
  private validateSingleValue(value: any, field: Field): QueryValidationError[] {
    const errors: QueryValidationError[] = [];

    switch (field.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            type: 'value',
            field: field.name,
            message: `Value must be a number for field '${field.name}'`
          });
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
          errors.push({
            type: 'value',
            field: field.name,
            message: `Value must be a boolean for field '${field.name}'`
          });
        }
        break;

      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push({
            type: 'value',
            field: field.name,
            message: `Value must be a valid date for field '${field.name}'`
          });
        }
        break;

      case 'category':
        if (field.options && field.options.length > 0) {
          const validValues = field.options.map(opt => opt.value);
          if (!validValues.includes(value)) {
            errors.push({
              type: 'value',
              field: field.name,
              message: `Value must be one of: ${validValues.join(', ')}`
            });
          }
        }
        break;
    }

    return errors;
  }

  /**
   * Create an empty ruleset with default condition
   * @param condition Default condition ('and' or 'or')
   * @returns Empty ruleset
   */
  createEmptyRuleset(condition: string = 'and'): RuleSet {
    return {
      condition,
      rules: []
    };
  }

  /**
   * Deep clone a ruleset to avoid mutation issues
   * @param ruleset Ruleset to clone
   * @returns Cloned ruleset
   */
  cloneRuleset(ruleset: RuleSet): RuleSet {
    return JSON.parse(JSON.stringify(ruleset));
  }

  /**
   * Count total number of rules in a ruleset (including nested)
   * @param ruleset Ruleset to count rules in
   * @returns Total number of rules
   */
  countRules(ruleset: RuleSet): number {
    let count = 0;
    
    for (const rule of ruleset.rules) {
      if (isRuleSet(rule)) {
        count += this.countRules(rule);
      } else {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Check if a ruleset is empty (no rules at any level)
   * @param ruleset Ruleset to check
   * @returns True if empty
   */
  isEmptyRuleset(ruleset: RuleSet): boolean {
    return this.countRules(ruleset) === 0;
  }
}