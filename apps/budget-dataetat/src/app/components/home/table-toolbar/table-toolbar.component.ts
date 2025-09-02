import { CommonModule } from '@angular/common';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { ModalGroupingComponent } from './modal-grouping/modal-grouping.component';
import { ModalColonnesComponent } from "./modal-colonnes/modal-colonnes.component";
import { ModalSauvegardeComponent } from "./modal-sauvegarde/modal-sauvegarde.component";
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonnesService } from '@services/colonnes.service';
import { ColonneTableau } from '@services/colonnes-mapper.service';


@Component({
  selector: 'budget-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  imports: [CommonModule, ModalGroupingComponent, ModalColonnesComponent, ModalSauvegardeComponent],
  styleUrls: ['./table-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableToolbarComponent {
  
  private _gridFullscreen = inject(GridInFullscreenStateService);
  private _colonnesService = inject(ColonnesService);

  @Input()
  public grouped: boolean = false;

  @Input()
  public searchData: FinancialDataModel[] = []
  
  public searchFinish: boolean = true
  public searchInProgress: boolean = false


  tableData?: TableData;
  virtualGroupFn?: (_: TableData) => VirtualGroup;

  get grid_fullscreen() {
    return this._gridFullscreen.fullscreen;
  }

  toggleGridFullscreen() {
    this._gridFullscreen.fullscreen = !this.grid_fullscreen;
  }

  get fullscreen_label() {
    if (!this.grid_fullscreen) return 'Agrandir le tableau';
    else return 'Rétrécir le tableau';
  }

  isGrouped() {
    return this._colonnesService.grouped
  }

  get selectedGrouping(): ColonneTableau<FinancialDataModel>[] {
    return this._colonnesService.selectedColonnesGrouping
  }

  // public downloadData(extension: string, allColumns: boolean): void {
  //   this.searchData.searchForm.markAllAsTouched(); // pour notifier les erreurs sur le formulaire
  //   if (this.searchData.searchForm.valid && !this.searchData.searchInProgress.value) {
  //     this.tracker.trackEvent("Export","Click", extension, undefined, {"allColumns": allColumns});
  //     this.searchData.searchInProgress.next(true);
  //     const blob = this._exportDataService.getBlob(
  //       this.searchData.searchResult() ?? [],
  //       extension,
  //       !allColumns ? this.displayedOrderedColumns : null
  //     );
  //     if (blob) {
  //       const url = URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = this._filename(extension);
  //       document.body.appendChild(a);
  //       a.click();
  //       this.searchData.searchInProgress.next(false);
  //     }
  //   }
  // }

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

}
