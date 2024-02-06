import { AggregatorFns, ParameterizedColumnMetaDataDef, RowData } from "apps/grouping-table/src/lib/components/grouping-table/group-utils";
import { Laureats } from "../laureat.models";

const moneyFormat = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export type LaureatColumnMetaDataDef = ParameterizedColumnMetaDataDef<Laureats & RowData>

export const colonnes: LaureatColumnMetaDataDef[] = [
      { name: 'Structure', label: 'Lauréat' },
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