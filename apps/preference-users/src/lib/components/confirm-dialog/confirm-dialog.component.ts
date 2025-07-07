import { Component, inject } from '@angular/core';
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
  public dialogRef : MatDialogRef<ConfirmDialogComponent> = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  public title: string = inject(MAT_DIALOG_DATA);

  public validate(): void {
    this.dialogRef.close(true);
  }
}
