import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QpvSearchArgs } from '../../models/qpv-search/qpv-search.models';
import { FinancialDataModel } from '../../models/financial/financial-data.models';

@Component({
  selector: 'data-qpv-tabs-superset-iframes',
  templateUrl: './tabs-superset-iframes.component.html',
  styleUrls: ['./tabs-superset-iframes.component.scss'],
  providers: []
})
export class TabsSupersetIframesComponent {

  private _selectedTabIndex: number = 0
  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }
  @Input()
  set selectedTabIndex(selectedTabIndex: number) {
    this._selectedTabIndex = selectedTabIndex;
    this.selectedTabIndexChange.emit(this._selectedTabIndex);
  }
  @Output() selectedTabIndexChange = new EventEmitter<number>();

  private _tabs: any = {
    "tab-iframe-1": 0,
    "tab-iframe-2": 1,
    "tab-iframe-3": 2,
  }
  public emitSelectedTab(event: any) {
    this.selectedTabIndexChange.emit(this._tabs[event]);
  }


  private _tabsAriaLabel: string = "Système d'onglets pour les graphiques des crédits"
  private _fullViewport: boolean = false


  private _searchArgs: QpvSearchArgs | null = null;
  get searchArgs(): QpvSearchArgs | null {
    return this._searchArgs;
  }
  @Input()
  set searchArgs(data: QpvSearchArgs | null) {
    this._searchArgs = data;
    this.searchArgsFilterChange.emit(this._searchArgs);
  }
  @Output() searchArgsFilterChange = new EventEmitter<QpvSearchArgs | null>();


  
  private _searchResults: FinancialDataModel[] | null = [];

  get searchResults(): FinancialDataModel[] | null {
    return this._searchResults;
  }
  @Input()
  set searchResults(data: FinancialDataModel[] | null) {
    this._searchResults = data;
    this.searchResultsChange.emit(this._searchResults);
  }
  @Output() searchResultsChange = new EventEmitter<FinancialDataModel[] | null>();

  get tabsAriaLabel() {
    return this._tabsAriaLabel
  }

  get fullViewport() {
    return this._fullViewport
  }

}
