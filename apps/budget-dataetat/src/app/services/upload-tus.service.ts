import { Injectable, inject } from '@angular/core';
import { DetailedError, Upload } from 'tus-js-client';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import Keycloak from 'keycloak-js';

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
  private _keycloak = inject(Keycloak);

  /**
   * Upload d'un fichier via protocole TUS
   * @param file Le fichier à uploader
   * @param sessionToken Le token de session
   * @param uploadType Le type d'upload
   * @param indice L'indice du fichier dans sa catégorie (AE ou CP)
   * @returns Promise résolue quand l'upload est terminé
   */
  public uploadFile(
    file: File,
    sessionToken: string,
    uploadType: UploadType,
    indice: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: `${this._settingsService.apiFinancialDataV3}/import`,
        headers: {
          'Authorization': `Bearer ${this._keycloak.token}`
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          session_token: sessionToken,
          uploadType: uploadType,
          indice: indice.toString(),
        },
        onError: (error) => {
          const errorDetail = error as DetailedError;
          this._logger.error('Erreur TUS:', error);
          reject(errorDetail.originalResponse || error);
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
   * Upload de plusieurs fichiers AE et CP en parallèle via TUS
   * @param aeFiles Array de fichiers AE (Engagements)
   * @param cpFiles Array de fichiers CP (Montants payés)
   * @param year L'année associée
   * @param sessionToken Le token de session partagé pour corréler les fichiers côté backend
   * @returns Promise résolue quand tous les uploads sont terminés
   */
  public uploadFiles(
    aeFiles: File[],
    cpFiles: File[],
    sessionToken: string
  ): Promise<void[]> {
    const aePromises = aeFiles.map((file, indice) =>
      this.uploadFile(file, sessionToken, UploadType.FINANCIAL_AE, indice)
    );
    const cpPromises = cpFiles.map((file, indice) =>
      this.uploadFile(file, sessionToken, UploadType.FINANCIAL_CP, indice)
    );

    return Promise.all([...aePromises, ...cpPromises]);
  }
}