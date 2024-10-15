import { GeoModel, TypeLocalisation } from "apps/common-lib/src/lib/models/geo.models";


export interface QpvSearchArgs {
  annees: number[] | null;
  niveau: TypeLocalisation | null;
  localisations: GeoModel[] | null;
  qpv_codes: string[] | null;
}
