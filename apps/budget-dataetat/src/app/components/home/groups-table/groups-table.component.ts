import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
import { TreeAccordionDirective } from './tree-accordion.directive';
import { NumberFormatPipe } from '../lines-tables/number-format.pipe';

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
  imports: [CommonModule, TreeAccordionDirective, NumberFormatPipe],
  styleUrls: ['./groups-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsTableComponent implements OnInit {
  
  private _searchDataService = inject(SearchDataService);
  private _colonnesService = inject(ColonnesService);

  roots: Group[] = []
  private _groups: { [k: string]: ColonneTableau<FinancialDataModel>; } = {}

  ngOnInit() {
    // Init des racines
    const groupedData: GroupedData[] = this._searchDataService.searchResults as GroupedData[]
    groupedData.forEach(gd => {
      this.roots.push({
        groupedData: gd,
        opened: false,
        loaded: false,
        children: []
      } as Group)
    })
    // Si update selectedGrouping, on reset
    this._searchDataService.searchResults$.subscribe((response: SearchResults) => {
      console.log("==> RESET des roots")
      console.log(response)
      this.roots = []
      if (this._isGroupedDataArray(response)) {
        const groupedData = response as GroupedData[]
        groupedData.forEach(gd => {
          this.roots.push({
            groupedData: gd,
            opened: false,
            loaded: false,
            children: []
          } as Group)
        })
      }
      console.log(this.roots)
    })
    // Sauvegarde des colonnes
    this._groups = Object.fromEntries(
      this._colonnesService.allColonnesGrouping.map(c => [c.grouping?.code ?? '', c])
    );
  }

  private _isGroupedDataArray(results: SearchResults): boolean {
    console.log(results.some(item => 'id' in item))
    return Array.isArray(results) && !results.some(item => 'id' in item);
  }

  getTotal() {
    return this._searchDataService.total
  }

  isLastLevel(level: number): boolean {
    return this._colonnesService.selectedColonnesGrouping.length === level + 1
  }

  removeGrouping() {
    if (this._searchDataService.searchParams) {
      this._searchDataService.searchParams.grouping = []
      this._searchDataService.searchParams.grouped = []
    }
    this._colonnesService.selectedColonnesGrouping = []
    this._colonnesService.selectedColonnesGrouped = []
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
    console.log(node.groupedData.colonne + " : " + node.groupedData.value)
    if (!this.isLastLevel(lvl))
      node.opened = !node.opened
    if (!node.loaded) {
      if (this._searchDataService.searchParams) {
        const grouped: (string | undefined)[] = this._recGetPathFromNode(node).map(gd => gd.value?.toString())
        console.log('================')
        console.log('Grouped values :')
        console.log(grouped)
        this._colonnesService.selectedColonnesGrouped = grouped.filter(g => g !== undefined)
        this._searchDataService.search().subscribe((response: LignesResponse) => {
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
    console.log("--> " + code)
    console.log(this._colonnesService.allColonnesGrouping.filter(c => c.grouping?.code === code)[0])
    return this._colonnesService.allColonnesGrouping.filter(c => c.grouping?.code === code)[0] as ColonneTableau<FinancialDataModel>
  }

  getGroupingLabel(code: string): string {
    return this._groups[code]?.label ?? code;
  }

  /**
   * Faire une recherche à partir de ce groupe
   */
  searchFromGroup(node: Group) {
    
    if (this._searchDataService.searchParams) {
      const gd: GroupedData[] = this._recGetPathFromNode(node)
      const newGrouping: ColonneTableau<FinancialDataModel>[] = []
      const newGrouped: string[] = []
      gd.forEach((g) => {
        if (g.colonne)
          newGrouping.push(this.getGroupingColumnByCode(g.colonne.toString()))
        if (g.value)
          newGrouped.push(g.value.toString())
      })
      this._searchDataService.searchParams = {
        ...this._searchDataService.searchParams,
        grouping: newGrouping.map(g => g.grouping?.code).filter(g => g !== undefined && g !== null),
        grouped: newGrouped
      }
      console.log(newGrouping)
      console.log(newGrouped)
      this._colonnesService.selectedColonnesGrouped = newGrouped
      this._colonnesService.selectedColonnesGrouping = newGrouping
      // 
        // TODO : mécanique à changer :
      
      // Option 1:
      // this._colonnesService.selectedColonnesGrouping = newGrouping
      // this._colonnesService.selectedColonnesGrouped = newGrouped
      
      // Il vaut mieux mettre ces champs dans formSearch.searchParams et vider les selectedColonnes

      // Bind dans searchParams OK mais bind dans les form controls ???
      /**
       * Coté front : pourquoi le mapping vers les champs du formulaire marchent pas ? Revenir à l'option 1 sinon
       * Coté back : pour le total, voire chatgpt, select func.count subquery
       */

      // const grouped: GroupedData[] = this._recGetPathFromNode(node)
      // let searchParams = this._searchDataService.searchParams
      // searchParams.grouping = undefined
      // searchParams.grouped = undefined
      // this._colonnesService.selectedColonnesGrouping = []
      // this._colonnesService.selectedColonnesGrouped = []
      // searchParams.grouped = []
      // grouped.forEach(gd => {
      //   searchParams = this._mapGroupingToSearchParams(searchParams, gd)
      // });
      // this._searchDataService.searchParams = searchParams
      // console.log("=> NEW searchParams")
      // console.log(searchParams)
    }
  }

}
