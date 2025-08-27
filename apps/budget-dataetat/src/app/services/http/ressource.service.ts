import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsBudgetService } from '../../environments/settings-budget.service';
import { Ressources } from 'apps/common-lib/src/public-api';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private http = inject(HttpClient);
  readonly settings = inject(SettingsBudgetService);
  private _apiRessource: string;

  constructor() {
    this._apiRessource = this.settings.apiRessource;
  }

  getResources(): Observable<Ressources> {
    return this.http.get<Ressources>(this._apiRessource);
  }
}
