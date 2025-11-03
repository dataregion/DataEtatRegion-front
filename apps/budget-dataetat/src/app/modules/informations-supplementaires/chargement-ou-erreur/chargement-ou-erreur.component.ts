import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiExterneError } from 'apps/clients/apis-externes-v3';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModelError } from 'apps/clients/apis-externes';

@Component({
    selector: 'budget-informations-supplementaires-chargement-ou-erreur',
    imports: [CommonModule, MatProgressSpinnerModule],
    templateUrl: './chargement-ou-erreur.component.html',
    styleUrls: [
        '../commun-informations-supplementaires.scss',
        './chargement-ou-erreur.component.scss'
    ]
})
export class ChargementOuErreurComponent {
  @Input() erreur: ApiExterneError | ModelError | null = null;

  readonly nom_service_distant = input<string>('Inconnu');
}
