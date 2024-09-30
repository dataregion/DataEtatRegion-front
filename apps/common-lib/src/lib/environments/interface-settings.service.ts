import {
  Keycloak,
  Matomo,
  Ressources,
  Settings,
} from 'apps/common-lib/src/public-api';
/* eslint no-unused-vars: 0 */ // --> OFF

export interface ISettingsService {
  setSettings(arg0: Settings): void;

  getSetting(): Settings;

  getKeycloakSettings(): Keycloak;

  getRessources(): Ressources;

  getMatomo(): Matomo;
}
