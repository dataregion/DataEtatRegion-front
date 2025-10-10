import { Component, ViewEncapsulation, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableExportService } from '../services/table-export.service';

@Component({
  selector: 'budget-modal-telechargement',
  templateUrl: './modal-telechargement.component.html',
  styleUrls: ['./modal-telechargement.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalTelechargementComponent {
  
  private _tableExportService = inject(TableExportService);
  
  public allColumnsSelected: boolean = false;
  
  downloadRequested = output<{format: string, allColumns: boolean}>();
  exportToGristRequested = output<{allColumns: boolean}>();

  public get isProcessing(): boolean {
    return this._tableExportService.isExporting();
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