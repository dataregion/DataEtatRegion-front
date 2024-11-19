import { CentreCouts } from "@models/financial/common.models";
import { GeoModel, TypeLocalisation } from "apps/common-lib/src/lib/models/geo.models";
import { Beneficiaire } from "./beneficiaire.model";


export interface QpvSearchArgs {
  annees: number[] | null;
  niveau: TypeLocalisation | null;
  localisations: GeoModel[] | null;
  qpv_codes: GeoModel[] | null;
  financeurs: CentreCouts[] | null;
  thematiques: string[] | null;
  porteurs: Beneficiaire[] | null;
  types_porteur: string[] | null;
}
