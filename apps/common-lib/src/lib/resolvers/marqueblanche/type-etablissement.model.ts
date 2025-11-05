 

import { OtherTypeCategorieJuridique, SearchTypeCategorieJuridique, TypeCategorieJuridique } from '../../models/refs/common.models';

const synonymes: { [key in SearchTypeCategorieJuridique]: string[] } = {
  [TypeCategorieJuridique.ASSOCIATION]: ['Association', 'association'],
  [TypeCategorieJuridique.COLLECTIVITE]: ['Collectivité', 'collectivite', 'collectivité'],
  [TypeCategorieJuridique.ENTREPRISE]: ['Entreprise', 'entreprise'],
  [TypeCategorieJuridique.ETAT]: ['État', 'Etat', 'état', 'etat'],
  [OtherTypeCategorieJuridique.AUTRES]: ['Autres', 'Autre', 'autres', 'autre']
};

export function synonymes_from_types_localisation(types: SearchTypeCategorieJuridique[]): string[] {
  return types.flatMap((type) => synonymes[type]);
}

 

export function to_types_categories_juridiques(name: string): SearchTypeCategorieJuridique {
  for (const key in synonymes) {
    const k = key as SearchTypeCategorieJuridique;
    const elements = synonymes[k];
    if (elements.includes(name)) {
      return k;
    }
  }

  throw new Error(`Impossible de convertir ${name} en type de catégorie juridique.`);
}
