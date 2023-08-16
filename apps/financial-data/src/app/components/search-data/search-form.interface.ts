import { FormControl } from "@angular/forms";
import { Beneficiaire } from "@models/search/beneficiaire.model";
import { Bop } from "@models/search/bop.model";

export interface SearchForm {
    year: FormControl<number[] | null>;

    filterBop: FormControl<string | null>;

    bops: FormControl<Bop[] | null>;
    theme: FormControl<string[] | null>;
    beneficiaires: FormControl<Beneficiaire[] | null>;
    location: FormControl<any>;
}