import { Inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import {
  AffichageDossier,
  Demarche,
  Donnee,
  Reconciliation,
  ValeurDonnee,
} from '@models/demarche_simplifie/demarche.model';
import { SettingsService } from 'apps/financial-data/src/environments/settings.service';

@Injectable({
  providedIn: 'root',
})
export class CompagnonDSService {
  private _apiDemarches: string;

  private _demarche = new BehaviorSubject<Demarche | null>(null);
  public demarche$: Observable<Demarche | null> = this._demarche.asObservable();

  public setDemarche(demarche: Demarche | null) {
    this._demarche.next(demarche);
  }

  private _donnees = new BehaviorSubject<Donnee[] | null>(null);
  public donnees$: Observable<Donnee[] | null> = this._donnees.asObservable();

  public setDonnees(donnees: Donnee[] | null) {
    this._donnees.next(donnees);
  }

  constructor(
    private _http: HttpClient,
    @Inject(SETTINGS) readonly settings: SettingsService, //eslint-disable-line
  ) {
    this._apiDemarches = settings.apiDemarches;
  }

  public getDemarche(id: number): Observable<Demarche> {
    return this._http
      .get(`${this._apiDemarches}/demarche`, {
        params: {
          id: id.toString(),
        },
      })
      .pipe(
        map((demarche) => {
          return demarche as Demarche;
        }),
      );
  }

  public saveDemarche(id: number): Observable<any> {
    const formData = new FormData();
    formData.append('id', id.toString());
    return this._http.post(`${this._apiDemarches}/demarche`, formData);
  }

  public getReconciliations(id: number): Observable<Reconciliation[] | Error> {
    return this._http
      .get(`${this._apiDemarches}/reconciliation`, {
        params: {
          id: id.toString(),
        },
      })
      .pipe(
        map((results) => {
          return results as Reconciliation[];
        }),
      );
  }

  public saveReconciliation(formData: FormData): Observable<any> {
    return this._http.post(`${this._apiDemarches}/reconciliation`, formData);
  }

  public getAffichage(financialAeId: number): Observable<AffichageDossier> {
    return this._http
      .get(`${this._apiDemarches}/affichage`, {
        params: {
          financialAeId: financialAeId.toString(),
        },
      })
      .pipe(
        map((result) => {
          return result as AffichageDossier;
        }),
      );
  }

  public saveAffichage(formData: FormData): Observable<any> {
    return this._http.post(`${this._apiDemarches}/affichage`, formData);
  }

  public getDemarchesDonnees(id: number): Observable<Donnee[] | null> {
    return this._http
      .get(`${this._apiDemarches}/donnees`, {
        params: {
          id: id.toString(),
        },
      })
      .pipe(
        map((results) => {
          return results as Donnee[];
        }),
      );
  }

  public getValeurDonneeOfAccepted(
    numeroDemarche: number,
    matchingData: string[],
  ): Observable<ValeurDonnee[] | null> {
    return this._http
      .get(`${this._apiDemarches}/valeurs`, {
        params: {
          idDemarche: numeroDemarche.toString(),
          idDonnees: matchingData.join(','),
          statutDossier: 'accepte',
        },
      })
      .pipe(
        map((results) => {
          return results as ValeurDonnee[];
        }),
      );
  }
}
