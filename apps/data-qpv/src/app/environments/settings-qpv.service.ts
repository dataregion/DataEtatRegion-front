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
  data_qpv_v3 = '';
  referentiels_v3 = '';
  referentiel = '';
  geo = '';
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

  public get apiReferentiel(): string {
    return (this.settings.apis as Api).referentiel;
  }

  public get apiDataQpvV3(): string {
    return (this.settings.apis as Api).data_qpv_v3;
  }

  public get apiReferentielsV3(): string {
    return (this.settings.apis as Api).referentiels_v3;
  }

  public get apiGeo(): string {
    return (this.settings.apis as Api).geo;
  }

}
