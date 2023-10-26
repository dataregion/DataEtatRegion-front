/* eslint no-unused-vars: 0 */  // --> OFF

export enum TypeLocalisation {
  REGION = 'Région',
  DEPARTEMENT = 'Département',
  EPCI = 'EPCI',
  COMMUNE = 'Commune',
  CRTE = 'CRTE',
  ARRONDISSEMENT = 'Arrondissement',
  QPV = 'QPV'
}

export interface GeoModel {
  nom: string;
  code: string;
  codeRegion?: string;
  type?: TypeLocalisation;
}

export interface GeoCommuneModel extends GeoModel {
  codesPostaux: string[];
}

export interface QpvModel extends  Omit<GeoModel, 'nom'> {
  label: string;
  label_commune: string;
}

export interface GeoArrondissementModel extends Omit<GeoModel, 'nom'> {
  label: string;
  code_departement: string;
  code_region: string;
}
