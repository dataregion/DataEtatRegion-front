/* eslint no-unused-vars: 0 */  // --> OFF

export type AggregateReducerContext = {
  row: RowData;
  group: Group;
};

type AggregateReducer<T> = (
  currentValue: any,
  context: AggregateReducerContext,
  accumulator?: T
) => T;

/**
 * Méta-données d'une colonne. Contient les informations pour l'affichage de la colonne.
 */
export type ColumnMetaDataDef = {
  /** Nom technique de la colonne. */
  name: string;

  /** Libellé de la colonne, affiché dans le tableau. */
  label: string;

  /** Libellé de la colonne, moins important que le libellé cu-dessus */
  sub_label?: string | undefined;

  /** La colonne est-elle affichée dans le tableau de données (undefined => true) */
  displayed?: boolean | undefined;

  /** La colonne est-elle affichée dans le tableau de données (undefined => true) */
  grouping?: boolean | undefined;

  /**
   * Fonction de rendu permettant d'adapter la valeur de la cellule avant affichage.
   * Peut permettre d'afficher une valeur différente de celle de la cellule, ou de gérer les sous-objets.
   * @param row ligne de données
   * @param col colonne de la cellule
   */
  renderFn?: (row: RowData, col: ColumnMetaDataDef) => string | undefined;

  /**
   * Fonction permettant d'effectuer le grouping.
   * Différent de la fonction de rendu.
   * @param row ligne de données
   * @param col colonne de la cellule
   */
  groupingKeyFn?: (row: RowData, col: ColumnMetaDataDef) => string | undefined;

  /**
   * Fonction d'aggrégation permettant de calculer la valeur à afficher en en-tête de colonne d'un groupe.
   * @param currentValue
   * @param context
   * @param accumulator
   */
  aggregateReducer?: AggregateReducer<any>;

  /**
   * Fonction de rendu permettant d'adapter la valeur calculée sur le header de groupe avant affichage.
   * @param aggregateValue valeur agrégée
   * @param row ligne de données
   * @param col colonne
   */
  aggregateRenderFn?: (
    aggregateValue: any,
    group: Group,
    col: ColumnMetaDataDef
  ) => string | undefined;

  /**
   * Styles css à appliquer sur les cellules de la colonne.
   * Permet par exemple de spécifier des contraintes de dimensionnement (`min-width`, `max-width`) ou d'alignement.
   *
   * Attention : la largeur ne doit en aucun cas dépendre du contenu des cellules. C'est important pour que chaque ligne
   * d'une même colonne ait la même largeur.
   */
  columnStyle?: Record<string, string>;
};

export class AggregatorFns {
  static sum(
    currentValue: any,
    context: AggregateReducerContext,
    accumulator?: number
  ): number | undefined {
    if (!currentValue) {
      return accumulator;
    }
    return (accumulator || 0) + Number(currentValue);
  }

  static average(
    currentValue: number | undefined,
    context: AggregateReducerContext,
    accumulator?: number
  ): number {
    const nbRows = context.group.rows?.length || 0;
    if (nbRows <= 1) {
      return currentValue || 0;
    }
    return ((accumulator || 0) * (nbRows - 1) + (currentValue || 0)) / nbRows;
  }

  static count(
    currentValue: any,
    context: AggregateReducerContext,
    accumulator?: number
  ): number {
    return (accumulator || 0) + 1;
  }
}

/**
 * Méta-données pour l'ensemble des colonnes.
 */
export class ColumnsMetaData {
  private metaDataMap = new Map<string, ColumnMetaDataDef>();

  constructor(public readonly data: ColumnMetaDataDef[]) {
    for (const def of data) {
      this.metaDataMap.set(def.name, def);
    }
  }

  getByColumnName(name: string): ColumnMetaDataDef {
    const metaDataDef = this.metaDataMap.get(name);
    if (!metaDataDef) {
      throw new Error(`Pas de meta-données pour la colonne "${name}"`);
    }
    return metaDataDef;
  }
}

export type ColumnSizes = number[];

/**
 * Ligne de donées.
 */
export type RowData = Record<string, any>;

/**
 * Données du tableau (ensemble de lignes).
 */
export type TableData = RowData[];

export type GroupingColumn = {
  columnName: string;
  selected?: boolean;
};

export type DisplayedOrderedColumn = {
  columnLabel: string;
  displayed?: boolean;
};

/**
 * Un groupe, qui peut contenir soit des groupes enfants, soit des lignes de données.
 */
export class Group {
  private _count = 0;
  private groupsMap?: Map<any, Group>;
  aggregates?: Record<string, any>;
  rows?: RowData[];
  folded: boolean = true;

  /** Nombre total d'éléments (= nombre d'éléments + nombre d'éléments dans les sous-groupes). */
  get count() {
    return this._count;
  }

  _group_desc(a: Group, b: Group) {
    if (a.columnValue < b.columnValue) return 1;
    if (a.columnValue > b.columnValue) return -1;
    return 0
  }

  get groups() {
    if (!this.groupsMap) {
      return [];
    }
    return [...this.groupsMap.values()];
  }

  get groups_desc() {
    return this.groups.sort(this._group_desc);
  }

  constructor(
    public readonly column?: ColumnMetaDataDef,
    public readonly columnValue?: any,
    public readonly parent?: Group,
    private _columnsAggregateFns?: Record<string, AggregateReducer<any>>
  ) {}

  getOrCreateGroup(column: ColumnMetaDataDef, groupColumnGroupingKey: any, groupColumnValue: any): Group {
    if (!this.groupsMap) {
      this.groupsMap = new Map();
    }
    let group = this.groupsMap.get(groupColumnGroupingKey);
    if (!group) {
      group = new Group(
        column,
        groupColumnValue,
        this,
        this._columnsAggregateFns
      );
      this.groupsMap.set(groupColumnGroupingKey, group);
    }
    return group;
  }

  addRow(row: RowData) {
    if (!this.rows) {
      this.rows = [];
    }
    this.rows.push(row);
    if (this._columnsAggregateFns) {
      this.aggregateColumnValues(row);
    }
  }

  aggregateColumnValues(row: RowData) {
    if (!this.aggregates) {
      this.aggregates = {};
    }
    // On incrémente le nombre d'éléments
    this._count += 1;
    // On met à jour les aggrégats pour chacune des colonnes.
    for (const columnName in this._columnsAggregateFns) {
      const aggregateFn = this._columnsAggregateFns[columnName];
      this.aggregates[columnName] = aggregateFn(
        row[columnName],
        { row, group: this },
        this.aggregates[columnName]
      );
    }
    // On les met à jour pour les groupes parents également.
    this.parent?.aggregateColumnValues(row);
  }
}

/**
 * Groupe racine.
 */
export class RootGroup extends Group {
  constructor(aggregateReducers: Record<string, AggregateReducer<any>>) {
    super(undefined, undefined, undefined, aggregateReducers);
  }
}

/**
 * Fonction de regroupement des données.
 *
 * @param table
 * @param groupings
 * @param columnsMetaData
 */
export const groupByColumns = (
  table: TableData,
  groupings: GroupingColumn[],
  columnsMetaData: ColumnsMetaData,
  previousRoot: RootGroup
): RootGroup => {
  // On construit l'ensemble des fonctions d'aggrégation.
  const aggregateFns: Record<string, AggregateReducer<any>> = {};
  // ... Cet ensemble reprend les fonctions d'aggrégation définies sur chacune des colonnes
  for (const colMetaData of columnsMetaData.data) {
    if (colMetaData.aggregateReducer) {
      aggregateFns[colMetaData.name] = colMetaData.aggregateReducer;
    }
  }

  // Vérification : la nouvelle structure de grouping (Grouping[]) a-t-elle changé par rapport à l'ancienne (RootGroup) 
  let same: boolean = false;
  if (previousRoot && previousRoot.groups.length !== 0) {
    // On travaille avec une copie de groupings car on va faire des shift() 
    same = _check_grouping_structure([...groupings], previousRoot)
  }

  // Si aucun changement de structure, on ne recréé pas les groupes et on retourne l'ancien contexte
  let root = previousRoot
  if (!same) {
    root = new RootGroup(aggregateFns);
    for (const row of table) {
      let currentGroup = root;
      // tant qu'on n'a pas trouvé le niveau le plus profond où ranger la ligne, on descend
      for (const grouping of groupings) {
        const column = columnsMetaData.getByColumnName(grouping.columnName);
  
        const defaultRenderFn = ((row: RowData, col: ColumnMetaDataDef) => row[col.name]);
        const groupValueFn = column.renderFn || defaultRenderFn;
        const groupKeyFn = column.groupingKeyFn || groupValueFn;
  
        const groupKey = groupKeyFn(row, column);
        const groupValue = groupValueFn(row, column);
        currentGroup = currentGroup.getOrCreateGroup(column, groupKey, groupValue);
      }
      currentGroup.addRow(row);
    }
  }
  return root;
};

/**
 * Fonction récursive qui compare la nouvelle structure de grouping avec l'ancienne
 */
const _check_grouping_structure = (newGroupings: GroupingColumn[], group: Group):boolean => {
  // Si on a parcouru tous les nouveaux ou anciens groupes : dernière vérification
  if (newGroupings.length === 0 || group.groups.length === 0) {
    // S'il ne reste plus aucun groupe dans la nouvelle ET dans l'ancienne structure : on dépile true
    return newGroupings.length === 0 && group.groups.length === 0;
  }

  // Si on a une différence entre les noms de colonnes alors la structure a changé : on dépile false
  if (newGroupings[0].columnName !== group.groups[0].column?.name) {
    return false;
  }
  
  // On continue de plonger avec des nouveaux paramètres : pop sur le nouveau grouping & récupération du groupe enfant de l'ancienne structure 
  newGroupings.shift()
  return _check_grouping_structure(newGroupings ?? [], group.groups[0]);
}