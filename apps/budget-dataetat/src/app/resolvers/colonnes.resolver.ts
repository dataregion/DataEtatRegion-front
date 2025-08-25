import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ColonnesResolved, ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { ListeDesColonnesService } from 'apps/clients/v3/financial-data';

export const resolveColonnes: ResolveFn<ColonnesResolvedModel> = () => {
  
  const colonnesService: ListeDesColonnesService = inject(ListeDesColonnesService);

  return forkJoin([
    colonnesService.getColonnesTableauColonnesTableauGet(),
    colonnesService.getColonnesGroupingColonnesGroupingGet()
  ]).pipe(
    map(([fetchedColonnesTable, fetchedColonnesGrouping]) => {
      const result = {
        colonnesTable: fetchedColonnesTable.data,
        colonnesGrouping: fetchedColonnesGrouping.data
      } as ColonnesResolved;
      return { data: result };
    })
  );
};
