import { FormControl } from "@angular/forms";
import { CentreCouts } from "@models/financial/common.models";
import { Beneficiaire } from "@models/search/beneficiaire.model";
import { GeoModel, TypeLocalisation } from "apps/common-lib/src/lib/models/geo.models";

export interface SearchForm {
  annees: FormControl<number[] | null>;
  niveau: FormControl<TypeLocalisation | null>;
  localisations: FormControl<GeoModel[] | null>;
  qpv: FormControl<any[] | null>;
  financeurs: FormControl<CentreCouts[] | null>;
  thematiques: FormControl<string[] | null>;
  porteurs: FormControl<Beneficiaire[] | null>;
}
