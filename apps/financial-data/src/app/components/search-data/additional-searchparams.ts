import { TypeCategorieJuridique } from "@models/financial/common.models";

/** Pour les critères de recherche qui n'apparaissent pas dans le formulaire de recherche */
export interface AdditionalSearchParameters {
  domaines_fonctionnels: string[];
  referentiels_programmation: string[];
  sources_region: string[];
  types_beneficiaires: TypeCategorieJuridique[];
}

export const empty_additional_searchparams: AdditionalSearchParameters = {
  domaines_fonctionnels: [],
  referentiels_programmation: [],
  sources_region: [],
  types_beneficiaires: [],
}