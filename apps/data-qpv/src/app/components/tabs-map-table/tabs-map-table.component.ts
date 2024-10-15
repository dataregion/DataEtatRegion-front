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


  public data2 = [
    {id: '01', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '02', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '03', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '04', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '05', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '06', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '07', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '08', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '09', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '10', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '11', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '12', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '13', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '14', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '15', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '16', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '17', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '18', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '19', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '20', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '21', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '22', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '23', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '24', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '25', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '26', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '27', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '28', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '29', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '30', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '31', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '32', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '33', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '34', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '35', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '36', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '37', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '38', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '39', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '40', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '41', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '42', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '43', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '44', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '45', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '46', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '47', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '48', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '49', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '50', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '51', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '52', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '53', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '54', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '55', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '56', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '57', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '58', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '59', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '60', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '101', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '102', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '103', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '104', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '105', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '106', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '107', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '108', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '109', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '110', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '111', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '112', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '113', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '114', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '115', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '116', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '117', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '118', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '119', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '120', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '121', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '122', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '123', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '124', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '125', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '126', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '127', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '128', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '129', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '130', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '131', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '132', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '133', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '134', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '135', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '136', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '137', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '138', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '139', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '140', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '141', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '142', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '143', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '144', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '145', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '146', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '147', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '148', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '149', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '150', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '151', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '152', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '153', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '154', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '155', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '156', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '157', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '158', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '159', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '160', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '201', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '202', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '203', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '204', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '205', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '206', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '207', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '208', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '209', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '210', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '211', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '212', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '213', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '214', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '215', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '216', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '217', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '218', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '219', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '220', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '221', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '222', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '223', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '224', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '225', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '226', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '227', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '228', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '229', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '230', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '231', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '232', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '233', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '234', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '235', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '236', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '237', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '238', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '239', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '240', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '241', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '242', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '243', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '244', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '245', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '246', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '247', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '248', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '249', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '250', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
    {id: '251', name: 'Smith', firstName: 'John', birthDate: '1980-01-15', city: 'New York'},
    {id: '252', name: 'Johnson', firstName: 'Emma', birthDate: '1992-03-22', city: 'Los Angeles'},
    {id: '253', name: 'Williams', firstName: 'Aaliyah', birthDate: '1985-05-30', city: 'Chicago'},
    {id: '254', name: 'Brown', firstName: 'Emily', birthDate: '1990-07-07', city: 'Houston'},
    {id: '255', name: 'Garcia', firstName: 'Carlos', birthDate: '1978-09-12', city: 'Phoenix'},
    {id: '256', name: 'Jones JonesJones', firstName: 'Sophia', birthDate: '1983-11-21', city: 'Philadelphia'},
    {id: '257', name: 'Miller', firstName: 'Michael', birthDate: '1975-12-05', city: 'San Antonio'},
    {id: '258', name: 'Davis', firstName: 'Chloe', birthDate: '1988-02-19', city: 'San Diego'},
    {id: '259', name: 'Martinez', firstName: 'Juan', birthDate: '1994-04-25', city: 'Dallas'},
    {id: '260', name: 'Taylor', firstName: 'Aisha', birthDate: '1982-08-16', city: 'San Jose'},
  ]

  private _currentSearchFilter: QpvSearchArgs | undefined;

  get searchArgs(): QpvSearchArgs | undefined {
    return this._currentSearchFilter;
  }

  get currentSearchFilter(): QpvSearchArgs | undefined {
    return this._currentSearchFilter;
  }
  @Input()
  set currentSearchFilter(data: QpvSearchArgs | undefined) {
    this._currentSearchFilter = data;
    this.currentSearchFilterChange.emit(this._currentSearchFilter);
  }
  @Output() currentSearchFilterChange = new EventEmitter<QpvSearchArgs | undefined>();

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
