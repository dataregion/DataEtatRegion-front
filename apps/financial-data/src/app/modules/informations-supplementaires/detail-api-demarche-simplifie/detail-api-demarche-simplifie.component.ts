import { NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChargementOuErreurComponent } from '../chargement-ou-erreur/chargement-ou-erreur.component';
import { InformationsSupplementairesService } from '../services/informations-supplementaires.service';
import { OuNonRenseignePipe } from 'apps/common-lib/src/public-api';
import { AffichageDossier } from '../../../models/demarche_simplifie/demarche.model';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { ISettingsService } from 'apps/common-lib/src/lib/environments/interface-settings.service';

@Component({
    selector: 'financial-informations-demarche-simplifie',
    templateUrl: './detail-api-demarche-simplifie.component.html',
    styleUrls: ['../commun-informations-supplementaires.scss'],
    imports: [
        ChargementOuErreurComponent,
        NgIf,
        NgTemplateOutlet,
        OuNonRenseignePipe
    ]
})
export class DetailApiDemarcheSimplifieComponent {
  readonly settings = inject<ISettingsService>(SETTINGS);
  private service = inject(InformationsSupplementairesService);

  public affichageDossier!: AffichageDossier;
  public url_dossier_ds?: string;

  public moneyFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  });

  constructor() {
    const settings = this.settings;
    const service = this.service;

    service.viewService
      .dossier_demarche$()
      .subscribe((dossier) => (this.affichageDossier = dossier));
    this.url_dossier_ds = settings.getSetting().url_dossier_ds;
  }

  get vService() {
    return this.service.viewService;
  }

  public getMontant(label: string) {
    if (!label) {
      return 'Non renseigné';
    }
    const montant = label.replace(',', '.').replace(/[^0-9.,]/, '');
    return this.moneyFormat.format(Number(montant));
  }
}
