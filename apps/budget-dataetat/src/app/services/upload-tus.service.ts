import { Injectable, inject } from '@angular/core';
import { Upload } from 'tus-js-client';
import { SettingsBudgetService } from '../environments/settings-budget.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import Keycloak from 'keycloak-js';

export enum UploadType {
  FINANCIAL_AE = 'financial-ae',
  FINANCIAL_CP = 'financial-cp'
}

/**
 * Contexte de session pour la corrélation des fichiers côté backend
 */
export interface SessionContext {
  totalAeFiles: number;
  totalCpFiles: number;
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
   * @param year L'année associée
   * @param sessionToken Le token de session
   * @param uploadType Le type d'upload
   * @param sessionContext Contexte de session avec le nombre total de fichiers AE et CP
   * @returns Promise résolue quand l'upload est terminé
   */
  public uploadFile(
    file: File,
    year: number,
    sessionToken: string,
    uploadType: UploadType,
    sessionContext: SessionContext
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: 'http://localhost:8050/financial-data/api/v3/import', // URL de l'endpoint TUS (doit être configuré côté backend)
        // endpoint: `${this._settingsService.apiFinancialDataV3}/import`,
        headers: {
          'Authorization': `Bearer ${this._keycloak.token}`
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
          session_token: sessionToken,
          year: year.toString(),
          uploadType: uploadType,
          total_ae_files: sessionContext.totalAeFiles.toString(),
          total_cp_files: sessionContext.totalCpFiles.toString(),
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
    year: number,
    sessionToken: string
  ): Promise<void[]> {
    const sessionContext: SessionContext = {
      totalAeFiles: aeFiles.length,
      totalCpFiles: cpFiles.length,
    };

    const aePromises = aeFiles.map((file) =>
      this.uploadFile(file, year, sessionToken, UploadType.FINANCIAL_AE, sessionContext)
    );
    const cpPromises = cpFiles.map((file) =>
      this.uploadFile(file, year, sessionToken, UploadType.FINANCIAL_CP, sessionContext)
    );

    return Promise.all([...aePromises, ...cpPromises]);
  }
}