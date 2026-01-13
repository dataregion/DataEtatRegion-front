import { Component, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import {Upload} from 'tus-js-client';



@Component({
  selector: 'budget-upload-financial-national',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-financial-national.component.html',
  styleUrls: ['./budget-financial-national.component.scss']
})
export class BudgetFinancialNationalComponent {
  @ViewChild('confirmUploadModal') confirmModal!: ElementRef<HTMLDialogElement>;
  
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
      
      // Upload seulement le fichier AE via TUS
      this.uploadViaTus(this.fileFinancialAe, year)
        .then(() => {
          console.log('Upload terminé avec succès');
          // Réinitialiser les fichiers après upload réussi
          this.fileFinancialAe = null;
          this.fileFinancialCp = null;
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
  private uploadViaTus(file: File, year: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: '/newapi/financial-data/api/v3/import', // TODO: Remplacer par votre endpoint
        metadata: {
          filename: file.name,
          filetype: file.type,
          token : "toto",
          year: year.toString(),
          uploadType: 'financial-ae'
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
