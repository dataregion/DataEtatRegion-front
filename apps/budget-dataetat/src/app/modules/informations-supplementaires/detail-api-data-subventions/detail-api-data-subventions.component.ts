import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChargementOuErreurComponent } from '../chargement-ou-erreur/chargement-ou-erreur.component';
import { InformationsSupplementairesService } from '../services/informations-supplementaires.service';
import { SubventionFull } from '../models/SubventionFull';
import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'budget-informations-supplementaires-detail-subventions',
    templateUrl: './detail-api-data-subventions.component.html',
    styleUrls: [
        '../commun-informations-supplementaires.scss',
        './detail-api-data-subventions.component.scss'
    ],
    imports: [
        ChargementOuErreurComponent,
        CurrencyPipe,
        NgTemplateOutlet,
        OuNonRenseignePipe
    ]
})
export class DetailApiDataSubventionsComponent {
  private service = inject(InformationsSupplementairesService);

  public info: SubventionFull | null = null;

  get vService() {
    return this.service.viewService;
  }

  constructor() {
    const service = this.service;

    service.viewService.apiSubventionFull$().pipe(takeUntilDestroyed()).subscribe((subvention) => {
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
    return this.service.viewService.subventionFullHasNoInfo(this.info);
  }

  get lien_data_subvention() {
    return `https://datasubvention.beta.gouv.fr/etablissement/${this.info?.siret}`;
  }
}
