import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AlertService } from "apps/common-lib/src/public-api";
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