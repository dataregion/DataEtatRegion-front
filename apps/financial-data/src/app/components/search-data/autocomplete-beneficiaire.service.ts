import { Injectable } from "@angular/core";
import { RefSiret } from "@models/refs/RefSiret";
import { BudgetService } from "@services/budget.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { BeneficiaireFieldData } from "./beneficiaire-field-data.model";
import { Beneficiaire } from "@models/search/beneficiaire.model";

@Injectable()
export class AutocompleteBeneficiaireService {

    constructor(private budgetService: BudgetService) { }

    autocomplete(input: string): Observable<BeneficiaireFieldData[]> {

        const autocompletion$ =this.budgetService
            .filterRefSiret(input)
            .pipe(
                map((response: Beneficiaire[]) => {
                    return response.map((ref) => {
                        return this._map_beneficiaire_to_fieldData(ref);
                    });
                })
            );

        return autocompletion$;
    }

    private _map_beneficiaire_to_fieldData(benef: Beneficiaire): BeneficiaireFieldData {
        return {
            ...benef,
            item: this._displayBeneficiaire(benef),
        }
    }

    private _displayBeneficiaire(element: RefSiret): string {
        let code = element?.siret;
        let nom = element?.denomination;

        if (code && nom) {
            return `${nom} (${code})`;
        } else if (code) {
            return code;
        } else {
            return nom;
        }
    }
}