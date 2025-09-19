import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

import { FinancialDataModel } from '@models/financial/financial-data.models';
import { EtablissementLight } from '../../modules/informations-supplementaires/models/EtablissementLight';
import { SubventionLight } from '../../modules/informations-supplementaires/models/SubventionLight';
import { AffichageDossier } from '@models/demarche_simplifie/demarche.model';

import { DetailCpComponent } from "../../modules/informations-supplementaires/detail-cp/detail-cp.component";
import { DetailApiEntrepriseComponent } from "../../modules/informations-supplementaires/detail-api-entreprise/detail-api-entreprise.component";
import { DetailApiDataSubventionsComponent } from "../../modules/informations-supplementaires/detail-api-data-subventions/detail-api-data-subventions.component";
import { DetailApiDemarcheSimplifieComponent } from "../../modules/informations-supplementaires/detail-api-demarche-simplifie/detail-api-demarche-simplifie.component";
import { ChargementOuErreurComponent } from "../../modules/informations-supplementaires/chargement-ou-erreur/chargement-ou-erreur.component";

import { InformationSupplementairesViewService } from '../../modules/informations-supplementaires/services/informations-supplementaires.viewservice';
import { InformationsSupplementairesService } from '../../modules/informations-supplementaires/services/informations-supplementaires.service';
import { SearchDataService } from '@services/search-data.service';

import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

/**
 * Énumération des différents modes d'affichage pour les informations supplémentaires
 */
export enum View {
  /** Vue légère avec les informations principales */
  light = 'light',
  /** Vue complète des informations API Entreprise */
  full_api_entreprise = 'full_api_entreprise',
  /** Vue complète des informations Data Subventions */
  full_api_data_subventions = 'full_api_data_subventions',
  /** Vue complète des informations Démarches Simplifiées */
  full_api_demarche = 'full_api_demarche',
  /** Vue complète de toutes les informations */
  full = 'full'
}

/**
 * Composant d'affichage des informations détaillées d'une ligne financière.
 * Permet de visualiser les données supplémentaires provenant de différentes APIs externes
 * (API Entreprise, Data Subventions, Démarches Simplifiées).
 */
@Component({
  selector: 'budget-infos-ligne',
  templateUrl: './infos-ligne.component.html',
  imports: [
    CommonModule, 
    DetailCpComponent, 
    DetailApiEntrepriseComponent, 
    DetailApiDataSubventionsComponent, 
    DetailApiDemarcheSimplifieComponent, 
    OuNonRenseignePipe, 
    ChargementOuErreurComponent
  ],
  styleUrls: ['./infos-ligne.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InfosLigneComponent implements OnInit {
  
  // ========================================
  // SERVICES INJECTÉS
  // ========================================
  
  private readonly _route = inject(ActivatedRoute);
  private readonly _searchDataService = inject(SearchDataService);
  private readonly _infoSupplementaireService = inject(InformationsSupplementairesService);

  // ========================================
  // PROPRIÉTÉS PUBLIQUES
  // ========================================
  
  /** Mode d'affichage actuel du composant */
  view: View = View.light;
  
  /** Données d'établissement légères pour l'affichage rapide */
  entreprise_light: EtablissementLight | undefined;
  
  /** Observable des données de subvention légères */
  api_subvention_light$: Observable<SubventionLight> | undefined;
  
  /** Observable des données de dossier de démarche simplifiée */
  affichage_dossier$: Observable<AffichageDossier> | undefined;
  
  /** Flag pour représenter si l'information de ligne est liée au tableau ou non
   * possibilité de revenir au tableau etc. */
  linkedToTable = true;

  // ========================================
  // PROPRIÉTÉS PRIVÉES
  // ========================================
  
  /** Données financières actuellement affichées */
  private _financial: FinancialDataModel | undefined = undefined;

  /**
   * Getter pour accéder aux données financières de façon sécurisée
   * @returns Les données financières courantes
   */
  get financial(): FinancialDataModel {
    return this._financial!;
  }

  /**
   * Getter pour accéder au service de vue des informations supplémentaires
   * @returns Le service de vue configuré
   */
  get vService(): InformationSupplementairesViewService {
    return this._infoSupplementaireService.viewService;
  }

  // ========================================
  // CYCLE DE VIE ANGULAR
  // ========================================
  
  constructor() {
    toObservable(this._searchDataService.selectedLine)
    .pipe(takeUntilDestroyed())
    .subscribe((line) => {
      this._initFromResolverModel(line);
    })
  }

  ngOnInit(): void {
    const data: FinancialDataModel = this._route.snapshot.data['infos_supplementaires'];
    if (data) {
      this._searchDataService.selectedLine.set(data);
      this.linkedToTable = false; // XXX: heuristique, l'info vient de l'url, pas de lien au tableau
    }
  }

  // ========================================
  // MÉTHODES PUBLIQUES - NAVIGATION
  // ========================================

  backToTable(): void {
    this._searchDataService.selectedLine.set(undefined);
  }


  openInNewtab(): void {
    this._infoSupplementaireService.viewService.openInNewtab();
  }

  // ========================================
  // MÉTHODES PUBLIQUES - CHANGEMENT DE VUE
  // ========================================
  

  onClickFullApiEntreprise(): void {
    this.view = View.full_api_entreprise;
  }

  onClickFullApiDataSubventions(): void {
    this.view = View.full_api_data_subventions;
  }


  onClickDemarcheSimplifie(): void {
    this.view = View.full_api_demarche;
  }

  // ========================================
  // MÉTHODES PRIVÉES - INITIALISATION
  // ========================================
  
  /**
   * Initialise le composant avec les données du modèle financier
   * @param data - Les données financières à afficher
   */
  private _initFromResolverModel(data: FinancialDataModel | undefined): void {
    if (data === undefined) {
      return;
    }
    
    this._financial = data;
    this.view = View.light;
    this._setupViewServices();
  }

  /**
   * Configure les services de vue et initialise les observables des données supplémentaires
   */
  private _setupViewServices(): void {
    if (this._financial === undefined) {
      return;
    }

    // Configuration du service avec les données financières
    this._infoSupplementaireService.setupViewModelService(this._financial);
    
    // Initialisation des données légères pour l'affichage rapide
    this.entreprise_light = this.vService.entrepriseLight();
    this.api_subvention_light$ = this.vService.apiSubventionLight$();
    this.affichage_dossier$ = this.vService.dossierDemarche$();
  }
}
