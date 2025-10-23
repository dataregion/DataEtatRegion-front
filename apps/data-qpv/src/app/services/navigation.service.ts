/**
 * Service centralisé pour la gestion de la recherche et des résultats financiers.
 * Expose l'état via des BehaviorSubject/Observable et propose des méthodes utilitaires pour la transformation des données.
 */
import { inject, Injectable, signal } from '@angular/core';
import { combineLatest, forkJoin, Observable, of, tap } from 'rxjs';
import { SearchParameters } from './search-params.service';
import { FinancialDataModel } from '../models/financial/financial-data.models';
import { SearchDataMapper } from './search-data-mapper.service';
import { SearchParamsService } from './search-params.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { DashboardData, DashboardResponse, DashboardsService, LignesFinancieres, LignesFinancieresService, LignesResponse, PaginationMeta } from 'apps/clients/v3/data-qpv';
import { SearchDataService } from './search-data.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { BopModel } from '../models/refs/bop.models';


export type SearchResults = FinancialDataModel[]

interface TabData {
  codeProgramme: string | undefined;
  notCodeProgramme: string | undefined;
  dashboardData: DashboardData | undefined;
  lignesData: LignesFinancieres | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private _searchDataService = inject(SearchDataService)

  private _tabsData: Record<number, TabData> = {
    0: {
      "codeProgramme": "147",
      "notCodeProgramme": undefined,
      "dashboardData": undefined,
      "lignesData": undefined
    } as TabData,
    1: {
      "codeProgramme": undefined,
      "notCodeProgramme": "147",
      "dashboardData": undefined,
      "lignesData": undefined
    } as TabData,
    2: {
      "codeProgramme": undefined,
      "notCodeProgramme": undefined,
      "dashboardData": undefined,
      "lignesData": undefined
    } as TabData,
  }

  get currentTab() {
    return this._tabsData[this.selectedDashboard()]
  }

  /**
   * Indique si la recherche est terminée.
   */
  public readonly selectedDashboard = signal<number>(-1);

  constructor() {
    toObservable(this.selectedDashboard).subscribe(selected => {
      const searchParams = this._searchDataService.searchParams()
      console.log(searchParams)
      if (this._tabsData[selected].dashboardData === undefined && this._tabsData[selected].lignesData === undefined) {
        if (searchParams) {
          // Paramètres cachés des onglets
          searchParams.bops = [{"code": this._tabsData[selected].codeProgramme} as BopModel]
          searchParams.notBops = [{"code": this._tabsData[selected].notCodeProgramme} as BopModel]
          // Recherche en cours
          this._searchDataService.searchTabInProgress.set(true);
          this._searchDataService.search(searchParams).subscribe((response: { lignes: LignesResponse; dashboard: DashboardResponse }) => {
            this._tabsData[selected].dashboardData = response.dashboard.data ?? undefined
            this._tabsData[selected].lignesData = response.lignes.data ?? undefined
            setTimeout(() => {
              console.log("set timeout")
              this._searchDataService.searchFormInProgress.set(false);
              this._searchDataService.searchTabInProgress.set(false);
            }, 5000)
          })
        }
      }
    })
  }

}
