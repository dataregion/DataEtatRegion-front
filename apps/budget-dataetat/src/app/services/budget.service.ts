/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EnrichedFlattenFinancialLinesSchema, BudgetService as GeneratedBudgetApiService } from 'apps/clients/budget';
import { map, Observable, of } from 'rxjs';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { Tag } from '../models/refs/tag.model';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchParameters } from '@services/interface-data.service';
import { DataIncrementalPagination, from_page_of_budget_lines } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { BudgetMapper } from './budget-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetDataHttpService {
  private http = inject(HttpClient);
  readonly settings: SettingsBudgetService = inject(SettingsBudgetService);

  private _apiRef!: string;
  private _apiAdministration!: string;
  private _financialApiUrl!: string;
  private _laureatsApiUrl!: string;
  private _budgetApi: GeneratedBudgetApiService = inject(GeneratedBudgetApiService);
  private _searchUtils: SearchUtilsService = inject(SearchUtilsService);
  private _mapper: BudgetMapper = inject(BudgetMapper);

  constructor() {
    const settings = this.settings;

    this._apiAdministration = this.settings.apiAdministration;
    this._apiRef = this.settings.apiReferentiel;
    this._financialApiUrl = settings.apiFinancialData;
    this._laureatsApiUrl = settings.apiLaureatsData;
  }
  
  mapToGeneric(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
      const mapped: FinancialDataModel = this._map(object);
      return mapped;
  }

  _map(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
      const mapped = this._mapper.map(object)
      return mapped
  }

/**
   *
   * @param SearchParameters
   * @returns
   */
  public search(searchParams: SearchParameters): Observable<DataIncrementalPagination<EnrichedFlattenFinancialLinesSchema> | null> {
    if (
      searchParams.n_ej == null &&
      searchParams.source == null &&
      searchParams.bops == null &&
      searchParams.themes == null &&
      searchParams.niveau == null &&
      searchParams.locations == null &&
      searchParams.years == null &&
      searchParams.beneficiaires == null &&
      searchParams.types_beneficiaires == null &&
      searchParams.tags == null &&
      searchParams.domaines_fonctionnels == null &&
      searchParams.referentiels_programmation == null &&
      searchParams.source_region == null
    )
      return of();

    const numeros_ej = searchParams.n_ej ?? undefined;
    const data_source = searchParams.source ?? undefined;
    const codes_programme = searchParams.bops?.filter((bop) => bop.code).map((bop) => bop.code);
    const niveau_geo = this._searchUtils.normalize_type_geo(searchParams.niveau);
    const listCode = searchParams.locations?.map((l) => l.code) ?? undefined;
    const p_themes = searchParams.themes?.join('|') ?? undefined;
    const siret_beneficiaire: string[] | undefined = searchParams.beneficiaires?.map((x) => x.siret) ?? [];
    const p_types_beneficaires = searchParams.types_beneficiaires ?? undefined;
    const annees = searchParams.years ?? undefined;
    const p_domaines_fonctionnels: string[] | undefined = searchParams.domaines_fonctionnels ?? [];
    const p_refprod: string[] | undefined = searchParams.referentiels_programmation?.map((rp) => rp.code) ?? [];
    const p_tags: string[] | undefined = searchParams.tags ?? [];

        const query_params = [
            this._sanitizeReqArg(numeros_ej),
            this._sanitizeReqArg(data_source),
            this._sanitizeReqArg(codes_programme),
            this._sanitizeReqArg(niveau_geo),
            this._sanitizeReqArg(listCode),
            undefined, // Année découpage QPV
            undefined, // Codes QPV
            this._sanitizeReqArg(p_themes),
            this._sanitizeReqArg(siret_beneficiaire),
            this._sanitizeReqArg(p_types_beneficaires),
            this._sanitizeReqArg(annees),
            undefined, // Centres de couts
            this._sanitizeReqArg(p_domaines_fonctionnels),
            this._sanitizeReqArg(p_refprod),
            this._sanitizeReqArg(p_tags)
        ] as const;

        const req$ = this._budgetApi.getBudgetCtrl(
            "0",
            "6500", // XXX : Magic number, valeur défaut côté back
            ...query_params 
        ).pipe(map(page => from_page_of_budget_lines(page)))

    return req$;
  }
  
  _sanitizeReqArg<T>(arg: Optional<T>): T | undefined {
    if (!arg) return undefined;

    if (Array.isArray(arg) && arg.length == 0) return undefined;

    return arg;
  }
  

  public loadFinancialBudget(fileAe: File, fileCp: File, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichierAe', fileAe);
    formData.append('fichierCp', fileCp);
    formData.append('annee', annee);
    return this.http.post(`${this._financialApiUrl}/region`, formData);
  }

  public loadFinancialFrance2030(file: File, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('annee', annee);
    return this.http.post(`${this._laureatsApiUrl}/france-2030`, formData);
  }

  public loadReferentielFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._apiAdministration}/referentiels`, formData);
  }

  public loadMajTagsFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._financialApiUrl}/tags/maj_ae_tags_from_export`, formData);
  }

  public getAnnees(): Observable<number[]> {
    return this._budgetApi.getGetPlageAnnees();
  }

  public allTags$(): Observable<Tag[]> {
    const url = `${this._apiRef}/tags`;

    return this.http.get<Tag[]>(url).pipe(
      map((response) => {
        if (response == null) return [];
        return response;
      })
    );
  }
}
