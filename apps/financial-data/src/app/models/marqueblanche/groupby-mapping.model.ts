/* eslint-disable no-unused-vars */

import { ColumnMetaDataDef } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { GroupByFieldname } from './groupby-fieldname.enum';

export type GroupByMapping = { [key in GroupByFieldname]: string };

/**
 * Mapping liant les nom de champ de grouping de la marque blanche
 * vers les noms de colonne du tableau
 * Voir {@link ColumnMetaDataDef}'s name
 */
export const groupby_mapping: GroupByMapping = {
  [GroupByFieldname.Annee_engagement]: 'annee',
  [GroupByFieldname.Region]: 'label_region',
  [GroupByFieldname.Departement]: 'label_departement',
  [GroupByFieldname.CRTE]: 'label_crte',
  [GroupByFieldname.EPCI]: 'label_epci',
  [GroupByFieldname.Arrondissement]: 'label_arrondissement',
  [GroupByFieldname.Commune]: 'label_commune',
  [GroupByFieldname.QPV]: 'qpv',
  [GroupByFieldname.Theme]: 'theme',
  [GroupByFieldname.Programme]: 'nom_programme',
  [GroupByFieldname.DomaineFonctionnel]: 'domaine',
  [GroupByFieldname.ReferentielProgrammation]: 'ref_programmation',
  [GroupByFieldname.Beneficiaire]: 'siret',
  [GroupByFieldname.TypeEtablissement]: 'type_etablissement',
  [GroupByFieldname.N_EJ]: 'n_ej',
  [GroupByFieldname.CompteBudgetaire]: 'compte_budgetaire',
  [GroupByFieldname.GroupeMarchandise]: 'groupe_marchandise',
  [GroupByFieldname.Tags]: 'tags'
};
