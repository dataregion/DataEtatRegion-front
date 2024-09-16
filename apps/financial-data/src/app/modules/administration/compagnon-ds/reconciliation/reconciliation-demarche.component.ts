import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertService } from 'apps/common-lib/src/public-api';
import { CompagnonDSService } from '../compagnon-ds.service';
import { Demarche, Donnee } from '@models/demarche_simplifie/demarche.model';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { GeoLocalisationComponentService } from '../../../../../../../common-lib/src/lib/components/localisation/geo.localisation.componentservice';

interface ReconciliationFormData {
  champEJ: string | null;
  champDS: string | null;
  centreCouts: string | null;
  domaineFonctionnel: string | null;
  refProg: string | null;
  annee: number | null;
  commune: string | null;
  epci: string | null;
  departement: string | null;
  region: string | null;
  champSiret: string | null;
  champMontant: string | null;
}

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

  //Champs reconciliation Montant / Siret
  // public centreCouts: any | null = null;
  // public centreCoutsList: any[] = [];
  //
  // public programme: BopModel | null = null;
  // public programmes: BopModel[] = [];
  //
  // public ref_programmation: ReferentielProgrammation | null = null;
  // public ref_programmations: ReferentielProgrammation[] = [];
  //
  // public annees: number[] = [];
  // public annee: number | null = null;
  //
  // public commune: GeoModel | null = null;
  // public communes: GeoModel[] = [];
  //
  // public epci: GeoModel | null = null;
  // public epcis: GeoModel[] = [];
  //
  // public departement: GeoModel | null = null;
  // public departements: GeoModel[] = [];
  //
  // public region: GeoModel | null = null;
  // public regions: GeoModel[] = [];
  //Fin Champs reconciliation Montant / Siret

  public reconciliationForm = new FormGroup({
    champEJ: new FormControl<string | null>(null),
    champDS: new FormControl<string | null>(null),
    centreCouts: new FormControl<string | null>(null),
    domaineFonctionnel: new FormControl<string | null>(null),
    refProg: new FormControl<string | null>(null),
    annee: new FormControl<number | null>(null),
    commune: new FormControl<string | null>(null),
    epci: new FormControl<string | null>(null),
    departement: new FormControl<string | null>(null),
    region: new FormControl<string | null>(null),
    champSiret: new FormControl<string | null>(null),
    champMontant: new FormControl<string | null>(null),
  });

  constructor(
    private _route: ActivatedRoute,
    private _alertService: AlertService,
    private _compagnonDS: CompagnonDSService,
    private _router: Router,
    // private _budgetService: BudgetService,
    // private _financialService: BudgetDataHttpService,
    // private _geo: GeoLocalisationComponentService,
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

  // private loadFieldsReconciliationMontantSiret() {
  //   forkJoin([
  //     this._budgetService.getBop(),
  //     this._budgetService.getReferentielsProgrammation(null),
  //     this._financialService.getAnnees(),
  //     this._geo.filterGeo(null, TypeLocalisation.COMMUNE),
  //     this._geo.filterGeo(null, TypeLocalisation.EPCI),
  //     this._geo.filterGeo(null, TypeLocalisation.DEPARTEMENT),
  //     this._geo.filterGeo(null, TypeLocalisation.REGION),
  //   ]).pipe(
  //     map(
  //       ([
  //         fetchedBop,
  //         fetchedRefs,
  //         fetchedAnnees,
  //         fetchedCommunes,
  //         fetchedEpcis,
  //         fetchedDepartements,
  //         fetchedRegions,
  //       ]) => {
  //         this.programmes = fetchedBop;
  //         this.ref_programmations = fetchedRefs;
  //         this.annees = fetchedAnnees;
  //         this.communes = fetchedCommunes;
  //         this.epcis = fetchedEpcis;
  //         this.departements = fetchedDepartements;
  //         this.regions = fetchedRegions;
  //       },
  //     ),
  //   );
  // }

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
  }

  private _setSelectedAndPatchValues(demarche: Demarche) {
    if (demarche.reconciliation === null) {
      return;
    }
    if (demarche.reconciliation.champEJ) {
      this.checkedId = 'reconciliation-ej';
    } else if (demarche.reconciliation.champDS) {
      this.checkedId = 'reconciliation-ds';
    } else if (demarche.reconciliation.champSiret) {
      this.checkedId = 'reconciliation-criteres';
    }

    let formData: ReconciliationFormData = {
      champEJ: demarche.reconciliation.champEJ,
      champDS: demarche.reconciliation.champDS,
      centreCouts: demarche.reconciliation.centreCouts,
      domaineFonctionnel: demarche.reconciliation.domaineFonctionnel,
      refProg: demarche.reconciliation.refProg,
      annee: demarche.reconciliation.annee,
      commune: demarche.reconciliation.commune,
      epci: demarche.reconciliation.epci,
      departement: demarche.reconciliation.departement,
      region: demarche.reconciliation.region,
      champSiret: demarche.reconciliation.champSiret,
      champMontant: demarche.reconciliation.champMontant,
    } as ReconciliationFormData;
    // Using JSON utilities to remove unecessary undefined values
    formData = JSON.parse(JSON.stringify(formData));
    this.reconciliationForm.patchValue(formData);
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
      formData.append('champSiret', this.reconciliationForm.value.champSiret!);
      formData.append(
        'champMontant',
        this.reconciliationForm.value.champMontant!,
      );
      if (this.reconciliationForm.value.centreCouts) {
        formData.append(
          'centreCouts',
          this.reconciliationForm.value.centreCouts,
        );
      }
      if (this.reconciliationForm.value.domaineFonctionnel) {
        formData.append(
          'domaineFonctionnel',
          this.reconciliationForm.value.domaineFonctionnel,
        );
      }
      if (this.reconciliationForm.value.refProg) {
        formData.append('refProg', this.reconciliationForm.value.refProg);
      }
      if (this.reconciliationForm.value.annee) {
        formData.append(
          'annee',
          this.reconciliationForm.value.annee.toString(),
        );
      }
      if (this.reconciliationForm.value.commune) {
        formData.append('commune', this.reconciliationForm.value.commune);
      }
      if (this.reconciliationForm.value.epci) {
        formData.append('epci', this.reconciliationForm.value.epci);
      }
      if (this.reconciliationForm.value.departement) {
        formData.append(
          'departement',
          this.reconciliationForm.value.departement,
        );
      }
      if (this.reconciliationForm.value.region) {
        formData.append('region', this.reconciliationForm.value.region);
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
}
