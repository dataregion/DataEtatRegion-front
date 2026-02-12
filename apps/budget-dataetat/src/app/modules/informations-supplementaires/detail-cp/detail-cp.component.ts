import { CurrencyPipe } from '@angular/common';
import { Component, input, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';
import { DetailsPaiement, DtailsPaiementService } from 'apps/clients/v3/financial-data';
import { tap } from 'rxjs/operators';
import { ChargementOuErreurComponent } from '../chargement-ou-erreur/chargement-ou-erreur.component';
import { LoggerService } from 'apps/common-lib/src/lib/services/logger.service';

@Component({
  selector: 'budget-informations-supplementaires-detail-cp',
  templateUrl: './detail-cp.component.html',
  styleUrls: ['../commun-informations-supplementaires.scss', './detail-cp.component.scss'],
  imports: [
    ChargementOuErreurComponent,
    CurrencyPipe
  ]
})
export class DetailCpComponent {
  /**
   * Signal d'entrée contenant les données financières à afficher
   */
  financial = input.required<BudgetFinancialDataModel>();
  cps = signal<DetailsPaiement[]>([]);

  hasCp = computed(() => {
    const cps = this.cps();
    return ( cps?.length ?? 0 ) > 0;
  });
  
  public isLoading = true;

  private _detailsPaiementApi: DtailsPaiementService = inject(DtailsPaiementService);
  private _destroyRef = inject(DestroyRef);
  private _logger = inject(LoggerService);

  public constructor() {

    toObservable(this.financial)
    .pipe(
      tap(() => { 
        this.isLoading = true;
        this.cps.set([]);
     }),
      takeUntilDestroyed(this._destroyRef)
    )
    .subscribe({
      next: (financial) => {
        if (financial) {
          this._detailsPaiementApi
            .getDetailsPaiementPourLigneFinanciereLignesIdAeDetailsPaiementGet(
              {
                idAe: financial.id
              }
            )
            .subscribe((cps) => {
              this._logger.debug('Détails paiement récupérés :', cps);
              this.cps.set(cps.data?.dps ?? []);
              this.isLoading = false;
            });
        }
      }
    });
  }


  private readonly _messagesErreurs = {
    FINANCIAL_DATA_AE: 'Aucun crédit de paiement',
    FINANCIAL_DATA_CP:
      "Détails paiement : cette ligne est un crédit de paiement non rattaché à une ligne d'engagement.",
    ADEME: 'Détails paiement : information indisponible'
  } as const;

  /**
   * Calcule le message d'erreur approprié selon la source des données financières
   * @returns Le message d'erreur formaté
   */
  messagePourCasSpecial(): string {
    const financialData = this.financial();
    const source = financialData.source as keyof typeof this._messagesErreurs;

    return source in this._messagesErreurs
      ? this._messagesErreurs[source]
      : 'Détails paiement : information indisponible';
  }

  /**
   * Formate une date au format français
   * @param date - La date à formater (chaîne de caractères)
   * @returns La date formatée
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}
