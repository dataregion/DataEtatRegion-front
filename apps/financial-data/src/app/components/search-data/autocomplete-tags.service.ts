import { Injectable } from "@angular/core";
import { BudgetService } from "@services/budget.service";
import { TagFieldData } from "./tags-field-data.model";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Tag, tag_str } from "@models/refs/tag.model";

@Injectable()
export class AutocompleteTagsService {

    constructor(private _budgetService: BudgetService) { }

    autocomplete$(input: string): Observable<TagFieldData[]> {

        const autocompletion$ = this._budgetService
            .allTags$()
            .pipe(
                map(
                    (tags) => {
                        return ( tags || [] ).filter(
                            tag => tag_str(tag).startsWith(input)
                        )
                    }
                ),
                map(
                    (tags) => {
                        return ( tags || [] ).map(
                            tags => {
                                return this._map_tags_to_fielddata(tags)
                            }
                        )
                    }
                )
            )

        return autocompletion$;
    }


    private _map_tags_to_fielddata(tag: Tag): TagFieldData {
        return {
            ...tag,
            item: tag_str(tag),
        }
    }
}
