import { Beneficiaire } from '@models/search/beneficiaire.model';
import {
  SelectedData
} from 'apps/common-lib/src/lib/components/advanced-chips-multiselect/advanced-chips-multiselect.component';

/** option beneficiaire pour l'input field*/
export type BeneficiaireFieldData = Beneficiaire & SelectedData;
