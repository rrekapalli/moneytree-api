import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Import polyfills for sockjs-client compatibility
import './polyfills/node-globals';
import './polyfills/unicode-property-escapes';
import { testNodeGlobalsPolyfill } from './polyfills/test-polyfills';

// Test polyfills in development mode
if (!environment.production) {
  testNodeGlobalsPolyfill();
}

// Enable production mode to disable development warnings
enableProdMode();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));