import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, inject } from "@angular/core";
import { FinancialDataModel } from "apps/data-qpv/src/app/models/financial/financial-data.models";
import { BudgetService as GeneratedBudgetApiService } from "apps/clients/budget";
import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget/model/enrichedFlattenFinancialLinesSchema";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataIncrementalPagination, from_page_of_budget_lines } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { SettingsService } from "apps/data-qpv/src/environments/settings.service";
import { map, Observable, of } from "rxjs";
import { BudgetLineHttpMapper } from "./budget-lines-http.mapper.service";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { DataHttpService, SearchParameters } from "apps/data-qpv/src/app/services/interface-data.service";
import { SearchUtilsService } from "apps/common-lib/src/lib/services/search-utils.service";

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService implements DataHttpService<EnrichedFlattenFinancialLinesSchema, FinancialDataModel> {

    private _budgetApi: GeneratedBudgetApiService = inject(GeneratedBudgetApiService);
    private _searchUtils: SearchUtilsService = inject(SearchUtilsService)
    private _mapper: BudgetLineHttpMapper;

    constructor(
        private http: HttpClient,
        @Inject(SETTINGS) readonly settings: SettingsService,  
    ) {
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
    /**
     *
     * @param SearchParameters
     * @returns
     */
    public search(
        { bops, years, niveau, locations, qpvs, centre_couts, themes, beneficiaires, types_beneficiaires }: SearchParameters
    ): Observable<DataIncrementalPagination<EnrichedFlattenFinancialLinesSchema> | null> {
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

        const codes_programme = bops?.filter((bop) => bop.code).map((bop) => bop.code)
        const annees = years ?? undefined
        const niveau_geo = this._searchUtils.normalize_type_geo(niveau)
        const listCode = locations?.map((l) => l.code) ?? undefined
        const qpv_codes = qpvs?.map((q) => q.code) ?? undefined
        const annee_decoupage = 2024
        const codes_cc = centre_couts?.map(cc => cc.code) ?? []
        const p_themes = themes?.join('|') ?? undefined
        const siret_beneficiaire: string[] | undefined = beneficiaires?.map(x => x.siret) ?? []
        const p_types_beneficaires = types_beneficiaires ?? undefined

        const query_params = [
            undefined, // Numeros EJ
            undefined, // Data source
            this._sanitize_req_arg(codes_programme),
            this._sanitize_req_arg(niveau_geo),
            this._sanitize_req_arg(listCode),
            this._sanitize_req_arg(annee_decoupage),
            this._sanitize_req_arg(qpv_codes),
            this._sanitize_req_arg(p_themes),
            this._sanitize_req_arg(siret_beneficiaire),
            this._sanitize_req_arg(p_types_beneficaires),
            this._sanitize_req_arg(annees),
            this._sanitize_req_arg(codes_cc),
            undefined, // Domaine fonctionnel
            undefined, // Référentiel programmtion
            undefined  // Tags
        ] as const;

        const req$ = this._budgetApi.getBudgetCtrl(
            "0",
            "6500", // XXX : Magic number, valeur défaut côté back
            ...query_params 
        ).pipe(map(page => from_page_of_budget_lines(page)))

        return req$
    }

    _sanitize_req_arg<T>(arg: Optional<T>): T | undefined {
        if (!arg)
            return undefined

        if (Array.isArray(arg) && arg.length == 0)
            return undefined

        return arg
    }
    
    public getAnnees(): Observable<number[]> {
        return this._budgetApi.getGetPlageAnnees()
    }

}
