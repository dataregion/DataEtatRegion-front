import { Component, inject, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import {
  PreferenceUsersHttpService,
  SavePreferenceDialogComponent,
} from 'apps/preference-users/src/public-api';
import {
  Preference,
} from 'apps/preference-users/src/lib/models/preference.models';
import { ActivatedRoute, Data } from '@angular/router';
import { AlertService, GeoModel } from 'apps/common-lib/src/public-api';
import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  DisplayedOrderedColumn,
  GroupingColumn,
  RowData,
  TableData,
  ParameterizedColumnsMetaData,
  ColumnsMetaData,
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { AuditHttpService } from '@services/http/audit.service';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { NGXLogger } from 'ngx-logger';
import { delay } from 'rxjs';
import { PreFilters } from 'apps/data-qpv/src/app/models/search/prefilters.model';
import { colonnes, FinancialColumnMetaDataDef, groupingOrder } from '@models/tableau/colonnes.model';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { SearchDataComponent } from 'apps/data-qpv/src/app/components/search-data/search-data.component';
import { BudgetService } from 'apps/data-qpv/src/app/services/budget.service';
import { DatePipe } from '@angular/common';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import {QpvSearchArgs} from "apps/data-qpv/src/app/models/qpv-search/qpv-search.models";

@Component({
  selector: 'data-qpv-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private dialog = inject(MatDialog);

  columnsMetaData: ParameterizedColumnsMetaData<FinancialColumnMetaDataDef>;
  get genericColumnsMetadata(): ColumnsMetaData {
    return this.columnsMetaData as ColumnsMetaData;
  }

  currentSearchFilter?: QpvSearchArgs;

  @ViewChild(SearchDataComponent) searchData!: SearchDataComponent;

  /**
   * Filtre retourner par le formulaire de recherche
   */
  newFilter?: Preference;

  /**
   * Filtre à appliquer sur la recherche
   */
  preFilter?: PreFilters;

  public current_years : number[] = [];
  public current_qpv_codes : string[] = [];


  lastImportDate: string | null = null;

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
    private _datePipe: DatePipe,
  ) {
    this.columnsMetaData = new ParameterizedColumnsMetaData<FinancialColumnMetaDataDef>(colonnes);
    this.preFilter = undefined;
  }

  ngOnInit() {
    this._route.queryParams.subscribe((param) => {
      // Si une recherche doit être appliquée
      if (param[QueryParam.Uuid]) {
        this._preferenceService
          .getPreference(param[QueryParam.Uuid])
          .subscribe((preference) => {
            this.preFilter = preference.filters;
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

        if (mb_fullscreen) this.toggle_grid_fullscreen();
      });

    this._auditService.getLastDateUpdateData().subscribe((response) => {
      if (response.date) {
        this.lastImportDate = response.date;
      }
    });
  }

  public openSaveFilterDialog(): void {
    if (this.newFilter) {
      this.newFilter.name = '';
    }

    const dialogRef = this.dialog.open(SavePreferenceDialogComponent, {
      data: this.newFilter,
      width: '40rem',
      autoFocus: 'input',
    });

    dialogRef.afterClosed().subscribe((_) => { });
  }

}
