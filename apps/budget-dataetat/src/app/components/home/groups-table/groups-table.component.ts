import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { GridInFullscreenStateService } from 'apps/common-lib/src/lib/services/grid-in-fullscreen-state.service';
import {
  TableData,
  VirtualGroup
} from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';

@Component({
  selector: 'budget-groups-table',
  templateUrl: './groups-table.component.html',
  imports: [CommonModule],
  styleUrls: ['./groups-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsTableComponent implements OnInit {
  
  private _gridFullscreen = inject(GridInFullscreenStateService);


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

  ngOnInit() {
  }

  openGroupConfigDialog() {

  }
  openSortColumnsDialog() {
    
  }
  openSaveFilterDialog() {

  }
  public searchFinish: boolean = true
  public searchInProgress: boolean = false

}
