/* eslint-disable no-unused-vars */

import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";


export enum TypeCategorieJuridique {
  ENTREPRISE = 'Entreprise',
  COLLECTIVITE = 'Collectivité',
  ASSOCIATION = 'Association',
  ETAT = 'Etat',
}
  
export interface Code {
  code: string;
}

export interface CodeLabel extends Code {
  label: string;
}


export interface Programme extends CodeLabel {
  theme: Optional<string>;
}

export interface Siret extends Code {
  nom_beneficiaire: Optional<string>,
  categorie_juridique: Optional<TypeCategorieJuridique>
  code_qpv: Optional<string>
  label_qpv: Optional<string>
}

export interface Commune extends CodeLabel {
  label_crte: Optional<string>;
  code_crte: Optional<string>;
  label_epci: Optional<string>;
  code_epci: Optional<string>;
  label_departement: Optional<string>;
  code_departement: Optional<string>;
  label_region: Optional<string>;
  code_region: Optional<string>;
  arrondissement: Optional<Arrondissement>;
}

export interface Arrondissement extends CodeLabel {}
export interface GroupeMarchandise extends CodeLabel {}
export interface LocalisationInterministerielle extends CodeLabel {
  code_departement: Optional<string>
  commune: Optional<Commune>
}
export interface DomaineFonctionnel extends CodeLabel {}

export enum SourceFinancialData {
  ADEME = 'ADEME',
  CHORUS = 'CHORUS'
}

