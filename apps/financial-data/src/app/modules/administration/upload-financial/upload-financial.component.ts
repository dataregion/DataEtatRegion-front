import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuditUpdateData, DataType } from '../../../models/audit/audit-update-data.models';
import { AuditHttpService } from '../../../services/http/audit.service';
import { AlertService, SessionService } from 'apps/common-lib/src/public-api';
import { BehaviorSubject, catchError, finalize, forkJoin, of, Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BudgetDataHttpService } from '../../../services/http/budget-lines-http.service';

@Component({
    selector: 'financial-upload-financial-component',
    templateUrl: './upload-financial.component.html',
    styleUrls: ['../common-for-pages-with-uploads.scss'],
    standalone: false
})
export class UploadFinancialComponent implements OnInit {
  private _service = inject(BudgetDataHttpService);
  private _session = inject(SessionService);
  private _auditService = inject(AuditHttpService);
  private _alertService = inject(AlertService);

  public readonly requiredFileType: string = '.csv';
  public DataType = DataType;

  uploadSub: Subscription | null = new Subscription();

  @ViewChild('fileUploadAe')
  fileUploadAe!: ElementRef<HTMLInputElement>;
  @ViewChild('fileUploadCp')
  fileUploadCp!: ElementRef<HTMLInputElement>;

  @ViewChild('fileUploadReferentiel')
  fileUploadReferentiel!: ElementRef<HTMLInputElement>;

  public fileFinancialAe: File | null = null;
  public fileFinancialCp: File | null = null;
  public fileReferentiel: File | null = null;

  public years;
  public dataSource: AuditUpdateData[] = [];

  private dialog = inject(MatDialog);

  /**
   * Indique si la recherche est en cours
   */
  public uploadInProgress = new BehaviorSubject(false);

  displayedColumns: string[] = ['username', 'filename', 'date'];

  public yearSelected = new Date().getFullYear();

  // public typeSelected: DataType | null = null;

  constructor() {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFile(event: any): File {
    return event.target.files[0];
  }

  uploadFinancialFiles() {
    if (this.fileFinancialAe !== null && this.fileFinancialCp !== null && this.yearSelected) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: this.yearSelected,
        width: '40rem',
        autoFocus: 'input'
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this._doLoadFiles();
        }
      });
    } else {
      this._doLoadFiles();
    }
  }

  uploadReferentiel() {
    if (this.fileReferentiel !== null) {
      this.uploadInProgress.next(true);
      this._service
        .loadReferentielFile(this.fileReferentiel)
        .pipe(
          finalize(() => {
            this.fileReferentiel = null;
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
    }
  }

  private _doLoadFiles() {
    if (this.fileFinancialAe !== null && this.fileFinancialCp !== null && this.yearSelected) {
      this.uploadInProgress.next(true);
      this._service
        .loadFinancialBudget(
          this.fileFinancialAe,
          this.fileFinancialCp,
          this.yearSelected.toString()
        )
        .pipe(
          finalize(() => {
            this.fileFinancialAe = null;
            this.fileFinancialCp = null;
            this.uploadInProgress.next(false);
          })
        )
        .subscribe({
          next: () => {
            this._alertService.openAlertSuccess(
              "Les fichiers ont bien été récupérés. Les données seront disponibles dans l'outil à partir de demain."
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
    const financialAe$ = this._auditService
      .getHistoryData(DataType.FINANCIAL_DATA_AE)
      .pipe(catchError((_error) => of([])));

    const financialCp$ = this._auditService
      .getHistoryData(DataType.FINANCIAL_DATA_CP)
      .pipe(catchError((_error) => of([])));

    forkJoin({
      ae: financialAe$,
      cp: financialCp$
    }).subscribe((response) => {
      const tabs = [...response.ae, ...response.cp];
      tabs.sort((a1: AuditUpdateData, a2: AuditUpdateData) => {
        return a1.date <= a2.date ? 1 : -1;
      });
      this.dataSource = tabs;
    });
  }
}
