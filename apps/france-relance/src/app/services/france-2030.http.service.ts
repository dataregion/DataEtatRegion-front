import { Inject, Injectable, inject } from "@angular/core";
import { AbstractLaureatsHttpService, SearchParameters, SearchResults } from "./abstract-laureats.http.service";
import { Observable, catchError, map } from "rxjs";
import { SousAxePlanRelance, SousAxePlanRelanceForFilter } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { HttpClient, HttpContext } from "@angular/common/http";
import { SettingsService } from "apps/financial-data/src/environments/settings.service";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataPagination } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { DO_NOT_ALERT_ON_NON_IMPLEMTENTED } from "apps/common-lib/src/public-api";
import { SourceLaureatsData } from "../models/common.model";
import { SearchUtilsService } from "apps/common-lib/src/lib/services/search-utils.service";


@Injectable({
    providedIn: 'root',
})
export class France2030HttpService extends AbstractLaureatsHttpService {
    
    private _searchUtils = inject(SearchUtilsService)

    constructor(private http: HttpClient, @Inject(SETTINGS) readonly _settings: SettingsService) {
        super()
    }

    get apiLaureats() { return this._settings.apiLaureatsData }

    override getSousAxePlanRelance(): Observable<SousAxePlanRelanceForFilter[]> {

        // XXX: ici, pas de notion de sous axes. on mappe aux axes france2030
        return this.http
            .get<SousAxePlanRelance[]>(`${this.apiLaureats}/france-2030-axes`)
            .pipe(
                map(axes => {
                    return axes.map(axe => {
                        const annotated = {
                            ...axe,
                            annotation: "FR30",
                        } as SousAxePlanRelanceForFilter
                        return annotated;
                    })
                })
            )
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
            .pipe(catchError(this._returnValueOn501([])))
    }

    override searchLaureats({ axes, structure, niveau, territoires }: SearchParameters): Observable<SearchResults> {

        const params_structures = structure?.label
        const params_axes = axes?.map(x => x.label)?.join(",")
        const params_niveau = this._searchUtils.normalize_type_geo(niveau)
        const params_code_geo = territoires?.map(x => x.code)?.join(",")

        let url = `${this.apiLaureats}/france-2030?page_number=1`
        if (params_structures)
            url += `&structures=${encodeURIComponent(params_structures)}`

        if (params_axes)
            url += `&axes=${encodeURIComponent(params_axes)}`

        if (params_niveau)
            url += `&niveau_geo=${encodeURIComponent(params_niveau)}`

        if (params_code_geo)
            url += `&code_geo=${encodeURIComponent(params_code_geo)}`

        const emptySearchResult = this._wrap_in_searchresult([])
        const answer$ =
            this.http.get<DataPagination<any>>(
                url, { context: new HttpContext().set(DO_NOT_ALERT_ON_NON_IMPLEMTENTED, true) }
            )
                .pipe(
                    map(x => x?.items ?? []),
                    map(this._mapToSourceLaureatsData(SourceLaureatsData.FRANCE2030)),
                    map(this._wrap_in_searchresult),
                    catchError(this._returnValueOn501(emptySearchResult)),
                )
        return answer$
    }
}