import { Injectable } from "@angular/core";

/* eslint-disable no-unused-vars */

export enum ColonneCodes {
  SOURCE = "source",
  N_EJ = "n_ej",
  POSTE_EJ = "poste_ej",
  MONTANT_AE = "montant_ae",
  MONTANT_CP = "montant_cp",
  THEME = "theme",
  CODE_PROGRAMME = "code_programme",
  PROGRAMME = "nom_programme",
  CODE_DOMAINE = "code_domaine",
  DOMAINE = "domaine",
  REFERENTIEL_PROGRAMMATION = "ref_programmation",
  COMMUNE = "label_commune",
  CRTE = "label_crte",
  EPCI = "label_epci",
  ARRONDISSEMENT = "label_arrondissement",
  DEPARTEMENT = "label_departement",
  REGION = "label_region",
  CODE_LOC_INTER = "code_localisation_interministerielle",
  LOC_INTER = "localisation_interministerielle",
  COMPTE_BUDGETAIRE = "compte_budgetaire",
  CPER = "contrat_etat_region",
  CODE_GROUPE_MARCHANDISE = "code_groupe_marchandise",
  GROUPE_MARCHANDISE = "groupe_marchandise",
  SIRET = "siret",
  BENEFICIAIRE = "beneficiaire",
  TYPE_ETABLISSEMENT = "type_etablissement",
  CODE_QPV = "code_qpv",
  QPV = "qpv",
  DATE_DERNIER_PAIEMENT = "date_cp",
  DATE_CREATION_EJ = "date_replication",
  ANNEE_ENGAGEMENT = "annee",
  TAGS = "tags",
}

export enum ColonneLibelles {
  SOURCE = "Source de données",
  N_EJ = "N° EJ",
  POSTE_EJ = "N° Poste EJ",
  MONTANT_AE = "Montant engagé",
  MONTANT_CP = "Montant payé",
  THEME = "Thème",
  CODE_PROGRAMME = "Code programme",
  PROGRAMME = "Programme",
  CODE_DOMAINE = "Code domaine fonctionnel",
  DOMAINE = "Domaine fonctionnel",
  REFERENTIEL_PROGRAMMATION = "Ref Programmation",
  COMMUNE = "Commune du SIRET",
  CRTE = "CRTE du SIRET",
  EPCI = "EPCI du SIRET",
  ARRONDISSEMENT = "Arrondissement du SIRET",
  DEPARTEMENT = "Département du SIRET",
  REGION = "Région du SIRET",
  CODE_LOC_INTER = "Code localisation interministérielle",
  LOC_INTER = "Localisation interministérielle",
  COMPTE_BUDGETAIRE = "Compte budgétaire",
  CPER = "CPER",
  CODE_GROUPE_MARCHANDISE = "Code groupe marchandise",
  GROUPE_MARCHANDISE = "Groupe marchandise",
  SIRET = "Siret",
  BENEFICIAIRE = "Bénéficiaire",
  TYPE_ETABLISSEMENT = "Type d'établissement",
  CODE_QPV = "Code QPV",
  QPV = "QPV",
  DATE_DERNIER_PAIEMENT = "Date dernier paiement",
  DATE_CREATION_EJ = "Date création EJ",
  ANNEE_ENGAGEMENT = "Année d'engagement",
  TAGS = "Tags",
}

@Injectable({ providedIn: 'root' })
export class ColonnesService {

  private _codesLibelles: { [key in ColonneCodes]: ColonneLibelles[] } = {
    [ColonneCodes.SOURCE]: [ColonneLibelles.SOURCE],
    [ColonneCodes.N_EJ]: [ColonneLibelles.N_EJ],
    [ColonneCodes.POSTE_EJ]: [ColonneLibelles.POSTE_EJ],
    [ColonneCodes.MONTANT_AE]: [ColonneLibelles.MONTANT_AE],
    [ColonneCodes.MONTANT_CP]: [ColonneLibelles.MONTANT_CP],
    [ColonneCodes.THEME]: [ColonneLibelles.THEME],
    [ColonneCodes.CODE_PROGRAMME]: [ColonneLibelles.CODE_PROGRAMME],
    [ColonneCodes.PROGRAMME]: [ColonneLibelles.PROGRAMME],
    [ColonneCodes.CODE_DOMAINE]: [ColonneLibelles.CODE_DOMAINE],
    [ColonneCodes.DOMAINE]: [ColonneLibelles.DOMAINE],
    [ColonneCodes.REFERENTIEL_PROGRAMMATION]: [ColonneLibelles.REFERENTIEL_PROGRAMMATION],
    [ColonneCodes.COMMUNE]: [ColonneLibelles.COMMUNE],
    [ColonneCodes.CRTE]: [ColonneLibelles.CRTE],
    [ColonneCodes.EPCI]: [ColonneLibelles.EPCI],
    [ColonneCodes.ARRONDISSEMENT]: [ColonneLibelles.ARRONDISSEMENT],
    [ColonneCodes.DEPARTEMENT]: [ColonneLibelles.DEPARTEMENT],
    [ColonneCodes.REGION]: [ColonneLibelles.REGION],
    [ColonneCodes.CODE_LOC_INTER]: [ColonneLibelles.CODE_LOC_INTER],
    [ColonneCodes.LOC_INTER]: [ColonneLibelles.LOC_INTER],
    [ColonneCodes.COMPTE_BUDGETAIRE]: [ColonneLibelles.COMPTE_BUDGETAIRE],
    [ColonneCodes.CPER]: [ColonneLibelles.CPER],
    [ColonneCodes.CODE_GROUPE_MARCHANDISE]: [ColonneLibelles.CODE_GROUPE_MARCHANDISE],
    [ColonneCodes.GROUPE_MARCHANDISE]: [ColonneLibelles.GROUPE_MARCHANDISE],
    [ColonneCodes.SIRET]: [ColonneLibelles.SIRET],
    [ColonneCodes.BENEFICIAIRE]: [ColonneLibelles.BENEFICIAIRE],
    [ColonneCodes.TYPE_ETABLISSEMENT]: [ColonneLibelles.TYPE_ETABLISSEMENT],
    [ColonneCodes.CODE_QPV]: [ColonneLibelles.CODE_QPV],
    [ColonneCodes.QPV]: [ColonneLibelles.QPV],
    [ColonneCodes.DATE_DERNIER_PAIEMENT]: [ColonneLibelles.DATE_DERNIER_PAIEMENT],
    [ColonneCodes.DATE_CREATION_EJ]: [ColonneLibelles.DATE_CREATION_EJ],
    [ColonneCodes.ANNEE_ENGAGEMENT]: [ColonneLibelles.ANNEE_ENGAGEMENT],
    [ColonneCodes.TAGS]: [ColonneLibelles.TAGS],
  }

  public getLibellesByCode(code: ColonneCodes): ColonneLibelles[] {
    return this._codesLibelles[code];
  }
  public getCodeByLibelle(libelle: ColonneLibelles): ColonneCodes | null {
    let result: string|null = null;
    Object.keys(this._codesLibelles).forEach(key => {
      const k = key as ColonneCodes
      const libelles = this._codesLibelles[k]
      if (key in this._codesLibelles && libelles.includes(libelle as ColonneLibelles)) {
          result = key;
      }
    })
    return result;
  }

}