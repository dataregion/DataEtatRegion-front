import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { FinancialData, FinancialDataResolverModel } from 'apps/data-qpv/src/app/models/financial/financial-data-resolvers.models';
import { ReferentielsService } from 'apps/data-qpv/src/app/services/http/referentiels.service';
import { QpvDataService } from 'apps/data-qpv/src/app/services/http/qpv.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export const resolveFinancialData: ResolveFn<FinancialDataResolverModel> =
  () => {

    const referentielsService: ReferentielsService = inject(ReferentielsService);
    const financialService: QpvDataService = inject(QpvDataService);

    return forkJoin([
      financialService.getAnnees(),
      referentielsService.getThemes(),
      referentielsService.getRefGeoQpv()
    ]).pipe(
      map(([fetchedAnnees, fetchedThemes, fetchedRefGeo]) => {
        const result = {
          annees: fetchedAnnees,
          refGeo: fetchedRefGeo,
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
