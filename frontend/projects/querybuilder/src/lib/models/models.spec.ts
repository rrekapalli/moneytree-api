import { 
  QueryBuilderConfig, 
  Field, 
  Rule, 
  RuleSet, 
  OPERATORS, 
  STOCK_FIELDS, 
  DEFAULT_STOCK_CONFIG,
  isRule,
  isRuleSet,
  StockQueryBuilderConfig
} from './index';

describe('QueryBuilder Models', () => {
  describe('Core Interfaces', () => {
    it('should create a valid Rule', () => {
      const rule: Rule = {
        field: 'marketCap',
        operator: OPERATORS.greaterThan,
        value: 1000000000
      };

      expect(rule.field).toBe('marketCap');
      expect(rule.operator).toBe('>');
      expect(rule.value).toBe(1000000000);
    });

    it('should create a valid RuleSet', () => {
      const ruleSet: RuleSet = {
        condition: 'and',
        rules: [
          {
            field: 'marketCap',
            operator: OPERATORS.greaterThan,
            value: 1000000000
          }
        ]
      };

      expect(ruleSet.condition).toBe('and');
      expect(ruleSet.rules.length).toBe(1);
    });

    it('should identify Rule vs RuleSet correctly', () => {
      const rule: Rule = {
        field: 'pe',
        operator: OPERATORS.lessThan,
        value: 20
      };

      const ruleSet: RuleSet = {
        condition: 'or',
        rules: []
      };

      expect(isRule(rule)).toBe(true);
      expect(isRuleSet(rule)).toBe(false);
      expect(isRule(ruleSet)).toBe(false);
      expect(isRuleSet(ruleSet)).toBe(true);
    });
  });

  describe('Stock Fields Configuration', () => {
    it('should have valid stock fields', () => {
      expect(STOCK_FIELDS).toBeDefined();
      expect(STOCK_FIELDS.length).toBeGreaterThan(0);

      const marketCapField = STOCK_FIELDS.find(f => f.name === 'marketCap');
      expect(marketCapField).toBeDefined();
      expect(marketCapField?.type).toBe('number');
      expect(marketCapField?.defaultOperator).toBe(OPERATORS.greaterThan);
    });

    it('should have valid sector field with options', () => {
      const sectorField = STOCK_FIELDS.find(f => f.name === 'sector');
      expect(sectorField).toBeDefined();
      expect(sectorField?.type).toBe('category');
      expect(sectorField?.options).toBeDefined();
      expect(sectorField?.options?.length).toBeGreaterThan(0);
    });

    it('should have valid boolean fields', () => {
      const hasEarningsField = STOCK_FIELDS.find(f => f.name === 'hasEarnings');
      expect(hasEarningsField).toBeDefined();
      expect(hasEarningsField?.type).toBe('boolean');
      expect(hasEarningsField?.operators).toEqual([OPERATORS.equal]);
    });
  });

  describe('Stock Query Builder Configuration', () => {
    it('should create valid configuration', () => {
      const config = new StockQueryBuilderConfig();
      expect(config.fields).toBe(STOCK_FIELDS);
      expect(config.allowEmptyRulesets).toBe(true);
      expect(config.allowRuleset).toBe(true);
    });

    it('should get operators for field', () => {
      const config = new StockQueryBuilderConfig();
      const marketCapField = STOCK_FIELDS.find(f => f.name === 'marketCap')!;
      const operators = config.getOperators('marketCap', marketCapField);
      
      expect(operators).toContain(OPERATORS.greaterThan);
      expect(operators).toContain(OPERATORS.lessThan);
      expect(operators).toContain(OPERATORS.between);
    });

    it('should get correct input type for field and operator', () => {
      const config = new StockQueryBuilderConfig();
      const marketCapField = STOCK_FIELDS.find(f => f.name === 'marketCap')!;
      const sectorField = STOCK_FIELDS.find(f => f.name === 'sector')!;
      
      expect(config.getInputType(marketCapField, OPERATORS.greaterThan)).toBe('number');
      expect(config.getInputType(sectorField, OPERATORS.equal)).toBe('select');
      expect(config.getInputType(sectorField, OPERATORS.in)).toBe('multiselect');
    });

    it('should get options for category fields', () => {
      const config = new StockQueryBuilderConfig();
      const sectorField = STOCK_FIELDS.find(f => f.name === 'sector')!;
      const options = config.getOptions(sectorField);
      
      expect(options).toBeDefined();
      expect(options.length).toBeGreaterThan(0);
      expect(options[0].name).toBeDefined();
      expect(options[0].value).toBeDefined();
    });
  });

  describe('Default Configuration', () => {
    it('should provide default stock configuration', () => {
      expect(DEFAULT_STOCK_CONFIG).toBeDefined();
      expect(DEFAULT_STOCK_CONFIG.fields).toBe(STOCK_FIELDS);
    });
  });
});