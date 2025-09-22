import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation, computed, signal, DestroyRef } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService, SearchResults } from '@services/search-data.service';
import { GroupedData, LignesResponse } from 'apps/clients/v3/financial-data';
import { TreeAccordionDirective } from './tree-accordion.directive';
import { NumberFormatPipe } from '../lines-tables/number-format.pipe';
import { SearchParameters } from '@services/search-params.service';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';
import { distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

export interface Group {
  parent?: Group;
  children: Group[];
  groupedData?: GroupedData;
  opened: boolean;
  loaded: boolean;
  loadingMore: boolean;
  currentPage: number;
}

@Component({
  selector: 'budget-groups-table',
  templateUrl: './groups-table.component.html',
  imports: [CommonModule, TreeAccordionDirective, NumberFormatPipe],
  styleUrls: ['./groups-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupsTableComponent {
  private logger = inject(LoggerService).getLogger(GroupsTableComponent.name);
  private _searchDataService = inject(SearchDataService);
  private _colonnesService = inject(ColonnesService);
  private _destroyRef = inject(DestroyRef);


  /**
   * Signal writable contenant l'arbre des groupes.
   * Géré manuellement pour préserver l'état lors des interactions.
   */
  public readonly root = signal<Group>({
    opened: false,
    loaded: false,
    children: [],
    loadingMore: false,
    currentPage: 1,
  } as Group);

  // permet de savoir si le root a déjà été initialisé
  private rootAlreadySet = signal(false);

  private readonly groupedData = computed(() => {
    this.logger.debug("==> groupedData recalculé");
    const searchResults = this._searchDataService.searchResults();
    const colonnes = this._colonnesService.selectedColonnesGrouping();
    if (colonnes && this._isGroupedDataArray(searchResults)) {
      this.logger.debug("GroupedData from searchResults : ", searchResults);
      return searchResults as GroupedData[];
    }
    this.logger.debug("GroupedData from searchResults VIDE ");
    return [];
  });

  /**
   * Effect qui initialise le root seulement si les données de base ont vraiment changé
   */
  private readonly initialTreeStructure = computed(() => {
    const currentGroupedData = this.groupedData();

    if (currentGroupedData.length === 0 || this.rootAlreadySet()) {
      return null;
    }

    return {
      opened: false,
      loaded: false,
      children: currentGroupedData.map(gd => ({
        groupedData: gd,
        opened: false,
        loaded: false,
        children: [],
        loadingMore: false,
        currentPage: 1,
      } as Group)),
      loadingMore: false,
      currentPage: 1,
    } as Group;
  });

  private readonly _groups = computed(() => {
    const colonnesGrouping = this._colonnesService.allColonnesGrouping();
    const gr = Object.fromEntries(
      colonnesGrouping.map(c => [c.grouping?.code ?? '', c])
    );
    this.logger.debug("==> _groups recalculé", gr);
    return gr;
  });


  constructor() {
    toObservable(this.initialTreeStructure)
      .pipe(
        filter(structure => structure !== null),
        distinctUntilChanged(),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(newStructure => {
        this.rootAlreadySet.set(true);
        this.logger.debug("==> Initializing root with new base data");
        this.root.set(newStructure!);
        this.logger.debug("Root initialized with children:", newStructure!.children.length);
      });
  }


  getTotal() {
    return this._searchDataService.total();
  }

  get pageSize() {
    return this._searchDataService.searchParams()?.page_size || 25;
  }

  isLastLevel(level: number): boolean {
    return this._colonnesService.selectedColonnesGrouping().length === level + 1
  }

  removeGrouping() {
    this._colonnesService.selectedColonnesGrouping.set([]);
    this._colonnesService.selectedColonnesGrouped.set([]);
    this.rootAlreadySet.set(false);
  }

  /**
   * Click sur un 'accordion' : on change le current 
   * @param node 
   */
  toggle(node: Group, lvl: number) {
    if (this.isLastLevel(lvl))
      return
    this.logger.debug("==> TOGGLE ROW")
    this.logger.debug(node.groupedData?.colonne + " : " + node.groupedData?.value)
    node.opened = !node.opened
    
    if (!node.loaded && this._searchDataService.searchParams()) {
      const grouped: (string | undefined)[] = this._recGetPathFromNode(node).map(gd => gd.value?.toString());
      this._searchDataService.zoomOnGrouping(grouped).subscribe((response: LignesResponse) => {
        this.logger.debug("==> LOAD RESPONSE GROUPED ?", response)
        node.loaded = true;
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
        
        this.logger.debug("Node state : ", node)
      })
    }
  }

  loadMore(parent: Group) {
    if (!this._searchDataService.searchParams())
      return;

    this.logger.debug("==> LOAD MORE")
    this.logger.debug(parent.groupedData?.colonne + " : " + parent.groupedData?.value);
    const grouped: GroupedData[] = this._recGetPathFromNode(parent);

    const searchGrouping = grouped.map(g => g.colonne).filter(c => c !== undefined);
    const searchGrouped = grouped.map(g => g.value?.toString()).filter(c => c !== undefined);

    if (this._searchDataService.searchParams()) {
      // S'il y a un parent pour les nodes, on remet le loadingMore à true
      parent.loadingMore = true

      const newPage: number = parent.currentPage + 1;

      this._searchDataService.searchParams.set({
        ...this._searchDataService.searchParams(),
        page: newPage,
        grouping: searchGrouping,
        grouped: searchGrouped
      } as SearchParameters);

      this._colonnesService.selectedColonnesGrouped.set(grouped.map(gd => gd.value?.toString()).filter(g => g !== undefined));
      // TODO
      // this._searchDataService.search().subscribe((response: LignesResponse) => {
      //   if (!response.data?.groupings)
      //     return;
      //   const newChildren: Group[] = [
      //     ...parent.children,
      //     ...response.data.groupings.map(gd => ({
      //       parent: parent,
      //       children: [],
      //       groupedData: gd,
      //       opened: false,
      //       loaded: false,
      //       loadingMore: false,
      //       currentPage: 1,
      //     } as Group))
      //   ];
      //   parent.currentPage = newPage;
      //   parent.children = newChildren;
      //   parent.loadingMore = false
      //   this._searchDataService.searchInProgress.set(false);
      //   console.log("Parent state : ", parent)
      // })
    }
  }

  getGroupingColumnByCode(code: string): ColonneTableau<FinancialDataModel> {
    return this._colonnesService.allColonnesGrouping().filter(c => c.grouping?.code === code)[0] as ColonneTableau<FinancialDataModel>
  }

  getGroupingLabel(code: string): string {
    return this._groups()[code]?.label ?? code;
  }

  /**
   * Faire une recherche à partir de ce groupe
   */
  searchFromGroup(node: Group) {
    console.log("==> SEARCH FROM GROUP :", node)
    if (this._searchDataService.searchParams()) {
      const gd: GroupedData[] = this._recGetPathFromNode(node)
      const newGrouping: ColonneTableau<FinancialDataModel>[] = []
      const newGrouped: string[] = []
      gd.forEach((g) => {
        if (g.colonne)
          newGrouping.push(this.getGroupingColumnByCode(g.colonne.toString()))
        if (g.value)
          newGrouped.push(g.value.toString())
      })

      this._colonnesService.selectedColonnesGrouping.set(newGrouping);
      this._colonnesService.selectedColonnesGrouped.set(newGrouped);

      // this._searchDataService.searchParams.set({
      //   ...this._searchDataService.searchParams(),
      //   page: 1,
      //   grouping: newGrouping.map(g => g.grouping?.code).filter(g => g !== undefined && g !== null),
      //   grouped: newGrouped
      // } as SearchParameters);
    }
  }

  /**
   * Type guard : vérifie si les résultats sont des données groupées (sans propriété 'id').
   * @param results - Les résultats de recherche à analyser
   * @returns true si GroupedData[], false si FinancialDataModel[]
   */
  private _isGroupedDataArray(results: SearchResults): boolean {
    return Array.isArray(results) && !results.some(item => 'id' in item);
  }

  /**
   * Récupère récursivement le chemin de groupement de la racine jusqu'au nœud donné.
   * @param node - Le nœud dont on veut le chemin
   * @returns Tableau des GroupedData du chemin racine → nœud
   */
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

}
