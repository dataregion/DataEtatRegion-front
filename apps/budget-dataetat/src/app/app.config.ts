import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import { DatePipe } from '@angular/common';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { budgetConfiguration } from 'apps/clients/budget';
import { aeConfiguration, aeConfigurationParameters } from 'apps/clients/apis-externes';


export function providerBugdetConfiguration(settingsService: SettingsBudgetService): Provider {
  return {

    provide: budgetConfiguration,
    useFactory: () => {
       const params: aeConfigurationParameters = {
        withCredentials: false,
        basePath: settingsService.apiFinancialDataV2
      };
      return new aeConfiguration(params);
    },
    multi: false
  }
}


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

