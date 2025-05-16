import { Component, effect, EventEmitter, input, Input, Output, signal, ViewChild } from "@angular/core";
import { QpvSearchArgs } from "../../models/qpv-search/qpv-search.models";
import { FinancialDataModel } from "../../models/financial/financial-data.models";
import { DsfrOption, DsfrTableComponent, DsfrTableState } from "@edugouvfr/ngx-dsfr";


@Component({
    selector: 'data-qpv-tabs-map-table',
    templateUrl: './tabs-map-table.component.html',
    styleUrls: ['./tabs-map-table.component.scss'],
    standalone: false
})
export class TabsMapTableComponent {

  private _selectedTabIndex = 0
  private _tabsAriaLabel = "Système d'onglets pour l'affichage des données (tableau et cartographie)"
  private _fullViewport = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public mappedResults = signal<any[]>([])

  @ViewChild('datatable') datatable?: DsfrTableComponent;

  public rowsPerPageOptions: DsfrOption[] = [ { label: '10 lignes par page ', value: 10 }, { label: '20 lignes par page', value: 20 } ]


  @Input()
  public bops: string = ""

  public initialState: DsfrTableState = {
    page: 1,
    rowsPerPage: 20,
    sort: null
  }

  private _selectedTabIndexCredits: number = 0
  get selectedTabIndexCredits() {
    return this._selectedTabIndexCredits
  }
  @Input()
  set selectedTabIndexCredits(selectedTabIndexCredits: number) {
    this._selectedTabIndexCredits = selectedTabIndexCredits
    this.dataLoaded = false;
    this._refreshDatatable(this.searchResults())
    setTimeout(() => { this.dataLoaded = true; }, 1000);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public mappingTabsBops: any = {
    0: "p147",
    1: "commun",
    2: null
  }

  public dataLoaded: boolean = false;

  public readonly searchResults = input<FinancialDataModel[] | null>(null);


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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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


   constructor() {
    // Réagit automatiquement à chaque changement de `results`
    effect(() => {
      const results = this.searchResults() || [];

      this._refreshDatatable(results);
    });
  }


  private _refreshDatatable(results : FinancialDataModel[] | null ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedResults : any[] = []
    results?.forEach(f => {
      if (this.mappingTabsBops[this.selectedTabIndexCredits] === "p147" && f.programme?.code !== "147")
        return;
      if (this.mappingTabsBops[this.selectedTabIndexCredits] === "commun" && f.programme?.code === "147")
        return;
      mappedResults.push({
        "id": f.id,
        "siret.nom_beneficiaire": f.siret?.nom_beneficiaire,
        "siret.code": f.siret?.code,
        "montant_ae": f.montant_ae,
        "annee": f.annee,
        "centre_couts.code": f.centre_couts?.code,
        "thematique.libelle": f.programme?.theme,
        "programme.code": f.programme?.label,
        "qpv.code": f.siret?.code_qpv24,
        "lieu_action.code_qpv": f.lieu_action?.code_qpv,
        "lieu_action.label_qpv": f.lieu_action?.label_qpv,
        "centre_couts.description": f.centre_couts?.description,
        "commune.label": f.commune?.label,
        "commune.label_departement": f.commune?.label_departement,
        "commune.label_region": f.commune?.label_region,
      })
    })
    this.mappedResults.set(mappedResults);
    this.datatable?.getService().refreshData(this.mappedResults());
  }

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
