import { LocalisationInterministerielle } from "@models/financial/common.models";
import { FinancialDataModel } from "@models/financial/financial-data.models";
import { Tag } from "@models/refs/tag.model";
import { Optional } from "apps/common-lib/src/lib/utilities/optional.type";
import { AggregatorFns, ParameterizedColumnMetaDataDef, RowData } from "apps/grouping-table/src/lib/components/grouping-table/group-utils";

const moneyFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

export const groupingOrder: string[] = [
    'annee',
    'label_region', 'label_departement', 'label_crte', 'label_epci', 'label_arrondissement', 'label_commune', 'qpv',
    'theme', 'nom_programme', 'domaine', 'ref_programmation',
    'beneficiaire', 'type_etablissement',
    'n_ej', 'compte_budgetaire', 'groupe_marchandise',
    'tags',
]

export type FinancialColumnMetaDataDef = ParameterizedColumnMetaDataDef<FinancialDataModel & RowData>

export const colonnes: FinancialColumnMetaDataDef[] = [
    {
        name: 'beneficiaire',
        label: 'Bénéficiaire',
        renderFn: (row) => {
            return row.siret?.nom_beneficiaire ?? ''
        }
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
        grouping: true,
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
        renderFn: (row, _col) => {
            if (row.domaine_fonctionnel)
                return _print_code_label(row.domaine_fonctionnel.code, row.domaine_fonctionnel.label)
            return '';
        },
    },
    {
        name: 'label_commune',
        label: 'Commune du SIRET',
        renderFn: (row, _col) => {
            return row.commune?.label;
        },
    },
    {
        name: 'label_crte',
        label: 'CRTE du SIRET',
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_crte,
    },
    {
        name: 'label_epci',
        label: 'EPCI du SIRET',
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_epci,
    },
    {
        name: 'label_arrondissement',
        label: 'Arrondissement du SIRET',
        displayed: false,
        renderFn: (row, _col) => row.commune?.arrondissement?.label,
    },
    {
        name: 'label_departement',
        label: 'Département du SIRET',
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_departement,
    },
    {
        name: 'label_region',
        label: 'Région du SIRET',
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_region,
    },
    {
        name: 'localisation_interministerielle',
        label: 'Localisation interministérielle',
        renderFn: (row, _col) => _print_localisation_interministerielle(row.localisation_interministerielle),
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
        renderFn: (row, _col) => row.programme?.theme ?? '',
    },
    {
        name: 'nom_programme',
        label: 'Programme',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.programme?.code, row.programme?.label),
    },
    {
        name: 'ref_programmation',
        label: 'Ref Programmation',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.referentiel_programmation?.code, row.referentiel_programmation?.label),
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
        name: 'qpv',
        label: 'QPV',
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.siret?.code_qpv, row.siret?.label_qpv)
    },
    {
        name: 'type_etablissement',
        label: `Type d'établissement`,
        displayed: false,
        renderFn: (row, _col) => {
            if (! row.siret?.categorie_juridique)
                return "Non renseigné"
            return row.siret.categorie_juridique
        }
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
        renderFn: (row) => _print_code_label(row.groupe_marchandise?.code, row.groupe_marchandise?.label),
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


function _print_code_label(c: Optional<string>, l : Optional<string>): string {
  const code = c ?? '';
  const label = l ?? '';
  return  code !== '' ? `${code} - ${label}` : label;
}

function _print_localisation_interministerielle(loc: Optional<LocalisationInterministerielle>): string {
  let text = '';
  if (loc) {
    const code = loc.code;
    const label = loc.label;
    const commune = loc.commune && `${loc.commune.code} - ${loc.commune.label}` || '';
    const codeLabel = label !== '' ? `${code} - ${label}` : code;
    text = commune !== '' ? `${codeLabel} (${commune})` : codeLabel;
  }
  return text
}
