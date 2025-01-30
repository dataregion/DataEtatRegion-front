import { Observable } from 'rxjs';
import { DataIncrementalPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { BopModel } from 'apps/data-qpv/src/app/models/refs/bop.models';
import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/lib/models/geo.models';
import { CentreCouts, SourceFinancialData, TypeCategorieJuridique } from 'apps/data-qpv/src/app/models/financial/common.models';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';

export enum OtherTypeCategorieJuridique {
  AUTRES = 'autres'
}
export type SearchTypeCategorieJuridique = TypeCategorieJuridique | OtherTypeCategorieJuridique;

export interface SearchParameters {
  bops: BopModel[] | null;
  years: number[] | null;
  niveau: TypeLocalisation | null;
  locations: GeoModel[] | null,
  qpvs: GeoModel[] | null,
  centre_couts: CentreCouts[] | null;
  themes: string[] | null;
  beneficiaires: RefSiret[] | null;
  types_beneficiaires: SearchTypeCategorieJuridique[] | null;
}

export const SearchParameters_empty: SearchParameters = {
  bops: null,
  years: null,
  niveau: null,
  locations: null,
  qpvs: null,
  centre_couts: null,
  themes: null,
  beneficiaires: null,
  types_beneficiaires: null,
}

/* eslint no-unused-vars: 0 */  // --> OFF
/**
 * Interface Http Service pour remonter des informations dans une application type Budget
 * T étant le type métier
 * M le modèle générique
 */
export interface DataHttpService<T, M> {

  search(search_parameters: SearchParameters): Observable<DataIncrementalPagination<T> | null>;

  getById(source: SourceFinancialData, id: any, ...options: any[]): Observable<T>;

  mapToGeneric(object: T): M;

  getSources(): string[];
}
