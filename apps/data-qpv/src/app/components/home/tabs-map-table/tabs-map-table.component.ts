import { Component, computed, effect, ElementRef, EventEmitter, inject, input, Input, Output, signal, ViewChild } from "@angular/core";
import { FinancialDataModel } from "../../../models/financial/financial-data.models";
import { DsfrOption, DsfrTableComponent, DsfrTableState, DsfrTabsComponent, DsfrTabComponent } from "@edugouvfr/ngx-dsfr";
import { RefQpvWithCommune } from "../../../models/refs/qpv.model";
import { MapComponent } from "./map/map.component";
import { SpinnerComponent } from "apps/common-lib/src/lib/components/spinner/spinner.component";
import { SearchDataService } from "../../../services/search-data.service";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { LignesFinancieres, PaginationMeta } from "apps/clients/v3/data-qpv";
import { CurrencyPipe } from "@angular/common";
import { MatchDashboardHeightDirective } from "../../../directives/match-dashboard-height.directive";

@Component({
    selector: 'data-qpv-tabs-map-table',
    templateUrl: './tabs-map-table.component.html',
    styleUrls: ['./tabs-map-table.component.scss'],
    imports: [DsfrTabsComponent, DsfrTabComponent, CurrencyPipe, MapComponent, SpinnerComponent, MatchDashboardHeightDirective]
})
export class TabsMapTableComponent {

  private _searchDataService = inject(SearchDataService);

  private _selectedTabIndex = 0

  readonly searchParams = computed(() => this._searchDataService.searchParams());
  readonly searchResults = computed(() => this._searchDataService.searchResults());
  readonly searchInProgress = computed(() => this._searchDataService.searchInProgress());
  readonly selectedTab = computed(() => this._searchDataService.selectedTab());

  /**
   * Référence au spinner de chargement pour la pagination infinie.
   * Utilise un setter pour configurer automatiquement l'IntersectionObserver.
   */
  @ViewChild('spinner')
  set spinnerRef(el: ElementRef<HTMLDivElement> | undefined) {
    if (el) {
      this.observeSpinner(el);
    }
  }

  /** Observateur d'intersection pour détecter la visibilité du spinner */
  private observer!: IntersectionObserver;

  // public rowsPerPageOptions: DsfrOption[] = [ { label: '20 lignes par page', value: 20 } ]

  public noResults = computed(() => this._searchDataService.currentResults.lignesData?.length === 0);

  // public readonly searchResults = input<FinancialDataModel[] | null>(null);
  // public readonly qpv =  input<RefQpvWithCommune[]>([]);
  
  currentTableData = signal<FinancialDataModel[] | null>(null);
  currentPagination = signal<PaginationMeta | null>(null);


  public columns = [
    {label: 'Porteur de projet', field: 'siret.nom_beneficiaire', sortable: false},
    {label: 'Montant (AE)', field: 'montant_ae', sortable: false},
    {label: 'Année', field: 'annee'},
    {label: 'Financeur', field: 'centre_couts.label'},
    {label: 'Thématique associée', field: 'thematique.libelle'},
    {label: 'Nom du programme (BOP)', field: 'programme.code'},
    {label: 'QPV du lieu de l\'action', field: 'lieu_action.code_qpv'},
  ]

   constructor() {
    toObservable(this._searchDataService.searchInProgress).subscribe(response => {
      if (!response) {
        this.currentTableData.set(this._searchDataService.currentResults.lignesData)
        this.currentPagination.set(this._searchDataService.currentResults.pagination)
      } else {
        this.currentTableData.set(null)
        this.currentPagination.set(null)
      }
    })
  }
  
  get selectedTabIndex() {
    return this._selectedTabIndex
  }

  /**
   * Configure l'IntersectionObserver pour la pagination infinie.
   * 
   * Lorsque le spinner devient visible, délègue au service SearchDataService
   * le chargement de la page suivante via la méthode loadNextPage().
   * Le service gère toute la logique de vérification et de requête.
   * 
   * @param el - Référence à l'élément spinner à observer
   */
  private observeSpinner(el: ElementRef<HTMLDivElement>) {
    // Nettoyage de l'ancien observateur si il existe
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Si le spinner est visible, tenter de charger la page suivante
        if (entry.isIntersecting) {
          // Délégation au service pour gérer la logique de pagination
          const load = this._searchDataService.loadMore();
          if (load) {
            load.subscribe();
          }
        }
      });
    });

    this.observer.observe(el.nativeElement);
  }

}
