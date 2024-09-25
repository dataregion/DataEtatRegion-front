import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { firstValueFrom } from 'rxjs';
import { Keycloak as KeycloakSettings, Settings } from 'apps/common-lib/src/public-api';
import { ISettingsService } from './interface-settings.service';
import { NGXLogger, NgxLoggerLevel } from 'ngx-logger';
import { assert } from '../utilities/assert.function';
import { MultiRegionClientIdMapper } from './mutli-region.mapper.service';
import { MatomoInitializerService } from 'ngx-matomo-client';

export const SETTINGS = new InjectionToken<ISettingsService>('SETTINGS');

@Injectable({ providedIn: 'root' })
export class SettingsHttpService {
  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) private _settingsService: ISettingsService,
    private _keycloak: KeycloakService,
    private _hostname_mapper: MultiRegionClientIdMapper,
    private _logger: NGXLogger,
    private _matomoInitializer: MatomoInitializerService
  ) {}

  initializeApp(): Promise<any> {
    return new Promise((resolve, reject) => {
      firstValueFrom(this.http.get('assets/settings.json'))
        .then((response) => {
          this._settingsService.setSettings(response as Settings);
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    })
      .then(async () => {
        const is_in_production = this._settingsService.getSetting().production;
        if (is_in_production) {
          this._logger.partialUpdateConfig({
            level: NgxLoggerLevel.WARN,
            disableFileDetails: true
          });
        } else {
          this._logger.partialUpdateConfig({
            level: NgxLoggerLevel.TRACE,
            enableSourceMaps: true
          });
          this._logger.info('Application en mode développement. Les logs sont en mode trace');
        }
      })
      .then(async () => {
        const keycloak_settings = this._settingsService.getKeycloakSettings();
        const multi_region = this._settingsService?.getKeycloakSettings()?.multi_region;

        if (multi_region) {
          this._logger.debug(`Initialisation de keycloak en mode multiregion`);
          return await this.init_keycloak_multiregion(keycloak_settings);
        } else {
          this._logger.debug(`Initialisation de keycloak en mode monoregion`);
          return await this.init_keycloak_monoregion(keycloak_settings);
        }
      })
      .then(async () => {
        const matomo_settings = this._settingsService.getMatomo();
        if (!matomo_settings.disabled) {
          this._matomoInitializer.initializeTracker({
            siteId: matomo_settings.site_id,
            trackerUrl: matomo_settings.tracker_url
          });
        }
      });
  }

  async init_keycloak_monoregion(settings: KeycloakSettings) {
    try {
      const { url, realm, clientId } = settings;
      assert(clientId != null, 'Le clientId est nécessaire dans une configuration monoregion');

      return await this.init_keycloak(url, realm, clientId);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async init_keycloak_multiregion(settings: KeycloakSettings) {
    try {
      const { url, realm } = settings;
      const clientId = this._hostname_mapper.kc_client_id_from_hostname(
        settings.hostname_client_id_mappings
      );

      this._logger.debug(
        `Initialisation de keycloak avec url: ${url}, realm: ${realm} et le client id: ${clientId}`
      );

      return await this.init_keycloak(url, realm, clientId);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async init_keycloak(url: string, realm: string, clientId: string) {
    try {
      const initialization = await this._keycloak.init({
        config: {
          url,
          realm,
          clientId
        },
        initOptions: {
          checkLoginIframe: false
        },
        bearerPrefix: 'Bearer',
        enableBearerInterceptor: true,
        bearerExcludedUrls: ['/assets'] // C'est une API publique,
        // Il est nécessaire de les whitelister pour ne pas
        // être redirigé vers la page de login de keycloak
      });

      return initialization;
    } catch (error) {
      throw new Error("Une erreur s'est déroulée durant l'initialisation de keycloak");
    }
  }
}
