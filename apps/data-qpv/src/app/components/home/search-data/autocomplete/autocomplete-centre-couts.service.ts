import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ReferentielsService } from '../../../../services/http/referentiels.service';
import { CentreCouts } from 'apps/data-qpv/src/app/models/financial/common.models';


@Injectable({
  providedIn: 'root'
})
export class AutocompleteCentreCoutsService {

  private _referentielsService = inject(ReferentielsService);

  autocomplete$(input: string): Observable<CentreCouts[]> {
    let sanitzed_input = input;
    if (input && !Number.isNaN(parseInt(input))) sanitzed_input = input.replace(/\s+/g, '');
    const autocompletion$ = this._referentielsService.getCentreCouts(sanitzed_input).pipe(
      map((response: CentreCouts[]) => {
        return response
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
    return autocompletion$;
  }

}
