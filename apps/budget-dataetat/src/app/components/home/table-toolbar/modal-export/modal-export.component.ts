import { Component, ViewEncapsulation, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchDataService } from '@services/search-data.service';
import { SearchParamsService } from '@services/search-params.service';
import { LignesFinancieresService, PrepareExportLignesExportPostRequestParams } from 'apps/clients/v3/financial-data';

@Component({
  selector: 'budget-modal-export',
  templateUrl: './modal-export.component.html',
  styleUrls: ['./modal-export.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalExportComponent {
  
  private _searchDataService = inject(SearchDataService);
  private _searchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  
  public isOnError = false;
  public isExportLaunched = false;
  public isProcessing = false;

  
  public allColumnsSelected: boolean = false;
  
  downloadRequested = output<{format: string, allColumns: boolean}>();
  exportToGristRequested = output<{allColumns: boolean}>();


  /**
   * Demande de téléchargement des données
   */
  downloadData(format: 'csv' | 'xlsx' | 'ods' | 'to-grist', allColumns: boolean): void {

    const sp = this._searchDataService.searchParams()
    const sanitized = this._searchParamsService.getSanitizedSearchParams(sp!)
    
    // Ici, c'est du fire and forget
    const params : PrepareExportLignesExportPostRequestParams = {
      ...sanitized,
      format: format,
    }
    if (allColumns) {
      params.colonnes = undefined
    }

    this.isOnError = false;
    this.isProcessing = true;
    this._lignesFinanciereService.prepareExportLignesExportPost(params).subscribe(
      {
        error: () => {
          this.isOnError = true;
        },
        complete: () => {
          this.isExportLaunched = true;
          this.isProcessing = false;
        }
      }
    )
  }

  /**
   * Demande d'export vers Grist
   */
  exportToGrist(allColumns: boolean): void {
    this.downloadData('to-grist', allColumns)
  }
}