import { Inject, Injectable } from "@angular/core";
import { AbstractRelanceHttpService } from "./abstract-relance.http.service";
import { Observable, catchError, map, of, throwError } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { HttpClient, HttpContext, HttpErrorResponse } from "@angular/common/http";
import { SettingsService } from "apps/financial-data/src/environments/settings.service";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { DO_NOT_ALERT_ON_NON_IMPLEMTENTED } from "apps/common-lib/src/public-api";
import { FrontLaureat, Laureat } from "../models/laureat.models";
import { SourceLaureatsData } from "../models/common.model";

function _returnEmptyArrayOn501(error: HttpErrorResponse) {
    if (error.status === 501) {
        return of([])
    }
    return throwError(() => error)
}

function _enrichitAvecSource(xs: Laureat[]): FrontLaureat[] {
    return xs.map(x => {
        return{
            source: SourceLaureatsData.FRANCE2030,
            ...x,
        }
    })
}

@Injectable({
    providedIn: 'root',
})
export class France2030HttpService extends AbstractRelanceHttpService {

    constructor(private http: HttpClient, @Inject(SETTINGS) readonly _settings: SettingsService) {
        super()
    }

    get apiLaureats() { return this._settings.apiLaureatsData }

    override getSousAxePlanRelance(): Observable<SousAxePlanRelance[]> {

        // XXX: ici, pas de notion de sous axes. on mappe aux axes france2030
        return this.http
            .get<SousAxePlanRelance[]>(`${this.apiLaureats}/france-2030-axes`)
    }
    override searchStructure(structure: string): Observable<Structure[]> {

        const term = encodeURIComponent(structure)
        return this.http
            .get<Structure[]>(`${this.apiLaureats}/france-2030-structures?term=${term}`)

    }
    override searchTerritoire(territoire: string): Observable<Territoire[]> {
        const term = encodeURIComponent(territoire)
        return this.http
            .get<Territoire[]>(
                `${this.apiLaureats}/france-2030-territoires?term=${term}`,
                { context: new HttpContext().set(DO_NOT_ALERT_ON_NON_IMPLEMTENTED, true) },
            )
            .pipe(catchError(_returnEmptyArrayOn501))
    }
    override searchFranceRelance(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<FrontLaureat[]> {

        const params_structures = _structure?.label
        const params_axes = _axes?.map(x => x.label)?.join(",")
        const params_territoires = _territoires?.map(x => x.Commune)?.join(",")

        let url = `${this.apiLaureats}/france-2030?page_number=1`
        if (params_structures)
            url += `&structures=${encodeURIComponent(params_structures)}`

        if (params_axes)
            url += `&axes=${encodeURIComponent(params_axes)}`

        if (params_territoires)
            url += `&territoires=${encodeURIComponent(params_territoires)}`

        const answer$ =
            this.http.get<DataPagination<any>>(
                url, { context: new HttpContext().set(DO_NOT_ALERT_ON_NON_IMPLEMTENTED, true) }
            )
                .pipe(
                    map(x => x?.items ?? []),
                    map(_enrichitAvecSource),
                    catchError(_returnEmptyArrayOn501),
                )
        return answer$
    }

    // TODO: here, repair csv - lorsqu'on migrera 
    override getCsv(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<Blob> {
        throw new Error("Method not implemented.");
    }

}