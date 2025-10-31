import { RepresentantLegal, Subvention } from "apps/clients/apis-externes-v3";

export interface SubventionFull {
  siret: string;
  subvention: Subvention | null;
  contact: RepresentantLegal | null;
}
