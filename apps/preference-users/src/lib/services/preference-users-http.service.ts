import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Preference, PreferenceWithShared } from '../models/preference.models';
export const API_PREFERENCE_PATH = new InjectionToken<string>(
  'Helper service type'
);

@Injectable({
  providedIn: 'root',
})
export class PreferenceUsersHttpService {
  /**
   * Service constructor
   * @param http HttpClient object for making HTTP requests
   * @param _apiPath Path api
   */
  constructor(
    private http: HttpClient,
    @Inject(API_PREFERENCE_PATH) private readonly _apiPath: string
  ) {}

  public getPreferences(): Observable<PreferenceWithShared> {
    return this.http.get<PreferenceWithShared>(
      `${this._apiPath}/users/preferences`
    );
  }

  public savePreference(preference: Preference): Observable<any> {
    if (preference.uuid) {
      // update
      return this.http.post(
        `${this._apiPath}/users/preferences/${preference.uuid}`,
        preference
      );
    } else {
      // create
      return this.http.post(`${this._apiPath}/users/preferences`, preference);
    }
  }

  public deletePreference(uuid: string): Observable<any> {
    return this.http.delete(`${this._apiPath}/users/preferences/${uuid}`);
  }

  public getPreference(uuid: string): Observable<Preference> {
    return this.http.get<Preference>(
      `${this._apiPath}/users/preferences/${uuid}`
    );
  }

  public searchUser(search: string): Observable<any> {
    return this.http.get<any>(
      `${this._apiPath}/users/preferences/search-user?username=${search}`
    );
  }
}
