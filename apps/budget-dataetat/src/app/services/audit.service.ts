import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AuditUpdateData, DataType } from '../models/audit/audit-update-data.models';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';

@Injectable({
  providedIn: 'root'
})
export class AuditHttpService {
  private http = inject(HttpClient);
  readonly settings = inject(SettingsBudgetService);


  public getLastDateUpdateData(): Observable<{ date: string }> {
    const apiData = this.settings.apiAdministration;

    return this.http.get<{ date: string }>(`${apiData}/audit/FINANCIAL_DATA_AE/last`);
  }

  public getHistoryData(type: DataType): Observable<AuditUpdateData[]> {
    const apiData = this.settings.apiAdministration;

    return this.http
      .get<DataPagination<AuditUpdateData>>(`${apiData}/audit/${type}`)
      .pipe(map((data: DataPagination<AuditUpdateData>) => data.items));
  }
}
