import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { CentreCouts } from './common.models';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/qpv-search/beneficiaire.model';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { RefGeoQpv } from '../refs/qpv.model';

export interface FinancialData {
  bops: BopModel[];
  annees: number[];
  financeurs: CentreCouts[];
  thematiques: string[];
  porteurs: Beneficiaire[];
  refGeo: RefGeoQpv;
}

export type FinancialDataResolverModel = TOrError<FinancialData>
