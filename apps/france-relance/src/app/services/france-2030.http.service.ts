import { Inject, Injectable } from "@angular/core";
import { AbstractRelanceHttpService } from "./abstract-relance.http.service";
import { Observable, map } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { HttpClient } from "@angular/common/http";
import { SettingsService } from "apps/financial-data/src/environments/settings.service";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";

@Injectable({
    providedIn: 'root',
})
export class France2030HttpService extends AbstractRelanceHttpService {
    
    constructor(private http: HttpClient, @Inject(SETTINGS) readonly _settings: SettingsService) {
        super()
    }
    
    get apiFinancial() { return this._settings.apiFinancialData }

    override getSousAxePlanRelance(): Observable<SousAxePlanRelance[]> {
        
        return this.http
            .get<SousAxePlanRelance[]>(`${this.apiFinancial}/france-2030-axes`)
    }
    override searchStructure(structure: string): Observable<Structure[]> {

        const term = encodeURIComponent(structure)
        return this.http
            .get<Structure[]>(`${this.apiFinancial}/france-2030-structures?term=${term}`)

    }
    override searchTerritoire(territoire: string): Observable<Territoire[]> {
        const term = encodeURIComponent(territoire)
        return this.http
            .get<Territoire[]>(`${this.apiFinancial}/france-2030-territoires?term=${term}`)
    }
    override searchFranceRelance(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<any> {

        const params_structures = _structure?.label
        const params_axes = _axes?.map(x => x.label)?.join(",")
        const params_territoires = _territoires?.map(x => x.Commune)?.join(",")
        
        let url = `${this.apiFinancial}/france-2030?page_number=1`
        if (params_structures)
            url += `&structures=${encodeURIComponent(params_structures)}`

        if (params_axes)
            url += `&structures=${encodeURIComponent(params_axes)}`

        if (params_territoires)
            url += `&structures=${encodeURIComponent(params_territoires)}`
        
        const answer$ = this.http.get<DataPagination<any>>(url)
            .pipe(
                map(x => x?.items ?? []
            ))
        return answer$
    }

    // TODO: here, repair csv
    override getCsv(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<Blob> {
        throw new Error("Method not implemented.");
    }

}