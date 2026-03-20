import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AlertService } from 'apps/common-lib/src/public-api';
import { UploadTusService } from '../../../services/upload-tus.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { DsfrUploadDndComponent } from '@edugouvfr/ngx-dsfr-ext';
import { ImportChorusService } from 'apps/clients/v3/financial-data';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'budget-upload-financial-national',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DsfrUploadDndComponent],
  templateUrl: './budget-financial-national.component.html',
  styleUrls: ['./budget-financial-national.component.scss']
})
export class BudgetFinancialNationalComponent {
  private _alertService = inject(AlertService);
  private _uploadTusService = inject(UploadTusService);
  private _logger = inject(LoggerService);
  private _importChorusService = inject(ImportChorusService);
  public readonly requiredFileType: string = '.csv';
  public years: number[] = [];
  public yearSelected: number = new Date().getFullYear();

  public filesAe = signal<File[]>([]);
  public filesCp = signal<File[]>([]);

  public uploadInProgress = signal(false);

  /** Signal pour forcer la reconstruction des composants upload après un upload réussi */
  public showUploadComponents = signal(true);

  public form: FormGroup;

  constructor() {
    const max_year = new Date().getFullYear();
    let arr = Array(8).fill(new Date().getFullYear());
    arr = arr.map((_val, index) => max_year - index);
    this.years = arr;

    this.form = new FormGroup({
      year: new FormControl(this.yearSelected)
    });
  }

  /**
   * Handler pour la sélection de fichiers AE
   * @param files Tableau de fichiers sélectionnés
   */
  public onFilesAeChange(files: File[]): void {
    this.filesAe.set(files);
    this._logger.debug('Fichiers AE sélectionnés:', files.length);
  }

  /**
   * Handler pour la sélection de fichiers CP
   * @param files Tableau de fichiers sélectionnés
   */
  public onFilesCpChange(files: File[]): void {
    this.filesCp.set(files);
    this._logger.debug('Fichiers CP sélectionnés:', files.length);
  }

  public uploadFiles() {
    const { year } = this.form.value;
    const aeFiles = this.filesAe();
    const cpFiles = this.filesCp();

    this._logger.debug('Uploading files:', year, 'AE:', aeFiles.length, 'CP:', cpFiles.length);

    if (aeFiles.length > 0 && cpFiles.length > 0 && year) {
      this.uploadInProgress.set(true);
      let sessionToken = '';
      firstValueFrom(
        this._importChorusService.initializeSessionImportSessionInitializePost({
          initializeSessionRequest: {
            total_ae_files: aeFiles.length,
            total_cp_files: cpFiles.length,
            year
          }
        })
      )
        .then((initializeResponse) => {
          sessionToken = initializeResponse?.['session_token'] ?? '';
          if (!sessionToken) {
            throw new Error("Le backend n'a pas renvoyé de session_token");
          }

          return this._uploadTusService.uploadFiles(aeFiles, cpFiles, sessionToken);
        })
        .then(() => {
          return firstValueFrom(
            this._importChorusService.checkSessionImportSessionSessionTokenGet({ sessionToken })
          );
        })
        .then(() => {
          this._logger.info('Upload terminé avec succès');

          // Réinitialiser les fichiers
          this.filesAe.set([]);
          this.filesCp.set([]);

          // Forcer la reconstruction des composants upload
          // en les masquant puis les réaffichant
          this.showUploadComponents.set(false);
          setTimeout(() => {
            this.showUploadComponents.set(true);
          }, 0);

          this._alertService.openAlertSuccess(
            "Les fichiers ont bien été récupérés. Les données seront disponibles dans l'outil à partir de demain."
          );
        })
        .catch((error) => {
          let message = "Une erreur est survenue lors de l'upload des fichiers.";
          if (
            typeof error?.getUnderlyingObject === 'function' &&
            error.getUnderlyingObject()?.response
          ) {
            message =
              "Une erreur est survenue lors de l'upload des fichiers: " +
                JSON.parse(error.getUnderlyingObject().response).message || message;
          } else if (error?.error?.message) {
            message =
              "Une erreur est survenue lors de l'upload des fichiers: " + error.error.message;
          }
          this._alertService.openAlertError(message);
          this._logger.error("Erreur lors de l'upload TUS:", error);
        })
        .finally(() => {
          this.uploadInProgress.set(false);
        });
    }
  }
}
