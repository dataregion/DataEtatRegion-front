import { RouterLink, RouterOutlet } from '@angular/router';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, Ressources, SessionService } from 'apps/common-lib/src/public-api';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ResourceService } from './services/ressource.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent } from 'apps/common-lib/src/lib/components/header/header.component';
import { profiles_required_for_demarches, profiles_required_for_tags_page, profiles_required_for_upload_page } from './app.routes';
import { MultiregionsService } from './services/multiregions.service';
import { FooterComponent } from 'apps/common-lib/src/lib/components/footer/footer.component';

@Component({
  selector: 'budget-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MatProgressBar, MatMenuModule, CommonModule, RouterLink],
  templateUrl: './app.html',
})
export class App {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _multiregions = inject(MultiregionsService);
  private _resourceService = inject(ResourceService);
  readonly settings = inject(SettingsBudgetService);

  public isAuthenticated: boolean = false;

  public showUploadFinancialDataPage: boolean = false;
  public showUpdateTagsPage: boolean = false;
  public showIntegrationDemarchePage: boolean = false;
  public ressources = toSignal(this._resourceService.getResources(), { initialValue: null });

  public user = toSignal(this._sessionService.getUser());

  public isLoading = toSignal(this._loaderService.isLoading(), { initialValue: true })
  public progressBarVisible = computed(() => this.isLoading());

  public title = signal<string>('Budget Data État')

  constructor() {
    effect(() => {
      if (this.user()) {
        this.isAuthenticated = true;
        this.showUploadFinancialDataPage = this._sessionService.hasOneRole(
          profiles_required_for_upload_page
        );
        this.showUpdateTagsPage = this._sessionService.hasOneRole(profiles_required_for_tags_page);
        this.showIntegrationDemarchePage =
          this._sessionService.hasOneRole(profiles_required_for_demarches) &&
          this.settings.getFeatures().integration_ds;
      }

      const region = this._multiregions.getRegionLabel(this._sessionService.regionCode()!);
      this.title.set('Budget Data État ' + region);
    })
  }


  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
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

