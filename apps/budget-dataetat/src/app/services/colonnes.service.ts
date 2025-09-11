import { Injectable, signal, computed } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { ColonneTableau } from '@services/colonnes-mapper.service';

/**
 * Service de gestion des colonnes pour les tableaux de données financières.
 * 
 * Ce service centralise la gestion des colonnes pour :
 * - L'affichage dans les tableaux (sélection et configuration des colonnes visibles)
 * - Le groupement des données (colonnes utilisées pour regrouper les lignes)
 * - L'état de groupement (actif/inactif selon les colonnes sélectionnées)
 * 
 * Utilise des signals Angular pour maintenir un état réactif et permettre
 * aux composants de réagir automatiquement aux changements de configuration.
 * Le signal computed 'grouped' se met à jour automatiquement selon l'état
 * des colonnes de groupement sélectionnées.
 */
@Injectable({ providedIn: 'root' })
export class ColonnesService {

  // ========================================
  // GESTION DE L'ÉTAT DE GROUPEMENT
  // ========================================

  /**
   * Signal calculé qui détermine si le mode groupement est actuellement actif.
   * Le groupement est actif quand :
   * - Au moins une colonne de groupement est sélectionnée
   * - Le nombre de colonnes groupées diffère du nombre de colonnes de groupement
   * 
   * @returns true si le mode groupement est actif
   */
  public readonly grouped = computed(() => {
    return this.selectedColonnesGrouping().length != 0 && 
           this.selectedColonnesGrouping().length != this.selectedColonnesGrouped().length;
  });

  // ========================================
  // GESTION DES COLONNES DE TABLEAU
  // ========================================

  /**
   * Signal contenant toutes les colonnes disponibles pour le tableau
   */
  public readonly allColonnesTable = signal<ColonneTableau<FinancialDataModel>[]>([]);

  /**
   * Signal contenant les colonnes actuellement affichées dans le tableau
   */
  public readonly selectedColonnesTable = signal<ColonneTableau<FinancialDataModel>[]>([]);

  // ========================================
  // GESTION DES COLONNES DE GROUPEMENT
  // ========================================

  /**
   * Signal contenant toutes les colonnes disponibles pour le groupement
   */
  public readonly allColonnesGrouping = signal<ColonneTableau<FinancialDataModel>[]>([]);
  
  /**
   * Signal contenant les colonnes actuellement utilisées pour le groupement
   */
  public readonly selectedColonnesGrouping = signal<ColonneTableau<FinancialDataModel>[]>([]);
  
  // ========================================
  // GESTION DES COLONNES GROUPÉES (RÉSULTAT)
  // ========================================

  /**
   * Signal contenant les identifiants des colonnes présentes dans les groupes créés
   */
  public readonly selectedColonnesGrouped = signal<string[]>([]);

}
