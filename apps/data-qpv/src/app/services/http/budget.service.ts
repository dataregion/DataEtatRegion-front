import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { FinancialDataModel } from "apps/data-qpv/src/app/models/financial/financial-data.models";
import { BudgetService as GeneratedBudgetApiService } from "apps/clients/budget";
import { EnrichedFlattenFinancialLinesSchema } from "apps/clients/budget/model/enrichedFlattenFinancialLinesSchema";
import { SETTINGS } from "apps/common-lib/src/lib/environments/settings.http.service";
import { DataIncrementalPagination, from_page_of_budget_lines } from "apps/common-lib/src/lib/models/pagination/pagination.models";
import { SettingsService } from "apps/data-qpv/src/environments/settings.service";
import { map, Observable, of } from "rxjs";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { DataHttpService, SearchParameters } from "apps/data-qpv/src/app/services/interface-data.service"
import { BudgetService } from 'apps/clients/budget';;
import { SearchUtilsService } from "apps/common-lib/src/lib/services/search-utils.service";

@Injectable({
    providedIn: 'root',
})
export class BudgetDataHttpService {

    private _budgetApi: BudgetService = inject(BudgetService);

    public getAnnees(): Observable<number[]> {
        return this._budgetApi.getGetPlageAnnees()
    }

}
