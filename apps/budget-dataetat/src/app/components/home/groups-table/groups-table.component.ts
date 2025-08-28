import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
// import { TreeAccordionDirective } from './tree-accordion.directive';
import { nodePathsToArray } from 'storybook/internal/common';
import { TreeAccordionDirective } from './tree-accordion.directive';
import { map } from 'rxjs';

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
  imports: [CommonModule, TreeAccordionDirective],
  styleUrls: ['./groups-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsTableComponent implements OnInit {
  
  private _searchDataService = inject(SearchDataService);
  private _colonnesService = inject(ColonnesService);

  roots: Group[] = []
  groupedData: GroupedData[] = []

  ngOnInit() {
    // Init des racines
    this.groupedData = this._searchDataService.searchResults as GroupedData[]
    this.groupedData.forEach(gd => {
      this.roots.push({
        groupedData: gd,
        opened: false,
        loaded: false,
        children: []
      } as Group)
    })
    // Si update selectedGrouping, on reset
    this._searchDataService.searchResults$.subscribe((response) => {
      this.roots = []
      this.groupedData = response as GroupedData[]
      this.groupedData.forEach(gd => {
        this.roots.push({
          groupedData: gd,
          opened: false,
          loaded: false,
          children: []
        } as Group)
      })
    })
  }

  getTotalOfRoots(): number {
    return this.roots.map(r => r.groupedData.total).reduce((sum, current) => sum + current, 0);
  }

  getTotalMontantsEngagesOfRoots(): number {
    return this.roots.map(r => r.groupedData.total_montant_engage ?? 0).reduce((sum, current) => sum + current, 0);
  }

  getTotalMontantsPayesOfRoots(): number {
    return this.roots.map(r => r.groupedData.total_montant_paye ?? 0).reduce((sum, current) => sum + current, 0);
  }

  isLastLevel(level: number): boolean {
    return this._colonnesService.selectedColonnesGrouping.length === level + 1
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
  toggle(node: Group, lvl: number) {
    console.log("==> Toggle row")
    console.log(node.groupedData.name + " : " + node.groupedData.colonne)
    if (!this.isLastLevel(lvl))
      node.opened = !node.opened
    if (!node.loaded) {
      if (this._searchDataService.searchParams) {
        const grouped: string[] = this._recGetPathFromNode(node).map(gd => gd.colonne.toString())
        console.log('Grouped values :')
        console.log(grouped)
        this._searchDataService.search(grouped).subscribe((response: LignesResponse) => {
          console.log(response)
          node.loaded = true
          response.data?.groupings.forEach(gd => {
            node.children.push({
              parent: node,
              children: [],
              groupedData: gd,
              opened: false,
              loaded: false,
            } as Group)
            console.log("Pushing :")
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

  /**
   * Faire une recherche à partir de ce groupe
   */
  searchFromGroup(node: Group) {
    if (this._searchDataService.searchParams) {
      
      const grouped: GroupedData[] = this._recGetPathFromNode(node)
      const newGrouping: ColonneTableau<FinancialDataModel>[] = []
      const newGrouped: string[] = []
      console.log("Search from group")
      grouped.forEach(g => {
        console.log(">>>")
        console.log(g)
        newGrouping.push(this.getGroupingColumnByCode(g.name.toString()))
        newGrouped.push(g.colonne.toString())
      })
      this._searchDataService.searchParams.grouping = newGrouping.map(g => g.grouping?.code).filter(g => g !== undefined && g !== null)
      this._searchDataService.searchParams.grouped = newGrouped
      console.log(newGrouping)
      console.log(newGrouped)
      this._colonnesService.selectedColonnesGrouping = newGrouping
      this._colonnesService.selectedColonnesGrouped = newGrouped
    }
  }

}
