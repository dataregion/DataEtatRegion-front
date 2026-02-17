import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Preference, PreferenceWithShared } from '../models/preference.models';
import { PrfrencesUtilisateurService, PreferenceUpdateRequest, PreferenceCreateRequest, PreferenceResponse, UserSearchResponse } from 'apps/clients/v3/administration';

export const API_PREFERENCE_PATH = new InjectionToken<string>('Helper service type');

@Injectable({
  providedIn: 'root'
})
export class PreferenceUsersHttpService {
  private http = inject(HttpClient);
  private readonly _apiPath = inject(API_PREFERENCE_PATH);

  private _preferenceApiV3 = inject(PrfrencesUtilisateurService);

  ///////////////////////////////////////////
  // Mappers
  private mapToReqV3(preference: Preference): PreferenceUpdateRequest | PreferenceCreateRequest {
    const req: PreferenceUpdateRequest = {
      name: preference.name!,
      filters: preference.filters!,
      shares: preference.shares,
      options: preference.options
    };
    return req;
  }

  private mapToRespV3(pref: PreferenceResponse): Preference {
    return {
      uuid: pref.uuid,
      filters: pref.filters as JSONObject,
      name: pref.name,
      options: pref.options as JSONObject,
      shares: pref.shares,
      username: pref.username
    };
  }
  
  private mapToSearchResp(users: UserSearchResponse[]) {
    return users?.map((user) => ({ username: user.username })) || [];
  }
  /////////////////////////////////////////////////

  public getPreferences(): Observable<PreferenceWithShared> {
    return this._preferenceApiV3.listPreferencesUsersPreferencesGet()
    .pipe(
      map((resp) => {
        const create_by_user = resp?.data?.create_by_user?.map((pref) => this.mapToRespV3(pref)) || [];
        const shared_with_user = resp?.data?.shared_with_user?.map((pref) => this.mapToRespV3(pref)) || [];
        return { create_by_user, shared_with_user };
      }
      )
    );
  }


  public savePreference(preference: Preference): Observable<unknown> {
    const req = this.mapToReqV3(preference);
    if (preference.uuid) {
      // update
      return this._preferenceApiV3.updatePreferenceUsersPreferencesUuidPost({
        uuid: preference.uuid,
        preferenceUpdateRequest: req
      });
    } else {
      // create
      return this._preferenceApiV3.createPreferenceUsersPreferencesPost({
        preferenceCreateRequest: req
      });
    }
  }

  public deletePreference(uuid: string): Observable<void> {
    return this._preferenceApiV3
      .deletePreferenceUsersPreferencesUuidDelete({ uuid })
      .pipe(map(() => void 0));
  }

  public getPreference(uuid: string): Observable<Preference> {
    return this._preferenceApiV3
      .getPreferenceUsersPreferencesUuidGet({ uuid })
      .pipe(map((pref) => this.mapToRespV3(pref.data!)));
  }

  public searchUser(search: string): Observable<{ username: string }[]> {
    return this._preferenceApiV3
      .searchUsersUsersPreferencesSearchUserGet({ username: search })
      .pipe(
        map((resp) => this.mapToSearchResp(resp.data!))
      )
  }
}
