import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { API_REF_PATH } from "../../public-api";

import { ReferentielProgrammation } from "@models/refs/referentiel_programmation.model";
import { BopModel } from "@models/refs/bop.models";
import { DataPagination } from "../models/pagination/pagination.models";

@Injectable({
    providedIn: 'root'
})
export class ReferentielsHttpService {

    private http = inject(HttpClient);
    private readonly api_ref = inject(API_REF_PATH);

    public search(term: string | null, programmes: BopModel[] | null): Observable<ReferentielProgrammation[]> {
        let url = `${this._remove_trailing_slash(this.api_ref)}/ref-programmation?limit=500`
        if (term)
          url += '&query=' + term
        if (programmes)
          url += '&code_programme=' + programmes.map(p => p.code).join(',')
        return this.http.get<ReferentielProgrammation[]>(url)
            .pipe(map((response) => {
                const result = response as unknown as DataPagination<ReferentielProgrammation>
                return result ? result.items : [];
            }));
    }

    private _remove_trailing_slash(s: string) {
        if (s.endsWith('/'))
            return s.slice(0, -1)
        return s
    }

}