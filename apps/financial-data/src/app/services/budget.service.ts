import { Inject, Injectable, InjectionToken } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { BopModel } from '@models/refs/bop.models';
import { Observable, forkJoin, map } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SourceFinancialData } from '@models/financial/common.models';
import { Tag } from '@models/refs/tag.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';

import * as XLSX from 'xlsx';
import { DisplayedOrderedColumn } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { DataHttpService, SearchParameters } from './interface-data.service';
import { ExportableAsJson } from 'apps/common-lib/src/lib/models/exportable-as-json.model';

export const DATA_HTTP_SERVICE = new InjectionToken<DataHttpService<any, FinancialDataModel>>(
  'DataHttpService'
);

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private _apiRef!: string;


  constructor(
    private http: HttpClient,
    @Inject(DATA_HTTP_SERVICE) private _services: DataHttpService<any, FinancialDataModel>[],
    @Inject(SETTINGS) readonly settings: SettingsService
  ) {
    this._apiRef = this.settings.apiReferentiel;
  }

  public search(search_params: SearchParameters): Observable<FinancialDataModel[]> {
    const search$: Observable<FinancialDataModel[]>[] = this._services.map(service =>
      service.search(search_params).pipe(
        map((resultPagination: DataPagination<any> | null) => {
          if (resultPagination === null || resultPagination.pageInfo === undefined) return [];
          if (resultPagination.pageInfo.totalRows > resultPagination.pageInfo.pageSize) {
            throw new Error(`La limite de lignes de résultat est atteinte. Veuillez affiner vos filtres afin d'obtenir un résultat complet.`);
          }
          return resultPagination.items;
        }),
        map(items => items.map(data => service.mapToGeneric(data)))
      )
    );


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

  public allTags$(): Observable<Tag[]> {
    const url = `${this._apiRef}/tags`;

    return this.http
      .get<Tag[]>(url)
      .pipe(
        map(
          (response) => {
            if (response == null)
              return [];
            return response;
          }
        )
      )
  }

  public getRefSiretFromCode$(code: string): Observable<RefSiret> {

    const url = `${this._apiRef}/beneficiaire/${code}`;
    return this.http
      .get<RefSiret>(url)
      .pipe(
        map(response => {
          return response as RefSiret
        })
      );
  }

  public getBop(): Observable<BopModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<BopModel>>(`${this._apiRef}/programme?${params}`)
      .pipe(map((response) => response.items));
  }

  public getReferentielsProgrammation(query: string | null): Observable<ReferentielProgrammation[]> {
    let params = 'limit=500';
    if (query)
      params += '&code=' + query
    return this.http
      .get<DataPagination<ReferentielProgrammation>>(`${this._apiRef}/ref-programmation?${params}`)
      .pipe(
        map((response) => {
          return response.items
        })
      );
  }

  public getById(source: SourceFinancialData, id: number): Observable<FinancialDataModel> {

    const service = this._services.find(s => s.getSources().includes(source));

    if (service === undefined) throw new Error(`Aucun provider pour la source ${source}`);

    return service.getById(source, id).pipe(
      map(data => service.mapToGeneric(data))
    );
  }
}
