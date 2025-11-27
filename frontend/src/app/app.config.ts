import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { GlobalErrorHandler } from './core/error-handler';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './services/security/auth.interceptor';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    { 
      provide: ErrorHandler, 
      useClass: GlobalErrorHandler
    }
  ]
};
