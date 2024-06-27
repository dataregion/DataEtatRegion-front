import { HttpErrorResponse } from '@angular/common/http';
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

  public openAlertSuccess(message: string, duration = 5): void {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
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

  public openInfo(message: string, duration = 5): void {
    this._snackBar.openFromComponent(AlertSnackBarComponent, {
      duration: duration * 1000,
      panelClass: 'toaster',
      data: {
        type: AlertType.Info,
        message: message,
      },
    });
  }

  public openAlert(status: string, err: Error, timing: number = 8): void {
    // Récupération du bon message d'erreur
    let message = ""
    if ((err as HttpErrorResponse).error !== undefined) {
      message = (err as HttpErrorResponse).error.message
    } else {
      message = err.message
    }
    // Alert avec le bon statut
    switch (status) {
      case "success":
        this.openAlertSuccess(message, timing)
        break;
      case "info":
        this.openInfo(message, timing)
        break;
      case "error":
        this.openAlertError(message, timing)
        break;
      default:
        break;
    }
  }

}
