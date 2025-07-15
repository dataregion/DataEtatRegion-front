 

export enum GroupByFieldname {
  Annee_engagement = 'annee_engagement',
  Region = 'region',
  Departement = 'departement',
  CRTE = 'crte',
  EPCI = 'epci',
  Arrondissement = 'arrondissement',
  Commune = 'commune',
  QPV = 'qpv',
  Theme = 'theme',
  Programme = 'programme',
  DomaineFonctionnel = 'domaine_fonctionnel',
  ReferentielProgrammation = 'referentiel_programmation',
  Beneficiaire = 'beneficiaire',
  TypeEtablissement = 'type_etablissement',
  N_EJ = 'n_ej',
  CompteBudgetaire = 'compte_budgetaire',
  GroupeMarchandise = 'groupe_marchandise',
  Tags = 'tags'
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert_is_a_GroupByFieldname(v: any): asserts v is GroupByFieldname {
  const values = Object.values(GroupByFieldname);
  const isIn = values.includes(v);
  if (!isIn) throw new Error(`${v} n'est pas un membre de ${values.join(', ')}`);
}
