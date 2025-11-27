import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpHeaders, HttpParams } from '@angular/common/http';

/**
 * A mock API service that simulates HTTP requests for testing and development
 */
@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  // Simulated delay for API responses (in milliseconds)
  private delay = 500;

  constructor() { }

  /**
   * Simulate a GET request
   * @param url The URL to request
   * @param params Optional query parameters
   * @param headers Optional HTTP headers
   * @returns An Observable that emits the mock response
   */
  get<T>(url: string, params?: HttpParams | { [param: string]: string | string[] }, headers?: HttpHeaders): Observable<T> {
    // Return appropriate mock data based on the URL
    let mockData: any;
    
    if (url === '/notifications') {
      // Return an empty array for notifications to prevent filter errors
      mockData = [];
    } else if (url.startsWith('/notifications/')) {
      // Return a single notification object for specific notification requests
      mockData = {
        id: 'mock-notification-1',
        title: 'Mock Notification',
        message: 'This is a mock notification',
        type: 'info',
        isRead: false,
        timestamp: new Date(),
        link: null
      };
    } else {
      // Default to empty object for other endpoints
      mockData = {};
    }
    
    return of(mockData as T).pipe(delay(this.delay));
  }

  /**
   * Simulate a POST request
   * @param url The URL to request
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns An Observable that emits the mock response
   */
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Simulate a successful response with the posted data
    // In a real implementation, you might modify the data before returning it
    return of(body as T).pipe(delay(this.delay));
  }

  /**
   * Simulate a PUT request
   * @param url The URL to request
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns An Observable that emits the mock response
   */
  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Simulate a successful response with the updated data
    return of(body as T).pipe(delay(this.delay));
  }

  /**
   * Simulate a DELETE request
   * @param url The URL to request
   * @param headers Optional HTTP headers
   * @returns An Observable that emits the mock response
   */
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    // Simulate a successful response
    return of({} as T).pipe(delay(this.delay));
  }

  /**
   * Simulate a PATCH request
   * @param url The URL to request
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns An Observable that emits the mock response
   */
  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    // Simulate a successful response with the patched data
    return of(body as T).pipe(delay(this.delay));
  }

  /**
   * Simulate an error response
   * @param errorMessage The error message
   * @param statusCode The HTTP status code
   * @returns An Observable that emits an error
   */
  simulateError(errorMessage: string, statusCode: number = 500): Observable<never> {
    const error = {
      message: errorMessage,
      status: statusCode
    };
    
    return throwError(() => error).pipe(delay(this.delay));
  }

  /**
   * Set the simulated delay for API responses
   * @param delayMs The delay in milliseconds
   */
  setDelay(delayMs: number): void {
    this.delay = delayMs;
  }
}