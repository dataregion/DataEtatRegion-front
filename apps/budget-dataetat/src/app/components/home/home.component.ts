import { Component, DestroyRef, inject, OnInit, ViewChild, ViewEncapsulation, computed } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { TableToolbarComponent } from './table-toolbar/table-toolbar.component';
import { DisplayDateComponent } from 'apps/common-lib/src/lib/components/display-date/display-date.component';
import { GroupsTableComponent } from './groups-table/groups-table.component';
import { LinesTableComponent } from './lines-tables/lines-table.component';
import { ActivatedRoute } from '@angular/router';
import { FinancialDataResolverModel } from '../../models/financial/financial-data-resolvers.models';
import { CommonModule } from '@angular/common';
import { SearchDataComponent } from './search-data/search-data.component';
import { ColonnesService } from '@services/colonnes.service';
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { SearchDataService } from '@services/search-data.service';
import { InfosLigneComponent } from "../infos-ligne/infos-ligne.component";
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsfrModalModule, DsfrModalComponent } from '@edugouvfr/ngx-dsfr';
import { PreferenceResolverModel } from '@models/preference/preference-resolver.models';

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
  selector: 'budget-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, SearchDataComponent, InfosLigneComponent, DsfrModalModule, TableToolbarComponent, GroupsTableComponent, LinesTableComponent, DisplayDateComponent],
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  
  // --- Services injectés ---
  
  /** Service pour accéder aux données de route et aux resolvers */
  private _route = inject(ActivatedRoute);

  
  /** Service HTTP pour récupérer les données d'audit */
  private _auditService = inject(AuditHttpService);
  
  /** Service de gestion des colonnes (sélection, configuration) */
  private _colonnesService = inject(ColonnesService);
  
  /** Service central de gestion de la recherche de données */
  private _searchDataService = inject(SearchDataService);
  
  /** Service de logging pour le debugging */
  private _logger = inject(LoggerService);
  
  /** Service de destruction pour les subscriptions */
  private _destroyRef = inject(DestroyRef);

  public readonly grid_fullscreen = inject(GridInFullscreenStateService).isFullscreen;

  // --- Propriétés du template ---

  /** Référence au modal d'informations de ligne */
  @ViewChild('modalLigne', { static: false }) modalLigne!: DsfrModalComponent;

  /** Date du dernier import des données financières */
  lastImportDate: string | null = null;

  // --- Getters pour le template ---

  /** 
   * Indique si les résultats sont affichés en mode groupé 
   * @returns true si les colonnes de grouping sont sélectionnées
   */
  get grouped(): boolean {
    return this._colonnesService.grouped();
  }

  /**
   * Indique si une recherche groupée est en cours
   * @returns true si une recherche groupée est en cours
   */
  get searchGroupingInProgress(): boolean {
    return this._searchDataService.searchGroupingInProgress();
  }
  
  // --- Signals du service de recherche ---
  
  /** Signal indiquant si une recherche est en cours */
  public readonly searchInProgress = this._searchDataService.searchInProgress;
  
  /** Signal contenant les résultats de la recherche */
  public readonly searchResults = this._searchDataService.searchResults;
  
  /** Signal indiquant si la recherche est terminée */
  public readonly searchFinish = this._searchDataService.searchFinish;
  
  /** Signal contenant la ligne sélectionnée pour affichage détaillé */
  public readonly selectedLine = this._searchDataService.selectedLine;
  
  /** Signal contenant les paramètres de recherche actuels */
  public readonly searchParams = this._searchDataService.searchParams;

  // --- Computed signals pour l'état d'affichage ---

  /** 
   * Computed signal indiquant si le message "aucun résultat" doit être affiché 
   * @returns true si la recherche est terminée, qu'il n'y a pas de résultats mais qu'il y a des paramètres
   */
  public readonly shouldShowEmptyMessage = computed(() => {
    const finished = this.searchFinish();
    const results = this.searchResults();
    const hasResults = results && results.length > 0;
    const hasParams = this.searchParams() !== undefined;
    this._logger.debug("==> shouldShowEmptyMessage", { finished, hasResults, hasParams });
    return finished && !hasResults && hasParams;
  });

  /** 
   * Computed signal indiquant si le contenu principal doit être affiché 
   * @returns true s'il y a des résultats ou qu'une ligne est sélectionnée
   */
  public readonly shouldShowContent = computed(() => {
    const results = this.searchResults();
    const hasResults = results && results.length > 0;
    const selectedLine = this.selectedLine();
    return hasResults || selectedLine !== undefined;
    
  });

  /** 
   * Computed signal indiquant si le formulaire de recherche doit être affiché 
   * @returns true si on n'est pas en plein écran et qu'aucune ligne n'est sélectionnée
   */
  public readonly showSearchForm = computed(() => {
    const gridFullscreen = this.grid_fullscreen();
    const show = !gridFullscreen;
    return show
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
   * 3. Initialise les services de mapping et de colonnes
   * 4. Applique les paramètres de marque blanche (grouping, plein écran)
   * 5. Écoute les paramètres de query pour appliquer des préférences
   * 6. Récupère la date du dernier import des données
   */
  ngOnInit() {
    // --- 1. Récupération des données des resolvers ---
    const resolvedFinancial = this._route.snapshot.data['financial'] as FinancialDataResolverModel;
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;
    const resolvedPreference = this._route.snapshot.data['preference'] as PreferenceResolverModel;

    // --- 2. Vérification des erreurs de resolve ---
    const error = resolvedFinancial.error
      || resolvedMarqueBlanche.error
      || resolvedPreference?.error;
    if (error) {
      this.displayError = true;
      this.error = error;
      return;
    }
     
    this._auditService.getLastDateUpdateData()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((response) => {
        if (response.date) {
          this.lastImportDate = response.date;
        }
      });
  }

  // --- Méthodes publiques ---

  /**
   * Gestionnaire d'événement pour l'ouverture du modal d'informations de ligne.
   * Appelé quand une ligne est cliquée dans le tableau.
   * 
   * @param line - La ligne financière sélectionnée
   */
  onLineClicked(line: BudgetFinancialDataModel): void {
    this._logger.debug("==> Ouverture du modal pour la ligne", line);
    this.modalLigne.open();
  }
}
