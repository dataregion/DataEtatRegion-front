import { Commune, Programme, Siret, GroupeMarchandise, LocalisationInterministerielle, SourceFinancialData } from "./common.models";
import { Tag } from "../refs/tag.model";


export const HEADERS_CSV_FINANCIAL = [
  'source',
  'n_ej',
  'poste_ej',
  'montant engagement',
  'montant payé',
  'theme',
  'code programme',
  'programme',
  'code domaine fonctionnel',
  'domaine fonctionnel',
  'referentiel_programmation',
  'commune',
  'crte',
  'epci',
  'arrondissement',
  'département',
  'région',
  'code localisation interministérielle',
  'localisation interministérielle',
  'compte budgétaire',
  'cper',
  'code groupe marchandise',
  'groupe marchandise',
  'siret',
  'nom beneficiaire',
  "type d'établissement",
  "code qpv",
  'date de dernier paiement',
  'année engagement',
  'tags',
];

export interface FinancialDataModel {

  id: number;
  source: SourceFinancialData;

  n_ej: string;
  n_poste_ej: number;

  montant_ae: number;
  montant_cp: number;
  commune: Commune;

  domaine_fonctionnel?: any;
  programme: Programme;
  referentiel_programmation: any

  compte_budgetaire?: string;
  contrat_etat_region?: string;
  groupe_marchandise?: GroupeMarchandise;
  localisation_interministerielle?: LocalisationInterministerielle;

  annee: number;

  siret: Siret;
  date_cp: string;

  tags: Tag[];
  financial_cp?: FinancialCp[]
}

export interface FinancialCp {

  date_base_dp: string;
  montant: number;
  n_dp: string;

}
