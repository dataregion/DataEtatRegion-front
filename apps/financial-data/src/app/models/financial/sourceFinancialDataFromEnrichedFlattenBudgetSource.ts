import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget";
import { SourceFinancialData } from "./common.models";


export function sourceFinancialDataFromEnrichedFlattenBudgetSource(source: EnrichedFlattenFinancialLinesSchema.SourceEnum) {
  switch (source) {
    case "FINANCIAL_DATA_AE":
      return SourceFinancialData.CHORUS;
    case "ADEME":
      return SourceFinancialData.ADEME;

    case "FINANCIAL_DATA_CP":
    case "FRANCE_RELANCE":
    case "FRANCE_2030":
    case "REFERENTIEL":
      throw new Error("");
  }
}
