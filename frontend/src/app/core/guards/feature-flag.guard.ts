import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlagStateService } from '../../services/state/feature-flag.state';

/**
 * Route guard that checks if a feature flag is enabled
 * 
 * Usage in routes:
 * {
 *   path: 'some-path',
 *   loadComponent: () => import('./path-to-component').then(m => m.Component),
 *   canActivate: [featureFlagGuard('feature-name')]
 * }
 * 
 * @param featureName The name of the feature flag to check
 * @returns A CanActivateFn that returns true if the feature flag is enabled, or redirects to the dashboard if disabled
 */
export function featureFlagGuard(featureName: string): CanActivateFn {
  return () => {
    const featureFlagService = inject(FeatureFlagStateService);
    const router = inject(Router);
    
    if (featureFlagService.isFeatureEnabled(featureName)) {
      return true;
    }
    
    // Redirect to dashboard if feature is disabled
    return router.parseUrl('/dashboard');
  };
}