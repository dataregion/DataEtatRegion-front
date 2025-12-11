import { Injectable, inject } from "@angular/core";
import { map, Observable } from "rxjs";
import { LignesFinancieresService } from "apps/clients/v3/data-qpv";
import { SourceQueryParamsService } from "apps/appcommon/src/lib/services/source-query-params.service";
import { SourceQueryParams } from "apps/appcommon/src/lib/models/source-query-params.model";


@Injectable({
    providedIn: 'root',
})
export class QpvDataService {

    private _sourceQueryParamsService: SourceQueryParamsService = inject(SourceQueryParamsService);
    private _qpvApi: LignesFinancieresService = inject(LignesFinancieresService);

    public getAnnees(params?: SourceQueryParams): Observable<number[]> {
        if (!params)
            params = this._sourceQueryParamsService.getEmpty()

        const sanitized = this._sourceQueryParamsService.getSanitizedFullSourceParams(params)
        return this._qpvApi.getAnneesLignesAnneesGet(sanitized, "body").pipe(
            map(response => response.data ?? [])
        )
    }

}
