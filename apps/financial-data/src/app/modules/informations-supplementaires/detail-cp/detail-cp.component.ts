import { NgIf, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FinancialCp, FinancialDataModel } from '@models/financial/financial-data.models';

@Component({
  standalone: true,
  selector: 'financial-informations-supplementaires-detail-cp',
  templateUrl: './detail-cp.component.html',
  styleUrls: ['../commun-informations-supplementaires.scss', './detail-cp.component.scss'],
  imports: [
    NgIf,
    NgFor
  ]
})
export class DetailCpComponent {

  private _financial: FinancialDataModel | undefined = undefined;

  private _financialCp: FinancialCp[] | undefined = [];
  hasCp: boolean = true;

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
