import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
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
   * Handles HTTP errors
   * @param error The HTTP error
   * @returns An Observable with the error
   */
  private handleError(error: any): Observable<never> {
    return throwError(() => error);
  }
}
