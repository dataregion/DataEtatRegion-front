import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import {
  PreferenceUsersHttpService,
  SavePreferenceDialogComponent,
} from 'apps/preference-users/src/public-api';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { ActivatedRoute } from '@angular/router';
import { AlertService, GeoModel } from 'apps/common-lib/src/public-api';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  ColumnsMetaData,
  DisplayedOrderedColumn,
  GroupingColumn,
  ParameterizedColumnsMetaData,
  TableData,
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { GroupingConfigDialogComponent } from 'apps/grouping-table/src/lib/components/grouping-config-dialog/grouping-config-dialog.component';
import { colonnes, groupingOrder, LaureatColumnMetaDataDef } from '../../models/tableau/colonnes.model';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { StructureColumnsDialogComponent } from 'apps/grouping-table/src/lib/components/structure-columns-dialog/structure-columns-dialog.component';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import { DatePipe } from '@angular/common';
import { SearchDataComponent } from '../../components/search-data.component';
import { SousAxePlanRelance } from '../../models/axe.models';
import { SlugifyPipe } from 'apps/common-lib/src/lib/pipes/slugify.pipe';

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
  
  @ViewChild(SearchDataComponent) searchData!: SearchDataComponent;

  /**
   * Ordre des colonnes par défaut
   */
   defaultOrder: DisplayedOrderedColumn[];

   /**
    * Statuts des colonnes (ordre et displayed)
    */
   displayedOrderedColumns: DisplayedOrderedColumn[] = [];
   
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
    private _gridFullscreen: GridInFullscreenStateService,
    private _exportDataService: ExportDataService,
    private _datePipe: DatePipe,
    private _slugifyPipe: SlugifyPipe,
  ) {
    // Récupération de l'ordre des colonnes par défaut
    this.defaultOrder = this._getDefaultOrder();
    // Ordre et affichage de base des colonnes
    this.displayedOrderedColumns = this._getDefaultOrder();
    this.groupingColumns = this._getDefaultOrderGrouping();
    
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
  }

  openGroupConfigDialog() {
    const dialogRef = this.dialog.open(GroupingConfigDialogComponent, {
      data: {
        columns: this.columnsMetaData.data,
        groupingColumns: this.groupingColumns,
        groupingOrder: groupingOrder
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
      this.newFilter.name = '';
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

  public downloadData(extension: string, allColumns: boolean): void {
    this.searchData.searchForm.markAllAsTouched(); // pour notifier les erreurs sur le formulaire
    if (this.searchData.searchForm.valid && !this.searchData.searchInProgress.value) {
      this.searchData.searchInProgress.next(true);
      const blob = this._exportDataService.getBlob(this.searchData._searchResults ?? [], extension,!allColumns ? this.displayedOrderedColumns : null);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this._filename(extension);
        document.body.appendChild(a);
        a.click();
        this.searchData.searchInProgress.next(false);
      }
    }
  }

  private _filename(extension: string): string {
    const formValue = this.searchData.searchForm.value;
    let filename = `${this._datePipe.transform(new Date(), 'yyyyMMdd')}_export`;
    
    if (formValue.location && formValue.location.length) {
      const locations = formValue.location as GeoModel[];
      filename += '_' + locations[0].type?.toLowerCase() + '-';
      filename += locations
        .filter((loc) => loc.code)
        .map((loc) => this._slugifyPipe.transform(loc.code))
        .join('-');
    }

    if (formValue.axe_plan_relance) {
      const axes = formValue.axe_plan_relance as SousAxePlanRelance[];
      filename += '_axes-'
      filename += axes
        .filter((a) => a.label)
        .map((a) => this._slugifyPipe.transform(a.label))
        .join('-');
    }

    return filename + "." + extension;
  }

  /**
   * Changement de l'ordre des colonnes et de leur statut displayed
   */
  private _applyOrderAndFilter(): void {
    let newColumns: LaureatColumnMetaDataDef[] = this.columnsMetaData.data
    // Récupération des colonnes non présentes dans le filtre pour les gérer correctement
    const columnsToAdd = newColumns.map(c1 => c1.label).filter(l => !this.displayedOrderedColumns.map(c2 => c2.columnLabel).includes(l));
    columnsToAdd.forEach((col) => {
      this.displayedOrderedColumns.push({"columnLabel": col, "displayed": false})
    });
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
      else
        delete col.displayed;
    });
    // On réinstancie la variable pour la détection du ngOnChanges
    this.columnsMetaData = new ParameterizedColumnsMetaData<LaureatColumnMetaDataDef>(newColumns);
  }

  private _getDefaultOrder(): DisplayedOrderedColumn[] {
    const displayed = colonnes.map(c => { 
      const col: DisplayedOrderedColumn = {columnLabel: c.label}
      if ('displayed' in c && !c.displayed) {
        col['displayed'] = false;
      }
      return col;
    });
    return displayed;
  }

  private _getDefaultOrderGrouping(): GroupingColumn[] {
    return colonnes.filter(c => c.grouping != null && c.grouping).map(c => {
      const col: GroupingColumn = {columnName: c.name}
      return col;
    });
  }
}
