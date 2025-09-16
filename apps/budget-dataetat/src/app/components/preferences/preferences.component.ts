import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import {
  Preference,
  MapPreferenceFilterMetadata,
  PreferenceWithShared
} from 'apps/preference-users/src/lib/models/preference.models';
import { JSONObject, JSONValue } from 'apps/common-lib/src/lib/models/jsonobject';
import { PreferenceUsersHttpService } from 'apps/preference-users/src/lib/services/preference-users-http.service';
import { AlertService } from 'apps/common-lib/src/public-api';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ModalSauvegardeComponent } from "../home/table-toolbar/modal-sauvegarde/modal-sauvegarde.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'budget-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['preferences.component.scss'],
  imports: [CommonModule, ModalConfirmComponent, ModalSauvegardeComponent],
  standalone: true
})
export class PreferencesComponent implements OnInit {

  private _router = inject(Router)
  private _service = inject(PreferenceUsersHttpService);
  private _alertService = inject(AlertService);
  private _destroyRef = inject(DestroyRef);

  /**
   * Object pour mapper le nom du filtre avec une String affichable.
   * Uniquement les filtres présent dans l'attribut seront affichés
   */
  public mappingMetadata: MapPreferenceFilterMetadata = {
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

  private _ppBeneficiaire(json: JSONObject) {
    if (json['denomination']) {
      return `${json['denomination']} (${json['siret']})`;
    }
    return `Siret : (${json['siret']})`;
  }

  private _ppTags(json: JSONObject) {
    return `${json}`;
  }


  public selectedPreference: Preference | undefined;

  public dataSource = signal<PreferenceWithShared>({
    create_by_user: [],
    shared_with_user: []
  })

  public readonly objectKeys = Object.keys;
  public readonly json = JSON;

  ngOnInit(): void {
    this._service.getPreferences().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((response) => {
      this.dataSource.set(response);
    });
  }

  public getTypeField(element: JSONValue) {
    if (Array.isArray(element)) {
      return 'array';
    }

    if (typeof element !== 'object') return 'simple';
    return 'object';
  }

  /**
   * Lance la suppression d'une préférence
   * @param uuid
   */
  confirmDelete = (preference: Preference) => {
    if (!preference.uuid)
      return
    const uuid: string = preference.uuid
    this._service
      .deletePreference(uuid)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          // On update comme ça car dataSource est un signal
          this.dataSource.update((prev) => ({
            ...prev,
            create_by_user: prev.create_by_user.filter((data) => data.uuid && data.uuid !== uuid)
          }));
          this._alertService.openAlertSuccess('Suppression du filtre');
        }
      });
  }

  /**
   * Redirige vers la page d'accueil avec l'identifiant du filtre
   *
   * @param uuid
   * @param _pref
   */
  public applyPreference = (uuid: string, _pref: Preference) => {
    this._router.navigate([''], {
      queryParams: { uuid: uuid }
    });
  };


  setSelected(preference: Preference) {
    this.selectedPreference = preference
  }
  
}
