import { inject, Injectable } from "@angular/core";
import {
  ColumnMetaDataDef,
  ColumnsMetaData,
  Group,
  groupByColumns,
  GroupingColumn,
  RootGroup,
  RowData,
  TableData
} from "./group-utils";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { OutputEvents } from "./output-events";
import { ProjectCellDirective } from "./project-cell.directive";

@Injectable()
export class GroupingTableContextService {
  private domSanitizer = inject(DomSanitizer);

  data!: TableData;
  columnsMetaData!: ColumnsMetaData;
  groupingColumns!: GroupingColumn[];
  rootGroup!: RootGroup;
  displayedColumns!: ColumnMetaDataDef[];
  foldedGroups = new Set<Group>();
  columnCssStyle: SafeHtml | null = null;

  /**
   * Initialisation du contexte.
   * Déclenche la mise à jour des données calculées pour la grid (dont le calcul des groupes).
   */
  initContext(
    data: TableData,
    columnsMetaData: ColumnsMetaData,
    groupingColumns: GroupingColumn[],
  ) {
    this.data = data;
    this.columnsMetaData = columnsMetaData;
    this.groupingColumns = groupingColumns;

    this.rootGroup = this.calculateGroups();
    this.displayedColumns = this.calculateDisplayedColumns();
    this.columnCssStyle = this.calculateColumnStyle();
  }

  private calculateGroups(): RootGroup {
    return groupByColumns(this.data, this.groupingColumns, this.columnsMetaData);
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
    return group ? this.foldedGroups.has(group) : false;
  }

  fold(group: Group) {
    this.foldedGroups.add(group);
  }

  unfold(group: Group) {
    this.foldedGroups.delete(group);
  }

  /**
   * Alterne entre l'état plié et déplié pour le groupe.
   * @return true si plié, false sinon
   */
  toggle(group: Group): boolean {
    if (this.isFolded(group)) {
      this.unfold(group);
      return false;
    } else {
      this.fold(group);
      return true;
    }
  }

  /*
   * Gestion des evenements pour le composant
   */
  private _outputEvents: OutputEvents | null = null;
  set outputEvents(outputEvents: OutputEvents) {
    this._outputEvents = outputEvents;
  }
 
  clickOnRow(row: RowData) {
    this._outputEvents?.["click-on-row"].emit(row);
  }

  // #region: customisation via content projection
  cellProjections: ProjectCellDirective[] = [];

  projectionForCell(name: string): ProjectCellDirective | null {
    return this.cellProjections?.find(projection => {
      return projection.projectCell === name;
    }) || null;
  }
  // #endregion
}
