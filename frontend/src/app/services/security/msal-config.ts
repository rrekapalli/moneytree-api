import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

export const msalConfig: Configuration = {
  auth: {
    clientId: environment.oauth.microsoft.clientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: environment.oauth.microsoft.redirectUri,
    postLogoutRedirectUri: environment.oauth.microsoft.redirectUri,
    navigateToLoginRequestUrl: true
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false
  },
  system: {
    allowRedirectInIframe: true,
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Info
    }
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'email']
};

export const protectedResources = {
  api: {
    endpoint: 'http://localhost:8080/api',
    scopes: ['openid', 'profile', 'email']
  }
}; 