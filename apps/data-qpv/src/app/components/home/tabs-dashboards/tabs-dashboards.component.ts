import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FinancialDataModel } from '../../../models/financial/financial-data.models';
import { DsfrTabsComponent, DsfrTabComponent } from "@edugouvfr/ngx-dsfr";
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchDataService } from '../../../services/search-data.service';
import { NavigationService } from '../../../services/navigation.service';
import { SearchParamsService } from '../../../services/search-params.service';
import { BopModel } from '@models/refs/bop.models';
import { DashboardData, DashboardResponse, LignesFinancieres, LignesResponse } from 'apps/clients/v3/data-qpv';


@Component({
    selector: 'data-qpv-tabs-dashboards',
    templateUrl: './tabs-dashboards.component.html',
    styleUrls: ['./tabs-dashboards.component.scss'],
    providers: [],
    imports: [DsfrTabsComponent, DsfrTabComponent, DashboardComponent],
})
export class TabDashboardsComponent {

  private _searchParamsService = inject(SearchParamsService);
  private _searchDataService = inject(SearchDataService);
  private _navigationService = inject(NavigationService);

  private _fullViewport: boolean = false

  private searchParams = computed(() => this._searchDataService.searchParams());
  private searchResults = computed(() => this._searchDataService.searchResults());
  
  public selectedDashboard = computed(() => this._navigationService.selectedDashboard());

  private _tabs: Record<string, number> = {
    "dashboard-147": 0,
    "dashboard-autres": 1,
    "dashboard-tous": 2,
  }
  
  public setSelectedDashboard(event: any) {
    this._navigationService.selectedDashboard.set(this._tabs[event])
  }

}
