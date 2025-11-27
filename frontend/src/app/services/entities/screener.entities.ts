// Screener Entities and DTOs

export interface Screener {
  screenerId: number;
  ownerUserId: number;
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
  screenerId: number;
  ownerUserId: number;
  name: string;
  description?: string;
  isPublic: boolean;
  defaultUniverse?: string;
  criteria?: ScreenerCriteria;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenerVersion {
  screenerVersionId: number;
  screenerId: number;
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
  screenerVersionId: number;
  screenerId: number;
  versionNumber: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  engine: 'SQL' | 'DSL' | 'EXPR';
  dslJson?: any;
  compiledSql?: string;
  paramsSchemaJson?: any;
  createdAt: string;
}

export interface ScreenerParamset {
  paramsetId: number;
  screenerVersionId: number;
  name: string;
  paramsJson: any;
  createdByUserId: number;
  createdAt: string;
}

export interface ParamsetCreateReq {
  name: string;
  paramsJson: any;
}

export interface ParamsetResp {
  paramsetId: number;
  screenerVersionId: number;
  name: string;
  paramsJson: any;
  createdByUserId: number;
  createdAt: string;
}

export interface ScreenerSchedule {
  scheduleId: number;
  screenerId: number;
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
  scheduleId: number;
  screenerId: number;
  cronExpr: string;
  timezone: string;
  isEnabled: boolean;
  createdAt: string;
}

export interface ScreenerAlert {
  alertId: number;
  screenerId: number;
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
  alertId: number;
  screenerId: number;
  conditionJson: any;
  deliveryChannels: string[];
  isEnabled: boolean;
  createdAt: string;
}

export interface ScreenerRun {
  screenerRunId: number;
  screenerId: number;
  screenerVersionId: number;
  paramsetId?: number;
  paramsJson?: any;
  universeSnapshot?: number[];
  runForTradingDay: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  finishedAt?: string;
  totals?: any;
  errorMessage?: string;
  triggeredByUserId: number;
  createdAt: string;
}

export interface RunCreateReq {
  screenerVersionId: number;
  paramsetId?: number;
  paramsJson?: any;
  runForTradingDay: string;
  universeSymbolIds?: number[];
}

export interface RunResp {
  screenerRunId: number;
  screenerId: number;
  screenerVersionId: number;
  paramsetId?: number;
  paramsJson?: any;
  universeSnapshot?: number[];
  runForTradingDay: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  startedAt?: string;
  finishedAt?: string;
  totals?: any;
  errorMessage?: string;
  triggeredByUserId: number;
  createdAt: string;
}

export interface ScreenerResult {
  screenerRunId: number;
  symbol: string;
  matched: boolean;
  score0To1: number;
  rankInRun: number;
  metricsJson?: any;
  reasonJson?: any;
  createdAt: string;
}

export interface ResultResp {
  symbolId: number;
  matched: boolean;
  score0To1: number;
  rankInRun: number;
  metricsJson?: any;
  reasonJson?: any;
}

export interface ScreenerResultDiff {
  screenerRunId: number;
  prevScreenerRunId: number;
  symbol: string;
  changeType: 'ADDED' | 'REMOVED' | 'RANK_CHANGED';
  prevRank?: number;
  newRank?: number;
  createdAt: string;
}

export interface ResultDiffResp {
  symbolId: number;
  changeType: 'ADDED' | 'REMOVED' | 'RANK_CHANGED';
  prevRank?: number;
  newRank?: number;
}

export interface ScreenerStar {
  screenerId: number;
  userId: number;
  createdAt: string;
}

export interface StarToggleReq {
  starred: boolean;
}

export interface ScreenerSavedView {
  savedViewId: number;
  screenerId: number;
  name: string;
  tablePrefs: any;
  createdByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedViewCreateReq {
  name: string;
  tablePrefs: any;
}

export interface SavedViewResp {
  savedViewId: number;
  screenerId: number;
  name: string;
  tablePrefs: any;
  createdByUserId: number;
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
  symbolId: number;
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
  symbolId?: number;
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
