/**
 * API Data transform
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec, HttpContext 
        }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

// @ts-ignore
import { EnrichedFlattenFinancialLinesSchema } from '../model/enrichedFlattenFinancialLinesSchema';
// @ts-ignore
import { PaginatedBudgetLines } from '../model/paginatedBudgetLines';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { budgetConfiguration }                                     from '../configuration';
import {
    BudgetServiceInterface
} from './budget.serviceInterface';



@Injectable({
  providedIn: 'root'
})
export class BudgetService implements BudgetServiceInterface {

    protected basePath = 'http://localhost/financial-data/api/v2';
    public defaultHeaders = new HttpHeaders();
    public configuration = new budgetConfiguration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string|string[], @Optional() configuration: budgetConfiguration) {
        if (configuration) {
            this.configuration = configuration;
        }
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }

            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }


    // @ts-ignore
    private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
        if (typeof value === "object" && value instanceof Date === false) {
            httpParams = this.addToHttpParamsRecursive(httpParams, value);
        } else {
            httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return httpParams;
    }

    private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
        if (value == null) {
            return httpParams;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                (value as any[]).forEach( elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            } else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, (value as Date).toISOString().substring(0, 10));
                } else {
                   throw Error("key may not be null if value is Date");
                }
            } else {
                Object.keys(value).forEach( k => httpParams = this.addToHttpParamsRecursive(
                    httpParams, value[k], key != null ? `${key}.${k}` : k));
            }
        } else if (key != null) {
            httpParams = httpParams.append(key, value);
        } else {
            throw Error("key may not be null if value is not object or array");
        }
        return httpParams;
    }

    /**
     * Recupère les lignes de données budgetaires génériques
     * @param pageNumber Numéro de la page de resultat
     * @param limit Nombre de résultat par page
     * @param nEj Le numéro EJ
     * @param source Source de la donnée
     * @param codeProgramme le code programme (BOP)
     * @param niveauGeo le niveau géographique
     * @param codeGeo Le code d\&#39;une commune (5 chiffres), le numéro de département (2 caractères), le code epci (9 chiffres), le code d\&#39;arrondissement (3 ou 4 chiffres)ou le crte (préfixé par \&#39;crte-\&#39;)
     * @param refQpv Année du référentiel du QPV
     * @param codesQpv Les codes de QPV
     * @param theme Le libelle theme (si code_programme est renseigné, le theme est ignoré).
     * @param siretBeneficiaire Code siret d\&#39;un beneficiaire.
     * @param typesBeneficiaires Types de bénéficiaire.
     * @param annee L\&#39;année comptable.
     * @param domaineFonctionnel Le(s) code(s) du domaine fonctionnel.
     * @param referentielProgrammation Le(s) code(s) du référentiel de programmation.
     * @param tags Le(s) tag(s) à inclure
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getBudgetCtrl(pageNumber?: string, limit?: string, nEj?: Array<string>, source?: string, codeProgramme?: Array<string>, niveauGeo?: string, codeGeo?: Array<string>, refQpv?: number, codesQpv?: Array<string>, theme?: Array<string>, siretBeneficiaire?: Array<string>, typesBeneficiaires?: Array<string>, annee?: Array<number>, domaineFonctionnel?: Array<string>, referentielProgrammation?: Array<string>, tags?: Array<string>, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<PaginatedBudgetLines>;
    public getBudgetCtrl(pageNumber?: string, limit?: string, nEj?: Array<string>, source?: string, codeProgramme?: Array<string>, niveauGeo?: string, codeGeo?: Array<string>, refQpv?: number, codesQpv?: Array<string>, theme?: Array<string>, siretBeneficiaire?: Array<string>, typesBeneficiaires?: Array<string>, annee?: Array<number>, domaineFonctionnel?: Array<string>, referentielProgrammation?: Array<string>, tags?: Array<string>, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<PaginatedBudgetLines>>;
    public getBudgetCtrl(pageNumber?: string, limit?: string, nEj?: Array<string>, source?: string, codeProgramme?: Array<string>, niveauGeo?: string, codeGeo?: Array<string>, refQpv?: number, codesQpv?: Array<string>, theme?: Array<string>, siretBeneficiaire?: Array<string>, typesBeneficiaires?: Array<string>, annee?: Array<number>, domaineFonctionnel?: Array<string>, referentielProgrammation?: Array<string>, tags?: Array<string>, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<PaginatedBudgetLines>>;
    public getBudgetCtrl(pageNumber?: string, limit?: string, nEj?: Array<string>, source?: string, codeProgramme?: Array<string>, niveauGeo?: string, codeGeo?: Array<string>, refQpv?: number, codesQpv?: Array<string>, theme?: Array<string>, siretBeneficiaire?: Array<string>, typesBeneficiaires?: Array<string>, annee?: Array<number>, domaineFonctionnel?: Array<string>, referentielProgrammation?: Array<string>, tags?: Array<string>, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {

        let localVarQueryParameters = new HttpParams({encoder: this.encoder});
        if (pageNumber !== undefined && pageNumber !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>pageNumber, 'page_number');
        }
        if (limit !== undefined && limit !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>limit, 'limit');
        }
        if (nEj) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...nEj].join(COLLECTION_FORMATS['csv']), 'n_ej');
        }
        if (source !== undefined && source !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>source, 'source');
        }
        if (codeProgramme) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...codeProgramme].join(COLLECTION_FORMATS['csv']), 'code_programme');
        }
        if (niveauGeo !== undefined && niveauGeo !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>niveauGeo, 'niveau_geo');
        }
        if (codeGeo) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...codeGeo].join(COLLECTION_FORMATS['csv']), 'code_geo');
        }
        if (refQpv !== undefined && refQpv !== null) {
          localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
            <any>refQpv, 'ref_qpv');
        }
        if (codesQpv) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...codesQpv].join(COLLECTION_FORMATS['csv']), 'code_qpv');
        }
        if (theme) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...theme].join(COLLECTION_FORMATS['csv']), 'theme');
        }
        if (siretBeneficiaire) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...siretBeneficiaire].join(COLLECTION_FORMATS['csv']), 'siret_beneficiaire');
        }
        if (typesBeneficiaires) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...typesBeneficiaires].join(COLLECTION_FORMATS['csv']), 'types_beneficiaires');
        }
        if (annee) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...annee].join(COLLECTION_FORMATS['csv']), 'annee');
        }
        if (domaineFonctionnel) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...domaineFonctionnel].join(COLLECTION_FORMATS['csv']), 'domaine_fonctionnel');
        }
        if (referentielProgrammation) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...referentielProgrammation].join(COLLECTION_FORMATS['csv']), 'referentiel_programmation');
        }
        if (tags) {
            localVarQueryParameters = this.addToHttpParams(localVarQueryParameters,
                [...tags].join(COLLECTION_FORMATS['csv']), 'tags');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (Bearer) required
        localVarCredential = this.configuration.lookupCredential('Bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/budget`;
        return this.httpClient.request<PaginatedBudgetLines>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                params: localVarQueryParameters,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param source 
     * @param id 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getGetBudgetCtrl(source: string, id: string, observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<EnrichedFlattenFinancialLinesSchema>;
    public getGetBudgetCtrl(source: string, id: string, observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<EnrichedFlattenFinancialLinesSchema>>;
    public getGetBudgetCtrl(source: string, id: string, observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<EnrichedFlattenFinancialLinesSchema>>;
    public getGetBudgetCtrl(source: string, id: string, observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {
        if (source === null || source === undefined) {
            throw new Error('Required parameter source was null or undefined when calling getGetBudgetCtrl.');
        }
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getGetBudgetCtrl.');
        }

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (Bearer) required
        localVarCredential = this.configuration.lookupCredential('Bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/budget/${this.configuration.encodeParam({name: "source", value: source, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}/${this.configuration.encodeParam({name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "string", dataFormat: undefined})}`;
        return this.httpClient.request<EnrichedFlattenFinancialLinesSchema>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Effectue un GET pour vérifier la disponibilité de l\&#39;API des lignes budgetaires
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getGetHealthcheck(observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any>;
    public getGetHealthcheck(observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpResponse<any>>;
    public getGetHealthcheck(observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<HttpEvent<any>>;
    public getGetHealthcheck(observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: undefined, context?: HttpContext}): Observable<any> {

        let localVarHeaders = this.defaultHeaders;

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/budget/healthcheck`;
        return this.httpClient.request<any>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getGetPlageAnnees(observe?: 'body', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<Array<number>>;
    public getGetPlageAnnees(observe?: 'response', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpResponse<Array<number>>>;
    public getGetPlageAnnees(observe?: 'events', reportProgress?: boolean, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<HttpEvent<Array<number>>>;
    public getGetPlageAnnees(observe: any = 'body', reportProgress: boolean = false, options?: {httpHeaderAccept?: 'application/json', context?: HttpContext}): Observable<any> {

        let localVarHeaders = this.defaultHeaders;

        let localVarCredential: string | undefined;
        // authentication (Bearer) required
        localVarCredential = this.configuration.lookupCredential('Bearer');
        if (localVarCredential) {
            localVarHeaders = localVarHeaders.set('Authorization', localVarCredential);
        }

        let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
        if (localVarHttpHeaderAcceptSelected === undefined) {
            // to determine the Accept header
            const httpHeaderAccepts: string[] = [
                'application/json'
            ];
            localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        }
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }

        let localVarHttpContext: HttpContext | undefined = options && options.context;
        if (localVarHttpContext === undefined) {
            localVarHttpContext = new HttpContext();
        }


        let responseType_: 'text' | 'json' | 'blob' = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            } else {
                responseType_ = 'blob';
            }
        }

        let localVarPath = `/budget/annees`;
        return this.httpClient.request<Array<number>>('get', `${this.configuration.basePath}${localVarPath}`,
            {
                context: localVarHttpContext,
                responseType: <any>responseType_,
                withCredentials: this.configuration.withCredentials,
                headers: localVarHeaders,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
