import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_REF_PATH } from '../../public-api';

import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { BopModel } from '@models/refs/bop.models';
import { DataPagination } from '../models/pagination/pagination.models';
import { CentreCouts, DomaineFonctionnel } from '@models/financial/common.models';

@Injectable({
  providedIn: 'root'
})
export class ReferentielsHttpService {
  private http = inject(HttpClient);
  private readonly api_ref = inject(API_REF_PATH);

  public searchReferentielProgrammation(
    term: string | null,
    programmes: BopModel[] | null
  ): Observable<ReferentielProgrammation[]> {
    return this._getReferentiel(term, programmes, 'ref-programmation');
  }

  public searchCentreCouts(
    term: string | null,
    programmes: BopModel[] | null
  ): Observable<CentreCouts[]> {
    return this._getReferentiel(term, programmes, 'centre-couts');
  }

  public searchDomainesFonctionnel(
    term: string | null,
    programmes: BopModel[] | null
  ): Observable<DomaineFonctionnel[]> {
    return this._getReferentiel(term, programmes, 'domaine-fonct');
  }

  private _getReferentiel(
    term: string | null,
    programmes: BopModel[] | null,
    path_referentiel: string
  ) {
    return this.http.get(this._buildUrl(term, programmes, path_referentiel)).pipe(
      map((response) => {
        const result = response as unknown as DataPagination<any>;
        return result ? result.items : [];
      })
    );
  }

  private _buildUrl(term: string | null, programmes: BopModel[] | null, path_referentiel: string) {
    let url = `${this._removeTrailingSlash(this.api_ref)}/${path_referentiel}?limit=500`;
    if (term) url += '&query=' + term;
    if (programmes) url += '&code_programme=' + programmes.map((p) => p.code).join(',');
    return url;
  }

  private _removeTrailingSlash(s: string) {
    if (s.endsWith('/')) return s.slice(0, -1);
    return s;
  }
}
