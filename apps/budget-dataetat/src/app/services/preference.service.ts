import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preference } from '../../../../preference-users/src/lib/models/preference.models';
import { PreFilters } from '@models/search/prefilters.model';


@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  /**
   * Filtres de la recherche courante
   */
  private currentPrefilterSubject = new BehaviorSubject<PreFilters | null>(null);
  currentPrefilter$ = this.currentPrefilterSubject.asObservable();
  get currentPrefilter(): PreFilters | null {
    return this.currentPrefilterSubject.value;
  }
  set currentPrefilter(pref: PreFilters | null) {
    this.currentPrefilterSubject.next(pref);
  }
  
  /**
   * Préférences liée à la recherche courante
   */
  private currentPreferenceSubject = new BehaviorSubject<Preference | null>(null);
  currentPreference$ = this.currentPreferenceSubject.asObservable();
  get currentPreference(): Preference | null {
    return this.currentPreferenceSubject.value;
  }
  set currentPreference(pref: Preference | null) {
    this.currentPrefilter = pref ? pref.filters as PreFilters : null
    this.currentPreferenceSubject.next(pref);
  }

}
