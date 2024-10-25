import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService, LoaderService } from 'apps/common-lib/src/public-api';
import { forkJoin } from 'rxjs';
import { CompagnonDSService } from '../compagnon-ds.service';
import { Demarche, Token } from '@models/demarche_simplifie/demarche.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'financial-integration-demarche.component',
  templateUrl: './integration-demarche.component.html'
})
export class IntegrationDemarcheComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);

  public demarche: Demarche | null = null;

  public integrationForm = new FormGroup({
    numeroDemarche: new FormControl('')
  });

  public tokens: Token[] = [];
  public selectedToken: Token | null = null;
  public tokenId: number | null = null;
  public numberDemarche: number | null = null;
  public nomDemarche: string | undefined = '';
  public integree: boolean = false;
  public dejaIntegree: boolean = false;
  public dateIntegration: Date | null = null;
  public somethingIsLoading: boolean = false;

  constructor(
    private _loaderService: LoaderService,
    private _route: ActivatedRoute,
    private _compagnonDS: CompagnonDSService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Vérification des query params
    this._route.queryParams.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((params) => {
      if (!('number' in params)) {
        // Vérification si la démarche a déjà été récupérée et stockée dans le service
        this._compagnonDS.demarche$
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe((value) => {
            this.demarche = value;
            if (value !== null) {
              this.integrationForm.patchValue({
                numeroDemarche: value.number.toString()
              });
              this.nomDemarche = value.title;
              this.dejaIntegree = true;
              this.dateIntegration = value.date_import;
            }
          });
      } else {
        this.integrationForm.patchValue({ numeroDemarche: params['number'] });
        this.searchDemarche();
      }
    });

    this._loaderService.isLoading().subscribe((loading) => {
      this.somethingIsLoading = loading;
    });

    this._compagnonDS.getTokens().subscribe((tokens) => {
      this.tokens = tokens;
      if (this.tokens.length > 0) {
        this.selectedToken = this.tokens[0];
      }
    });
  }

  searchDemarche() {
    if (this.integrationForm.value.numeroDemarche == null) {
      this._alertService.openAlertError('Veuillez rentrer un numéro de démarche');
      return;
    }

    if (/^\d+$/.test(this.integrationForm.value.numeroDemarche) == false) {
      this._alertService.openAlertError('Veuillez rentrer un numéro de démarche valide');
      return;
    }

    this.numberDemarche = parseInt(this.integrationForm.value.numeroDemarche);

    if (this.numberDemarche > Number.MAX_SAFE_INTEGER) {
      this._alertService.openAlertError('Veuillez rentrer un numéro de démarche valide');
      return;
    }

    if (!this.selectedToken || !this.selectedToken.id) {
      this._alertService.openAlertError('Veuillez choisir un token');
      return;
    }

    this.tokenId = this.selectedToken.id;
    forkJoin({
      graphFetch: this._compagnonDS.getDemarcheLigthFromApiExterne(
        this.tokenId,
        this.numberDemarche
      ),
      dbFetch: this._compagnonDS.getDemarche(this.numberDemarche)
    })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (results) => {
          this.nomDemarche = results.graphFetch?.title;
          if (results.dbFetch !== null && results.dbFetch.number === this.numberDemarche) {
            this._compagnonDS.setDemarche(results.dbFetch);
            this.dejaIntegree = true;
            this.dateIntegration = results.dbFetch.date_import;
          }
        },
        error: (err: HttpErrorResponse) => {
          this.nomDemarche = '';
          this.integree = false;
          this.dejaIntegree = false;
          if (err.error?.message) this._alertService.openAlertError(err.error.message);
          else this._alertService.openAlertError(err.message);
        }
      });
  }

  saveDemarche() {
    if (this.numberDemarche == null) {
      this._alertService.openAlertError('Veuillez rentrer un numéro de démarche');
      return;
    }

    if (this.tokenId == null) {
      this._alertService.openAlertError('Veuillez choisir un token');
      return;
    }

    this._compagnonDS
      .saveDemarche(this.tokenId, this.numberDemarche)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (demarche: Demarche) => {
          this._alertService.openAlertSuccess('Démarche intégrée');
          this.integree = true;
          this.dateIntegration = demarche.date_creation;
          this._compagnonDS.setDemarche(demarche);
        },
        error: (err: HttpErrorResponse) => {
          if (err.error['message']) {
            this._alertService.openAlertError(err.error['message']);
          }
        }
      });
  }

  renderToken(token: Token) {
    if (!token) {
      return '';
    }
    return token.nom;
  }
}
