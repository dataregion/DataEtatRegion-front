import { Observable } from 'rxjs';
import { DataPagination } from '../../../../common-lib/src/lib/models/pagination/pagination.models';
import { BopModel } from '@models/refs/bop.models';
import { GeoModel, TypeLocalisation } from '../../../../common-lib/src/lib/models/geo.models';
import { SourceFinancialData, TypeCategorieJuridique } from '@models/financial/common.models';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';

export enum OtherTypeCategorieJuridique {
  AUTRES = 'autres'
}
export type SearchTypeCategorieJuridique = TypeCategorieJuridique | OtherTypeCategorieJuridique;

export interface SearchParameters {
  n_ej: string[] | null;
  n_ds: string[] | null;
  siret: string[] | null;
  montant: number[] | null;
  source: string | null;
  themes: string[] | null;
  bops: BopModel[] | null;
  referentiels_programmation: ReferentielProgrammation[] | null;
  niveau: TypeLocalisation | null;
  locations: GeoModel[] | null,
  years: number[] | null;
  beneficiaires: RefSiret[] | null;
  types_beneficiaires: SearchTypeCategorieJuridique[] | null;
  tags: string[] | null;

  domaines_fonctionnels: string[] | null;
  source_region: string[] | null;
}

export const SearchParameters_empty: SearchParameters = {
  n_ej: null,
  source: null,
  n_ds: null,
  siret: null,
  montant: null,
  themes: null,
  bops: null,
  referentiels_programmation: null,
  niveau: null,
  locations: null,
  years: null,
  beneficiaires: null,
  types_beneficiaires: null,
  tags: null,

  domaines_fonctionnels: null,
  source_region: null,
}

/* eslint no-unused-vars: 0 */  // --> OFF
/**
 * Interface Http Service pour remonter des informations dans une application type Budget
 * T étant le type métier
 * M le modèle générique
 */
export interface DataHttpService<T, M> {

  search(search_parameters: SearchParameters): Observable<DataPagination<T> | null>;

  getById(source: SourceFinancialData, id: any, ...options: any[]): Observable<T>;

  mapToGeneric(object: T): M;

  getSources(): string[];
}
