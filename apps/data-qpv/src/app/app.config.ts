import { ApplicationConfig, provideBrowserGlobalErrorListeners, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { DatePipe } from '@angular/common';
import { SettingsDataQPVService } from './environments/settings-qpv.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { errorsInterceptor } from 'apps/appcommon/src/lib/interceptors/errors.interceptor';
import { API_GEO_PATH, API_REF_PATH } from 'apps/common-lib/src/public-api';

import { BASE_PATH as DATA_QPV_V3_BASE_PATH } from 'apps/clients/v3/data-qpv';
import { BASE_PATH as REFERENTIELS_V3_BASE_PATH } from 'apps/clients/v3/referentiels';


export function providerBugdetConfiguration(settingsService: SettingsDataQPVService): Provider[] {
  return [
    {
      provide: SETTINGS,
      useValue: settingsService
    }, {
      provide: DATA_QPV_V3_BASE_PATH,
      useValue: settingsService.apiDataQpvV3
    }, {
      provide: REFERENTIELS_V3_BASE_PATH,
      useValue: settingsService.apiReferentielsV3
    },{
      provide: API_GEO_PATH,
      useValue: settingsService.apiGeo
    },{
      provide: API_REF_PATH,
      useValue: settingsService.apiReferentiel
    },
  ]
}


export const configApp: ApplicationConfig = {
  providers: [
    DatePipe,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor, errorsInterceptor])
    ),
  ]
};