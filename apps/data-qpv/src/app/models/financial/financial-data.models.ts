import { FinancialDataModel } from "apps/common-lib/src/lib/models/financial/financial-data.models";
import { LieuAction } from "apps/common-lib/src/lib/models/refs/common.models";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";


export interface DataQpvFinancialDataModel extends FinancialDataModel {
  lieu_action: Optional<LieuAction>;
}