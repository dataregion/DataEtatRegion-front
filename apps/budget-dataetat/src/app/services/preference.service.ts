import { Injectable, signal } from '@angular/core';
import { Preference } from '../../../../preference-users/src/lib/models/preference.models';
import { PreFilters } from '@models/search/prefilters.model';


@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  /**
   * Filtres de la recherche courante
   */
  public readonly currentPrefilter = signal<PreFilters | null>(null);
  
  /**
   * Préférences liée à la recherche courante
   */
  private readonly _currentPreference = signal<Preference | null>(null);
  
  /**
   * Signal read-only pour les préférences courantes
   */
  public readonly currentPreference = this._currentPreference.asReadonly();

  /**
   * Met à jour les préférences courantes
   * Met automatiquement à jour les filtres associés
   */
  public setCurrentPreference(pref: Preference | null): void {
    this.currentPrefilter.set(pref ? pref.filters as PreFilters : null);
    this._currentPreference.set(pref);
  }

  /**
   * Met à jour uniquement les filtres
   */
  public setCurrentPrefilter(pref: PreFilters | null): void {
    this.currentPrefilter.set(pref);
  }

}
