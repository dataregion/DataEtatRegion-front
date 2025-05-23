import { QueryParam as CommonQueryParam, QueryParam_values as common_values } from "apps/common-lib/src/lib/models/marqueblanche/query-params.enum";

 
/** Nom des paramètres supportés par financial */
export enum FinancialQueryParam {
    Annee_min = 'annee_min',
    Annee_max = 'annee_max',
    Niveau_geo = 'niveau_geo',
    Code_geo = 'code_geo',
    QPV = 'code_qpv',
    Financeurs = 'financeurs',
    Thematiques = 'thematiques',
    Porteurs = 'porteurs',
    TypesPorteur = 'types_porteur',
}
const values_FinancialQueryParam = Object.values(FinancialQueryParam);

export type QueryParam = CommonQueryParam | FinancialQueryParam;
export const QueryParam_values = [...common_values, ...values_FinancialQueryParam];
