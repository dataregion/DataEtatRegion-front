import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild, ViewEncapsulation, computed } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import { TableToolbarComponent } from './table-toolbar/table-toolbar.component';
import { DisplayDateComponent } from 'apps/common-lib/src/lib/components/display-date/display-date.component';
import { GroupsTableComponent } from './groups-table/groups-table.component';
import { LinesTableComponent } from './lines-tables/lines-table.component';
import { ActivatedRoute } from '@angular/router';
import { FinancialDataResolverModel } from '../../models/financial/financial-data-resolvers.models';
import { PreFilters } from '../../models/search/prefilters.model';
import { CommonModule } from '@angular/common';
import { SearchDataComponent } from './search-data/search-data.component';
import { ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { ColonnesService } from '@services/colonnes.service';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/public-api';
import { AlertService } from 'apps/common-lib/src/public-api';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { ColonneFromPreference, ColonnesMapperService, ColonneTableau } from '@services/colonnes-mapper.service';
import { SearchDataService } from '@services/search-data.service';
import { PrefilterMapperService } from './search-data/prefilter-mapper.services';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { Bop } from '@models/search/bop.model';
import { InfosLigneComponent } from "../infos-ligne/infos-ligne.component";
import { PreferenceService } from '@services/preference.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, mergeMap } from 'rxjs';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { SearchParameters } from '@services/search-params.service';

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
  imports: [CommonModule, SearchDataComponent, TableToolbarComponent, GroupsTableComponent, LinesTableComponent, DisplayDateComponent, InfosLigneComponent],
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  
  // --- Services injectés ---
  
  /** Service pour accéder aux données de route et aux resolvers */
  private _route = inject(ActivatedRoute);
  
  /** Service pour afficher les alertes utilisateur */
  private _alertService = inject(AlertService);
  
  /** Service HTTP pour récupérer les données d'audit */
  private _auditService = inject(AuditHttpService);
  
  /** Service de gestion des colonnes (sélection, configuration) */
  private _colonnesService = inject(ColonnesService);
  
  /** Service de mapping entre les colonnes et les préférences */
  private _colonnesMapperService = inject(ColonnesMapperService);
  
  /** Service HTTP pour la gestion des préférences utilisateur */
  private _httpPreferenceService = inject(PreferenceUsersHttpService);
  
  /** Service de mapping entre préfiltres et paramètres de recherche */
  private _prefilterMapperService = inject(PrefilterMapperService);
  
  /** Service de gestion de l'état plein écran des grilles */
  private _gridFullscreen = inject(GridInFullscreenStateService);
  
  /** Service central de gestion de la recherche de données */
  private _searchDataService = inject(SearchDataService);
  
  /** Service de gestion des préférences locales */
  private _preferenceService = inject(PreferenceService);
  
  /** Service de logging pour le debugging */
  private _logger = inject(LoggerService);
  
  /** Service de destruction pour les subscriptions */
  private _destroyRef = inject(DestroyRef);

  public readonly grid_fullscreen = inject(GridInFullscreenStateService).isFullscreen;

  // --- Propriétés du template ---
  
  /** Référence au spinner de chargement */
  @ViewChild('spinner', { static: false }) spinner!: ElementRef;

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
    const selectedLine = this.selectedLine();
    return !gridFullscreen && selectedLine === undefined;
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
    const resolvedColonnes = this._route.snapshot.data['colonnes'] as ColonnesResolvedModel;
    const resolvedMarqueBlanche = this._route.snapshot.data['mb_parsed_params'] as MarqueBlancheParsedParamsResolverModel;

    // --- 2. Vérification des erreurs de resolve ---
    const error = resolvedFinancial.error
      || resolvedMarqueBlanche.error
      || resolvedColonnes.error;
    if (error) {
      this.displayError = true;
      this.error = error;
      return;
    }
    
    // --- 3. Initialisation des services de mapping et de colonnes ---
    
    // Initialisation du service de mapper avec les colonnes résolues
    this._colonnesMapperService.initService(
      resolvedColonnes?.data?.colonnesTable ?? [],
      resolvedColonnes?.data?.colonnesGrouping ?? []
    );
    
    // Sauvegarde des colonnes disponibles dans le service de colonnes
    this._colonnesService.allColonnesTable.set(this._colonnesMapperService.colonnes);
    this._colonnesService.allColonnesGrouping.set(this._colonnesMapperService.colonnes.filter(c => c.grouping !== undefined));

    // --- 4. Application des paramètres de marque blanche ---
    const mb_group_by = resolvedMarqueBlanche.data?.group_by;
    
    // Application du grouping par défaut si spécifié par la marque blanche
    if (mb_group_by && mb_group_by?.length > 0) {
      const mapped: ColonneTableau<FinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(mb_group_by as ColonneFromPreference[]);
      this._colonnesService.selectedColonnesGrouping.set(mapped);
    }

    // --- 5. Initialisation du service de mapping des préfiltres ---
    
    const themes: string[] = resolvedFinancial.data?.themes ?? [];
    const programmes: Bop[] = resolvedFinancial.data?.bop ?? [];
    const referentiels: ReferentielProgrammation[] = resolvedFinancial.data?.referentiels_programmation ?? [];
    const annees: number[] = resolvedFinancial.data?.annees ?? [];
    this._prefilterMapperService.initService(themes, programmes, referentiels, annees);

    // --- 6. Écoute des paramètres de query pour l'application des préférences ---
    
    this._route.queryParams.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((param) => {
      // Configuration des colonnes par défaut
      this._colonnesService.selectedColonnesTable.set(this._colonnesMapperService.getDefaults());

      // Si une préférence doit être appliquée (UUID fourni dans l'URL)
      if (param[QueryParam.Uuid]) {
        this._logger.debug("==> Détection UUID", param[QueryParam.Uuid]);

        this._httpPreferenceService
          .getPreference(param[QueryParam.Uuid])
          .pipe(
            takeUntilDestroyed(this._destroyRef),
            mergeMap(preference => {
              const searchParams$ = 
                this._prefilterMapperService.mapAndResolvePrefiltersToSearchParams$(preference.filters as PreFilters);
                return searchParams$
                .pipe(
                  map((searchParams): [Preference, SearchParameters | undefined] => [preference, searchParams])
                );
            })
          )
          .subscribe(([ preference, searchParams ]) => {

            this._logger.debug("==> Chargement preference", preference);
            // Sauvegarde de la préférence courante
            this._preferenceService.setCurrentPreference(preference);

            // // Application des préférences de grouping des colonnes
            if (preference.options && preference.options['grouping']) {
              const mapped: ColonneTableau<FinancialDataModel>[] =
                this._colonnesMapperService.mapNamesFromPreferences(
                  preference.options['grouping'] as ColonneFromPreference[]
                );
              this._colonnesService.selectedColonnesGrouping.set(mapped);
              this._colonnesService.selectedColonnesGrouped.set([]);
              this._logger.debug("==> Grouping a appliquer", mapped);
            }

            // Application des préférences d'ordre et d'affichage des colonnes
            if (preference.options && preference.options['displayOrder']) {
              const mapped: ColonneTableau<FinancialDataModel>[] =
                this._colonnesMapperService.mapLabelsFromPreferences(
                  preference.options['displayOrder'] as ColonneFromPreference[]
                );
              this._colonnesService.selectedColonnesTable.set(mapped);
              this._logger.debug("==> DislayOrder a appliquer", mapped);
            }

            // Application des filtres de la préférence
            const param = searchParams;
            this._searchDataService.search(param!).subscribe();          
            this._alertService.openInfo(`Application du filtre ${preference.name}`);
          });
      }
    });

    // --- 7. Récupération de la date du dernier import ---
    
    this._auditService.getLastDateUpdateData()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((response) => {
        if (response.date) {
          this.lastImportDate = response.date;
        }
      });
  }
}
