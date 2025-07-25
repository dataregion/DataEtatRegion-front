import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { PreFilters } from 'apps/data-qpv/src/app/models/search/prefilters.model';
import { GeoHttpService } from 'apps/common-lib/src/lib/services/geo-http.service';
import { ReferentielsHttpService } from 'apps/common-lib/src/lib/services/referentiels.service';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { JSONObject } from "apps/common-lib/src/lib/models/jsonobject";
import { Observable, of } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import {
  MarqueBlancheParsedParams as Params,
  MarqueBlancheParsedParamsResolverModel as ResolverModel
} from 'apps/common-lib/src/lib/models/marqueblanche/marqueblanche-parsed-params.model';
import { FinancialQueryParam } from 'apps/data-qpv/src/app/models/marqueblanche/query-params.enum';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import { passing_errors } from 'apps/common-lib/src/lib/resolvers/marqueblanche/utils';
import { to_types_categories_juridiques } from 'apps/common-lib/src/lib/resolvers/marqueblanche/type-etablissement.model';
import { _extract_multiple_queryparams, _HandlerContext, common_annee_min_max, common_localisation, filterGeo } from 'apps/common-lib/src/lib/resolvers/marqueblanche/common-handlers';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

export interface MarqueBlancheParsedParams extends Params {
  preFilters: PreFilters,
}
export type MarqueBlancheParsedParamsResolverModel = ResolverModel<MarqueBlancheParsedParams>

/** Resolver qui parse les paramètres de la marque blanche */
export const resolveMarqueBlancheParsedParams: ResolveFn<MarqueBlancheParsedParamsResolverModel> = passing_errors(_resolver)


function _resolver(route: ActivatedRouteSnapshot): Observable<{ data: MarqueBlancheParsedParams }> {

  const logger = inject(LoggerService);
  const api_geo = inject(GeoHttpService)
  const api_ref = inject(ReferentielsHttpService)

  const empty: MarqueBlancheParsedParams = {
    preFilters: {},
    p_group_by: [],
    group_by: [],
    has_marqueblanche_params: false,
    fullscreen: false
  }

  const uuid = route.queryParamMap.get(QueryParam.Uuid);

  if (uuid) {
    logger.debug("Paramètre UUID présent. on ne calcule pas les filtres marque blanche");
    return of(
      { data: empty }
    );
  }

  let has_marqueblanche_params = false;
  for (const p_name of Object.values(FinancialQueryParam)) {
    has_marqueblanche_params = has_marqueblanche_params || route.queryParamMap.has(p_name);
  }

  const handlerCtx = { api_geo, api_ref, route, logger };
  const model = of({ ...empty, has_marqueblanche_params })
    .pipe(
      map(previous => annees_min_max(previous, handlerCtx)),
      mergeMap(previous => localisation(previous, handlerCtx)),
      mergeMap(previous => code_qpv(previous, handlerCtx)),
      mergeMap(previous => types_porteur(previous, handlerCtx)),
      map(result => {
        return { data: result }
      })
    )

  return model;
}

/** Gère le préfiltre des codes QPV */
function code_qpv(
  previous: MarqueBlancheParsedParams,
  { api_geo, route, logger }: _HandlerContext,
): Observable<MarqueBlancheParsedParams> {

  const code_qpv = route.queryParamMap.get(FinancialQueryParam.QPV);

  if (code_qpv === null)
    return of(previous);

  function handle_geo(geo: GeoModel[]) {
    if (geo.length !== 1)
      throw new Error(`Impossible de trouver une localisation pour QPV: ${code_qpv}`);
    const _preFilters: PreFilters = {
      ...previous.preFilters,
      qpv: [geo[0]] as unknown as JSONObject[] // XXX: Ici, on ne gère qu'un seul code_geo
    }
    return {
      ...previous,
      preFilters: _preFilters
    };
  }

  logger.debug(`Application des paramètres QPV et ${FinancialQueryParam.Code_geo}: ${code_qpv}`);
  if (code_qpv.includes(","))
    throw new Error(`Impossible de trouver une localisation pour QPV: ${code_qpv}`);
  const result = filterGeo(api_geo, code_qpv ? code_qpv : "", TypeLocalisation.QPV)
  .pipe(
    map(geo => handle_geo(geo))
  );

  return result;
}
  
function handle_geo(previous: MarqueBlancheParsedParams, geo: GeoModel[], niveau_geo: string, code_geo: string) {
  if (geo.length !== 1)
    throw new Error(`Impossible de trouver une localisation pour ${niveau_geo}: ${code_geo}`);
  const _preFilters: PreFilters = {
    ...previous.preFilters,
    localisation: [geo[0]] as unknown as JSONObject[] // XXX: Ici, on ne gère qu'un seul code_geo
  }
  return {
    ...previous,
    preFilters: _preFilters
  };
}

/** Gère le préfiltre de localisation*/
function localisation(
  previous: MarqueBlancheParsedParams,
  { api_geo, route, logger }: _HandlerContext,
): Observable<MarqueBlancheParsedParams> {

  const p_niveau_geo = route.queryParamMap.get(FinancialQueryParam.Niveau_geo);
  const p_code_geo = route.queryParamMap.get(FinancialQueryParam.Code_geo);

  if (!p_niveau_geo)
    return of(previous);

  const [niveau_geo, code_geo] = common_localisation(p_niveau_geo, p_code_geo)


  logger.debug(
    `Application des paramètres ${FinancialQueryParam.Niveau_geo}: ${niveau_geo} et ${FinancialQueryParam.Code_geo}: ${code_geo}`
  );
  const result = filterGeo(api_geo, code_geo, niveau_geo).pipe(
    map(geo => handle_geo(previous, geo, niveau_geo, code_geo))
  );

  return result;
}

function types_porteur(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {

  const types_porteur = 
    _extract_multiple_queryparams(previous, ctx, FinancialQueryParam.TypesPorteur)
    ?.map(x => to_types_categories_juridiques(x))

  if (!types_porteur)
    return of(previous)

  const preFilters: PreFilters = {
    ...previous.preFilters,
    types_porteur: types_porteur as unknown as JSONObject[]
  }

  return of({ ... previous, preFilters })
}


/** Gère le préfiltre des années */
function annees_min_max(
  previous: MarqueBlancheParsedParams,
  { route, logger }: _HandlerContext,
): MarqueBlancheParsedParams {

  const annee_courante = new Date().getFullYear();

  const p_annee_min = route.queryParamMap.get(FinancialQueryParam.Annee_min);
  const p_annee_max = route.queryParamMap.get(FinancialQueryParam.Annee_max);

  const pf_annees = common_annee_min_max(logger, annee_courante, p_annee_min, p_annee_max)

  const _preFilters = {
    ...previous.preFilters,
    annees: pf_annees,
  }

  return { ...previous, preFilters: _preFilters };
}
