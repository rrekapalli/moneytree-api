import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/security/auth.service';

/**
 * Authentication guard - DISABLED for development
 * 
 * TODO: Re-enable authentication by uncommenting the authentication check below
 * and removing the 'return true' statement.
 * 
 * This guard is kept for future use when Entra ID authentication is needed.
 */
export const authGuard = () => {
  // AUTHENTICATION DISABLED - Always allow access
  // Remove this line and uncomment below to re-enable authentication
  return true;

  // RE-ENABLE AUTHENTICATION: Uncomment the code below
  // const authService = inject(AuthService);
  // const router = inject(Router);
  //
  // // Check if user is logged in
  // const isLoggedIn = authService.isLoggedIn();
  // 
  // if (isLoggedIn) {
  //   return true;
  // } else {
  //   // Redirect to login if not authenticated
  //   router.navigate(['/login']);
  //   return false;
  // }
}; 