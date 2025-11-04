import { Component, ElementRef, inject, OnInit, ViewChild, ViewEncapsulation, computed } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { ActivatedRoute } from '@angular/router';
import { FinancialDataResolverModel } from '../../models/financial/financial-data-resolvers.models';
import { CommonModule } from '@angular/common';
import { SearchDataComponent } from './search-data/search-data.component';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { SearchDataService } from '../../services/search-data.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { TabsMapTableComponent } from './tabs-map-table/tabs-map-table.component';
import { TabDashboardsComponent } from './tabs-dashboards/tabs-dashboards.component';
import { EqualizeAllTabsDirective } from '../../directives/equalize-all-tabs.directive';


/**
 * Composant principal de la page d'accueil de l'application budget-dataetat.
 * 
 * Ce composant orchestre l'affichage de la recherche de données financières et des résultats.
 * Il gère :
 * - L'initialisation des services de colonnes et de mapping
 * - L'application des préférences utilisateur et des paramètres de marque blanche
 * - L'affichage conditionnel du formulaire de recherche et des résultats
 * - La gestion des états (recherche en cours, résultats vides, erreurs)
 */
@Component({
  selector: 'data-qpv-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, SearchDataComponent, TabDashboardsComponent, TabsMapTableComponent, EqualizeAllTabsDirective],
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  
  // --- Services injectés ---
  
  /** Service pour accéder aux données de route et aux resolvers */
  private _route = inject(ActivatedRoute);
  
  /** Service central de gestion de la recherche de données */
  private _searchDataService = inject(SearchDataService);
  
  /** Service de logging pour le debugging */
  private _logger = inject(LoggerService);
  
  public readonly grid_fullscreen = inject(GridInFullscreenStateService).isFullscreen;

  // --- Propriétés du template ---
  
  /** Référence au spinner de chargement */
  @ViewChild('spinner', { static: false }) spinner!: ElementRef;

  /** Date du dernier import des données financières */
  lastImportDate: string | null = null;

  // --- Signals du service de recherche ---
  
  /** Signal indiquant si une recherche a déjà été effectuée */
  public readonly firstSearchDone = this._searchDataService.firstSearchDone;
  
  /** Signal indiquant si une recherche est en cours */
  public readonly searchInProgress = this._searchDataService.searchInProgress;
  
  /** Signal contenant les résultats de la recherche */
  public readonly searchResults = this._searchDataService.searchResults;
  
  /** Signal indiquant si la recherche est terminée */
  public readonly searchFinish = this._searchDataService.searchFinish;
  
  /** Signal contenant la ligne sélectionnée pour affichage détaillé */
  // public readonly selectedLine = this._searchDataService.selectedLine;
  
  /** Signal contenant les paramètres de recherche actuels */
  public readonly searchParams = this._searchDataService.searchParams;

  // --- Computed signals pour l'état d'affichage ---

  /** 
   * Computed signal indiquant si le formulaire de recherche doit être affiché 
   * @returns true si on n'est pas en plein écran et qu'aucune ligne n'est sélectionnée
   */
  public readonly showSearchForm = computed(() => {
    return !this.grid_fullscreen()
  });

  // --- Gestion des erreurs ---
  
  /** 
   * Indique si une erreur doit être affichée à l'utilisateur 
   */
  public displayError = false;
  
  /** 
   * Contient l'erreur à afficher (erreur de resolver généralement)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error: Error | any | null = null;

  // --- Lifecycle hooks ---

  /**
   * Initialisation du composant.
   * 
   * Cette méthode :
   * 1. Récupère les données des resolvers (référentiels, colonnes, marque blanche)
   * 2. Vérifie s'il y a des erreurs et les affiche le cas échéant
   */
  ngOnInit() {
    // --- 1. Récupération des données des resolvers ---
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    // const resolvedColonnes = this._route.snapshot.data['colonnes'] as ColonnesResolvedModel;
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;

    // --- 2. Vérification des erreurs de resolve ---
    const error = resolvedFinancial.error
      || resolvedMarqueBlanche.error
      // || resolvedColonnes.error;
    if (error) {
      this.displayError = true;
      this.error = error;
      return;
    }
  }

  public searchParametersToText() {
    return this._searchDataService.searchParametersToText()
  }

}
