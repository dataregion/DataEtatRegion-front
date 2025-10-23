import { Injectable, inject } from '@angular/core';
import { BopModel, ThemeModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { Observable, forkJoin, map } from 'rxjs';
import { SettingsDataQPVService } from '../../environments/settings-qpv.service';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';

import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { CentreCouts } from '../../models/financial/common.models';
import { explodeQpvList, RefGeoQpv, RefQpvWithCommune } from '../../models/refs/qpv.model';
import { SessionService } from 'apps/common-lib/src/public-api';



@Injectable({ providedIn: 'root' })
export class ReferentielsService {
  private http = inject(HttpClient);
  readonly settings = inject(SettingsDataQPVService);
  private _sessionService = inject(SessionService);

  private _apiRef!: string;

  constructor() {
    this._apiRef = this.settings.apiReferentiel;
  }


  public filterRefSiret$(nomOuSiret: string): Observable<RefSiret[]> {

    const req$ = forkJoin(
      {
        byCode: this._filterByCode(nomOuSiret),
        byDenomination: this._filterByDenomination(nomOuSiret),
      }
    )
      .pipe(
        map((full) => [...full.byCode, ...full.byDenomination]),
      );

    return req$
  }

  public getRefGeoQpv(): Observable<RefGeoQpv> {
    const code_region = this._sessionService.region_code?.length == 3 && this._sessionService.region_code[0] == "0"
      ? this._sessionService.region_code.substring(1)
      : this._sessionService.region_code;


    const url = `${this._apiRef}/qpv/region/${code_region}`;
    return this.http
      .get<RefQpvWithCommune[]>(url)
      .pipe(
        map(refQpvWithCommune => {
          const qpv = explodeQpvList(refQpvWithCommune)
          return qpv;
        })
      );
  }

  public getThemes(): Observable<ThemeModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<ThemeModel>>(`${this._apiRef}/themes?${params}`)
      .pipe(map((response) => response.items));
  }

  public getBop(): Observable<BopModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<BopModel>>(`${this._apiRef}/programme?${params}`)
      .pipe(map((response) => response.items));
  }

  public getCentreCouts(query: string | null): Observable<CentreCouts[]> {
    let params = '';
    if (query)
      params += '?query=' + query
    return this.http.get<DataPagination<CentreCouts>>(`${this._apiRef}/centre-couts${params}`)
      .pipe(
        map(response => {
          return response != null ? response.items as CentreCouts[] : []
        })
      );
  }

  private _filterByCode(nomOuSiret: string): Observable<RefSiret[]> {
    return this._filterBy("query", nomOuSiret)
  }

  private _filterByDenomination(nomOuSiret: string): Observable<RefSiret[]> {
    return this._filterBy("denomination", nomOuSiret)
  }

  private _filterBy(nomChamp: string, term: string) {
    const encodedNomOuSiret = encodeURIComponent(term);
    const params = `limit=10&${nomChamp}=${encodedNomOuSiret}`;
    const url = `${this._apiRef}/beneficiaire?${params}`;
    return this.http
      .get<DataPagination<RefSiret>>(url)
      .pipe(
        map(
          (response) => {
            if (response == null) // XXX: no content
              return [];

            return response.items;
          }
        )
      );
  }

}
