import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { BudgetDataHttpService } from '../services/http/budget-lines-http.service';
import { BudgetService } from '../services/budget.service';
import { Colonne, ColonnesResolved, ColonnesResolvedModel } from '@models/financial/colonnes.models';

export const resolveColonnes: ResolveFn<ColonnesResolvedModel> = () => {
  
  const budgetService: BudgetDataHttpService = inject(BudgetDataHttpService);

  return forkJoin([
    budgetService.getAnnees(),
    budgetService.getAnnees()
  ]).pipe(
    map(([fetchedColonnesTable, fetchedColonnesGrouping]) => {
      const result = {
        colonnesTable: [
          {'code': '1', 'label': 'Test 1'} as Colonne,
          {'code': '2', 'label': 'Test 2'} as Colonne,
          {'code': '3', 'label': 'Test 3'} as Colonne,
          {'code': '4', 'label': 'Test 4'} as Colonne,
          {'code': '5', 'label': 'Test 5'} as Colonne,
        ],
        colonnesGrouping: [
          {'code': '1', 'label': 'Test 1'} as Colonne,
          {'code': '2', 'label': 'Test 2'} as Colonne,
          {'code': '3', 'label': 'Test 3'} as Colonne,
        ]
      } as ColonnesResolved;
      return { data: result };
    })
  );
};
