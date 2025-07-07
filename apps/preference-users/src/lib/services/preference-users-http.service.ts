import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Preference, PreferenceWithShared } from '../models/preference.models';

export const API_PREFERENCE_PATH = new InjectionToken<string>('Helper service type');

@Injectable({
  providedIn: 'root'
})
export class PreferenceUsersHttpService {
  private http = inject(HttpClient);
  private readonly _apiPath = inject(API_PREFERENCE_PATH);


  public getPreferences(): Observable<PreferenceWithShared> {
    return this.http.get<PreferenceWithShared>(`${this._apiPath}/users/preferences`);
  }

  public savePreference(preference: Preference): Observable<unknown> {
    if (preference.uuid) {
      // update
      return this.http.post(`${this._apiPath}/users/preferences/${preference.uuid}`, preference);
    } else {
      // create
      return this.http.post(`${this._apiPath}/users/preferences`, preference);
    }
  }

  public deletePreference(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this._apiPath}/users/preferences/${uuid}`);
  }

  public getPreference(uuid: string): Observable<Preference> {
    return this.http.get<Preference>(`${this._apiPath}/users/preferences/${uuid}`);
  }

  public searchUser(search: string): Observable< { username: string }[]> {
    return this.http.get< { username: string }[]>(`${this._apiPath}/users/preferences/search-user?username=${search}`);
  }
}
