import { RouterOutlet } from '@angular/router';
import { Component, InjectionToken, OnInit, inject} from '@angular/core';
import { MultiregionsService } from '@services/multiregions.service';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, Ressources, SessionService } from 'apps/common-lib/src/public-api';
// import {
//   profiles_required_for_demarches,
//   profiles_required_for_managment_page,
//   profiles_required_for_tags_page,
//   profiles_required_for_upload_page
// } from './modules/administration/administration-routing.module';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ResourceService } from './services/ressource.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent } from 'apps/common-lib/src/lib/components/header/header.component';

export const MULTIREGIONS_SERVICE = new InjectionToken<MultiregionsService>('MultiregionsService');

@Component({
  selector: 'budget-root',
  imports: [RouterOutlet, HeaderComponent, MatProgressBar, MatMenuModule,CommonModule ],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _multiregions = inject(MultiregionsService);
  private _resourceService = inject(ResourceService);
  readonly settings = inject(SettingsBudgetService);

  public progressBarVisible: boolean = false;
  public isAuthenticated: boolean = false;

  public showManageUsersPage: boolean = false;
  public showUploadFinancialDataPage: boolean = false;
  public showUpdateTagsPage: boolean = true;
  public showIntegrationDemarchePage: boolean = false;
  public ressources = toSignal(this._resourceService.getResources(), {initialValue: null});

  get region() {
    return this._multiregions.getRegionLabel()
  }

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  ngOnInit(): void {
    this._loaderService.isLoading().subscribe((loading) => {
      this.progressBarVisible = loading;
    });

    this._sessionService.getUser().subscribe((user) => {
      this.isAuthenticated = user !== null;

      // this.showManageUsersPage = this._sessionService.hasOneRole(
      //   profiles_required_for_managment_page
      // );
      // this.showUploadFinancialDataPage = this._sessionService.hasOneRole(
      //   profiles_required_for_upload_page
      // );
      // this.showUpdateTagsPage = this._sessionService.hasOneRole(profiles_required_for_tags_page);
      // this.showIntegrationDemarchePage = 
      //   this._sessionService.hasOneRole(profiles_required_for_demarches) &&
      //   this.settings.getFeatures().integration_ds;

    });
  }

  public get contact(): string | undefined {
    return this.settings.getSetting().contact;
  }

  public get help(): string | undefined {
    return this.settings.getSetting().help_pdf;
  }

  public getRessource(key: string, ressources: Ressources): string | undefined {
    switch (key) {
      case 'visuterritoire':
        return ressources.visuterritoire;
      case 'relance':
        return ressources.relance;
      case 'graphiques':
        return ressources.graphiques;
      case 'api_swagger':
        return ressources.api_swagger;
      case 'documentation':
        return ressources.documentation;
      case 'suivi_usage':
        return ressources.suivi_usage;
      case 'grist':
        return ressources.grist;
      default:
        return undefined;
    }  
  }
}

