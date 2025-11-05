import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchDataComponent } from './components/search-data/search-data.component';
import { HomeComponent } from './pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PreferenceUsersModule } from 'apps/preference-users/src/lib/preference-users.module';
import { API_PREFERENCE_PATH } from 'apps/preference-users/src/public-api';
import { SettingsService } from '../environments/settings.service';
import { PreferenceComponent } from './pages/preference/preference.component';
import {
  API_GEO_PATH,
  API_REF_PATH,
  CommonHttpInterceptor,
  CommonLibModule,
  MaterialModule
} from 'apps/common-lib/src/public-api';
import {
  SETTINGS,
  SettingsHttpService
} from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GroupingTableModule } from 'apps/grouping-table/src/public-api';

import {
  aeApiModule,
  aeConfiguration,
  aeConfigurationParameters
} from 'apps/clients/apis-externes';
import { DATA_HTTP_SERVICE } from './services/budget.service';

import { budgetApiModule, budgetConfiguration } from 'apps/clients/budget';
import { BudgetDataHttpService } from './services/http/budget-lines-http.service';
import { MultiregionsService } from './services/multiregions.service';
import { MatomoModule, MatomoRouteDataInterceptor, MatomoRouterModule } from 'ngx-matomo-client';
import { PocComponent } from './pages/poc/poc.component';
import { FooterComponent } from 'apps/common-lib/src/lib/components/footer/footer.component';
import { aev3Configuration } from 'apps/clients/apis-externes-v3';

export function apiExternesConfigFactory(settingsService: SettingsService): aeConfiguration {
  const params: aeConfigurationParameters = {
    withCredentials: false,
    basePath: settingsService.apiExternes
  };

  return new aeConfiguration(params);
}

export function apiExternesV3ConfigFactory(settingsService: SettingsService): aev3Configuration {
  const params: aeConfigurationParameters = {
    withCredentials: false,
    basePath: settingsService.apiExternesV3
  };

  return new aev3Configuration(params);
}

export function apiBudgetConfigFactory(settingsService: SettingsService): aeConfiguration {
  const params: aeConfigurationParameters = {
    withCredentials: false,
    basePath: settingsService.apiFinancialDataV2
  };

  return new aeConfiguration(params);
}

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PreferenceComponent,
    SearchDataComponent,
    PocComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    FooterComponent,
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
    GroupingTableModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PreferenceUsersModule,
    CommonLibModule,
    aeApiModule,
    budgetApiModule,
    MatomoModule.forRoot({
      mode: 'deferred'
    }),
    MatomoRouterModule.forRoot({
      interceptors: [MatomoRouteDataInterceptor], // Add this configuration
    }),
  ],
  providers: [
    {
      provide: SETTINGS,
      useClass: SettingsService
    },
    {
      provide: DATA_HTTP_SERVICE,
      useClass: BudgetDataHttpService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      multi: true,
      deps: [SettingsHttpService, KeycloakService, SettingsService, MultiregionsService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CommonHttpInterceptor,
      multi: true
    },
    DatePipe,
    {
      provide: LOCALE_ID,
      useValue: 'fr-FR'
    },
    {
      provide: API_PREFERENCE_PATH,
      useFactory: (settings: SettingsService) => {
        return settings.apiAdministration;
      },
      deps: [SETTINGS]
    },
    {
      provide: API_GEO_PATH,
      useFactory: (settings: SettingsService) => {
        return settings.apiGeo;
      },
      deps: [SETTINGS]
    },
    {
      provide: API_REF_PATH,
      useFactory: (settings: SettingsService) => {
        return settings.apiReferentiel;
      },
      deps: [SETTINGS]
    },
    {
      provide: aeConfiguration,
      useFactory: apiExternesConfigFactory,
      deps: [SETTINGS],
      multi: false
    },
    {
      provide: aev3Configuration,
      useFactory: apiExternesV3ConfigFactory,
      deps: [SETTINGS],
      multi: false
    },
    {
      provide: budgetConfiguration,
      useFactory: apiBudgetConfigFactory,
      deps: [SETTINGS],
      multi: false
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }

export function app_Init(settingsHttpService: SettingsHttpService): () => Promise<unknown> {
  return () => settingsHttpService.initializeApp();
}
