import { LocalisationInterministerielle } from "@models/financial/common.models";
import { FinancialDataModel } from "@models/financial/financial-data.models";
import { Tag } from "@models/refs/tag.model";
import { ColonneCodes, ColonneLibelles } from "@services/colonnes.service";
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
        name: ColonneCodes.BENEFICIAIRE,
        label: ColonneLibelles.BENEFICIAIRE, 
        renderFn: (row) => {
            return row.siret?.nom_beneficiaire ?? ''
        }
    },
    {
        name: ColonneCodes.MONTANT_AE,
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
        name: ColonneCodes.ANNEE_ENGAGEMENT,
        label: ColonneLibelles.ANNEE_ENGAGEMENT,
        grouping: true,
        columnStyle: {
            'min-width': '22ex',
            'flex-grow': '0',
        },
    },
    {
        name: ColonneCodes.MONTANT_CP,
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
        name: ColonneCodes.DOMAINE,
        label: ColonneLibelles.DOMAINE,
        renderFn: (row, _col) => {
            if (row.domaine_fonctionnel)
                return _print_code_label(row.domaine_fonctionnel.code, row.domaine_fonctionnel.label)
            return '';
        },
    },
    {
        name: ColonneCodes.COMMUNE,
        label: ColonneLibelles.COMMUNE,
        renderFn: (row, _col) => {
            return row.commune?.label;
        },
    },
    {
        name: ColonneCodes.CRTE,
        label: ColonneLibelles.CRTE,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_crte,
    },
    {
        name: ColonneCodes.EPCI,
        label: ColonneLibelles.EPCI,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_epci,
    },
    {
        name: ColonneCodes.ARRONDISSEMENT,
        label: ColonneLibelles.ARRONDISSEMENT,
        displayed: false,
        renderFn: (row, _col) => row.commune?.arrondissement?.label,
    },
    {
        name: ColonneCodes.DEPARTEMENT,
        label: ColonneLibelles.DEPARTEMENT,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_departement,
    },
    {
        name: ColonneCodes.REGION,
        label: ColonneLibelles.REGION,
        displayed: false,
        renderFn: (row, _col) => row.commune?.label_region,
    },
    {
        name: ColonneCodes.LOC_INTER,
        label: ColonneLibelles.LOC_INTER,
        renderFn: (row, _col) => _print_localisation_interministerielle(row.localisation_interministerielle),
    },
    {
        name: ColonneCodes.N_EJ,
        label: ColonneLibelles.N_EJ,
    },
    {
        name: ColonneCodes.TAGS,
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
        name: ColonneCodes.THEME,
        label: ColonneLibelles.THEME,
        displayed: false,
        renderFn: (row, _col) => row.programme?.theme ?? '',
    },
    {
        name: ColonneCodes.PROGRAMME,
        label: ColonneLibelles.PROGRAMME,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.programme?.code, row.programme?.label),
    },
    {
        name: ColonneCodes.REFERENTIEL_PROGRAMMATION,
        label: ColonneLibelles.REFERENTIEL_PROGRAMMATION,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.referentiel_programmation?.code, row.referentiel_programmation?.label),
    },
    {
        name: ColonneCodes.SIRET,
        label: ColonneLibelles.SIRET,
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name]['code'] : '',
        columnStyle: {
            'min-width': '16ex',
            'flex-grow': '0',
        },
    },
    {
        name: ColonneCodes.QPV,
        label: ColonneLibelles.QPV,
        displayed: false,
        renderFn: (row, _col) => _print_code_label(row.siret?.code_qpv, row.siret?.label_qpv)
    },
    {
        name: ColonneCodes.TYPE_ETABLISSEMENT,
        label: ColonneLibelles.TYPE_ETABLISSEMENT,
        displayed: false,
        renderFn: (row, _col) => {
            if (! row.siret?.categorie_juridique)
                return "Non renseigné"
            return row.siret.categorie_juridique
        }
    },
    {
        name: ColonneCodes.COMPTE_BUDGETAIRE,
        label: ColonneLibelles.COMPTE_BUDGETAIRE,
        displayed: false,
        renderFn: (row, col) => row[col.name] ? row[col.name] : '',
    },
    {
        name: ColonneCodes.CPER,
        label: ColonneLibelles.CPER,
        displayed: false,
        renderFn: (row, col) => row[col.name] && row[col.name] !== "#" ? row[col.name] : '',
    },
    {
        name: ColonneCodes.GROUPE_MARCHANDISE,
        label: ColonneLibelles.GROUPE_MARCHANDISE,
        displayed: false,
        renderFn: (row) => _print_code_label(row.groupe_marchandise?.code, row.groupe_marchandise?.label),
    },
    {
        name: ColonneCodes.DATE_DERNIER_PAIEMENT,
        label: ColonneLibelles.DATE_DERNIER_PAIEMENT,
        displayed: false,
        renderFn: (row, col) =>
            row[col.name] ? new Date(row[col.name]).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' }) : '',
    },
    {
        name: ColonneCodes.DATE_CREATION_EJ,
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
