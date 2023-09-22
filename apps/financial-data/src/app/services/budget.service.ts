import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  FinancialDataModel, HEADERS_CSV_FINANCIAL,
} from '@models/financial/financial-data.models';
import { DataHttpService, SearchParameters } from 'apps/common-lib/src/public-api';
import { RefSiret } from '@models/refs/RefSiret';
import { BopModel } from '@models/refs/bop.models';
import { Observable, forkJoin, map, of } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { HttpClient } from '@angular/common/http';
import { DataPagination } from 'apps/common-lib/src/lib/models/pagination/pagination.models';
import { SourceFinancialData } from '@models/financial/common.models';
import { unparse } from 'papaparse';
import { Tag, tag_str } from '@models/refs/tag.model';
import { CdkPortal } from '@angular/cdk/portal';

export const DATA_HTTP_SERVICE = new InjectionToken<DataHttpService<any, FinancialDataModel>>(
  'DataHttpService'
);

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private _apiRef!: string;


  constructor(
    private http: HttpClient,
    @Inject(DATA_HTTP_SERVICE) private _services: DataHttpService<any, FinancialDataModel>[],
    @Inject(SETTINGS) readonly settings: SettingsService
  ) {
    this._apiRef = this.settings.apiReferentiel;
  }

  public search(search_params: SearchParameters): Observable<FinancialDataModel[]> {
    const search$: Observable<FinancialDataModel[]>[] = this._services.map(service =>
      service.search(search_params).pipe(
        map((resultPagination: DataPagination<any> | null) => {
          if (resultPagination === null || resultPagination.pageInfo === undefined) return [];
          if (resultPagination.pageInfo.totalRows > resultPagination.pageInfo.pageSize) {
            throw new Error(`La limite de lignes de résultat est atteinte. Veuillez affiner vos filtres afin d'obtenir un résultat complet.`);
          }
          return resultPagination.items;
        }),
        map(items => items.map(data => service.mapToGeneric(data)))
      )
    );


    return forkJoin(search$).pipe(
      map((response) => {
        console.log(response)
        return response.flatMap(data => [...data])
      })
    );
  }

  public filterRefSiret$(nomOuSiret: string): Observable<RefSiret[]> {

    const encodedNomOuSiret = encodeURIComponent(nomOuSiret);
    const params = `limit=10&query=${encodedNomOuSiret}`;
    const url = `${this._apiRef}/beneficiaire?${params}`;
    return this.http
      .get<DataPagination<RefSiret>>(url)
      .pipe(
        map(
          (response) => {
            if (response == null) // XXX: no content
              return [];
            return response.items;
          }
        )
      );
  }

  public allTags$(): Observable<Tag[]> {
    const url = `${this._apiRef}/tags`;

    return this.http
      .get<Tag[]>(url)
      .pipe(
        map(
          (response) => {
            if (response == null)
              return [];
            return response;
          }
        )
      )
  }

  public getRefSiretFromCode$(code: string): Observable<RefSiret> {

    const url = `${this._apiRef}/beneficiaire/${code}`;
    return this.http
      .get<RefSiret>(url)
      .pipe(
        map(response => {
          return response as RefSiret
        })
      );
  }

  public getBop(): Observable<BopModel[]> {
    const params = 'limit=500';
    return this.http
      .get<DataPagination<BopModel>>(`${this._apiRef}/programme?${params}`)
      .pipe(map((response) => response.items));
  }


  public getCsv(financialData: FinancialDataModel[]): Blob {

    const fields = HEADERS_CSV_FINANCIAL;
    const data = [];

    for (const item of financialData) {

      const values = [
        item.source,
        item.n_ej,
        item.n_poste_ej,
        item.montant_ae,
        item.montant_cp,
        item.programme.theme ?? '',
        item.programme.code ?? '',
        item.programme.label ?? '',
        item.domaine_fonctionnel?.code ?? '',
        item.domaine_fonctionnel?.label ?? '',
        item.referentiel_programmation.label ?? '',
        item.commune.label ?? '',
        item.siret.code,
        item.siret.nom_beneficiare ?? '',
        item.siret.categorie_juridique ?? '',
        item.siret.code_qpv ?? '',
        item.date_cp,
        item.annee,
        item.tags?.map(tag => tag_str(tag)).join("|"),
      ];
      data.push(values);
    }

    const csv = "sep=,\n" + unparse({
      fields,
      data
    });
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  public getById(source: SourceFinancialData, id: number): Observable<FinancialDataModel> {
    const service = this._services.find(s => s.getSource() === source);
    if (service === undefined) return of()

    return service.getById(id).pipe(
      map(data => service.mapToGeneric(data))
    );
  }
}
