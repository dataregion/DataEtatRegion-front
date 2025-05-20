import { inject, LOCALE_ID, NgModule, provideAppInitializer, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule } from 'keycloak-angular';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchDataComponent } from './components/search-data/search-data.component';
import { HomeComponent } from './pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  API_REF_PATH,
  API_GEO_PATH,
  CommonLibModule,
  MaterialModule,
  CommonHttpInterceptor,
} from 'apps/common-lib/src/public-api';
import {
  SETTINGS,
  SettingsHttpService,
} from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GroupingTableModule } from 'apps/grouping-table/src/public-api';

import {
  aeApiModule,
  aeConfiguration,
  aeConfigurationParameters,
} from 'apps/clients/apis-externes';
import { DATA_HTTP_SERVICE } from 'apps/data-qpv/src/app/services/budget.service';

import {
  budgetApiModule, budgetConfiguration,
} from 'apps/clients/budget';
import { BudgetDataHttpService } from 'apps/data-qpv/src/app/services/http/budget-lines-http.service';

import { SupersetIframeComponent } from './components/superset-iframe/superset-iframe.component'
import { DsfrTabsModule, DsfrModalModule, DsfrDataTableModule, DsfrAlertModule, DsfrFormFieldsetModule, DsfrFormCheckboxModule, DsfrFormInputModule } from '@edugouvfr/ngx-dsfr';
import { TabsSupersetIframesComponent } from './components/tabs-superset-iframes/tabs-superset-iframes.component';
import { TabsMapTableComponent } from './components/tabs-map-table/tabs-map-table.component';
import { ModalAdditionalParamsComponent } from './components/modal-additional-params/modal-additional-params.component';
import {MapComponent} from "./components/map/map.component";
import { MatomoModule } from 'ngx-matomo-client';

export function apiExternesConfigFactory(
  settingsService: SettingsService
): aeConfiguration {
  const params: aeConfigurationParameters = {
    withCredentials: false,
    basePath: settingsService.apiExternes,
  };

  return new aeConfiguration(params);
}

export function apiBudgetConfigFactory(
  settingsService: SettingsService
): aeConfiguration {
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
    SupersetIframeComponent,
    TabsSupersetIframesComponent,
    TabsMapTableComponent,
    ModalAdditionalParamsComponent,
    MapComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    //@ TODO migrer vers provideKeycloak => https://github.com/mauriciovigolo/keycloak-angular
    KeycloakAngularModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    LoggerModule.forRoot({level: NgxLoggerLevel.WARN}),
    MaterialModule,
    GroupingTableModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PreferenceUsersModule,
    CommonLibModule,
    aeApiModule,
    budgetApiModule,
    FormsModule,
    DsfrTabsModule,
    DsfrModalModule,
    DsfrDataTableModule,
    DsfrFormFieldsetModule,
    DsfrFormInputModule,
    DsfrFormCheckboxModule,
    DsfrAlertModule,
    MatomoModule.forRoot({
      mode: 'deferred'
    }),
  ],
  providers: [
    {
        provide: SETTINGS,
        useClass: SettingsService,
    },
    {
        provide: DATA_HTTP_SERVICE,
        useClass: BudgetDataHttpService,
        multi: true,
    },
    provideAppInitializer(() => {
      const settingsHttpService = inject(SettingsHttpService);
      return settingsHttpService.initializeApp();
    }),
    {
        provide: HTTP_INTERCEPTORS,
        useClass: CommonHttpInterceptor,
        multi: true,
    },
    DatePipe,
    {
        provide: LOCALE_ID,
        useValue: 'fr-FR',
    },
    {
        provide: API_PREFERENCE_PATH,
        useFactory: (settings: SettingsService) => {
            return settings.apiAdministration;
        },
        deps: [SETTINGS],
    },
    {
        provide: API_GEO_PATH,
        useFactory: (settings: SettingsService) => {
            return settings.apiGeo;
        },
        deps: [SETTINGS],
    },
    {
        provide: API_REF_PATH,
        useFactory: (settings: SettingsService) => {
            return settings.apiReferentiel;
        },
        deps: [SETTINGS],
    },
    {
        provide: aeConfiguration,
        useFactory: apiExternesConfigFactory,
        deps: [SETTINGS],
        multi: false,
    },
    {
        provide: budgetConfiguration,
        useFactory: apiBudgetConfigFactory,
        deps: [SETTINGS],
        multi: false,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideExperimentalZonelessChangeDetection(),
  ]
})
export class AppModule {}
