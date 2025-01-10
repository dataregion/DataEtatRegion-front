import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  MapPreferenceFilterMetadata,
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";

@Component({
    selector: 'data-qpv-preference',
    templateUrl: './preference.component.html',
    standalone: false
})
export class PreferenceComponent {
  constructor(private _router: Router) {}

  public mappingValueFilter: MapPreferenceFilterMetadata = {
    annees: {
      label: 'Années'
    },
    zone: {
      label: 'Zone géographique',
      renderFn: (row: JSONObject) => {
        return `${row['type']} : ${row['nom']} (${row['code']})`;
      },
    },
    qpv: {
      label: 'QPV',
      renderFn: (row: JSONObject) => row['code'] + ' - ' + row['label'],
    },
  };

  /**
   * redirige vers la page d'accueil avec l'identifiant du filtre
   *
   * @param uuid
   * @param _pref
   */
  public applyPreference = (uuid: string, _pref: Preference) => {
    this._router.navigate([''], {
      queryParams: { uuid: uuid },
    });
  };

}
