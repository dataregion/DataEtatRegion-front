import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  MapPreferenceFilterMetadata,
  Preference
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';

@Component({
    selector: 'financial-preference',
    templateUrl: './preference.component.html',
    standalone: false
})
export class PreferenceComponent {
  constructor(private _router: Router) {}

  public mappingValueFilter: MapPreferenceFilterMetadata = {
    theme: {
      label: 'Thème'
    },
    bops: {
      label: 'Programmes',
      renderFn: (row: JSONObject) => row['code'] + ' - ' + row['label']
    },
    referentiels_programmation: {
      label: 'Référentiels',
      renderFn: (row: JSONObject) => row['code']
    },
    location: {
      label: 'Territoire',
      renderFn: (row: JSONObject) => {
        return `${row['type']} : ${row['nom']} (${row['code']})`;
      }
    },
    year: {
      label: 'Année'
    },
    beneficiaire: {
      label: 'Bénéficiare',
      renderFn: (row: JSONObject) => {
        return this._ppTags(row);
      }
    },
    beneficiaires: {
      label: 'Bénéficiaires',
      renderFn: (row: JSONObject) => {
        return this._ppBeneficiaire(row);
      }
    },
    types_beneficiaires: {
      label: 'Types de bénéficiaires'
    },
    tags: {
      label: 'Tags',
      renderFn: (row: JSONObject) => {
        return this._ppTags(row);
      }
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
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private _ppBeneficiaire(json: any) {
    if (json['denomination']) {
      return `${json['denomination']} (${json['siret']})`;
    }
    return `Siret : (${json['siret']})`;
  }

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  private _ppTags(json: any) {
    return `${json['item']}`;
  }
}
