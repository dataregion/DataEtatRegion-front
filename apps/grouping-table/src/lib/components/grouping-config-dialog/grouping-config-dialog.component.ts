import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ColumnMetaDataDef, GroupingColumn } from '../grouping-table/group-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

export type GroupingConfigDialogData = {
  groupingOrder: string[];
  columns: ColumnMetaDataDef[];
  groupingColumns: GroupingColumn[];
};

/**
 * Boite de dialogue pour la sélection des colonnes du tableau selon lesquelles regrouper les données.
 */
@Component({
    templateUrl: './grouping-config-dialog.component.html',
    styleUrls: ['./grouping-config-dialog.component.scss'],
    imports: [
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatSelectModule,
        DragDropModule
    ]
})
export class GroupingConfigDialogComponent {
  readonly allColumns: ColumnMetaDataDef[];
  groupingColumns: ColumnMetaDataDef[];
  remainingColumns: ColumnMetaDataDef[];
  groupingOrder: string[];

  constructor(
    private _dialogRef: MatDialogRef<GroupingConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: GroupingConfigDialogData
  ) {
    this.groupingOrder = dialogData.groupingOrder;
    this.allColumns = dialogData.columns
      .filter(
        (col) =>
          this.groupingOrder.includes(col.name) ||
          dialogData.groupingColumns.map((col) => col.columnName).includes(col.name)
      )
      .sort((col1, col2) => {
        const index1 = this.groupingOrder.findIndex((col) => col === col1.name);
        const index2 = this.groupingOrder.findIndex((col) => col === col2.name);
        return index1 - index2;
      });

    const columnByName: Record<string, ColumnMetaDataDef> = {};
    for (const col of dialogData.columns) {
      columnByName[col.name] = col;
    }

    this.groupingColumns = dialogData.groupingColumns.map(
      (gpCol) => columnByName[gpCol.columnName]
    );
    this.remainingColumns = this.calculateRemainingColumns(this.allColumns, this.groupingColumns);
  }

  /**
   * Retourne les colonnes qui ne sont pas déjà utilisées pour le grouping (pour proposer leur ajout).
   */
  private calculateRemainingColumns(
    allColumns: ColumnMetaDataDef[],
    groupingColumns: ColumnMetaDataDef[]
  ) {
    // On construit un set contenant les noms de colonnes utilisées pour le grouping.
    const usedColumnNames = new Set<string>();
    for (const col of groupingColumns) {
      usedColumnNames.add(col.name);
    }
    // On retourne les colonnes dont les noms ne sont pas dans le set.
    return allColumns.filter((col) => !usedColumnNames.has(col.name));
  }

  moveGroup(event: CdkDragDrop<ColumnMetaDataDef[]>) {
    moveItemInArray(this.groupingColumns, event.previousIndex, event.currentIndex);
  }

  addGroup(event: MatSelectChange) {
    this.groupingColumns.push(event.value);
    this.remainingColumns = this.calculateRemainingColumns(this.allColumns, this.groupingColumns);
  }

  removeGroup(index: number) {
    this.groupingColumns.splice(index, 1);
    this.remainingColumns = this.calculateRemainingColumns(this.allColumns, this.groupingColumns);
  }

  validate() {
    this._dialogRef.close(
      this.groupingColumns.map(
        (col): GroupingColumn => ({
          columnName: col.name
        })
      )
    );
  }
}
