import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReferentielsService } from 'apps/appcommon/src/lib/services/referentiels-v3.service';
import { CentreCouts } from 'apps/clients/v3/referentiels';


@Injectable({
  providedIn: 'root'
})
export class AutocompleteCentreCoutsService {

  private _referentielsService = inject(ReferentielsService);

  autocomplete$(input: string): Observable<CentreCouts[]> {
    let sanitzed_input = input;
    if (input && !Number.isNaN(parseInt(input))) sanitzed_input = input.replace(/\s+/g, '');
    const autocompletion$ = this._referentielsService.getCentreCouts(sanitzed_input).pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
    return autocompletion$;
  }

}
