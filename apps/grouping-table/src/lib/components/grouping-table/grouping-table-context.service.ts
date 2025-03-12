import { inject, Injectable } from '@angular/core';
import {
  ColumnMetaDataDef,
  ColumnsMetaData,
  Group,
  groupByColumns,
  GroupingColumn,
  RootGroup,
  RowData,
  TableData,
  VirtualGroup
} from './group-utils';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OutputEvents } from './output-events';
import { ProjectCellDirective } from './project-cell.directive';
import { ProjectGroupingDirective } from './project-grouping.directive';
import { Optional } from 'apps/common-lib/src/lib/utilities/optional.type';

@Injectable()
export class GroupingTableContextService {
  private domSanitizer = inject(DomSanitizer);

  data!: TableData;
  columnsMetaData!: ColumnsMetaData;
  groupingColumns!: GroupingColumn[];
  rootGroup!: RootGroup;
  displayedColumns!: ColumnMetaDataDef[];
  columnCssStyle: SafeHtml | null = null;

  /**
   * Initialisation du contexte.
   * Déclenche la mise à jour des données calculées pour la grid (dont le calcul des groupes).
   */
  initContext(
    data: TableData,
    columnsMetaData: ColumnsMetaData,
    groupingColumns: GroupingColumn[],
    dataChanges: boolean,
    virtualGroup: Optional<VirtualGroup> = null,
  ): number {
    let offsetGroupLevel = 0
    this.data = data;
    this.columnsMetaData = columnsMetaData;
    this.groupingColumns = groupingColumns;

    if (groupingColumns.length > 0 || !virtualGroup)
      this.rootGroup = this.calculateGroups(dataChanges);
    else { 
      // XXX Si aucun groupe définit par l'utilisateur, on utilise un rootGroup virtuel 
      // qui n'apparait pas en tant que tel
      this.rootGroup = new RootGroup({}, true)
      for (const row of this.data)
        this.rootGroup.addRow(row)
      offsetGroupLevel = 1
    }

    if (virtualGroup)
      this.rootGroup.addVirtualGroup(virtualGroup);

    this.displayedColumns = this.calculateDisplayedColumns();
    this.columnCssStyle = this.calculateColumnStyle();
    
    return offsetGroupLevel;
  }

  private calculateGroups(dataChanges: boolean): RootGroup {
    return groupByColumns(
      this.data,
      this.groupingColumns,
      this.columnsMetaData,
      this.rootGroup,
      dataChanges
    );
  }

  /**
   * Retourne la liste des colonnes à afficher
   * @returns ColumnMetaDataDef[]
   */
  private calculateDisplayedColumns(): ColumnMetaDataDef[] {
    return this.columnsMetaData.data.filter((col) => {
      return col.displayed === undefined || col.displayed;
    });
  }

  /**
   * Retourne les définitions de règles CSS pour chacune des colonnes.
   */
  private calculateColumnStyle(): SafeHtml | null {
    const colStyles: any[] = [];
    this.displayedColumns.forEach((col, i) => {
      if (!col.columnStyle) {
        return;
      }
      colStyles.push('.col-', i, ' {\n');
      for (const [k, v] of Object.entries(col.columnStyle)) {
        colStyles.push(k, ':', v, ';\n');
      }
      colStyles.push('}\n');
    });
    return colStyles.length
      ? this.domSanitizer.bypassSecurityTrustHtml(`<style>${colStyles.join('')}</style>`)
      : null;
  }

  isFolded(group: Group): boolean {
    return group.folded;
  }

  fold(group: Group) {
    group.folded = true;
  }

  unfold(group: Group) {
    group.folded = false;
  }

  /**
   * Alterne entre l'état plié et déplié pour le groupe.
   * @return true si plié, false sinon
   */
  toggle(group: Group): boolean {
    group.folded = !group.folded;
    return group.folded;
  }

  /*
   * Gestion des evenements pour le composant
   */
  private _outputEvents: OutputEvents | null = null;
  set outputEvents(outputEvents: OutputEvents) {
    this._outputEvents = outputEvents;
  }

  clickOnRow(row: RowData) {
    this._outputEvents?.['click-on-row'].emit(row);
  }

  // #region: customisation via content projection
  cellProjections: ProjectCellDirective[] = [];
  groupingProjections: ProjectGroupingDirective[] = [];

  projectionForCell(name: string): ProjectCellDirective | null {
    return (
      this.cellProjections?.find((projection) => {
        return projection.projectCell === name;
      }) || null
    );
  }

  projectionForGrouping(name: string): ProjectGroupingDirective | null {
    return (
      this.groupingProjections?.find((projection) => {
        return projection.projectGrouping === name;
      }) || null
    );
  }

  // #endregion
}
