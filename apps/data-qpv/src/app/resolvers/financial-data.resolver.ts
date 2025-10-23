import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import { ReferentielsService } from 'apps/data-qpv/src/app/services/http/referentiels.service';
import { BudgetDataHttpService } from 'apps/data-qpv/src/app/services/http/budget.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> =
  () => {

    const referentielsService: ReferentielsService = inject(ReferentielsService);
    const financialService: BudgetDataHttpService = inject(BudgetDataHttpService);

    return forkJoin([
      financialService.getAnnees(),
      referentielsService.getThemes()
    ]).pipe(
      map(([fetchedAnnees, fetchedThemes]) => {
        const result = {
          annees: fetchedAnnees,
          financeurs: [],
          thematiques: fetchedThemes,
          porteurs: [],
        } as FinancialData
        return {
          data: result
        };
      })
    );

  };
