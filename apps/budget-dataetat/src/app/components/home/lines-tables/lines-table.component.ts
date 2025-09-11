import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';
import { ColonnesService } from '@services/colonnes.service';
import { SearchDataService } from '@services/search-data.service';
import { NumberFormatPipe } from "./number-format.pipe";
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

/**
 * Composant d'affichage des lignes financières sous forme de tableau.
 * 
 * Ce composant gère :
 * - L'affichage des données financières en tableau avec colonnes configurables
 * - La pagination infinie via IntersectionObserver sur le spinner
 * - La sélection de lignes pour affichage détaillé
 * - La synchronisation avec les services de colonnes et de recherche
 * 
 * @example
 * ```html
 * <budget-lines-table />
 * ```
 */
@Component({
  selector: 'budget-lines-table',
  templateUrl: './lines-table.component.html',
  imports: [CommonModule, NumberFormatPipe],
  styleUrls: ['./lines-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LinesTableComponent implements OnInit, OnDestroy {

  // --- Services injectés ---
  
  /** Service de gestion des colonnes (sélection, configuration) */
  private _colonnesService: ColonnesService = inject(ColonnesService);
  
  
  /** Service de logging pour le debugging */
  private _logger: LoggerService = inject(LoggerService);

  // --- Propriétés publiques pour le template ---
  
  /** Service central de gestion de la recherche de données */
  public readonly searchDataService: SearchDataService = inject(SearchDataService);
  // --- Propriétés du composant ---
  
  /** Colonnes actuellement sélectionnées pour l'affichage */
  currentColonnes: ColonneTableau<FinancialDataModel>[] = [];
  
  /** Lignes financières actuellement affichées */
  currentLignes: FinancialDataModel[] = [];

  // --- ViewChild et observateurs ---
  
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

  // --- Getters pour le template ---
  
  // --- Constructeur et effects ---
  
  constructor() {
    // Effect pour synchroniser les résultats de recherche avec les lignes affichées
    effect(() => {
      this.currentLignes = this.searchDataService.searchResults() as FinancialDataModel[];
    });
  }

  // --- Lifecycle hooks ---

  /**
   * Initialisation du composant.
   * Configure l'écoute des changements de colonnes sélectionnées.
   * Utilise un effect pour réagir aux changements des signals de colonnes.
   */
  ngOnInit(): void {
    // Effect pour réagir aux changements des colonnes sélectionnées
    effect(() => {
      const selected = this._colonnesService.selectedColonnesTable();
      this.currentColonnes = selected.length !== 0 ? selected : this._colonnesService.allColonnesTable();
    });
  }

  // --- Méthodes privées ---

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
          console.log("==> Spinner visible, tentative de chargement page suivante");
          
          // Délégation au service pour gérer la logique de pagination
          const loaded = this.searchDataService.loadNextPage();
          
          if (loaded) {
            console.log("==> Chargement de la page suivante déclenché");
          } else {
            console.log("==> Chargement de la page suivante impossible (pas de page suivante, recherche en cours, etc.)");
          }
        }
      });
    });

    this.observer.observe(el.nativeElement);
  }

  /**
   * Nettoyage lors de la destruction du composant.
   * Déconnecte l'IntersectionObserver pour éviter les fuites mémoire.
   */
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // --- Gestionnaires d'événements ---

  /**
   * Gestionnaire de clic sur une ligne du tableau.
   * Sélectionne la ligne pour affichage détaillé.
   * 
   * @param line - La ligne financière sélectionnée
   */
  onRowClick(line: FinancialDataModel) {
    this._logger.debug("==> Clic sur ligne du tableau", line);
    
    // Délégation au service pour gérer la sélection de ligne
    this.searchDataService.selectLine(line);
  }

}
