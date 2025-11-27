import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/security/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  const isLoggedIn = authService.isLoggedIn();
  
  if (isLoggedIn) {
    return true;
  } else {
    // Redirect to login if not authenticated
    router.navigate(['/login']);
    return false;
  }
}; 