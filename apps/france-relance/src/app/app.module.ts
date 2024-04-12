import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PreferenceUsersModule } from 'apps/preference-users/src/lib/preference-users.module';
import { API_PREFERENCE_PATH } from 'apps/preference-users/src/public-api';
import { SettingsService } from '../environments/settings.service';
import {
  API_GEO_PATH,
  API_REF_PATH,
  CommonHttpInterceptor,
  CommonLibModule,
  MaterialModule,
} from 'apps/common-lib/src/public-api';
import {
  SETTINGS,
  SettingsHttpService,
} from 'apps/common-lib/src/lib/environments/settings.http.service';
import { AppComponent } from './app.component';
import { API_MANAGEMENT_PATH } from 'apps/management/src/lib/services/users-http.service';
import { ManagementModule } from 'apps/management/src/public-api';
import { GroupingTableModule } from 'apps/grouping-table/src/public-api';
import { HomeComponent } from './pages/home/home.component';
import { PreferenceComponent } from './pages/preference/preference.component';
import { SearchDataComponent } from './components/search-data.component';
import { SlugifyPipe } from 'apps/common-lib/src/lib/pipes/slugify.pipe';

registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PreferenceComponent,
    SearchDataComponent,
  ],
  providers: [
    {
      provide: SETTINGS,
      useClass: SettingsService,
    },
    DatePipe,
    SlugifyPipe,
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      multi: true,
      deps: [SettingsHttpService, KeycloakService, SettingsService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CommonHttpInterceptor,
      multi: true,
    },
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
      provide: API_MANAGEMENT_PATH,
      useFactory: (settings: SettingsService) => {
        return settings.apiAdministration;
      },
      deps: [SETTINGS],
    },
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    KeycloakAngularModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    LoggerModule.forRoot({ level: NgxLoggerLevel.WARN }),
    MaterialModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    PreferenceUsersModule,
    GroupingTableModule,
    CommonLibModule,
    ManagementModule,
  ],
})
export class AppModule {}

export function app_Init(
  settingsHttpService: SettingsHttpService
): () => Promise<any> {
  return () => settingsHttpService.initializeApp();
}
