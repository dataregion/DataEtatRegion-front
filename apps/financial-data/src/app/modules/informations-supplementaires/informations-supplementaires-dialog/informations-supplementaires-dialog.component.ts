import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { RowData } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { InformationsSupplementairesComponent } from '../informations-supplementaires.component';
import { FinancialDataModel, FinancialCp } from '@models/financial/financial-data.models';
import { FinancialDataHttpService } from '@services/http/financial-data-http.service';

export interface InformationsSupplementairesDialogData {
  row: RowData
}


@Component({
  standalone: true,
  selector: 'financial-informations-supplementaires-dialog',
  templateUrl: './informations-supplementaires-dialog.component.html',
  imports: [
    InformationsSupplementairesComponent,
    MatDialogModule
  ],
})
export class InformationsSupplementairesDialogComponent {

  public financial_data: FinancialDataModel;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InformationsSupplementairesDialogData,
    private _httpService: FinancialDataHttpService
    ) {
    this.financial_data = data.row as FinancialDataModel;

    // Récupération de l'AE pour avoir le détails des CP associés
    if (this.financial_data.source === "CHORUS") {
      this._httpService.getCp(data.row['id']).subscribe({
        next: result => {
          this.financial_data = {...this.financial_data, financial_cp: result as unknown as FinancialCp[]}
        },
        error: err => console.error(err)
      })
    }
  }

}
