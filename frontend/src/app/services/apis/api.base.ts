import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../security/auth.service';

export interface ApiError {
  status: number;
  statusText: string;
  userMessage: string;
  originalError: any;
  canRetry: boolean;
  validationErrors?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Gets the HTTP headers with authentication token
   * @returns HttpHeaders with Authorization header if token exists
   */
  private getHeaders(): HttpHeaders {
    try {
      const token = this.authService?.getToken();
      const headers = new HttpHeaders();
      
      if (token) {
        return headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    } catch (error) {
      return new HttpHeaders();
    }
  }

  /**
   * Performs a GET request to the API
   * @param path The API endpoint path
   * @param params Optional query parameters
   * @returns An Observable of the response
   */
  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, { 
      params,
      headers: this.getHeaders()
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Performs a POST request to the API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PUT request to the API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PATCH request to the API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Performs a DELETE request to the API
   * @param path The API endpoint path
   * @returns An Observable of the response
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`, {
      headers: this.getHeaders()
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors with comprehensive error handling
   * @param error The HTTP error
   * @returns An Observable with enhanced error information
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const apiError: ApiError = {
      status: error.status,
      statusText: error.statusText,
      userMessage: 'An error occurred',
      originalError: error,
      canRetry: false
    };

    // Network errors (status 0)
    if (error.status === 0) {
      apiError.userMessage = 'Unable to connect to the server. Please check your internet connection.';
      apiError.canRetry = true;
    }
    // Authentication errors (status 401)
    else if (error.status === 401) {
      apiError.userMessage = 'Your session has expired. Please log in again.';
      apiError.canRetry = false;
      
      // Clear token and redirect to login
      this.authService.logout();
    }
    // Authorization errors (status 403)
    else if (error.status === 403) {
      apiError.userMessage = 'You do not have permission to perform this action.';
      apiError.canRetry = false;
    }
    // Not found errors (status 404)
    else if (error.status === 404) {
      apiError.userMessage = 'The requested resource was not found.';
      apiError.canRetry = false;
    }
    // Validation errors (status 400)
    else if (error.status === 400) {
      // Try to extract validation errors from response
      if (error.error?.errors) {
        apiError.validationErrors = error.error.errors;
        apiError.userMessage = 'Validation failed. Please check your inputs.';
      } else if (error.error?.message) {
        apiError.userMessage = error.error.message;
      } else {
        apiError.userMessage = 'Invalid request. Please check your inputs.';
      }
      apiError.canRetry = false;
    }
    // Server errors (status 500+)
    else if (error.status >= 500) {
      apiError.userMessage = 'Server error occurred. Please try again later.';
      apiError.canRetry = true;
    }
    // Other client errors (4xx)
    else if (error.status >= 400 && error.status < 500) {
      apiError.userMessage = error.error?.message || 'An error occurred processing your request.';
      apiError.canRetry = false;
    }
    // Unknown errors
    else {
      apiError.userMessage = 'An unexpected error occurred. Please try again.';
      apiError.canRetry = true;
    }

    return throwError(() => apiError);
  }
}
