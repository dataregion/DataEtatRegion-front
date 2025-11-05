import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReferentielsService } from '@services/http/referentiels.service';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';

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
