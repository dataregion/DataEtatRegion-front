/* eslint-disable no-unused-vars */

import { TypeCategorieJuridique } from "@models/financial/common.models";

const synonymes: { [key in TypeCategorieJuridique]: string[] } = {
   [TypeCategorieJuridique.ASSOCIATION]: ["Association", "association"], 
   [TypeCategorieJuridique.COLLECTIVITE]: ["Collectivité", "collectivite", "collectivité"],
   [TypeCategorieJuridique.ENTREPRISE]: ["Entreprise", "entreprise"],
   [TypeCategorieJuridique.ETAT]: ["État", "Etat", "état", "etat"],
};

export function synonymes_from_types_localisation(types: TypeCategorieJuridique[]): string[] {
    return types.flatMap(type => synonymes[type]);
}

/* eslint-enable no-unused-vars */

export function to_types_categories_juridiques(name: string): TypeCategorieJuridique {
    for (const key in synonymes) {
        const k = key as TypeCategorieJuridique;
        const elements = synonymes[k];
        if (elements.includes(name)) {
            return k;
        }
    }

    throw new Error(`Impossible de convertir ${name} en type de catégorie juridique.`);
}
