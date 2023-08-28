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
  displayedColumns: ColumnMetaDataDef[];
};

/**
 * Boite de dialogue pour la sélection et l'ordre des colonnes à afficher et exporter.
 */
@Component({
  selector: 'lib-structure-columns-dialog',
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
  displayedColumns: ColumnMetaDataDef[];

  constructor(
    private dialogRef: MatDialogRef<StructureColumnsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: StructureColumnsDialogData
  ) {
    this.displayedColumns = dialogData.displayedColumns;
  }

  /**
   * Retourne la liste des colonnes pouvant être cachées dans le tableau de données
   * @returns boolean
   */
  getHideableColumns() {
    return this.displayedColumns.filter(col => {
      return col.hideable === undefined || col.hideable;
    });
  }

  /**
   * Vérifie si une colonne spécifique est affichée
   * @param name Nom de la colonne
   * @returns 
   */
  isColumnDisplayed(name: string) {
    let col = this.getHideableColumns().filter(col => {
      return col.name === name;
    })[0];
    return col.displayed === undefined || col.displayed;
  }

  /**
   * Vérifie si toutes les colonnes sont affichées
   * @returns boolean
   */
  allDisplayed() {
    let columns = this.getHideableColumns();
    return columns.filter(col => {
      return col.displayed === undefined || col.displayed;
    }).length === columns.length;
  }

  /**
   * Modifie l'ordre des colonnes à afficher
   * @param event Event DragDrop
   */
  moveColumn(event: CdkDragDrop<ColumnMetaDataDef[]>) {
    // Récupération de la liste des colonnes dans une variable
    let columnsToSort = this.getHideableColumns();
    // Ordonnement des colonnes
    moveItemInArray(
      columnsToSort,
      event.previousIndex,
      event.currentIndex
    );
    // Réinsertion des colonnes à absolument afficher
    this.displayedColumns.filter(col => {
      return col.hideable !== undefined && !col.hideable;
    }).forEach((col, index) => {
      columnsToSort.splice(index, 0, col);
    })
    // Sauvegarde des colonnes à afficher
    this.displayedColumns = columnsToSort;
  }

  /**
   * Récupère la colonne associée à la checkbox et modifie son attribut displayed
   * @param event 
   */
  onCheckboxChange(event: MatCheckboxChange) {
    const col = this.getHideableColumns().filter(col => {
      return col.name === event.source._elementRef.nativeElement.getAttribute('data-column');
    })[0];
    // Si la propriété n'est pas définie, la colonne était visible par défaut : on passe à false
    col.displayed = col.displayed !== undefined ? !col.displayed : false;
  }

  /**
   * Change l'attribut displayed de toutes les colonnes
   */
  onAllCheckboxChange() {
    const allDisplayed = this.allDisplayed();
    this.getHideableColumns().forEach(function (col) {
      col.displayed = !allDisplayed;
    });
  }

  /**
   * A la fermeture du dialog, retour de toutes les colonnes au HomeComponent
   */
  validate() {
    this.dialogRef.close(new ColumnsMetaData(this.displayedColumns));
  }
}
