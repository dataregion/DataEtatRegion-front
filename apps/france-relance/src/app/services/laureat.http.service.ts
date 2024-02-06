import { Injectable, inject } from "@angular/core";
import { AbstractRelanceHttpService } from "./abstract-relance.http.service";
import { FranceRelanceHttpService } from "./france-relance.http.service";
import { France2030HttpService } from "./france-2030.http.service";
import { Observable, forkJoin, map } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { Laureats } from "../models/laureat.models";

/**
 * Service HTTP pour les lauréats. Composition de deux services
 */
@Injectable({
    providedIn: 'root'
})
export class LaureatHttpService extends AbstractRelanceHttpService {

    private relance: FranceRelanceHttpService = inject(FranceRelanceHttpService)
    private france2030: France2030HttpService = inject(France2030HttpService)

    override getSousAxePlanRelance(): Observable<SousAxePlanRelance[]> {
        
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

    override searchFranceRelance(axes: SousAxePlanRelance[], structure: Structure, territoires: Territoire[]): Observable<Laureats[]> {
        
        const franceRelance$ = forkJoin(
            {
                relance: this.relance.searchFranceRelance(axes, structure, territoires),
                france2030: this.france2030.searchFranceRelance(axes, structure, territoires),
            }
        ).pipe(
            map(response => {
                return [
                    ...response.relance,
                    ...response.france2030,
                ]
            })
        )
        
        return franceRelance$
    }
    
    override getCsv(_axes: SousAxePlanRelance[], _structure: Structure, _territoires: Territoire[]): Observable<Blob> {
        throw new Error("Method not implemented.");
    }
    
}
