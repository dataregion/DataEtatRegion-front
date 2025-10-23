import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, CUSTOM_ELEMENTS_SCHEMA, ViewChild, AfterViewInit, ElementRef, computed, signal } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import {SettingsService} from "../../../../../environments/settings.service";
import {Superset} from "../../../../../../../common-lib/src/lib/environments/settings";
import { SearchDataService } from 'apps/data-qpv/src/app/services/search-data.service';
import { CurrencyPipe, JsonPipe } from '@angular/common';
import { ChartData, DashboardData } from 'apps/clients/v3/data-qpv';
import { SpinnerComponent } from 'apps/common-lib/src/lib/components/spinner/spinner.component';
import { NavigationService } from 'apps/data-qpv/src/app/services/navigation.service';
import { toObservable } from '@angular/core/rxjs-interop';


@Component({
    selector: 'data-qpv-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [CurrencyPipe, JsonPipe, SpinnerComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent {

  private _searchDataService = inject(SearchDataService);
  private _navigationService = inject(NavigationService);

  readonly searchTabInProgress = computed(() => this._searchDataService.searchTabInProgress());

  currentDashboardData = signal<DashboardData | undefined>(undefined);

  constructor() {
    toObservable(this._searchDataService.searchTabInProgress).subscribe(response => {
      console.log("saw changes : " + response)
      if (!response) {
        console.log()
        this.currentDashboardData.set(this._navigationService.currentTab.dashboardData)
        console.log(this.currentDashboardData()?.line_chart_annees)
      } else {
        this.currentDashboardData.set(undefined)
        console.log(this.currentDashboardData())
      }
    })
  }

  isArrayFilled(arr: Array<any> | undefined) {
    return arr !== undefined && arr.length > 0
  }
  
}
