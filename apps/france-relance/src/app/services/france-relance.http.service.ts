import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import {
  GeoModel,
  NocoDbResponse,
  TypeLocalisation,
} from 'apps/common-lib/src/public-api';
import { map, Observable, of } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SousAxePlanRelance, SousAxePlanRelanceForFilter } from '../models/axe.models';
import { Structure } from '../models/structure.models';
import { Territoire } from '../models/territoire.models';
import { AbstractLaureatsHttpService, SearchParameters, SearchResults } from './abstract-laureats.http.service';
import { SourceLaureatsData } from '../models/common.model';

class UnsupportedNiveauLocalisation extends Error {
  /**
   *
   */
  constructor(niveau: string) {
    super(UnsupportedNiveauLocalisation._message_utilisateur(niveau))
    Object.setPrototypeOf(this, UnsupportedNiveauLocalisation.prototype);
  }

  static _message_utilisateur(niveau: string) {
    return `Impossible de rechercher au niveau ${niveau} au sein de la base France Relance. Nous n'afficherons pas les résultats France Relance.`
  }
}

@Injectable({
  providedIn: 'root',
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
        map((response: NocoDbResponse<any>) =>
          response.list.reduce((uniqueArray, current) => {
            const itemExists = uniqueArray.find(
              (item: { label: any }) => item.label === current[field_sous_axe]
            );
            if (!itemExists) {
              uniqueArray.push({
                label: current[field_sous_axe],
                axe: current[field_axe],
              });
            }
            return uniqueArray;
          }, []) as SousAxePlanRelance[]
        ),
        map(axes => {
          return axes.map(axe => {
            const annotated = {
              ...axe,
              annotation: "REL",
            } as SousAxePlanRelanceForFilter
            return annotated;
          })
        }
        )
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
      .get<NocoDbResponse<Structure[]>>(
        `${apiFr}/Laureats/Laureats-front?${params}`
      )
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
                siret: current['NuméroDeSiretSiConnu'],
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
      .get<NocoDbResponse<Territoire>>(
        `${apiFr}/LocalisationBretagne/LocalisationBretagne?${params}`
      )
      .pipe(map((response) => response.list));
  }

  /**
   * Lance la recherche des laureats sur la base France relance
   * @param axe
   * @returns
   */
  public searchLaureats(
    sp: SearchParameters
  ): Observable<SearchResults> {
    try {
      return this._searchLaureats(sp);
    } catch (error) {
      if (error instanceof UnsupportedNiveauLocalisation) {
        return of({
          messages_utilisateur: [error.message],
          resultats: [],
        } as SearchResults)
      }
      throw error;
    }
  }

  private _searchLaureats(
    { axes, structure, territoires }: SearchParameters
  ): Observable<SearchResults> {
    const apiFr = this._settings.apiFranceRelance;

    const fields =
      'Structure,NuméroDeSiretSiConnu,SubventionAccordée,Synthèse,axe,sous-axe,dispositif,territoire,territoire_insee,code_insee';
    const rest_params = this._buildparams(axes, structure, territoires)
    const params = `fields=${fields}&${rest_params}`;

    return this.mapNocoDbReponse(
      this.http.get<NocoDbResponse<any>>(
        `${apiFr}/Laureats/Laureats-front?${params}`
      )
    ).pipe(
      map(this._mapToSourceLaureatsData(SourceLaureatsData.RELANCE)),
      map(this._wrap_in_searchresult)
    );
  }


  // TODO: here, repair csv - lorsqu'on migrera 
  public getCsv(
    _1: SousAxePlanRelance[],
    _2: Structure,
    _3: Territoire[]
  ): Observable<Blob> {
    throw new Error("Method not implemented.");
  }

  private _buildparams(
    axes: SousAxePlanRelance[] | null,
    structure: Structure | null,
    territoires: GeoModel[] | null
  ): string {
    let params =
      'sort=Structure,axe,dispositif&limit=5000&where=(Montant,gt,0)';
    if (structure) {
      params += `~and(Structure,eq,${structure.label})`;
    }

    if (axes && axes.length > 0) {
      params += `~and(sous-axe,in,${axes.map((axe) => axe.label).join(',')})`;
    }

    if (territoires && territoires.length > 0) {

      const filtre_territoire_non_commune = territoires.find(x => x.type != TypeLocalisation.COMMUNE)
      if (filtre_territoire_non_commune) {
        throw new UnsupportedNiveauLocalisation(filtre_territoire_non_commune.type!)
      }

      // on est toujours sur le même type
      params += `~and(territoire_insee,in,${territoires
        .map((t) => t.code)
        .join(',')})`;
    }

    return params;
  }
}
