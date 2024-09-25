/**
 * API
 * API proxy de data subventions
 *
 * The version of the OpenAPI document: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { InfoApiEntreprise, InfoApiSubvention, Query } from '../model/models';

import { aeConfiguration } from '../configuration';

export interface ExternalAPIsServiceInterface {
  defaultHeaders: HttpHeaders;
  configuration: aeConfiguration;

  /**
   *
   *
   * @param siret
   */
  getInfoEntrepriseCtrl(siret: string, extraHttpRequestParams?: any): Observable<InfoApiEntreprise>;

  /**
   *
   *
   * @param siret
   */
  getInfoSubventionCtrl(siret: string, extraHttpRequestParams?: any): Observable<InfoApiSubvention>;

  /**
   *
   *
   * @param payload
   */
  postDemarcheSimplifie(payload: Query, extraHttpRequestParams?: any): Observable<{}>;
}
