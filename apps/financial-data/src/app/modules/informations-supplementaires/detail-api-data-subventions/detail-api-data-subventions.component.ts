import { CurrencyPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { ChargementOuErreurComponent } from '../chargement-ou-erreur/chargement-ou-erreur.component';
import { InformationsSupplementairesService } from '../services/informations-supplementaires.service';
import { SubventionFull } from '../models/SubventionFull';
import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';

@Component({
    selector: 'financial-informations-supplementaires-detail-subventions',
    templateUrl: './detail-api-data-subventions.component.html',
    styleUrls: [
        '../commun-informations-supplementaires.scss',
        './detail-api-data-subventions.component.scss'
    ],
    imports: [
        ChargementOuErreurComponent,
        NgIf,
        CurrencyPipe,
        NgTemplateOutlet,
        OuNonRenseignePipe
    ]
})
export class DetailApiDataSubventionsComponent {
  public info: SubventionFull | null = null;

  get vService() {
    return this.service.viewService;
  }

  constructor(private service: InformationsSupplementairesService) {
    service.viewService.api_subvention_full$().subscribe((subvention) => {
      this.info = subvention;
    });
  }

  stringify(data: unknown) {
    return JSON.stringify(data);
  }

  private get action() {
    const actions = this.info?.subvention?.actions_proposees || [];
    if (actions.length < 1) return null;
    return actions[0];
  }

  get objectif() {
    const action = this.action;
    return action?.intitule;
  }

  get description() {
    const action = this.action;
    return action?.objectifs;
  }

  get a_aucune_info() {
    return this.service.viewService.subvention_full_has_no_info(this.info);
  }

  get lien_data_subvention() {
    return `https://datasubvention.beta.gouv.fr/etablissement/${this.info?.siret}`;
  }
}
