import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, inject } from "@angular/core";
import { DataType } from "@models/audit/audit-update-data.models";
import { SourceFinancialData } from "@models/financial/common.models";
import { FinancialCp, FinancialDataModel } from "@models/financial/financial-data.models";
import { BudgetService as GeneratedBudgetApiService } from "apps/clients/budget";
import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget/model/enrichedFlattenFinancialLinesSchema";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { DataHttpService, SearchParameters } from "apps/common-lib/src/public-api";
import { SettingsService } from "apps/financial-data/src/environments/settings.service";
import { Observable, of } from "rxjs";
import { BudgetLineHttpMapper } from "./budget-lines-http.mapper.service";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService implements DataHttpService<EnrichedFlattenFinancialLinesSchema, FinancialDataModel> {

    private _apiAdministration!: string;
    private _financialApiUrl!: string;
    private _budgetApi: GeneratedBudgetApiService = inject(GeneratedBudgetApiService);
    private _mapper: BudgetLineHttpMapper;

    constructor(
        private http: HttpClient,
        @Inject(SETTINGS) readonly settings: SettingsService, // eslint-disable-line
    ) {
        this._apiAdministration = this.settings.apiAdministration;
        this._financialApiUrl = settings.apiFinancialData;
        this._mapper = new BudgetLineHttpMapper();
    }

    mapToGeneric(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
        const mapped: FinancialDataModel = this._map(object);
        return mapped;
    }

    _map(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {
        return this._mapper.map(object)
    }

    getSources(): string[] {
        return [SourceFinancialData.CHORUS, SourceFinancialData.ADEME];
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
        { beneficiaires, types_beneficiaires, bops, themes, niveau, locations, years, domaines_fonctionnels, referentiels_programmation, source_region, tags }: SearchParameters
    ): Observable<DataPagination<EnrichedFlattenFinancialLinesSchema> | null> {
        if (
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

        const codes_programme = bops?.filter((bop) => bop.code).map((bop) => bop.code);
        const niveau_geo = niveau?.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const listCode = locations?.map((l) => l.code) ?? undefined;
        const p_themes = themes ?? undefined;
        const siret_beneficiaire: string[] | undefined = beneficiaires?.map(x => x.siret) ?? [];
        const p_types_beneficaires = types_beneficiaires ?? undefined;
        const annees = years ?? undefined;
        const p_domaines_fonctionnels: string[] | undefined = domaines_fonctionnels ?? []
        const p_refprod: string[] | undefined = referentiels_programmation?.map(rp => rp.code) ?? []
        const p_tags: string[] | undefined = tags ?? []

        const query_params = [
            this._sanitize_req_arg(codes_programme),
            this._sanitize_req_arg(niveau_geo),
            this._sanitize_req_arg(listCode),
            this._sanitize_req_arg(p_themes),
            this._sanitize_req_arg(siret_beneficiaire),
            this._sanitize_req_arg(p_types_beneficaires),
            this._sanitize_req_arg(annees),
            this._sanitize_req_arg(p_domaines_fonctionnels),
            this._sanitize_req_arg(p_refprod),
            this._sanitize_req_arg(p_tags)
        ] as const;

        const req$ = this._budgetApi.getBudgetCtrl(
            "0", "5000",
            ...query_params) as unknown as Observable<DataPagination<EnrichedFlattenFinancialLinesSchema> | null>;

        return req$
    }

    _sanitize_req_arg<T>(arg: Optional<T>): T | undefined {
        if (!arg)
            return undefined

        if (Array.isArray(arg) && arg.length == 0)
            return undefined

        return arg
    }

    public loadFinancialFile(
        file: any,
        annee: string,
        type: DataType,
        code_region = '53'
    ): Observable<any> {
        const formData = new FormData();
        formData.append('fichier', file);
        formData.append('annee', annee);
        formData.append('code_region', code_region);

        if (type === DataType.FINANCIAL_DATA_AE) {
            return this.http.post(`${this._financialApiUrl}/ae`, formData);
        } else if (type === DataType.FINANCIAL_DATA_CP) {
            return this.http.post(`${this._financialApiUrl}/cp`, formData);
        }
        return of();
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