import { Injectable, InjectionToken, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { ReferentielProgrammation } from '../models/refs/referentiel_programmation.model';
import { BopModel, ThemeModel } from '../models/refs/bop.models';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { Tag } from '../models/refs/tag.model';
import { DataHttpService, SearchParameters } from './interface-data.service';
import { FinancialDataModel } from '@models/financial/financial-data.models';

export const DATA_HTTP_SERVICE = new InjectionToken<DataHttpService<any, FinancialDataModel>>(
  'DataHttpService'
);

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  readonly settings = inject(SettingsBudgetService);
  private service= inject(DATA_HTTP_SERVICE);

  private _apiRef!: string;

  constructor() {
    this._apiRef = this.settings.apiReferentiel;
  }

  public getThemes(): Observable<ThemeModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<ThemeModel>>(`${this._apiRef}/themes?${params}`)
      .pipe(map((response) => response.items));
  }

  public getRefSiretFromCode(code: string): Observable<RefSiret> {
    const url = `${this._apiRef}/beneficiaire/${code}`;
    return this.http.get<RefSiret>(url).pipe(
      map((response) => {
        return response as RefSiret;
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
  
    public search(search_params: SearchParameters): Observable<FinancialDataModel[]> {
      return this.service.search(search_params).pipe(
          map((resultIncPagination) => {
  
            if (resultIncPagination === null) return [];
            if (resultIncPagination.pagination.hasNext) {
              throw new Error(`La limite de lignes de résultat est atteinte. Veuillez affiner vos filtres afin d'obtenir un résultat complet.`);
            }
            return resultIncPagination.items;
          }),
          map((items) => items.map((data) =>  this.service.mapToGeneric(data)))
        );
    }
  

}
