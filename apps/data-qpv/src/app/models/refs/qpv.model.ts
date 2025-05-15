import { RefQpv } from "apps/common-lib/src/lib/models/refs/RefQpv";
import { GeoModel, TypeLocalisation } from "apps/common-lib/src/public-api";

export interface RefQpvWithCommune extends RefQpv {
  code_commune: string,
  nom_commune: string,
  code_departement: string,
  nom_departement: string,
  code_epci: string,
  nom: string,
  nom_epci: string,
}


/**
 * Interface contenant la liste des departement, epci et qpv
 */
export interface RefGeoQpv  {
    departement : GeoModel[],
    epci : GeoModel[],
    commune : GeoModel[],
    qpvs: RefQpvWithCommune[],
}


export function explodeQpvList(qpvs: RefQpvWithCommune[]): RefGeoQpv {
  const seenDeps = new Set<string>();
  const seenEpcis = new Set<string>();
  const seenCommunes = new Set<string>();

  const departement: GeoModel[] = [];
  const epci: GeoModel[] = [];
  const commune: GeoModel[] = [];

  for (const qpv of qpvs) {
    if (!seenDeps.has(qpv.code_departement)) {
      seenDeps.add(qpv.code_departement);
      departement.push({
        code: qpv.code_departement,
        nom: qpv.nom_departement,
        type: TypeLocalisation.DEPARTEMENT
      });
    }

    if (!seenEpcis.has(qpv.code_epci)) {
      seenEpcis.add(qpv.code_epci);
      epci.push({
        code: qpv.code_epci,
        nom: qpv.nom_epci,
        type: TypeLocalisation.EPCI
      });
    }

    if (!seenCommunes.has(qpv.code_commune)) {
      seenCommunes.add(qpv.code_commune);
      commune.push({
        code: qpv.code_commune,
        nom: qpv.nom_commune,
        type: TypeLocalisation.COMMUNE
      });
    }
  }

  return {
    departement,
    epci,
    commune,
    qpvs,
  };
}
