import { FormControl } from "@angular/forms";
import { GeoModel, TypeLocalisation } from "apps/common-lib/src/lib/models/geo.models";

export interface SearchForm {
  annees: FormControl<number[] | null>;
  zone: FormControl<TypeLocalisation | null>;
  localisation: FormControl<GeoModel[] | null>;
  qpv: FormControl<any[] | null>;
}
