import { Injectable } from '@angular/core';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { AuthenticationResult, InteractionStatus, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { BehaviorSubject, Observable, filter, map, from, of } from 'rxjs';
import { Router } from '@angular/router';

export interface MicrosoftUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MicrosoftAuthService {
  private currentUserSubject = new BehaviorSubject<MicrosoftUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isInitialized = false;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Wait for MSAL to be initialized
      await this.msalService.instance.initialize();
      this.isInitialized = true;
      
      // Listen for authentication status changes
      this.msalBroadcastService.inProgress$
        .pipe(
          filter((status: InteractionStatus) => status === InteractionStatus.None),
          map(() => this.msalService.instance.getActiveAccount())
        )
        .subscribe((account) => {
          if (account) {
            this.getUserInfo();
          } else {
            this.currentUserSubject.next(null);
          }
        });

      // Handle redirect response after MSAL is initialized
      this.handleRedirectResponseInternal();
    } catch (error) {
      console.error('Error initializing MSAL:', error);
    }
  }

  private async handleRedirectResponseInternal(): Promise<void> {
    try {
      // Check if we're in a redirect flow
      if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
        const response = await this.msalService.instance.handleRedirectPromise();
        if (response) {
          this.getUserInfo();
          // Redirect to dashboard after successful authentication
          this.router.navigate(['/dashboard']);
        }
      }
    } catch (error) {
      console.error('Error handling redirect response:', error);
    }
  }

  public login(): Observable<AuthenticationResult> {
    const loginRequest: PopupRequest = {
      scopes: ['openid', 'profile', 'email']
    };

    return from(this.msalService.loginPopup(loginRequest)).pipe(
      map((response: AuthenticationResult) => {
        this.getUserInfo();
        return response;
      })
    );
  }

  public async loginRedirect(): Promise<void> {
    try {
      // Wait for MSAL to be initialized
      if (!this.isInitialized) {
        await this.msalService.instance.initialize();
        this.isInitialized = true;
      }
      
      const loginRequest: RedirectRequest = {
        scopes: ['openid', 'profile', 'email']
      };
      await this.msalService.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Error during login redirect:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      // Wait for MSAL to be initialized
      if (!this.isInitialized) {
        await this.msalService.instance.initialize();
        this.isInitialized = true;
      }
      
      await this.msalService.logout();
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  public async isLoggedIn(): Promise<boolean> {
    try {
      // Wait for MSAL to be initialized
      if (!this.isInitialized) {
        await this.msalService.instance.initialize();
        this.isInitialized = true;
      }
      
      const account = this.msalService.instance.getActiveAccount();
      const result = account !== null;
      return result;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  public getCurrentUser(): MicrosoftUser | null {
    return this.currentUserSubject.value;
  }

  private getUserInfo(): void {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      const user: MicrosoftUser = {
        id: account.localAccountId || account.homeAccountId,
        name: account.name || '',
        email: account.username || '',
        picture: undefined // MSAL doesn't provide picture by default
      };
      this.currentUserSubject.next(user);
    }
  }

  public async handleRedirectResponse(): Promise<AuthenticationResult | null> {
    try {
      // Wait for MSAL to be initialized
      if (!this.isInitialized) {
        await this.msalService.instance.initialize();
        this.isInitialized = true;
      }
      
      // MSAL handles redirect automatically, so we just check if user is logged in
      const account = this.msalService.instance.getActiveAccount();
      if (account) {
        this.getUserInfo();
        return null; // No specific response for redirect
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error handling redirect response:', error);
      return null;
    }
  }

  public getAccessToken(): Observable<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      const request = {
        scopes: ['openid', 'profile', 'email'],
        account: account
      };

      return from(this.msalService.acquireTokenSilent(request)).pipe(
        map((response: any) => response.accessToken)
      );
    } else {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }
  }
} 