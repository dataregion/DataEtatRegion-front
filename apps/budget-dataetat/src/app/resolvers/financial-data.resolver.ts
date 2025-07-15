import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BudgetDataHttpService } from '../services/http/budget-lines-http.service';
import { BudgetService } from '../services/budget.service';
import { FinancialData, FinancialDataResolverModel } from '../models/financial/financial-data-resolvers.models';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> = () => {
  const budgetService: BudgetService = inject(BudgetService);
  const financialService: BudgetDataHttpService = inject(BudgetDataHttpService);

  return forkJoin([
    budgetService.getBop(),
    budgetService.getReferentielsProgrammation(null),
    financialService.getAnnees()
  ]).pipe(
    map(([fetchedBop, fetchedRefs, fetchedAnnees]) => {
      const themes = Array.from(new Set(fetchedBop.map((bop) => bop.label_theme))).sort();
      const result = {
        themes: themes,
        bop: fetchedBop,
        referentiels_programmation: fetchedRefs,
        annees: fetchedAnnees
      } as FinancialData;
      return { data: result };
    })
  );
};
