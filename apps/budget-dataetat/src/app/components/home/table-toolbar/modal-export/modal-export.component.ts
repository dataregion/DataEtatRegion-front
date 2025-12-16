import {
  Component,
  ViewEncapsulation,
  inject,
  output,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DownloadExportService } from '@services/download-export.service';
import { SearchDataService } from '@services/search-data.service';
import { SearchParamsService } from '@services/search-params.service';
import {
  DoExportLignesExportPostRequestParams,
  ExportFinancialTask,
  LignesFinancieresService
} from 'apps/clients/v3/financial-data';
import { exhaustMap, Subscription, timer } from 'rxjs';

@Component({
  selector: 'budget-modal-export',
  templateUrl: './modal-export.component.html',
  styleUrls: ['./modal-export.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [FormsModule]
})
export class ModalExportComponent {
  private _downloadExportService = inject(DownloadExportService);
  private _searchDataService = inject(SearchDataService);
  private _searchParamsService = inject(SearchParamsService);
  private _lignesFinanciereService: LignesFinancieresService = inject(LignesFinancieresService);
  private _watcherSubscription?: Subscription;
  private _doExportSubscription?: Subscription;

  public isOnError = signal(false);
  public isExportLaunched = signal(false);
  public isProcessing = signal(false);
  public isExportAvailable = signal(false);

  public availableExportId?: string;

  public reset() {
    this.isOnError.set(false);
    this.isExportLaunched.set(false);
    this.isProcessing.set(false);
    this.isExportAvailable.set(false);

    this._doExportSubscription?.unsubscribe();
    this._watcherSubscription?.unsubscribe();
  }
  // endregion

  public allColumnsSelected: boolean = false;

  downloadRequested = output<{ format: string; allColumns: boolean }>();
  exportToGristRequested = output<{ allColumns: boolean }>();

  doLaunchExport(format: 'csv' | 'xlsx' | 'ods' | 'to-grist', allColumns: boolean): void {
    const sp = this._searchDataService.searchParams();
    const sanitized = this._searchParamsService.getSanitizedSearchParams(sp!);

    // Ici, c'est du fire and forget
    const params: DoExportLignesExportPostRequestParams = {
      ...sanitized,
      format: format
    };
    if (allColumns) {
      params.colonnes = undefined;
    }

    this.isProcessing.set(true);
    this._doExportSubscription?.unsubscribe();
    this._doExportSubscription = this._lignesFinanciereService
      .doExportLignesExportPost(params)
      .subscribe({
        next: (response) => {
          this.reset();
          this.isExportLaunched.set(true);
          this.watchCurrentExportTask(response.data!);
        },
        error: () => {
          this.reset();
          this.isOnError.set(true);
        }
      });
  }

  /** Surveille la tâche d'export lancée pour proposer le téléchargement à terme. */
  watchCurrentExportTask(task: ExportFinancialTask) {
    this._watcherSubscription?.unsubscribe();
    this._watcherSubscription = timer(2_000, 10_000)
      .pipe(
        exhaustMap(() =>
          this._lignesFinanciereService.getExportLignesExportUuidGet({ uuid: task.prefect_run_id })
        )
      )
      .subscribe({
        next: (res) => {
          this.checkCurrentExportTask(res.data!);
        }
      });
  }

  checkCurrentExportTask(task: ExportFinancialTask) {
    if (task.status !== 'DONE') {
      this.isExportAvailable.set(false);
      this.availableExportId = undefined;
      return;
    }

    this.isExportAvailable.set(true);
    this.availableExportId = task.prefect_run_id;
    this._downloadExportService.downloadExport(undefined, this.availableExportId);
    this.reset();
  }

  onExportDownload(event: Event, export_id: string) {
    this._downloadExportService.downloadExport(event, export_id);
    this.reset();
  }
}
