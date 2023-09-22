/* eslint-disable no-unused-vars */

export enum TypeCategorieJuridique {
  ENTREPRISE = 'Entreprise',
  COLLECTIVITE = 'Collectivité',
  ASSOCIATION = 'Association',
  ETAT = 'Etat',
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

export interface Commune {
  label: string;
  code: string;
}

export enum SourceFinancialData {
  ADEME = 'ADEME',
  CHORUS = 'CHORUS'
}
