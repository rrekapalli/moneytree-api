import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private currentUserSubject = new BehaviorSubject<GoogleUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private googleAuth: any;

  constructor() {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth(): void {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.setupGoogleAuth();
    };
    document.head.appendChild(script);
  }

  private setupGoogleAuth(): void {
    google.accounts.id.initialize({
      client_id: environment.oauth.google.clientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // Check if user is already signed in
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // User is not signed in
        this.currentUserSubject.next(null);
      }
    });
  }

  private handleCredentialResponse(response: any): void {
    if (response.credential) {
      const payload = this.decodeJwtResponse(response.credential);
      const user: GoogleUser = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      };
      this.currentUserSubject.next(user);
    }
  }

  private decodeJwtResponse(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  public login(): Observable<GoogleUser> {
    return new Observable(observer => {
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          observer.error('Google Sign-In not displayed');
        } else if (notification.isSkippedMoment()) {
          observer.error('Google Sign-In skipped');
        } else if (notification.isDismissedMoment()) {
          observer.error('Google Sign-In dismissed');
        }
      });

      // Listen for user changes
      const subscription = this.currentUser$.subscribe(user => {
        if (user) {
          observer.next(user);
          observer.complete();
          subscription.unsubscribe();
        }
      });
    });
  }

  public loginWithPopup(): void {
    google.accounts.id.prompt();
  }

  public logout(): void {
    google.accounts.id.disableAutoSelect();
    this.currentUserSubject.next(null);
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public getCurrentUser(): GoogleUser | null {
    return this.currentUserSubject.value;
  }

  public getAccessToken(): Observable<string | null> {
    return new Observable(observer => {
      const user = this.getCurrentUser();
      if (user) {
        // For Google Identity Services, we get the ID token
        // You might need to implement additional token acquisition
        observer.next(null); // Placeholder
        observer.complete();
      } else {
        observer.next(null);
        observer.complete();
      }
    });
  }

  public renderSignInButton(elementId: string): void {
    google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      }
    );
  }
} 