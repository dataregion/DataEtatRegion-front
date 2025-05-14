import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import { BudgetService } from 'apps/data-qpv/src/app/services/budget.service';
import { BudgetDataHttpService } from 'apps/data-qpv/src/app/services/http/budget-lines-http.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> =
  () => {

    const budgetService: BudgetService = inject(BudgetService);
    const financialService: BudgetDataHttpService = inject(BudgetDataHttpService);

    return forkJoin([
      financialService.getAnnees(),
      budgetService.getBop(),
      budgetService.getQpvs()
    ]).pipe(
      map(([fetchedAnnees, fetchedBops, fetchQpv]) => {
        const themes = Array.from(new Set(fetchedBops.map(bop => bop.label_theme))).sort();
        const result = {
          bops: fetchedBops,
          annees: fetchedAnnees,
          financeurs: [],
          thematiques: themes,
          porteurs: [],
          qpvs: fetchQpv,
        } as FinancialData
        return {
          data: result
        };
      })
    );

  };
