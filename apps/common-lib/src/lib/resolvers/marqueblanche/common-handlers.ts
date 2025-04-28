import { Observable, of } from 'rxjs';
import { HandlerContext } from '../../models/marqueblanche/handler-context.model';
import { MarqueBlancheParsedParams } from '../../models/marqueblanche/marqueblanche-parsed-params.model';
import { QueryParam } from '../../models/marqueblanche/query-params.enum';
import { GeoHttpService, ReferentielsHttpService, SearchByCodeParamsBuilder, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { ActivatedRouteSnapshot } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { synonymes_from_types_localisation, to_type_localisation } from './niveau-localisation.model';

 
export type Handler<T extends MarqueBlancheParsedParams, V extends HandlerContext> = (
  parsedParams: T,
  ctx: V
) => Observable<T>;

export const niveauxLocalisationLegaux = [
  TypeLocalisation.REGION,
  TypeLocalisation.DEPARTEMENT,
  TypeLocalisation.EPCI,
  TypeLocalisation.COMMUNE,
  TypeLocalisation.QPV
]

/** Paramètres pour une fonction qui calcule les pré-filtres*/
export interface _HandlerContext extends HandlerContext {
  route: ActivatedRouteSnapshot,
  logger: NGXLogger,
  api_geo: GeoHttpService,
  api_ref: ReferentielsHttpService,
}

/**
 * Handler du paramètre group by de la marque blanche
 * Extrait les noms de champs directement du paramètre {@link QueryParam.Group_by}
 * rempli uniquement le paramètre {@link MarqueBlancheParsedParams.p_group_by}
 */
export function p_group_by<T extends MarqueBlancheParsedParams, V extends HandlerContext>(
  previous: T,
  { route, logger }: V
): Observable<T> {
  const route_group_by = route.queryParamMap.get(QueryParam.Group_by);

  if (!route_group_by) return of(previous);

  const params_group_by = route_group_by.split(',');
  logger.debug(`Application du paramètre ${QueryParam.Group_by}: ${params_group_by}`);

  const result: T = {
    ...previous,
    p_group_by: params_group_by
  };
  return of(result);
}

/** Handler du paramètre fullscreen de la marque blanche*/
export function fullscreen<T extends MarqueBlancheParsedParams, V extends HandlerContext>(
  previous: T,
  { route, logger }: V
): Observable<T> {
  const p_fullscreen = route.queryParamMap.get(QueryParam.Fullscreen);

  if (p_fullscreen)
    logger.debug(`Application du paramètre ${QueryParam.Fullscreen}: ${p_fullscreen}`);
  return of({
    ...previous,
    fullscreen: _parse_bool(p_fullscreen)
  });
}

function _parse_bool(s: string | null): boolean {
  if ('true' === s) return true;
  if ('false' === s) return false;

  return Boolean(s);
}
 
/** Parse un paramètre multiple séparé par des virugles*/
export function _extract_multiple_queryparams(
  _previous: MarqueBlancheParsedParams,
  { route, logger }: _HandlerContext,
  query_param: string
): string[] | undefined {
  const p_params = route.queryParamMap.get(query_param);
  if (!p_params) return;

  const params = p_params.split(',');
  logger.debug(`Application du paramètre ${query_param}: ${params}`);
  return params;
}
//endregion

export function _xor(x: unknown, y: unknown) {
  const bx = Number(Boolean(x));
  const by = Number(Boolean(y));

  return Boolean(bx ^ by);
}

/** Parse une année. Exception au cas oú l'année est invalide  */
export function _parse_annee(annee: string | null): number {
  if (!annee) throw new Error(`l'année n'est pas précisée`);

  if (/^\d{4}$/.test(annee)) {
    const integerValue = parseInt(annee, 10);
    return integerValue;
  }

  throw new Error(`L'année ${annee} est invalide`);
}

//region fonctions utilitaires
export function filterGeo(api_geo: GeoHttpService, code_geo: string, niveau_geo: TypeLocalisation) {

  const search_params = new SearchByCodeParamsBuilder()
    .withDefaultLimit(1)
    .search(code_geo, niveau_geo);

  return api_geo.search(niveau_geo, search_params, false);
}

export function common_annee_min_max(
  logger: NGXLogger,
  annee_courante: number,
  p_annee_min: string | null,
  p_annee_max: string | null
) {

  if (_xor(p_annee_min, p_annee_max))
    throw new Error('Veuillez spécifier deux paramètres: "annee_min" et "annee_max"');

  if (!p_annee_min && !p_annee_max) {
    // Par défaut, l'année en cours
    logger.debug(
      `Application du paramètre d'année: année courante (${annee_courante}) (appliqué uniquement si on passe dans la marque blanche)`
    );
    return [annee_courante]
  }

  const i_annee_min = _parse_annee(p_annee_min);
  const i_annee_max = _parse_annee(p_annee_max);
  const annee_min = i_annee_min <= i_annee_max ? i_annee_min : i_annee_max;
  const annee_max = i_annee_min <= i_annee_max ? i_annee_max : i_annee_min;

  const pf_annees = [];
  for (let annee = annee_min; annee <= annee_max; annee++) pf_annees.push(annee);

  if (pf_annees.length > 20)
    throw new Error(
      `Veuillez selectionner une fenêtre de temps < 20 ans en utilisant annee_min et annee_max`
    );
  if (annee_max > annee_courante)
    throw new Error(`Veuillez spécifier une année max correcte (<= année en cours)`);

  return pf_annees
}

export function common_localisation(
  p_niveau_geo: string | null,
  p_code_geo: string | null
): [TypeLocalisation, string] {
  if (_xor(p_niveau_geo, p_code_geo))
    throw Error('Vous devez utiliser `niveau_geo` et `code_geo` ensemble.');
  
  let niveau_geo: TypeLocalisation;
  let code_geo: string;
  try {
    niveau_geo = to_type_localisation(p_niveau_geo ?? "");
    code_geo = p_code_geo!;

    if (!niveauxLocalisationLegaux.includes(niveau_geo))
      throw Error(
        `Le niveau géographique doit être une de ces valeurs ${niveauxLocalisationLegaux}`
      );
   
  } catch {
    const niveaux_valides = synonymes_from_types_localisation(niveauxLocalisationLegaux);
    throw Error(`Le niveau géographique doit être une de ces valeurs ${niveaux_valides}`);
  }
  return [niveau_geo, code_geo]
}