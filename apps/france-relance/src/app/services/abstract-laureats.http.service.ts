import { GeoModel, NocodbHttpService, TypeLocalisation } from "apps/common-lib/src/public-api";
import { Observable, of, throwError } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { FrontLaureat, Laureat } from "../models/laureat.models";
import { HttpErrorResponse } from "@angular/common/http";
import { SourceLaureatsData } from "../models/common.model";

export interface SearchParameters {
    axes: SousAxePlanRelance[] | null,
    structure: Structure | null,
    niveau: TypeLocalisation | null
    territoires: GeoModel[] | null,
}

/** Un résultat de recherche */
export interface SearchResults {
    /** Un message de notification à l'utilisateur */
    messages_utilisateur: string[],
    resultats: FrontLaureat[],
}

export abstract class AbstractLaureatsHttpService extends NocodbHttpService {

    abstract getSousAxePlanRelance(): Observable<SousAxePlanRelance[]>
    abstract searchStructure(_name: string): Observable<Structure[]>
    abstract searchTerritoire(_name: string): Observable<Territoire[]>
    abstract searchLaureats(_search_parameters: SearchParameters): Observable<SearchResults>
    abstract getCsv(
        _axes: SousAxePlanRelance[],
        _structure: Structure,
        _territoires: Territoire[]
    ): Observable<Blob>

    protected _wrap_in_searchresult(xs: FrontLaureat[]): SearchResults {
        return {
            messages_utilisateur: [],
            resultats: xs
        }
    }
    
    protected  _returnValueOn501<T>(value: T) {
        return (error: HttpErrorResponse) => {
            if (error.status === 501) {
                return of(value)
            }
            return throwError(() => error)
        }
    }
    
    protected _enrichitAvecSource(source: SourceLaureatsData) {
       return (xs: Laureat[]) => {
            return xs.map(x => {
                return {
                    source,
                    ...x,
                }
            })
       } 
    }
}