/**
 * Service centralisé pour la gestion de la recherche et des résultats financiers.
 * Expose l'état via des BehaviorSubject/Observable et propose des méthodes utilitaires pour la transformation des données.
 */
import { inject, Injectable, signal } from '@angular/core';
import { mergeMap, Observable, of, tap } from 'rxjs';
import { SearchParameters } from '@services/search-params.service';
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { SearchDataMapper } from './search-data-mapper.service';
import { EnrichedFlattenFinancialLines2, GroupedData, LignesFinancieresService, LignesResponse, PaginationMeta, Total } from 'apps/clients/v3/financial-data';
import { ColonnesService } from '@services/colonnes.service';
import { SearchParamsService } from './search-params.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { ColonneFromPreference, ColonnesMapperService, ColonneTableau } from './colonnes-mapper.service';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { PrefilterMapperService } from '../components/home/search-data/prefilter-mapper.services';
import { PreFilters } from '@models/search/prefilters.model';
import { MarqueBlancheParsedParams } from '../resolvers/marqueblanche-parsed-params.resolver';


export type SearchResults = GroupedData[] | BudgetFinancialDataModel[]

@Injectable({
  providedIn: 'root'
})
export class SearchDataService {

  // --- Services dépendants ---
  private _mapper: SearchDataMapper = inject(SearchDataMapper);
  private _colonnesService: ColonnesService = inject(ColonnesService);
  private _searchParamsService: SearchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  private _logger = inject(LoggerService).getLogger(SearchDataService.name);
  private _colonnesMapperService = inject(ColonnesMapperService);
  private _prefilterMapperService = inject(PrefilterMapperService);

  /**
   * Paramètres courants de la recherche.
   */
  public readonly searchParams = signal<SearchParameters | undefined>(undefined, {
    equal: (a, b) => SearchParameters.isEqual(a!, b!)
  });

  /**
   * Total des résultats de la recherche.
   */
  public readonly total = signal<Total | undefined>(undefined);

  /**
   * Ligne sélectionnée (détail consulté par l'utilisateur).
   */
  public readonly selectedLine = signal<BudgetFinancialDataModel | undefined>(undefined);

  /**
   * Indique si la recherche est terminée.
   */
  public readonly searchFinish = signal<boolean>(false);

  /**
   * Indique si une recherche est en cours.
   */
  public readonly searchInProgress = signal<boolean>(false);

  /**
   * Indique si une recherche de grouping est en cours.
   */
  public readonly searchGroupingInProgress = signal<boolean>(false);

  /**
   * Résultats de la recherche (tableau de lignes ou de groupes).
   */
  public readonly searchResults = signal<SearchResults>([]);

  /**
   * Métadonnées de pagination des résultats.
   */
  public readonly pagination = signal<PaginationMeta | null>(null);


  public flatSearchFromScratch(searchParams: SearchParameters) {
    this._logger.debug('==> Début de la méthode flatSearchFromScratch');
    this._colonnesService.selectedColonnesGrouping.set([]);
    return this._doSearch(searchParams);
  }


  /**
   * Lance la recherche depuis une preference utilisateur
   * @param preference 
   * @returns 
   */
  public searchFromPreference(preference: Preference): Observable<LignesResponse> {
    this._logger.debug('==> Début de la méthode searchFromPreference', { preference });

    // Application des préférences de grouping des colonnes
    const groupings = (preference.options && preference.options['grouping']) ? preference.options['grouping'] : [];
    const mappedGrouping: ColonneTableau<BudgetFinancialDataModel>[] =
      this._colonnesMapperService.mapNamesFromPreferences(
        groupings as ColonneFromPreference[]
      );

    // Application des préférences d'ordre et d'affichage des colonnes
    const displayOrder = (preference.options && preference.options['displayOrder']) ? preference.options['displayOrder'] : [];
    const mappedDisplayOrder: ColonneTableau<BudgetFinancialDataModel>[] =
      this._colonnesMapperService.mapLabelsFromPreferences(
        displayOrder as ColonneFromPreference[]
      );

    const searchParams$ =
      this._prefilterMapperService.mapAndResolvePrefiltersToSearchParams$(preference.filters as PreFilters);
    return searchParams$
      .pipe(
        mergeMap(searchParams => {
          // Nettoyage des résultats précédents
          this._cleanSearchResults();
          if (searchParams === undefined) return of();

          this._colonnesService.selectedColonnesGrouping.set(mappedGrouping);
          this._colonnesService.selectedColonnesGrouped.set([]);
          this._logger.debug("==> Grouping appliqué dans searchFromPreference", mappedGrouping);
          //   // Application des colonnes d'affichage
          this._colonnesService.selectedColonnesTable.set(mappedDisplayOrder);
          this._logger.debug("==> DisplayOrder appliqué dans searchFromPreference", mappedDisplayOrder);


          // Lancement de la recherche avec application des colonnes
          return this._doSearch(searchParams);
        })
      )
  }


  public searchFromMarqueBlanche(mqb: MarqueBlancheParsedParams): Observable<LignesResponse> {
    this._logger.debug('==> Début de la méthode searchFromMarqueBlanche', { mqb });
    const searchParams$ =
      this._prefilterMapperService.mapAndResolvePrefiltersToSearchParams$(mqb.preFilters as PreFilters);
    return searchParams$
      .pipe(
        mergeMap(searchParams => {
          // Nettoyage des résultats précédents
          if (searchParams === undefined) return of();

          const mb_group_by = mqb.group_by;
          // Application du grouping par défaut si spécifié par la marque blanche
          if (mb_group_by && mb_group_by?.length > 0) {
            const mappedGrouping: ColonneTableau<BudgetFinancialDataModel>[] = this._colonnesMapperService.mapNamesFromPreferences(mb_group_by as ColonneFromPreference[]);
            this._colonnesService.selectedColonnesGrouping.set(mappedGrouping);
            this._logger.debug("==> Grouping appliqué dans searchFromPreference", mappedGrouping);
          }
          this._colonnesService.selectedColonnesGrouped.set([]);
          // Lancement de la recherche avec application des colonnes
          return this._doSearch(searchParams);
        })
      )
  }


  /**
   * Change la selection des colonnes
   * @param selectedColonnes 
   */
  public doSelectColumn(selectedColonnes: ColonneTableau<BudgetFinancialDataModel>[]) {
    this._logger.debug('==> Début de la méthode doSelectColumn', { selectedColonnes });

    // set les grouping;
    this._colonnesService.selectedColonnesTable.set(selectedColonnes);
    this._colonnesService.selectedColonnesGrouping.set([]);
    this._colonnesService.selectedColonnesGrouped.set([]);
    this.searchGroupingInProgress.set(false);
  }

  /**
   * Lance la recherche avec des colonnes de grouping sélectionnées.
   * @param selectedColonnes 
   * @returns 
   */
  public doSearchGrouping(selectedColonnes: ColonneTableau<BudgetFinancialDataModel>[]): Observable<LignesResponse> {
    this._logger.debug('==> Début de la méthode doSearchGrouping', { selectedColonnes });

    // Vérifications préalables
    const currentParams = {
      ...this.searchParams()
    } as SearchParameters;

    currentParams.page = 1; // on force la page 1 sur le grouping

    if (selectedColonnes.length === 0) {
      return this.resetSearchGrouping();
    } else {
      this._colonnesService.selectedColonnesGrouping.set(selectedColonnes);
      this._colonnesService.selectedColonnesGrouped.set([]);
      this.searchGroupingInProgress.set(true);
      return this._doSearch(currentParams!).pipe(tap({
        next: () => {
          this.searchGroupingInProgress.set(false);
        }
      }));
    }
  }

  /**
   * Lance la recherche depuis un grouping
   * @param newGrouping 
   * @param newGrouped 
   * @returns 
   */
  public searchFromGrouping(newGrouping: ColonneTableau<BudgetFinancialDataModel>[], newGrouped: string[]) {
    this._logger.debug('==> Début de la méthode searchFromGrouping', { newGrouping, newGrouped });
    this._colonnesService.selectedColonnesGrouping.set(newGrouping);
    this._colonnesService.selectedColonnesGrouped.set(newGrouped);

    this.searchGroupingInProgress.set(false);
    this.searchFinish.set(false);
    this.searchResults.set([]);
    return this._doSearch(this.searchParams()!);
  }

  /**
   * Annule la recherche grouping et remet les ligne à plat
   */
  public resetSearchGrouping() {
    this.searchGroupingInProgress.set(false);
    this._colonnesService.selectedColonnesGrouping.set([]);
    this._colonnesService.selectedColonnesGrouped.set([]);

    const search = this.searchParams();
    this.searchResults.set([]);
    this.searchFinish.set(false);
    if (search) {
      search.grouping = [];
      search.grouped = [];
      search.page = 1;
    }

    return this._doSearch(search!);
  }

  /**
   * Récupère les données de pagination + 1
   * @returns 
   */
  public loadMore(): Optional<Observable<LignesResponse>> {
    this._logger.debug('==> Tentative de chargement de la page suivante');

    // Vérifications préalables
    const currentParams = {
      ...this.searchParams()
    } as SearchParameters;
    const currentPagination = {
      ...this.pagination()
    } as PaginationMeta;
    const isSearchInProgress = this.searchInProgress();

    if (!currentParams) {
      this._logger.debug('==> Aucun paramètre de recherche disponible');
      return
    }

    if (isSearchInProgress) {
      this._logger.debug('==> Recherche déjà en cours, abandon');
      return
    }

    if (!currentPagination?.has_next) {
      this._logger.debug('==> Aucune page suivante disponible', { pagination: currentPagination });
      return
    }

    // Calcul de la page suivante
    const currentPage = currentPagination.current_page ?? 0;
    const nextPage = currentPage + 1;

    currentParams.page = nextPage;
    return this._doSearch(currentParams, true); //mode lazyloading
  }

  /**
   * Lance une recherche avec des  un sous niveau de grouping
   * @param grouped 
   * @returns 
   */
  public searchOnNextLevel(grouped: (string | undefined)[]): Observable<LignesResponse> {
    this._logger.debug('==> Début de la méthode zoomOnGrouping', { grouped });
    this._colonnesService.selectedColonnesGrouped.set(grouped.filter(g => g !== undefined));

    return this._doSearch(this.searchParams()!, true);
  }

  /**
  * Sélectionne une ligne financière pour affichage détaillé.
  * Met à jour le signal selectedLine avec la ligne fournie.
  *
  * @param line - La ligne financière à sélectionner
  */
  public selectLine(line: BudgetFinancialDataModel): void {
    this._logger.debug("==> Sélection d'une ligne financière", {
      lineId: line.id,
      programme: line.programme?.label,
      montant: line.montant_ae
    });

    this.selectedLine.set(line);

    this._logger.debug('==> Ligne sélectionnée mise à jour dans le service');
  }

  /**
   * Transforme une ligne "aplatie" (issue de l'API) en objet métier structuré.
   * @param object Ligne à transformer
   * @returns BudgetFinancialDataModel
   */
  public unflatten(object: EnrichedFlattenFinancialLines2): BudgetFinancialDataModel {
    return this._mapper.map(object);
  }

  // --- Méthodes privées ---

  /**
   * Lance une recherche financière avec les paramètres fournis.
   * Cette méthode n'est jamais être appelé par les composants. Il faut passer par les autres type de recherche
   * 
   *
   * Met à jour les colonnes et le grouping avant d'appeler l'API.
   * Met à jour le signal searchParams avec les paramètres fournis.
   * Traite automatiquement la réponse et met à jour les signaux du service.
   * @param searchParamsCopy Paramètres de recherche à utiliser (obligatoire)
   * @returns Observable du résultat de l'API (pour compatibilité)
   */
  private _doSearch(searchParams: SearchParameters, lazyLoading = false): Observable<LignesResponse> {
    const searchParamsCopy = { ...searchParams }
    this._logger.debug('==> Début de la méthode search', { searchParams: searchParamsCopy });

    // Préparation des colonnes à retourner
    const colonnesTable = this._colonnesService.selectedColonnesTable();
    const colonnesGrouping = this._colonnesService.selectedColonnesGrouping();

    this._logger.debug('    ==> Colonnes récupérées', {
      colonnesTableLength: colonnesTable.length,
      colonnesGroupingLength: colonnesGrouping.length
    });
    if (colonnesTable.length) {
      this._logger.debug('    ==> Préparation des colonnes de table');
      const fieldsBack = colonnesTable.map((c) => c.back.map((b) => b.code)).flat();
      searchParamsCopy.colonnes = fieldsBack.filter((v): v is string => v != null);
      this._logger.debug('    ==> Colonnes préparées', { colonnes: searchParamsCopy.colonnes });
    }

    // Préparation du grouping
    if (colonnesGrouping.length) {
      this._logger.debug('    ==> Préparation du grouping');
      const grouped: string[] = this._colonnesService.selectedColonnesGrouped();
      const fieldsGrouping = colonnesGrouping
        .map((c) => c.grouping?.code)
        .filter((v): v is string => v != null);
      searchParamsCopy.grouping = fieldsGrouping.slice(
        0,
        Math.min(fieldsGrouping.length, grouped ? grouped.length + 1 : 1)
      );
      searchParamsCopy.grouped =
        this._colonnesService.selectedColonnesGrouped()?.map((v) => v ?? 'None') ?? undefined;
      // Debug logs
    } else {
      this._logger.debug('    ==> Pas de grouping configuré');
      searchParamsCopy.grouping = []
      searchParamsCopy.grouped = []
    }
    this._logger.debug('    ==> Grouping && Grouped', {
      grouping: searchParamsCopy.grouping,
      grouped: searchParamsCopy.grouped
    });

    //
    this._logger.debug('    ==> Appel de _search avec paramètres finaux', { searchParams: searchParamsCopy });

    this.searchParams.set(searchParamsCopy);
    // Mise à jour du signal avec les paramètres fournis
    this._logger.debug('    ==> Signal searchParams mis à jour', { searchParams: searchParamsCopy });

    if (!lazyLoading) this.searchInProgress.set(true);

    return this._search(searchParamsCopy).pipe(
      tap({
        next: (response: LignesResponse) => {
          this._processSearchResponse(response);
        },
        error: (err: unknown) => {
          this._logger.error('Erreur lors de la recherche', err);
          this.searchInProgress.set(false);
          this.searchGroupingInProgress.set(false);
        }
      })
    );
  }


  /**
   * Nettoyage du service pour ré-init
   */
  private _cleanSearchResults() {
    this._logger.debug('==> Début de la méthode cleanResults');
    this.total.set(undefined);
    this.selectedLine.set(undefined);
    this.searchFinish.set(false);
    this.searchInProgress.set(false);
    this.searchGroupingInProgress.set(false);
    this.searchResults.set([]);
    this.pagination.set(null);
  }


  /**
   * Appelle le client API pour récupérer les lignes financières selon les paramètres.
   * @param searchParams Paramètres de recherche à utiliser
   * @returns Observable du résultat brut de l'API
   */
  private _search(searchParams: SearchParameters): Observable<LignesResponse> {
    this._logger.debug('==> Début de _search', { searchParams });

    if (this._searchParamsService.isEmpty(searchParams)) {
      this._logger.debug("==> Paramètres vides, retour d'Observable vide");
      return of();
    }

    this._logger.debug('==> Paramètres validés, démarrage de la recherche');
    const req$ = this._lignesFinanciereService.getLignesFinancieresLignesGet(
      ...this._searchParamsService.getSanitizedParams(searchParams),
      'body'
    );
    return req$;
  }

  /**
   * Traite la réponse de recherche et met à jour les signaux appropriés.
   * @param response Réponse de l'API de recherche
   */
  private _processSearchResponse(response: LignesResponse): void {
    this._logger.debug('==> Traitement de la réponse de recherche', response);

    if (!response || (response.code == 204 && !response.data)) {
      this._logger.debug('==> Réponse vide, reset des résultats');
      this.searchResults.set([]);
      this.searchFinish.set(true);
      this.searchInProgress.set(false);
      return;
    }

    if (response.data?.type === 'groupings') {
      this._logger.debug('==> Traitement des données groupées');
      const newData = response.data?.groupings as GroupedData[];
      // Si page = 1, on reset, sinon on concat
      const newSearch =
        response.pagination?.current_page == 1
          ? newData
          : (this.searchResults() as GroupedData[]).concat(newData);

      this.searchResults.set(newSearch);
    } else if (response.data?.type === 'lignes_financieres') {
      this._logger.debug('==> Traitement des lignes financières');
      const newData = response.data?.lignes.map((r) => this.unflatten(r)) ?? [];
      // Si page = 1, on reset, sinon on concat
      const newSearch =
        response.pagination?.current_page == 1
          ? newData
          : (this.searchResults() as BudgetFinancialDataModel[]).concat(newData);
      this.searchResults.set(newSearch);
    }

    // Mise à jour des autres signaux
    this.total.set(response.data?.total);
    this.pagination.set(response.pagination);
    this.searchFinish.set(true);
    this.searchInProgress.set(false);

    this._logger.debug('==> Signaux mis à jour suite à la recherche');
  }

}
