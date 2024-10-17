import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { QpvSearchArgs } from "../../models/qpv-search/qpv-search.models";
import { FinancialDataModel } from "../../models/financial/financial-data.models";
import { DsfrOption, DsfrTableComponent, DsfrTableState } from "@edugouvfr/ngx-dsfr";


@Component({
  selector: 'tabs-map-table',
  templateUrl: './tabs-map-table.component.html',
  styleUrls: ['./tabs-map-table.component.scss'],
})
export class TabsMapTableComponent {

  private _selectedTabIndex = 0
  private _tabsAriaLabel = "Système d'onglets pour l'affichage des données (tableau et cartographie)"
  private _fullViewport = false

  private _searchResults: FinancialDataModel[] | null = [];

  public mappedResults: any[] = []

  @ViewChild('datatable') datatable?: DsfrTableComponent;

  public rowsPerPageOptions: DsfrOption[] = []

  @Input()
  public bops: string = ""

  public initialState: DsfrTableState = {
    page: 1,
    rowsPerPage: 20,
    sort: null
}


  get searchResults() {
    return this._searchResults;
  }
  @Input()
  set searchResults(results: FinancialDataModel[] | null) {
    results?.forEach(f => {
      if (this.bops === "147" && f.programme?.code !== "147")
        return;
      if (this.bops === "-147" && f.programme?.code === "147")
        return;

      this.mappedResults.push({
        "id": f.id,
        "siret.nom_beneficiaire": f.siret?.nom_beneficiaire,
        "libelle": f.programme?.label,
        "montant_ae": f.montant_ae,
        "annee": f.annee,
        "centre_couts.code": f.centre_couts?.code,
        "commune.label_region": f.commune?.label_region,
        "commune.label_departement": f.commune?.label_departement,
        "commune.label": f.commune?.label,
      })
    })
    this.datatable?.getService().refreshData(this.mappedResults);
  }

  public columns = [
    {label: 'Nom du porteur de projet', field: 'siret.nom_beneficiaire', sortable: false},
    {label: 'Libellé', field: 'siret.nom_beneficiaire', sortable: false},
    {label: 'Montant (AE)', field: 'montant_ae', sortable: false},
    {label: 'Année', field: 'annee'},
    {label: 'Financeur', field: 'centre_couts.code'},
    {label: 'Région', field: 'commune.label_region'},
    {label: 'Département', field: 'commune.label_departement'},
    {label: 'Commune', field: 'commune.label'},
  ]

  public data: any[] = []


  private _searchArgs: QpvSearchArgs | null = null;

  get searchArgs(): QpvSearchArgs | null {
    return this._searchArgs;
  }
  @Input()
  set searchArgs(data: QpvSearchArgs | null) {
    this._searchArgs = data;
    this.searchArgsChange.emit(this._searchArgs);
  }
  @Output() searchArgsChange = new EventEmitter<QpvSearchArgs | null>();

  get selectedTabIndex() {
    return this._selectedTabIndex
  }

  get tabsAriaLabel() {
    return this._tabsAriaLabel
  }

  get fullViewport() {
    return this._fullViewport
  }

}
