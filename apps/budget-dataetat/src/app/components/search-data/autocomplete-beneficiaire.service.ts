import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BeneficiaireFieldData } from './beneficiaire-field-data.model';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { ReferentielsHttpService } from 'apps/common-lib/src/lib/services/referentiels.service';
import { BudgetService } from '../../services/budget.service';

@Injectable()
export class AutocompleteBeneficiaireService {
  private _refService = inject(ReferentielsHttpService);
  private _budgetService = inject(BudgetService);


  autocomplete$(input: string): Observable<BeneficiaireFieldData[]> {
    let sanitzed_input = input
    if (input && !Number.isNaN(parseInt(input)))
      sanitzed_input = input.replace(/\s+/g, "")
    const autocompletion$ = this._refService.filterRefSiret$(sanitzed_input).pipe(
      map((response: Beneficiaire[]) => {
        return response.map((ref) => {
          return this._mapBeneficiaireToFieldData(ref);
        });
      }),
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );

    return autocompletion$;
  }

  autocompleteSingleBeneficiaire$(code: string): Observable<BeneficiaireFieldData> {
    const autocompletion$ = this._budgetService
      .getRefSiretFromCode(code)
      .pipe(map((response: Beneficiaire) => this._mapBeneficiaireToFieldData(response)));

    return autocompletion$;
  }

  private _mapBeneficiaireToFieldData(benef: Beneficiaire): BeneficiaireFieldData {
    return {
      ...benef,
      item: this._displayBeneficiaire(benef)
    };
  }

  private _displayBeneficiaire(element: RefSiret): string {
    const code = element?.siret;
    const nom = element?.denomination;

    if (code && nom) {
      return `${nom} (${code})`;
    } else if (code) {
      return code;
    }

    return nom;
  }
}
