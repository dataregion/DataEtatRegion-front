import { Injectable } from "@angular/core";
import { AbstractRelanceHttpService } from "./abstract-relance.http.service";
import { Observable, of } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";

// TODO: brancher tout ça !
@Injectable({
    providedIn: 'root',
})
export class France2030HttpService extends AbstractRelanceHttpService {

    override getSousAxePlanRelance(): Observable<SousAxePlanRelance[]> {
        return of(
            [ { label: 'toto', axe: 'tata'} ]
        )
    }
    override searchStructure(structure: string): Observable<Structure[]> {
        if ( structure == 'toto' ) {
            return of(
                [ { label: 'toto', siret: '12345678910' } ]
            )
        } else {
            return of([])
        }
    }
    override searchTerritoire(territoire: string): Observable<Territoire[]> {
        if ( territoire == 'toto' ) {
            const territoire: Territoire = { Commune: 'toto', CodeInsee: 50 };
            return of([ territoire ])
        } else {
            return of([])
        }
    }
    override searchFranceRelance(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<any> {
        // TODO: here
        return of([])
    }

    // TODO: here
    override getCsv(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<Blob> {
        throw new Error("Method not implemented.");
    }

}