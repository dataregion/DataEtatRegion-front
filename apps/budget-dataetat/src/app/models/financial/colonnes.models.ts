import { TOrError } from "apps/common-lib/src/lib/models/marqueblanche/t-or-error.model";

export interface Colonne {
    code: string;
    label: string;
    name: string;
}

export interface ColonnesResolved {
  colonnesTable: Colonne[];
  colonnesGrouping: Colonne[];
}

export type ColonnesResolvedModel = TOrError<ColonnesResolved>;