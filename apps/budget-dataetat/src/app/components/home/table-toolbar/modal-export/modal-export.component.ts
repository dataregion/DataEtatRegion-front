import { Component, ViewEncapsulation, inject, output, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchDataService } from '@services/search-data.service';
import { SearchParamsService } from '@services/search-params.service';
import { DoExportLignesExportPostRequestParams, LignesFinancieresService } from 'apps/clients/v3/financial-data';

@Component({
  selector: 'budget-modal-export',
  templateUrl: './modal-export.component.html',
  styleUrls: ['./modal-export.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalExportComponent implements AfterViewInit {
  
  @ViewChild('modalExport') modalElement!: ElementRef;
  
  private _searchDataService = inject(SearchDataService);
  private _searchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);

  
  public isOnError = signal(false);
  public isExportLaunched = signal(false);
  public isProcessing = signal(false);

  public reset() {
    this.isOnError.set(false);
    this.isExportLaunched.set(false);
    this.isProcessing.set(false);
  }
  // endregion

  
  public allColumnsSelected: boolean = false;
  
  downloadRequested = output<{format: string, allColumns: boolean}>();
  exportToGristRequested = output<{allColumns: boolean}>();

  ngAfterViewInit(): void {
    const modaleEl = this.modalElement.nativeElement

    modaleEl.addEventListener('dsfr.disclose', this.onOpen.bind(this));
  }

  private onOpen() {
    this.reset();
  }

  doLaunchExport(format: 'csv' | 'xlsx' | 'ods' | 'to-grist', allColumns: boolean): void {

    const sp = this._searchDataService.searchParams()
    const sanitized = this._searchParamsService.getSanitizedSearchParams(sp!)
    
    // Ici, c'est du fire and forget
    const params : DoExportLignesExportPostRequestParams = {
      ...sanitized,
      format: format,
    }
    if (allColumns) {
      params.colonnes = undefined
    }

    this.isProcessing.set(true);
    this._lignesFinanciereService.doExportLignesExportPost(params).subscribe(
      {
        error: () => {
          this.reset();
          this.isOnError.set(true)
        },
        complete: () => {
          this.reset()
          this.isExportLaunched.set(true)
        }
      }
    )
  }

  /**
   * Demande d'export vers Grist
   */
  exportToGrist(allColumns: boolean): void {
    this.doLaunchExport('to-grist', allColumns)
  }
}