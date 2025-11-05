import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation, input } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { ModalGroupingComponent } from './modal-grouping/modal-grouping.component';
import { ModalColonnesComponent } from "./modal-colonnes/modal-colonnes.component";
import { ModalSauvegardeComponent } from "./modal-sauvegarde/modal-sauvegarde.component";
import { ModalTelechargementComponent } from "./modal-telechargement/modal-telechargement.component";
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { SearchDataService } from '@services/search-data.service';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { TableExportService } from './services/table-export.service';

@Component({
  selector: 'budget-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  imports: [CommonModule, ModalGroupingComponent, ModalColonnesComponent, ModalSauvegardeComponent, ModalTelechargementComponent, MaterialModule],
  styleUrls: ['./table-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [TableExportService]
})
export class TableToolbarComponent {
  
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _colonnesService = inject(ColonnesService);

  private _tableExportService = inject(TableExportService);

  public _searchDataService = inject(SearchDataService);

  public readonly grouped = input<boolean>(false);

  public readonly searchData = input<BudgetFinancialDataModel[]>([]);
  
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
  
  // Délégation vers le service d'export
  public get is_export_disabled(): boolean {
    return this._tableExportService.isExportDisabled();
  }
  
  public get export_tooltip(): string {
    return this._tableExportService.exportTooltip();
  }

  public get isExporting(): boolean {
    return this._tableExportService.isExporting();
  }

  isGrouped() {
    return this._colonnesService.grouped();
  }

  get selectedGrouping(): ColonneTableau<BudgetFinancialDataModel>[] {
    return this._colonnesService.selectedColonnesGrouping();
  }

  get selectedGrouped(): string[] {
    return this._colonnesService.selectedColonnesGrouped();
  }



  public exportToGrist(allColumns: boolean): void {
    this._tableExportService.exportToGrist(allColumns);
  }

  public downloadData(extension: string, allColumns: boolean): void {
    this._tableExportService.downloadData(extension, allColumns);
  }

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
