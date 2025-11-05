import { CurrencyPipe } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { BudgetFinancialDataModel } from '@models/financial/financial-data.models';

@Component({
    selector: 'budget-informations-supplementaires-detail-cp',
    templateUrl: './detail-cp.component.html',
    styleUrls: ['../commun-informations-supplementaires.scss', './detail-cp.component.scss'],
    imports: [CurrencyPipe]
})
export class DetailCpComponent {
  
  /**
   * Signal d'entrée contenant les données financières à afficher
   */
  financial = input.required<BudgetFinancialDataModel>();

  /**
   * Signal calculé qui détermine si des crédits de paiement sont disponibles
   */
  hasCp = computed(() => {
    const financialData = this.financial();
    return financialData.financial_cp != null && financialData.financial_cp.length > 0;
  });

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
  messageErreur(): string {
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
    return new Date(date).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
  }
}
