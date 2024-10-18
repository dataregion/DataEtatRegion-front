/**
 * API
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { CertificationRgeHolder } from './certificationRgeHolder';
import { NumeroTvaHolder } from './numeroTvaHolder';
import { ChiffreDaffairesHolder } from './chiffreDaffairesHolder';
import { CertificationQualibat } from './certificationQualibat';
import { DonneesEtablissement } from './donneesEtablissement';


export interface InfoApiEntreprise { 
    certification_qualibat?: CertificationQualibat;
    certification_qualibat_indispo: boolean;
    certifications_rge: Array<CertificationRgeHolder>;
    certifications_rge_indispo: boolean;
    chiffre_d_affaires: Array<ChiffreDaffairesHolder>;
    chiffre_d_affaires_indispo: boolean;
    donnees_etablissement: DonneesEtablissement;
    tva?: NumeroTvaHolder;
    tva_indispo: boolean;
}

