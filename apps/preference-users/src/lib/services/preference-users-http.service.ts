import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Preference } from '../models/preference.models';
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
   * @param apiPath Path api
   */
  constructor(
    private http: HttpClient,
    @Inject(API_PREFERENCE_PATH) private readonly apiPath: string
  ) {}

  public getPreferences(): Observable<Preference[]> {
    return this.http.get<any>(`${this.apiPath}/users/preferences`);
  }

  public savePreference(preference: Preference): Observable<any> {
    return this.http.post(`${this.apiPath}/users/preferences`, preference);
  }

  public deletePreference(uuid: string): Observable<any> {
    return this.http.delete(`${this.apiPath}/users/preferences/${uuid}`);
  }
}
