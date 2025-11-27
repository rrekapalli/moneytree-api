import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, interval } from 'rxjs';
import { tap, catchError, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: any;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  profilePictureUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize authentication state immediately
    this.initializeAuthState();
    this.checkAuthStatus();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      // If we have a valid token, assume user is authenticated initially
      // The backend validation will confirm this
      this.isAuthenticatedSubject.next(true);
    } else {
      // No token or expired token, user is not authenticated
      this.isAuthenticatedSubject.next(false);
    }
  }

  private startTokenRefreshTimer(): void {
    // Refresh token every 8 hours (assuming 9-hour token expiration)
    // But also check every 30 minutes to catch any issues early
    interval(30 * 60 * 1000).pipe(
      switchMap(() => {
        if (this.isLoggedIn() && !this.isTokenExpired()) {
          return this.refreshToken();
        }
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.success) {
          console.log('Token refreshed successfully');
        }
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        this.logout();
      }
    });
  }

  private checkAuthStatus(): void {
    // Check for token in URL parameters (OAuth2 callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      this.logout();
      return;
    }

    if (token) {
      // Store token and clear URL parameters
      this.setToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Validate token with backend
      this.validateToken(token).subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.startTokenRefreshTimer();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.logout();
        }
      });
    } else {
      // Check for existing token
      const existingToken = this.getToken();
      
      if (existingToken && !this.isTokenExpired()) {
        // Only validate token if it appears to be valid locally
        // This prevents unnecessary 401 errors on startup
        this.validateToken(existingToken).subscribe({
          next: (user) => {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            this.startTokenRefreshTimer();
          },
          error: (error) => {
            this.logout();
          }
        });
      } else {
        // No token, expired token, or invalid token - clear authentication state
        this.clearAuthState();
      }
    }
  }

  private clearAuthState(): void {
    // Clear any invalid tokens from storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Set user as not authenticated
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private validateToken(token: string): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/api/auth/validate`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  loginWithEmail(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/email-login`, { email })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.currentUserSubject.next(response.user);
              this.isAuthenticatedSubject.next(true);
              this.startTokenRefreshTimer();
            }
          }
        }),
        catchError(error => {
          // Handle different error response formats
          let errorMessage = 'Login failed. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return of({
            success: false,
            message: errorMessage
          });
        })
      );
  }

  loginWithOAuth(provider: 'google' | 'microsoft'): void {
    const oauthUrl = `${environment.apiUrl}/oauth2/authorization/${provider}`;
    window.location.href = oauthUrl;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  isLoggedIn(): boolean {
    // Check if we have a token and it's not expired
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      return false;
    }
    
    // If we have a valid token, consider user logged in
    // The authentication state is secondary to token validity
    return true;
  }

  // Method to wait for authentication check to complete
  waitForAuthCheck(): Promise<boolean> {
    return new Promise((resolve) => {
      // If authentication check is already complete, return immediately
      if (this.isAuthenticatedSubject.value !== null) {
        resolve(this.isAuthenticatedSubject.value);
        return;
      }
      
      // Wait for the first authentication status
      this.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
        resolve(isAuthenticated);
      });
    });
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      // Decode the JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      // Add 5 minute buffer to avoid edge cases
      const bufferTime = 5 * 60; // 5 minutes in seconds
      return payload.exp <= (currentTime + bufferTime);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Handle OAuth callback
  handleOAuthCallback(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/api/auth/oauth-callback`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  // Refresh token
  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    if (!token) {
      return of({ success: false, message: 'No token available' });
    }

    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/auth/refresh`, { token })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
            console.log('Token refreshed successfully');
          }
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          return of({ success: false, message: 'Token refresh failed' });
        })
      );
  }
} 