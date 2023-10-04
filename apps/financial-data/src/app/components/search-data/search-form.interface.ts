import { FormControl } from "@angular/forms";
import { Beneficiaire } from "@models/search/beneficiaire.model";
import { Bop } from "@models/search/bop.model";
import { TagFieldData } from "./tags-field-data.model";

export interface SearchForm {
    theme: FormControl<string[] | null>;
    bops: FormControl<Bop[] | null>;
    location: FormControl<any>;
    year: FormControl<number[] | null>;
    beneficiaires: FormControl<Beneficiaire[] | null>;
    tags: FormControl<TagFieldData[] | null>
}