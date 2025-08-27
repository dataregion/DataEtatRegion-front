/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BudgetService } from 'apps/clients/budget';
import { map, Observable, of } from 'rxjs';
import { SettingsBudgetService } from '../../environments/settings-budget.service';
import { Tag } from '../../models/refs/tag.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetDataHttpService {
  private http = inject(HttpClient);
  readonly settings: SettingsBudgetService = inject(SettingsBudgetService);

  private _apiRef!: string;
  private _apiAdministration!: string;
  private _financialApiUrl!: string;
  private _laureatsApiUrl!: string;
  private _budgetApi: BudgetService = inject(BudgetService);

  constructor() {
    const settings = this.settings;

    this._apiAdministration = this.settings.apiAdministration;
    this._apiRef = this.settings.apiReferentiel;
    this._financialApiUrl = settings.apiFinancialData;
    this._laureatsApiUrl = settings.apiLaureatsData;
  }

  public loadFinancialBudget(fileAe: File, fileCp: File, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichierAe', fileAe);
    formData.append('fichierCp', fileCp);
    formData.append('annee', annee);
    return this.http.post(`${this._financialApiUrl}/region`, formData);
  }

  public loadFinancialFrance2030(file: File, annee: string): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('annee', annee);
    return this.http.post(`${this._laureatsApiUrl}/france-2030`, formData);
  }

  public loadReferentielFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._apiAdministration}/referentiels`, formData);
  }

  public loadMajTagsFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);

    return this.http.post(`${this._financialApiUrl}/tags/maj_ae_tags_from_export`, formData);
  }

  public getAnnees(): Observable<number[]> {
    return this._budgetApi.getGetPlageAnnees();
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
}
