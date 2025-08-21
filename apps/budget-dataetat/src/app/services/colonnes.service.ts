import { inject, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { Colonne, ColonnesResolved, ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { BehaviorSubject } from 'rxjs';

 

export enum ColonneCodes {
  SOURCE = 'source',
  N_EJ = 'n_ej',
  POSTE_EJ = 'poste_ej',
  MONTANT_AE = 'montant_ae',
  MONTANT_CP = 'montant_cp',
  THEME = 'theme',
  CODE_PROGRAMME = 'code_programme',
  PROGRAMME = 'nom_programme',
  CODE_DOMAINE = 'code_domaine',
  DOMAINE = 'domaine',
  REFERENTIEL_PROGRAMMATION = 'ref_programmation',
  COMMUNE = 'label_commune',
  CRTE = 'label_crte',
  EPCI = 'label_epci',
  ARRONDISSEMENT = 'label_arrondissement',
  DEPARTEMENT = 'label_departement',
  REGION = 'label_region',
  CODE_LOC_INTER = 'code_localisation_interministerielle',
  LOC_INTER = 'localisation_interministerielle',
  COMPTE_BUDGETAIRE = 'compte_budgetaire',
  CPER = 'contrat_etat_region',
  CODE_GROUPE_MARCHANDISE = 'code_groupe_marchandise',
  GROUPE_MARCHANDISE = 'groupe_marchandise',
  SIRET = 'siret',
  BENEFICIAIRE = 'beneficiaire',
  TYPE_ETABLISSEMENT = 'type_etablissement',
  CODE_QPV = 'code_qpv',
  QPV = 'qpv',
  DATE_DERNIER_PAIEMENT = 'date_cp',
  DATE_CREATION_EJ = 'date_replication',
  ANNEE_ENGAGEMENT = 'annee',
  CODE_CENTRE_COUTS = 'code_centre_couts',
  LABEL_CENTRE_COUTS = 'centre_couts_label',
  CENTRE_COUTS = 'centre_couts',
  TAGS = 'tags',
  DATA_SOURCE = "data_source",
  DATE_MODIFICATION="date_modification"
}

export enum ColonneLibelles {
  SOURCE = 'Source de données',
  N_EJ = 'N° EJ',
  POSTE_EJ = 'N° Poste EJ',
  MONTANT_AE = 'Montant engagé',
  MONTANT_CP = 'Montant payé',
  THEME = 'Thème',
  CODE_PROGRAMME = 'Code programme',
  PROGRAMME = 'Programme',
  CODE_DOMAINE = 'Code domaine fonctionnel',
  DOMAINE = 'Domaine fonctionnel',
  REFERENTIEL_PROGRAMMATION = 'Ref Programmation',
  COMMUNE = 'Commune du SIRET',
  CRTE = 'CRTE du SIRET',
  EPCI = 'EPCI du SIRET',
  ARRONDISSEMENT = 'Arrondissement du SIRET',
  DEPARTEMENT = 'Département du SIRET',
  REGION = 'Région du SIRET',
  CODE_LOC_INTER = 'Code localisation interministérielle',
  LOC_INTER = 'Localisation interministérielle',
  COMPTE_BUDGETAIRE = 'Compte budgétaire',
  CPER = 'CPER',
  CODE_GROUPE_MARCHANDISE = 'Code groupe marchandise',
  GROUPE_MARCHANDISE = 'Groupe marchandise',
  SIRET = 'Siret',
  BENEFICIAIRE = 'Bénéficiaire',
  TYPE_ETABLISSEMENT = "Type d'établissement",
  CODE_QPV = 'Code QPV',
  QPV = 'QPV',
  DATE_DERNIER_PAIEMENT = 'Date dernier paiement',
  DATE_CREATION_EJ = 'Date création EJ',
  ANNEE_ENGAGEMENT = "Année Exercice comptable",
  CODE_CENTRE_COUTS = 'Code centre coûts',
  LABEL_CENTRE_COUTS = 'Label centre coûts',
  CENTRE_COUTS = 'Centre coûts',
  TAGS = 'Tags',
  DATA_SOURCE = "Source Chorus",
  DATE_MODIFICATION = "Date modification EJ"
}

@Injectable({ providedIn: 'root' })
export class ColonnesService implements OnInit {

  private _route = inject(ActivatedRoute)

  private groupedSubject = new BehaviorSubject<Boolean>(false);
  grouped$ = this.groupedSubject.asObservable();

  private colonnesTableSubject = new BehaviorSubject<Colonne[]>([]);
  colonnesTable$ = this.colonnesTableSubject.asObservable();

  private selectedColonnesTableSubject = new BehaviorSubject<Colonne[]>([]);
  selectedColonnesTable$ = this.selectedColonnesTableSubject.asObservable();

  private colonnesGroupingSubject = new BehaviorSubject<Colonne[]>([]);
  colonnesGrouping$ = this.colonnesGroupingSubject.asObservable();
  
  private selectedColonnesGroupingSubject = new BehaviorSubject<Colonne[]>([]);
  selectedColonnesGrouping$ = this.selectedColonnesGroupingSubject.asObservable();

  getGrouped(): boolean {
    return this.selectedColonnesGroupingSubject.value.length != 0;
  }

  getAllColonnesTable(): Colonne[] {
    return this.colonnesTableSubject.value;
  }

  setAllColonnesTable(cols: Colonne[]) {
    this.colonnesTableSubject.next(cols);
  }

  getSelectedColonnesTable(): Colonne[] {
    return this.selectedColonnesTableSubject.value;
  }

  setSelectedColonnesTable(cols: Colonne[]) {
    this.selectedColonnesTableSubject.next(cols);
  }

  getAllColonnesGrouping(): Colonne[] {
    return this.colonnesGroupingSubject.value;
  }

  setAllColonnesGrouping(cols: Colonne[]) {
    this.colonnesGroupingSubject.next(cols);
  }

  getSelectedColonnesGrouping(): Colonne[] {
    return this.selectedColonnesGroupingSubject.value;
  }

  setSelectedColonnesGrouping(cols: Colonne[]) {
    this.selectedColonnesGroupingSubject.next(cols);
  }

  ngOnInit(): void {
    this._route.data.subscribe((data: Data) => {
      const colonnes = data['colonnes'] as ColonnesResolved
      console.log(colonnes)
      this.setAllColonnesTable(colonnes.colonnesTable);
      this.setAllColonnesGrouping(colonnes.colonnesGrouping);
    });
  }

}
