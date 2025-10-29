import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { CentreCouts } from './common.models';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/search/beneficiaire.model';
import { ThemeModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { RefGeoQpv } from '../refs/qpv.model';

export interface FinancialData {
  annees: number[];
  refGeo: RefGeoQpv;
  financeurs: CentreCouts[];
  thematiques: ThemeModel[];
  porteurs: Beneficiaire[];
}

export type FinancialDataResolverModel = TOrError<FinancialData>
