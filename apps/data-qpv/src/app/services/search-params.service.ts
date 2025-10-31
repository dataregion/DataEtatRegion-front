import { inject, Injectable } from '@angular/core';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';
import { CentreCouts, TypeCategorieJuridique } from '../models/financial/common.models';
import { BopModel } from '../models/refs/bop.models';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { ThemeModel } from '../models/refs/bop.models';
import { RefQpvWithCommune } from '../models/refs/qpv.model';
import { V3QueryParams, V3QueryParamsService } from './query-params.service';


export enum OtherTypeCategorieJuridique {
    AUTRES = 'autres'
}
export type SearchTypeCategorieJuridique = TypeCategorieJuridique | OtherTypeCategorieJuridique;

export interface SearchParameters extends V3QueryParams {
  // SourceQueryParams
  source_region: string[] | undefined;
  data_source: string | undefined;
  source: string | undefined;
  // FinancialLineQueryParams
  bops: BopModel[] | undefined;
  notBops: BopModel[] | undefined;
  years: number[] | undefined;
  niveau: TypeLocalisation | undefined;
  locations: GeoModel[] | undefined;
  ref_qpv: "2015" | "2024" | undefined;
  code_qpv: RefQpvWithCommune[] | undefined;
  centres_couts: CentreCouts[] | undefined;
  themes: ThemeModel[] | undefined;
  beneficiaires: RefSiret[] | undefined;
  types_beneficiaires: SearchTypeCategorieJuridique[] | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SearchParameters {
  export function isEqual(a: SearchParameters, b: SearchParameters): boolean {
    if (a === b) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return false;
    }
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      // @ts-expect-error: arrête de me harceler ou j'appelle les flics
      if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
        return false;
      } 
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SearchParamsService {

  private _searchUtils: SearchUtilsService = inject(SearchUtilsService);
  private _queryParamsService: V3QueryParamsService = inject(V3QueryParamsService);

  private _empty: SearchParameters = {
    // V3QueryParams
    colonnes: undefined,
    page: 1,
    page_size: 100,
    sort_by: undefined,
    sort_order: undefined,
    search: undefined,
    fields_search: undefined,
    // SourceQueryParams
    source_region: undefined,
    data_source: undefined,
    source: undefined,
    // FinancialLineQueryParams
    bops: undefined,
    notBops: undefined,
    years: undefined,
    niveau: undefined,
    locations: undefined,
    ref_qpv: "2024",
    code_qpv: undefined,
    centres_couts: undefined,
    themes: undefined,
    beneficiaires: undefined,
    types_beneficiaires: undefined,
  };

  getEmpty() {
    return this._empty;
  }

  isEmpty(searchParams: SearchParameters): boolean {
    return Object.entries(searchParams).every(([key, value]) => {
      if (key === "page") return value === 1;
      if (key === "page_size") return value === 100;
      return value === undefined;
    });
  }

  getSanitizedParams(searchParams: SearchParameters) {
    // Récupération des codes et sanitize
    const sanitized_codes_programme = this._sanitizeReqArg(searchParams.bops?.filter((bop) => bop.code).map((bop) => bop.code))
    const sanitized_not_codes_programme = this._sanitizeReqArg(searchParams.notBops?.filter((bop) => bop.code).map((bop) => bop.code))
    const sanitized_annees = this._sanitizeReqArg(searchParams.years?.map((a) => a.toString()));
    const sanitized_niveau_geo = this._sanitizeReqArg(this._searchUtils.normalize_type_geo(searchParams.niveau));
    const sanitized_codes_geo = this._sanitizeReqArg(searchParams.locations?.map((l) => l.code));
    const sanitized_codes_qpv = this._sanitizeReqArg(searchParams.code_qpv?.map((l) => l.code));
    const sanitized_themes = this._sanitizeReqArg(searchParams.themes?.map((t) => t.label));
    const sanitized_beneficiaire_siret: string[] | undefined = this._sanitizeReqArg(searchParams.beneficiaires?.map((x) => x.siret));
    const sanitized_financeurs = this._sanitizeReqArg(searchParams.centres_couts?.map((t) => t.code));

    // Respect de l'ordre pour le client généré : getLignesFinancieresLignesGet
    // Pourquoi cet ordre là à la génération ? ¯\_(ツ)_/¯
    return [
      // SourceQueryParams
      searchParams.source_region?.join(','),
      searchParams.data_source,
      searchParams.source,
      // FinancialLineQueryParams
      sanitized_codes_programme?.join(','),
      sanitized_not_codes_programme?.join(','),
      sanitized_annees?.join(','),
      sanitized_niveau_geo,
      sanitized_codes_geo?.join(','),
      searchParams.ref_qpv,
      sanitized_codes_qpv?.join(','),
      sanitized_themes?.join('|'),
      sanitized_beneficiaire_siret?.join(','),
      searchParams.types_beneficiaires?.join(','),
      sanitized_financeurs?.join(','),
      // V3QueryParams
      searchParams.colonnes?.join(','),
      searchParams.page,
      searchParams.page_size,
      searchParams.sort_by,
      searchParams.sort_order,
      searchParams.search,
      searchParams.fields_search?.join(','),
    ] as const;
  }
    
  private _sanitizeReqArg<T>(arg: Optional<T>): T | undefined {
    if (!arg)
      return undefined;
    if (Array.isArray(arg) && arg.length == 0)
      return undefined;
    return arg;
  }

}
