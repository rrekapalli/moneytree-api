// Screener Entities and DTOs

export interface Screener {
  screenerId: string;
  ownerUserId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  defaultUniverse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenerCreateReq {
  name: string;
  description?: string;
  isPublic: boolean;
  defaultUniverse?: string;
  criteria?: ScreenerCriteria;
}

export interface ScreenerResp {
  screenerId: string;
  ownerUserId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  defaultUniverse?: string;
  criteria?: ScreenerCriteria;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenerVersion {
  screenerVersionId: string;
  screenerId: string;
  versionNumber: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  engine: 'SQL' | 'DSL' | 'EXPR';
  dslJson?: any;
  compiledSql?: string;
  paramsSchemaJson?: any;
  createdAt: string;
}

export interface ScreenerVersionCreateReq {
  versionNumber: number;
  engine: 'SQL' | 'DSL' | 'EXPR';
  dslJson?: any;
  compiledSql?: string;
  paramsSchemaJson?: any;
}

export interface ScreenerVersionResp {
  screenerVersionId: string;
  screenerId: string;
  versionNumber: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  engine: 'SQL' | 'DSL' | 'EXPR';
  dslJson?: any;
  compiledSql?: string;
  paramsSchemaJson?: any;
  createdAt: string;
}

export interface ScreenerParamset {
  paramsetId: string;
  screenerVersionId: string;
  name: string;
  paramsJson: any;
  createdByUserId: string;
  createdAt: string;
}

export interface ParamsetCreateReq {
  name: string;
  paramsJson: any;
}

export interface ParamsetResp {
  paramsetId: string;
  screenerVersionId: string;
  name: string;
  paramsJson: any;
  createdByUserId: string;
  createdAt: string;
}

export interface ScreenerSchedule {
  scheduleId: string;
  screenerId: string;
  cronExpr: string;
  timezone: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface ScheduleCreateReq {
  cronExpr: string;
  timezone?: string;
  isEnabled?: boolean;
}

export interface ScheduleResp {
  scheduleId: string;
  screenerId: string;
  cronExpr: string;
  timezone: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface ScreenerAlert {
  alertId: string;
  screenerId: string;
  conditionJson: any;
  deliveryChannels: string[];
  isEnabled: boolean;
  createdAt: string;
}

export interface AlertCreateReq {
  conditionJson: any;
  deliveryChannels: string[];
  isEnabled?: boolean;
}

export interface AlertResp {
  alertId: string;
  screenerId: string;
  conditionJson: any;
  deliveryChannels: string[];
  isEnabled: boolean;
  createdAt: string;
}

export interface ScreenerRun {
  screenerRunId: string;
  screenerId: string;
  screenerVersionId: string;
  paramsetId?: string;
  paramsJson?: any;
  universeSnapshot?: number[];
  runForTradingDay: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  finishedAt?: string;
  totals?: any;
  errorMessage?: string;
  triggeredByUserId: string;
  createdAt: string;
}

export interface RunCreateReq {
  screenerVersionId: string;
  paramsetId?: string;
  paramsJson?: any;
  runForTradingDay: string;
  universeSymbolIds?: number[];
}

export interface RunResp {
  screenerRunId: string;
  screenerId: string;
  screenerVersionId: string;
  paramsetId?: string;
  paramsJson?: any;
  universeSnapshot?: number[];
  runForTradingDay: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  finishedAt?: string;
  totals?: any;
  errorMessage?: string;
  triggeredByUserId: string;
  createdAt: string;
}

export interface ScreenerResult {
  screenerRunId: string;
  symbol: string;
  matched: boolean;
  score0To1: number;
  rankInRun: number;
  metricsJson?: any;
  reasonJson?: any;
  createdAt: string;
}

export interface ResultResp {
  symbolId: string;
  matched: boolean;
  score0To1: number;
  rankInRun: number;
  metricsJson?: any;
  reasonJson?: any;
}

export interface ScreenerResultDiff {
  screenerRunId: string;
  prevScreenerRunId: string;
  symbol: string;
  changeType: 'ADDED' | 'REMOVED' | 'RANK_CHANGED';
  prevRank?: number;
  newRank?: number;
  createdAt: string;
}

export interface ResultDiffResp {
  symbolId: string;
  changeType: 'ADDED' | 'REMOVED' | 'RANK_CHANGED';
  prevRank?: number;
  newRank?: number;
}

export interface ScreenerStar {
  screenerId: string;
  userId: string;
  createdAt: string;
}

export interface StarToggleReq {
  starred: boolean;
}

export interface ScreenerSavedView {
  savedViewId: string;
  screenerId: string;
  name: string;
  tablePrefs: any;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedViewCreateReq {
  name: string;
  tablePrefs: any;
}

export interface SavedViewResp {
  savedViewId: string;
  screenerId: string;
  name: string;
  tablePrefs: any;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResp<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort?: string;
}

export interface Symbol {
  symbolId: string;
  symbol: string;
  name?: string;
  exchange?: string;
}

// Query parameters for API calls
export interface ScreenerListParams {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface RunListParams {
  page?: number;
  size?: number;
}

export interface ResultListParams {
  matched?: boolean;
  minScore?: number;
  symbolId?: string;
  page?: number;
  size?: number;
  sort?: 'rank' | 'score';
}

// Screener Criteria interfaces for query builder integration
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

export interface ScreenerCriteriaConfig {
  fields: ScreenerField[];
  operators?: { [key: string]: string[] };
  defaultCondition?: 'and' | 'or';
  allowEmpty?: boolean;
  allowCollapse?: boolean;
  classNames?: { [key: string]: string };
}

export interface ScreenerField {
  name: string;
  value: string;
  type: 'string' | 'number' | 'date' | 'time' | 'boolean' | 'category';
  category?: string;
  description?: string;
  operators?: string[];
  options?: ScreenerOption[];
  getOperators?: () => string[];
  getOptions?: () => ScreenerOption[];
}

export interface ScreenerOption {
  name: string;
  value: any;
}
