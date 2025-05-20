import { Component, computed, OnInit, Signal, signal, ViewChild } from '@angular/core';

import { PreferenceUsersHttpService } from 'apps/preference-users/src/public-api';
import { ActivatedRoute, Data } from '@angular/router';
import { AlertService } from 'apps/common-lib/src/public-api';
import { MarqueBlancheParsedParamsResolverModel } from '../../resolvers/marqueblanche-parsed-params.resolver';
import { BehaviorSubject, delay } from 'rxjs';
import { PreFilters } from 'apps/data-qpv/src/app/models/search/prefilters.model';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { SearchDataComponent } from 'apps/data-qpv/src/app/components/search-data/search-data.component';
import { QpvSearchArgs } from "apps/data-qpv/src/app/models/qpv-search/qpv-search.models";
import { FinancialDataModel } from '../../models/financial/financial-data.models';
import { FinancialData, FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import { RefQpvWithCommune } from '../../models/refs/qpv.model';

@Component({
    selector: 'data-qpv-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {

  currentSearchArgs: QpvSearchArgs | null = null;

  qpvSelected: RefQpvWithCommune[] = [];

  @ViewChild(SearchDataComponent) searchData!: SearchDataComponent;

  public selectedTabIndex: number = 0;
  public searchFinish: boolean = false;
  public searchInProgress: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _currentSearchResults = signal<FinancialDataModel[] | null>(null);


  currentSearchResults = computed(() => this._currentSearchResults());

  hasResults: Signal<boolean> = computed(() => {
    const result =  this._currentSearchResults() ;
    return  result !==null &&  result.length > 0;
  });

  hasEmptyResults: Signal<boolean> = computed(() => {
    const result =  this._currentSearchResults() ;
    return  result !==null &&  result.length === 0;
  });

  /**
   * Filtre à appliquer sur la recherche
   */
  preFilter?: PreFilters;

  public current_years : number[] = [];
  public current_qpv_codes : string[] = [];
  public financialData: FinancialData | undefined;

  constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _preferenceService: PreferenceUsersHttpService,
  ) {
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
        const response = data as { mb_parsed_params: MarqueBlancheParsedParamsResolverModel, financial: FinancialDataResolverModel }

        const mb_has_params = response.mb_parsed_params?.data?.has_marqueblanche_params;

        this.financialData = response.financial.data;

        if (!mb_has_params)
          return;
      });
  }

    public isSearchOver() {
    return !this.searchInProgress.value
  }

  public isSearchArgsEmpty() {
    return this.currentSearchArgs === null ||
          (
            (this.currentSearchArgs.annees === null || this.currentSearchArgs.annees.length === 0) &&
            (this.currentSearchArgs.niveau === null) &&
            (this.currentSearchArgs.localisations === null || this.currentSearchArgs.localisations.length === 0) &&
            (this.currentSearchArgs.qpv_codes === null || this.currentSearchArgs.qpv_codes.length === 0) &&
            (this.currentSearchArgs.financeurs === null || this.currentSearchArgs.financeurs.length === 0) &&
            (this.currentSearchArgs.thematiques === null || this.currentSearchArgs.thematiques.length === 0) &&
            (this.currentSearchArgs.porteurs === null || this.currentSearchArgs.porteurs.length === 0) &&
            (this.currentSearchArgs.types_porteur === null || this.currentSearchArgs.types_porteur.length === 0)
          ) 
  }

  public onSearchResult(data : FinancialDataModel[] | null ) {
    this._currentSearchResults.set(data);
  }

 
  public searchArgsToText(): string {
    let text = ""
    if (this.currentSearchArgs === null)
      return "";
    if (this.currentSearchArgs.niveau !== null && this.currentSearchArgs.localisations && this.currentSearchArgs.localisations.length !== 0)
      text += this.currentSearchArgs.niveau + " : " + this.currentSearchArgs.localisations?.map(l => l.code + " - " + l.nom).join(",")
    if (this.currentSearchArgs.qpv_codes !== null && this.currentSearchArgs.qpv_codes.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "QPV : " + this.currentSearchArgs.qpv_codes?.map(q => q.code + " - " + q.label).join(",")
    if (this.currentSearchArgs.annees !== null && this.currentSearchArgs.annees.length !== 0)
      text += (text.length !== 0 ? " ; " : "") + "Années : " + this.currentSearchArgs.annees?.join(",")
    return text
  }

}
