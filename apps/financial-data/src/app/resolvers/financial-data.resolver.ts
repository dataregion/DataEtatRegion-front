import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from '@models/financial/financial-data-resolvers.models';
import { BudgetService } from '@services/budget.service';
import { FinancialDataHttpService } from '@services/http/financial-data-http.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> =
  () => {

    const budgetService: BudgetService = inject(BudgetService);
    const financialService: FinancialDataHttpService = inject(FinancialDataHttpService);

    return forkJoin([
      budgetService.getBop(),
      budgetService.getReferentielsProgrammation(null),
      financialService.getAnnees()
    ]).pipe(
      map(([fetchedBop, fetchedRefs, fetchedAnnees]) => {
        const themes = Array.from(new Set(fetchedBop.map(bop => bop.label_theme))).sort();
        const result = {themes: themes, bop: fetchedBop, referentiels_programmation: fetchedRefs, annees: fetchedAnnees } as FinancialData;
        return {data: result};
      })
    );

  };
