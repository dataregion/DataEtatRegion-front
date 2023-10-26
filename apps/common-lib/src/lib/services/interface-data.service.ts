import { Observable } from 'rxjs';
import { DataPagination } from '../models/pagination/pagination.models';
import { RefSiret } from '@models/refs/RefSiret';
import { BopModel } from '@models/refs/bop.models';
import { GeoModel, TypeLocalisation } from '../models/geo.models';
import { TypeCategorieJuridique } from '@models/financial/common.models';

export enum OtherTypeCategorieJuridique {
  AUTRES = 'autres'
}
export type SearchTypeCategorieJuridique = TypeCategorieJuridique | OtherTypeCategorieJuridique;

export interface SearchParameters {
    bops: BopModel[] | null;
    themes: string[] | null;
    niveau: TypeLocalisation | null;
    locations: GeoModel[] | null,
    years: number[] | null;
    beneficiaires: RefSiret[] | null;
    types_beneficiaires: SearchTypeCategorieJuridique[] | null;
    tags: string[] | null;

    domaines_fonctionnels: string[] | null;
    referentiels_programmation: string[] | null;
    source_region: string[] | null;
}

export const SearchParameters_empty: SearchParameters = {
  themes: null,
  bops: null,
  niveau: null,
  locations: null,
  years: null,
  beneficiaires: null,
  types_beneficiaires: null,
  tags: null,

  domaines_fonctionnels: null,
  referentiels_programmation: null,
  source_region: null,
}

/* eslint no-unused-vars: 0 */  // --> OFF
/**
 * Interface Http Service pour remonter des informations dans une application type Budget
 * T étant le type métier
 * M le modèle générique
 */
export interface DataHttpService<T,M> {

  search(search_parameters: SearchParameters): Observable<DataPagination<T> | null>;

  getById(id: any, ...options: any[]): Observable<T>;

  mapToGeneric(object: T): M;

  getSource(): string;
}
