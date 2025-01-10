import { Component, OnInit, Inject } from '@angular/core';
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
  public progressBarVisible: boolean = false;
  public isAuthenticated: boolean = false;

  public region: string = "";

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  constructor(
    private _loaderService: LoaderService,
    private _sessionService: SessionService,
    private _gridFullscreen: GridInFullscreenStateService,
    private _multiregions: MultiregionsService,
    @Inject(SETTINGS) public readonly settings: SettingsService
  ) {}

  ngOnInit(): void {
    this._loaderService.isLoading().subscribe((loading) => {
      this.progressBarVisible = loading;
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
