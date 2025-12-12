import { inject, Injectable } from '@angular/core';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';
import { SearchUtilsService } from 'apps/common-lib/src/lib/services/search-utils.service';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { SearchTypeCategorieJuridique } from 'apps/common-lib/src/lib/models/refs/common.models';
import { BopModel } from 'apps/common-lib/src/lib/models/refs/bop.models';
import { ReferentielProgrammation } from 'apps/common-lib/src/lib/models/refs/referentiel_programmation.model';
import { SourceQueryParams } from 'apps/appcommon/src/lib/models/source-query-params.model';
import { SourceQueryParamsService } from 'apps/appcommon/src/lib/services/source-query-params.service';
import { GetLignesFinancieresLignesGetRequestParams } from 'apps/clients/v3/financial-data';


export interface SearchParameters extends SourceQueryParams {
  n_ej: string[] | undefined;
  n_ds: string[] | undefined;         // TODO : Pourquoi ici ? 
  montant: number[] | undefined;      // TODO : Pourquoi ici ?
  siret: string[] | undefined;        // TODO : Pourquoi ici ?
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

export type SanitizedSearchFullParams = GetLignesFinancieresLignesGetRequestParams;


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
  }

  override isEmpty(params: SearchParameters): boolean {
    return (
      super.isEmpty(params) &&
      params.n_ej == undefined &&
      params.n_ds == undefined &&
      params.montant == undefined &&
      params.siret == undefined &&
      params.themes == undefined &&
      params.bops == undefined &&
      params.referentiels_programmation == undefined &&
      params.niveau == undefined &&
      params.locations == undefined &&
      params.ref_qpv == undefined &&
      params.code_qpv == undefined &&
      params.years == undefined &&
      params.beneficiaires == undefined &&
      params.types_beneficiaires == undefined &&
      params.tags == undefined &&
      params.centres_couts == undefined &&
      params.domaines_fonctionnels == undefined &&
      params.grouping == undefined &&
      params.grouped == undefined
    );
  }
  
  getSanitizedSearchParams(params: SearchParameters): SanitizedSearchFullParams {
    // Récupération des codes et sanitize
    const sanitized_codes_programme = this._sanitizeReqArg(params.bops?.filter((bop) => bop.code).map((bop) => bop.code))
    const sanitized_niveau_geo = this._sanitizeReqArg(this._searchUtils.normalize_type_geo(params.niveau));
    const sanitized_codes_geo = this._sanitizeReqArg(params.locations?.map((l) => l.code));
    const sanitized_annees = this._sanitizeReqArg(params.years?.map((a) => a.toString()));
    const sanitized_beneficiaire_siret: string[] | undefined = this._sanitizeReqArg(params.beneficiaires?.map((x) => x.siret));
    const sanitized_domaines_fonctionnels: string[] | undefined = this._sanitizeReqArg(params.domaines_fonctionnels);
    const sanitized_codes_referentiels: string[] | undefined = this._sanitizeReqArg(params.referentiels_programmation?.map((rp) => rp.code));

    const sanitizedSearchParams: SanitizedSearchFullParams = {
      nEj: params.n_ej?.join(','),
      codeProgramme: sanitized_codes_programme?.join(','),
      niveauGeo: sanitized_niveau_geo,
      codeGeo: sanitized_codes_geo?.join(','),
      refQpv: this._sanitizeQpv(params.ref_qpv),
      codeQpv: params.code_qpv?.join(','),
      theme: params.themes?.join('|'),
      beneficiaireCode: sanitized_beneficiaire_siret?.join(','),
      beneficiaireCategorieJuridiqueType: params.types_beneficiaires?.join(','),
      annee: sanitized_annees?.join(','),
      centresCouts: params.centres_couts?.join(','),
      domaineFonctionnel: sanitized_domaines_fonctionnels?.join(','),
      referentielProgrammation: sanitized_codes_referentiels?.join(','),
      tags: params.tags?.join(','),
      grouping: params.grouping?.join(','),
      grouped: params.grouped?.join(','),
    }
    
    return { 
      ...this.getSanitizedSourceParams(params),
      ...sanitizedSearchParams,
      ...this.getSanitizedV3Params(params),
    }
  }
    
  private _sanitizeReqArg<T>(arg: Optional<T>): T | undefined {
    if (!arg)
      return undefined;
    if (Array.isArray(arg) && arg.length == 0)
      return undefined;
    return arg;
  }
  
  private _sanitizeQpv(qpv: 2015 | 2024 | undefined): "2015" | "2024" | undefined {
    if (qpv == 2015)
      return "2015"
    if (qpv == 2024)
      return "2024"
    return undefined
  }

}
