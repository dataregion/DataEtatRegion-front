import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * Boite de dialogue pour la sélection des colonnes du tableau selon lesquelles regrouper les données.
 */
@Component({
    templateUrl: './confirm-dialog.component.html',
    styles: ['.dialog-title { display: inline-flex; width: 100%;justify-content: space-between; }'],
    standalone: false
})
export class ConfirmDialogComponent {
  public title: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,  
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {
    this.title = data;
  }

  public validate(): void {
    this.dialogRef.close(true);
  }
}
