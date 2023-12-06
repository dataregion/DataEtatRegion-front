import { LocalisationInterministerielle } from "@models/financial/common.models";
import { ColonneLibelles, FinancialDataModel } from "@models/financial/financial-data.models";
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
        label: ColonneLibelles.BENEFICIAIRE, 
        renderFn: (row) => {
            return row.siret?.nom_beneficiaire ?? ''
        }
    },
    {
        name: 'montant_ae',
        label: ColonneLibelles.MONTANT_AE,
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
        label: ColonneLibelles.ANNEE_ENGAGEMENT,
        grouping: true,
        columnStyle: {
            'min-width': '22ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'montant_cp',
        label: ColonneLibelles.MONTANT_CP,
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
        label: ColonneLibelles.DOMAINE,
        renderFn: (row, _col) => {
            if (row.domaine_fonctionnel)
                return _print_code_label(row.domaine_fonctionnel.code, row.domaine_fonctionnel.label)
            return '';
        },
    },
    {
        name: 'label_commune',
        label: ColonneLibelles.COMMUNE,
        renderFn: (row, _col) => {
            return row.commune?.label;
        },
    },
    {
        name: 'label_crte',
        label: ColonneLibelles.CRTE,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_crte,
    },
    {
        name: 'label_epci',
        label: ColonneLibelles.EPCI,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_epci,
    },
    {
        name: 'label_arrondissement',
        label: ColonneLibelles.ARRONDISSEMENT,
        displayed: false,
        renderFn: (row, _col) => row.commune?.arrondissement?.label,
    },
    {
        name: 'label_departement',
        label: ColonneLibelles.DEPARTEMENT,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_departement,
    },
    {
        name: 'label_region',
        label: ColonneLibelles.REGION,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_region,
    },
    {
        name: 'localisation_interministerielle',
        label: ColonneLibelles.LOC_INTER,
        renderFn: (row, _col) => _print_localisation_interministerielle(row.localisation_interministerielle),
    },
    {
        name: 'n_ej',
        label: ColonneLibelles.N_EJ,
    },
    {
        name: 'tags',
        label: ColonneLibelles.TAGS,
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
        label: ColonneLibelles.THEME,
        displayed: false,
        renderFn: (row, _col) => row.programme?.theme ?? '',
    },
    {
        name: 'nom_programme',
        label: ColonneLibelles.PROGRAMME,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.programme?.code, row.programme?.label),
    },
    {
        name: 'ref_programmation',
        label: ColonneLibelles.REFERENTIEL_PROGRAMMATION,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.referentiel_programmation?.code, row.referentiel_programmation?.label),
    },
    {
        name: 'siret',
        label: ColonneLibelles.SIRET,
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name]['code'] : '',
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: 'qpv',
        label: ColonneLibelles.QPV,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.siret?.code_qpv, row.siret?.label_qpv)
    },
    {
        name: 'type_etablissement',
        label: ColonneLibelles.TYPE_ETABLISSEMENT,
        displayed: false,
        renderFn: (row, _col) => {
            if (! row.siret?.categorie_juridique)
                return "Non renseigné"
            return row.siret.categorie_juridique
        }
    },
    {
        name: 'compte_budgetaire',
        label: ColonneLibelles.COMPTE_BUDGETAIRE,
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name] : '',
    },
    {
        name: 'contrat_etat_region',
        label: ColonneLibelles.CPER,
        displayed: false,
        renderFn: (row, col) => row[col.name] && row[col.name] !== "#" ? row[col.name] : '',
    },
    {
        name: 'groupe_marchandise',
        label: ColonneLibelles.GROUPE_MARCHANDISE,
        displayed: false,
        renderFn: (row) => _print_code_label(row.groupe_marchandise?.code, row.groupe_marchandise?.label),
    },
    {
        name: 'date_cp',
        label: ColonneLibelles.DATE_DERNIER_PAIEMENT,
        displayed: false,
        renderFn: (row, col) =>
            row[col.name] ? new Date(row[col.name]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) : '',
    },
    {
        name: 'date_replication',
        label: ColonneLibelles.DATE_CREATION_EJ,
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
