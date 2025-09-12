import { RouterLink, RouterOutlet } from '@angular/router';
import { Component, computed, effect, HostListener, inject } from '@angular/core';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { LoaderService, Ressources, SessionService } from 'apps/common-lib/src/public-api';
import { SettingsBudgetService } from './environments/settings-budget.service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ResourceService } from './services/http/ressource.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent } from 'apps/common-lib/src/lib/components/header/header.component';
import { profiles_required_for_demarches, profiles_required_for_tags_page, profiles_required_for_upload_financial_page } from './app.routes';
import { MultiregionsService } from './services/multiregions.service';
import { FooterComponent } from 'apps/common-lib/src/lib/components/footer/footer.component';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

@Component({
  selector: 'budget-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MatProgressBar, MatMenuModule, CommonModule, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  private _loaderService = inject(LoaderService);
  private _sessionService = inject(SessionService);
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _multiregions = inject(MultiregionsService);
  private _resourceService = inject(ResourceService);
  private logger = inject(LoggerService).getLogger(App.name);
  readonly settings = inject(SettingsBudgetService);

  public ressources = toSignal(this._resourceService.getResources(), { initialValue: null });

  public user = toSignal(this._sessionService.getUser());

  public isLoading = toSignal(this._loaderService.isLoading(), { initialValue: true })
  public progressBarVisible = computed(() => this.isLoading());

  readonly isAuthenticated = computed(() => Boolean(this.user()));
  
  readonly title = computed(() => {
    const authenticated = this.isAuthenticated();
    const codeRegion = this._sessionService.regionCode();
    if (authenticated && codeRegion) {
      const region = this._multiregions.getRegionLabel(codeRegion!);
      return 'Budget Data État ' + region;
    }
    return 'Budget Data État';
  });
  
  readonly showUpdateTagsPage = computed(() => {
    return this.isAuthenticated() && this._sessionService.hasOneRole(profiles_required_for_tags_page);
  });
  
  readonly showIntegrationDemarchePage = computed(() => {
    return this.isAuthenticated() && 
           this._sessionService.hasOneRole(profiles_required_for_demarches) &&
           this.settings.getFeatures().integration_ds;
  });
  
  readonly showUploadFinancialDataPage = computed(() => { 
    return this.isAuthenticated() && this._sessionService.hasOneRole(
      profiles_required_for_upload_financial_page
    ) 
  });

  constructor() {
    effect(() => {
      this.logger.debug(
        "Affichage de la page d'édition des tags: " + this.showUpdateTagsPage()
      );
    });
    
    effect(() => {
      this.logger.debug(
        "Affichage de l'intégration des démarches: " + this.showIntegrationDemarchePage()
      );
    });

    effect(() => {
      this.logger.debug(
        "Affichage de la page d'upload des données financières: " + this.showUploadFinancialDataPage()
      );
    });
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
  
  // Bouton back to top
  showBackToTop = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.showBackToTop = scrollY > 300;
  }
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

