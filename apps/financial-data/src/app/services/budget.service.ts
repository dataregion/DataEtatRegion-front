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
import { Tag, tag_fullname } from '@models/refs/tag.model';
import { ReferentielProgrammation } from '@models/refs/referentiel_programmation.model';

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
        return response.flatMap(data => [...data])
      })
    );
  }

  public filterRefSiret$(nomOuSiret: string): Observable<RefSiret[]> {

    const req$ = forkJoin(
      {
        byCode: this._filterByCode(nomOuSiret),
        byDenomination: this._filterByDenomination(nomOuSiret),
      }
    )
    .pipe(
      map((full) => [...full.byCode, ...full.byDenomination]),
    );

    return req$
  }

  private _filterByCode(nomOuSiret: string): Observable<RefSiret[]> {
    return this._filter_by("query", nomOuSiret)
  }

  private _filterByDenomination(nomOuSiret: string): Observable<RefSiret[]> {
    return this._filter_by("denomination", nomOuSiret)
  }
  
  private _filter_by(nomChamp: string, term: string) {
    const encodedNomOuSiret = encodeURIComponent(term);
    const params = `limit=10&${nomChamp}=${encodedNomOuSiret}`;
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

  public getReferentielsProgrammation(query: string | null): Observable<ReferentielProgrammation[]> {
    let params = 'limit=500';
    if (query)
      params += '&code=' + query
    return this.http
      .get<DataPagination<ReferentielProgrammation>>(`${this._apiRef}/ref-programmation?${params}`)
      .pipe(
        map((response) => {
          return response.items
        })
      );
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
        item.commune.label_crte ?? '',
        item.commune.label_epci ?? '',
        item.commune.arrondissement?.label ?? '',
        item.commune.label_departement ?? '',
        item.commune.label_region ?? '',
        item.localisation_interministerielle?.code ?? '',
        item.localisation_interministerielle?.label ?? '',
        item.compte_budgetaire ?? '',
        item.contrat_etat_region && item.contrat_etat_region !== '#' ? item.contrat_etat_region : '',
        item.groupe_marchandise?.code ?? '',
        item.groupe_marchandise?.label ?? '',
        item.siret.code,
        item.siret.nom_beneficiare ?? '',
        item.siret.categorie_juridique ?? '',
        item.siret.code_qpv ?? '',
        item.date_cp,
        item.date_replication,
        item.annee,
        item.tags?.map(tag => tag_fullname(tag)).join(" "),
      ];
      data.push(values);
    }

    const csv = unparse({
      fields,
      data
    });
    return new Blob(csv.split('\n'), { type: 'text/csv;charset=utf-8;' });
  }

  public getById(source: SourceFinancialData, id: number): Observable<FinancialDataModel> {
    const service = this._services.find(s => s.getSource() === source);
    if (service === undefined) return of()

    return service.getById(id).pipe(
      map(data => service.mapToGeneric(data))
    );
  }
}
