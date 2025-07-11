import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { PreFilters } from '@models/search/prefilters.model';
import { GeoHttpService } from 'apps/common-lib/src/lib/services/geo-http.service';
import { ReferentielsHttpService } from 'apps/common-lib/src/lib/services/referentiels.service';
import { GeoModel } from 'apps/common-lib/src/public-api';
import { JSONObject } from 'apps/common-lib/src/lib/models/jsonobject';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import {
  MarqueBlancheParsedParams as Params,
  MarqueBlancheParsedParamsResolverModel as ResolverModel
} from 'apps/common-lib/src/lib/models/marqueblanche/marqueblanche-parsed-params.model';
import { FinancialQueryParam } from '@models/marqueblanche/query-params.enum';
import { QueryParam } from 'apps/common-lib/src/lib/models/marqueblanche/query-params.enum';
import {
  fullscreen,
  p_group_by as common_group_by,
  _extract_multiple_queryparams,
  filterGeo,
  common_annee_min_max,
  common_localisation
} from 'apps/common-lib/src/lib/resolvers/marqueblanche/common-handlers';
import { HandlerContext } from 'apps/common-lib/src/lib/models/marqueblanche/handler-context.model';
import { passing_errors } from 'apps/common-lib/src/lib/resolvers/marqueblanche/utils';
import { assert_is_a_GroupByFieldname } from '@models/marqueblanche/groupby-fieldname.enum';
import { GroupingColumn } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { groupby_mapping } from '@models/marqueblanche/groupby-mapping.model';
import { Beneficiaire } from '@models/search/beneficiaire.model';
import { to_types_categories_juridiques } from 'apps/common-lib/src/lib/resolvers/marqueblanche/type-etablissement.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { _HandlerContext} from 'apps/common-lib/src/lib/resolvers/marqueblanche/common-handlers'

export interface MarqueBlancheParsedParams extends Params {
  preFilters: PreFilters;
}

export type MarqueBlancheParsedParamsResolverModel = ResolverModel<MarqueBlancheParsedParams>;

/** Resolver qui parse les paramètres de la marque blanche */
export const resolveMarqueBlancheParsedParams: ResolveFn<MarqueBlancheParsedParamsResolverModel> =
  passing_errors(_resolver);


function _resolver(route: ActivatedRouteSnapshot): Observable<{ data: MarqueBlancheParsedParams }> {
  const logger = inject(NGXLogger);
  const api_geo = inject(GeoHttpService);
  const api_ref = inject(ReferentielsHttpService);

  const empty: MarqueBlancheParsedParams = {
    preFilters: {},
    p_group_by: [],
    group_by: [],
    has_marqueblanche_params: false,
    fullscreen: false
  };

  const uuid = route.queryParamMap.get(QueryParam.Uuid);

  if (uuid) {
    logger.debug('Paramètre UUID présent. on ne calcule pas les filtres marque blanche');
    return of({ data: empty });
  }

  let has_marqueblanche_params = false;
  for (const p_name of Object.values(FinancialQueryParam)) {
    has_marqueblanche_params = has_marqueblanche_params || route.queryParamMap.has(p_name);
  }

  const handlerCtx = { api_geo, api_ref, route, logger };
  const model = of({ ...empty, has_marqueblanche_params })
    .pipe(
      mergeMap((previous) => programmes(previous, handlerCtx)),
      mergeMap((previous) => localisation(previous, handlerCtx)),
      mergeMap((previous) => beneficiaires(previous, handlerCtx)),
      mergeMap((previous) => type_beneficiaire(previous, handlerCtx))
    )
    .pipe(
      mergeMap((previous) => domaines_fonctionnels(previous, handlerCtx)),
      mergeMap((previous) => referentiels_programmation(previous, handlerCtx)),
      mergeMap((previous) => source_region(previous, handlerCtx)),

      mergeMap((previous) => common_group_by(previous, handlerCtx)),
      mergeMap((previous) => group_by(previous, handlerCtx)),

      map((previous) => annees_min_max(previous, handlerCtx)),
      mergeMap((previous) =>
        fullscreen<MarqueBlancheParsedParams, HandlerContext>(previous, handlerCtx)
      ),
      map((result) => {
        return { data: result };
      })
    );

  return model;
}

function beneficiaires(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const sirets = _extract_multiple_queryparams(previous, ctx, FinancialQueryParam.Beneficiaires);
  if (!sirets) return of(previous);

  const beneficiaires = sirets.map((x) => {
    return { siret: x } as Beneficiaire;
  });

  const preFilters: PreFilters = {
    ...previous.preFilters,
    beneficiaires: beneficiaires
  };

  return of({ ...previous, preFilters });
}

function type_beneficiaire(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const types_beneficiaires = _extract_multiple_queryparams(
    previous,
    ctx,
    FinancialQueryParam.TypesBeneficiaires
  )?.map((x) => to_types_categories_juridiques(x));

  if (!types_beneficiaires) return of(previous);

  const preFilters: PreFilters = {
    ...previous.preFilters,
    types_beneficiaires
  };

  return of({ ...previous, preFilters });
}

function source_region(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const sources = _extract_multiple_queryparams(previous, ctx, FinancialQueryParam.SourceRegion);
  if (!sources) return of(previous);

  const preFilters: PreFilters = {
    ...previous.preFilters,
    sources_region: sources
  };

  return of({ ...previous, preFilters });
}

function domaines_fonctionnels(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const codes = _extract_multiple_queryparams(
    previous,
    ctx,
    FinancialQueryParam.DomaineFonctionnel
  );
  if (!codes) return of(previous);

  const preFilters: PreFilters = {
    ...previous.preFilters,
    domaines_fonctionnels: codes
  };

  return of({ ...previous, preFilters });
}

function referentiels_programmation(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const codes = _extract_multiple_queryparams(
    previous,
    ctx,
    FinancialQueryParam.ReferentielsProgrammation
  );
  if (!codes) return of(previous);

  const referentiels = codes.map((x) => {
    return { code: x } as ReferentielProgrammation;
  });

  const programmes = _extract_multiple_queryparams(previous, ctx, FinancialQueryParam.Programmes);
  if (referentiels && programmes) {
    referentiels.forEach((ref) => {
      if (!programmes.includes(ref.code.substring(0, 4).substring(1)))
        throw Error(
          'Vous devez utiliser des `programmes` et des `referentiels_programmation` associés.'
        );
    });
  }

  function handle_refs(refs: ReferentielProgrammation[]) {
    return {
      ...previous,
      preFilters: {
        ...previous.preFilters,
        referentiels_programmation: refs
      }
    };
  }

  const result = ctx.api_ref
    .searchReferentielProgrammation(codes.join(','), null)
    .pipe(map((refs) => handle_refs(refs)));

  return result;
}

/** Renseigne les {@link GroupingColumn} suivant {@link MarqueBlancheParsedParams.p_group_by}*/
function group_by(
  previous: MarqueBlancheParsedParams,
  _: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const columns: GroupingColumn[] = [];
  for (const param_name of previous.p_group_by) {
    assert_is_a_GroupByFieldname(param_name);
    const columnName = groupby_mapping[param_name];
    const column: GroupingColumn = { columnName };

    columns.push(column);
  }

  return of({
    ...previous,
    group_by: columns
  });
}

/** Gère le préfiltre des programmes */
function programmes(
  previous: MarqueBlancheParsedParams,
  ctx: _HandlerContext
): Observable<MarqueBlancheParsedParams> {
  const codes = _extract_multiple_queryparams(previous, ctx, FinancialQueryParam.Programmes);
  if (!codes) return of(previous);

  const bops = codes.map((code) => {
    return { code: code };
  });

  const preFilters = {
    ...previous.preFilters,
    bops
  };

  return of({ ...previous, preFilters });
}

function handle_geo(previous: MarqueBlancheParsedParams, geo: GeoModel[], niveau_geo: string, code_geo: string) {
  if (geo.length !== 1)
    throw new Error(`Impossible de trouver une localisation pour ${niveau_geo}: ${code_geo}`);
  const _preFilters: PreFilters = {
    ...previous.preFilters,
    location: [geo[0]] as unknown as JSONObject[] // XXX: Ici, on ne gère qu'un seul code_geo
  };
  return {
    ...previous,
    preFilters: _preFilters
  };
}

/** Gère le préfiltre de localisation*/
function localisation(
  previous: MarqueBlancheParsedParams,
  { api_geo, route, logger }: _HandlerContext
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

/** Gère le préfiltre des années */
function annees_min_max(
  previous: MarqueBlancheParsedParams,
  { route, logger }: _HandlerContext
): MarqueBlancheParsedParams {
  const annee_courante = new Date().getFullYear();

  const p_annee_min = route.queryParamMap.get(FinancialQueryParam.Annee_min);
  const p_annee_max = route.queryParamMap.get(FinancialQueryParam.Annee_max);

  const pf_annees = common_annee_min_max(logger, annee_courante, p_annee_min, p_annee_max)

  const _preFilters = {
    ...previous.preFilters,
    year: pf_annees
  };

  return { ...previous, preFilters: _preFilters };
}
