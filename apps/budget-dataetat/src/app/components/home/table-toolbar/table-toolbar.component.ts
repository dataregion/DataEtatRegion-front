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
import { ModalExportComponent } from "./modal-export/modal-export.component";
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService } from '@services/search-data.service';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { ColonneTableau } from 'apps/appcommon/src/lib/mappers/colonnes-mapper.service';

const LIMITE_DL_LIGNES = 100_000;

@Component({
  selector: 'budget-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  imports: [CommonModule, ModalGroupingComponent, ModalColonnesComponent, ModalSauvegardeComponent, ModalExportComponent, MaterialModule],
  styleUrls: ['./table-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableToolbarComponent {
  
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _colonnesService = inject(ColonnesService);

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
    const total = this._searchDataService.total()?.total || 0
    if (total > LIMITE_DL_LIGNES)
      return true;
    return false;
  }
  
  public get export_tooltip(): string {
    if (this.is_export_disabled) {
      const pretty_nb = LIMITE_DL_LIGNES.toLocaleString('fr-FR', { useGrouping: true })
      return `Le téléchargement est limité à ${pretty_nb} lignes. Veuillez affiner votre recherche.`
    }
    return '';
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

  onRetourClick(): void {
    // XXX: important que ce soit du fire and forget 
    // puisque le composant est tué en cours de route.
    this._searchDataService
      .doSearchFromCurrentGrouping()
      .subscribe() 
  }

}
