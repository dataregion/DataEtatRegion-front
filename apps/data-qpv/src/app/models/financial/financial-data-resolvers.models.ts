import { TOrError } from 'apps/common-lib/src/lib/models/marqueblanche/t-or-error.model';
import { BopModel } from '../refs/bop.models';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';

export interface FinancialData {
  themes: string[];
  bop: BopModel[];
  referentiels_programmation: ReferentielProgrammation[];
  annees: number[];
}

export type FinancialDataResolverModel = TOrError<FinancialData>
