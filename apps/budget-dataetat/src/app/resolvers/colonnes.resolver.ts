import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ColonnesResolved, ColonnesResolvedModel } from '@models/financial/colonnes.models';
import { ListeDesColonnesService } from 'apps/clients/v3/financial-data';
import { ColonnesMapperService } from 'apps/appcommon/src/lib/mappers/colonnes-mapper.service';


export const resolveColonnes: ResolveFn<ColonnesResolvedModel> = () => {
  
  const colonnesService: ListeDesColonnesService = inject(ListeDesColonnesService);
  const colonnesMapperService: ColonnesMapperService = inject(ColonnesMapperService);

  return forkJoin([
    colonnesService.getColonnesTableauColonnesTableauGet(),
    colonnesService.getColonnesGroupingColonnesGroupingGet()
  ]).pipe(
    map(([fetchedColonnesTable, fetchedColonnesGrouping]) => {
      const result = {
        colonnesTable: fetchedColonnesTable.data,
        colonnesGrouping: fetchedColonnesGrouping.data
      } as ColonnesResolved;
      
      // Initialisation du service de mapper avec les colonnes récupérées
      colonnesMapperService.initService(
        result.colonnesTable ?? [],
        result.colonnesGrouping ?? []
      );
      
      return { data: result };
    })
  );
};
