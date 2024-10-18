import { inject } from '@angular/core';
import {
  FuzzySearchParamsBuilder,
  GeoHttpService,
  LimitHandler
} from '../../services/geo-http.service';
import { GeoModel, TypeLocalisation } from '../../models/geo.models';
import { Observable } from 'rxjs';

export class GeoLocalisationComponentService {
  private geo = inject(GeoHttpService);

  public filterGeo(term: string | null, type: TypeLocalisation): Observable<GeoModel[]> {
    const limit_handler: LimitHandler = (search, type, defaultLimit) => {
      let limit = defaultLimit;

      switch (type) {
        case TypeLocalisation.DEPARTEMENT:
          limit = 500;
          break;
        case TypeLocalisation.EPCI:
          if (Object.keys(search).length > 0)
            // Si on recherche un EPCI, on retourne les 5 premiers résultats, sinon default
            limit = 5;
          break;
        case TypeLocalisation.REGION:
        case TypeLocalisation.COMMUNE:
        case TypeLocalisation.CRTE:
        case TypeLocalisation.QPV:
        case TypeLocalisation.ARRONDISSEMENT:
          limit = 100;
          break;
      }

      return { ...search, limit };
    };

    const builder = new FuzzySearchParamsBuilder()
      .withDefaultLimit(100)
      .withLimitHandler(limit_handler);

    const search_params = builder.search(term, type);

    return this.geo.search(type, search_params);
  }
}
