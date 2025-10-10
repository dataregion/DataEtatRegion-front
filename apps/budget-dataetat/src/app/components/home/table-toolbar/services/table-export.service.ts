import { Injectable, inject, DestroyRef, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import { SearchDataService } from '@services/search-data.service';
import { MatomoTracker } from 'ngx-matomo-client';

const LIMITE_EXPORT = 6_000;

@Injectable()
export class TableExportService {
  
  private _destroyRef = inject(DestroyRef);
  private _datePipe = inject(DatePipe);
  private _colonnesService = inject(ColonnesService);
  private _tracker = inject(MatomoTracker);
  private _exportDataService = inject(ExportDataService);
  private _searchDataService = inject(SearchDataService);

  // Signaux pour l'état de l'export
  private _isExporting = signal(false);
  
  // Computed pour les informations d'export
  public readonly isExporting = this._isExporting.asReadonly();
  
  public readonly isOverExportLimit = computed(() => {
    const totaux = this._searchDataService.total();
    return (totaux?.total ?? 0) > LIMITE_EXPORT;
  });
  
  public readonly currentResultsCount = computed(() => {
    const current_results = this._searchDataService.searchResults() as FinancialDataModel[];
    return current_results?.length ?? 0;
  });

  public readonly isExportDisabled = computed(() => {
    const isSearching = this._searchDataService.searchInProgress();
    return this.isOverExportLimit() || isSearching || this.isExporting();
  });
  
  public readonly exportTooltip = computed(() => {
    if (!this.isOverExportLimit()) return '';
    return `Le téléchargement est limité à ${LIMITE_EXPORT.toLocaleString('fr-FR')} lignes. Veuillez affiner votre recherche.`;
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
      filename += '_bops-' + bops
        .filter((bop) => bop.code)
        .map((bop) => bop.code)
        .join('-');
    }

    return filename + '.' + extension;
  }

  /**
   * Télécharge les données au format spécifié
   */
  public downloadData(format: string, allColumns: boolean): void {
    this._isExporting.set(true);

    const current_results = this._searchDataService.searchResults() as FinancialDataModel[];
    const selected_colonnes = this._colonnesService.selectedColonnesTable();
    const pagination = this._searchDataService.pagination();
    const all_colonnes = this._colonnesService.allColonnesTable();
    
    // Si on n'a pas toutes les données et qu'il y en a plus à charger
    if (current_results.length < LIMITE_EXPORT && pagination?.has_next) {
      const loadMore$ = this._searchDataService.loadMore();
      loadMore$
        ?.pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => this.downloadData(format, allColumns),
          error: () => this._isExporting.set(false)
        });
      return;
    }

    try {
      // Tracking Matomo
      this._tracker.trackEvent("Export", "Click", format, undefined, { "allColumns": allColumns });

      const colonnes = allColumns ? all_colonnes : selected_colonnes;
      const export_colonnes = colonnes.map(col => ({
        columnLabel: col.label,
        displayed: true
      }));

      const blob = this._exportDataService.getBlob(
        current_results ?? [],
        format,
        export_colonnes,
      );
      
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
    if (this.isExportDisabled()) {
      return;
    }

    this._isExporting.set(true);
    
    try {
      // Tracking Matomo
      this._tracker.trackEvent("Export", "Click", "grist", undefined, { "allColumns": allColumns });
      
      // TODO: Implémenter l'export Grist quand disponible
      console.warn('[TableExportService] exportToGrist non implémenté', { allColumns });
      
      // Simulation d'un délai pour l'export
      setTimeout(() => {
        this._isExporting.set(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'export vers Grist:', error);
      this._isExporting.set(false);
    }
  }
}