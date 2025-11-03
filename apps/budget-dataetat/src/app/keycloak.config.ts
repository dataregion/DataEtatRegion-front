import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  provideKeycloak,
  withAutoRefreshToken,
  UserActivityService,
  AutoRefreshTokenService
} from 'keycloak-angular';
import { Keycloak as KeycloakSettings } from 'apps/common-lib/src/public-api';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { EnvironmentProviders } from '@angular/core';
import { MultiRegionClientIdMapper } from 'apps/common-lib/src/lib/environments/mutli-region.mapper.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

export function provideKeycloakAngularDynamic(settingsService: SettingsBudgetService, logger: LoggerService): EnvironmentProviders {
  const keycloak_settings = settingsService.getKeycloakSettings();
  const multi_region = settingsService?.getKeycloakSettings()?.multi_region;

  let clientId = '';
  if (multi_region) {
    logger.debug(`Initialisation de keycloak en mode multiregion`);
    clientId = getClientIdMultiRegion(keycloak_settings);
  } else {
    logger.debug(`Initialisation de keycloak en mode monoregion`);

    if (keycloak_settings.clientId === null || keycloak_settings.clientId === undefined)
      throw new Error('Le clientId est nécessaire dans une configuration monoregion');
    clientId = keycloak_settings.clientId;
  }

  logger.debug(`Initialisation de keycloak avec url: ${keycloak_settings.url}, realm: ${keycloak_settings.realm} et le client id: ${clientId}`);


  const urls = [
    settingsService.apiExternes,
    settingsService.apiExternesV3,
    settingsService.apiFinancialData,
    settingsService.apiFinancialDataV2,
    settingsService.apiFinancialDataV3,
    settingsService.apiReferentiel,
    settingsService.apiReferentielsV3,
    settingsService.apiAdministration,
    settingsService.apiRessource,
    settingsService.apiDemarches
  ];
  const regexPattern = new RegExp(urls.map(url => escapeRegex(url)).join('|'), 'i');

  const urlCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: regexPattern,
    bearerPrefix: 'Bearer'
  });

  return provideKeycloak({
    config: {
      url: keycloak_settings.url,
      realm: keycloak_settings.realm,
      clientId: clientId
    },
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 300000
      })
    ],
    providers: [
      AutoRefreshTokenService,
      UserActivityService,
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [urlCondition]
      }
    ]
  });
}


/**
 * Retourne le clientId en mode MultiRegion
 * @returns 
 */
function getClientIdMultiRegion(settings: KeycloakSettings): string {
  const mapper = new MultiRegionClientIdMapper();
  const clientId = mapper.kc_client_id_from_hostname(
    settings.hostname_client_id_mappings
  );
  return clientId;
}

function escapeRegex(url: string): string {
  return url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}