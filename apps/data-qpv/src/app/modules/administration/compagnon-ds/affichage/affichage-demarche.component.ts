import { HttpErrorResponse } from "@angular/common/http";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AlertService } from "apps/common-lib/src/public-api";
import { CompagnonDSService } from "../compagnon-ds.service";
import { Demarche, Donnee, ValeurDonnee, Cadre } from "@models/demarche_simplifie/demarche.model";
import { SearchParameters, SearchParameters_empty } from "@services/interface-data.service";
import { FinancialDataModel } from "@models/financial/financial-data.models";
import { BudgetService } from "@services/budget.service";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";

interface AffichageFormData {
    nomProjet: string | undefined;
    descriptionProjet: string | undefined;
    categorieProjet: string | undefined;
    coutProjet: string | undefined;
    montantDemande: string | undefined;
    montantAccorde: string | undefined;
    dateFinProjet: string | undefined;
    contact: string | undefined;
}

@Component({
    selector: 'financial-afficher-demarche.component',
    templateUrl: './affichage-demarche.component.html',
})
export class AffichageDemarcheComponent implements OnInit {

    private _destroyRef = inject(DestroyRef)

    public demarche: Demarche | null = null
    public donnees: Donnee[] | null = null

    public checkedId: string = "";

    public requestsDone: boolean = false
    public matchingLines: number = 0
    public nbDossiers: number = 0

    public affichageForm = new FormGroup({
        nomProjet: new FormControl(""),
        descriptionProjet: new FormControl(""),
        categorieProjet: new FormControl(""),
        coutProjet: new FormControl(""),
        montantDemande: new FormControl(""),
        montantAccorde: new FormControl(""),
        dateFinProjet: new FormControl(""),
        contact: new FormControl(""),
    })

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _alertService: AlertService,
        private _compagnonDS: CompagnonDSService,
        private _budgetService: BudgetService,
    ) {
    }

    private _patchValues(demarche: Demarche) {
        if (demarche.affichage === null) {
            return
        }
        let formData = {
            nomProjet: demarche.affichage.nomProjet,
            descriptionProjet: demarche.affichage.descriptionProjet,
            categorieProjet: demarche.affichage.categorieProjet,
            coutProjet: demarche.affichage.coutProjet,
            montantDemande: demarche.affichage.montantDemande,
            montantAccorde: demarche.affichage.montantAccorde,
            dateFinProjet: demarche.affichage.dateFinProjet,
            contact: demarche.affichage.contact
        } as AffichageFormData
        // Using JSON utilities to remove unecessary undefined values
        formData = JSON.parse(JSON.stringify(formData))
        this.affichageForm.patchValue(formData)
    }

    private _initWithDemarche(demarche: Demarche) {
        this.demarche = demarche;
        // Récupération des données
        this._compagnonDS.donnees$
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((value) => {
            if (value !== null) {
                this.donnees = value
                this._patchValues(demarche)
            }
        })

        if (demarche.reconciliation === null) {
            return
        }

        const reconciliation: Cadre = demarche.reconciliation

        const matchingData: string[] = []
        if (demarche.reconciliation.champEJ) {
            matchingData.push(demarche.reconciliation.champEJ)
        }
        if (demarche.reconciliation.champDS) {
            matchingData.push(demarche.reconciliation.champDS)
        }
        if (demarche.reconciliation.champSiret) {
            matchingData.push(demarche.reconciliation.champSiret)
            if (demarche.reconciliation.champMontant) {
                matchingData.push(demarche.reconciliation.champMontant)
            }
        }

        // Récupération des valeurs des données des dossiers acceptés
        this._compagnonDS.getValeurDonneeOfAccepted(demarche.number, matchingData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
            next: (valeurs: ValeurDonnee[] | null) => {
                if (valeurs) {
                    this.nbDossiers = valeurs.length
                    const search_parameters: SearchParameters = {
                        ...SearchParameters_empty,
                        source: "FINANCIAL_DATA_AE"
                    } as const
                    if (reconciliation.champEJ) {
                        const idDonnee: number = parseInt(reconciliation.champEJ)
                        search_parameters.n_ej = valeurs.filter(v => v.donnee_id === idDonnee && v.valeur !== "").map(v => v.valeur)
                    }
                    if (reconciliation.champDS) {
                        const idDonnee: number = parseInt(reconciliation.champDS)
                        search_parameters.n_ds = valeurs.filter(v => v.donnee_id === idDonnee && v.valeur !== "").map(v => v.valeur)
                    }
                    if (reconciliation.champSiret) {
                        const idSiret: number = parseInt(reconciliation.champSiret)
                        search_parameters.siret = valeurs.filter(v => v.donnee_id === idSiret && v.valeur !== "").map(v => v.valeur)
                        if (reconciliation.champMontant) {
                            const idMontant: number = parseInt(reconciliation.champMontant)
                            search_parameters.montant = valeurs.filter(v => v.donnee_id === idMontant && v.valeur !== "").map(v => parseFloat(v.valeur))
                        }
                    }

                    this._budgetService.search(search_parameters)
                    .subscribe({
                        next: (response: FinancialDataModel[] | Error) => {
                            if (response instanceof Error) {
                                this._alertService.openAlertError(response.message);
                                return
                            }
                            this.matchingLines = response.length
                            this.requestsDone = true
                        },
                        error: (err: Error) => {
                            this._alertService.openAlertError(err.message);
                            this.requestsDone = true
                        },

                    });
                }
            },
            error: (err: HttpErrorResponse) => {
                if (err.error['message']) {
                    this._alertService.openAlertError(err.error['message']);
                }
            }
        })
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



    saveAffichage() {
        if (this.demarche === null) {
            this._alertService.openAlertError("Erreur : aucune démarche");
            return
        }
        const formData = new FormData();
        formData.append('id', this.demarche.number.toString());
        formData.append('nomProjet', this.affichageForm.value.nomProjet ?? "");
        formData.append('descriptionProjet', this.affichageForm.value.descriptionProjet ?? "");
        formData.append('categorieProjet', this.affichageForm.value.categorieProjet ?? "");
        formData.append('coutProjet', this.affichageForm.value.coutProjet ?? "");
        formData.append('montantDemande', this.affichageForm.value.montantDemande ?? "");
        formData.append('montantAccorde', this.affichageForm.value.montantAccorde ?? "");
        formData.append('dateFinProjet', this.affichageForm.value.dateFinProjet ?? "");
        formData.append('contact', this.affichageForm.value.contact ?? "");

        this._compagnonDS.saveAffichage(formData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
            next: (demarche: Demarche) => {
                this._compagnonDS.setDemarche(demarche);
                this._alertService.openAlertSuccess("La démarche a correctement été réconciliée avec " + this.matchingLines.toString() + " lignes financières.")
                this._router.navigate(['/'])
            },
            error: (err: HttpErrorResponse) => {
                if (err.error['message']) {
                    this._alertService.openAlertError(err.error['message']);
                }
            }
        })
    }

  }
