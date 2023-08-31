import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ColumnsMetaData,
  ColumnMetaDataDef,
  DisplayedOrderedColumn
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
import { colonnes } from '@models/tableau/colonnes.model';

export type StructureColumnsDialogData = {
  defaultOrder: string[];
  columns: ColumnMetaDataDef[];
  displayedOrderedColumns: DisplayedOrderedColumn[]
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

  // Référence pour toujours connaître l'ordre de base des colonnes
  defaultOrder: string[];
  // Liste des colonnes pour l'affichage de la liste
  columns: ColumnMetaDataDef[];
  // Liste des statuts des colonnes
  displayedOrderedColumns: DisplayedOrderedColumn[]

  constructor(
    private dialogRef: MatDialogRef<StructureColumnsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: StructureColumnsDialogData
  ) {
    this.defaultOrder = dialogData.defaultOrder;
    this.columns = dialogData.columns;
    this.displayedOrderedColumns = dialogData.displayedOrderedColumns;
    // Si il n'y avais aucune option, on créé le tableau par rapport aux colonnes 
    if (this.displayedOrderedColumns.length === 0) {
      this.columns.forEach((col) => {
        this.displayedOrderedColumns.push({ columnLabel: col.label });
      })
    }
  }

  /**
   * Vérifie si une colonne spécifique est affichée
   * @param label Nom de la colonne
   * @returns 
   */
  isColumnDisplayed(label: string) {
    return this.displayedOrderedColumns.filter((col) => {
      return col.columnLabel === label && (col.displayed === undefined || col.displayed);
    }).length === 1 || this.displayedOrderedColumns.length === 0;
  }

  /**
   * Vérifie si toutes les colonnes sont affichées
   * @returns boolean
   */
  allDisplayed() {
    return this.displayedOrderedColumns.filter((col) => {
      return col.displayed === undefined || col.displayed;
    }).length === this.columns.length || this.displayedOrderedColumns.length === 0;
  }

  /**
   * Modifie l'ordre des colonnes à afficher
   * @param event Event DragDrop
   */
  moveColumn(event: CdkDragDrop<ColumnMetaDataDef[]>) {
    // Ordonnement des colonnes de la liste
    moveItemInArray(
      this.columns,
      event.previousIndex,
      event.currentIndex
    );
    // On ordonne selon le nouvel ordre
    this.displayedOrderedColumns.sort((col1, col2) => {
      let index1 = this.columns.findIndex((col) => col1.columnLabel === col.label)
      let index2 = this.columns.findIndex((col) => col2.columnLabel === col.label)
      return index1 - index2;
    });
  }

  /**
   * Récupère la colonne associée à la checkbox et modifie son attribut displayed
   * @param event 
   */
  onCheckboxChange(event: MatCheckboxChange) {
    let col = this.displayedOrderedColumns.map((col) => {
      if (col.columnLabel === event.source._elementRef.nativeElement.getAttribute('data-column'))
        col = this._toggleCheckboxBoolean(col, event.checked)
    });
  }

  /**
   * Change l'attribut displayed de toutes les colonnes
   */
  onAllCheckboxChange() {
    let allDisplayed = this.allDisplayed()
    this.displayedOrderedColumns.forEach((col) => {
      col = this._toggleCheckboxBoolean(col, !allDisplayed)
    });
  }

  /**
   * Toggle du statut displayed de la colonne : si true => on supprime la clé
   * @param col Colonne dont on doit gérer le displayed
   * @param checked Nouvelle valeur du displayed
   * @returns 
   */
  private _toggleCheckboxBoolean(col: DisplayedOrderedColumn, checked: boolean): DisplayedOrderedColumn {
    if (checked)
      delete col.displayed;
    else
      col.displayed = false;
    return col
  }

  /**
   * A la fermeture du dialog, retour de toutes les colonnes au HomeComponent
   */
  validate() {
    // Si tout est affiché et en ordre, on vide la sauvegarde
    let newOrder: string[] = this.columns.map((col) => col.label)
    let sameOrder = (this.defaultOrder.length === newOrder.length) && this.defaultOrder.every((value, index) => value === newOrder[index]);  
    if (sameOrder && this.allDisplayed()) {
      this.displayedOrderedColumns = []
    }
    this.dialogRef.close(this.displayedOrderedColumns);
  }
}
