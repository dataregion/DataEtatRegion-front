import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { BudgetDataHttpService } from '../services/http/budget.service';
import { catchError, forkJoin, map, of } from 'rxjs';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { EnrichedFlattenFinancialLines2 } from 'apps/clients/v3/financial-data';
import { SearchDataMapper } from '@services/search-data-mapper.service';

export const resolveInfosSupplementaires: ResolveFn<FinancialDataModel | Error> =(
  route: ActivatedRouteSnapshot
) => {
  const source = route.params['source'];
  const id = route.params['id'];
  const _budgetService = inject(BudgetDataHttpService);
  const _searchDataMapper = inject(SearchDataMapper);

  return forkJoin([
    _budgetService.getById(id, source),
  ]).pipe(
    map(([fetchedLigne]) => {
      return _searchDataMapper.map(fetchedLigne.data as EnrichedFlattenFinancialLines2);
    }),
    catchError((_error) => {
      return of({
        name: 'Erreur',
        message: 'Erreurs lors de la récupération des données.'
      } as Error);
    })
  );
};
