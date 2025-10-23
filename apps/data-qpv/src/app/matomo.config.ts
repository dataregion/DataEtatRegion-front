import { SettingsDataQPVService } from './environments/settings-qpv.service';
import { EnvironmentProviders } from '@angular/core';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { provideMatomo, withRouteData, withRouter } from 'ngx-matomo-client';

export function providerMatomoDynamic(settingsService: SettingsDataQPVService, logger: LoggerService): EnvironmentProviders | null {
    const matomo_settings = settingsService.getMatomo();

    if (!matomo_settings.disabled) {
        logger.debug("Matomo activé")
        return provideMatomo(
            {
                siteId: matomo_settings.site_id,
                trackerUrl: matomo_settings.tracker_url,
            },
            withRouter(),
            withRouteData(),
        )
    }
    logger.debug("Matomo disabled")
    return null;
}