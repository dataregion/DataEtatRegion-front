export interface SousAxePlanRelance {
  label: string;
  axe: string;
}

/** Represente un sous axe du plan de relance pour le filtre de recherche */
export interface SousAxePlanRelanceForFilter extends SousAxePlanRelance {
  annotation?: string;
}