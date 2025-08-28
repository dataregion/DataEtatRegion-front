import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
// import { TreeAccordionDirective } from './tree-accordion.directive';
import { nodePathsToArray } from 'storybook/internal/common';

export interface Group {
  parent?: Group;
  children: Group[];
  groupedData : GroupedData;
  opened: boolean;
  loaded: boolean;
}

@Component({
  selector: 'budget-groups-table]',
  templateUrl: './groups-table.component.html',
  imports: [CommonModule],
  styleUrls: ['./groups-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsTableComponent implements OnInit {
  
  private _searchDataService = inject(SearchDataService);
  private _colonnesService = inject(ColonnesService);

  roots: Group[] = []
  groupedData: GroupedData[] = []

  currentlyGrouped: Group | null = null

  opened: boolean = false

  ngOnInit() {
    this.groupedData = this._searchDataService.searchResults as GroupedData[]
    this.groupedData.forEach(gd => {
      this.roots.push({
        groupedData: gd,
        opened: false,
        loaded: false,
        children: []
      } as Group)
    })
  }

  private _recGetPathFromNode(node: Group): GroupedData[] {
    if (!node.parent) {
      return [node.groupedData];
    }
    // Récursion : concaténation du nom from root to node 
    return [
      ...this._recGetPathFromNode(node.parent),
      node.groupedData
    ];
  }

  /**
   * Click sur un 'accordion' : on change le current 
   * @param node 
   */
  toggle(node: Group) {
    console.log("==> Toggle row")
    console.log(node.groupedData.name + " : " + node.groupedData.colonne)
    node.opened = !node.opened
    if (!node.loaded) {
      if (this._searchDataService.searchParams) {
        const grouped: string[] = this._recGetPathFromNode(node).map(gd => gd.colonne.toString())
        this._searchDataService.search(grouped).subscribe((response: LignesResponse) => {
          console.log(response)
          node.loaded = true
          response.data?.groupings.forEach(gd => {
            node.children.push({
              groupedData: gd,
              children: [],
              opened: false,
              loaded: false,
            } as Group)
            console.log("pushin")
            console.log(node.children)
          })
          console.log("Loaded node")
          console.log(node.children)
          console.log(this.roots)
        })
      }
    }
  }
  
  /**
   * Récupération des info
   * @param code 
   * @returns 
   */
  getGroupingColumnByCode(code: string): ColonneTableau<FinancialDataModel> {
    return this._colonnesService.allColonnesGrouping.filter(c => c.grouping?.code === code)[0]
  }

}
