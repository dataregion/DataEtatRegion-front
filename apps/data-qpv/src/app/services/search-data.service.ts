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
import { DashboardData, DashboardResponse, DashboardsService, EnrichedFlattenFinancialLinesDataQPV, LignesFinancieresService, LignesResponse, PaginationMeta } from 'apps/clients/v3/data-qpv';


export type SearchResults = FinancialDataModel[]

@Injectable({
  providedIn: 'root'
})
export class SearchDataService {

  // --- Services dépendants ---
  private _mapper: SearchDataMapper = inject(SearchDataMapper);
  private _searchParamsService: SearchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  private _dashboardsService: DashboardsService = inject(DashboardsService);
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
  public readonly noSearchDone = signal<boolean>(true);

  /**
   * Indique si la recherche est terminée.
   */
  public readonly searchFinish = signal<boolean>(false);

  /**
   * Indique si une recherche est en cours.
   */
  public readonly searchFormInProgress = signal<boolean>(false);
  public readonly searchTabInProgress = signal<boolean>(false);

  /**
   * Résultats de la recherche (données du dashboard).
   */
  public readonly dashboardResults = signal<DashboardData | null>(null);

  /**
   * Résultats de la recherche (tableau de lignes).
   */
  public readonly searchResults = signal<FinancialDataModel[]>([]);

  /**
   * Métadonnées de pagination des résultats.
   */
  public readonly pagination = signal<PaginationMeta | null>(null);


  /**
   * Récupéère les données de pagination + 1
   * @returns 
   */
  public loadMore() {
    this._logger.debug('==> Tentative de chargement de la page suivante');

    // Vérifications préalables
    const currentParams = this.searchParams();
    const currentPagination = this.pagination();
    const isSearchInProgress = this.searchFormInProgress();

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
  public search(searchParams: SearchParameters): Observable<{ lignes: LignesResponse; dashboard: DashboardResponse }> {
    this._logger.debug('==> Début de la méthode search', { searchParams });

    this._logger.debug('    ==> Appel de _search avec paramètres finaux', { searchParams });

    this.searchParams.set(searchParams);
    // Mise à jour du signal avec les paramètres fournis
    this._logger.debug('    ==> Signal searchParams mis à jour', { searchParams });
    return this._search(searchParams).pipe(
      tap({
        next: (response: { lignes: LignesResponse; dashboard: DashboardResponse; }) => {
          console.log(response)
          this._processSearchResponse(response);
        },
        error: (err: unknown) => {
          this._logger.error('Erreur lors de la recherche', err);
          this.searchFormInProgress.set(false);
        }
      })
    );
  }

  // --- Méthodes privées ---

  /**
   * Appelle le client API pour récupérer les lignes financières selon les paramètres.
   * @param searchParams Paramètres de recherche à utiliser
   * @returns Observable du résultat brut de l'API
   */
  private _search(searchParams: SearchParameters): Observable<{ lignes: LignesResponse; dashboard: DashboardResponse }> {
    this._logger.debug('==> Début de _search', { searchParams });

    if (this._searchParamsService.isEmpty(searchParams)) {
      this._logger.debug("==> Paramètres vides, retour d'Observable vide");
      return of();
    }

    this._logger.debug('==> Paramètres validés, démarrage de la recherche');

    const sanitized = this._searchParamsService.getSanitizedParams(searchParams);

    const lignes$ = this._lignesFinanciereService.getLignesFinancieresLignesGet(...sanitized, 'body');
    const dashboard$ = this._dashboardsService.getDashboardDashboardsGet(...sanitized, 'body');
    
    return forkJoin({
      lignes: lignes$,
      dashboard: dashboard$,
    })
  }

  /**
   * Traite la réponse de recherche et met à jour les signaux appropriés.
   * @param response Réponse de l'API de recherche
   */
  private _processSearchResponse(response: { lignes: LignesResponse; dashboard: DashboardResponse; }): void {
    this._logger.debug('==> Traitement de la réponse de recherche', response);

    if (!response || (response.lignes.code == 204 && !response.lignes.data)) {
      this._logger.debug('==> Réponse vide, reset des résultats');
      this.searchResults.set([]);
      this.searchFinish.set(true);
      this.searchFormInProgress.set(false);
      this.noSearchDone.set(false);
      return;
    }

    this._logger.debug('==> Traitement des résultats en tant que lignes financières');
    const newData = response.lignes.data?.lignes.map((r) => this.unflatten(r)) ?? [];
    // Si page = 1, on reset, sinon on concat
    const newSearch =
      response.lignes.pagination?.current_page == 1
        ? newData
        : (this.searchResults() as FinancialDataModel[]).concat(newData);
    this.searchResults.set(newSearch);

    this.dashboardResults.set(response.dashboard.data ?? null)
    console.log("response")
    console.log(response)

    // Mise à jour des autres signaux
    this.pagination.set(response.lignes.pagination);
    this.searchFinish.set(true);
    this.searchFormInProgress.set(false);
    this.noSearchDone.set(false);

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
    if (this.searchParams() === null)
      return "";
    if (this.searchParams()?.niveau !== null && this.searchParams()?.locations && this.searchParams()?.locations?.length !== 0)
      text += this.searchParams()?.niveau + " : " + this.searchParams()?.locations?.map(l => l.code + " - " + l.nom).join(",")
    if (this.searchParams()?.code_qpv !== null && this.searchParams()?.code_qpv?.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "QPV : " + this.searchParams()?.code_qpv?.map(q => q.code + " - " + q.nom).join(",")
    if (this.searchParams()?.years !== null && this.searchParams()?.years?.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "Années : " + this.searchParams()?.years?.join(",")
    return text
  }

}
