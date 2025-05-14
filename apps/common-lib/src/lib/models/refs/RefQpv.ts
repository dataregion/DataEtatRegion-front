export interface RefQpv {
  code: string,
  label: string,
  label_commune: string,
  annee_decoupage: number,
  geom: string,
  centroid: string,
}

export interface RefQpvWithCommune extends RefQpv{
  code_commune: string,
  nom_commune: string,
  code_departement: string,
  nom_departement: string,
  code_epci: string,
  nom_epci: string,
}
