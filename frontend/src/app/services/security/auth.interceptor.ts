import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  // Add token to all requests that need authentication
  const token = getTokenFromStorage();
  
  // Skip adding token for public endpoints
  if (isPublicEndpoint(request.url)) {
    return next(request);
  }
  
  // Add token if available and not expired
  if (token && !isTokenExpired(token)) {
    request = addToken(request, token);
  }
  
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !request.url.includes('/auth/refresh')) {
        return handle401Error(request, next);
      }
      return throwError(() => error);
    })
  );
};

function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/api/public/',
    '/api/auth/email-login',
    '/api/auth/validate',
    '/api/auth/refresh',
    '/api/auth/oauth-callback',
    '/swagger-ui/',
    '/v1/api-docs/',
    '/actuator/',
    '/oauth2/',
    '/login/'
  ];
  
  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

function getTokenFromStorage(): string | null {
  return localStorage.getItem('auth_token');
}

function isTokenExpired(token: string): boolean {
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

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Try to refresh the token
    return refreshToken().pipe(
      switchMap((newToken: string) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken);
        return next(addToken(request, newToken));
      }),
      catchError((error) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        // Clear invalid token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(request, token)))
    );
  }
}

function refreshToken(): Observable<string> {
  const currentToken = localStorage.getItem('auth_token');
  if (!currentToken) {
    return throwError(() => new Error('No token available for refresh'));
  }

  const http = inject(HttpClient);
  return http.post<{ success: boolean; token: string; user: any }>('/api/auth/refresh', {
    token: currentToken
  }).pipe(
    switchMap(response => {
      if (response.success && response.token) {
        // Store new token
        localStorage.setItem('auth_token', response.token);
        return [response.token];
      } else {
        throw new Error('Token refresh failed');
      }
    })
  );
}

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
} 