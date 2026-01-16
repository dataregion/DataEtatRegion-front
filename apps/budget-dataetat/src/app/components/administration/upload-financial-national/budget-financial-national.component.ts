import { Component, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { AlertService } from 'apps/common-lib/src/public-api';
import { UploadTusService, UploadType } from '../../../services/upload-tus.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';



@Component({
  selector: 'budget-upload-financial-national',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-financial-national.component.html',
  styleUrls: ['./budget-financial-national.component.scss']
})
export class BudgetFinancialNationalComponent {
  @ViewChild('fileUploadAe') fileUploadAe!: ElementRef<HTMLInputElement>;
  @ViewChild('fileUploadCp') fileUploadCp!: ElementRef<HTMLInputElement>;
  
  private _alertService = inject(AlertService);
  private _uploadTusService = inject(UploadTusService);  
  private _logger = inject(LoggerService);
  public readonly requiredFileType: string = '.csv';
  public years: number[] = [];
  public yearSelected: number = new Date().getFullYear();

  public fileFinancialAe: File | null = null;
  public fileFinancialCp: File | null = null;

  public uploadInProgress = signal(false);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onFileAeChange(event: any) {
    const f: File = event.target.files[0];
    this.fileFinancialAe = f ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onFileCpChange(event: any) {
    const f: File = event.target.files[0];
    this.fileFinancialCp = f ?? null;
  }



  public uploadFiles() {
    const { year } = this.form.value;
    this._logger.debug('Uploading files:', year, this.fileFinancialAe, this.fileFinancialCp);
    if (this.fileFinancialAe !== null && this.fileFinancialCp !== null && year) {
      
      this.uploadInProgress.set(true);
      const sessionToken = uuidv4();
      
      const filesToUpload = [
        { file: this.fileFinancialAe, uploadType: UploadType.FINANCIAL_AE },
        { file: this.fileFinancialCp, uploadType: UploadType.FINANCIAL_CP }
      ];
      
      this._uploadTusService.uploadFiles(filesToUpload, year, sessionToken)
        .then(() => {
          this._logger.info('Upload terminé avec succès');
          this.fileFinancialAe = null;
          this.fileFinancialCp = null;
          
          // Réinitialiser visuellement les inputs de fichier
          if (this.fileUploadAe?.nativeElement) {
            this.fileUploadAe.nativeElement.value = '';
          }
          if (this.fileUploadCp?.nativeElement) {
            this.fileUploadCp.nativeElement.value = '';
          }

          this._alertService.openAlertSuccess('Les fichiers ont bien été récupérés. Les données seront disponibles dans l\'outil à partir de demain.');
        })
        .catch((error) => {
          this._alertService.openAlertError('Une erreur est survenue lors de l\'upload des fichiers.');
          this._logger.error('Erreur lors de l\'upload TUS:', error);
        })
        .finally(() => {
          this.uploadInProgress.set(false);
        });
    }
  }


}
