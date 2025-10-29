/**
 * Service centralisé pour la gestion de la recherche et des résultats financiers.
 * Expose l'état via des BehaviorSubject/Observable et propose des méthodes utilitaires pour la transformation des données.
 */
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { SearchParameters } from './search-params.service';
import { FinancialDataModel } from '../models/financial/financial-data.models';
import { SearchDataMapper } from './search-data-mapper.service';
import { SearchParamsService } from './search-params.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { DashboardData, DashboardResponse, DashboardsService, EnrichedFlattenFinancialLinesDataQPV, LignesFinancieresService, LignesResponse, MapResponse, MapService, PaginationMeta, QpvData } from 'apps/clients/v3/data-qpv';
import { BopModel } from '../models/refs/bop.models';


export type SearchResults = FinancialDataModel[]

interface TabData {
  codeProgramme: string | undefined;
  notCodeProgramme: string | undefined;
  dashboardData: DashboardData | null;
  lignesData: FinancialDataModel[] | null;
  pagination: PaginationMeta | null;
  mapData: QpvData[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class SearchDataService {

  // --- Services dépendants ---
  private _mapper: SearchDataMapper = inject(SearchDataMapper);
  private _searchParamsService: SearchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  private _dashboardsService: DashboardsService = inject(DashboardsService);
  private _mapService: MapService = inject(MapService);
  private _logger = inject(LoggerService).getLogger(SearchDataService.name);

  /**
   * Paramètres courants de la recherche.
   */
  public readonly searchParams = signal<SearchParameters | undefined>(undefined, {
    equal: (a, b) => SearchParameters.isEqual(a!, b!)
  });

  /**
   * Indique si une recherche a déjà été effectuée.
   */
  public readonly firstSearchDone = signal<boolean>(false);

  /**
   * Indique si la recherche est terminée.
   */
  public readonly searchFinish = signal<boolean>(false);

  /**
   * Indique si une recherche est en cours.
   */
  public readonly searchInProgress = signal<boolean>(false);

  /**
   * Résultats de la recherche (tableau de lignes).
   */
  public searchResults = signal<Record<number, TabData>>({
    0: {
      "codeProgramme": "147",
      "notCodeProgramme": undefined,
      "dashboardData": null,
      "lignesData": null,
      "pagination": null,
      "mapData": null,
    } as TabData,
    1: {
      "codeProgramme": undefined,
      "notCodeProgramme": "147",
      "dashboardData": null,
      "lignesData": null,
      "pagination": null,
      "mapData": null,
    } as TabData,
    2: {
      "codeProgramme": undefined,
      "notCodeProgramme": undefined,
      "dashboardData": null,
      "lignesData": null,
      "pagination": null,
      "mapData": null,
    } as TabData
  });
  
  /**
   * Indique si l'onglet actif
   */
  public readonly selectedTab = signal<number>(0);

  get currentResults(): TabData {
    return this.searchResults()[this.selectedTab()]
  }


  /**
   * Récupéère les données de pagination + 1
   * @returns 
   */
  public loadMore() {
    this._logger.debug('==> Tentative de chargement de la page suivante');

    // Vérifications préalables
    const currentParams = this.searchParams();
    const currentPagination = this.currentResults.pagination;
    const isSearchInProgress = this.searchInProgress();

    if (!currentParams) {
      this._logger.debug('==> Aucun paramètre de recherche disponible');
      return;
    }

    if (isSearchInProgress) {
      this._logger.debug('==> Recherche déjà en cours, abandon');
      return;
    }

    if (!currentPagination?.has_next) {
      this._logger.debug('==> Aucune page suivante disponible', { pagination: currentPagination });
      return;
    }

    // Calcul de la page suivante
    const currentPage = currentPagination.current_page ?? 0;
    const nextPage = currentPage + 1;

    currentParams.page = nextPage;

    return this.search(currentParams);
  }

  /**
   * Lance une recherche financière avec les paramètres fournis.
   * Met à jour les colonnes et le grouping avant d'appeler l'API.
   * Met à jour le signal searchParams avec les paramètres fournis.
   * Traite automatiquement la réponse et met à jour les signaux du service.
   * @param searchParams Paramètres de recherche à utiliser (obligatoire)
   * @returns Observable du résultat de l'API (pour compatibilité)
   */
  public search(searchParams: SearchParameters): Observable<{ dashboard: DashboardResponse; lignes: LignesResponse; map: MapResponse; }> {
    this._logger.debug('==> Début de la méthode search', { searchParams });

    this._logger.debug('    ==> Appel de _search avec paramètres finaux', { searchParams });

    this.searchParams.set(searchParams);
    // Mise à jour du signal avec les paramètres fournis
    this._logger.debug('    ==> Signal searchParams mis à jour', { searchParams });
    return this._search(searchParams).pipe(
      tap({
        next: (response: { dashboard: DashboardResponse; lignes: LignesResponse; map: MapResponse; }) => {
          this._processSearchResponse(response);
        },
        error: (err: unknown) => {
          this._logger.error('Erreur lors de la recherche', err);
          this.searchInProgress.set(false);
        }
      })
    );
  }

  public changeTab(selected: number) {
    const searchParams = this.searchParams()
    this.searchInProgress.set(true);
    this.selectedTab.set(selected);
    if (searchParams
      && this.searchResults()[selected].dashboardData === null
      && this.searchResults()[selected].lignesData === null
      && this.searchResults()[selected].mapData === null) {
      // Paramètres cachés des onglets
      searchParams.bops = undefined
      searchParams.notBops = undefined
      if (this.searchResults()[selected].codeProgramme)
        searchParams.bops = [{"code": this.searchResults()[selected].codeProgramme} as BopModel]
      if (this.searchResults()[selected].notCodeProgramme)
        searchParams.notBops = [{"code": this.searchResults()[selected].notCodeProgramme} as BopModel]
      // Recherche en cours
      this.search(searchParams).subscribe()
    } else {
      this.searchInProgress.set(false);
    }
  }

  // --- Méthodes privées ---

  /**
   * Appelle le client API pour récupérer les lignes financières selon les paramètres.
   * @param searchParams Paramètres de recherche à utiliser
   * @returns Observable du résultat brut de l'API
   */
  private _search(searchParams: SearchParameters): Observable<{ dashboard: DashboardResponse; lignes: LignesResponse; map: MapResponse; }> {
    this._logger.debug('==> Début de _search', { searchParams });

    if (this._searchParamsService.isEmpty(searchParams)) {
      this._logger.debug("==> Paramètres vides, retour d'Observable vide");
      return of();
    }

    this._logger.debug('==> Paramètres validés, démarrage de la recherche');

    const sanitized = this._searchParamsService.getSanitizedParams(searchParams);

    const dashboard$ = this._dashboardsService.getDashboardDashboardsGet(...sanitized, 'body');
    const lignes$ = this._lignesFinanciereService.getLignesFinancieresLignesGet(...sanitized, 'body');
    const map$ = this._mapService.getMapMapGet(...sanitized, 'body');
    
    return forkJoin({
      dashboard: dashboard$,
      lignes: lignes$,
      map: map$,
    })
  }

  /**
   * Traite la réponse de recherche et met à jour les signaux appropriés.
   * @param response Réponse de l'API de recherche
   */
  private _processSearchResponse(response: { dashboard: DashboardResponse; lignes: LignesResponse; map: MapResponse; }): void {
    this._logger.debug('==> Traitement de la réponse de recherche', response);

    if (!response || (response.lignes.code == 204 && !response.lignes.data)) {
      this._logger.debug('==> Réponse vide, reset des résultats');
      this.searchFinish.set(true);
      this.searchInProgress.set(false);
      return;
    }

    this._logger.debug('==> Traitement des résultats en tant que lignes financières');
    const newData = response.lignes.data?.lignes.map((r) => this.unflatten(r)) ?? [];
    // Si page = 1, on reset, sinon on concat
    if (response.lignes.pagination?.current_page != 1) {
      this.currentResults.lignesData = (this.currentResults.lignesData as FinancialDataModel[]).concat(newData)
    } else {
      this.currentResults.lignesData = newData
    }
    this.currentResults.dashboardData = response.dashboard.data ?? null
    this.currentResults.pagination = response.lignes.pagination
    this.currentResults.mapData = response.map.data?.data ?? null

    // Mise à jour des autres signaux
    this.searchInProgress.set(false);

    this._logger.debug('==> Signaux mis à jour suite à la recherche');
  }

  /**
   * Transforme une ligne "aplatie" (issue de l'API) en objet métier structuré.
   * @param object Ligne à transformer
   * @returns FinancialDataModel
   */
  public unflatten(object: EnrichedFlattenFinancialLinesDataQPV): FinancialDataModel {
    return this._mapper.map(object);
  }

  /**
   * Résume les paramètres de la recherche en résumé textuel.
   * @returns string
   */
  public searchParametersToText(): string {
    let text = ""
    if (this.searchParams() === undefined)
      return "";
    if (this.searchParams()?.niveau !== undefined && this.searchParams()?.locations && this.searchParams()?.locations?.length !== 0)
      text += this.searchParams()?.niveau + " : " + this.searchParams()?.locations?.map(l => l.code + " - " + l.nom).join(",")
    if (this.searchParams()?.code_qpv !== undefined && this.searchParams()?.code_qpv?.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "QPV : " + this.searchParams()?.code_qpv?.map(q => q.code + " - " + q.label).join(",")
    if (this.searchParams()?.years !== undefined && this.searchParams()?.years?.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "Années : " + this.searchParams()?.years?.join(",")
    return text
  }

  public resetResults() {
    this.searchResults()[0].dashboardData = null
    this.searchResults()[0].lignesData = null
    this.searchResults()[0].pagination = null
    this.searchResults()[0].mapData = null
    this.searchResults()[1].dashboardData = null
    this.searchResults()[1].lignesData = null
    this.searchResults()[1].pagination = null
    this.searchResults()[1].mapData = null
    this.searchResults()[2].dashboardData = null
    this.searchResults()[2].lignesData = null
    this.searchResults()[2].pagination = null
    this.searchResults()[2].mapData = null
  }

}
