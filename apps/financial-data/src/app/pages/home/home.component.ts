import { Component, inject, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import {
  PreferenceUsersHttpService,
  SavePreferenceDialogComponent,
} from 'apps/preference-users/src/public-api';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { ActivatedRoute, Data } from '@angular/router';
import { AlertService } from 'apps/common-lib/src/public-api';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  ColumnsMetaData,
  ColumnMetaDataDef,
  DisplayedOrderedColumn,
  GroupingColumn,
  RowData,
  TableData,
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { GroupingConfigDialogComponent } from 'apps/grouping-table/src/lib/components/grouping-config-dialog/grouping-config-dialog.component';
import { StructureColumnsDialogComponent } from 'apps/grouping-table/src/lib/components/structure-columns-dialog/structure-columns-dialog.component';
import { InformationsSupplementairesDialogComponent } from '../../modules/informations-supplementaires/informations-supplementaires-dialog/informations-supplementaires-dialog.component';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { NGXLogger } from 'ngx-logger';
import { delay } from 'rxjs';
import { PreFilters } from '@models/search/prefilters.model';
import { colonnes } from '@models/tableau/colonnes.model';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { Tag, tag_str } from '@models/refs/tag.model';

@Component({
  selector: 'financial-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private dialog = inject(MatDialog);

  columnsMetaData: ColumnsMetaData;

  tableData?: TableData;

  /**
   * Filtre retourner par le formulaire de recherche
   */
  newFilter?: Preference;

  /**
   * Filtre à appliquer sur la recherche
   */
  preFilter?: PreFilters;

  lastImportDate: string | null = null;

  groupingColumns: GroupingColumn[] = [
    { columnName: 'annee' }
  ];

  /**
   * Ordre des colonnes par défaut
   */
  defaultOrder: string[];

  /**
   * Statuts des colonnes (ordre et displayed) 
   */
  displayedOrderedColumns: DisplayedOrderedColumn[] = [];

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
    private route: ActivatedRoute,
    private alertService: AlertService,
    private preferenceService: PreferenceUsersHttpService,
    private auditService: AuditHttpService,
    private _gridFullscreen: GridInFullscreenStateService,
    private _logger: NGXLogger,
  ) {
    // Récupération de l'ordre des colonnes par défaut
    this.defaultOrder = colonnes.map(col => col.label);

    this.columnsMetaData = new ColumnsMetaData(colonnes);
    this.preFilter = undefined;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((param) => {
      /* */
      if (param[QueryParam.Uuid]) {
        this.preferenceService
          .getPreference(param[QueryParam.Uuid])
          .subscribe((preference) => {
            this.preFilter = preference.filters;

            // Application des préférences de grouping des colonnes
            if (preference.options && preference.options['grouping']) {
              this.groupingColumns = preference.options['grouping'] as GroupingColumn[];
            }

            // Application des préférences de sélection et d'ordre des colonnes
            if (preference.options && preference.options['displayOrder']) {
              this.displayedOrderedColumns = preference.options['displayOrder'] as DisplayedOrderedColumn[];
              this._applyOrderAndFilter()
            }

            this.alertService.openInfo(
              `Application du filtre ${preference.name}`
            );
          });
      }
    });

    this.route.data
      .pipe(delay(0))
      .subscribe((data: Data) => {

        let response = data as { mb_parsed_params: MarqueBlancheParsedParamsResolverModel }

        let mb_has_params = response.mb_parsed_params?.data?.has_marqueblanche_params;
        let mb_group_by = response.mb_parsed_params?.data?.group_by;
        let mb_fullscreen = response.mb_parsed_params?.data?.fullscreen;

        if (!mb_has_params)
          return;

        if (mb_group_by && mb_group_by?.length > 0) {
          this._logger.debug(`Reception du paramètre group_by de la marque blanche, application des groupes: ${mb_group_by}`);
          this.groupingColumns = mb_group_by;
        }

        if (mb_fullscreen) this.toggle_grid_fullscreen();
      });

    this.auditService.getLastDateUpdateData().subscribe((response) => {
      if (response.date) {
        this.lastImportDate = response.date;
      }
    });
  }

  openGroupConfigDialog() {
    let dialogRef = this.dialog.open(GroupingConfigDialogComponent, {
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

  openSortColumnsDialog() {
    let dialogRef = this.dialog.open(StructureColumnsDialogComponent, {
      data: {
        defaultOrder: this.defaultOrder,
        columns: this.columnsMetaData.data,
        displayedOrderedColumns: this.displayedOrderedColumns,
      },
      width: '40rem',
      autoFocus: 'input',
    });
    dialogRef
      .afterClosed()
      .subscribe((updatedColumns: DisplayedOrderedColumn[]) => {
        if (updatedColumns) {
          this.displayedOrderedColumns = updatedColumns;
          this._applyOrderAndFilter()
        }
      });
  }

  public openSaveFilterDialog(): void {
    if (this.newFilter) {
      this.newFilter.options = { grouping: this.groupingColumns };
      if (this.displayedOrderedColumns.length) {
        this.newFilter.options['displayOrder'] = this.displayedOrderedColumns;
      }
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

  onRowClick(row: RowData) {
    this.dialog.open(InformationsSupplementairesDialogComponent, {
      width: '100%',
      maxHeight: '100vh',
      data: { row },
    });
  }

  displayTag(tag: Tag) {
    return tag_str(tag);
  }

  /**
   * Changement de l'ordre des colonnes et de leur statut displayed
   */
  private _applyOrderAndFilter(): void {
    let newColumns: ColumnMetaDataDef[] = this.columnsMetaData.data
    // On ordonne les colonnes
    newColumns = newColumns.sort((col1, col2) => {
      let index1 = this.displayedOrderedColumns.findIndex((col) => col.columnLabel === col1.label)
      let index2 = this.displayedOrderedColumns.findIndex((col) => col.columnLabel === col2.label)
      return index1 - index2;
    });
    // On set le champ displayed des colonnes
    newColumns.map((col) => {
      let displayed: boolean|undefined = this.displayedOrderedColumns.find(hiddenCol => hiddenCol.columnLabel === col.label)?.displayed
      col.displayed = displayed
    });
    // On réinstancie la variable pour la détection du ngOnChanges
    this.columnsMetaData = new ColumnsMetaData(newColumns);
  }

}
