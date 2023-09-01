import { Injectable, Inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SettingsService } from '../../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';

@Injectable({
  providedIn: 'root',
})
export class UiHttpService  {
  private _apiUi! : string;

  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) readonly settings: SettingsService
  ) {
    this._apiUi = this.settings.apiUi;
  }

  /**
   * Récupération des années présentes dans ae et cp 
   * @returns 
   */
  public getAnnees(): Observable<number[]> {
    return this.http.get<number[]>(`${this._apiUi}/annees`);
  }

}
