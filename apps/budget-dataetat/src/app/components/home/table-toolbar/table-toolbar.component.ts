import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, ViewEncapsulation, input, DestroyRef } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { ModalGroupingComponent } from './modal-grouping/modal-grouping.component';
import { ModalColonnesComponent } from "./modal-colonnes/modal-colonnes.component";
import { ModalSauvegardeComponent } from "./modal-sauvegarde/modal-sauvegarde.component";
import { ModalTelechargementComponent } from "./modal-telechargement/modal-telechargement.component";
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { PreferenceService } from '@services/preference.service';
import { Preference } from 'apps/preference-users/src/lib/models/preference.models';
import { ExportDataService } from 'apps/appcommon/src/lib/export-data.service';
import { SearchDataService } from '@services/search-data.service';
import { MatomoTracker } from 'ngx-matomo-client';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaterialModule } from "apps/common-lib/src/public-api";

const LIMITE_EXPORT = 6_000;

@Component({
  selector: 'budget-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  imports: [CommonModule, ModalGroupingComponent, ModalColonnesComponent, ModalSauvegardeComponent, ModalTelechargementComponent, MaterialModule],
  styleUrls: ['./table-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableToolbarComponent {
  
  private _destroyRef = inject(DestroyRef);
  private _datePipe = inject(DatePipe)
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _colonnesService = inject(ColonnesService);
  private _preferenceService = inject(PreferenceService);
  private readonly _tracker = inject(MatomoTracker)
  private _exportDataService = inject(ExportDataService);

  public _searchDataService = inject(SearchDataService);

  public readonly grouped = input<boolean>(false);

  public readonly searchData = input<FinancialDataModel[]>([]);
  
  public searchFinish: boolean = true
  public searchInProgress: boolean = false

  public readonly grid_fullscreen = this._gridFullscreen.isFullscreen;


  tableData?: TableData;
  virtualGroupFn?: (_: TableData) => VirtualGroup;

  toggleGridFullscreen() {
    this._gridFullscreen.toggleFullscreen();
  }

  get fullscreen_label() {
    if (!this.grid_fullscreen()) return 'Agrandir le tableau';
    else return 'Rétrécir le tableau';
  }
  
  private get is_over_export_limit(): boolean {
    const totaux = this._searchDataService.total()
    const is_over_limit = (totaux?.total ?? 0) > LIMITE_EXPORT;
    return is_over_limit
  }
  
  public get is_export_disabled(): boolean {
    const is_searching = this.searchInProgress;
    
    return this.is_over_export_limit || is_searching;
  }
  
  public get export_tooltip(): string {
    if (!this.is_over_export_limit) return '';
    return `Le téléchargement est limité à ${LIMITE_EXPORT.toLocaleString('fr-FR')} lignes. Veuillez affiner votre recherche.`;
  }

  isGrouped() {
    return this._colonnesService.grouped();
  }

  get selectedGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this._colonnesService.selectedColonnesGrouping();
  }

  get selectedGrouped(): string[] {
    return this._colonnesService.selectedColonnesGrouped();
  }

  get currentPreference(): Preference | null {
    return this._preferenceService.currentPreference();
  }

  public exportToGrist(allColumns: boolean): void {
    // TODO: brancher l’export Grist quand disponible
    console.warn('[TableToolbar] exportToGrist non implémenté', { allColumns });
  }

  private _filename(extension: string): string {
    const searchParams = this._searchDataService.searchParams()
    
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

    filename = filename + '.' + extension;
    return filename;
  }

  public downloadData(extension: string, allColumns: boolean): void {
    
    const current_results = this._searchDataService.searchResults() as FinancialDataModel[]
    const selected_colonnes = this._colonnesService.selectedColonnesTable()
    const pagination = this._searchDataService.pagination()
    const all_colonnes = this._colonnesService.allColonnesTable()
    
    if (current_results.length < LIMITE_EXPORT && pagination?.has_next) {
      const loadMore$ = this._searchDataService.loadMore()
      loadMore$
        ?.pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: () => this.downloadData(extension, allColumns),
        });
      return
    }
    this._tracker.trackEvent("Export","Click", extension, undefined, {"allColumns": allColumns});

    const colonnes = (allColumns)? all_colonnes : selected_colonnes;
    const export_colonnes = colonnes.map(col => {
      return { columnLabel: col.label, displayed: true }
    });

    const blob = this._exportDataService.getBlob(
      current_results ?? [],
      extension,
      export_colonnes,
    );
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this._filename(extension);
      document.body.appendChild(a);
      a.click();
    }
  }

  // public exportToGrist(allColumns: boolean): void {
  //   if (this.searchData.searchForm.valid && !this.searchData.searchInProgress.value) {
  //     this.tracker.trackEvent("Export","Click", "grist", undefined, {"allColumns": allColumns});
  //     this.searchData.searchInProgress.next(true);
  //     const dataToExport = this._exportDataService.getDataToExport(
  //       this.searchData.searchResult() ?? [],
  //       !allColumns ? this.displayedOrderedColumns : null
  //     );

  //     if (dataToExport) {
  //       this._budgetService.exportToGrist(dataToExport).subscribe(
  //         {
  //           next:() => {
  //             this._alertService.openAlertSuccess(`Les données ont bien été transférées dans votre espace Grist.`);
  //           },
  //           error: (err: Error) => {
  //             this._alertService.openAlert("error", err, 8);
  //             this.searchData.searchInProgress.next(false);
  //           },
  //           complete:() => {
  //             this.searchData.searchInProgress.next(false);
  //           }
  //         }
  //       )
  //     }
  //   }
  // }

  // private _filename(extension: string): string {
  //   const formValue = this.searchData.searchForm.value;
  //   let filename = `${this._datePipe.transform(new Date(), 'yyyyMMdd')}_export`;
  //   if (formValue.location) {
  //     const locations = formValue.location as GeoModel[];
  //     filename += '_' + locations[0].type?.toLowerCase() + '-';
  //     filename += locations
  //       .filter((loc) => loc.code)
  //       .map((loc) => loc.code)
  //       .join('-');
  //   }

  //   if (formValue.bops) {
  //     const bops = formValue.bops;
  //     filename +=
  //       '_bops-' +
  //       bops
  //         .filter((bop) => bop.code)
  //         .map((bop) => bop.code)
  //         .join('-');
  //   }

  //   return filename + '.' + extension;
  // }

  /**
   * Gestionnaire d'événement pour le téléchargement depuis la modale
   */
  onDownloadRequested(event: {format: string, allColumns: boolean}): void {
    this.downloadData(event.format, event.allColumns);
  }

  /**
   * Gestionnaire d'événement pour l'export vers Grist depuis la modale
   */
  onExportToGristRequested(event: {allColumns: boolean}): void {
    this.exportToGrist(event.allColumns);
  }

}
