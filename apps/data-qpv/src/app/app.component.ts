import { Component, OnInit, signal, inject } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, SessionService } from 'apps/common-lib/src/public-api';
import { MultiregionsService } from './services/multiregions.service';
import { SettingsService } from '../environments/settings.service';


@Component({
    selector: 'data-qpv-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _multiregions = inject(MultiregionsService);
  readonly settings = inject<SettingsService>(SETTINGS);

  public progressBarVisible = signal<boolean>(false);
  public isAuthenticated: boolean = false;

  public region: string = "";

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  ngOnInit(): void {
    this._loaderService.isLoading().subscribe((loading) => {
      this.progressBarVisible.set(loading);
    });

    this._sessionService.getUser().subscribe((user) => {
      this.isAuthenticated = user !== null;
    });

    this.region = this._multiregions.getRegionByHostname();
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
