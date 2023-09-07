export enum TypeLocalisation {
  DEPARTEMENT = 'Département',
  EPCI = 'Epci',
  COMMUNE = 'Commune',
  CRTE = 'Crte',
  ARRONDISSEMENT = 'Arrondissement',
  QPV = 'Qpv'
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
