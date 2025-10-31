import { Component, inject, signal } from '@angular/core';
import { SearchDataService } from 'apps/data-qpv/src/app/services/search-data.service';
import { CurrencyPipe } from '@angular/common';
import { ChartData, DashboardData } from 'apps/clients/v3/data-qpv';
import { SpinnerComponent } from 'apps/common-lib/src/lib/components/spinner/spinner.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { PieChartComponent } from "./pie-chart/pie-chart.component";
import { LineChartComponent } from "./line-chart/line-chart.component";
import { BarChartComponent } from "./bar-chart/bar-chart.component";


@Component({
    selector: 'data-qpv-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [CurrencyPipe, SpinnerComponent, PieChartComponent, LineChartComponent, BarChartComponent]
})
export class DashboardComponent {

  private _searchDataService = inject(SearchDataService);

  currentDashboardData = signal<DashboardData | null>(null);
  
  public readonly selectedTab = this._searchDataService.selectedTab;

  constructor() {
    toObservable(this._searchDataService.currentResults).subscribe(response => {
      this.currentDashboardData.set(response.dashboardData)
    })
  }

  isArrayFilled(arr: ChartData | null | undefined) {
    return arr && arr !== null && arr.labels.length > 0
  }
  
}
