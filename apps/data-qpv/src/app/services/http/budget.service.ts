import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { BudgetService } from 'apps/clients/budget';;

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService {

    private _budgetApi: BudgetService = inject(BudgetService);

    public getAnnees(): Observable<number[]> {
        return this._budgetApi.getGetPlageAnnees()
    }

}
