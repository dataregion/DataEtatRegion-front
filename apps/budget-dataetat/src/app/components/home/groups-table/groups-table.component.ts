import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
import { TreeAccordionDirective } from './tree-accordion.directive';
import { NumberFormatPipe } from '../lines-tables/number-format.pipe';
import { combineLatest } from 'rxjs';

export interface Group {
  parent?: Group;
  children: Group[];
  groupedData? : GroupedData;
  opened: boolean;
  loaded: boolean;
  loadingMore: boolean;
  currentPage: number;
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

  root?: Group
  private _groups: { [k: string]: ColonneTableau<FinancialDataModel>; } = {}

  ngOnInit() {
    this.root = {
      opened: false,
      loaded: false,
      children: [],
      loadingMore: false,
      currentPage: 1,
    } as Group
    // Init des racines
    const groupedData: GroupedData[] = this._searchDataService.searchResults as GroupedData[]
    groupedData.forEach(gd => {
      this.root?.children.push({
        groupedData: gd,
        opened: false,
        loaded: false,
        children: [],
        loadingMore: false,
        currentPage: 1,
      } as Group)
    })
    // Si update selectedGrouping, on reset
    combineLatest([
      this._colonnesService.selectedColonnesGrouping$,
      this._searchDataService.searchResults$
    ])
    .subscribe(([colonnes, response]) => {
      if (!this.root)
        return
      this.root.children = []
      if (this._isGroupedDataArray(response)) {
        const groupedData = response as GroupedData[]
        groupedData.forEach(gd => {
          this.root?.children.push({
            groupedData: gd,
            opened: false,
            loaded: false,
            children: [],
            loadingMore: false,
            currentPage: this._searchDataService.searchParams?.page,
          } as Group)
        })
      }
      console.log("==> NEW roots", this.root.children)
    })
    // Sauvegarde des colonnes
    this._groups = Object.fromEntries(
      this._colonnesService.allColonnesGrouping.map(c => [c.grouping?.code ?? '', c])
    );
  }

  private _isGroupedDataArray(results: SearchResults): boolean {
    return Array.isArray(results) && !results.some(item => 'id' in item);
  }

  getTotal() {
    return this._searchDataService.total
  }

  get pageSize() {
    return this._searchDataService.searchParams?.page_size
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
      return node.groupedData ? [node.groupedData] : [];
    }
    // Récursion : concaténation du nom from root to node 
    return [
      ...this._recGetPathFromNode(node.parent),
      node.groupedData
    ].filter(gd => gd !== undefined);
  }

  /**
   * Click sur un 'accordion' : on change le current 
   * @param node 
   */
  toggle(node: Group, lvl: number) {
    if (this.isLastLevel(lvl))
      return
    console.log("==> TOGGLE ROW")
    console.log(node.groupedData?.colonne + " : " + node.groupedData?.value)
    node.opened = !node.opened
    if (!node.loaded) {
      if (this._searchDataService.searchParams) {
        const grouped: (string | undefined)[] = this._recGetPathFromNode(node).map(gd => gd.value?.toString())
        this._searchDataService.searchParams.page = node.currentPage
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
              loadingMore: false,
              currentPage: 1,
            } as Group)
          })
          console.log("Loaded children : ", node.children.length)
        })
      }
    }
  }

  loadMore(parent: Group) {
    if (!this._searchDataService.searchParams)
      return;

    console.log("==> LOAD MORE")
    console.log(parent.groupedData?.colonne + " : " + parent.groupedData?.value)
    const grouped: GroupedData[] = this._recGetPathFromNode(parent)
    this._searchDataService.searchParams.grouping = grouped.map(g => g.colonne).filter(c => c !== undefined);
    this._searchDataService.searchParams.grouped = grouped.map(g => g.value?.toString()).filter(c => c !== undefined);

    if (this._searchDataService.searchParams) {
      // S'il y a un parent pour les nodes, on remet le loadingMore à true
      parent.loadingMore = true

      const newPage: number = parent.currentPage + 1
      this._searchDataService.searchParams.page = newPage
      this._colonnesService.selectedColonnesGrouped = grouped.map(gd => gd.value?.toString()).filter(g => g !== undefined)
      this._searchDataService.search().subscribe((response: LignesResponse) => {
        if (!response.data?.groupings)
          return;
        const newChildren: Group[] = [
          ...parent.children,
          ...response.data.groupings.map(gd => ({
            parent,
            children: [],
            groupedData: gd,
            opened: false,
            loaded: false,
            loadingMore: false,
            currentPage: 1,
          } as Group))
        ];
        parent.currentPage = newPage
        parent.children = newChildren;
        parent.loadingMore = false
        console.log("Parent state : ", parent)
      })
    }
  }
  
  /**
   * Récupération des info
   * @param code 
   * @returns 
   */
  getGroupingColumnByCode(code: string): ColonneTableau<FinancialDataModel> {
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
      this._colonnesService.selectedColonnesGrouped = newGrouped
      this._colonnesService.selectedColonnesGrouping = newGrouping
    }
  }

}
