import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'apps/common-lib/src/public-api';
import { BudgetFinancialComponent } from '../upload-financial/budget-financial.component';
import { BudgetFinancialNationalComponent } from '../upload-financial-national/budget-financial-national.component';

@Component({
  selector: 'budget-upload-financial-wrapper',
  standalone: true,
  imports: [CommonModule, BudgetFinancialComponent, BudgetFinancialNationalComponent],
  templateUrl: './budget-financial-wrapper.component.html',
})
export class BudgetFinancialWrapperComponent {
  private _session = inject(SessionService);

  public isNational = computed(() => {
    const region = this._session.regionCode();
    return region === 'NAT';
  });
}
