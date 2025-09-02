import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { DetailCpComponent } from "../../modules/informations-supplementaires/detail-cp/detail-cp.component";
import { DetailApiEntrepriseComponent } from "../../modules/informations-supplementaires/detail-api-entreprise/detail-api-entreprise.component";
import { DetailApiDataSubventionsComponent } from "../../modules/informations-supplementaires/detail-api-data-subventions/detail-api-data-subventions.component";
import { DetailApiDemarcheSimplifieComponent } from "../../modules/informations-supplementaires/detail-api-demarche-simplifie/detail-api-demarche-simplifie.component";
import { ChargementOuErreurComponent } from "../../modules/informations-supplementaires/chargement-ou-erreur/chargement-ou-erreur.component";
import { EtablissementLight } from '../../modules/informations-supplementaires/models/EtablissementLight';
import { Observable } from 'rxjs';
import { SubventionLight } from '../../modules/informations-supplementaires/models/SubventionLight';
import { AffichageDossier } from '@models/demarche_simplifie/demarche.model';
import { InformationSupplementairesViewService } from '../../modules/informations-supplementaires/services/informations-supplementaires.viewservice';
import { InformationsSupplementairesService } from '../../modules/informations-supplementaires/services/informations-supplementaires.service';
import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';
import { SearchDataService } from '@services/search-data.service';


export enum View {
  light = 'light',
  full_api_entreprise = 'full_api_entreprise',
  full_api_data_subventions = 'full_api_data_subventions',
  full_api_demarche = 'full_api_demarche',
  full = 'full'
}

@Component({
  selector: 'budget-infos-ligne',
  templateUrl: './infos-ligne.component.html',
  imports: [CommonModule, DetailCpComponent, DetailApiEntrepriseComponent, DetailApiDataSubventionsComponent, DetailApiDemarcheSimplifieComponent, OuNonRenseignePipe, ChargementOuErreurComponent],
  styleUrls: ['./infos-ligne.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InfosLigneComponent implements OnInit {
  
  private _route = inject(ActivatedRoute);
  private _searchDataService = inject(SearchDataService);
  private _service = inject(InformationsSupplementairesService);

  
  backToTable() {
    this._searchDataService.selectedLine = undefined
  }

  view: View = View.light;

  // titre: string = ""

  private _financial: FinancialDataModel | undefined = undefined;

  get financial() {
    return this._financial!;
  }

  entreprise_light: EtablissementLight | undefined;
  api_subvention_light$: Observable<SubventionLight> | undefined;
  affichage_dossier$: Observable<AffichageDossier> | undefined;

  ngOnInit() {
    // const data: FinancialDataModel = this._route.snapshot.data['infos_supplementaires'];
    // console.log(data)
    if (this._searchDataService.selectedLine)
      this._initFromResolverModel(this._searchDataService.selectedLine);
  }

  get vService(): InformationSupplementairesViewService {
    return this._service.viewService;
  }

  setup() {
    if (this._financial === undefined) return;

    this._service.setupViewModelService(this._financial);
    this.entreprise_light = this.vService.entrepriseLight();
    this.api_subvention_light$ = this.vService.apiSubventionLight$();
    this.affichage_dossier$ = this.vService.dossierDemarche$();
  }
/**
 * TODO : 
 * - fix grouping
 * - tags
 * - Affichage details ligne
 */
  _initFromResolverModel(data: FinancialDataModel) {
    if (data === undefined)
      return;
    this._financial = data;
    this.view = View.light;
    this.setup()
  }

  onClickFullApiEntreprise() {
    this.view = View.full_api_entreprise;
  }

  onClickFullApiDataSubventions() {
    this.view = View.full_api_data_subventions;
  }

  onClickDemarcheSimplifie() {
    this.view = View.full_api_demarche;
  }

  openInNewtab() {
    this._service.viewService.openInNewtab();
  }
}
