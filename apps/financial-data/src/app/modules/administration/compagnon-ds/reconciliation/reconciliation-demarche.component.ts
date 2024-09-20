import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AlertService,
  GeoModel,
  ReferentielsHttpService,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { CompagnonDSService } from '../compagnon-ds.service';
import { Demarche, Donnee } from '@models/demarche_simplifie/demarche.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { GeoLocalisationComponentService } from '../../../../../../../common-lib/src/lib/components/localisation/geo.localisation.componentservice';
import { BudgetDataHttpService } from '@services/http/budget-lines-http.service';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';
import {
  CentreCouts,
  CodeLabel,
  DomaineFonctionnel,
} from '@models/financial/common.models';

@Component({
  selector: 'financial-reconciliation-demarche.component',
  templateUrl: './reconciliation-demarche.component.html',
  providers: [GeoLocalisationComponentService],
})
export class ReconciliationDemarcheComponent implements OnInit {
  private _destroyRef = inject(DestroyRef);

  public checkedId: string = '';

  public demarche: Demarche | null = null;
  public donnees: Donnee[] | null = null;

  public annees: number[] = [];

  public reconciliationForm = new FormGroup({
    champEJ: new FormControl(''),
    champDS: new FormControl(''),
    champMontant: new FormControl(''),
  });

  public centreCouts: CentreCouts | null = null;
  public domaineFonctionnel: DomaineFonctionnel | null = null;
  public refProg: ReferentielProgrammation | null = null;
  public annee: number | null = null;
  public commune: GeoModel | null = null;
  public epci: GeoModel | null = null;
  public departement: GeoModel | null = null;
  public region: GeoModel | null = null;

  constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _compagnonDS: CompagnonDSService,
    private _router: Router,
    private _referentielService: ReferentielsHttpService,
    private _financialService: BudgetDataHttpService,
    private _geo: GeoLocalisationComponentService,
  ) {
    this.checkedId = 'reconciliation-no';
  }

  ngOnInit(): void {
    // Vérification des query params & de si la démarche est déjà présente en BDD
    combineLatest({
      params: this._route.queryParams,
      demarche: this._compagnonDS.demarche$,
    })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((results) => {
        // Paramètre 'number' obligatoire !
        if (!('number' in results.params)) {
          this._router.navigate(['/administration/demarches/integration']);
        }

        // Si pas déjà récupéré par le compagnon DS
        if (results.demarche !== null) {
          this._initWithDemarche(results.demarche);
          return;
        }

        // Récupération de la démarche en BDD
        this._compagnonDS
          .getDemarche(results.params['number'])
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: (value) => {
              if (value !== null) {
                this._initWithDemarche(value);
              } else {
                this._alertService.openAlertError(
                  "Cette démarche n'a pas été intégrée.",
                );
                this._router.navigate([
                  '/administration/demarches/integration',
                ]);
              }
            },
            error: (err: HttpErrorResponse) => {
              if (err.error['message']) {
                this._alertService.openAlertError(err.error['message']);
              }
            },
          });
      });
  }

  private _initWithDemarche(demarche: Demarche) {
    this.demarche = demarche;
    // Récupération des données
    this._compagnonDS
      .getDemarchesDonnees(demarche.number)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (results) => {
          this.donnees = results;
          this._compagnonDS.setDonnees(results);
          this._setSelectedAndPatchValues(demarche);
        },
        error: (err: HttpErrorResponse) => {
          if (err.error['message']) {
            this._alertService.openAlertError(err.error['message']);
          }
        },
      });

    this._financialService.getAnnees().subscribe((annees) => {
      this.annees = annees;
    });
  }

  private _setSelectedAndPatchValues(demarche: Demarche) {
    if (demarche.reconciliation === null) {
      return;
    }
    if (demarche.reconciliation.champEJ) {
      this.checkedId = 'reconciliation-ej';
      this.reconciliationForm.patchValue({
        champEJ: demarche.reconciliation.champEJ,
      });
    } else if (demarche.reconciliation.champDS) {
      this.checkedId = 'reconciliation-ds';
      this.reconciliationForm.patchValue({
        champDS: demarche.reconciliation.champDS,
      });
    } else if (demarche.reconciliation.champMontant) {
      this.checkedId = 'reconciliation-criteres';
      this.reconciliationForm.patchValue({
        champMontant: demarche.reconciliation.champMontant,
      });
    }
  }

  onRadioChecked(event: Event) {
    this.checkedId = (event?.target as HTMLElement)?.id;
  }

  isInputChecked(id: string) {
    return id === this.checkedId;
  }

  saveReconciliation() {
    if (this.demarche === null) {
      this._alertService.openAlertError('Erreur : aucune démarche');
      return;
    }

    const formData = new FormData();
    formData.append('id', this.demarche.number.toString());
    if (this.checkedId === 'reconciliation-ej')
      formData.append('champEJ', this.reconciliationForm.value.champEJ!);
    // else if (this.checkedId === 'reconciliation-ds')
    //   formData.append('champDS', this.reconciliationForm.value.champDS!);
    else if (this.checkedId === 'reconciliation-criteres') {
      formData.append(
        'champMontant',
        this.reconciliationForm.value.champMontant!,
      );
      if (this.centreCouts) {
        formData.append('centreCouts', this.centreCouts.code);
      }
      if (this.domaineFonctionnel) {
        formData.append('domaineFonctionnel', this.domaineFonctionnel.code);
      }
      if (this.refProg) {
        formData.append('refProg', this.refProg.code);
      }
      if (this.annee) {
        formData.append('annee', this.annee.toString());
      }
      if (this.commune) {
        formData.append('commune', this.commune.code);
      }
      if (this.epci) {
        formData.append('epci', this.epci.code);
      }
      if (this.departement) {
        formData.append('departement', this.departement.code);
      }
      if (this.region) {
        formData.append('region', this.region.code);
      }
    }

    this._compagnonDS
      .saveReconciliation(formData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (demarche: Demarche) => {
          this._compagnonDS.setDemarche(demarche);
          this._router.navigate(['/administration/demarches/affichage'], {
            queryParams: { number: this.demarche?.number },
          });
        },
        error: (err: HttpErrorResponse) => {
          if (err.error['message']) {
            this._alertService.openAlertError(err.error['message']);
          }
        },
      });
  }

  renderCodeLabel = (item: CodeLabel): string => {
    return item ? `${item.label} (${item.code})` : '';
  };

  getCentreCouts = (input: string): Observable<CentreCouts[]> => {
    return this._referentielService.searchCentreCouts(input, null);
  };

  getDomainesFonctionnel = (
    input: string,
  ): Observable<DomaineFonctionnel[]> => {
    return this._referentielService.searchDomainesFonctionnel(input, null);
  };

  getReferentielsProgrammation = (
    input: string,
  ): Observable<ReferentielProgrammation[]> => {
    return this._referentielService.searchReferentielProgrammation(input, null);
  };

  renderGeoModel = (item: GeoModel): string => {
    return item ? `${item.code} - ${item.nom}` : '';
  };

  getCommunes = (input: string): Observable<GeoModel[]> => {
    return this._geo.filterGeo(input, TypeLocalisation.COMMUNE);
  };

  getEpcis = (input: string): Observable<GeoModel[]> => {
    return this._geo.filterGeo(input, TypeLocalisation.EPCI);
  };

  getDepartements = (input: string): Observable<GeoModel[]> => {
    return this._geo.filterGeo(input, TypeLocalisation.DEPARTEMENT);
  };

  getRegions = (input: string): Observable<GeoModel[]> => {
    return this._geo.filterGeo(input, TypeLocalisation.REGION);
  };
}
