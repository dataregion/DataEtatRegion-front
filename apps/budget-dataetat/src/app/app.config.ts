import { ApplicationConfig, provideBrowserGlobalErrorListeners, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { DatePipe } from '@angular/common';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { budgetConfiguration, budgetConfigurationParameters } from 'apps/clients/budget';
import { API_PREFERENCE_PATH } from 'apps/preference-users/src/public-api';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { budgetHttpInterceptorInterceptor } from './interceptors/budget-http-interceptor.interceptor';
import { API_GEO_PATH, API_REF_PATH } from 'apps/common-lib/src/public-api';

import { BASE_PATH as FINANCIAL_DATA_V3_BASE_PATH } from 'apps/clients/v3/financial-data';
import { BASE_PATH as REFERENTIELS_V3_BASE_PATH } from 'apps/clients/v3/referentiels';
import { aeConfiguration, aeConfigurationParameters } from 'apps/clients/apis-externes';
import { aev3Configuration, aev3ConfigurationParameters } from 'apps/clients/apis-externes-v3';


export function providerBugdetConfiguration(settingsService: SettingsBudgetService): Provider[] {
  return [
    // pour rester compatible avec les anciens composants
    {
      provide: SETTINGS,
      useValue: settingsService
    },
    {
      provide: budgetConfiguration,
      useFactory: () => {
        const params: budgetConfigurationParameters = {
          withCredentials: false,
          basePath: settingsService.apiFinancialDataV2
        };
        return new budgetConfiguration(params);
      },
      multi: false
    },
    {
      provide: aev3Configuration,
      useFactory: () => {
        const params: aev3ConfigurationParameters = {
          withCredentials: false,
          basePath: settingsService.apiExternesV3
        };
        return new aev3Configuration(params);
      },
      multi: false
    },
    {
      provide: aeConfiguration,
      useFactory: () => {
        const params: aeConfigurationParameters = {
          withCredentials: false,
          basePath: settingsService.apiExternes
        };
        return new aeConfiguration(params);
      },
      multi: false
    },
    {
      provide: FINANCIAL_DATA_V3_BASE_PATH,
      useValue: settingsService.apiFinancialDataV3
    }, {
      provide: REFERENTIELS_V3_BASE_PATH,
      useValue: settingsService.apiReferentielsV3
    }, {
      provide: API_PREFERENCE_PATH,
      useValue: settingsService.apiAdministration
    }, {
      provide: API_GEO_PATH,
      useValue: settingsService.apiGeo
    }, {
      provide: API_REF_PATH,
      useValue: settingsService.apiReferentiel
    }
  ]
}


export const configApp: ApplicationConfig = {
  providers: [
    DatePipe,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor, budgetHttpInterceptorInterceptor])
    ),
  ]
};