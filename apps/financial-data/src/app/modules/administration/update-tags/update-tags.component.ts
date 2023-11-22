import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Tag, tag_fullname } from "@models/refs/tag.model";
import { BudgetService } from "@services/budget.service";
import { AlertService } from "apps/common-lib/src/public-api";
import { BehaviorSubject, finalize } from "rxjs";
import { Clipboard } from "@angular/cdk/clipboard";
import { BudgetDataHttpService } from "@services/http/budget-lines-http.service";


@Component({
    selector: 'financial-update-tags.component',
    templateUrl: './update-tags.component.html',
    styleUrls: [ '../common-for-pages-with-uploads.scss' ],
})
export class UpdateTagsComponent {

    /** Indique si la recherche est en cours */
    public uploadInProgress = new BehaviorSubject(false);

    public fileMajTag: File | null = null;

    public tags: Tag[] = [];

    private _destroyRef = inject(DestroyRef)

    constructor(
        private _service: BudgetDataHttpService,
        private _budgetService: BudgetService,
        private _alertService: AlertService,
        private _clipboard: Clipboard,
    ) {
        this._budgetService.allTags$()
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(tags => this.tags = tags)
    }

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
    
    displayTagCodename(tag: Tag) {
        return tag_fullname(tag)
    }
    
    copyTagToClipboard(tag: Tag) {
        const content = this.displayTagCodename(tag)
        this._clipboard.copy(content)
        this._alertService.openAlertCopiedInClipboard(content);
    }
}