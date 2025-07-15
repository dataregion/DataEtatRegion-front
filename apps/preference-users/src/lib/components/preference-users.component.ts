import { Component, Input, OnInit, inject, signal } from '@angular/core';
import {
  Preference,
  MapPreferenceFilterMetadata,
  PreferenceWithShared
} from '../models/preference.models';
import { JSONValue } from 'apps/common-lib/src/lib/models/jsonobject';
import { MatDialog } from '@angular/material/dialog';
import { PreferenceUsersHttpService } from '../services/preference-users-http.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { AlertService } from 'apps/common-lib/src/public-api';
import { SavePreferenceDialogComponent } from './save-filter/save-preference-dialog.component';

@Component({
  selector: 'lib-preference-users',
  templateUrl: './preference-users.component.html',
  styles: [
    '.mat-column-filters { width: 55%; } ',
    '.mat-column-shares { width: 20% }',
    '.mat-column-name { width: 10% }'
  ],
  standalone: false
})
export class PreferenceUsersComponent implements OnInit {
  private _service = inject(PreferenceUsersHttpService);
  private _alertService = inject(AlertService);

  /**
   * Object pour mapper le nom du filtre avec une String affichable.
   * Uniquement les filtres présent dans l'attribut seront affichés
   */
  @Input() mappingMetadata!: MapPreferenceFilterMetadata;

  /**
   * FOnction de callback pour appliquer la preference
   */
  @Input() applyPreference: (_uuid: string, _filter: Preference) => void;

  private dialog = inject(MatDialog);

  public displayedColumns: string[] = ['name', 'filters', 'shares', 'actions'];

  // public dataSource: PreferenceWithShared = {
  //   create_by_user: [],
  //   shared_with_user: []
  // };

  public dataSource = signal<PreferenceWithShared>({
    create_by_user: [],
    shared_with_user: []
  })

  public readonly objectKeys = Object.keys;
  public readonly json = JSON;

  constructor() {
    this.applyPreference = (_uuid: string) => { };
  }

  ngOnInit(): void {
    this._service.getPreferences().subscribe((response) => {
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
  public deleteFilter(uuid: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: 'Êtes-vous sûrs de vouloir supprimer le filtre ?',
      width: '40rem',
      autoFocus: 'input'
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this._service.deletePreference(uuid).subscribe({
          next: () => {
            this.dataSource().create_by_user = this.dataSource().create_by_user.filter(
              (data) => data.uuid && data.uuid !== uuid
            );
            this._alertService.openAlertSuccess('Suppression du filtre');
          }
        });
      }
    });
  }

  /**
   * Ouvre la pop-up de partage de filtre
   * @param uuid
   */
  public shareFilter(preference: Preference) {
    this.dialog.open(SavePreferenceDialogComponent, {
      data: preference,
      width: '40rem',
      autoFocus: 'input'
    });
  }
}
