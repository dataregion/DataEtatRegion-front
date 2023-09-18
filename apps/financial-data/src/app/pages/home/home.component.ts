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
  defaultOrder: DisplayedOrderedColumn[];

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
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _preferenceService: PreferenceUsersHttpService,
    private _auditService: AuditHttpService,
    private _gridFullscreen: GridInFullscreenStateService,
    private _logger: NGXLogger,
  ) {
    // Récupération de l'ordre des colonnes par défaut
    this.defaultOrder = colonnes.map(c => { 
      const col: DisplayedOrderedColumn = {columnLabel: c.label}
      if ('displayed' in c && !c.displayed) {
        col['displayed'] = false;
      }
      return col;
    });

    this.columnsMetaData = new ColumnsMetaData(colonnes);
    this.preFilter = undefined;
  }

  ngOnInit() {
    this._route.queryParams.subscribe((param) => {
      // Ordre et affichage de base des colonnes
      this.displayedOrderedColumns = this.defaultOrder;
      // Si une recherche doit être appliquée
      if (param[QueryParam.Uuid]) {
        this._preferenceService
          .getPreference(param[QueryParam.Uuid])
          .subscribe((preference) => {
            this.preFilter = preference.filters;

            // Application des préférences de grouping des colonnes
            if (preference.options && preference.options['grouping']) {
              this.groupingColumns = preference.options['grouping'] as GroupingColumn[];
            }

            // Application des préférences d'ordre et d'affichage des colonnes
            if (preference.options && preference.options['displayOrder']) {
              this.displayedOrderedColumns = preference.options['displayOrder'] as DisplayedOrderedColumn[];
              this._applyOrderAndFilter()
            }

            this._alertService.openInfo(
              `Application du filtre ${preference.name}`
            );
          });
      }
    });

    this._route.data
      .pipe(delay(0))
      .subscribe((data: Data) => {

        const response = data as { mb_parsed_params: MarqueBlancheParsedParamsResolverModel }

        const mb_has_params = response.mb_parsed_params?.data?.has_marqueblanche_params;
        const mb_group_by = response.mb_parsed_params?.data?.group_by;
        const mb_fullscreen = response.mb_parsed_params?.data?.fullscreen;

        if (!mb_has_params)
          return;

        if (mb_group_by && mb_group_by?.length > 0) {
          this._logger.debug(`Reception du paramètre group_by de la marque blanche, application des groupes: ${mb_group_by}`);
          this.groupingColumns = mb_group_by;
        }

        if (mb_fullscreen) this.toggle_grid_fullscreen();
      });

    this._auditService.getLastDateUpdateData().subscribe((response) => {
      if (response.date) {
        this.lastImportDate = response.date;
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

  openSortColumnsDialog() {
    const dialogRef = this.dialog.open(StructureColumnsDialogComponent, {
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
      const index1 = this.displayedOrderedColumns.findIndex((col) => col.columnLabel === col1.label)
      const index2 = this.displayedOrderedColumns.findIndex((col) => col.columnLabel === col2.label)
      return index1 - index2;
    });
    // On set le champ displayed des colonnes
    newColumns.map((col) => {
      const displayed: boolean|undefined = this.displayedOrderedColumns.find(hiddenCol => hiddenCol.columnLabel === col.label)?.displayed
      if (displayed !== undefined && !displayed)
        col.displayed = false
    });
    // On réinstancie la variable pour la détection du ngOnChanges
    this.columnsMetaData = new ColumnsMetaData(newColumns);
  }

}
