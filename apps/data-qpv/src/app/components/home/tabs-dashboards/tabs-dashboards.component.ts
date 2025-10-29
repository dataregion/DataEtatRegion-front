import { Component, computed, inject } from '@angular/core';
import { DsfrTabsComponent, DsfrTabComponent } from "@edugouvfr/ngx-dsfr";
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchDataService } from '../../../services/search-data.service';


@Component({
    selector: 'data-qpv-tabs-dashboards',
    templateUrl: './tabs-dashboards.component.html',
    styleUrls: ['./tabs-dashboards.component.scss'],
    providers: [],
    imports: [DsfrTabsComponent, DsfrTabComponent, DashboardComponent],
})
export class TabDashboardsComponent {

  private _searchDataService = inject(SearchDataService);

  public selectedTab = computed(() => this._searchDataService.selectedTab());

  private _tabs: Record<string, number> = {
    "dashboard-147": 0,
    "dashboard-autres": 1,
    "dashboard-tous": 2,
  }
  
  public setSelectedDashboard(event: string) {
    this._searchDataService.changeTab(this._tabs[event])
  }

}
