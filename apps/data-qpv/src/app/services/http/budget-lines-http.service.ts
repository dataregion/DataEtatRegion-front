import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, inject } from "@angular/core";
import { SourceFinancialData } from "apps/data-qpv/src/app/models/financial/common.models";
import { FinancialCp, FinancialDataModel } from "apps/data-qpv/src/app/models/financial/financial-data.models";
import { BudgetService as GeneratedBudgetApiService } from "apps/clients/budget";
import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget/model/enrichedFlattenFinancialLinesSchema";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { SettingsService } from "apps/data-qpv/src/environments/settings.service";
import { Observable, of } from "rxjs";
import { BudgetLineHttpMapper } from "./budget-lines-http.mapper.service";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { DataHttpService, SearchParameters } from "apps/data-qpv/src/app/services/interface-data.service";
import { SearchUtilsService } from "apps/common-lib/src/lib/services/search-utils.service";

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService implements DataHttpService<EnrichedFlattenFinancialLinesSchema, FinancialDataModel> {

    private _apiAdministration!: string;
    private _financialApiUrl!: string;
    private _laureatsApiUrl!: string;
    private _budgetApi: GeneratedBudgetApiService = inject(GeneratedBudgetApiService);
    private _searchUtils: SearchUtilsService = inject(SearchUtilsService)
    private _mapper: BudgetLineHttpMapper;

    constructor(
        private http: HttpClient,
        @Inject(SETTINGS) readonly settings: SettingsService, // eslint-disable-line
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
        const mapped = this._mapper.map(object)
        return mapped
    }

    getSources(): string[] {
        return [SourceFinancialData.FINANCIAL_AE, SourceFinancialData.FINANCIAL_CP, SourceFinancialData.ADEME];
    }

    public getById(source: SourceFinancialData, id: any, ..._: any[]): Observable<EnrichedFlattenFinancialLinesSchema> {
        return this._budgetApi.getGetBudgetCtrl(source, `${id}`)
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
    public search(
        { bops, years, niveau, locations, qpvs, centre_couts, themes, beneficiaires, types_beneficiaires }: SearchParameters
    ): Observable<DataPagination<EnrichedFlattenFinancialLinesSchema> | null> {
        if (
            bops == null &&
            years == null &&
            niveau == null &&
            locations == null &&
            qpvs == null &&
            centre_couts == null &&
            themes == null &&
            beneficiaires == null &&
            types_beneficiaires == null
        )
            return of();

        const codes_programme = this._sanitize_req_arg(bops?.filter((bop) => bop.code).map((bop) => bop.code))
        const annees = this._sanitize_req_arg(years ?? undefined)
        const niveau_geo = this._sanitize_req_arg(this._searchUtils.normalize_type_geo(niveau))
        const listCode = this._sanitize_req_arg(locations?.map((l) => l.code) ?? undefined)
        const qpv_codes = this._sanitize_req_arg(qpvs?.map((q) => q.code) ?? undefined)
        // const codes_cc = this._sanitize_req_arg(centre_couts?.map(cc => cc.code) ?? [])
        const p_themes = this._sanitize_req_arg(themes ?? undefined)
        const siret_beneficiaire: string[] | undefined = this._sanitize_req_arg(beneficiaires?.map(x => x.siret) ?? [])
        const p_types_beneficaires = this._sanitize_req_arg(types_beneficiaires ?? undefined)

        const req$ = this._budgetApi.getBudgetCtrl(
            "0", "6500", undefined, undefined, codes_programme,  niveau_geo, listCode, qpv_codes ? 2024 : undefined, qpv_codes, p_themes, siret_beneficiaire, p_types_beneficaires, annees, undefined, undefined 
        ) as unknown as Observable<DataPagination<EnrichedFlattenFinancialLinesSchema> | null>;

        return req$
    }

    _sanitize_req_arg<T>(arg: Optional<T>): T | undefined {
        if (!arg)
            return undefined

        if (Array.isArray(arg) && arg.length == 0)
            return undefined

        return arg
    }

    public loadFinancialBudget(fileAe: any, fileCp: any, annee: string): Observable<any> {
        const formData = new FormData();
        formData.append('fichierAe', fileAe);
        formData.append('fichierCp', fileCp);
        formData.append('annee', annee);
        return this.http.post(`${this._financialApiUrl}/ae-cp`, formData);
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
        return this._budgetApi.getGetPlageAnnees()
    }

}
