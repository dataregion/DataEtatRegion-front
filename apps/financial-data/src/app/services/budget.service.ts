/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable, InjectionToken, inject } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { BopModel } from '@models/refs/bop.models';
import { forkJoin, map, Observable } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SourceFinancialData } from '@models/financial/common.models';
import { BudgetToGristService, GristDataModel } from 'apps/clients/budget';
import { Tag } from '@models/refs/tag.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';

import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { DataHttpService, SearchParameters } from './interface-data.service';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';

export const DATA_HTTP_SERVICE = new InjectionToken<DataHttpService<any, FinancialDataModel>>(
  'DataHttpService'
);

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  private budgetTogrist = inject(BudgetToGristService);
  private _services= [inject(DATA_HTTP_SERVICE)];
  readonly settings = inject<SettingsService>(SETTINGS);

  private _apiRef!: string;

  constructor() {
    this._apiRef = this.settings.apiReferentiel;
  }

  public search(search_params: SearchParameters): Observable<FinancialDataModel[]> {
    const search$: Observable<FinancialDataModel[]>[] = this._services.map((service) => {
      return service.search(search_params).pipe(
        map((resultIncPagination) => {

          if (resultIncPagination === null) return [];
          if (resultIncPagination.pagination.hasNext) {
            throw new Error(`La limite de lignes de résultat est atteinte. Veuillez affiner vos filtres afin d'obtenir un résultat complet.`);
          }
          return resultIncPagination.items;
        }),
        map((items) => items.map((data) => service.mapToGeneric(data)))
      );
    });

    return forkJoin(search$).pipe(
      map((response) => {
        return response.flatMap((data) => [...data]);
      })
    );
  }

  public allTags$(): Observable<Tag[]> {
    const url = `${this._apiRef}/tags`;

    return this.http.get<Tag[]>(url).pipe(
      map((response) => {
        if (response == null) return [];
        return response;
      })
    );
  }

  public getRefSiretFromCode$(code: string): Observable<RefSiret> {
    const url = `${this._apiRef}/beneficiaire/${code}`;
    return this.http.get<RefSiret>(url).pipe(
      map((response) => {
        return response as RefSiret;
      })
    );
  }

  public getBop(): Observable<BopModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<BopModel>>(`${this._apiRef}/programme?${params}`)
      .pipe(map((response) => response.items));
  }

  public getReferentielsProgrammation(
    query: string | null
  ): Observable<ReferentielProgrammation[]> {
    let params = 'limit=500';
    if (query) params += '&code=' + query;
    return this.http
      .get<DataPagination<ReferentielProgrammation>>(`${this._apiRef}/ref-programmation?${params}`)
      .pipe(
        map((response) => {
          return response.items;
        })
      );
  }

  public getById(source: SourceFinancialData, id: number): Observable<FinancialDataModel> {
    const service = this._services.find((s) => s.getSources().includes(source.toString()));

    if (service === undefined) throw new Error(`Aucun provider pour la source ${source}`);

    return service.getById(source, id).pipe(map((data) => service.mapToGeneric(data)));
  }

  public exportToGrist(data_to_export: JSONObject[]): Observable<void> {
    const data = {data: data_to_export} as GristDataModel;
    return this.budgetTogrist.postBugdetToGrist(data);
  }
  
}
