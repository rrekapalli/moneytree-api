/**
 * Static array of enabled features for the application.
 * This file defines which features are currently enabled in the application.
 */
export const enabledFeatures = [
  'dashboard',
  'dashboard-overall',
  'dashboard-stock-insights',
  'dashboard-today',
  'dashboard-week',
  'dashboard-month',
  'dashboard-year',
  'watchlist',
  'holdings',
  'market',
  'positions',
  'portfolios',
  'screeners',
  'strategies',
  'indices',
  'settings',
  'user-profile',
  'notifications'
];

/**
 * Function to check if a specific feature is enabled
 * @param featureName - The name of the feature to check
 * @returns boolean - Whether the feature is enabled
 */
export function isFeatureEnabled(featureName: string): boolean {
  return enabledFeatures.includes(featureName);
}
