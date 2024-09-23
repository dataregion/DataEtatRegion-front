import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AlertService } from "apps/common-lib/src/public-api";
import { CompagnonDSService } from "../compagnon-ds.service";
import { Demarche, Donnee } from "@models/demarche_simplifie/demarche.model";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";

interface ReconciliationFormData {
    champEJ: string | undefined; 
    champDS: string | undefined; 
    centreCouts: string | undefined; 
    domaineFonctionnel: string | undefined; 
    refProg: string | undefined; 
    annee: string | undefined; 
    commune: string | undefined; 
    epci: string | undefined; 
    departement: string | undefined; 
    region: string | undefined; 
    champSiret: string | undefined; 
    champMontant: string | undefined; 
}

@Component({
    selector: 'financial-reconciliation-demarche.component',
    templateUrl: './reconciliation-demarche.component.html',
})
export class ReconciliationDemarcheComponent implements OnInit {

    private _destroyRef = inject(DestroyRef)
  
    public checkedId: string = "";

    public demarche: Demarche | null = null
    public donnees: Donnee[] | null = null

    public reconciliationForm = new FormGroup({
        champEJ: new FormControl(""),
        champDS: new FormControl(""),
        centreCouts: new FormControl(""),
        domaineFonctionnel: new FormControl(""),
        refProg: new FormControl(""),
        annee: new FormControl(""),
        commune: new FormControl(""),
        epci: new FormControl(""),
        departement: new FormControl(""),
        region: new FormControl(""),
        champSiret: new FormControl(""),
        champMontant: new FormControl(""),
    })
  
    constructor(
        private _route: ActivatedRoute,
        private _alertService: AlertService,
        private _compagnonDS: CompagnonDSService,
        private _router: Router,
    ) {
        this.checkedId = "reconciliation-no"
    }

    ngOnInit(): void {
        // Vérification des query params & de si la démarche est déjà présente en BDD
        combineLatest({
            params: this._route.queryParams,
            demarche: this._compagnonDS.demarche$
        })
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((results) => {
            // Paramètre 'number' obligatoire !
            if (!("number" in results.params)) {
                this._router.navigate(['/administration/demarches/integration'])
            }

            // Si pas déjà récupéré par le compagnon DS
            if (results.demarche !== null) {
                this._initWithDemarche(results.demarche)
                return
            }

            // Récupération de la démarche en BDD
            this._compagnonDS.getDemarche(results.params["number"])
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (value) => {
                    if (value !== null) {
                        this._initWithDemarche(value)
                    } else {
                        this._alertService.openAlertError("Cette démarche n'a pas été intégrée.");
                        this._router.navigate(['/administration/demarches/integration'])
                    }
                },
                error: (err: HttpErrorResponse) => {
                    if (err.error['message']) {
                        this._alertService.openAlertError(err.error['message']);
                    }
                }
            })
        })
    }

    private _initWithDemarche(demarche: Demarche) {
        this.demarche = demarche
        // Récupération des données
        this._compagnonDS.getDemarchesDonnees(demarche.number)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
            next: (results) => {
                this.donnees = results
                this._compagnonDS.setDonnees(results)
                this._setSelectedAndPatchValues(demarche)
            },
            error: (err: HttpErrorResponse) => {
                if (err.error['message']) {
                    this._alertService.openAlertError(err.error['message']);
                }
            }
        })
    }

    private _setSelectedAndPatchValues(demarche: Demarche) {
        if (demarche.reconciliation === null) {
           return
        }
        if (demarche.reconciliation.champEJ) {
            this.checkedId = "reconciliation-ej"
        } else if (demarche.reconciliation.champDS) {
            this.checkedId = "reconciliation-ds"
        } else if (demarche.reconciliation.champSiret) {
            this.checkedId = "reconciliation-criteres"
        }

        let formData = {
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
            champMontant: demarche.reconciliation.champMontant
        } as ReconciliationFormData
        // Using JSON utilities to remove unecessary undefined values
        formData = JSON.parse(JSON.stringify(formData))
        this.reconciliationForm.patchValue(formData)
    }
  
    onRadioChecked(event: Event) {
        this.checkedId = (event?.target as HTMLElement)?.id
    }

    isInputChecked(id: string) {
        return id === this.checkedId
    }
    
    saveReconciliation() {
        if (this.demarche === null) {
            this._alertService.openAlertError("Erreur : aucune démarche");
            return
        }
            
        const formData = new FormData();
        formData.append('id', this.demarche.number.toString());
        if (this.reconciliationForm.value.champEJ)
            formData.append('champEJ', this.reconciliationForm.value.champEJ);
        else if (this.reconciliationForm.value.champDS)
            formData.append('champDS', this.reconciliationForm.value.champDS);
        else if (this.reconciliationForm.value.champSiret) {
            formData.append('centreCouts', this.reconciliationForm.value.centreCouts ?? "");
            formData.append('domaineFonctionnel', this.reconciliationForm.value.domaineFonctionnel ?? "");
            formData.append('refProg', this.reconciliationForm.value.refProg ?? "");
            formData.append('annee', this.reconciliationForm.value.annee ?? "");
            formData.append('commune', this.reconciliationForm.value.commune ?? "");
            formData.append('epci', this.reconciliationForm.value.epci ?? "");
            formData.append('departement', this.reconciliationForm.value.departement ?? "");
            formData.append('region', this.reconciliationForm.value.region ?? "");
            formData.append('champSiret', this.reconciliationForm.value.champSiret);
            formData.append('champMontant', this.reconciliationForm.value.champMontant ?? "");
        }
        
        this._compagnonDS.saveReconciliation(formData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
            next: (demarche: Demarche) => {
                this._compagnonDS.setDemarche(demarche);
                this._router.navigate(['/administration/demarches/affichage'], { queryParams: {number: this.demarche?.number } });
            },
            error: (err: HttpErrorResponse) => {
                if (err.error['message']) {
                    this._alertService.openAlertError(err.error['message']);
                }
            }
        })
    }

}