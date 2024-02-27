import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import {
  PreferenceUsersHttpService,
  SavePreferenceDialogComponent,
} from 'apps/preference-users/src/public-api';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'apps/common-lib/src/public-api';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  ColumnsMetaData,
  GroupingColumn,
  ParameterizedColumnsMetaData,
  TableData,
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { GroupingConfigDialogComponent } from 'apps/grouping-table/src/lib/components/grouping-config-dialog/grouping-config-dialog.component';
import { colonnes, LaureatColumnMetaDataDef } from '../../models/tableau/colonnes.model';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';

@Component({
  selector: 'france-relance-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private dialog = inject(MatDialog);

  columnsMetaData: ParameterizedColumnsMetaData<LaureatColumnMetaDataDef>;
  get genericColumnsMetadata(): ColumnsMetaData {
    return this.columnsMetaData as ColumnsMetaData;
  }

  tableData?: TableData;

  /**
   * Filtre retourner par le formulaire de recherche
   */
  newFilter?: Preference;

  /**
   * Filtre à appliquer sur la recherche
   */
  preFilter: JSONObject | null;

  groupingColumns: GroupingColumn[] = [
    { columnName: 'axe' },
    { columnName: 'sous-axe' },
  ];

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }
  toggle_grid_fullscreen() {
    this._gridFullscreen.fullscreen = !this.grid_fullscreen;
  }
  get fullscreen_label() {
    if (!this.grid_fullscreen) return 'Agrandir le tableau';
    else return 'Rétrécir le tableau';
  }

  constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _preferenceService: PreferenceUsersHttpService,
    private _gridFullscreen: GridInFullscreenStateService
  ) {
    this.columnsMetaData = new ParameterizedColumnsMetaData<LaureatColumnMetaDataDef>(colonnes);
    this.preFilter = null;
  }

  ngOnInit() {
    this._route.queryParams.subscribe((param) => {
      if (param['uuid']) {
        this._preferenceService
          .getPreference(param['uuid'])
          .subscribe((preference) => {
            this.preFilter = preference.filters;

            if (preference.options && preference.options['grouping']) {
              this.groupingColumns = preference.options[
                'grouping'
              ] as GroupingColumn[];
            }
            this._alertService.openInfo(
              `Application du filtre ${preference.name}`
            );
          });
      }
    });
  }

  openGroupConfigDialog() {
    const dialogRef = this.dialog.open(GroupingConfigDialogComponent, {
      data: {
        columns: this.columnsMetaData.data,
        groupingColumns: this.groupingColumns,
      },
      width: '40rem',
      autoFocus: 'input',
    });
    dialogRef
      .afterClosed()
      .subscribe((updatedGroupingColumns: GroupingColumn[]) => {
        if (updatedGroupingColumns) {
          this.groupingColumns = updatedGroupingColumns;
        }
      });
  }

  public openSaveFilterDialog(): void {
    if (this.newFilter) {
      this.newFilter.options = { grouping: this.groupingColumns };
    }

    const dialogRef = this.dialog.open(SavePreferenceDialogComponent, {
      data: this.newFilter,
      width: '40rem',
      autoFocus: 'input',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.newFilter = undefined;
    });
  }
}
