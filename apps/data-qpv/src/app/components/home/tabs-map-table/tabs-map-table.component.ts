import { Component, computed, effect, EventEmitter, inject, input, Input, Output, signal, ViewChild } from "@angular/core";
import { FinancialDataModel } from "../../../models/financial/financial-data.models";
import { DsfrOption, DsfrTableComponent, DsfrTableState, DsfrTabsComponent, DsfrTabComponent } from "@edugouvfr/ngx-dsfr";
import { RefQpvWithCommune } from "../../../models/refs/qpv.model";
import { MapComponent } from "./map/map.component";
import { SpinnerComponent } from "apps/common-lib/src/lib/components/spinner/spinner.component";
import { SearchDataService } from "../../../services/search-data.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { NavigationService } from "../../../services/navigation.service";

@Component({
    selector: 'data-qpv-tabs-map-table',
    templateUrl: './tabs-map-table.component.html',
    styleUrls: ['./tabs-map-table.component.scss'],
    imports: [DsfrTabsComponent, DsfrTabComponent, DsfrTableComponent, MapComponent, SpinnerComponent]
})
export class TabsMapTableComponent {

  private _searchDataService = inject(SearchDataService);
  private _navigationService = inject(NavigationService);

  private _selectedTabIndex = 0
  private _fullViewport = false

  readonly searchParams = computed(() => this._searchDataService.searchParams());
  readonly searchResults = computed(() => this._searchDataService.searchResults());
  readonly searchFormInProgress = computed(() => this._searchDataService.searchFormInProgress());
  readonly selectedDashboard = computed(() => this._navigationService.selectedDashboard());

  @ViewChild('datatable') datatable?: DsfrTableComponent;

  // public rowsPerPageOptions: DsfrOption[] = [ { label: '20 lignes par page', value: 20 } ]

  public initialState: DsfrTableState = {
    page: 1,
    rowsPerPage: 20,
    sort: null
  }

  // public readonly searchResults = input<FinancialDataModel[] | null>(null);
  // public readonly qpv =  input<RefQpvWithCommune[]>([]);


  public columns = [
    {label: 'Nom du porteur de projet', field: 'siret.nom_beneficiaire', sortable: false},
    {label: 'Montant (AE)', field: 'montant_ae', sortable: false},
    {label: 'Année', field: 'annee'},
    {label: 'Code Financeur', field: 'centre_couts.code'},
    {label: 'Financeur', field: 'centre_couts.description'},
    {label: 'Thématique associée', field: 'thematique.libelle'},
    {label: 'Nom du programme (BOP)', field: 'programme.code'},
    {label: 'Code QPV du lieu de l\'action', field: 'lieu_action.code_qpv'},
    {label: 'QPV du lieu de l\'action', field: 'lieu_action.label_qpv'},
    {label: 'Commune', field: 'commune.label'},
    {label: 'Département', field: 'commune.label_departement'},
  ]

   constructor() {
    // Réagit automatiquement à chaque changement de `results`
    toObservable(this.selectedDashboard)
      .pipe(takeUntilDestroyed())
      .subscribe((selectedDashboard) => {
        console.log("Selected dashboard : " + selectedDashboard)
      });
  }
  
  get selectedTabIndex() {
    return this._selectedTabIndex
  }

}
