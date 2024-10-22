import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { MultiregionsService } from '@services/multiregions.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, SessionService } from 'apps/common-lib/src/public-api';
import { SettingsService } from '../environments/settings.service';
import {
  profiles_required_for_demarches,
  profiles_required_for_managment_page,
  profiles_required_for_tags_page,
  profiles_required_for_upload_page
} from './modules/administration/administration-routing.module';
import { ResourceService } from '@services/ressource.service';
import { Ressources } from '@models/ressource/ressource.models';

export const MULTIREGIONS_SERVICE = new InjectionToken<MultiregionsService>('MultiregionsService');

@Component({
  selector: 'financial-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public progressBarVisible: boolean = false;
  public isAuthenticated: boolean = false;

  public showManageUsersPage: boolean = false;
  public showUploadFinancialDataPage: boolean = false;
  public showUpdateTagsPage: boolean = false;
  public showIntegrationDemarchePage: boolean = false;
  public ressources!: Ressources;
  public ressourcesLoaded: boolean = false;
  
  get region() {
    return this._multiregions.getRegionLabel()
  }

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  constructor(
    private _loaderService: LoaderService,
    private _sessionService: SessionService,
    private _gridFullscreen: GridInFullscreenStateService,
    private _multiregions: MultiregionsService,
    private _resourceService: ResourceService,
    @Inject(SETTINGS) public readonly settings: SettingsService
  ) {}

  ngOnInit(): void {
    this._loaderService.isLoading().subscribe((loading) => {
      this.progressBarVisible = loading;
    });

    this._sessionService.getUser().subscribe((user) => {
      this.isAuthenticated = user !== null;

      this.showManageUsersPage = this._sessionService.hasOneRole(
        profiles_required_for_managment_page
      );
      this.showUploadFinancialDataPage = this._sessionService.hasOneRole(
        profiles_required_for_upload_page
      );
      this.showUpdateTagsPage = this._sessionService.hasOneRole(profiles_required_for_tags_page);
      this.showIntegrationDemarchePage =
        this._sessionService.hasOneRole(profiles_required_for_demarches) &&
        this.settings.getFeatures().integration_ds;

      this._resourceService.getResources().subscribe(
        (data: Ressources) => {
          this.ressources = data;
          this.ressourcesLoaded = true;
        },
        (error) => {
          console.error('Erreur lors de la récupération des ressources :', error);
        }
      );  
    });
  }

  public get contact(): string | undefined {
    return this.settings.getSetting().contact;
  }

  public get help(): string | undefined {
    return this.settings.getSetting().help_pdf;
  }

  public getRessource(key: string): string | undefined {
    if (!this.ressourcesLoaded) {
      console.warn('Les ressources ne sont pas encore chargées.');
      return undefined;
    }
    switch (key) {
        case 'visuterritoire':
          return this.ressources.visuterritoire;
        case 'relance':
          return this.ressources.relance;
        case 'graphiques':
          return this.ressources.graphiques;
        case 'api_swagger':
          return this.ressources.api_swagger;
        case 'documentation':
          return this.ressources.documentation;
        case 'suivi_usage':
          return this.ressources.suivi_usage;
        case 'grist':
          return this.ressources.grist;
        default:
          return undefined;
    }  
  }
}
