import { Field } from './field.model';
import { Option } from './option.model';
import { OPERATORS } from './operators.model';

/**
 * Stock sector options for category fields
 */
export const SECTOR_OPTIONS: Option[] = [
  { name: 'Technology', value: 'TECH' },
  { name: 'Healthcare', value: 'HEALTH' },
  { name: 'Financial Services', value: 'FINANCE' },
  { name: 'Consumer Goods', value: 'CONSUMER' },
  { name: 'Energy', value: 'ENERGY' },
  { name: 'Utilities', value: 'UTILITIES' },
  { name: 'Materials', value: 'MATERIALS' },
  { name: 'Industrials', value: 'INDUSTRIALS' },
  { name: 'Real Estate', value: 'REAL_ESTATE' },
  { name: 'Communication Services', value: 'COMMUNICATION' }
];

/**
 * Market cap range options
 */
export const MARKET_CAP_OPTIONS: Option[] = [
  { name: 'Large Cap (>$10B)', value: 10000000000 },
  { name: 'Mid Cap ($2B-$10B)', value: 2000000000 },
  { name: 'Small Cap ($300M-$2B)', value: 300000000 },
  { name: 'Micro Cap (<$300M)', value: 300000000 }
];

/**
 * Exchange options for stock listings
 */
export const EXCHANGE_OPTIONS: Option[] = [
  { name: 'NSE', value: 'NSE' },
  { name: 'BSE', value: 'BSE' },
  { name: 'NYSE', value: 'NYSE' },
  { name: 'NASDAQ', value: 'NASDAQ' }
];

/**
 * Stock field definitions following Angular-QueryBuilder Field format
 */
export const STOCK_FIELDS: Field[] = [
  {
    name: 'symbol',
    type: 'string',
    label: 'Symbol',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.contains],
    defaultOperator: OPERATORS.contains,
    defaultValue: ''
  },
  {
    name: 'companyName',
    type: 'string',
    label: 'Company Name',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.contains],
    defaultOperator: OPERATORS.contains,
    defaultValue: ''
  },
  {
    name: 'marketCap',
    type: 'number',
    label: 'Market Cap',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 1000000000,
    options: MARKET_CAP_OPTIONS
  },
  {
    name: 'pe',
    type: 'number',
    label: 'P/E Ratio',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.lessThan,
    defaultValue: 20
  },
  {
    name: 'pb',
    type: 'number',
    label: 'Price to Book',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.lessThan,
    defaultValue: 3.0
  },
  {
    name: 'dividendYield',
    type: 'number',
    label: 'Dividend Yield (%)',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 2.0
  },
  {
    name: 'roe',
    type: 'number',
    label: 'Return on Equity (%)',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 15.0
  },
  {
    name: 'debtToEquity',
    type: 'number',
    label: 'Debt to Equity',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.lessThan,
    defaultValue: 1.0
  },
  {
    name: 'currentRatio',
    type: 'number',
    label: 'Current Ratio',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 1.5
  },
  {
    name: 'sector',
    type: 'category',
    label: 'Sector',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.in, OPERATORS.notIn],
    defaultOperator: OPERATORS.equal,
    defaultValue: 'TECH',
    options: SECTOR_OPTIONS
  },
  {
    name: 'exchange',
    type: 'category',
    label: 'Exchange',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.in, OPERATORS.notIn],
    defaultOperator: OPERATORS.equal,
    defaultValue: 'NSE',
    options: EXCHANGE_OPTIONS
  },
  {
    name: 'price',
    type: 'number',
    label: 'Current Price',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 100
  },
  {
    name: 'volume',
    type: 'number',
    label: 'Volume',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 100000
  },
  {
    name: 'eps',
    type: 'number',
    label: 'Earnings Per Share',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 10
  },
  {
    name: 'bookValue',
    type: 'number',
    label: 'Book Value',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: 50
  },
  {
    name: 'hasEarnings',
    type: 'boolean',
    label: 'Has Earnings',
    operators: [OPERATORS.equal],
    defaultOperator: OPERATORS.equal,
    defaultValue: true
  },
  {
    name: 'paysDividend',
    type: 'boolean',
    label: 'Pays Dividend',
    operators: [OPERATORS.equal],
    defaultOperator: OPERATORS.equal,
    defaultValue: true
  },
  {
    name: 'isListed',
    type: 'boolean',
    label: 'Is Listed',
    operators: [OPERATORS.equal],
    defaultOperator: OPERATORS.equal,
    defaultValue: true
  },
  {
    name: 'lastUpdated',
    type: 'date',
    label: 'Last Updated',
    operators: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
    defaultOperator: OPERATORS.greaterThan,
    defaultValue: new Date()
  }
];

/**
 * Operator mappings for different field types following Angular-QueryBuilder pattern
 */
export const FIELD_TYPE_OPERATORS: Record<string, string[]> = {
  string: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.contains],
  number: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
  date: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.lessThan, OPERATORS.lessThanOrEqual, OPERATORS.greaterThan, OPERATORS.greaterThanOrEqual, OPERATORS.between],
  boolean: [OPERATORS.equal],
  category: [OPERATORS.equal, OPERATORS.notEqual, OPERATORS.in, OPERATORS.notIn],
  multiselect: [OPERATORS.in, OPERATORS.notIn]
};

/**
 * Input type mappings for field types and operators
 */
export const INPUT_TYPE_MAPPINGS: Record<string, Record<string, string>> = {
  string: {
    [OPERATORS.equal]: 'text',
    [OPERATORS.notEqual]: 'text',
    [OPERATORS.contains]: 'text'
  },
  number: {
    [OPERATORS.equal]: 'number',
    [OPERATORS.notEqual]: 'number',
    [OPERATORS.lessThan]: 'number',
    [OPERATORS.lessThanOrEqual]: 'number',
    [OPERATORS.greaterThan]: 'number',
    [OPERATORS.greaterThanOrEqual]: 'number',
    [OPERATORS.between]: 'number'
  },
  date: {
    [OPERATORS.equal]: 'date',
    [OPERATORS.notEqual]: 'date',
    [OPERATORS.lessThan]: 'date',
    [OPERATORS.lessThanOrEqual]: 'date',
    [OPERATORS.greaterThan]: 'date',
    [OPERATORS.greaterThanOrEqual]: 'date',
    [OPERATORS.between]: 'date'
  },
  boolean: {
    [OPERATORS.equal]: 'boolean'
  },
  category: {
    [OPERATORS.equal]: 'select',
    [OPERATORS.notEqual]: 'select',
    [OPERATORS.in]: 'multiselect',
    [OPERATORS.notIn]: 'multiselect'
  },
  multiselect: {
    [OPERATORS.in]: 'multiselect',
    [OPERATORS.notIn]: 'multiselect'
  }
};