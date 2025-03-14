import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import {
  PreferenceUsersHttpService,
  SavePreferenceDialogComponent
} from 'apps/preference-users/src/public-api';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { ActivatedRoute, Data } from '@angular/router';
import { AlertService, GeoModel } from 'apps/common-lib/src/public-api';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  ColumnsMetaData,
  DisplayedOrderedColumn,
  GroupingColumn,
  ParameterizedColumnsMetaData,
  RowData,
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { GroupingConfigDialogComponent } from 'apps/grouping-table/src/lib/components/grouping-config-dialog/grouping-config-dialog.component';
import { StructureColumnsDialogComponent } from 'apps/grouping-table/src/lib/components/structure-columns-dialog/structure-columns-dialog.component';
import { InformationsSupplementairesDialogComponent } from '../../modules/informations-supplementaires/informations-supplementaires-dialog/informations-supplementaires-dialog.component';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { NGXLogger } from 'ngx-logger';
import { delay } from 'rxjs';
import { PreFilters } from '@models/search/prefilters.model';
import {
  colonnes,
  FinancialColumnMetaDataDef,
  groupingOrder
} from '@models/tableau/colonnes.model';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { Tag } from '@models/refs/tag.model';
import { SearchDataComponent } from 'apps/financial-data/src/app/components/search-data/search-data.component';
import { BudgetService } from '@services/budget.service';
import { DatePipe } from '@angular/common';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';

@Component({
    selector: 'financial-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  private dialog = inject(MatDialog);

  columnsMetaData: ParameterizedColumnsMetaData<FinancialColumnMetaDataDef>;

  get genericColumnsMetadata(): ColumnsMetaData {
    return this.columnsMetaData as ColumnsMetaData;
  }

  tableData?: TableData;
  virtualGroupFn?: (_: TableData) => VirtualGroup;

  @ViewChild(SearchDataComponent) searchData!: SearchDataComponent;

  /**
   * Filtre retourner par le formulaire de recherche
   */
  newFilter?: Preference;

  /**
   * Filtre à appliquer sur la recherche
   */
  preFilter?: PreFilters;

  lastImportDate: string | null = null;

  groupingColumns: GroupingColumn[];

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
    private _budgetService: BudgetService,
    private _exportDataService: ExportDataService,
    private _datePipe: DatePipe
  ) {
    // Récupération de l'ordre des colonnes par défaut
    this.defaultOrder = this._getDefaultOrder();
    // Ordre et affichage de base des colonnes
    this.displayedOrderedColumns = this._getDefaultOrder();
    this.groupingColumns = this._getDefaultOrderGrouping();
    
    this.virtualGroupFn = (tableData: TableData) => {
      const initial: number[] = [0, 0]
      const [sum_ae, sum_cp] = tableData.reduce((acc: number[], curr, _0, _1) => {
        const [sum_ae, sum_cp] = acc
        const n = [sum_ae + curr['montant_ae'], sum_cp + curr['montant_cp']];
        return n
      }, initial)
      const vg = new VirtualGroup("Total", tableData.length, { "montant_ae": sum_ae, "montant_cp": sum_cp })
      return vg
    }

    this.columnsMetaData = new ParameterizedColumnsMetaData<FinancialColumnMetaDataDef>(colonnes);
    this.preFilter = undefined;
  }

  ngOnInit() {
    this._route.queryParams.subscribe((param) => {
      // Si une recherche doit être appliquée
      if (param[QueryParam.Uuid]) {
        this._preferenceService.getPreference(param[QueryParam.Uuid]).subscribe((preference) => {
          this.preFilter = preference.filters;

          // Application des préférences de grouping des colonnes
          if (preference.options && preference.options['grouping']) {
            this.groupingColumns = preference.options['grouping'] as GroupingColumn[];
          }

          // Application des préférences d'ordre et d'affichage des colonnes
          if (preference.options && preference.options['displayOrder']) {
            this.displayedOrderedColumns = preference.options[
              'displayOrder'
            ] as DisplayedOrderedColumn[];
            this._applyOrderAndFilter();
          }

          this._alertService.openInfo(`Application du filtre ${preference.name}`);
        });
      }
    });

    this._route.data.pipe(delay(0)).subscribe((data: Data) => {
      const response = data as { mb_parsed_params: MarqueBlancheParsedParamsResolverModel };

      const mb_has_params = response.mb_parsed_params?.data?.has_marqueblanche_params;
      const mb_group_by = response.mb_parsed_params?.data?.group_by;
      const mb_fullscreen = response.mb_parsed_params?.data?.fullscreen;

      if (!mb_has_params) return;

      if (mb_group_by && mb_group_by?.length > 0) {
        this._logger.debug(
          `Reception du paramètre group_by de la marque blanche, application des groupes: ${mb_group_by}`
        );
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
        groupingOrder: groupingOrder
      },
      width: '40rem',
      autoFocus: 'input'
    });
    dialogRef.afterClosed().subscribe((updatedGroupingColumns: GroupingColumn[]) => {
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
        displayedOrderedColumns: this.displayedOrderedColumns
      },
      width: '40rem',
      autoFocus: 'input'
    });
    dialogRef.afterClosed().subscribe((updatedColumns: DisplayedOrderedColumn[]) => {
      if (updatedColumns) {
        this.displayedOrderedColumns = updatedColumns;
        this._applyOrderAndFilter();
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
      autoFocus: 'input'
    });

    dialogRef.afterClosed().subscribe((_) => {});
  }

  public downloadData(extension: string, allColumns: boolean): void {
    this.searchData.searchForm.markAllAsTouched(); // pour notifier les erreurs sur le formulaire
    if (this.searchData.searchForm.valid && !this.searchData.searchInProgress.value) {
      this.searchData.searchInProgress.next(true);
      const blob = this._exportDataService.getBlob(
        this.searchData.searchResult() ?? [],
        extension,
        !allColumns ? this.displayedOrderedColumns : null
      );
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
    if (formValue.location) {
      const locations = formValue.location as GeoModel[];
      filename += '_' + locations[0].type?.toLowerCase() + '-';
      filename += locations
        .filter((loc) => loc.code)
        .map((loc) => loc.code)
        .join('-');
    }

    if (formValue.bops) {
      const bops = formValue.bops;
      filename +=
        '_bops-' +
        bops
          .filter((bop) => bop.code)
          .map((bop) => bop.code)
          .join('-');
    }

    return filename + '.' + extension;
  }

  onRowClick(row: RowData) {
    this.dialog.open(InformationsSupplementairesDialogComponent, {
      width: '100%',
      maxHeight: '100vh',
      data: { row }
    });
  }

  displayTag(tag: Tag) {
    return tag.display_name;
  }

  /**
   * Changement de l'ordre des colonnes et de leur statut displayed
   */
  private _applyOrderAndFilter(): void {
    let newColumns: FinancialColumnMetaDataDef[] = this.columnsMetaData.data;
    // Récupération des colonnes non présentes dans le filtre pour les gérer correctement
    const columnsToAdd = newColumns
      .map((c1) => c1.label)
      .filter((l) => !this.displayedOrderedColumns.map((c2) => c2.columnLabel).includes(l));
    columnsToAdd.forEach((col) => {
      this.displayedOrderedColumns.push({ columnLabel: col, displayed: false });
    });
    // On ordonne les colonnes
    newColumns = newColumns.sort((col1, col2) => {
      const index1 = this.displayedOrderedColumns.findIndex(
        (col) => col.columnLabel === col1.label
      );
      const index2 = this.displayedOrderedColumns.findIndex(
        (col) => col.columnLabel === col2.label
      );
      return index1 - index2;
    });
    // On set le champ displayed des colonnes
    newColumns.map((col) => {
      const displayed: boolean | undefined = this.displayedOrderedColumns.find(
        (hiddenCol) => hiddenCol.columnLabel === col.label
      )?.displayed;
      if (displayed !== undefined && !displayed) col.displayed = false;
      else delete col.displayed;
    });
    // On réinstancie la variable pour la détection du ngOnChanges
    this.columnsMetaData = new ParameterizedColumnsMetaData<FinancialColumnMetaDataDef>(newColumns);
  }

  private _getDefaultOrder(): DisplayedOrderedColumn[] {
    const displayed = colonnes.map((c) => {
      const col: DisplayedOrderedColumn = { columnLabel: c.label };
      if ('displayed' in c && !c.displayed) {
        col['displayed'] = false;
      }
      return col;
    });
    return displayed;
  }

  private _getDefaultOrderGrouping(): GroupingColumn[] {
    return colonnes
      .filter((c) => c.grouping != null && c.grouping)
      .sort((a, b) => {
        const a_n = a?.grouping_order ?? 0;
        const b_n = b?.grouping_order ?? 0;
        return a_n - b_n;
      })
      .map((c) => {
        const col: GroupingColumn = { columnName: c.name };
        return col;
      });
  }
}
