import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { CentreCouts, CentreCoutsService, CodeProgramme, ProgrammesService, QpvService } from 'apps/clients/v3/referentiels';
import { V3QueryParamsService } from './query-params.service';
import { V3QueryParams } from '../models/query-params.model';



@Injectable({ providedIn: 'root' })
export class ReferentielsService {

  private _queryParamsService = inject(V3QueryParamsService);
  private _centreCoutsService = inject(CentreCoutsService);
  private _programmesService = inject(ProgrammesService);
  private _qpvsService = inject(QpvService);

  private modelFields<T>() {
    return <K extends keyof T>(...keys: K[]) => keys.map(k => k as string);
  }

  /* ================================================= */
  /* Programmes                                        */
  /* ================================================= */
  public getProgrammes(): Observable<CodeProgramme[]>;
  public getProgrammes(query: string): Observable<CodeProgramme[]>;
  public getProgrammes(params: V3QueryParams): Observable<CodeProgramme[]>;
  public getProgrammes(query: string, params: V3QueryParams): Observable<CodeProgramme[]>;
  
  public getProgrammes(
    arg1?: string | V3QueryParams,
    arg2?: V3QueryParams
  ): Observable<CodeProgramme[]> {
    let query: string | undefined;
    let params: V3QueryParams | undefined;
    if (typeof arg1 === 'string') {
      query = arg1;
      params = arg2 ?? this._queryParamsService.getEmpty();
    } else {
      query = undefined;
      params = arg1 ?? this._queryParamsService.getEmpty();
    }
    if (query) {
      params.search = query;
      params.fields_search = this.modelFields<CodeProgramme>()('code', 'label');
    }
    const sanitized = this._queryParamsService.getSanitizedParams(params)
    return this._programmesService.listAllProgrammesGet(...sanitized, 'body')
      .pipe(
        map(response => {
          return response != null ? response.data as CodeProgramme[] : []
        })
      );
  }

  /* ================================================= */
  /* QPV                                               */
  /* ================================================= */
  public getQpvs(): Observable<CodeProgramme[]>;
  public getQpvs(params: V3QueryParams): Observable<CodeProgramme[]>;
  public getQpvs(decoupage: number): Observable<CodeProgramme[]>;
  public getQpvs(decoupage: number, params: V3QueryParams): Observable<CodeProgramme[]>;

  public getQpvs(
    arg1?: number | V3QueryParams,
    arg2?: V3QueryParams
  ): Observable<CodeProgramme[]> {
    let decoupage: number | undefined;
    let params: V3QueryParams;
    if (typeof arg1 === 'number') {
      decoupage = arg1;
      params = arg2 ?? this._queryParamsService.getEmpty();
    } else {
      decoupage = undefined;
      params = arg1 ?? this._queryParamsService.getEmpty();
    }

    const sanitized = this._queryParamsService.getSanitizedParams(params);
    const request$ = decoupage != null
      ? this._qpvsService.findAllByAnneeDecoupageQpvDecoupageAnneeGet(decoupage.toString(), ...sanitized, 'body')
      : this._qpvsService.listAllQpvGet(...sanitized, 'body');

    return request$.pipe(
      map(response => response?.data as CodeProgramme[] ?? [])
    );
  }

  /* ================================================= */
  /* Centre de coûts                                   */
  /* ================================================= */
  public getCentreCouts(): Observable<CentreCouts[]>;
  public getCentreCouts(query: string): Observable<CentreCouts[]>;
  public getCentreCouts(params: V3QueryParams): Observable<CentreCouts[]>;
  public getCentreCouts(query: string, params: V3QueryParams): Observable<CentreCouts[]>;
  
  public getCentreCouts(
    arg1?: string | V3QueryParams,
    arg2?: V3QueryParams
  ): Observable<CentreCouts[]> {
    let query: string | undefined;
    let params: V3QueryParams | undefined;
    if (typeof arg1 === 'string') {
      query = arg1;
      params = arg2 ?? this._queryParamsService.getEmpty();
    } else {
      query = undefined;
      params = arg1 ?? this._queryParamsService.getEmpty();
    }
    if (query) {
      params.search = query;
      params.fields_search = this.modelFields<CentreCouts>()('code', 'description');
    }
    const sanitized = this._queryParamsService.getSanitizedParams(params)
    return this._centreCoutsService.listAllCentreCoutsGet(...sanitized, 'body')
      .pipe(
        map(response => {
          return response != null ? response.data as CentreCouts[] : []
        })
      );
  }

}
