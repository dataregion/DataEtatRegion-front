import { Injectable, inject } from '@angular/core';
import { BudgetService } from '@services/budget.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteRefProgrammationService {
  private _budgetService = inject(BudgetService);


  autocomplete$(input: string[]): Observable<ReferentielProgrammation[]> {
    const autocompletion$ = this._budgetService.getReferentielsProgrammation(input.join(',')).pipe(
      map((response: ReferentielProgrammation[]) => {
        return response.map((ref) => ref);
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );

    return autocompletion$;
  }

  autocompleteSingleRefProgrammation$(code: string): Observable<ReferentielProgrammation> {
    const autocompletion$ = this._budgetService
      .getReferentielsProgrammation(code)
      .pipe(map((response: ReferentielProgrammation[]) => response[0]));

    return autocompletion$;
  }
}
