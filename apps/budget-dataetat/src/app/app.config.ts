import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { DatePipe } from '@angular/common';


export const configApp: ApplicationConfig = {
  providers: [
    DatePipe,
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor])
    ),
  ]
};

