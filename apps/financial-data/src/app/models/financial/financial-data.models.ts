/* eslint-disable no-unused-vars */

import { Commune, Programme, Siret, GroupeMarchandise, LocalisationInterministerielle, SourceFinancialData, DomaineFonctionnel } from "./common.models";
import { Tag } from "../refs/tag.model";
import { ReferentielProgrammation } from "@models/refs/referentiel_programmation.model";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { JSONObject } from "apps/preference-users/src/lib/models/preference.models";


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
  SIRET = "SIRET",
  BENEFICIAIRE = "Bénéficiaire",
  TYPE_ETABLISSEMENT = "Type d'établissement",
  CODE_QPV = "Code QPV",
  QPV = "QPV",
  DATE_DERNIER_PAIEMENT = "Date dernier paiement",
  DATE_CREATION_EJ = "Date création EJ",
  ANNEE_ENGAGEMENT = "Année d'engagement",
  TAGS = "Tags",
}

export interface FinancialDataModel {

  id: number;
  source: SourceFinancialData;

  n_ej: Optional<string>;
  n_poste_ej: Optional<number>;

  montant_ae: Optional<number>;
  montant_cp: Optional<number>;
  
  // Commune du bénérficiaire
  commune: Optional<Commune>;

  domaine_fonctionnel: Optional<DomaineFonctionnel>;
  programme: Optional<Programme>;
  referentiel_programmation: Optional<ReferentielProgrammation>;

  compte_budgetaire: Optional<string>;
  contrat_etat_region: Optional<string>;
  groupe_marchandise: Optional<GroupeMarchandise>;
  localisation_interministerielle: Optional<LocalisationInterministerielle>;

  annee: number;

  siret: Optional<Siret>;
  date_cp: Optional<string>;
  date_replication: Optional<string>;

  tags: Tag[];

  // Les CP associées à la donnée financière.
  // XXX: Présente uniquement si requêtée
  financial_cp?: Optional<FinancialCp[]>

  toJsonObject(): JSONObject;

}

export interface FinancialCp {

  date_base_dp: string;
  montant: number;
  n_dp: string;

}
