/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { GeoModel, NocoDbResponse, TypeLocalisation } from 'apps/common-lib/src/public-api';
import { map, Observable, of } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SousAxePlanRelance, SousAxePlanRelanceForFilter } from '../models/axe.models';
import { Structure } from '../models/structure.models';
import { Territoire } from '../models/territoire.models';
import {
  AbstractLaureatsHttpService,
  SearchParameters,
  SearchResults
} from './abstract-laureats.http.service';
import { SourceLaureatsData } from '../models/common.model';

class UnsupportedNiveauLocalisation extends Error {
  /**
   *
   */
  constructor(niveau: string) {
    super(UnsupportedNiveauLocalisation._messageUtilisateur(niveau));
    Object.setPrototypeOf(this, UnsupportedNiveauLocalisation.prototype);
  }

  static _messageUtilisateur(niveau: string) {
    return `Impossible de rechercher au niveau ${niveau} au sein de la base France Relance. Nous n'afficherons pas les résultats France Relance.`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class FranceRelanceHttpService extends AbstractLaureatsHttpService {
  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) readonly _settings: SettingsService
  ) {
    super();
  }

  /**
   * Récupère les Axe du plan de relance
   * @returns
   */
  public getSousAxePlanRelance(): Observable<SousAxePlanRelanceForFilter[]> {
    const apiFr = this._settings.apiFranceRelance;
    const field_sous_axe = 'SousaxeDuPlanDeRelance';
    const field_axe = 'AxeDuPlanDeRelance';

    const params = `fields=${field_sous_axe},${field_axe}&limit=5000&sort=${field_axe},${field_sous_axe}`;

    const answer$ = this.http
      .get<NocoDbResponse<any>>(`${apiFr}/Dispositifs/Dispositifs?${params}`)
      .pipe(
        map(
          (response: NocoDbResponse<any>) =>
            response.list.reduce((uniqueArray, current) => {
              const itemExists = uniqueArray.find(
                (item: { label: any }) => item.label === current[field_sous_axe]
              );
              if (!itemExists) {
                uniqueArray.push({
                  label: current[field_sous_axe],
                  axe: current[field_axe]
                });
              }
              return uniqueArray;
            }, []) as SousAxePlanRelance[]
        ),
        map((axes) => {
          return axes.map((axe) => {
            const annotated = {
              ...axe,
              annotation: 'REL'
            } as SousAxePlanRelanceForFilter;
            return annotated;
          });
        })
      );
    return answer$;
  }

  /**
   * Recherche de strucutre dans la base lauréat
   * @param search
   * @returns
   */
  public searchStructure(search: string): Observable<Structure[]> {
    const apiFr = this._settings.apiFranceRelance;

    const fields = 'Structure,NuméroDeSiretSiConnu';
    const sort = 'Structure';
    const where = `where=(Structure,like,${search}%)`;
    const params = `fields=${fields}&limit=50&sort=${sort}&${where}`;

    return this.http
      .get<NocoDbResponse<Structure[]>>(`${apiFr}/Laureats/Laureats-front?${params}`)
      .pipe(
        map((response: NocoDbResponse<any>) =>
          response.list.reduce((uniqueArray, current) => {
            const itemExists = uniqueArray.find(
              (item: { label: any; siret: any }) =>
                item.label === current['Structure'] &&
                item.siret === current['NuméroDeSiretSiConnu']
            );
            if (!itemExists) {
              uniqueArray.push({
                label: current['Structure'],
                siret: current['NuméroDeSiretSiConnu']
              });
            }
            return uniqueArray;
          }, [])
        )
      );
  }

  /**
   * Lance la rechercher d'un territoire
   * @param search
   * @returns
   */
  public searchTerritoire(search: string): Observable<Territoire[]> {
    const apiFr = this._settings.apiFranceRelance;
    const fields = 'Commune,CodeInsee';
    const where = `where=(Commune,like,${search}%)`;

    const params = `fields=${fields}&limit=500&${where}&sort=Commune`;

    return this.http
      .get<
        NocoDbResponse<Territoire>
      >(`${apiFr}/LocalisationBretagne/LocalisationBretagne?${params}`)
      .pipe(map((response) => response.list));
  }

  /**
   * Lance la recherche des laureats sur la base France relance
   * @param axe
   * @returns
   */
  public searchLaureats(sp: SearchParameters): Observable<SearchResults> {
    try {
      return this._searchLaureats(sp);
    } catch (error) {
      if (error instanceof UnsupportedNiveauLocalisation) {
        return of({
          messages_utilisateur: [error.message],
          resultats: []
        } as SearchResults);
      }
      throw error;
    }
  }

  private _searchLaureats({
    axes,
    structure,
    territoires
  }: SearchParameters): Observable<SearchResults> {
    const apiFr = this._settings.apiFranceRelance;

    const fields_list = [
      'Structure',
      'NuméroDeSiretSiConnu',
      'SubventionAccordée',
      'Synthèse',
      'axe',
      'sous-axe',
      'dispositif',
      'code_region',
      'label_region',
      'code_departement',
      'label_departement',
      'code_epci',
      'label_epci',
      'code_commune',
      'label_commune',
      'code_arrondissement',
      'label_arrondissement'
    ];
    const fields = fields_list.join(',');
    const rest_params = this._buildparams(axes, structure, territoires);
    const params = `fields=${fields}&${rest_params}`;

    return this.mapNocoDbReponse(
      this.http.get<NocoDbResponse<any>>(`${apiFr}/Laureats/Laureats-front?${params}`)
    ).pipe(
      map(this._mapToSourceLaureatsData(SourceLaureatsData.RELANCE)),
      map(this._wrapInSearchresult)
    );
  }

  private _buildparams(
    axes: SousAxePlanRelance[] | null,
    structure: Structure | null,
    territoires: GeoModel[] | null
  ): string {
    let params = 'sort=Structure,axe,dispositif&limit=5000&where=(Montant,gt,0)';
    if (structure) {
      params += `~and(Structure,eq,${structure.label})`;
    }

    if (axes && axes.length > 0) {
      params += `~and(sous-axe,in,${axes.map((axe) => axe.label).join(',')})`;
    }

    if (territoires && territoires.length > 0) {
      const territoire = territoires[0];
      const territoires_supportes = {
        [TypeLocalisation.REGION]: 'code_region',
        [TypeLocalisation.DEPARTEMENT]: 'code_departement',
        [TypeLocalisation.EPCI]: 'code_epci',
        [TypeLocalisation.COMMUNE]: 'code_commune',
        [TypeLocalisation.CRTE]: null,
        [TypeLocalisation.ARRONDISSEMENT]: 'code_arrondissement',
        [TypeLocalisation.QPV]: null
      };
      if (territoires_supportes[territoire.type!] == null) {
        throw new UnsupportedNiveauLocalisation(territoire.type!);
      }

      // on est toujours sur le même type
      const codes_joined = territoires.map((t) => t.code).join(',');
      params += `~and(${territoires_supportes[territoire.type!]},in,${codes_joined})`;
    }

    return params;
  }
}
