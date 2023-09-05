import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { RowData } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { InformationsSupplementairesComponent } from '../informations-supplementaires.component';
import { FinancialDataModel } from '@models/financial/financial-data.models';
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
    private httpService: FinancialDataHttpService
    ) {
    this.financial_data = data.row as FinancialDataModel;
    // Récupération de l'AE pour avoir le détails des CP associés
    this.httpService.getById(data.row['id']).subscribe({
      next: result => this.financial_data = result as FinancialDataModel,
      error: err => console.error(err)
    })
  }
  
}
