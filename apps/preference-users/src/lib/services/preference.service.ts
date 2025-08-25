import { Injectable, InjectionToken, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preference } from '../models/preference.models';

export const API_PREFERENCE_PATH = new InjectionToken<string>('Helper service type');

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  private preferenceSubject = new BehaviorSubject<Preference | null>(null);
  preference$ = this.preferenceSubject.asObservable();

  getCurrentPreference(): Preference | null {
    return this.preferenceSubject.value;
  }

  setCurrentPreference(pref: Preference | null) {
    this.preferenceSubject.next(pref);
  }

}
