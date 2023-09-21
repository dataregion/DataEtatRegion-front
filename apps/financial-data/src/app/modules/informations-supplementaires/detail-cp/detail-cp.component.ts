import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FinancialDataModel } from '@models/financial/financial-data.models';

@Component({
  standalone: true,
  selector: 'financial-informations-supplementaires-detail-cp',
  templateUrl: './detail-cp.component.html',
  styleUrls: ['../commun-informations-supplementaires.scss', './detail-cp.component.scss'],
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe
  ]
})
export class DetailCpComponent {

  private _financial: FinancialDataModel | undefined = undefined;
  
  hasCp: boolean = true;

  private _messagesErreurs = {
    "CHORUS" : "Aucun crédit de paiement",
    "ADEME" : "Détails paiement : information indisponible",
  }
  messageErreur(): string {
    let erreur = "Erreur lors de la récupération de l'engagement";
    if (this._financial) {
      erreur = this._financial?.source in this._messagesErreurs ? this._messagesErreurs[this._financial?.source] : "Détails paiement : information indisponible"
    }
    return erreur;
  }

  get financial() {
    return this._financial!;
  }
  @Input() set financial(financial) {
    this._financial = financial;
    this.hasCp = this._financial.financial_cp !== undefined ? this._financial.financial_cp?.length > 0 : false;
  }

  format_date(date: string) {
    return new Date(date).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' })
  }

}
