import { TestBed } from '@angular/core/testing';
import { QueryConverterService, ScreenerCriteria, ScreenerRule } from './query-converter.service';
import { RuleSet, Rule } from '../models/query-builder.models';

describe('QueryConverterService', () => {
  let service: QueryConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('convertQueryToScreenerCriteria', () => {
    it('should convert simple RuleSet to ScreenerCriteria', () => {
      const query: RuleSet = {
        condition: 'and',
        rules: [
          {
            field: 'marketCap',
            operator: '>',
            value: 1000000000
          } as Rule
        ]
      };

      const result = service.convertQueryToScreenerCriteria(query);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.condition).toBe('and');
      expect(result.data?.rules.length).toBe(1);
      
      const rule = result.data?.rules[0] as ScreenerRule;
      expect(rule.field).toBe('marketCap');
      expect(rule.operator).toBe('>');
      expect(rule.value).toBe(1000000000);
    });

    it('should handle empty query', () => {
      const query: RuleSet = {
        condition: 'and',
        rules: []
      };

      const result = service.convertQueryToScreenerCriteria(query);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('should validate invalid query structure', () => {
      const invalidQuery = {
        condition: 'invalid',
        rules: [
          {
            field: '',
            operator: '',
            value: null
          }
        ]
      } as RuleSet;

      const result = service.convertQueryToScreenerCriteria(invalidQuery);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('convertScreenerCriteriaToQuery', () => {
    it('should convert ScreenerCriteria to RuleSet', () => {
      const criteria: ScreenerCriteria = {
        condition: 'or',
        rules: [
          {
            field: 'pe',
            operator: '<',
            value: 20
          } as ScreenerRule
        ]
      };

      const result = service.convertScreenerCriteriaToQuery(criteria);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.condition).toBe('or');
      expect(result.data?.rules.length).toBe(1);
      
      const rule = result.data?.rules[0] as Rule;
      expect(rule.field).toBe('pe');
      expect(rule.operator).toBe('<');
      expect(rule.value).toBe(20);
    });

    it('should handle undefined criteria', () => {
      const result = service.convertScreenerCriteriaToQuery(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.condition).toBe('and');
      expect(result.data?.rules.length).toBe(0);
    });
  });

  describe('validateApiCompatibility', () => {
    it('should validate compatible query', () => {
      const query: RuleSet = {
        condition: 'and',
        rules: [
          {
            field: 'marketCap',
            operator: '>',
            value: 1000000000
          } as Rule
        ]
      };

      const errors = service.validateApiCompatibility(query);

      expect(errors.length).toBe(0);
    });

    it('should detect invalid condition', () => {
      const query: RuleSet = {
        condition: 'invalid' as any,
        rules: []
      };

      const errors = service.validateApiCompatibility(query);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].type).toBe('structure');
      expect(errors[0].message).toContain('Invalid condition');
    });

    it('should detect missing field', () => {
      const query: RuleSet = {
        condition: 'and',
        rules: [
          {
            field: '',
            operator: '>',
            value: 100
          } as Rule
        ]
      };

      const errors = service.validateApiCompatibility(query);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.type === 'field')).toBe(true);
    });
  });
});