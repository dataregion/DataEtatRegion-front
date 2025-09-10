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
import { PreferenceService } from '@services/preference.service';


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

  /**
   * Paramètres courants de la recherche.
   */
  public readonly searchParams = signal<SearchParameters | undefined>(undefined);

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
   * Lance une recherche financière avec les paramètres courants ou fournis.
   * Met à jour les colonnes et le grouping avant d'appeler l'API.
   * @param searchParams Paramètres de recherche à utiliser (optionnel, sinon ceux du service)
   * @returns Observable du résultat de l'API
   */
  public search(searchParams: SearchParameters | undefined = undefined): Observable<LignesResponse> {
    if (searchParams === undefined) {
      searchParams = this.searchParams();
      if (searchParams === undefined) return of();
    }
    // Préparation des colonnes à retourner
    const colonnesTable = this._colonnesService.selectedColonnesTable;
    const colonnesGrouping = this._colonnesService.selectedColonnesGrouping;
    if (colonnesTable.length) {
      const fieldsBack = colonnesTable.map(c => c.back.map(b => b.code)).flat();
      searchParams.colonnes = fieldsBack.filter((v): v is string => v != null);
    }
    // Préparation du grouping
    if (colonnesGrouping.length) {
      const grouped: string[] = this._colonnesService.selectedColonnesGrouped;
      const fieldsGrouping = colonnesGrouping.map(c => c.grouping?.code).filter((v): v is string => v != null);
      searchParams.grouping = fieldsGrouping.slice(0, Math.min(fieldsGrouping.length, grouped ? grouped.length + 1 : 1));
      searchParams.grouped = this._colonnesService.selectedColonnesGrouped?.map(v => v ?? "None") ?? undefined;
      // Debug console
      console.log("==> Grouping && Grouped");
      console.log(searchParams.grouping);
      console.log(searchParams.grouped);
    }
    return this._search(searchParams);
  }

  // --- Méthodes privées ---

  /**
   * Appelle le client API pour récupérer les lignes financières selon les paramètres.
   * @param searchParams Paramètres de recherche à utiliser
   * @returns Observable du résultat brut de l'API
   */
  private _search(searchParams: SearchParameters): Observable<LignesResponse> {
    if (searchParams === undefined || this._searchParamsService.isEmpty(searchParams))
      return of();
    this.searchInProgress.set(true);
    const req$ = this._lignesFinanciereService.getLignesFinancieresLignesGet(
      ...this._searchParamsService.getSanitizedParams(searchParams),
      'body'
    );
    return req$;
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
