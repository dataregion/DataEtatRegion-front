import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { SettingsDataQPVService } from './app/environments/settings-qpv.service';
import { ApplicationConfig, CSP_NONCE, LOCALE_ID  } from '@angular/core';
import { provideKeycloakAngularDynamic } from './app/keycloak.config';
import { configApp, providerBugdetConfiguration } from './app/app.config';
import { LoggerService, LogLevel } from 'apps/common-lib/src/lib/services/logger.service';
import { providerMatomoDynamic } from './app/matomo.config';
import { registerLocaleData } from '@angular/common';

import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

function getCspNonce(): string | undefined {
  const nonce = document
    .querySelector('meta[property="csp-nonce"], meta[name="csp-nonce"]')
    ?.getAttribute('content')
    ?.trim();

  return nonce && nonce !== '__CSP_NONCE__' ? nonce : undefined;
}

async function loadApp(): Promise<{ settings: SettingsDataQPVService, logger: LoggerService }> {
  const response = await fetch('/config/settings.json');
  const json = await response.json();

  const settingsService = new SettingsDataQPVService();
  settingsService.setSettings(json);

  const isInProduction = settingsService.getSetting().production;
  const loggerService = new LoggerService();
  if (isInProduction) {
    loggerService.setLogLevel(LogLevel.WARN)
  } else {
    loggerService.setLogLevel(LogLevel.DEBUG)
    loggerService.info('Application en mode développement. Les logs sont en mode trace');
  }
  return { settings: settingsService, logger: loggerService };
}

loadApp().then((services) => {

  const providerMatomo = providerMatomoDynamic(services.settings, services.logger);
  const cspNonce = getCspNonce();
  const appConfig: ApplicationConfig = {
    providers: [
      // Locale
      { provide: LOCALE_ID, useValue: 'fr-FR' },
      // Injecte les services
      { provide: SettingsDataQPVService, useValue: services.settings },
      { provide: LoggerService, useValue: services.logger },
      ...(cspNonce ? [{ provide: CSP_NONCE, useValue: cspNonce }] : []),

      // la conf des uri API
      ...providerBugdetConfiguration(services.settings),

      // Keycloak configuré via useFactory + SettingsDataQPVService + Logger
      // ✅ Appelle une fonction qui retourne les providers
      provideKeycloakAngularDynamic(services.settings, services.logger),
      ...(providerMatomo ? [providerMatomo] : []),
      ...configApp.providers
    ]
  };

  bootstrapApplication(App, appConfig)
    .catch(err => console.error('❌ Bootstrap error:', err));
});