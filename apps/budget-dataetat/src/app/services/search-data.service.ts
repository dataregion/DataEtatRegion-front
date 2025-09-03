import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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

  private _mapper: SearchDataMapper = inject(SearchDataMapper);
  private _colonnesService: ColonnesService = inject(ColonnesService);
  private _searchParamsService: SearchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  private _preferenceService: PreferenceService = inject(PreferenceService);

  /**
   * Paramètres de la recherche
   */
  private searchParamsSubject = new BehaviorSubject<SearchParameters | undefined>(undefined);
  searchParams$ = this.searchParamsSubject.asObservable();
  get searchParams(): SearchParameters | undefined {
    return this.searchParamsSubject.value;
  }
  set searchParams(searchParams: SearchParameters | undefined) {
    this.searchParamsSubject.next(searchParams);
  }

  /**
   * Total
   */
  private totalSubject = new BehaviorSubject<Total | undefined>(undefined);
  total$ = this.totalSubject.asObservable();
  get total(): Total | undefined {
    return this.totalSubject.value;
  }
  set total(total: Total | undefined) {
    this.totalSubject.next(total);
  }

  /**
   * Ligne consultée
   */
  private selectedLineSubject = new BehaviorSubject<FinancialDataModel | undefined>(undefined);
  selectedLine$ = this.selectedLineSubject.asObservable();
  get selectedLine(): FinancialDataModel | undefined {
    return this.selectedLineSubject.value;
  }
  set selectedLine(line: FinancialDataModel | undefined) {
    this.selectedLineSubject.next(line);
  }

  /**
   * Recherche finie ?
   */
  private searchFinishSubject = new BehaviorSubject<boolean>(false);
  searchFinish$ = this.searchFinishSubject.asObservable();
  get searchFinish(): boolean {
    return this.searchFinishSubject.value;
  }
  set searchFinish(searchFinish: boolean) {
    this.searchFinishSubject.next(searchFinish);
  }
  
  /**
   * Recherche en cours ?
   */
  private searchInProgressSubject = new BehaviorSubject<boolean>(false);
  searchInProgress$ = this.searchInProgressSubject.asObservable();
  get searchInProgress(): boolean {
    return this.searchInProgressSubject.value;
  }
  set searchInProgress(searchInProgress: boolean) {
    this.searchInProgressSubject.next(searchInProgress);
  }
  
  /**
   * Résultats de la recherche
   */
  private searchResultsSubject = new BehaviorSubject<SearchResults>([]);
  searchResults$ = this.searchResultsSubject.asObservable();
  get searchResults(): SearchResults {
    return this.searchResultsSubject.value;
  }
  set searchResults(results: SearchResults) {
    this.searchResultsSubject.next(results);
  }
  
  /**
   * Résultats de la recherche
   */
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);
  pagination$ = this.paginationSubject.asObservable();
  get pagination(): PaginationMeta | null {
    return this.paginationSubject.value;
  }
  set pagination(data: PaginationMeta | null) {
    this.paginationSubject.next(data);
  }

  /**
   * Avant de lancer la recherche on set colonnes, grouping et grouped
   * @param searchParams 
   * @param grouped 
   * @returns 
   */
  public search(searchParams: SearchParameters | undefined = undefined): Observable<LignesResponse> {
    // Si la recherche est lancée sans paramètres fournis, on prend les sauvegardés
    if (searchParams === undefined) {
      searchParams = this.searchParams
      if (searchParams === undefined)
        return of()
    }
    // Récupération des colonnes et grouping
    const colonnesTable = this._colonnesService.selectedColonnesTable;
    const colonnesGrouping = this._colonnesService.selectedColonnesGrouping;
    // Set des colonnes
    if (colonnesTable.length) {
      const fieldsBack = colonnesTable.map(c => c.back.map(b => b.code)).flat()
      searchParams.colonnes = fieldsBack.filter((v): v is string => v != null);
    }
    // Set du grouping et grouped
    if (colonnesGrouping.length) {
      const grouped: string[] = this._colonnesService.selectedColonnesGrouped;
      const fieldsGrouping = colonnesGrouping.map(c => c.grouping?.code).filter((v): v is string => v != null);
      searchParams.grouping = fieldsGrouping.slice(0, Math.min(fieldsGrouping.length, grouped ? grouped.length + 1 : 1))
      searchParams.grouped = this._colonnesService.selectedColonnesGrouped?.map(v => v ?? "None") ?? undefined
      console.log("==> Grouping && Grouped")
      console.log(searchParams.grouping)
      console.log(searchParams.grouped)
    }
    return this._search(searchParams)
  }

  /**
   * Requête via le client généré
   * @param searchParams 
   * @returns 
   */
  private _search(searchParams: SearchParameters): Observable<LignesResponse> {
    if (searchParams === undefined || this._searchParamsService.isEmpty(searchParams))
      return of();
    this.searchInProgress = true;
    const req$ = this._lignesFinanciereService.getLignesFinancieresLignesGet(
        ...this._searchParamsService.getSanitizedParams(searchParams, ),
        'body'
    )
    return req$;
  }

  /**
   * Map les résultats à plat en objets structurés
   * @param object
   * @returns 
   */
  unflatten(object: EnrichedFlattenFinancialLines2): FinancialDataModel {
      return this._mapper.map(object)
  }

}
