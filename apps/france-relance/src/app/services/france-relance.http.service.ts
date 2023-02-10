import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { SETTINGS } from 'apps/common-lib/src/lib/environments/settings.http.service';
import { NocoDbResponse } from 'apps/common-lib/src/public-api';
import { map, Observable } from 'rxjs';
import { SettingsService } from '../../environments/settings.service';
import { SousAxePlanRelance } from '../models/axe.models';
import { Territoire } from '../models/territoire.models';

@Injectable({
  providedIn: 'root',
})
export class FranceRelanceHttpService {
  constructor(
    private http: HttpClient,
    @Inject(SETTINGS) readonly settings: SettingsService
  ) {}

  /**
   * Récupère les Axe du plan de relance
   * @returns
   */
  public getSousAxePlanRelance(): Observable<SousAxePlanRelance[]> {
    const apiFr = this.settings.apiFranceRelance;
    const field_sous_axe = 'SousaxeDuPlanDeRelance';
    const field_axe = 'AxeDuPlanDeRelance';

    const params = `fields=${field_sous_axe},${field_axe}&limit=5000&sort=${field_axe},${field_sous_axe}`;

    return this.http
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
          }, [])
        )
      );
  }

  public searchTerritoire(search: string): Observable<Territoire[]> {
    const apiFr = this.settings.apiFranceRelance;
    const fields = 'Commune,CodeInsee';
    const where = `where=(Commune,like,${search}%)`;

    const params = `fields=${fields}&limit=5000&${where}&sort=Commune`;

    return this.http
      .get<NocoDbResponse<Territoire>>(
        `${apiFr}/LocalisationBretagne/LocalisationBretagne?${params}`
      )
      .pipe(map((response) => response.list));
  }

  public searchFranceRelance(axe: SousAxePlanRelance[]): Observable<any> {
    const apiFr = this.settings.apiFranceRelance;

    if (axe && axe.length > 0) {
    }

    const fields =
      'Structure,NuméroDeSiretSiConnu,SubventionAccordée,Synthèse,axe,sous-axe,dispositif,territoire,code_insee';
    const sort = 'Structure,axe';
    const params = `fields=${fields}&limit=5000&sort=${sort}`;

    return this.http
      .get<NocoDbResponse<any>>(`${apiFr}/Laureats/Laureats-front?${params}`)
      .pipe(map((response) => response.list));
  }
}
