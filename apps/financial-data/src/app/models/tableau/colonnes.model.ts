import { AggregatorFns, ColumnMetaDataDef } from "apps/grouping-table/src/lib/components/grouping-table/group-utils";

const moneyFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export const colonnes: ColumnMetaDataDef[] = [
    {
        name: 'siret',
        label: 'Bénéficiaire',
        displayed: true,
        renderFn: (row, col) =>
            row[col.name] ? row[col.name]['nom_beneficiare'] : ''
    },
    {
        name: 'montant_ae',
        label: 'Montant engagé',
        displayed: true,
        renderFn: (row, col) =>
            row[col.name] ? moneyFormat.format(row[col.name]) : row[col.name],
        aggregateReducer: AggregatorFns.sum,
        aggregateRenderFn: (aggregateValue) =>
            aggregateValue ? moneyFormat.format(aggregateValue) : aggregateValue,
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'annee',
        label: 'Année d\'engagement',
        displayed: true,
        columnStyle: {
            'min-width': '22ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'montant_cp',
        label: 'Montant payé',
        displayed: true,
        renderFn: (row, col) =>
            row[col.name] > 0 ? moneyFormat.format(row[col.name]) : "",
        aggregateReducer: AggregatorFns.sum,
        aggregateRenderFn: (aggregateValue) =>
            aggregateValue ? moneyFormat.format(aggregateValue) : aggregateValue,
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'tags',
        label: 'Tags',
    },
    {
        name: 'domaine',
        label: 'Domaine fonctionnel',
        displayed: true,
        renderFn: (row, _col) => row['domaine_fonctionnel'] ? _print_code_label(row['domaine_fonctionnel']['code'], row['domaine_fonctionnel']['label']) : '',
    },
    {
        name: 'label_commune',
        label: 'Commune du SIRET',
        displayed: true,
        renderFn: (row, _col) => row['commune']['label'],
    },
    {
        name: 'n_ej',
        label: 'N° EJ',
        displayed: true,
    },
    {
        name: 'theme',
        label: 'Thème',
        displayed: true,
        renderFn: (row, _col) => row['programme']['theme'] ?? '',
    },
    {
        name: 'nom_programme',
        label: 'Programme',
        displayed: true,
        renderFn: (row, _col) => _print_code_label(row['programme']['code'], row['programme']['label']),
    },
    {
        name: 'ref_programmation',
        label: 'Ref Programmation',
        displayed: true,
        renderFn: (row, _col) => _print_code_label(row['referentiel_programmation']['code'], row['referentiel_programmation']['label']),
    },
    {
        name: 'siret',
        label: 'Siret',
        displayed: true,
        renderFn: (row, col) => row[col.name] ? row[col.name]['code'] : '',
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'type_etablissement',
        label: `Type d'établissement`,
        displayed: true,
        renderFn: (row, _col) =>
            row['siret']['categorie_juridique'] !== null ? row['siret']['categorie_juridique'] : 'Non renseigné',
    },
    {
        name: 'date_cp',
        label: 'Date dernier paiement',
        displayed: true,
        renderFn: (row, col) =>
            row[col.name] ? new Date(row[col.name]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) : '',
    },
]


function _print_code_label(c: string | undefined, l : string | undefined): string {
  const code = c ?? '';
  const label = l ?? '';
  return  code !== '' ? `${code} - ${label}` : label;
}
