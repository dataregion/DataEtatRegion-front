import { ExportableAsJson } from 'apps/common-lib/src/lib/models/exportable-as-json.model';
import { SourceLaureatsData } from './common.model';

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
  label_commune: string;
  code_commune: string;
  code_region: string;
  label_region: string;
  code_departement: string;
  label_departement: string;
  code_epci: string;
  label_epci: string;
  code_arrondissement: string;
  label_arrondissement: string;
}

/** Représente un lauréat enrichit d'informations pour le frontend */
export interface FrontLaureat extends Laureat, ExportableAsJson {
  source: SourceLaureatsData;
}
