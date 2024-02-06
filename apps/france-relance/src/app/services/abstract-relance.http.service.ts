import { NocodbHttpService } from "apps/common-lib/src/public-api";
import { Observable } from "rxjs";
import { SousAxePlanRelance } from "../models/axe.models";
import { Structure } from "../models/structure.models";
import { Territoire } from "../models/territoire.models";
import { FrontLaureat } from "../models/laureat.models";

export abstract class AbstractRelanceHttpService extends NocodbHttpService {

    abstract getSousAxePlanRelance(): Observable<SousAxePlanRelance[]>
    abstract searchStructure(_name: string): Observable<Structure[]>
    abstract searchTerritoire(_name: string): Observable<Territoire[]>
    abstract searchFranceRelance(
        _axes: SousAxePlanRelance[],
        _structure: Structure,
        _territoires: Territoire[]
    ): Observable<FrontLaureat[]>
    abstract getCsv(
        _axes: SousAxePlanRelance[],
        _structure: Structure,
        _territoires: Territoire[]
    ): Observable<Blob>
}