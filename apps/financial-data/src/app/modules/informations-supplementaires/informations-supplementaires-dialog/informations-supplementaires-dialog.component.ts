import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { RowData } from 'apps/grouping-table/src/lib/components/grouping-table/group-utils';
import { InformationsSupplementairesComponent } from '../informations-supplementaires.component';
import { FinancialDataModel } from '../../../models/financial/financial-data.models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BudgetDataHttpService } from '../../../services/http/budget-lines-http.service';

export interface InformationsSupplementairesDialogData {
  row: RowData;
}

@Component({
    selector: 'financial-informations-supplementaires-dialog',
    templateUrl: './informations-supplementaires-dialog.component.html',
    imports: [InformationsSupplementairesComponent, MatDialogModule]
})
export class InformationsSupplementairesDialogComponent {
  data = inject<InformationsSupplementairesDialogData>(MAT_DIALOG_DATA);
  private _httpService = inject(BudgetDataHttpService);

  public financial_data: FinancialDataModel;

  constructor() {
    const data = this.data;

    this.financial_data = data.row as FinancialDataModel;

    // Récupération de l'AE pour avoir le détails des CP associés
    if (this.financial_data.source === 'FINANCIAL_DATA_AE') {
      this._httpService
        .getCp(data.row['id'])
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (result) => {
            this.financial_data = { ...this.financial_data, financial_cp: result };
          },
          error: (err) => console.error(err)
        });
    }
  }
}
