import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AlertSnackBarComponent,
  AlertType,
} from '../components/snackbar/alert-snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private _snackBar: MatSnackBar) {}
  
  public openAlertCopiedInClipboard(content: string): void {
    this.openAlertSuccess(`'${content}' copié dans le presse-papier.`)
  }

  public openAlertSuccess(message: string): void {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: 5 * 1000,
      panelClass: 'toaster',
      data: {
        type: AlertType.Success,
        message: message,
      },
    });
  }

  public openAlertError(message: string, duration = 5): void {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
      panelClass: 'toaster',
      data: {
        type: AlertType.Error,
        message: message,
      },
    });
  }

  public openInfo(message: string): void {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: 5 * 1000,
      panelClass: 'toaster',
      data: {
        type: AlertType.Info,
        message: message,
      },
    });
  }
}
