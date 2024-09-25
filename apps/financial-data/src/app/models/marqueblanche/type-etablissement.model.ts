/* eslint-disable no-unused-vars */

import { TypeCategorieJuridique } from '@models/financial/common.models';
import {
  OtherTypeCategorieJuridique,
  SearchTypeCategorieJuridique
} from '@services/interface-data.service';

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

/* eslint-enable no-unused-vars */

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
