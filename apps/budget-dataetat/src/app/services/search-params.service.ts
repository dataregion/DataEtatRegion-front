import { inject, Injectable } from '@angular/core';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { SearchTypeCategorieJuridique } from 'apps/common-lib/src/lib/models/refs/common.models';
import { BopModel } from 'apps/common-lib/src/lib/models/refs/bop.models';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';


export interface SearchParameters {
  // V3QueryParams
  colonnes: string[] | undefined;
  page: number;
  page_size: number;
  sort_by: string | undefined;
  sort_order: "asc" | "desc" | undefined;
  search: string | undefined;
  fields_search: string[] | undefined;
  // SourceQueryParams
  source_region: string[] | undefined;
  data_source: string | undefined;
  source: string | undefined;
  // FinancialLineQueryParams
  n_ej: string[] | undefined;
  n_ds: string[] | undefined;
  montant: number[] | undefined;
  siret: string[] | undefined;
  themes: string[] | undefined;
  bops: BopModel[] | undefined;
  referentiels_programmation: ReferentielProgrammation[] | undefined;
  niveau: TypeLocalisation | undefined;
  locations: GeoModel[] | undefined;
  ref_qpv: 2015 | 2024 | undefined;
  code_qpv: string[] | undefined;
  years: number[] | undefined;
  beneficiaires: RefSiret[] | undefined;
  types_beneficiaires: SearchTypeCategorieJuridique[] | undefined;
  tags: string[] | undefined;
  centres_couts: string[] | undefined;
  domaines_fonctionnels: string[] | undefined;
  grouping: string[] | undefined;
  grouped: (string | undefined)[] | undefined;
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
    n_ej: undefined,
    n_ds: undefined,
    montant: undefined,
    siret: undefined,
    themes: undefined,
    bops: undefined,
    referentiels_programmation: undefined,
    niveau: undefined,
    locations: undefined,
    ref_qpv: undefined,
    code_qpv: undefined,
    years: undefined,
    beneficiaires: undefined,
    types_beneficiaires: undefined,
    tags: undefined,
    centres_couts: undefined,
    domaines_fonctionnels: undefined,
    grouping: undefined,
    grouped: undefined,
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
    const sanitized_niveau_geo = this._sanitizeReqArg(this._searchUtils.normalize_type_geo(searchParams.niveau));
    const sanitized_codes_geo = this._sanitizeReqArg(searchParams.locations?.map((l) => l.code));
    const sanitized_annees = this._sanitizeReqArg(searchParams.years?.map((a) => a.toString()));
    const sanitized_beneficiaire_siret: string[] | undefined = this._sanitizeReqArg(searchParams.beneficiaires?.map((x) => x.siret));
    const sanitized_domaines_fonctionnels: string[] | undefined = this._sanitizeReqArg(searchParams.domaines_fonctionnels);
    const sanitized_codes_referentiels: string[] | undefined = this._sanitizeReqArg(searchParams.referentiels_programmation?.map((rp) => rp.code));

    // Respect de l'ordre pour le client généré : getLignesFinancieresLignesGet
    // Pourquoi cet ordre là à la génération ? ¯\_(ツ)_/¯
    return [
      // SourceQueryParams
      searchParams.source_region?.join(','),
      searchParams.data_source,
      searchParams.source,
      // FinancialLineQueryParams
      searchParams.n_ej?.join(','),
      sanitized_codes_programme?.join(','),
      sanitized_niveau_geo,
      sanitized_codes_geo?.join(','),
      searchParams.ref_qpv,
      searchParams.code_qpv?.join(','),
      searchParams.themes?.join('|'),
      sanitized_beneficiaire_siret?.join(','),
      searchParams.types_beneficiaires?.join(','),
      sanitized_annees?.join(','),
      searchParams.centres_couts?.join(','),
      sanitized_domaines_fonctionnels?.join(','),
      sanitized_codes_referentiels?.join(','),
      searchParams.tags?.join(','),
      searchParams.grouping?.join(','),
      searchParams.grouped?.join(','),
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
