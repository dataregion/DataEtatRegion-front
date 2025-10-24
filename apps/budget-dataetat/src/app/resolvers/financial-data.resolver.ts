import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BudgetDataHttpService } from '../services/http/budget.service';
import { FinancialData, FinancialDataResolverModel } from '../models/financial/financial-data-resolvers.models';
import { ReferentielsService } from '@services/http/referentiels.service';
import { PrefilterMapperService } from '../components/home/search-data/prefilter-mapper.services';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> = () => {

  const prefilterMapperService = inject(PrefilterMapperService);
  
  const budgetService: BudgetDataHttpService = inject(BudgetDataHttpService);
  const referentielsService: ReferentielsService = inject(ReferentielsService);

  return forkJoin([
    referentielsService.getBop(),
    referentielsService.getReferentielsProgrammation(null),
    budgetService.getAnnees()
  ]).pipe(
    map(([fetchedBop, fetchedRefs, fetchedAnnees]) => {
      const themes = Array.from(new Set(fetchedBop.map((bop) => bop.label_theme))).sort();
      const result = {
        themes: themes,
        bop: fetchedBop,
        referentiels_programmation: fetchedRefs,
        annees: fetchedAnnees
      } as FinancialData;
      // Initialisation du service de mapping des préfiltres ---
      prefilterMapperService.initService(themes, fetchedBop, fetchedRefs, fetchedAnnees);
      return { data: result };
    })
  );
};
