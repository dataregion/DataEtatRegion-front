import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FinancialDataHttpService } from "@services/http/financial-data-http.service";
import { AlertService } from "apps/common-lib/src/public-api";
import { BehaviorSubject, finalize } from "rxjs";


@Component({
    selector: 'financial-update-tags.component',
    templateUrl: './update-tags.component.html',
    styleUrls: [ '../common-for-pages-with-uploads.scss' ],
})
export class UpdateTagsComponent {

    /** Indique si la recherche est en cours */
    public uploadInProgress = new BehaviorSubject(false);

    public fileMajTag: File | null = null;

    /**
     *
     */
    constructor(
        private _service: FinancialDataHttpService,
        private _alertService: AlertService) { }

    uploadFileMajTag() {

        if (this.fileMajTag !== null) {
            this.uploadInProgress.next(true);
            this._service
                .loadMajTagsFile(this.fileMajTag)
                .pipe(
                    finalize(() => {
                        this.fileMajTag = null;
                        this.uploadInProgress.next(false);
                    })
                )
                .subscribe({
                    next: () => {
                        this._alertService.openAlertSuccess(
                            'Le fichier a bien été récupéré. Il sera traité dans les prochaines minutes.'
                        );
                    },
                    error: (err: HttpErrorResponse) => {
                        if (err.error['message']) {
                            this._alertService.openAlertError(err.error['message']);
                        }
                    },
                });

        }
    }

    getFile(event: any): File {
        return event.target.files[0];
    }
}