import { Injectable, inject } from '@angular/core';
import { Upload } from 'tus-js-client';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

export enum UploadType {
  FINANCIAL_AE = 'financial-ae',
  FINANCIAL_CP = 'financial-cp'
}

@Injectable({
  providedIn: 'root'
})
export class UploadTusService {
  private _settingsService = inject(SettingsBudgetService);
  private _logger = inject(LoggerService);

  /**
   * Upload d'un fichier via protocole TUS
   * @param file Le fichier à uploader
   * @param year L'année associée
   * @param sessionToken Le token de session
   * @param uploadType Le type d'upload
   * @returns Promise résolue quand l'upload est terminé
   */
  public uploadFile(file: File, year: number, sessionToken: string, uploadType: UploadType): Promise<void> {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: `${this._settingsService.apiFinancialDataV3}/import`,
        metadata: {
          filename: file.name,
          filetype: file.type,
          session_token: sessionToken,
          year: year.toString(),
          uploadType: uploadType,
        },
        onError: (error) => {
          this._logger.error('Erreur TUS:', error);
          reject(error);
        },
        onSuccess: () => {
          this._logger.info('Upload TUS terminé avec succès');
          resolve();
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          this._logger.debug(`Progression upload: ${percentage}%`);
        }
      });
      upload.start();
    });
  }

  /**
   * Upload de plusieurs fichiers en parallèle via TUS
   * @param files Array de fichiers avec leurs métadonnées
   * @param year L'année associée
   * @param sessionToken Le token de session partagé
   * @returns Promise résolue quand tous les uploads sont terminés
   */
  public uploadFiles(files: Array<{file: File, uploadType: UploadType}>, year: number, sessionToken: string): Promise<void[]> {
    const uploadPromises = files.map(({file, uploadType}) => 
      this.uploadFile(file, year, sessionToken, uploadType)
    );
    return Promise.all(uploadPromises);
  }
}