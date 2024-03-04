import { Injectable, inject } from "@angular/core";
import { AbstractLaureatsHttpService, SearchParameters, SearchResults } from "./abstract-laureats.http.service";
import { FranceRelanceHttpService } from "./france-relance.http.service";
import { France2030HttpService } from "./france-2030.http.service";
import { Observable, forkJoin, map } from "rxjs";
import { SousAxePlanRelanceForFilter } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";

/**
 * Service HTTP pour les lauréats. Composition de deux services
 */
@Injectable({
    providedIn: 'root'
})
export class LaureatHttpService extends AbstractLaureatsHttpService {

    private relance: FranceRelanceHttpService = inject(FranceRelanceHttpService)
    private france2030: France2030HttpService = inject(France2030HttpService)

    override getSousAxePlanRelance(): Observable<SousAxePlanRelanceForFilter[]> {

        const sousAxe$ = forkJoin(
            {
                relance: this.relance.getSousAxePlanRelance(),
                france2030: this.france2030.getSousAxePlanRelance(),
            }
        )
            .pipe(
                map(response => {
                    return [
                        ...response.relance,
                        ...response.france2030,
                    ]
                })
            )

        return sousAxe$;
    }

    override searchStructure(structure: string): Observable<Structure[]> {
        const structures$ = forkJoin(
            {
                relance: this.relance.searchStructure(structure),
                france2030: this.france2030.searchStructure(structure),
            }
        ).pipe(
            map(response => {
                return [
                    ...response.relance,
                    ...response.france2030,
                ]
            })
        )
        return structures$;
    }

    override searchTerritoire(territoire: string): Observable<Territoire[]> {

        const territoires$ = forkJoin(
            {
                relance: this.relance.searchTerritoire(territoire),
                france2030: this.france2030.searchTerritoire(territoire)
            }
        ).pipe(
            map(response => {
                return [
                    ...response.relance,
                    ...response.france2030,
                ]
            })
        )

        return territoires$;
    }

    override searchLaureats(sp: SearchParameters): Observable<SearchResults> {

        const franceRelance$ = forkJoin(
            {
                relance: this.relance.searchLaureats(sp),
                france2030: this.france2030.searchLaureats(sp),
            }
        ).pipe(
            map(response => {
                return {
                    messages_utilisateur: [
                        ...response.relance.messages_utilisateur,
                        ...response.france2030.messages_utilisateur,
                    ],
                    resultats: [
                        ...response.relance.resultats,
                        ...response.france2030.resultats
                    ]
                } as SearchResults
            })
        )

        return franceRelance$
    }
}
