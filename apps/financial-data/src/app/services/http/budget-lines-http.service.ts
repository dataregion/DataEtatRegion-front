import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { DataType } from "@models/audit/audit-update-data.models";
import { SourceFinancialData } from "@models/financial/common.models";
import { FinancialDataModel } from "@models/financial/financial-data.models";
import { BudgetService } from "apps/clients/budget";
import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget/model/enrichedFlattenFinancialLinesSchema";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { DataHttpService, SearchParameters } from "apps/common-lib/src/public-api";
import { SettingsService } from "apps/financial-data/src/environments/settings.service";
import { Observable, of } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService implements DataHttpService<EnrichedFlattenFinancialLinesSchema, FinancialDataModel> {
    private _budgetService!: BudgetService;
    private _apiAdministration!: string;

    constructor(
        private http: HttpClient,
        @Inject(SETTINGS) readonly settings: SettingsService, // eslint-disable-line
        private budgetService: BudgetService,
    ) {
        this._apiAdministration = this.settings.apiAdministration;
        this._budgetService = budgetService;
    }
    mapToGeneric(object: EnrichedFlattenFinancialLinesSchema): FinancialDataModel {

        // TODO: Here
        const mapped: FinancialDataModel = object as unknown as FinancialDataModel

        return { ...mapped, source: SourceFinancialData.CHORUS };
    }

    getSource(): string {
        return SourceFinancialData.CHORUS;
    }

    public getById(id: number): Observable<FinancialDataModel> {
        // return this.http.get<FinancialDataModel>(`${this._apiFinancial}/ae/${id}`);
        // TODO: here
        id
        return of();
    }

    public getCp(id: number): Observable<FinancialDataModel> {
        // TODO: here
        id
        return of();
        // return this.http.get<FinancialDataModel>(`${this._apiFinancial}/ae/${id}/cp`);
    }


    /**
     *
     * @param SearchParameters
     * @returns
     */
    public search(
        { beneficiaires, types_beneficiaires, bops, themes, niveau, locations, years, domaines_fonctionnels, referentiels_programmation, source_region, tags }: SearchParameters
    ): Observable<DataPagination<FinancialDataModel>> {
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
        
        const codes_programme = bops?.filter((bop) => bop.code).map((bop) => bop.code) ?? [];
        const niveau_geo = niveau?.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        const listCode = locations?.map((l) => l.code) ?? [];
        const p_themes = themes ?? undefined;
        const siret_beneficiaire = beneficiaires?.map(x => x.siret) ?? [];
        const p_types_beneficaires = types_beneficiaires ?? undefined;
        const annees = years ?? [];
        const p_domaines_fonctionnels = domaines_fonctionnels ?? []
        const p_refprod = referentiels_programmation ?? []
        const p_tags = tags ?? []

        return this._budgetService.getBudgetCtrl(
            "0", "5000",
            codes_programme,
            niveau_geo,  listCode,
            p_themes,
            siret_beneficiaire, p_types_beneficaires,
            annees, 
            p_domaines_fonctionnels,
            p_refprod,
            p_tags,
        )
    }

    public loadFinancialFile(
        file: any,
        annee: string,
        type: DataType,
        code_region = '53'
    ): Observable<any> {
        // TODO: here
        code_region
        throw new Error("unimpl")
        // const formData = new FormData();
        // formData.append('fichier', file);
        // formData.append('annee', annee);
        // formData.append('code_region', code_region);

        // if (type === DataType.FINANCIAL_DATA_AE) {
        //     return this.http.post(`${this._apiFinancial}/ae`, formData);
        // } else if (type === DataType.FINANCIAL_DATA_CP) {
        //     return this.http.post(`${this._apiFinancial}/cp`, formData);
        // }
        // return of();
    }


    public loadReferentielFile(file: any): Observable<any> {
        const formData = new FormData();
        formData.append('fichier', file);

        return this.http.post(`${this._apiAdministration}/referentiels`, formData);
    }

    public loadMajTagsFile(file: any): Observable<any> {

        // TODO: here
        file
        throw new Error("unimpl")

        // const formData = new FormData();
        // formData.append('fichier', file);

        // return this.http.post(`${this._apiFinancial}/tags/maj_ae_tags_from_export`, formData);
    }

    /**
     * Récupération des années des AE
     * @returns
     */
    public getAnnees(): Observable<number[]> {
        // TODO: here
        throw new Error("unimpl")
        // return this.http.get<number[]>(`${this._apiFinancial}/ae/annees`);
    }

}