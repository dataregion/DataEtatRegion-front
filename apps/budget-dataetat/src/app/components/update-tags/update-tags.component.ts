import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from 'apps/common-lib/src/public-api';
import { BehaviorSubject, finalize } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
// import { ColonneLibelles, ColonnesService } from '@services/colonnes.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BudgetDataHttpService } from '../../services/http/budget-lines-http.service';
import { Tag, tag_fullname } from '../../models/refs/tag.model';
import { ColonneLibelles, ColonnesService } from '../../services/colonnes.service';

@Component({
  selector: 'budget-update-tags',
  templateUrl: './update-tags.component.html',
  styleUrls: ['./update-tags.component.scss'],
  imports: [MatIconModule, MatCardModule]
})
export class UpdateTagsComponent {
  private _service = inject(BudgetDataHttpService);
  private _colonnesService = inject(ColonnesService);
  private _alertService = inject(AlertService);
  private _clipboard = inject(Clipboard);

  /** Indique si la recherche est en cours */
  public uploadInProgress = new BehaviorSubject(false);

  public fileMajTag: File | null = null;

  public tags: Tag[] = [];

  private _destroyRef = inject(DestroyRef);

  constructor() {
    this._service
      .allTags$()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((tags) => (this.tags = tags));
  }

  uploadFileMajTag() {
    if (this.fileMajTag !== null) {
      // Fichier qui sera envoyé au back
      let fileToUpload: File;
      this.fileMajTag
        .text()
        // Remplacement des pretty headers par les clés correspondantes
        .then((contentFile) => {
          // Récupération des clés
          const headers: string[] = contentFile.split('\n')[0].split(',');
          const newHeaders: string[] = [];
          headers.forEach((header) => {
            const code = this._colonnesService.getCodeByLibelle(header as ColonneLibelles);
            if (code) newHeaders.push(code);
          });
          // Création du fichier avec les nouveaux headers
          const table = contentFile.split('\n');
          table.shift();
          table.unshift(newHeaders.join(','));
          fileToUpload = new File([table.join('\n') as BlobPart], this.fileMajTag?.name ?? '');
        })
        // Envoi du fichier modifié au back
        .finally(() => {
          this.uploadInProgress.next(true);
          this._service
            .loadMajTagsFile(fileToUpload)
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
              }
            });
        });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFile(event: any): File {
    return event.target.files[0];
  }

  displayTagCodename(tag: Tag) {
    return tag_fullname(tag);
  }

  copyTagToClipboard(tag: Tag) {
    const content = this.displayTagCodename(tag);
    this._clipboard.copy(content);
    this._alertService.openAlertCopiedInClipboard(content);
  }
}
