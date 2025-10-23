import { Injectable } from '@angular/core';
import { ISettingsService } from 'apps/common-lib/src/lib/environments/interface-settings.service';
import {
  IApi,
  Settings,
  Keycloak,
  Ressources,
  Superset,
  Features,
  Matomo,
} from 'apps/common-lib/src/public-api';

class Api implements IApi {
  financial_data = '';
  financial_data_v2 = '';
  financial_data_v3 = '';
  data_qpv_v3 = '';
  referentiels_v3 = '';
  administration = '';
  geo = '';
  referentiel = '';
  apis_externes = '';
  demarches = '';
}

class DataQPVSettings extends Settings {
  help_pdf: string | undefined = undefined;
}

@Injectable({ providedIn: 'root' })
export class SettingsDataQPVService implements ISettingsService {
  public settings: Settings;

  constructor() {
    this.settings = new DataQPVSettings();
    this.settings.apis = new Api();
    this.settings.keycloak = new Keycloak();
    this.settings.features = new Features();
    this.settings.matomo = new Matomo();
    this.settings.superset = new Superset();
    this.settings.ressources = new Ressources();
  }

  setSettings(settings: Settings): void {
    this.settings = settings;
  }

  getKeycloakSettings(): Keycloak {
    return this.settings.keycloak;
  }

  getSuperset(): Superset {
    return this.settings.superset;
  }

  getFeatures(): Features {
    return this.settings.features;
  }

  getMatomo(): Matomo {
    return this.settings.matomo;
  }

  getSetting(): DataQPVSettings {
    return this.settings as DataQPVSettings;
  }

  getRessources(): Ressources {
    return this.settings.ressources as Ressources;
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

  public get apiFinancialData(): string {
    return (this.settings.apis as Api).financial_data;
  }

  public get apiFinancialDataV2(): string {
    return (this.settings.apis as Api).financial_data_v2;
  }

  public get apiFinancialDataV3(): string {
    return (this.settings.apis as Api).financial_data_v3;
  }

  public get apiDataQpvV3(): string {
    return (this.settings.apis as Api).data_qpv_v3;
  }

  public get apiReferentielsV3(): string {
    return (this.settings.apis as Api).referentiels_v3;
  }

  public get apiAdministration(): string {
    return (this.settings.apis as Api).administration;
  }

}
