import { CommonModule } from '@angular/common';
import { Component, inject, input, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { MaterialModule } from "apps/common-lib/src/public-api";
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSelectChange } from '@angular/material/select';
import { ColonnesService } from '@services/colonnes.service';
import { Colonne } from '@models/financial/colonnes.models';


@Component({
  selector: 'budget-modal-grouping',
  templateUrl: './modal-grouping.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal-grouping.component.scss'],
  imports: [MaterialModule, DragDropModule]
})
export class ModalGroupingComponent implements OnInit {

  private _colonnesService = inject(ColonnesService)

  @Input()
  public colonnes: Colonne[] = []
  @Input()
  public selectedColonnes: Colonne[] = []
  public remainingColonnes: Colonne[] = []

  ngOnInit() {
    this.colonnes = this._colonnesService.getAllColonnesGrouping()
    this.remainingColonnes = this.calculateRemainingColumns(this.colonnes, this.selectedColonnes);
  }

  /**
   * Retourne les colonnes qui ne sont pas déjà utilisées pour le grouping (pour proposer leur ajout).
   */
  private calculateRemainingColumns(colonnes: Colonne[], selectedColonnes: Colonne[]) {
    // On construit un set contenant les noms de colonnes utilisées pour le grouping.
    const usedColumnNames = new Set<string>();
    for (const col of selectedColonnes) {
      usedColumnNames.add(col.name);
    }
    // On retourne les colonnes dont les noms ne sont pas dans le set.
    return colonnes.filter((col) => !usedColumnNames.has(col.name));
  }

  moveGroup(event: CdkDragDrop<Colonne[]>) {
    moveItemInArray(this.selectedColonnes, event.previousIndex, event.currentIndex);
  }

  addGroup(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedColonnes.push(this.colonnes.filter(c => c.code === target.selectedOptions[0].value)[0]);
    this.remainingColonnes = this.calculateRemainingColumns(this.colonnes, this.selectedColonnes);
  }

  removeGroup(index: number) {
    this.selectedColonnes.splice(index, 1);
    this.remainingColonnes = this.calculateRemainingColumns(this.colonnes, this.selectedColonnes);
  }

}
