import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { FinancialDataModel } from 'apps/common-lib/src/lib/models/financial/financial-data.models';
import { Tag } from '@models/refs/tag.model';


export interface FinancialCp {
  date_base_dp: string;
  montant: number;
  n_dp: string;
}

export interface BudgetFinancialDataModel extends FinancialDataModel {
  tags: Tag[];
  financial_cp?: Optional<FinancialCp[]>;
}