import {
  AsyncPipe,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet
} from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ChargementOuErreurComponent } from './chargement-ou-erreur/chargement-ou-erreur.component';
import { DetailApiDataSubventionsComponent } from './detail-api-data-subventions/detail-api-data-subventions.component';
import { DetailApiEntrepriseComponent } from './detail-api-entreprise/detail-api-entreprise.component';
import { DetailCpComponent } from './detail-cp/detail-cp.component';
import { InformationsSupplementairesService } from './services/informations-supplementaires.service';
import { InformationSupplementairesViewService } from './services/informations-supplementaires.viewservice';
import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';
import { EtablissementLight } from './models/EtablissementLight';
import { SubventionLight } from './models/SubventionLight';
import { DetailApiDemarcheSimplifieComponent } from './detail-api-demarche-simplifie/detail-api-demarche-simplifie.component';
import { FinancialDataModel } from '@models/financial/financial-data.models';
import { AffichageDossier } from '@models/demarche_simplifie/demarche.model';

 
export enum View {
  light = 'light',
  full_api_entreprise = 'full_api_entreprise',
  full_api_data_subventions = 'full_api_data_subventions',
  full_api_demarche = 'full_api_demarche',
  full = 'full'
}

 

@Component({
    selector: 'financial-informations-supplementaires',
    templateUrl: './informations-supplementaires.component.html',
    styleUrls: [
        './commun-informations-supplementaires.scss',
        './informations-supplementaires.component.scss'
    ],
    imports: [
        NgIf,
        AsyncPipe,
        NgTemplateOutlet,
        NgSwitch,
        NgSwitchCase,
        ChargementOuErreurComponent,
        DetailApiEntrepriseComponent,
        DetailApiDataSubventionsComponent,
        DetailApiDemarcheSimplifieComponent,
        DetailCpComponent,
        OuNonRenseignePipe
    ],
    providers: [InformationsSupplementairesService]
})
export class InformationsSupplementairesComponent implements OnInit {
  view: View = View.light;

  private _financial: FinancialDataModel | undefined = undefined;

  get financial() {
    return this._financial!;
  }

  @Input() set financial(financial) {
    this._financial = financial;
    this.setup();
  }

  entreprise_light: EtablissementLight | undefined;
  api_subvention_light$: Observable<SubventionLight> | undefined;
  affichage_dossier$: Observable<AffichageDossier> | undefined;

  ngOnInit() {
    const data: FinancialDataModel = this._route.snapshot.data['financial_data'];
    this._initFromResolverModel(data);
  }

  constructor(
    private _route: ActivatedRoute,
    private _service: InformationsSupplementairesService
  ) {}

  get vService(): InformationSupplementairesViewService {
    return this._service.viewService;
  }

  setup() {
    if (this._financial === undefined) return;

    this._service.setupViewModelService(this._financial);
    this.entreprise_light = this.vService.entreprise_light();
    this.api_subvention_light$ = this.vService.api_subvention_light$();
    this.affichage_dossier$ = this.vService.dossier_demarche$();
  }

  _initFromResolverModel(data: FinancialDataModel) {
    if (data === undefined) return;

    this.financial = data;

    this.view = View.full;
  }

  on_click_full_api_entreprise() {
    this.view = View.full_api_entreprise;
  }

  on_click_full_api_data_subventions() {
    this.view = View.full_api_data_subventions;
  }

  on_click_demarche_simplifie() {
    this.view = View.full_api_demarche;
  }

  open_in_newtab() {
    this._service.viewService.open_in_newtab();
  }
}
