import { Colonne } from "apps/clients/v3/financial-data";
import { TOrError } from "apps/common-lib/src/lib/models/marqueblanche/t-or-error.model";

export interface ColonnesResolved {
  colonnesTable: Colonne[];
  colonnesGrouping: Colonne[];
}

export type ColonnesResolvedModel = TOrError<ColonnesResolved>;