import { ExportableAsJson } from "apps/common-lib/src/lib/models/exportable-as-json.model";
import { SourceLaureatsData } from "./common.model";

/** 
 * Représente un payload de laureat 
 */
export interface Laureat {
  Structure: string;
  NuméroDeSiretSiConnu: string;
  SubventionAccordée: string;
  Synthèse: string;
  axe: string;
  'sous-axe': string;
  dispositif: string;
  territoire: string;
  code_insee: string;
}

/** Représente un lauréat enrichit d'informations pour le frontend */
export interface FrontLaureat extends Laureat, ExportableAsJson {
  source: SourceLaureatsData
}