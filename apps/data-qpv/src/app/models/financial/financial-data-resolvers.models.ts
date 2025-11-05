import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { Beneficiaire } from 'apps/data-qpv/src/app/models/search/beneficiaire.model';
import { RefGeoQpv } from '../refs/qpv.model';
import { CentreCouts } from 'apps/clients/v3/referentiels';
import { ThemeModel } from 'apps/common-lib/src/lib/models/refs/bop.models';

export interface FinancialData {
  annees: number[];
  refGeo: RefGeoQpv;
  financeurs: CentreCouts[];
  thematiques: ThemeModel[];
  porteurs: Beneficiaire[];
}

export type FinancialDataResolverModel = TOrError<FinancialData>
