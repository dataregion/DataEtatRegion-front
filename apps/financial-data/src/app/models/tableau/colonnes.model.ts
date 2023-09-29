import { Tag } from "@models/refs/tag.model";
import { AggregatorFns, ColumnMetaDataDef } from "apps/grouping-table/src/lib/components/grouping-table/group-utils";

const moneyFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export const colonnes: ColumnMetaDataDef[] = [
    {
        name: 'siret',
        label: 'Bénéficiaire',
        renderFn: (row, col) =>
            row[col.name] ? row[col.name]['nom_beneficiare'] : ''
    },
    {
        name: 'montant_ae',
        label: 'Montant engagé',
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
        columnStyle: {
            'min-width': '22ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'montant_cp',
        label: 'Montant payé',
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
        name: 'domaine',
        label: 'Domaine fonctionnel',
        renderFn: (row, _col) => row['domaine_fonctionnel'] ? _print_code_label(row['domaine_fonctionnel']['code'], row['domaine_fonctionnel']['label']) : '',
    },
    {
        name: 'label_commune',
        label: 'Commune du SIRET',
        renderFn: (row, _col) => row['commune']['label'],
    },
    {
        name: 'localisation_interministerielle',
        label: 'Localisation interministérielle',
        renderFn: (row, _col) => _print_localisation_interministerielle(row['localisation_interministerielle']),
    },
    {
        name: 'n_ej',
        label: 'N° EJ',
    },
    {
        name: 'tags',
        label: 'Tags',
        groupingKeyFn: (row, col) => {
            const tags: Tag[] = row[col.name] || []
            const key = tags
                .filter(tag => tag != null)
                .map(tag => `${tag.type} ${tag.value}`)
                .reduceRight((p, s) => `${p} ; ${s}`, '')
            return key;
        }
    },
    {
        name: 'theme',
        label: 'Thème',
        displayed: false,
        renderFn: (row, _col) => row['programme']['theme'] ?? '',
    },
    {
        name: 'nom_programme',
        label: 'Programme',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row['programme']['code'], row['programme']['label']),
    },
    {
        name: 'ref_programmation',
        label: 'Ref Programmation',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row['referentiel_programmation']['code'], row['referentiel_programmation']['label']),
    },
    {
        name: 'siret',
        label: 'Siret',
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name]['code'] : '',
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'type_etablissement',
        label: `Type d'établissement`,
        displayed: false,
        renderFn: (row, _col) =>
            row['siret']['categorie_juridique'] !== null ? row['siret']['categorie_juridique'] : 'Non renseigné',
    },
    {
        name: 'compte_budgetaire',
        label: 'Compte budgétaire',
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name] : '',
    },
    {
        name: 'contrat_etat_region',
        label: 'CPER',
        displayed: false,
        renderFn: (row, col) => row[col.name] && row[col.name] !== "#" ? row[col.name] : '',
    },
    {
        name: 'groupe_marchandise',
        label: 'Groupe marchandise',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row['groupe_marchandise']['code'], row['groupe_marchandise']['label']),
    },
    {
        name: 'date_cp',
        label: 'Date dernier paiement',
        displayed: false,
        renderFn: (row, col) =>
            row[col.name] ? new Date(row[col.name]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) : '',
    },
    {
        name: 'date_replication',
        label: 'Date création EJ',
        displayed: false,
        renderFn: (row, col) =>
            row[col.name] ? new Date(row[col.name]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) : '',
    },
]


function _print_code_label(c: string | undefined, l : string | undefined): string {
  const code = c ?? '';
  const label = l ?? '';
  return  code !== '' ? `${code} - ${label}` : label;
}

function _print_localisation_interministerielle(loc:any): string {
  let text = '';
  if (loc) {
    const code = ('code' in loc && loc['code'] !== undefined && loc['code'] !== null) ? loc['code'] : '';
    const label = ('label' in loc && loc['label'] !== undefined && loc['label'] !== null) ? loc['label'] : '';
    const commune = ('commune' in loc && loc['commune'] !== undefined) ? `${loc['commune']['code']} - ${loc['commune']['label']}` : '';
    const codeLabel = label !== '' ? `${code} - ${label}` : code;
    text = commune !== '' ? `${codeLabel} (${commune})` : codeLabel;
  }
  return text
}
