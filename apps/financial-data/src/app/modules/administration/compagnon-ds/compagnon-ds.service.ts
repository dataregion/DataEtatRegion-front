import { Injectable, Inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { Demarche, Donnee, ValeurDonnee } from '@models/demarche_simplifie/demarche.model';
import { SettingsService } from 'apps/financial-data/src/environments/settings.service';


@Injectable({
    providedIn: 'root',
})
export class CompagnonDSService {

    private _apiDemarches: string;

    private demarche$ = new BehaviorSubject<Demarche | null>(null);
    public demarche: Observable<Demarche | null> = this.demarche$.asObservable();
    public setDemarche(demarche: Demarche | null) {
        this.demarche$.next(demarche)
    }

    private donnees$ = new BehaviorSubject<Donnee[] | null>(null);
    public donnees: Observable<Donnee[] | null> = this.donnees$.asObservable();
    public setDonnees(donnees: Donnee[] | null) {
        this.donnees$.next(donnees)
    }

    constructor(
        private _http: HttpClient,
        @Inject(SETTINGS) readonly settings: SettingsService //eslint-disable-line
    ) {
        this._apiDemarches = settings.apiDemarches;
    }


    public getDemarche(id: number): Observable<Demarche> {
        return this._http.get(`${this._apiDemarches}/demarche`, {
            "params": {
                "id": id.toString()
            }
        }).pipe(
            map(demarche => {
                return demarche as Demarche
            })
        )
    }
  
    public saveDemarche(id: number): Observable<any> {
        const formData = new FormData();
        formData.append('id', id.toString());
        return this._http.post(`${this._apiDemarches}/demarche`, formData);
    }
  
    public saveReconciliation(formData: FormData): Observable<any> {
        return this._http.post(`${this._apiDemarches}/reconciliation`, formData);
    }
  
    public saveAffichage(formData: FormData): Observable<any> {
        return this._http.post(`${this._apiDemarches}/affichage`, formData);
    }
  
    public getDemarchesDonnees(id: number): Observable<Donnee[] | null> {
        return this._http.get(`${this._apiDemarches}/donnees`, {
            "params": {
                "id": id.toString()
            }
        }).pipe(
            map(results => {
                return results as Donnee[]
            })
        )
    }

    public getValeurDonneeOfAccepted(numeroDemarche: number, matchingData: string[]): Observable<ValeurDonnee[] | null> {

        return this._http.get(`${this._apiDemarches}/valeurs`, {
            "params": {
                "idDemarche": numeroDemarche.toString(),
                "idDonnees": matchingData.join(","),
                "statutDossier": "accepte"
            }
        }).pipe(
            map(results => {
                return results as ValeurDonnee[]
            })
        )
    }

}
