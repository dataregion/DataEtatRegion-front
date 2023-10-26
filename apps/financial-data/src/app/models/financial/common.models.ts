/* eslint-disable no-unused-vars */

export enum TypeCategorieJuridique {
  ENTREPRISE = 'Entreprise',
  COLLECTIVITE = 'Collectivité',
  ASSOCIATION = 'Association',
  ETAT = 'État',
}

export interface CodeLabel {
  code: string;
  label: string;
}

export interface Programme {
  code?: string;
  label: string;
  theme: string;
}

export interface Siret {
  code: string;
  nom_beneficiare: string,
  categorie_juridique?: TypeCategorieJuridique
  code_qpv?: string
}

export interface Commune extends CodeLabel {
  label_crte: string;
  code_crte: string;
  label_epci: string;
  code_epci: string;
  label_departement: string;
  code_departement: string;
  label_region: string;
  code_region: string;
  arrondissement?: Arrondissement;
}

export interface Arrondissement extends CodeLabel {}
export interface GroupeMarchandise extends CodeLabel {}
export interface LocalisationInterministerielle extends CodeLabel {}

export enum SourceFinancialData {
  ADEME = 'ADEME',
  CHORUS = 'CHORUS'
}
