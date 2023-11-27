/**
 * API Data transform
 * Api de d\'accès aux données financières de l\'état <br /><strong>C\'est une API dediée à l\'outil interne de consultation budget. utilisez pas cette API pour intégrer nos données à votre système.</strong>
 *
 * The version of the OpenAPI document: 2.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { HttpHeaders }                                       from '@angular/common/http';

import { Observable }                                        from 'rxjs';

import { EnrichedFlattenFinancialLinesSchema } from '../model/models';
import { PaginatedBudgetLines } from '../model/models';


import { budgetConfiguration }                                     from '../configuration';



export interface BudgetServiceInterface {
    defaultHeaders: HttpHeaders;
    configuration: budgetConfiguration;

    /**
     * Recupère les lignes de données budgetaires génériques
     * 
     * @param pageNumber Numéro de la page de resultat
     * @param limit Nombre de résultat par page
     * @param codeProgramme le code programme (BOP)
     * @param niveauGeo le niveau géographique
     * @param codeGeo Le code d\&#39;une commune (5 chiffres), le numéro de département (2 caractères), le code epci (9 chiffres), le code d\&#39;arrondissement (3 ou 4 chiffres)ou le crte (préfixé par \&#39;crte-\&#39;)
     * @param theme Le libelle theme (si code_programme est renseigné, le theme est ignoré).
     * @param siretBeneficiaire Code siret d\&#39;un beneficiaire.
     * @param typesBeneficiaires Types de bénéficiaire.
     * @param annee L\&#39;année comptable.
     * @param domaineFonctionnel Le(s) code(s) du domaine fonctionnel.
     * @param referentielProgrammation Le(s) code(s) du référentiel de programmation.
     * @param tags Le(s) tag(s) à inclure
     */
    getBudgetCtrl(pageNumber?: string, limit?: string, codeProgramme?: Array<string>, niveauGeo?: string, codeGeo?: Array<string>, theme?: Array<string>, siretBeneficiaire?: Array<string>, typesBeneficiaires?: Array<string>, annee?: Array<number>, domaineFonctionnel?: Array<string>, referentielProgrammation?: Array<string>, tags?: Array<string>, extraHttpRequestParams?: any): Observable<PaginatedBudgetLines>;

    /**
     * 
     * 
     * @param source 
     * @param id 
     */
    getGetBudgetCtrl(source: string, id: string, extraHttpRequestParams?: any): Observable<EnrichedFlattenFinancialLinesSchema>;

    /**
     * 
     * 
     */
    getGetPlageAnnees(extraHttpRequestParams?: any): Observable<Array<number>>;

}
