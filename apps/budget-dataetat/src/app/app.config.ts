import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideKeycloakAngular } from './keycloak.config';
import { includeBearerTokenInterceptor } from 'keycloak-angular';




// https://github.com/mauriciovigolo/keycloak-angular/blob/main/projects/examples/standalone/src/app/keycloak.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakAngular(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor])
    )
  ]
};

