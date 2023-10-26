import { FormControl } from "@angular/forms";
import { Beneficiaire } from "@models/search/beneficiaire.model";
import { Bop } from "@models/search/bop.model";
import { TypeLocalisation } from "apps/common-lib/src/lib/models/geo.models";
import { SearchTypeCategorieJuridique } from "apps/common-lib/src/lib/services/interface-data.service";
import { TagFieldData } from "./tags-field-data.model";

export interface SearchForm {
    theme: FormControl<string[] | null>;
    bops: FormControl<Bop[] | null>;
    niveau: FormControl<TypeLocalisation | null>;
    location: FormControl<any>;
    year: FormControl<number[] | null>;
    beneficiaires: FormControl<Beneficiaire[] | null>;
    types_beneficiaires: FormControl<SearchTypeCategorieJuridique[] | null>;
    tags: FormControl<TagFieldData[] | null>
}