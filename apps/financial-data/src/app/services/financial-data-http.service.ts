import { Injectable, Inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BopModel } from '@models/bop.models';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SettingsService } from '../../environments/settings.service';
import { RefTheme } from '@models/theme.models';
import { FinancialDataModel } from '@models/financial-data.models';
import { RefSiret } from '@models/RefSiret';
import {
  GeoModel,
  NocodbHttpService,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { NocoDbResponse } from 'apps/common-lib/src/lib/models/nocodb-response';
import { DataType } from '@models/audit/audit-update-data.models';

@Injectable({
  providedIn: 'root',
})
export class FinancialDataHttpService extends NocodbHttpService {
  private _apiFinancial!: string;
  private _apiTheme!: string;
  private _apiSiret!: string;
  private _apiProgramme!: string;

  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) readonly settings: SettingsService
  ) {
    super();
    const project = this.settings.projectFinancial;
    let base_uri = this.settings.nocodbProxy?.base_uri;
    if (project && base_uri) {
      base_uri += project.table + '/';
      this._apiFinancial = base_uri + project.views.financial;
      this._apiProgramme = base_uri + project.views.programmes;
      this._apiTheme = base_uri + project.views.themes;
      this._apiSiret = base_uri + project.views.siret;
    }
  }

  public getBop(): Observable<BopModel[]> {
    const params = 'limit=500&fields=Id,Label,Code,RefTheme&sort=Code';
    return this.http
      .get<NocoDbResponse<BopModel>>(`${this._apiProgramme}?${params}`)
      .pipe(map((response) => response.list));
  }

  /**
   * Récupère les themes de Chorus
   * @returns les the
   */
  public getTheme(): Observable<RefTheme[]> {
    return this.http
      .get<NocoDbResponse<RefTheme>>(
        `${this._apiTheme}?fields=Id,Label&sort=Label&limit=500`
      )
      .pipe(map((response) => response.list));
  }

  public filterRefSiret(nomOuSiret: string): Observable<RefSiret[]> {
    let whereClause = this._filterRefSiretWhereClause(nomOuSiret);

    return this.http
      .get<NocoDbResponse<RefSiret>>(
        `${this._apiSiret}?fields=Code,Denomination&sort=Code&${whereClause}`
      )
      .pipe(map((response) => response.list));
  }

  private _filterRefSiretWhereClause(nomOuSiret: string): string {
    let is_number = /^\d+$/.test(nomOuSiret);

    if (is_number) return `where=(Code,like,${nomOuSiret}%)`;
    else return `where=(Denomination,like,${nomOuSiret})`;
  }

  public get(
    ej: string,
    poste_ej: string | number
  ): Observable<FinancialDataModel | undefined> {
    let params = `&limit=1&where=(NEj,eq,${ej})~and(NPosteEj,eq,${poste_ej})`;

    let answer$ = this.mapNocoDbReponse(
      this.http.get<NocoDbResponse<FinancialDataModel>>(
        `${this._apiFinancial}?${params}`
      )
    ).pipe(map((lignes) => lignes[0]));

    return answer$;
  }

  /**
   *
   * @param beneficiaire
   * @param bops
   * @param theme
   * @param year
   * @param location
   * @returns
   */
  public search(
    beneficiaire: RefSiret | null,
    bops: BopModel[] | null,
    themes: RefTheme[] | null,
    year: number[] | null,
    location: GeoModel[] | null
  ): Observable<FinancialDataModel[]> {
    if (
      bops == null &&
      themes == null &&
      year == null &&
      location == null &&
      beneficiaire == null
    )
      return of();

    const params = this._buildparams(
      beneficiaire,
      bops,
      themes,
      year,
      location
    );
    return this.mapNocoDbReponse(
      this.http.get<NocoDbResponse<FinancialDataModel>>(
        `${this._apiFinancial}?${params}`
      )
    );
  }

  public getCsv(
    beneficiaire: RefSiret | null,
    bops: BopModel[] | null,
    themes: RefTheme[] | null,
    year: number[] | null,
    location: GeoModel[] | null
  ): Observable<Blob> {
    if (
      bops == null &&
      themes == null &&
      year == null &&
      location == null &&
      beneficiaire == null
    )
      return of();

    const params = this._buildparams(
      beneficiaire,
      bops,
      themes,
      year,
      location
    );
    return this.http.get(`${this._apiFinancial}/csv?${params}`, {
      responseType: 'blob',
    });
  }

  private _buildparams(
    beneficiaire: RefSiret | null,
    bops: BopModel[] | null,
    themes: RefTheme[] | null,
    year: number[] | null,
    location: GeoModel[] | null
  ): string {
    let params =
      'sort=code_programme,label_commune&limit=5000&where=(Montant,gt,0)';
    if (beneficiaire) {
      params += `~and(code_siret,eq,${beneficiaire.Code})`;
    }
    if (bops) {
      params += `~and(code_programme,in,${bops
        .filter((bop) => bop.Code)
        .map((bop) => bop.Code)
        .join(',')})`;
    } else if (themes) {
      params += `~and(Theme,in,${themes
        .map((theme) => theme.Label)
        .join(',')})`;
    }

    if (location && location.length > 0) {
      // on est toujours sur le même type

      const listCode = location.map((l) => l.code).join(',');
      switch (location[0].type) {
        case TypeLocalisation.DEPARTEMENT:
          params += `~and(code_departement,in,${listCode})`;
          break;
        case TypeLocalisation.COMMUNE:
          params += `~and(commune,in,${listCode})`;
          break;
        case TypeLocalisation.EPCI:
          params += `~and(code_epci,in,${listCode})`;
          break;
        case TypeLocalisation.CRTE:
          params += `~and(code_crte,in,${listCode})`;
          break;
        case TypeLocalisation.ARRONDISSEMENT:
          params += `~and(code_arrondissement,in,${listCode})`;
          break;
      }
    }

    if (year && year.length > 0) {
      params += `~and(`;
      year.forEach((value) => {
        params += `~or(Annee,eq,${value})`;
      });
      params += `)`;
    }
    return params;
  }

  public loadFinancialFile(
    file: any,
    annee: string,
    type: DataType,
    code_region = '53'
  ): Observable<any> {
    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('annee', annee);
    formData.append('code_region', code_region);

    const apiData = this.settings.apiFinancialData;

    if (type === DataType.FINANCIAL_DATA_AE) {
      return this.http.post(`${apiData}/ae`, formData);
    } else if (type === DataType.FINANCIAL_DATA_CP) {
      return this.http.post(`${apiData}/cp`, formData);
    }
    return of();
  }
}
