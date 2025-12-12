import { inject, Injectable } from '@angular/core';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { RefQpvWithCommune } from '../models/refs/qpv.model';
import { CentreCouts } from 'apps/clients/v3/referentiels';
import { SearchTypeCategorieJuridique } from 'apps/common-lib/src/lib/models/refs/common.models';
import { BopModel, ThemeModel } from 'apps/common-lib/src/lib/models/refs/bop.models';
import { SourceQueryParams } from 'apps/appcommon/src/lib/models/source-query-params.model';
import { SourceQueryParamsService } from 'apps/appcommon/src/lib/services/source-query-params.service';
import { GetDashboardDashboardsGetRequestParams, GetLignesFinancieresLignesGetRequestParams, GetMapMapGetRequestParams } from 'apps/clients/v3/data-qpv';


export interface SearchParameters extends SourceQueryParams {
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

export type SanitizedSearchFullParams = GetLignesFinancieresLignesGetRequestParams | GetDashboardDashboardsGetRequestParams | GetMapMapGetRequestParams;


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
export class SearchParamsService extends SourceQueryParamsService {

  private _searchUtils: SearchUtilsService = inject(SearchUtilsService);

  override getEmpty(): SearchParameters {
    return {
      ...super.getEmpty(),
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
  }

  override isEmpty(params: SearchParameters): boolean {
    return (
      super.isEmpty(params) &&
      params.bops == undefined &&
      params.notBops == undefined &&
      params.years == undefined &&
      params.niveau == undefined &&
      params.locations == undefined &&
      params.ref_qpv == "2024" &&
      params.code_qpv == undefined &&
      params.centres_couts == undefined &&
      params.themes == undefined &&
      params.beneficiaires == undefined &&
      params.types_beneficiaires == undefined
    );
  }

  getSanitizedSearchParams(params: SearchParameters): SanitizedSearchFullParams {
    // Récupération des codes et sanitize
    const sanitized_codes_programme = this._sanitizeReqArg(params.bops?.filter((bop) => bop.code).map((bop) => bop.code))
    const sanitized_not_codes_programme = this._sanitizeReqArg(params.notBops?.filter((bop) => bop.code).map((bop) => bop.code))
    const sanitized_annees = this._sanitizeReqArg(params.years?.map((a) => a.toString()));
    const sanitized_niveau_geo = this._sanitizeReqArg(this._searchUtils.normalize_type_geo(params.niveau));
    const sanitized_codes_geo = this._sanitizeReqArg(params.locations?.map((l) => l.code));
    const sanitized_codes_qpv = this._sanitizeReqArg(params.code_qpv?.map((l) => l.code));
    const sanitized_themes = this._sanitizeReqArg(params.themes?.map((t) => t.label));
    const sanitized_beneficiaire_siret: string[] | undefined = this._sanitizeReqArg(params.beneficiaires?.map((x) => x.siret));
    const sanitized_financeurs = this._sanitizeReqArg(params.centres_couts?.map((t) => t.code));

    const sanitizedSearchParams: SanitizedSearchFullParams = {
      codeProgramme: sanitized_codes_programme?.join(','),
      notCodeProgramme: sanitized_not_codes_programme?.join(','),
      annee: sanitized_annees?.join(','),
      niveauGeo: sanitized_niveau_geo,
      codeGeo: sanitized_codes_geo?.join(','),
      refQpv: params.ref_qpv,
      codeQpv: sanitized_codes_qpv?.join(','),
      theme: sanitized_themes?.join('|'),
      beneficiaireCode: sanitized_beneficiaire_siret?.join(','),
      beneficiaireCategorieJuridiqueType: params.types_beneficiaires?.join(','),
      centresCouts: sanitized_financeurs?.join(','),
    }
    
    return {
      ...this.getSanitizedSourceParams(params),
      ...sanitizedSearchParams,
      ...this.getSanitizedV3Params(params),
    };
  }
    
  private _sanitizeReqArg<T>(arg: Optional<T>): T | undefined {
    if (!arg)
      return undefined;
    if (Array.isArray(arg) && arg.length == 0)
      return undefined;
    return arg;
  }

}
