import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuditUpdateData, DataType } from '@models/audit/audit-update-data.models';
import { AuditHttpService } from '@services/http/audit.service';
import { AlertService, SessionService } from 'apps/common-lib/src/public-api';
import { BehaviorSubject, catchError, finalize, forkJoin, of, Subscription } from 'rxjs';

import { BudgetDataHttpService } from '@services/http/budget-lines-http.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'france-relance-upload-laureats-component',
    templateUrl: './upload-laureats.component.html',
    styleUrls: ['../common-for-pages-with-uploads.scss'],
    standalone: false
})
export class UploadLaureatsComponent implements OnInit {
  public readonly requiredFileType: string = '.csv';
  public DataType = DataType;

  uploadSub: Subscription | null = new Subscription();

  @ViewChild('fileFrance2030Upload')
  fileFrance2030Upload!: ElementRef<HTMLInputElement>;

  public fileFrance2030: File | null = null;

  public years;
  public dataSource: AuditUpdateData[] = [];

  /**
   * Indique si la recherche est en cours
   */
  public uploadInProgress = new BehaviorSubject(false);

  displayedColumns: string[] = ['username', 'filename', 'date'];

  public yearSelected = new Date().getFullYear();

  public typeSelected: DataType = DataType.FRANCE_2030;

  constructor(
    private _service: BudgetDataHttpService,
    private _session: SessionService,
    private _auditService: AuditHttpService,
    private _alertService: AlertService
  ) {
    const max_year = new Date().getFullYear();
    let arr = Array(8).fill(new Date().getFullYear());
    arr = arr.map((_val, index) => max_year - index);
    this.years = arr;
  }

  ngOnInit(): void {
    this._fetchAudit();
  }

  public get isAdmin(): boolean {
    return this._session.isAdmin();
  }

  getFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input.files ? input.files[0] : null;
  }

  uploadFrance2030File() {
    if (this.fileFrance2030 !== null && this.yearSelected && this.typeSelected) {
      this._doLoadFile();
    }
  }

  private _doLoadFile() {
    if (this.fileFrance2030 !== null && this.yearSelected && this.typeSelected) {
      this.uploadInProgress.next(true);
      // TODO: utiliser un autre service, non lié aux données financières.
      this._service
        // XXX: ici, on charge le fichier france 2030
        .loadFinancialFrance2030(this.fileFrance2030, this.yearSelected.toString())
        .pipe(
          finalize(() => {
            this.fileFrance2030 = null;
            this.uploadInProgress.next(false);
          })
        )
        .subscribe({
          next: () => {
            this._alertService.openAlertSuccess(
              'Le fichier a bien été récupéré. Il sera traité dans les prochaines minutes.'
            );
            this._fetchAudit();
          },
          error: (err: HttpErrorResponse) => {
            if (err.error['message']) {
              this._alertService.openAlertError(err.error['message']);
            }
          }
        });
    }
  }

  private _fetchAudit() {
    const france2030$ = this._auditService
      .getHistoryData(DataType.FRANCE_2030)
      .pipe(catchError((_error) => of([])));

    forkJoin({
      audit: france2030$
    }).subscribe((response) => {
      const tabs = [...response.audit];
      tabs.sort((a1: AuditUpdateData, a2: AuditUpdateData) => {
        return a1.date <= a2.date ? 1 : -1;
      });
      this.dataSource = tabs;
    });
  }
}
