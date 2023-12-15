import { Commune, Programme, Siret, GroupeMarchandise, LocalisationInterministerielle, SourceFinancialData, DomaineFonctionnel } from "./common.models";
import { Tag } from "../refs/tag.model";
import { ReferentielProgrammation } from "@models/refs/referentiel_programmation.model";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { JSONObject } from "apps/preference-users/src/lib/models/preference.models";


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
