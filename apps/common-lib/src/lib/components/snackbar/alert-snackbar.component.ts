import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

 
export enum AlertType {
  Error = 'error',
  Success = 'success',
  Info = 'info'
}

export interface AlertMessage {
  message: string;
  type: AlertType;
}

 

@Component({
    selector: 'lib-snackbar',
    templateUrl: './alert-snackbar.component.html',
    styles: ['h3 {font-size: 1.25rem; line-height: 1.75rem; font-weight: 700}'],
    standalone: false
})
export class AlertSnackBarComponent {
  alert = inject<AlertMessage>(MAT_SNACK_BAR_DATA);

  public classAlert: string;
  public title: string;

  constructor() {
    const alert = this.alert;

    this.classAlert = 'fr-alert--info';
    this.title = 'Information';
    if (alert.type === AlertType.Error) {
      this.classAlert = 'fr-alert--error';
      this.title = 'Erreur';
    }
    if (alert.type === AlertType.Success) {
      this.classAlert = 'fr-alert--success';
      this.title = 'Succès';
    }
  }
}
