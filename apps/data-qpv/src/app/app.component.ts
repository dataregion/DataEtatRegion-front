import { Component, OnInit, Inject, InjectionToken } from '@angular/core';
import { MultiregionsService } from '@services/multiregions.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, SessionService } from 'apps/common-lib/src/public-api';
import { SettingsService } from '../environments/settings.service';
import { profiles_required_for_managment_page, profiles_required_for_tags_page, profiles_required_for_upload_page, profiles_required_for_demarches } from './modules/administration/administration-routing.module';


export const MULTIREGIONS_SERVICE = new InjectionToken<MultiregionsService>(
  'MultiregionsService'
);

@Component({
  selector: 'data-qpv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public progressBarVisible: boolean = false;
  public isAuthenticated: boolean = false;

  public showManageUsersPage: boolean = false;
  public showUploadFinancialDataPage: boolean = false;
  public showUpdateTagsPage: boolean = false;
  public showIntegrationDemarchePage: boolean = false;
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

      this.showManageUsersPage = this._sessionService.hasOneRole(profiles_required_for_managment_page);
      this.showUploadFinancialDataPage = this._sessionService.hasOneRole(profiles_required_for_upload_page);
      this.showUpdateTagsPage = this._sessionService.hasOneRole(profiles_required_for_tags_page);
      this.showIntegrationDemarchePage = this._sessionService.hasOneRole(profiles_required_for_demarches) && this.settings.getFeatures().integration_ds;
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
