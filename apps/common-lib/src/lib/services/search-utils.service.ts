import { Injectable } from "@angular/core";
import { TypeLocalisation } from "../models/geo.models";
import { Optional } from "../utilities/optional.type";

@Injectable({
    providedIn: 'root',
})
export class SearchUtilsService {

    normalize_type_geo(type_localisation: Optional<TypeLocalisation>) {
        return type_localisation?.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    }
}