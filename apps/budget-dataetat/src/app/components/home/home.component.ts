import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { SearchFormComponent } from './search-form-backup/search-form.component';
import { TableToolbarComponent } from './table-toolbar/table-toolbar.component';
import { DisplayDateComponent } from 'apps/common-lib/src/lib/components/display-date/display-date.component';
import { GroupsTableComponent } from './groups-table/groups-table.component';
import { LinesTableComponent } from './lines-tables/lines-table.component';
import { ActivatedRoute } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from '../../models/financial/financial-data-resolvers.models';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { PreFilters } from '../../models/search/prefilters.model';
import { CommonModule } from '@angular/common';
import { SearchDataComponent } from './search-data/search-data.component';
import { ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { ColonnesService } from '@services/colonnes.service';

@Component({
  selector: 'budget-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, SearchDataComponent, TableToolbarComponent, GroupsTableComponent, LinesTableComponent, DisplayDateComponent],
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _colonnesService = inject(ColonnesService);

  private _grouped: boolean = false
  
  get grouped(): boolean {
    return this._colonnesService.getGrouped()
  }

  newFilter?: Preference;
  preFilter?: PreFilters;
  
  lastImportDate: string | null = null;

  tableData?: TableData;
  virtualGroupFn?: (_: TableData) => VirtualGroup;

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  toggleGridFullscreen() {
    this._gridFullscreen.fullscreen = !this.grid_fullscreen;
  }

  get fullscreen_label() {
    if (!this.grid_fullscreen) return 'Agrandir le tableau';
    else return 'Rétrécir le tableau';
  }

  ngOnInit() {
    
  }

  
  financial?: FinancialData;

  constructor(private route: ActivatedRoute) {
    const resolved = this.route.snapshot.data['financial'] as FinancialDataResolverModel;
    const resolvedColonnes = this.route.snapshot.data['colonnes'] as ColonnesResolvedModel;
    console.log(resolved?.data?.themes)
    console.log(resolvedColonnes?.data?.colonnesTable)
    this.financial = resolved?.data;
    
    this._colonnesService.setAllColonnesTable(resolvedColonnes?.data?.colonnesTable ?? [])
    this._colonnesService.setAllColonnesGrouping(resolvedColonnes?.data?.colonnesGrouping ?? [])
  }

  //  openGroupConfigDialog() {
  //   const dialogRef = this.dialog.open(GroupingConfigDialogComponent, {
  //     data: {
  //       columns: this.columnsMetaData.data,
  //       groupingColumns: this.groupingColumns,
  //       groupingOrder: groupingOrder
  //     },
  //     width: '40rem',
  //     autoFocus: 'input'
  //   });
  //   dialogRef.afterClosed().subscribe((updatedGroupingColumns: GroupingColumn[]) => {
  //     if (updatedGroupingColumns) {
  //       this.groupingColumns = updatedGroupingColumns;
  //     }
  //   });
  // }

  // openSortColumnsDialog() {
  //   const dialogRef = this.dialog.open(StructureColumnsDialogComponent, {
  //     data: {
  //       defaultOrder: this.defaultOrder,
  //       columns: this.columnsMetaData.data,
  //       displayedOrderedColumns: this.displayedOrderedColumns
  //     },
  //     width: '40rem',
  //     autoFocus: 'input'
  //   });
  //   dialogRef.afterClosed().subscribe((updatedColumns: DisplayedOrderedColumn[]) => {
  //     if (updatedColumns) {
  //       this.displayedOrderedColumns = updatedColumns;
  //       this._applyOrderAndFilter();
  //     }
  //   });
  // }

  // public openSaveFilterDialog(): void {
  //   if (this.newFilter) {
  //     this.newFilter.options = { grouping: this.groupingColumns };
  //     if (this.displayedOrderedColumns.length) {
  //       this.newFilter.options['displayOrder'] = this.displayedOrderedColumns;
  //     }
  //     this.newFilter.name = '';
  //   }

  //   const dialogRef = this.dialog.open(SavePreferenceDialogComponent, {
  //     data: this.newFilter,
  //     width: '40rem',
  //     autoFocus: 'input'
  //   });

  //   dialogRef.afterClosed().subscribe((_) => { });
  // }

}
