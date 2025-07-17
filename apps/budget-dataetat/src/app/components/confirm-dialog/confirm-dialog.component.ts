import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/**
 * Boite de dialogue pour la sélection des colonnes du tableau selon lesquelles regrouper les données.
 */
@Component({
  templateUrl: './confirm-dialog.component.html',
  styles: ['.dialog-title { display: inline-flex; width: 100%;justify-content: space-between; }'],
  imports: [MatDialogModule, MatIconModule]
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  public year: string;

  constructor() {
    const data = this.data;

    this.year = data;
  }

  public validate(): void {
    this.dialogRef.close(true);
  }
}
