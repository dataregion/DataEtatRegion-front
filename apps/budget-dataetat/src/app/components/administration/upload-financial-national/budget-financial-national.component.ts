import { Component, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import {Upload} from 'tus-js-client';
import { AlertService } from 'apps/common-lib/src/public-api';



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
    console.log('Uploading files:', year, this.fileFinancialAe, this.fileFinancialCp);
    if (this.fileFinancialAe !== null && this.fileFinancialCp !== null && year) {
      
      this.uploadInProgress.set(true);
      const sessionToken = uuidv4();
      Promise.all([
        this.uploadViaTus(this.fileFinancialAe, year, sessionToken, 'financial-ae'),
        this.uploadViaTus(this.fileFinancialCp, year, sessionToken, 'financial-cp')
      ])
        .then(() => {
          console.log('Upload terminé avec succès');
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
          console.error('Erreur lors de l\'upload TUS:', error);
        })
        .finally(() => {
          this.uploadInProgress.set(false);
        });
    }
  }

  /**
   * Upload du fichier via protocole Tus
   */
  private uploadViaTus(file: File, year: number, sessionToken: string, uploadType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: 'http://localhost:8050/financial-data/api/v3/import',
        metadata: {
          filename: file.name,
          filetype: file.type,
          session_token: sessionToken,
          year: year.toString(),
          uploadType: uploadType,
        },
        onError: (error) => {
          console.error('Erreur TUS:', error);
          reject(error);
        },
        onSuccess: () => {
          console.log('Upload TUS terminé avec succès');
          resolve();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`Progression upload: ${percentage}%`);
          // TODO: Mettre à jour une barre de progression si nécessaire
        }
      });
      upload.start();
    });
  }
}
