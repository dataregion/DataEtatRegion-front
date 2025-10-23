import { Component, inject, computed } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, SessionService } from 'apps/common-lib/src/public-api';
import { MultiregionsService } from './services/multiregions.service';
import { SettingsService } from '../environments/settings.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from 'apps/common-lib/src/lib/components/header/header.component';
import { FooterComponent } from 'apps/common-lib/src/lib/components/footer/footer.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'data-qpv-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MatProgressBar, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _multiregions = inject(MultiregionsService);
  readonly settings = inject<SettingsService>(SETTINGS);

  public readonly grid_fullscreen = inject(GridInFullscreenStateService).isFullscreen;

  public user = toSignal(this._sessionService.getUser());

  public isLoading = toSignal(this._loaderService.isLoading(), { initialValue: true })
  public progressBarVisible = computed(() => this.isLoading());

  readonly isAuthenticated = computed(() => Boolean(this.user()));

  readonly title = computed(() => {
    const authenticated = this.isAuthenticated();
    const codeRegion = this._sessionService.regionCode();
    if (authenticated && codeRegion) {
      const region = this._multiregions.getRegionByHostname();
      return 'Data QPV ' + region;
    }
    return 'Data QPV';
  });

  constructor() {
  }

  public get contact(): string | undefined {
    return this.settings.getSetting().contact;
  }

  public get help(): string | undefined {
    return this.settings.getSetting().help_pdf;
  }

  public getRessource(key: string): string | undefined {
    let ressource: string | undefined;
    switch (key) {
      case "visuterritoire":
        ressource = this.settings.getRessources().visuterritoire;
        break;
      case "relance":
        ressource = this.settings.getRessources().relance;
        break;
      case "graphiques":
        ressource = this.settings.getRessources().graphiques;
        break;
      case "api_swagger":
        ressource = this.settings.getRessources().api_swagger;
        break;
      case "documentation":
        ressource = this.settings.getRessources().documentation;
        break;
      case "suivi_usage":
        ressource = this.settings.getRessources().suivi_usage;
        break;
      default:
        ressource = undefined;
    }
    return ressource
  }

}
