import { Component, ViewEncapsulation, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoaderService } from 'apps/common-lib/src/lib/services/loader.service';

@Component({
  selector: 'budget-modal-telechargement',
  templateUrl: './modal-telechargement.component.html',
  styleUrls: ['./modal-telechargement.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalTelechargementComponent {
  
  private _loaderService = inject(LoaderService);
  
  public isProcessing = false;
  
  // État de la checkbox pour toutes les colonnes
  public allColumnsSelected: boolean = false;
  
  // Outputs pour communiquer avec le composant parent
  downloadRequested = output<{format: string, allColumns: boolean}>();
  exportToGristRequested = output<{allColumns: boolean}>();
  
  constructor() {
    this._loaderService.isLoading().subscribe(
      next => {
        this.isProcessing = next;
      }
    )
  }

  /**
   * Demande de téléchargement des données
   */
  downloadData(format: 'csv' | 'xlsx' | 'ods', allColumns: boolean): void {
    if (this.isProcessing) {
      return;
    }
    this.downloadRequested.emit({ format, allColumns });
  }

  /**
   * Demande d'export vers Grist
   */
  exportToGrist(allColumns: boolean): void {
    if (this.isProcessing) {
      return;
    }
    this.exportToGristRequested.emit({ allColumns });
  }
}