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
        name: 'territoire',
        label: 'Territoire',
      },
      {
        name: 'Synthèse',
        label: 'Synthèse',
      },
]