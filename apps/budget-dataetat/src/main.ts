import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { SettingsBudgetService } from './app/environments/settings-budget.service';
import { ApplicationConfig } from '@angular/core';
import { provideKeycloakAngularDynamic } from './app/keycloak.config';
import { configApp, providerBugdetConfiguration } from './app/app.config';
import { LoggerService, LogLevel } from 'apps/common-lib/src/lib/services/logger.service';
import { providerMatomoDynamic } from './app/matomo.config';

async function loadApp(): Promise<{settings: SettingsBudgetService,logger: LoggerService}> {
  const response = await fetch('/config/settings.json');
  const json = await response.json();

  const settingsService = new SettingsBudgetService();
  settingsService.setSettings(json);

  const is_in_production = settingsService.getSetting().production;
  const loggerService = new LoggerService();
  if (is_in_production) {
    loggerService.setLogLevel(LogLevel.WARN)
  } else {
    loggerService.setLogLevel(LogLevel.DEBUG)
    loggerService.info('Application en mode développement. Les logs sont en mode trace');
  }
  return {settings : settingsService, logger : loggerService};
}

loadApp().then((services) => {

  const providerMatomo = providerMatomoDynamic(services.settings, services.logger);
  const appConfig: ApplicationConfig = {
    providers: [
      // Injecte les services
      { provide: SettingsBudgetService, useValue: services.settings },
      { provide: LoggerService, useValue: services.logger },

      // la conf des uri API
      providerBugdetConfiguration(services.settings),

      // Keycloak configuré via useFactory + SettingsBudgetService + Logger
      // ✅ Appelle une fonction qui retourne les providers
      provideKeycloakAngularDynamic(services.settings, services.logger),
      ...(providerMatomo ? [providerMatomo] : []),
      ...configApp.providers
    ]
  };

  bootstrapApplication(App, appConfig)
    .catch(err => console.error('❌ Bootstrap error:', err));
});