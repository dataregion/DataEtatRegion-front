import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ColumnsMetaData,
  ColumnMetaDataDef
} from '../grouping-table/group-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

export type StructureColumnsDialogData = {
  columns: ColumnMetaDataDef[];
  displayedColumns: ColumnMetaDataDef[];
};

/**
 * Boite de dialogue pour la sélection et l'ordre des colonnes à afficher et exporter.
 */
@Component({
  standalone: true,
  templateUrl: './structure-columns-dialog.component.html',
  styleUrls: ['./structure-columns-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    DragDropModule,
  ],
})
export class StructureColumnsDialogComponent {
  columns: ColumnMetaDataDef[];
  displayedColumns: ColumnMetaDataDef[];

  constructor(
    private dialogRef: MatDialogRef<StructureColumnsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: StructureColumnsDialogData
  ) {
    this.columns = dialogData.columns;
    this.displayedColumns = dialogData.displayedColumns.slice(1);
  }

  /**
   * Vérifie si une colonne spécifique est sélectionnée
   * @param name Nom de la colonne
   * @returns 
   */
  isColumnDisplayed(name: string) {
    return this.displayedColumns.filter(col => {
      return col.name === name;
    })[0].displayed;
  }

  /**
   * Vérifie si toutes les colonnes sont sélectionnées
   * @returns boolean
   */
  allDisplayed() {
    return this.displayedColumns.filter(col => {
      return col.displayed;
    }).length === this.displayedColumns.length;
  }

  /**
   * Modifie l'ordre des colonnes dans l'array
   * @param event Event DragDrop
   */
  moveColumn(event: CdkDragDrop<ColumnMetaDataDef[]>) {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  /**
   * Récupère la colonne associée à la checkbox et modifie son attribut displayed
   * @param event 
   */
  onCheckboxChange(event: MatCheckboxChange) {
    const col = this.displayedColumns.filter(col => {
      return col.name === event.source._elementRef.nativeElement.getAttribute('data-column');
    })[0];
    col.displayed = !col.displayed;
  }

  /**
   * Change l'attribut displayed de toutes les colonnes
   */
  onAllCheckboxChange() {
    const allDisplayed = this.allDisplayed();
    this.displayedColumns.forEach(function (col) {
      col.displayed = !allDisplayed;
    });
  }

  /**
   * Retourne au HomeComponent la liste des colonnes à afficher, en remettant le Bénéficiaire au début
   */
  validate() {
    // Remise en place du Bénéficiaire en première colonne
    this.displayedColumns = [this.columns[0]].concat(this.displayedColumns);
    this.dialogRef.close(new ColumnsMetaData(this.displayedColumns));
  }
}
