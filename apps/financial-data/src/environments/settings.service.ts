import { Injectable } from '@angular/core';
import { ISettingsService } from 'apps/common-lib/src/lib/environments/interface-settings.service';
import {
  IApi,
  Settings,
  Keycloak,
  Ressources,
} from 'apps/common-lib/src/public-api';



class Api implements IApi {
  financial_data = '';
  laureats_data = '';
  financial_data_v2 = '';
  administration = '';
  geo = '';
  referentiel = '';
  apis_externes = '';
}

class FinancialSettings extends Settings {
  help_pdf: string | undefined = undefined;
}

@Injectable({ providedIn: 'root' })
export class SettingsService implements ISettingsService {
  public settings: Settings;

  constructor() {
    this.settings = new FinancialSettings();
    this.settings.apis = new Api();
    this.settings.keycloak = new Keycloak();
    this.settings.ressources = new Ressources();
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }

  getKeycloakSettings(): Keycloak {
    return this.settings.keycloak;
  }

  getRessources(): Ressources {
    return this.settings.ressources;
  }

  getSetting(): FinancialSettings {
    return this.settings as FinancialSettings;
  }

  public get apiGeo(): string {
    return (this.settings.apis as Api).geo;
  }

  public get apiReferentiel(): string {
    return (this.settings.apis as Api).referentiel;
  }

  public get apiExternes(): string {
    return (this.settings.apis as Api).apis_externes;
  }
  
  public get apiLaureatsData(): string {
    return (this.settings.apis as Api).laureats_data;
  }

  public get apiFinancialData(): string {
    return (this.settings.apis as Api).financial_data;
  }

  public get apiFinancialDataV2(): string {
    return (this.settings.apis as Api).financial_data_v2;
  }

  public get apiAdministration(): string {
    return (this.settings.apis as Api).administration;
  }
}
