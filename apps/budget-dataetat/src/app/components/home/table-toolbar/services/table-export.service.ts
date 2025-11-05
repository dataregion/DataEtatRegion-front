import { Injectable, inject, DestroyRef, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { DisplayedOrderedColumn, ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import { SearchDataService } from '@services/search-data.service';
import { MatomoTracker } from 'ngx-matomo-client';
import { BudgetToGristService } from 'apps/clients/budget/api/budgetToGrist.service';
import { GristDataModel } from 'apps/clients/budget/model/gristDataModel';
import { AlertService } from 'apps/common-lib/src/public-api';

const LIMITE_EXPORT = 6_000;

@Injectable()
export class TableExportService {
  private _destroyRef = inject(DestroyRef);
  private _datePipe = inject(DatePipe);
  private _colonnesService = inject(ColonnesService);
  private _tracker = inject(MatomoTracker);
  private _exportDataService = inject(ExportDataService);
  private _searchDataService = inject(SearchDataService);
  private _alertService = inject(AlertService);

  private _budgetTogrist = inject(BudgetToGristService);

  // Signaux pour l'état de l'export
  private _isExporting = signal(false);
  private _total = signal(0);
  private _currentCount = signal(0);

  public readonly isExporting = this._isExporting.asReadonly();
  public readonly total = this._total.asReadonly();
  public readonly currentCount = this._currentCount.asReadonly();

  public readonly isOverExportLimit = computed(() => {
    const totaux = this._searchDataService.total();
    return (totaux?.total ?? 0) > LIMITE_EXPORT;
  });

  public readonly currentResultsCount = computed(() => {
    const current_results = this._searchDataService.searchResults() as BudgetFinancialDataModel[];
    return current_results?.length ?? 0;
  });

  public readonly isExportDisabled = computed(() => {
    const isSearching = this._searchDataService.searchInProgress();
    return this.isOverExportLimit() || isSearching || this.isExporting();
  });

  public readonly exportTooltip = computed(() => {
    if (!this.isOverExportLimit()) return '';
    return `Le téléchargement est limité à ${LIMITE_EXPORT.toLocaleString(
      'fr-FR'
    )} lignes. Veuillez affiner votre recherche.`;
  });

  /**
   * Génère le nom de fichier pour l'export
   */
  private _generateFilename(extension: string): string {
    const searchParams = this._searchDataService.searchParams();

    let filename = `${this._datePipe.transform(new Date(), 'yyyyMMdd')}_export`;

    if (searchParams?.locations) {
      const locations = searchParams.locations;
      filename += '_' + locations[0].type?.toLowerCase() + '-';
      filename += locations
        .filter((loc) => loc.code)
        .map((loc) => loc.code)
        .join('-');
    }

    if (searchParams?.bops) {
      const bops = searchParams.bops;
      filename +=
        '_bops-' +
        bops
          .filter((bop) => bop.code)
          .map((bop) => bop.code)
          .join('-');
    }

    return filename + '.' + extension;
  }

  private _loadMoreIfNecessary(callback: () => void): boolean {
    let notifyDoEarlyReturn = false;
    const current_results = this._searchDataService.searchResults() as BudgetFinancialDataModel[];
    const pagination = this._searchDataService.pagination();

    if (current_results.length < LIMITE_EXPORT && pagination?.has_next) {
      const loadMore$ = this._searchDataService.loadMore();
      loadMore$?.pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next: () => callback(),
        error: () => this._isExporting.set(false)
      });
      notifyDoEarlyReturn = true;
    }

    return notifyDoEarlyReturn;
  }

  private exportColumns(allColumns: boolean) {
    const selected_colonnes = this._colonnesService.selectedColonnesTable();
    const all_colonnes = this._colonnesService.allColonnesTable();
    const colonnes = allColumns ? all_colonnes : selected_colonnes;
    const export_colonnes = colonnes.map((col) => ({
      columnLabel: col.label,
      displayed: true
    } as DisplayedOrderedColumn));
    return export_colonnes
  }
  
  private _initExporting() {
    const current_results = this._searchDataService.searchResults() as BudgetFinancialDataModel[];
    const totaux = this._searchDataService.total();

    this._isExporting.set(true);
    this._total.set(totaux?.total ?? 0);
    this._currentCount.set(current_results.length);
  }

  /**
   * Télécharge les données au format spécifié
   */
  public downloadData(format: string, allColumns: boolean): void {
    const current_results = this._searchDataService.searchResults() as BudgetFinancialDataModel[];

    this._initExporting();

    const callback = () => this.downloadData(format, allColumns);
    const shouldEarlyReturn = this._loadMoreIfNecessary(callback);
    if (shouldEarlyReturn) return;

    try {
      this._tracker.trackEvent('Export', 'Click', format, undefined, { allColumns: allColumns });

      const export_colonnes = this.exportColumns(allColumns)
      const blob = this._exportDataService.getBlob(current_results ?? [], format, export_colonnes);

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this._generateFilename(format);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      this._isExporting.set(false);
    }
  }

  /**
   * Exporte les données vers Grist
   */
  public exportToGrist(allColumns: boolean): void {
    
    this._initExporting();

    const callback = () => this.exportToGrist(allColumns);
    const shouldEarlyReturn = this._loadMoreIfNecessary(callback);
    if (shouldEarlyReturn) return;

    try {
      this._tracker.trackEvent('Export', 'Click', 'grist', undefined, { allColumns: allColumns });

      const export_colonnes = this.exportColumns(allColumns);
      const current_results = this._searchDataService.searchResults() as BudgetFinancialDataModel[];
      const data_to_export = this._exportDataService.getDataToExport(current_results, export_colonnes);

      const data = {data: data_to_export} as GristDataModel;
      this._budgetTogrist.postBugdetToGrist(data)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe(
              {
                next:() => {
                  this._alertService.openAlertSuccess(`Les données ont bien été transférées dans votre espace Grist.`);
                },
                error: (err: Error) => {
                  this._alertService.openAlert("error", err, 8);
                  this._isExporting.set(false);
                },
                complete:() => {
                  this._isExporting.set(false);
                }
              }
          )
    } catch (error) {
      console.error("Erreur lors de l'export vers Grist:", error);
      this._isExporting.set(false);
    }
  }
}