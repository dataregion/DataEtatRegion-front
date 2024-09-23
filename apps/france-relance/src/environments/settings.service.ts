import { Injectable } from '@angular/core';
import { ISettingsService } from 'apps/common-lib/src/lib/environments/interface-settings.service';
import {IApi, Keycloak, Matomo, Ressources, Settings, Superset} from 'apps/common-lib/src/public-api';

class Api implements IApi {
  franceRelance = '';
  administration = '';
  geo = '';
  referentiel = '';
  laureats_data = '';
}

@Injectable({ providedIn: 'root' })
export class SettingsService implements ISettingsService {
  public settings: Settings;

  constructor() {
    this.settings = new Settings();
    this.settings.apis = new Api();
    this.settings.keycloak = new Keycloak();
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

  getMatomo(): Matomo {
    return this.settings.matomo;
  }

  getSuperset(): Superset {
    return this.settings.superset;
  }

  getSetting(): Settings {
    return this.settings;
  }

  getRessources(): Ressources {
    return this.settings.ressources;
  }

  public get apiGeo(): string {
    return (this.settings.apis as Api).geo;
  }

  public get apiReferentiel(): string {
    return (this.settings.apis as Api).referentiel;
  }

  public get apiAdministration(): string {
    return (this.settings.apis as Api).administration;
  }

  public get apiLaureatsData(): string {
    return (this.settings.apis as Api).laureats_data;
  }

  public get apiFranceRelance(): string {
    return (this.settings.apis as Api).franceRelance;
  }
}
