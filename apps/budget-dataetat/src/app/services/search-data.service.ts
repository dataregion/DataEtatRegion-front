/**
 * Service centralisé pour la gestion de la recherche et des résultats financiers.
 * Expose l'état via des BehaviorSubject/Observable et propose des méthodes utilitaires pour la transformation des données.
 */
import { inject, Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SearchParameters } from '@services/search-params.service';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { SearchDataMapper } from './search-data-mapper.service';
import { EnrichedFlattenFinancialLines2, GroupedData, LignesFinancieresService, LignesResponse, PaginationMeta, Total } from 'apps/clients/v3/financial-data';
import { ColonnesService } from '@services/colonnes.service';
import { SearchParamsService } from './search-params.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';


export type SearchResults = GroupedData[] | FinancialDataModel[]

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
  public readonly selectedLine = signal<FinancialDataModel | undefined>(undefined);

  /**
   * Indique si la recherche est terminée.
   */
  public readonly searchFinish = signal<boolean>(false);

  /**
   * Indique si une recherche est en cours.
   */
  public readonly searchInProgress = signal<boolean>(false);

  /**
   * Résultats de la recherche (tableau de lignes ou de groupes).
   */
  public readonly searchResults = signal<SearchResults>([]);

  /**
   * Métadonnées de pagination des résultats.
   */
  public readonly pagination = signal<PaginationMeta | null>(null);
  
  /**
   * Lance une recherche financière avec les paramètres fournis.
   * Met à jour les colonnes et le grouping avant d'appeler l'API.
   * Met à jour le signal searchParams avec les paramètres fournis.
   * Traite automatiquement la réponse et met à jour les signaux du service.
   * @param searchParams Paramètres de recherche à utiliser (obligatoire)
   * @returns Observable du résultat de l'API (pour compatibilité)
   */
  public search(searchParams: SearchParameters): Observable<LignesResponse> {
    this._logger.debug('==> Début de la méthode search', { searchParams });

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
      searchParams.colonnes = fieldsBack.filter((v): v is string => v != null);
      this._logger.debug('    ==> Colonnes préparées', { colonnes: searchParams.colonnes });
    }

    // Préparation du grouping
    if (colonnesGrouping.length) {
      this._logger.debug('    ==> Préparation du grouping');
      const grouped: string[] = this._colonnesService.selectedColonnesGrouped();
      const fieldsGrouping = colonnesGrouping
        .map((c) => c.grouping?.code)
        .filter((v): v is string => v != null);
      searchParams.grouping = fieldsGrouping.slice(
        0,
        Math.min(fieldsGrouping.length, grouped ? grouped.length + 1 : 1)
      );
      searchParams.grouped =
        this._colonnesService.selectedColonnesGrouped()?.map((v) => v ?? 'None') ?? undefined;
      // Debug logs
      this._logger.debug('    ==> Grouping && Grouped', {
        grouping: searchParams.grouping,
        grouped: searchParams.grouped
      });
    } else {
      this._logger.debug('    ==> Pas de grouping configuré');
    }

    this._logger.debug('    ==> Appel de _search avec paramètres finaux', { searchParams });
    const searchRequest$ = this._search(searchParams);

    // Traitement automatique de la réponse dans le service
    searchRequest$.subscribe({
      next: (response: LignesResponse) => {
        this._processSearchResponse(response);
      },
      error: (err: unknown) => {
        this._logger.error('Erreur lors de la recherche', err);
        this.searchInProgress.set(false);
      }
    });
    this.searchParams.set(searchParams);
    // Mise à jour du signal avec les paramètres fournis
    this._logger.debug('    ==> Signal searchParams mis à jour', { searchParams });
    return searchRequest$;
  }

  // --- Méthodes privées ---

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
    this.searchInProgress.set(true);
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

    if (response.code == 204 && !response.data) {
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
          : (this.searchResults() as FinancialDataModel[]).concat(newData);
      this.searchResults.set(newSearch);
    }

    // Mise à jour des autres signaux
    this.total.set(response.data?.total);
    this.pagination.set(response.pagination);
    this.searchFinish.set(true);
    this.searchInProgress.set(false);

    this._logger.debug('==> Signaux mis à jour suite à la recherche');
  }

  /**
   * Charge la page suivante des résultats si elle existe.
   * Vérifie qu'il y a une page suivante disponible et qu'aucune recherche n'est en cours
   * avant de lancer la requête.
   *
   * @returns true si le chargement a été déclenché, false sinon
   */
  public loadNextPage(): boolean {
    this._logger.debug('==> Tentative de chargement de la page suivante');

    // Vérifications préalables
    const currentParams = this.searchParams();
    const currentPagination = this.pagination();
    const isSearchInProgress = this.searchInProgress();

    if (!currentParams) {
      this._logger.debug('==> Aucun paramètre de recherche disponible');
      return false;
    }

    if (isSearchInProgress) {
      this._logger.debug('==> Recherche déjà en cours, abandon');
      return false;
    }

    if (!currentPagination?.has_next) {
      this._logger.debug('==> Aucune page suivante disponible', { pagination: currentPagination });
      return false;
    }

    // Calcul de la page suivante
    const currentPage = currentPagination.current_page ?? 0;
    const nextPage = currentPage + 1;

    this._logger.debug('==> Chargement de la page', nextPage, {
      currentPage,
      hasNext: currentPagination.has_next
    });

    // Mise à jour des paramètres avec la nouvelle page
    const updatedParams: SearchParameters = {
      ...currentParams,
      page: nextPage
    };

    // Lancement de la recherche pour la page suivante
    this.search(updatedParams);

    return true;
  }

  /**
   * Sélectionne une ligne financière pour affichage détaillé.
   * Met à jour le signal selectedLine avec la ligne fournie.
   *
   * @param line - La ligne financière à sélectionner
   */
  public selectLine(line: FinancialDataModel): void {
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
   * @returns FinancialDataModel
   */
  public unflatten(object: EnrichedFlattenFinancialLines2): FinancialDataModel {
    return this._mapper.map(object);
  }
}
