import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  MapPreferenceFilterMetadata,
  Preference
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';

@Component({
    selector: 'france-relance-preference',
    templateUrl: './preference.component.html',
    standalone: false
})
export class PreferenceComponent {
  private _router = inject(Router);


  public mappingValueFilter: MapPreferenceFilterMetadata = {
    structure: {
      label: 'Lauréat',
      renderFn: (row: JSONObject) => row['label']
    },
    territoire: {
      label: 'Territoire',
      renderFn: (row: JSONObject) => row['Commune']
    },
    axe_plan_relance: {
      label: 'Axe du plan de relance',
      renderFn: (row: JSONObject) => row['axe'] + ' - ' + row['label']
    }
  };

  /**
   * redirige vers la page d'accueil avec l'identifiant du filtre
   *
   * @param uuid
   * @param _pref
   */
  public applyPreference = (uuid: string, _pref: Preference) => {
    this._router.navigate([''], {
      queryParams: { uuid: uuid }
    });
  };
}
