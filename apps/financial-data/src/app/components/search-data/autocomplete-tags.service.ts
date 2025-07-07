import { Injectable, inject } from '@angular/core';
import { BudgetService } from '@services/budget.service';
import { TagFieldData } from './tags-field-data.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tag, tag_fullname } from '@models/refs/tag.model';

@Injectable()
export class AutocompleteTagsService {
  private _budgetService = inject(BudgetService);


  autocomplete$(input: string): Observable<TagFieldData[]> {
    const autocompletion$ = this._budgetService.allTags$().pipe(
      map((tags) => {
        return (tags || []).filter((tag) => {
          return tag_fullname(tag).startsWith(input) || tag.display_name.startsWith(input);
        });
      }),
      map((tags) => {
        return (tags || []).map((tags) => {
          return this._mapTagsToFielddata(tags);
        });
      })
    );

    return autocompletion$;
  }

  private _mapTagsToFielddata(tag: Tag): TagFieldData {
    return {
      ...tag,
      item: tag.display_name
    };
  }
}
