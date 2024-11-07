import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { CentreCouts } from './common.models';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/qpv-search/beneficiaire.model';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';

export interface FinancialData {
  bops: BopModel[];
  annees: number[];
  financeurs: CentreCouts[];
  thematiques: string[];
  porteurs: Beneficiaire[];
}

export type FinancialDataResolverModel = TOrError<FinancialData>
