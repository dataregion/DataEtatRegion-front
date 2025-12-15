import { Component, ViewEncapsulation, inject, output, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchDataService } from '@services/search-data.service';
import { SearchParamsService } from '@services/search-params.service';
import { DoExportLignesExportPostRequestParams, LignesFinancieresService } from 'apps/clients/v3/financial-data';

interface ModaleViewState {
  isOnError: boolean
  isExportLaunched: boolean
  isProcessing: boolean
}

@Component({
  selector: 'budget-modal-export',
  templateUrl: './modal-export.component.html',
  styleUrls: ['./modal-export.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalExportComponent implements AfterViewInit, ModaleViewState {
  
  @ViewChild('modalExport') modalElement!: ElementRef;
  
  private cdr = inject(ChangeDetectorRef);
  private _searchDataService = inject(SearchDataService);
  private _searchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);

  
  // region : view state
  // XXX: On gère le viewstate correctement pour éviter les changed after check
  public isOnError = false;
  public isExportLaunched = false;
  public isProcessing = false;

  public resetViewState() {
    this.updateViewState(
      {
        isOnError: false,
        isExportLaunched: false,
        isProcessing: false,
      }
    )
  }
  public updateViewState(state: ModaleViewState) {
    setTimeout(() => {
      this.isOnError = state.isOnError;
      this.isExportLaunched = state.isExportLaunched;
      this.isProcessing = state.isProcessing;
      this.cdr.markForCheck();
    })
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
    this.resetViewState();
  }


  /**
   * Demande de téléchargement des données
   */
  downloadData(format: 'csv' | 'xlsx' | 'ods' | 'to-grist', allColumns: boolean): void {

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

    this.updateViewState({isOnError: false, isProcessing: true, isExportLaunched: false})
    this._lignesFinanciereService.doExportLignesExportPost(params).subscribe(
      {
        error: () => {
          this.updateViewState({isOnError: true, isProcessing: false, isExportLaunched: this.isExportLaunched})
        },
        complete: () => {
          this.updateViewState({isOnError: false, isProcessing: false, isExportLaunched: true})
          this.isExportLaunched = true;
          this.isProcessing = false;
          this.cdr.markForCheck();
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