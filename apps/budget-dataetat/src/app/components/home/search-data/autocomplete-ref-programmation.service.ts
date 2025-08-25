import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { ReferentielsService } from '@services/referentiels.service';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteRefProgrammationService {
  private _referentielsService = inject(ReferentielsService);


  autocomplete$(input: string[]): Observable<ReferentielProgrammation[]> {
    const autocompletion$ = this._referentielsService.getReferentielsProgrammation(input.join(',')).pipe(
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
    const autocompletion$ = this._referentielsService
      .getReferentielsProgrammation(code)
      .pipe(map((response: ReferentielProgrammation[]) => response[0]));

    return autocompletion$;
  }
}
