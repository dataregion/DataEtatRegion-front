import { GeoModel, TypeLocalisation } from 'apps/common-lib/src/lib/models/geo.models';
import { TypeCategorieJuridique } from 'apps/data-qpv/src/app/models/financial/common.models';
import { RefSiret } from 'apps/common-lib/src/lib/models/refs/RefSiret';
import { BopModel } from '../models/refs/bop.models';
import { ReferentielProgrammation } from '../models/refs/referentiel_programmation.model';


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
    locations: GeoModel[] | null;
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
    source_region: null
};
