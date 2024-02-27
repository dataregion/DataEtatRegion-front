import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Tag, tag_fullname } from "@models/refs/tag.model";
import { BudgetService } from "@services/budget.service";
import { AlertService } from "apps/common-lib/src/public-api";
import { BehaviorSubject, finalize } from "rxjs";
import { Clipboard } from "@angular/cdk/clipboard";
import { BudgetDataHttpService } from "@services/http/budget-lines-http.service";
import { ColonneLibelles, ColonnesService } from "@services/colonnes.service";
import { DemarcheHttpService } from "@services/http/demarche.service";


@Component({
    selector: 'financial-integration-demarche.component',
    templateUrl: './integration-demarche.component.html',
    styleUrls: [ '../common-for-pages-with-uploads.scss' ],
})
export class IntegrationDemarcheComponent {

  private _destroyRef = inject(DestroyRef)

  public inputDemarche: string = "";
  public nomDemarche: string | undefined = "";

  constructor(
      private _demarcheService: DemarcheHttpService,
      private _alertService: AlertService,
  ) {
  }

  searchDemarche() {
    this._demarcheService.getDemarcheLight(parseInt(this.inputDemarche))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((demarche) => {
        this.nomDemarche = demarche?.title
      })
  }

  saveDemarche() {
    this._demarcheService.saveDemarche(parseInt(this.inputDemarche))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (demarche) => {
            this._alertService.openAlertSuccess(demarche['message']);
        },
        error: (err: HttpErrorResponse) => {
            if (err.error['message']) {
                this._alertService.openAlertError(err.error['message']);
            }
        }
      })
  }

}