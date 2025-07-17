import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { SettingsService } from 'apps/financial-data/src/environments/settings.service';
import { AffichageDossier, Demarche, DemarcheLight, Donnee, Reconciliation, Token, ValeurDonnee } from '../../models/demarche_simplifie/demarche.model';

@Injectable({
  providedIn: 'root'
})
export class CompagnonDSService {
  private _http = inject(HttpClient);
  readonly settings = inject<SettingsService>(SETTINGS);

  private _apiExternes: string;
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

  constructor() {
    const settings = this.settings;

    this._apiExternes = settings.apiExternes;
    this._apiDemarches = settings.apiDemarches;
  }

  public getDemarcheLigthFromApiExterne(
    tokenId: number,
    demarcheNumber: number
  ): Observable<{
    demarche: DemarcheLight;
  }> {
    const demarche = `
      query getDemarche($demarcheNumber: Int!) {
        demarche(number: $demarcheNumber) {
          title
          id
        }
      }
    `;

    return this._http
      .post(
        `${this._apiExternes}/demarche-simplifie`,
        {
          operationName: 'getDemarche',
          query: demarche,
          variables: {
            demarcheNumber: demarcheNumber
          }
        },
        {
          params: {
            tokenId: tokenId
          }
        }
      )
      .pipe(
        map((results) => {
          return results as { demarche: DemarcheLight };
        })
      );
  }

  public getDemarche(id: number): Observable<Demarche> {
    return this._http
      .get(`${this._apiDemarches}/demarche`, {
        params: {
          id: id.toString()
        }
      })
      .pipe(
        map((demarche) => {
          return demarche as Demarche;
        })
      );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public saveDemarche(tokenId: number, id: number): Observable<any> {
    const formData = new FormData();
    formData.append('tokenId', tokenId.toString());
    formData.append('id', id.toString());
    return this._http.post(`${this._apiDemarches}/demarche`, formData);
  }

  public getReconciliations(id: number): Observable<Reconciliation[] | Error> {
    return this._http
      .get(`${this._apiDemarches}/reconciliation`, {
        params: {
          id: id.toString()
        }
      })
      .pipe(
        map((results) => {
          return results as Reconciliation[];
        })
      );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public saveReconciliation(formData: FormData): Observable<any> {
    return this._http.post(`${this._apiDemarches}/reconciliation`, formData);
  }

  public getAffichage(financialAeId: number): Observable<AffichageDossier> {
    return this._http
      .get(`${this._apiDemarches}/affichage`, {
        params: {
          financialAeId: financialAeId.toString()
        }
      })
      .pipe(
        map((result) => {
          return result as AffichageDossier;
        })
      );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public saveAffichage(formData: FormData): Observable<any> {
    return this._http.post(`${this._apiDemarches}/affichage`, formData);
  }

  public getDemarchesDonnees(id: number): Observable<Donnee[] | null> {
    return this._http
      .get(`${this._apiDemarches}/donnees`, {
        params: {
          id: id.toString()
        }
      })
      .pipe(
        map((results) => {
          return results as Donnee[];
        })
      );
  }

  public getValeurDonneeOfAccepted(
    numeroDemarche: number,
    matchingData: string[]
  ): Observable<ValeurDonnee[] | null> {
    return this._http
      .get(`${this._apiDemarches}/valeurs`, {
        params: {
          idDemarche: numeroDemarche.toString(),
          idDonnees: matchingData.join(','),
          statutDossier: 'accepte'
        }
      })
      .pipe(
        map((results) => {
          return results as ValeurDonnee[];
        })
      );
  }

  public getTokens(): Observable<Token[]> {
    return this._http.get(`${this._apiDemarches}/token`).pipe(
      map((results) => {
        return results as Token[];
      })
    );
  }

  public createToken(token: Token): Observable<Token> {
    const formData = new FormData();
    formData.append('nom', token.nom);
    formData.append('token', token.token);
    return this._http.post(`${this._apiDemarches}/token`, formData).pipe(
      map((results) => {
        return results as Token;
      })
    );
  }

  public updateToken(token: Token): Observable<Token> {
    const formData = new FormData();
    formData.append('id', token.id!.toString());
    formData.append('nom', token.nom);
    formData.append('token', token.token);
    return this._http.put(`${this._apiDemarches}/token`, formData).pipe(
      map((results) => {
        return results as Token;
      })
    );
  }

  public deleteToken(id: number): Observable<Token> {
    return this._http
      .delete(`${this._apiDemarches}/token`, {
        params: {
          id: id
        }
      })
      .pipe(
        map((results) => {
          return results as Token;
        })
      );
  }
}
