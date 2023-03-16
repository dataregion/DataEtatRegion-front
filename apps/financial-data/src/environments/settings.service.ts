import { Injectable } from '@angular/core';
import { ISettingsService } from 'apps/common-lib/src/lib/environments/interface-settings.service';
import { IApi, Settings, Keycloak } from 'apps/common-lib/src/public-api';

class Api implements IApi {
  financial = '';
  management = '';
  geo = '';
  referentiel = '';
  data_subventions = '';
}

@Injectable({ providedIn: 'root' })
export class SettingsService implements ISettingsService {
  public settings: Settings;

  constructor() {
    this.settings = new Settings();
    this.settings.apis = new Api();
    this.settings.keycloak = new Keycloak();
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }
  getKeycloakSettings(): Keycloak {
    return this.settings.keycloak;
  }

  getSetting(): Settings {
    return this.settings;
  }

  public get apiGeo(): string {
    return (this.settings.apis as Api).geo;
  }

  public get apiReferentiel(): string {
    return (this.settings.apis as Api).referentiel;
  }

  public get apiDataSubventions(): string {
    return (this.settings.apis as Api).data_subventions;
  }

  public get apiFinancial(): string {
    return (this.settings.apis as Api).financial;
  }

  public get apiManagement(): string {
    return (this.settings.apis as Api).management;
  }
}
