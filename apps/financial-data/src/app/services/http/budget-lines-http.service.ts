import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable } from '@angular/core';
import { SourceFinancialData } from '@models/financial/common.models';
import { FinancialCp, FinancialDataModel } from '@models/financial/financial-data.models';
import { BudgetService as GeneratedBudgetApiService } from 'apps/clients/budget';
import { EnrichedFlattenFinancialLinesSchema } from 'apps/clients/budget/model/enrichedFlattenFinancialLinesSchema';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { DataIncrementalPagination, from_page_of_budget_lines } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SettingsService } from 'apps/financial-data/src/environments/settings.service';
import { map, Observable, of } from 'rxjs';
import { BudgetLineHttpMapper } from './budget-lines-http.mapper.service';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { DataHttpService, SearchParameters } from '@services/interface-data.service';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetDataHttpService
  implements DataHttpService<EnrichedFlattenFinancialLinesSchema, FinancialDataModel>
{
  private _apiAdministration!: string;
  private _financialApiUrl!: string;
  private _laureatsApiUrl!: string;
  private _budgetApi: GeneratedBudgetApiService = inject(GeneratedBudgetApiService);
  private _searchUtils: SearchUtilsService = inject(SearchUtilsService);
  private _mapper: BudgetLineHttpMapper;

  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) readonly settings: SettingsService // eslint-disable-line
  ) {
    this._apiAdministration = this.settings.apiAdministration;
    this._financialApiUrl = settings.apiFinancialData;
    this._laureatsApiUrl = settings.apiLaureatsData;
    this._mapper = new BudgetLineHttpMapper();
  }

  mapToGeneric(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
    const mapped: FinancialDataModel = this._map(object);
    return mapped;
  }

  _map(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
    const mapped = this._mapper.map(object);
    return mapped;
  }

  getSources(): string[] {
    return [
      SourceFinancialData.FINANCIAL_AE,
      SourceFinancialData.FINANCIAL_CP,
      SourceFinancialData.ADEME
    ];
  }

  public getById(
    source: SourceFinancialData,
    id: any,
    ..._: any[]
  ): Observable<EnrichedFlattenFinancialLinesSchema> {
    return this._budgetApi.getGetBudgetCtrl(source, `${id}`);
  }

  public getCp(id: number): Observable<FinancialCp[]> {
    // XXX: ici, on requête forcement un CP rattaché à une AE.
    return this.http.get<FinancialCp[]>(`${this._financialApiUrl}/ae/${id}/cp`);
  }

  /**
   *
   * @param SearchParameters
   * @returns
   */
  public search({
    n_ej,
    source,
    beneficiaires,
    types_beneficiaires,
    bops,
    themes,
    niveau,
    locations,
    years,
    domaines_fonctionnels,
    referentiels_programmation,
    source_region,
    tags
  }: SearchParameters): Observable<DataIncrementalPagination<EnrichedFlattenFinancialLinesSchema> | null> {
    if (
      n_ej == null &&
      source == null &&
      bops == null &&
      themes == null &&
      niveau == null &&
      locations == null &&
      years == null &&
      beneficiaires == null &&
      types_beneficiaires == null &&
      tags == null &&
      domaines_fonctionnels == null &&
      referentiels_programmation == null &&
      source_region == null
    )
      return of();

    const numeros_ej = n_ej ?? undefined;
    const data_source = source ?? undefined;
    const codes_programme = bops?.filter((bop) => bop.code).map((bop) => bop.code);
    const niveau_geo = this._searchUtils.normalize_type_geo(niveau);
    const listCode = locations?.map((l) => l.code) ?? undefined;
    const p_themes = themes?.join('|') ?? undefined;
    const siret_beneficiaire: string[] | undefined = beneficiaires?.map((x) => x.siret) ?? [];
    const p_types_beneficaires = types_beneficiaires ?? undefined;
    const annees = years ?? undefined;
    const p_domaines_fonctionnels: string[] | undefined = domaines_fonctionnels ?? [];
    const p_refprod: string[] | undefined = referentiels_programmation?.map((rp) => rp.code) ?? [];
    const p_tags: string[] | undefined = tags ?? [];

        const query_params = [
            this._sanitize_req_arg(numeros_ej),
            this._sanitize_req_arg(data_source),
            this._sanitize_req_arg(codes_programme),
            this._sanitize_req_arg(niveau_geo),
            this._sanitize_req_arg(listCode),
            undefined, // Année découpage QPV
            undefined, // Codes QPV
            this._sanitize_req_arg(p_themes),
            this._sanitize_req_arg(siret_beneficiaire),
            this._sanitize_req_arg(p_types_beneficaires),
            this._sanitize_req_arg(annees),
            undefined, // Centres de couts
            this._sanitize_req_arg(p_domaines_fonctionnels),
            this._sanitize_req_arg(p_refprod),
            this._sanitize_req_arg(p_tags)
        ] as const;

        const req$ = this._budgetApi.getBudgetCtrl(
            "0",
            "6500", // XXX : Magic number, valeur défaut côté back
            ...query_params 
        ).pipe(map(page => from_page_of_budget_lines(page)))

    return req$;
  }

  _sanitize_req_arg<T>(arg: Optional<T>): T | undefined {
    if (!arg) return undefined;

    if (Array.isArray(arg) && arg.length == 0) return undefined;

    return arg;
  }

  public loadFinancialBudget(fileAe: any, fileCp: any, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichierAe', fileAe);
    formData.append('fichierCp', fileCp);
    formData.append('annee', annee);
    return this.http.post(`${this._financialApiUrl}/region`, formData);
  }

  public loadFinancialFrance2030(file: any, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('annee', annee);
    return this.http.post(`${this._laureatsApiUrl}/france-2030`, formData);
  }

  public loadReferentielFile(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._apiAdministration}/referentiels`, formData);
  }

  public loadMajTagsFile(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._financialApiUrl}/tags/maj_ae_tags_from_export`, formData);
  }

  public getAnnees(): Observable<number[]> {
    return this._budgetApi.getGetPlageAnnees();
  }
}
