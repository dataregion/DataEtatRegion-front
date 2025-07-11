import { Injectable, inject } from '@angular/core';
import { BopModel } from '@models/refs/bop.models';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { SettingsBudgetService } from '../environments/settings-budget.service';



@Injectable({ providedIn: 'root' })
export class BudgetService {
  private http = inject(HttpClient);
  readonly settings = inject(SettingsBudgetService);

  private _apiRef!: string;

  constructor() {
    this._apiRef = this.settings.apiReferentiel;
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
  
}
