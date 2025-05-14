import { Inject, Injectable, InjectionToken } from '@angular/core';
import { FinancialDataModel } from 'apps/data-qpv/src/app/models/financial/financial-data.models';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { Observable, forkJoin, map } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SessionService } from 'apps/common-lib/src/public-api';

import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { RefQpv, RefQpvWithCommune } from 'apps/common-lib/src/lib/models/refs/RefQpv';
import { DataHttpService, SearchParameters } from './interface-data.service';
import { CentreCouts } from '../models/financial/common.models';
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DATA_HTTP_SERVICE = new InjectionToken<DataHttpService<any, FinancialDataModel>>(
  'DataHttpService'
);

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private _apiRef!: string;

  constructor(
    private http: HttpClient,
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(DATA_HTTP_SERVICE) private _services: DataHttpService<any, FinancialDataModel>[],
    @Inject(SETTINGS) readonly settings: SettingsService,
    private _sessionService: SessionService
  ) {
    this._apiRef = this.settings.apiReferentiel;
  }

  public search(search_params: SearchParameters): Observable<FinancialDataModel[]> {
    const search$: Observable<FinancialDataModel[]>[] = this._services.map(service => {
      return service.search(search_params).pipe(
        map((resultIncPagination) => {

          if (resultIncPagination === null) return [];
          if (resultIncPagination.pagination.hasNext) {
            throw new Error(`La limite de lignes de résultat est atteinte. Veuillez affiner vos filtres afin d'obtenir un résultat complet.`);
          }
          return resultIncPagination.items;
        }),
        map(items => items.map(data => service.mapToGeneric(data)))
      )
    });


    return forkJoin(search$).pipe(
      map((response) => {
        return response.flatMap(data => [...data])
      })
    );
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

  public getQpvs(annee?: number): Observable<RefQpvWithCommune[]> {
    const code_region =  this._sessionService.region_code?.length == 3 && this._sessionService.region_code[0] == "0"
        ? this._sessionService.region_code.substring(1)
        : this._sessionService.region_code;
    

    const url = `${this._apiRef}/qpv/region/${code_region}`;
    return this.http
      .get<RefQpvWithCommune[]>(url)
      .pipe(
        map(response => {
          console.log(response);
          return response as RefQpvWithCommune[]
        })
      );
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
    return this._filter_by("query", nomOuSiret)
  }

  private _filterByDenomination(nomOuSiret: string): Observable<RefSiret[]> {
    return this._filter_by("denomination", nomOuSiret)
  }

  private _filter_by(nomChamp: string, term: string) {
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
