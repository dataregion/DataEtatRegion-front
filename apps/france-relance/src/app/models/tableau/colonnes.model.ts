import { AggregatorFns, ParameterizedColumnMetaDataDef, RowData } from "apps/grouping-table/src/lib/components/grouping-table/group-utils";
import { FrontLaureat } from "../laureat.models";
import { SourceLaureatsData } from "../common.model";

const moneyFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

function _prettyPrintSource(source: SourceLaureatsData) {
    if (source == SourceLaureatsData.RELANCE) {
        return "France Relance"
    } else if (source == SourceLaureatsData.FRANCE2030) {
        return "France 2030"
    } else {
        return source ?? 'Inconnue'
    }
}

function _print_code_label_if_code(c: string, l : string): string {
  const code = c ?? '';
  const label = l ?? '';
  return  code !== '' ? `${code} - ${label}` : '';
}

export type LaureatColumnMetaDataDef = ParameterizedColumnMetaDataDef<FrontLaureat & RowData>

export const colonnes: LaureatColumnMetaDataDef[] = [
      { name: 'Structure', label: 'Lauréat' },
      { 
        name: 'source', 
        label: 'Source',
        renderFn: (row, _) => _prettyPrintSource(row?.source)
      },
      {
        name: 'SubventionAccordée',
        label: 'Montant',
        renderFn: (row, col) =>
          row[col.name] ? moneyFormat.format(row[col.name]) : row[col.name],
        aggregateReducer: AggregatorFns.sum,
        aggregateRenderFn: (aggregateValue) =>
          aggregateValue ? moneyFormat.format(aggregateValue) : aggregateValue,
        columnStyle: {
          'text-align': 'right',
          'min-width': '16ex',
          'flex-grow': '0',
        },
      },
      {
        name: 'axe',
        label: 'Axe',
      },
      {
        name: 'sous-axe',
        label: 'Sous Axe',
      },
      {
        name: 'dispositif',
        label: 'Dispositif',
      },
      {
        name: 'Synthèse',
        label: 'Synthèse',
      },
      {
        name: 'region',
        label: 'Région du SIRET',
        renderFn: (row, _) => _print_code_label_if_code(row.code_region, row.label_region)
      },
      {
        name: 'departement',
        label: 'Département du SIRET',
        renderFn: (row, _) => _print_code_label_if_code(row.code_departement, row.label_departement)
      },
      {
        name: 'epci',
        label: 'EPCI du SIRET',
        renderFn: (row, _) => _print_code_label_if_code(row.code_epci, row.label_epci)
      },
      {
        name: 'commune',
        label: 'Commune du SIRET',
        renderFn: (row, _) => _print_code_label_if_code(row.code_commune, row.label_commune)
      },
      {
        name: 'arrondissement',
        label: 'Arrondissement du SIRET',
        renderFn: (row, _) => _print_code_label_if_code(row.code_arrondissement, row.label_arrondissement)
      },
]