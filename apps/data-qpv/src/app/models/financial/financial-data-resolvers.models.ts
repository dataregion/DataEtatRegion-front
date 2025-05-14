import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { CentreCouts } from './common.models';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/qpv-search/beneficiaire.model';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { RefQpvWithCommune } from 'apps/common-lib/src/lib/models/refs/RefQpv';

export interface FinancialData {
  bops: BopModel[];
  annees: number[];
  financeurs: CentreCouts[];
  thematiques: string[];
  porteurs: Beneficiaire[];
  qpvs: RefQpvWithCommune[];
}

export type FinancialDataResolverModel = TOrError<FinancialData>
